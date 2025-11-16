import { generateText } from "ai"
import { xai } from "@ai-sdk/xai"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

interface Message {
  role: "user" | "assistant"
  content: string
}

export async function POST(request: NextRequest) {
  try {
    const { message, history = [] } = await request.json()

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Get Supabase client for database context
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

    // Fetch system context from database
    let systemContext = ""
    try {
      // Get rankings
      const { data: rankings } = await supabase
        .from("rankings")
        .select("id, title, position, description, applications_count")
        .limit(5)

      // Get applications
      const { data: applications } = await supabase
        .from("applications")
        .select("id, candidate_name, position, status, score")
        .limit(10)

      // Get video sessions
      const { data: sessions } = await supabase
        .from("video_sessions")
        .select("id, title, status, created_at")
        .limit(5)

      systemContext = `You are a helpful HR assistant for HireRankerAI. Answer concisely in 1-2 sentences max.

AVAILABLE RANKINGS:
${rankings?.map((r: any) => `- ${r.title} (Position: ${r.position}, Applications: ${r.applications_count})`).join("\n") || "No rankings yet"}

RECENT APPLICATIONS:
${applications?.map((a: any) => `- ${a.candidate_name} for ${a.position} (Score: ${a.score}, Status: ${a.status})`).join("\n") || "No applications yet"}

RECENT VIDEO SESSIONS:
${sessions?.map((s: any) => `- ${s.title} (Status: ${s.status})`).join("\n") || "No sessions yet"}

Help with recruitment, applications, and interviews. Keep responses brief and direct.`
    } catch (dbError) {
      console.warn("[v0] Error fetching database context:", dbError)
      systemContext = "You are a helpful HR assistant. Answer concisely in 1-2 sentences. Help with recruitment and interviews."
    }

    // Prepare messages for Grok
    const messages: Message[] = [
      ...history,
      { role: "user" as const, content: message },
    ]

    // Call Grok AI
    const { text: response } = await generateText({
      model: xai("grok-4", {
        apiKey: process.env.XAI_API_KEY,
      }),
      system: systemContext,
      messages,
      temperature: 0.7,
      maxTokens: 150, // Reduced from 500 for concise answers
    })

    return NextResponse.json({
      success: true,
      response: response.slice(0, 150), // Truncate to 150 chars
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Grok chat error:", error)
    return NextResponse.json(
      { error: `Chat failed: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    )
  }
}
