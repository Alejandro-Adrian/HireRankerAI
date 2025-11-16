import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { generateText } from "ai"
import { xai } from "@ai-sdk/xai"

const ASSEMBLY_API_KEY = "7ecd9aaf0ef84f7492ccfbdf715e0065"
const ASSEMBLY_WS_URL = "wss://streaming.assemblyai.com/v2"

export async function POST(request: NextRequest) {
  try {
    const { audioBuffer, sessionId } = await request.json()

    if (!audioBuffer || !sessionId) {
      return NextResponse.json(
        { error: "audioBuffer and sessionId required" },
        { status: 400 }
      )
    }

    console.log("[v0] Starting real-time transcription for session:", sessionId)

    // Convert base64 to buffer if needed
    let audioData: Uint8Array
    if (typeof audioBuffer === "string") {
      audioData = new Uint8Array(Buffer.from(audioBuffer, "base64"))
    } else {
      audioData = new Uint8Array(audioBuffer)
    }

    // Upload audio to AssemblyAI
    console.log("[v0] Uploading audio to AssemblyAI...")
    const uploadResponse = await fetch("https://api.assemblyai.com/v2/upload", {
      method: "POST",
      headers: {
        Authorization: ASSEMBLY_API_KEY,
      },
      body: audioData,
    })

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.statusText}`)
    }

    const uploadData = await uploadResponse.json()
    const audioUrl = uploadData.upload_url

    console.log("[v0] Audio uploaded, requesting transcription...")

    // Request transcription with streaming support
    const transcriptResponse = await fetch(
      "https://api.assemblyai.com/v2/transcript",
      {
        method: "POST",
        headers: {
          Authorization: ASSEMBLY_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          audio_url: audioUrl,
          language_code: "en",
          punctuate: true,
          format_text: true,
          speech_model: "universal-streaming-english",
        }),
      }
    )

    if (!transcriptResponse.ok) {
      throw new Error(`Transcription request failed: ${transcriptResponse.statusText}`)
    }

    const transcriptData = await transcriptResponse.json()
    const transcriptId = transcriptData.id

    console.log("[v0] Transcription request submitted, ID:", transcriptId)

    // Poll for completion
    let attempts = 0
    const maxAttempts = 120 // 4 minutes max
    let finalTranscript = ""

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const statusResponse = await fetch(
        `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
        {
          headers: { Authorization: ASSEMBLY_API_KEY },
        }
      )

      if (!statusResponse.ok) {
        throw new Error(`Status check failed: ${statusResponse.statusText}`)
      }

      const statusData = await statusResponse.json()

      console.log(
        `[v0] Transcription status: ${statusData.status}, attempt ${attempts + 1}`
      )

      if (statusData.status === "completed") {
        finalTranscript = statusData.text || ""
        console.log("[v0] Transcription completed successfully")
        break
      } else if (statusData.status === "error") {
        throw new Error(`Transcription error: ${statusData.error}`)
      }

      attempts++
    }

    if (!finalTranscript) {
      throw new Error("Transcription timeout or no text returned")
    }

    // Generate summary with Grok
    console.log("[v0] Generating summary with Grok...")
    const { text: summary } = await generateText({
      model: xai("grok-4", {
        apiKey: process.env.XAI_API_KEY,
      }),
      system:
        "You are an HR assistant. Summarize this interview transcript in 2-3 sentences focusing on key points about the candidate.",
      prompt: finalTranscript,
      maxTokens: 150,
    })

    // Update session in database
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
      }
    )

    await supabase
      .from("video_sessions")
      .update({
        transcript: finalTranscript,
        summary: summary,
        status: "completed",
      })
      .eq("id", sessionId)

    return NextResponse.json({
      success: true,
      transcript: finalTranscript,
      summary: summary,
      sessionId: sessionId,
    })
  } catch (error) {
    console.error("[v0] Transcription error:", error)
    return NextResponse.json(
      {
        error: `Transcription failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 }
    )
  }
}
