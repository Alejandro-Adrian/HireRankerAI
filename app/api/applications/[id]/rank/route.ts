import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { rank_position } = await request.json()

    const { error } = await supabase.from("applications").update({ rank_position }).eq("id", params.id)

    if (error) {
      console.error("Error updating rank:", error)
      return NextResponse.json({ error: "Failed to update rank" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in rank update API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
