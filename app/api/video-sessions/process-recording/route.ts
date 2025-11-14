import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 })
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

    // Get session to find recording URL
    const { data: session, error: fetchError } = await supabase
      .from("video_sessions")
      .select("recording_url")
      .eq("id", sessionId)
      .single()

    if (fetchError || !session?.recording_url) {
      console.log("No recording found for session:", sessionId)
      return NextResponse.json({ success: true, message: "No recording to process" })
    }

    // Fetch the recording audio
    const audioResponse = await fetch(session.recording_url)
    if (!audioResponse.ok) {
      throw new Error("Failed to fetch recording")
    }

    const audioBuffer = await audioResponse.arrayBuffer()

    const groqApiKey = process.env.GROQ_API_KEY
    const openaiApiKey = process.env.OPENAI_API_KEY

    let transcript = ""

    if (groqApiKey) {
      const formData = new FormData()
      formData.append("file", new Blob([audioBuffer], { type: "audio/webm" }), "recording.webm")
      formData.append("model", "whisper-large-v3-turbo")

      const groqResponse = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
        },
        body: formData,
      })

      if (groqResponse.ok) {
        const data = await groqResponse.json()
        transcript = data.text
      }
    } else if (openaiApiKey) {
      const formData = new FormData()
      formData.append("file", new Blob([audioBuffer], { type: "audio/webm" }), "recording.webm")
      formData.append("model", "whisper-1")

      const openaiResponse = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiApiKey}`,
        },
        body: formData,
      })

      if (openaiResponse.ok) {
        const data = await openaiResponse.json()
        transcript = data.text
      }
    }

    let summary = ""
    if (transcript) {
      try {
        const { text: aiSummary } = await generateText({
          model: "xai/grok-4",
          prompt: `Please provide a brief summary (2-3 paragraphs) of this interview transcript. Focus on key points discussed, candidate strengths, and areas of interest:\n\n${transcript}`,
        })
        summary = aiSummary
      } catch (error) {
        console.error("Grok AI summarization error:", error)
        // Fallback to simple summary if AI fails
        summary = transcript.substring(0, 500) + "..."
      }
    }

    const { error: updateError } = await supabase
      .from("video_sessions")
      .update({
        transcript: transcript || null,
        summary: summary || null,
      })
      .eq("id", sessionId)

    if (updateError) {
      console.error("Error updating session:", updateError)
    }

    return NextResponse.json({ success: true, transcript, summary })
  } catch (error) {
    console.error("Error processing recording:", error)
    return NextResponse.json({ error: "Failed to process recording" }, { status: 500 })
  }
}
