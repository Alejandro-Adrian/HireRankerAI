import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { put } from "@vercel/blob"
import { DEEPGRAM_API_KEY } from "@/lib/constants"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioBlob = formData.get("audio") as Blob
    const sessionId = formData.get("sessionId") as string
    const participantRole = (formData.get("participantRole") as string) || "host"
    const participantName = (formData.get("participantName") as string) || "Unknown"

    console.log("[v0] Video session batch transcription started")
    console.log("[v0] SessionId:", sessionId, "AudioBlob size:", audioBlob?.size, "Role:", participantRole)

    if (!audioBlob || !sessionId) {
      return NextResponse.json({ error: "Missing audio blob or sessionId" }, { status: 400 })
    }

    console.log("[v0] Uploading audio to Vercel Blob...")
    const filename = `video-recordings/${sessionId}/${participantRole}-${Date.now()}.webm`
    const blob = await put(filename, audioBlob, {
      access: "public",
      addRandomSuffix: false,
    })

    console.log("[v0] Audio uploaded to:", blob.url)

    const arrayBuffer = await audioBlob.arrayBuffer()

    console.log("[v0] Sending to Deepgram API...")
    const response = await fetch("https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&diarize=true", {
      method: "POST",
      headers: {
        Authorization: `Token ${DEEPGRAM_API_KEY}`,
        "Content-Type": "audio/webm",
      },
      body: arrayBuffer,
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("[v0] Deepgram API failed:", response.status, error)
      throw new Error(`Deepgram API failed: ${response.status}`)
    }

    const data = await response.json()
    console.log("[v0] Deepgram response received")

    let transcript = ""
    const transcripts: string[] = []

    if (data.results?.channels?.[0]?.alternatives?.[0]?.paragraphs?.paragraphs) {
      data.results.channels[0].alternatives[0].paragraphs.paragraphs.forEach((para: any) => {
        if (para.sentences) {
          para.sentences.forEach((sentence: any) => {
            if (sentence.text) {
              transcripts.push(sentence.text)
            }
          })
        }
      })
    } else if (data.results?.channels?.[0]?.alternatives?.[0]?.transcript) {
      transcripts.push(data.results.channels[0].alternatives[0].transcript)
    }

    transcript = transcripts.join(" ")

    if (!transcript) {
      transcript = "No speech detected in the recording."
      console.warn("[v0] No transcription available")
    }

    console.log("[v0] Transcript length:", transcript.length)

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      },
    )

    // Get session_id from meeting_id
    const { data: sessionData } = await supabase
      .from("video_sessions")
      .select("id")
      .eq("meeting_id", sessionId)
      .single()

    if (!sessionData) {
      throw new Error(`Session not found for meeting_id: ${sessionId}`)
    }

    console.log("[v0] Inserting recording into database...")
    const { error: insertError } = await supabase.from("video_session_recordings").insert({
      session_id: sessionData.id,
      participant_role: participantRole,
      participant_name: participantName,
      audio_url: blob.url,
      transcript: transcript,
      status: "completed",
      duration_seconds: Math.floor(audioBlob.size / 16000),
    })

    if (insertError) {
      console.error("[v0] Database insert error:", insertError)
      throw new Error(`Database insert failed: ${insertError.message}`)
    }

    console.log('[v0] Transcription complete. Summary generation is now manual - click "Generate" button in UI.')

    const { error: updateError } = await supabase
      .from("video_sessions")
      .update({
        status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("meeting_id", sessionId)

    if (updateError) {
      console.error("[v0] Session update error:", updateError)
    }

    console.log("[v0] Video session batch transcription completed successfully")

    return NextResponse.json({
      success: true,
      message: "Transcription completed and stored",
      transcriptLength: transcript.length,
      audioUrl: blob.url,
    })
  } catch (error) {
    console.error("[v0] Video session batch transcription error:", error)
    return NextResponse.json(
      {
        error: "Transcription failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
