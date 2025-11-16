import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Transcription API called");
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;
    const sessionId = formData.get("sessionId") as string;

    console.log("[v0] Received - sessionId:", sessionId, "audioFile:", audioFile?.name, "size:", audioFile?.size);

    if (!audioFile || !sessionId) {
      console.error("[v0] Missing audio file or sessionId");
      return NextResponse.json({ error: "Missing audio file or sessionId" }, { status: 400 });
    }

    const buffer = await audioFile.arrayBuffer();
    const base64Audio = Buffer.from(buffer).toString("base64");
    console.log("[v0] Audio converted to base64, length:", base64Audio.length);

    console.log("[v0] Submitting to Deepgram...");
    const deepgramUrl = "https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true";
    
    const deepgramResponse = await fetch(deepgramUrl, {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
        "Content-Type": "application/webm",
      },
      body: buffer,
    });

    const deepgramData = await deepgramResponse.json();
    console.log("[v0] Deepgram response status:", deepgramResponse.status);

    if (!deepgramResponse.ok) {
      console.error("[v0] Deepgram error:", deepgramData);
      return NextResponse.json({ error: "Deepgram transcription failed", details: deepgramData }, { status: 500 });
    }

    let fullTranscript = "";
    const transcripts: string[] = [];

    if (deepgramData.results?.channels?.[0]?.alternatives?.[0]?.transcript) {
      fullTranscript = deepgramData.results.channels[0].alternatives[0].transcript;
      transcripts.push(fullTranscript);
      console.log("[v0] Transcript extracted:", fullTranscript.substring(0, 100));
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
            model: "grok-4",
            messages: [
              {
                role: "user",
                content: `Provide a brief 2-3 sentence summary of this meeting transcript:\n\n${fullTranscript}`,
              },
            ],
            max_tokens: 200,
          }),
        });

        const grokData = await grokResponse.json();
        console.log("[v0] Grok response status:", grokResponse.status);

        if (grokResponse.ok && grokData.choices?.[0]?.message?.content) {
          summary = grokData.choices[0].message.content;
          console.log("[v0] Summary generated successfully");
        } else {
          console.warn("[v0] Grok failed:", grokData);
          summary = fullTranscript.substring(0, 300) + "...";
        }
      } catch (summaryErr) {
        console.warn("[v0] Summary generation error:", summaryErr);
        summary = fullTranscript.substring(0, 300) + "...";
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

      // Update video_sessions with transcript and summary
      const { data: updateData, error: updateError } = await supabase
        .from("video_sessions")
        .update({
          transcript: fullTranscript,
          summary: summary,
          status: "completed",
        })
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
        sessionId 
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
