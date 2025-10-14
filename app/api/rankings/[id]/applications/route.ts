import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    // Verify ranking exists
    const { data: ranking, error: rankingError } = await supabase
      .from("rankings")
      .select("id")
      .eq("id", params.id)
      .single()

    if (rankingError || !ranking) {
      return NextResponse.json({ error: "Ranking not found" }, { status: 404 })
    }

    // Fetch applications with files
    const { data: applications, error } = await supabase
      .from("applications")
      .select(`
        *,
        application_files (*)
      `)
      .eq("ranking_id", params.id)
      .order("rank_position", { ascending: true, nullsFirst: false })
      .order("total_score", { ascending: false, nullsFirst: false })
      .order("submitted_at", { ascending: false })

    if (error) {
      console.error("Error fetching applications:", error)
      return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 })
    }

    return NextResponse.json(applications || [])
  } catch (error) {
    console.error("Error in applications API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
