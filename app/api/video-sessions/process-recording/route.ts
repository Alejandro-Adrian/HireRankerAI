import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

const groqApiKey = process.env.GROQ_API_KEY
const openaiApiKey = process.env.OPENAI_API_KEY || ""

export async function POST(request: NextRequest) {
  try {
    const { sessionId, recordingUrl } = await request.json()

    if (!sessionId || !recordingUrl) {
      return NextResponse.json({ error: "Missing sessionId or recordingUrl" }, { status: 400 })
    }

    // Get Supabase client
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

    // Fetch the recording audio
    const audioResponse = await fetch(recordingUrl)
    const audioBuffer = await audioResponse.arrayBuffer()

    // Convert audio to WAV format if needed
    const wavData = Buffer.from(audioBuffer)

    // Use Groq for transcription (faster and cheaper than OpenAI)
    const formData = new FormData()
    formData.append("file", new Blob([wavData], { type: "audio/wav" }), "recording.wav")
    formData.append("model", "whisper-large-v3-turbo")

    let transcript = ""

    if (groqApiKey) {
      // Use Groq for transcription
      const groqResponse = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
        },
        body: formData,
      })

      if (!groqResponse.ok) {
        console.error("Groq transcription error:", await groqResponse.text())
        return NextResponse.json({ error: "Transcription failed" }, { status: 500 })
      }

      const transcriptionData = await groqResponse.json()
      transcript = transcriptionData.text
    } else if (openaiApiKey) {
      // Fallback to OpenAI
      const openaiResponse = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiApiKey}`,
        },
        body: formData,
      })

      if (!openaiResponse.ok) {
        console.error("OpenAI transcription error:", await openaiResponse.text())
        return NextResponse.json({ error: "Transcription failed" }, { status: 500 })
      }

      const transcriptionData = await openaiResponse.json()
      transcript = transcriptionData.text
    } else {
      return NextResponse.json({ error: "No transcription service configured" }, { status: 500 })
    }

    // Generate summary using AI SDK
    const { generateText } = await import("ai")

    const { text: summary } = await generateText({
      model: "openai/gpt-4-mini",
      prompt: `Please provide a brief summary (2-3 paragraphs) of this interview transcript. Focus on key points discussed, candidate strengths, and areas of interest:\n\n${transcript}`,
    })

    // Update session with transcript and summary
    const { error: updateError } = await supabase
      .from("video_sessions")
      .update({
        transcript,
        summary,
      })
      .eq("id", sessionId)

    if (updateError) {
      console.error("Error updating session:", updateError)
      return NextResponse.json({ error: "Failed to update session" }, { status: 500 })
    }

    return NextResponse.json({ success: true, transcript, summary })
  } catch (error) {
    console.error("Error processing recording:", error)
    return NextResponse.json({ error: "Failed to process recording" }, { status: 500 })
  }
}
