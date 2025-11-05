import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { meetingId } = await request.json()

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
      return NextResponse.json({ allowed: false, error: "Meeting not found" })
    }

    // Anyone with the meeting link can join
    return NextResponse.json({ allowed: true })
  } catch (error) {
    console.error("Error checking video call access:", error)
    return NextResponse.json({ allowed: false, error: "Access check failed" }, { status: 500 })
  }
}
