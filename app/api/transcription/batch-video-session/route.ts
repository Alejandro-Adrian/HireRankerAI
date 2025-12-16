import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

/**
 * REST API Batch Transcription for Video Sessions
 *
 * This route handles batch transcription of complete audio recordings
 * using the AssemblyAI REST API (batch processing).
 *
 * Process:
 * 1. Receive complete audio file (sent after recording stops)
 * 2. Upload to AssemblyAI
 * 3. Poll for transcription completion
 * 4. Store results in database
 *
 * Advantages over streaming:
 * - No need to keep connection open during processing
 * - Better for large files (post-call processing)
 * - Simpler error handling and retries
 * - Cost-effective for batch processing
 */

const ASSEMBLY_API_KEY = process.env.ASSEMBLYAI_API_KEY || "7ecd9aaf0ef84f7492ccfbdf715e0065"
const ASSEMBLY_API_URL = "https://api.assemblyai.com/v2"

async function transcribeWithAssemblyAI(audioUrl: string, sessionId: string): Promise<string> {
  try {
    console.log("[v0] Starting REST API batch transcription for session:", sessionId)

    // Step 1: Request transcription with REST API
    console.log("[v0] Submitting transcription request to AssemblyAI...")
    const transcriptResponse = await fetch(`${ASSEMBLY_API_URL}/transcript`, {
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
        speaker_labels: true, // Useful for interviews
      }),
    })

    if (!transcriptResponse.ok) {
      throw new Error(`Transcription request failed: ${transcriptResponse.status}`)
    }

    const transcriptData = await transcriptResponse.json()
    const transcriptId = transcriptData.id

    console.log("[v0] Transcription submitted, ID:", transcriptId)

    // Step 2: Poll for completion (REST API batch polling)
    let attempts = 0
    const maxAttempts = 150 // ~5 minutes with 2-second intervals
    let finalTranscript = ""

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const statusResponse = await fetch(`${ASSEMBLY_API_URL}/transcript/${transcriptId}`, {
        headers: {
          Authorization: ASSEMBLY_API_KEY,
        },
      })

      if (!statusResponse.ok) {
        throw new Error(`Status check failed: ${statusResponse.status}`)
      }

      const statusData = await statusResponse.json()

      if (statusData.status === "completed") {
        finalTranscript = statusData.text || ""
        console.log("[v0] ✅ REST API batch transcription completed successfully")
        console.log("[v0] Transcript length:", finalTranscript.length, "characters")
        break
      } else if (statusData.status === "error") {
        throw new Error(`Transcription error: ${statusData.error}`)
      }

      attempts++
      if (attempts % 10 === 0) {
        console.log(`[v0] Polling transcription status... attempt ${attempts}/${maxAttempts}`)
      }
    }

    if (!finalTranscript) {
      throw new Error("Transcription timeout - exceeded maximum polling attempts")
    }

    return finalTranscript
  } catch (error) {
    console.error("[v0] AssemblyAI REST API transcription error:", error)
    throw error
  }
}

/**
 * POST /api/transcription/batch-video-session
 *
 * Request body:
 * {
 *   "sessionId": "session-uuid",
 *   "meetingId": "meeting-123",
 *   "audioUrl": "https://storage.example.com/recording.webm"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { sessionId, meetingId, audioUrl } = await request.json()

    if (!audioUrl) {
      return NextResponse.json({ error: "Missing audioUrl" }, { status: 400 })
    }

    if (!sessionId && !meetingId) {
      return NextResponse.json({ error: "Missing sessionId or meetingId" }, { status: 400 })
    }

    console.log("[v0] 🎬 Starting batch video session transcription")
    console.log("[v0] Session:", sessionId || meetingId)
    console.log("[v0] Audio URL:", audioUrl.substring(0, 50) + "...")

    // Transcribe with AssemblyAI REST API (batch)
    const transcript = await transcribeWithAssemblyAI(audioUrl, sessionId || meetingId)

    console.log("[v0] Transcription complete. Summary generation is now manual - click 'Generate' button in UI.")

    // Update database
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

    const updateData: any = {
      transcript: transcript || "",
      status: "completed",
      updated_at: new Date().toISOString(),
    }

    let query = supabase.from("video_sessions").update(updateData)

    if (sessionId) {
      query = query.eq("id", sessionId)
    } else {
      query = query.eq("meeting_id", meetingId)
    }

    const { error: updateError } = await query

    if (updateError) {
      console.error("[v0] Error updating session:", updateError)
      return NextResponse.json({ error: "Failed to store transcription results" }, { status: 500 })
    }

    console.log("[v0] ✅ Session updated with transcript")

    return NextResponse.json({
      success: true,
      message: "Batch transcription completed successfully. Use 'Generate' button to create summary.",
      transcriptLength: transcript.length,
    })
  } catch (error) {
    console.error("[v0] Batch transcription error:", error)
    return NextResponse.json(
      {
        error: `Batch transcription failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
