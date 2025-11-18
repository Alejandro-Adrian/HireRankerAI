import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params

    const supabase = createClient()
    const { data: recordings, error } = await supabase
      .from("video_session_recordings")
      .select("*")
      .eq("session_id", sessionId)
      .order("participant_role", { ascending: false }) // host first

    if (error) {
      console.error("[v0] Error fetching recordings:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ recordings: recordings || [] })
  } catch (error: any) {
    console.error("[v0] Error in recordings endpoint:", error)
    return NextResponse.json(
      { error: "Failed to fetch recordings", details: error.message },
      { status: 500 }
    )
  }
}
