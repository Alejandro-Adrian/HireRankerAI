import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { generateText } from "ai"
import { xai } from "@ai-sdk/xai"

const ASSEMBLY_API_KEY = process.env.ASSEMBLYAI_API_KEY || "7ecd9aaf0ef84f7492ccfbdf715e0065"
const ASSEMBLY_API_URL = "https://api.assemblyai.com/v2"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioBlob = formData.get("audio") as Blob
    const sessionId = formData.get("sessionId") as string

    console.log("[v0] Video session batch transcription started")
    console.log("[v0] SessionId:", sessionId, "AudioBlob size:", audioBlob?.size)

    if (!audioBlob || !sessionId) {
      return NextResponse.json(
        { error: "Missing audio blob or sessionId" },
        { status: 400 }
      )
    }

    // Convert blob to base64
    const arrayBuffer = await audioBlob.arrayBuffer()
    const base64Audio = Buffer.from(arrayBuffer).toString("base64")

    console.log("[v0] Audio blob converted to base64, length:", base64Audio.length)

    // Step 1: Submit for transcription (REST API Batch)
    console.log("[v0] Submitting to AssemblyAI REST API Batch...")
    const transcriptResponse = await fetch(`${ASSEMBLY_API_URL}/transcript`, {
      method: "POST",
      headers: {
        "Authorization": ASSEMBLY_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        audio_data: base64Audio,
        language_code: "en",
        punctuate: true,
        format_text: true,
      }),
    })

    if (!transcriptResponse.ok) {
      const error = await transcriptResponse.text()
      console.error("[v0] AssemblyAI submission failed:", transcriptResponse.status, error)
      throw new Error(`AssemblyAI submission failed: ${transcriptResponse.status}`)
    }

    const transcriptData = await transcriptResponse.json()
    const transcriptId = transcriptData.id

    console.log("[v0] Transcription job submitted with ID:", transcriptId)

    // Step 2: Poll for completion (like test page)
    let transcript = ""
    let attempts = 0
    const maxAttempts = 150

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000))

      const statusResponse = await fetch(`${ASSEMBLY_API_URL}/transcript/${transcriptId}`, {
        headers: {
          "Authorization": ASSEMBLY_API_KEY,
        },
      })

      if (!statusResponse.ok) {
        throw new Error(`Status check failed: ${statusResponse.status}`)
      }

      const statusData = await statusResponse.json()
      console.log(`[v0] Polling attempt ${attempts + 1}/${maxAttempts}: ${statusData.status}`)

      if (statusData.status === "completed") {
        transcript = statusData.text || ""
        console.log("[v0] Transcription completed, length:", transcript.length)
        break
      } else if (statusData.status === "error") {
        throw new Error(`Transcription error: ${statusData.error}`)
      }

      attempts++
    }

    if (!transcript) {
      console.warn("[v0] No transcription available")
    }

    // Step 3: Generate summary with Grok
    let summary = ""
    if (transcript.trim().length > 0) {
      try {
        console.log("[v0] Generating summary with Grok...")
        const { text: aiSummary } = await generateText({
          model: xai("grok-4", {
            apiKey: process.env.XAI_API_KEY,
          }),
          prompt: `Please provide a concise summary (2-3 paragraphs) of this video call transcript:\n\n${transcript}`,
          temperature: 0.7,
          maxTokens: 300,
        })
        summary = aiSummary
        console.log("[v0] Summary generated, length:", summary.length)
      } catch (error) {
        console.error("[v0] Summary generation error:", error)
        summary = transcript.substring(0, 500) + (transcript.length > 500 ? "..." : "")
      }
    } else {
      summary = "No speech detected in the recording."
    }

    // Step 4: Update database with results
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

    console.log("[v0] Updating database with transcript and summary...")
    const { error: updateError } = await supabase
      .from("video_sessions")
      .update({
        transcript: transcript || "No transcription available",
        summary: summary || "No summary available",
        updated_at: new Date().toISOString(),
      })
      .eq("meeting_id", sessionId)

    if (updateError) {
      console.error("[v0] Database update error:", updateError)
      throw new Error(`Database update failed: ${updateError.message}`)
    }

    console.log("[v0] Video session batch transcription completed successfully")

    return NextResponse.json({
      success: true,
      message: "Transcription completed and stored",
      transcriptLength: transcript.length,
      summaryLength: summary.length,
    })
  } catch (error) {
    console.error("[v0] Video session batch transcription error:", error)
    return NextResponse.json(
      {
        error: "Transcription failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
