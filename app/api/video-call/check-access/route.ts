import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { meetingId, token } = await request.json()

    if (!meetingId) {
      return NextResponse.json({ error: "Meeting ID is required" }, { status: 400 })
    }

    const supabase = createClient()

    const { data: session, error: sessionError } = await supabase
      .from("video_sessions")
      .select("id")
      .eq("meeting_id", meetingId)
      .single()

    if (sessionError || !session) {
      console.log("[v0] Session not found for meetingId:", meetingId)
      return NextResponse.json({ allowed: false, error: "Meeting not found" })
    }

    if (token) {
      const { data: participant, error: participantError } = await supabase
        .from("video_session_participants")
        .select("id")
        .eq("access_token", token)
        .eq("session_id", session.id)
        .single()

      if (participantError || !participant) {
        console.log("[v0] Invalid token for session:", meetingId)
        return NextResponse.json({ allowed: false, error: "Invalid meeting access token" })
      }

      // Update joined_at timestamp
      await supabase
        .from("video_session_participants")
        .update({ joined_at: new Date().toISOString() })
        .eq("access_token", token)
        .catch((err) => console.error("[v0] Error updating joined_at:", err))

      console.log("[v0] ✅ Participant access granted with token")
      return NextResponse.json({ allowed: true, participantId: participant.id })
    }

    // Host/creator access - anyone with the meeting link can join (for backward compatibility)
    console.log("[v0] ✅ Host access granted without token")
    return NextResponse.json({ allowed: true })
  } catch (error) {
    console.error("Error checking video call access:", error)
    return NextResponse.json({ allowed: false, error: "Access check failed" }, { status: 500 })
  }
}
