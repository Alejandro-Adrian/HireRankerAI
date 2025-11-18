import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { put } from "@vercel/blob";

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Transcription API called");
    
    const contentType = request.headers.get("content-type");
    let sessionId: string;
    let audioFile: File | null = null;
    let useVideoSDKRecording = false;

    if (contentType?.includes("multipart/form-data")) {
      const formData = await request.formData();
      audioFile = formData.get("audio") as File;
      sessionId = formData.get("sessionId") as string;
      console.log("[v0] Received FormData - sessionId:", sessionId, "audioFile:", audioFile?.name);
    } else {
      const body = await request.json();
      sessionId = body.sessionId;
      useVideoSDKRecording = body.useVideoSDKRecording || false;
      console.log("[v0] Received JSON - sessionId:", sessionId, "useVideoSDK:", useVideoSDKRecording);
    }

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    let audioBuffer: ArrayBuffer;
    let recordingUrl: string | null = null;

    if (useVideoSDKRecording) {
      console.log("[v0] Fetching VideoSDK recording for session:", sessionId);
      
      const apiKey = process.env.VIDEOSDK_API_KEY;
      if (!apiKey) {
        return NextResponse.json(
          { error: "VideoSDK API key not configured" },
          { status: 500 }
        );
      }

      // Wait a bit for recording to be ready
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Fetch recording details
      const recordingsResponse = await fetch(
        `https://api.videosdk.live/v2/recordings/composite?roomId=${sessionId}`,
        {
          headers: {
            Authorization: apiKey,
          },
        }
      );

      if (!recordingsResponse.ok) {
        throw new Error("Failed to fetch VideoSDK recordings");
      }

      const recordingsData = await recordingsResponse.json();
      console.log("[v0] VideoSDK recordings count:", recordingsData.data?.length || 0);

      if (!recordingsData.data || recordingsData.data.length === 0) {
        throw new Error("No recordings found. Please wait a moment for processing to complete.");
      }

      // Get the most recent recording
      const recording = recordingsData.data[0];
      const fileUrl = recording.file?.fileUrl;

      if (!fileUrl) {
        throw new Error("Recording file URL not available yet. Please try again in a moment.");
      }

      console.log("[v0] Downloading recording from VideoSDK...");
      const downloadResponse = await fetch(fileUrl);
      if (!downloadResponse.ok) {
        throw new Error("Failed to download recording file");
      }

      audioBuffer = await downloadResponse.arrayBuffer();
      console.log("[v0] Downloaded recording, size:", audioBuffer.byteLength, "bytes");

      // Upload to blob storage for persistence
      const buffer = Buffer.from(audioBuffer);
      const blob = await put(`recordings/${sessionId}.mp4`, buffer, {
        access: "public",
      });
      recordingUrl = blob.url;
      console.log("[v0] Recording saved to blob:", recordingUrl);
    } else {
      if (!audioFile) {
        return NextResponse.json(
          { error: "Audio file is required when not using VideoSDK recording" },
          { status: 400 }
        );
      }

      audioBuffer = await audioFile.arrayBuffer();
      console.log("[v0] Using local audio file, size:", audioBuffer.byteLength, "bytes");
    }

    console.log("[v0] Submitting to Deepgram for transcription...");
    const deepgramUrl = "https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&diarize=true&punctuate=true&utterances=true";
    
    const deepgramResponse = await fetch(deepgramUrl, {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
        "Content-Type": useVideoSDKRecording ? "audio/mp4" : "audio/webm",
      },
      body: audioBuffer,
    });

    const deepgramData = await deepgramResponse.json();
    console.log("[v0] Deepgram response status:", deepgramResponse.status);

    if (!deepgramResponse.ok) {
      console.error("[v0] Deepgram error:", deepgramData);
      return NextResponse.json({ error: "Deepgram transcription failed", details: deepgramData }, { status: 500 });
    }

    let fullTranscript = "";
    const transcripts: string[] = [];

    if (deepgramData.results?.channels?.[0]?.alternatives?.[0]) {
      const alternative = deepgramData.results.channels[0].alternatives[0];
      
      // Check if we have speaker diarization
      if (alternative.words && alternative.words.some((w: any) => w.speaker !== undefined)) {
        console.log("[v0] Processing diarized transcript with speaker labels");
        let currentSpeaker = -1;
        let speakerText = "";
        
        for (const word of alternative.words) {
          if (word.speaker !== currentSpeaker) {
            if (speakerText) {
              fullTranscript += `Speaker ${currentSpeaker + 1}: ${speakerText.trim()}\n\n`;
            }
            currentSpeaker = word.speaker;
            speakerText = "";
          }
          speakerText += word.punctuated_word + " ";
        }
        
        // Add final speaker's text
        if (speakerText) {
          fullTranscript += `Speaker ${currentSpeaker + 1}: ${speakerText.trim()}\n`;
        }
      } else {
        // Fallback to simple transcript
        fullTranscript = alternative.transcript;
      }
      
      transcripts.push(fullTranscript);
      console.log("[v0] Transcript extracted with", alternative.words?.length || 0, "words");
    } else {
      console.warn("[v0] No transcript found in Deepgram response");
      fullTranscript = "No speech detected";
    }

    let summary = fullTranscript;
    if (fullTranscript && fullTranscript !== "No speech detected") {
      try {
        console.log("[v0] Generating summary with Grok...");
        const grokResponse = await fetch("https://api.x.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.XAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "grok-beta",
            messages: [
              {
                role: "user",
                content: `You are analyzing a recorded interview session with multiple participants. Create a comprehensive summary.

Transcript with speakers:
${fullTranscript}

Provide:
1. Key Discussion Points (bullet points)
2. Individual Contributions (what each speaker discussed)
3. Overall Assessment
4. Notable Insights or Concerns

Keep it professional and concise.`,
              },
            ],
            max_tokens: 600,
          }),
        });

        const grokData = await grokResponse.json();
        console.log("[v0] Grok response status:", grokResponse.status);

        if (grokResponse.ok && grokData.choices?.[0]?.message?.content) {
          summary = grokData.choices[0].message.content;
          console.log("[v0] Summary generated successfully");
        } else {
          console.warn("[v0] Grok failed:", grokData);
          summary = fullTranscript.substring(0, 500) + "...";
        }
      } catch (summaryErr) {
        console.warn("[v0] Summary generation error:", summaryErr);
        summary = fullTranscript.substring(0, 500) + "...";
      }
    }

    try {
      console.log("[v0] Saving to database for sessionId:", sessionId);

      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          cookies: {
            getAll: () => [],
            setAll: () => {},
          },
        }
      );

      const updatePayload: any = {
        transcript: fullTranscript,
        summary: summary,
        status: "completed",
      };

      if (recordingUrl) {
        updatePayload.recording_url = recordingUrl;
      }

      const { data: updateData, error: updateError } = await supabase
        .from("video_sessions")
        .update(updatePayload)
        .eq("meeting_id", sessionId)
        .select();

      console.log("[v0] Update response - data:", updateData, "error:", updateError);

      if (updateError) {
        console.error("[v0] Database update error:", updateError);
        return NextResponse.json({ error: "Failed to save transcription", details: updateError }, { status: 500 });
      }

      console.log("[v0] Successfully saved transcription and summary");
      return NextResponse.json({ 
        success: true, 
        transcripts, 
        summary,
        sessionId,
        recordingUrl 
      });
    } catch (dbErr) {
      console.error("[v0] Database error:", dbErr);
      return NextResponse.json({ error: "Database error", details: String(dbErr) }, { status: 500 });
    }
  } catch (error) {
    console.error("[v0] Transcription endpoint error:", error);
    return NextResponse.json({ error: "Transcription failed", details: String(error) }, { status: 500 });
  }
}
