import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()

    const { error } = await supabase.from("video_sessions").delete().eq("id", params.id)

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to delete session" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting session:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { id } = params

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

    let query = supabase.from("video_sessions").select("*")

    if (isUUID) {
      // Query by database ID
      query = query.eq("id", id)
    } else {
      // Query by meeting ID
      query = query.eq("meeting_id", id)
    }

    const { data: session, error } = await query.single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    return NextResponse.json(session)
  } catch (error) {
    console.error("Error fetching session:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { id } = params
    const body = await request.json()

    const { status, ended_at, duration_seconds, transcript, summary, recording_url } = body

    const updateData: any = {}
    if (status) updateData.status = status
    if (ended_at) updateData.ended_at = ended_at
    if (duration_seconds !== undefined) updateData.duration_seconds = duration_seconds
    if (transcript) updateData.transcript = transcript
    if (summary) updateData.summary = summary
    if (recording_url) updateData.recording_url = recording_url

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 })
    }

    updateData.updated_at = new Date().toISOString()

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    
    let query = supabase
      .from("video_sessions")
      .update(updateData)
    
    if (isUUID) {
      query = query.eq("id", id)
    } else {
      query = query.eq("meeting_id", id)
    }

    const { data, error } = await query.select().single()

    if (error) {
      console.error("[v0] Database error on PATCH:", error, "for id:", id)
      return NextResponse.json({ error: "Failed to update session", details: error.message }, { status: 500 })
    }

    console.log("[v0] Session patched successfully:", id, "with data:", Object.keys(updateData))

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error updating session:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
