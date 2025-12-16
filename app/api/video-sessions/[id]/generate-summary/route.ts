import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const generationInProgress = new Map<string, Promise<any>>()

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (generationInProgress.has(id)) {
      console.log("[v0] Summary generation already in progress for session:", id)
      return NextResponse.json({ error: "Summary generation already in progress. Please wait." }, { status: 409 })
    }

    const generationPromise = generateSummaryInternal(id)
    generationInProgress.set(id, generationPromise)

    try {
      const result = await generationPromise
      return result
    } finally {
      generationInProgress.delete(id)
    }
  } catch (error) {
    console.error("[v0] Error in summary generation wrapper:", error)
    return NextResponse.json(
      { error: "Failed to generate summary", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

async function generateSummaryInternal(id: string) {
  try {
    const supabase = createClient()

    console.log("[v0] Starting summary generation for session:", id)

    const groqApiKey = process.env.GROQ_API_KEY
    if (!groqApiKey) {
      console.error("[v0] GROQ_API_KEY not configured")
      return NextResponse.json(
        { error: "AI service not configured. Please add GROQ_API_KEY to environment variables." },
        { status: 500 },
      )
    }

    const maxRetries = 3
    let retryCount = 0
    let retryDelay = 2000

    const { data: sessionData, error: sessionError } = await supabase
      .from("video_sessions")
      .select("summary")
      .eq("id", id)
      .single()

    if (sessionError) {
      console.error("[v0] Error fetching session:", sessionError)
      return NextResponse.json({ error: "Session not found", details: sessionError.message }, { status: 404 })
    }

    const existingSummary = sessionData?.summary

    const { data: recordings, error: recordingsError } = await supabase
      .from("video_session_recordings")
      .select("*")
      .eq("session_id", id)
      .order("created_at", { ascending: true })

    if (recordingsError) {
      console.error("[v0] Error fetching recordings:", recordingsError)
      return NextResponse.json({ error: "Failed to fetch recordings" }, { status: 500 })
    }

    console.log(`[v0] Found ${recordings?.length || 0} recordings`)

    if (!recordings || recordings.length === 0) {
      return NextResponse.json({ error: "No recordings found for this session" }, { status: 404 })
    }

    const conversationText = recordings
      .filter((r) => r.transcript && r.transcript.trim())
      .map((r) => {
        const speaker = r.participant_role === "host" ? "Host" : r.participant_name || "Participant"
        return `${speaker}: ${r.transcript}`
      })
      .join("\n\n")

    console.log("[v0] Combined conversation text length:", conversationText.length)

    if (!conversationText) {
      console.error("[v0] No transcripts available to summarize")
      return NextResponse.json({ error: "No transcripts available to summarize" }, { status: 400 })
    }

    const prompt = existingSummary
      ? `You are an AI assistant that updates meeting summaries as new information becomes available.

You previously created this summary:
${existingSummary}

Now, a new participant has completed their recording. Here is the COMPLETE conversation including all participants:
${conversationText}

Please provide an UPDATED summary that incorporates all available information. Include:
1. **Main Topics Discussed**: All key subjects covered
2. **Key Points**: Important insights from all participants
3. **Action Items**: Any tasks or follow-ups mentioned
4. **Overall Assessment**: Brief evaluation of the full conversation

Keep the summary concise but comprehensive (3-5 paragraphs).`
      : `You are an AI assistant that summarizes interview and meeting conversations. 

Please analyze the following conversation transcript and provide a comprehensive summary that includes:

1. **Main Topics Discussed**: Key subjects and themes covered
2. **Key Points**: Important information, decisions, or insights shared
3. **Action Items**: Any tasks, follow-ups, or next steps mentioned
4. **Overall Assessment**: Brief evaluation of the conversation

Keep the summary concise but informative (3-5 paragraphs).

Conversation Transcript:
${conversationText}`

    console.log(`[v0] ${existingSummary ? "Updating existing" : "Creating new"} summary for session:`, id)
    console.log("[v0] Conversation length:", conversationText.length, "characters")

    let summary: string | null = null
    let lastError: any = null

    while (retryCount < maxRetries && !summary) {
      try {
        console.log(`[v0] Attempting to generate summary with Groq (attempt ${retryCount + 1}/${maxRetries})...`)

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${groqApiKey}`,
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              {
                role: "user",
                content: prompt,
              },
            ],
            max_tokens: 1500,
            temperature: 0.6,
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Groq API error: ${response.status} - ${errorText}`)
        }

        const data = await response.json()
        summary = data.choices?.[0]?.message?.content

        if (!summary) {
          throw new Error("No summary returned from Groq API")
        }

        console.log("[v0] ✅ Summary generated successfully with Groq!")
        break
      } catch (error: any) {
        lastError = error
        const errorMessage = error?.message || String(error)

        if (
          errorMessage.includes("429") ||
          errorMessage.includes("Too Many Requests") ||
          errorMessage.includes("rate limit")
        ) {
          retryCount++
          if (retryCount < maxRetries) {
            console.log(
              `[v0] ⚠️ Rate limit hit, waiting ${retryDelay / 1000}s before retry (attempt ${retryCount}/${maxRetries})`,
            )
            await new Promise((resolve) => setTimeout(resolve, retryDelay))
            retryDelay *= 2
            continue
          } else {
            console.error("[v0] ❌ Max retries reached for rate limiting")
            return NextResponse.json(
              {
                error: "AI service is currently busy. Please try again in a few seconds.",
                retryAfter: 10,
              },
              { status: 429 },
            )
          }
        } else {
          console.error("[v0] ❌ Non-rate-limit error:", errorMessage)
          throw error
        }
      }
    }

    if (!summary) {
      throw lastError || new Error("Failed to generate summary")
    }

    console.log("[v0] Summary generated successfully, length:", summary.length)
    console.log("[v0] Summary preview:", summary.substring(0, 200) + "...")

    const { error: updateError } = await supabase
      .from("video_sessions")
      .update({
        summary,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (updateError) {
      console.error("[v0] Error updating session with summary:", updateError)
      return NextResponse.json({ error: "Failed to save summary" }, { status: 500 })
    }

    console.log("[v0] Summary saved to database successfully")

    return NextResponse.json({
      success: true,
      summary,
      isUpdate: !!existingSummary,
      recordingsCount: recordings.length,
    })
  } catch (error) {
    console.error("[v0] Error generating summary:", error)
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack")
    return NextResponse.json(
      { error: "Failed to generate summary", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
