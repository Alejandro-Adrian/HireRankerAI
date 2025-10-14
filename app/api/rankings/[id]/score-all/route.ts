import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { scoringService } from "@/lib/scoring-service"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const rankingId = params.id

    console.log("[v0] Starting batch scoring for ranking ID:", rankingId)

    const { data: ranking, error: rankingError } = await supabase
      .from("rankings")
      .select("*")
      .eq("id", rankingId)
      .single()

    if (rankingError || !ranking) {
      console.error("[v0] Ranking not found:", rankingError)
      return NextResponse.json({ error: "Ranking not found" }, { status: 404 })
    }

    console.log("[v0] Found ranking:", ranking.title)

    await scoringService.scoreAllApplicationsForRanking(rankingId)

    // Get updated application counts
    const { data: scoredApps, error: countError } = await supabase
      .from("applications")
      .select("id, applicant_name, total_score")
      .eq("ranking_id", rankingId)
      .eq("status", "scored")
      .not("total_score", "is", null)
      .order("total_score", { ascending: false })

    if (countError) {
      console.error("[v0] Error fetching scored applications:", countError)
      return NextResponse.json({ error: "Error fetching results" }, { status: 500 })
    }

    console.log("[v0] Batch scoring completed. Scored", scoredApps?.length || 0, "applications")

    return NextResponse.json({
      success: true,
      rankingId,
      scoredCount: scoredApps?.length || 0,
      applications: scoredApps || [],
      message: `Successfully scored ${scoredApps?.length || 0} applications`,
    })
  } catch (error) {
    console.error("[v0] Batch scoring error:", error)
    return NextResponse.json(
      {
        error: "Internal server error during batch scoring",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
