import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { meeting_id, role } = await request.json()

    if (!meeting_id) {
      return NextResponse.json({ error: "Missing meeting_id" }, { status: 400 })
    }

    const supabase = createClient()

    // Check if session already exists
    const { data: existingSession, error: fetchError } = await supabase
      .from("video_sessions")
      .select("id")
      .eq("meeting_id", meeting_id)
      .single()

    if (existingSession && !fetchError) {
      console.log("[v0] Session already exists:", meeting_id)
      return NextResponse.json({ success: true, session_id: existingSession.id })
    }

    const meetingUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/video-call/${meeting_id}`

    const { data: newSession, error: insertError } = await supabase
      .from("video_sessions")
      .insert({
        meeting_id,
        title: `Interview Session - ${meeting_id}`,
        meeting_url: meetingUrl,
        status: "active",
        participants_count: 0,
      })
      .select("id")
      .single()

    if (insertError) {
      console.error("[v0] Error creating session:", insertError)
      return NextResponse.json({ error: "Failed to create session" }, { status: 500 })
    }

    console.log("[v0] Session created:", newSession.id)
    return NextResponse.json({ success: true, session_id: newSession.id })
  } catch (error) {
    console.error("[v0] Error in ensure-session:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
