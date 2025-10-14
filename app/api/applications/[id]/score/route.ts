import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { intelligentScoringService } from "@/lib/intelligent-scoring-service"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const applicationId = params.id

    console.log("[v0] Starting intelligent application scoring for ID:", applicationId)

    const { data: application, error: appError } = await supabase
      .from("applications")
      .select("*")
      .eq("id", applicationId)
      .single()

    if (appError || !application) {
      throw new Error(`Application not found: ${appError?.message}`)
    }

    const { data: ranking, error: rankingError } = await supabase
      .from("rankings")
      .select("*, ranking_criteria(*)")
      .eq("id", application.ranking_id)
      .single()

    if (rankingError || !ranking) {
      throw new Error(`Ranking not found: ${rankingError?.message}`)
    }

    const scoringResult = await intelligentScoringService.scoreApplication(application, ranking.ranking_criteria || [])

    const { error: updateError } = await supabase
      .from("applications")
      .update({
        total_score: scoringResult.total_score,
        score_percentage: scoringResult.percentage,
        score_breakdown: scoringResult.breakdown,
        status: "scored",
        scored_at: new Date().toISOString(),
      })
      .eq("id", applicationId)

    if (updateError) {
      throw new Error(`Failed to update application scores: ${updateError.message}`)
    }

    console.log("[v0] Successfully scored application with intelligent scoring service")

    return NextResponse.json({
      success: true,
      applicationId,
      totalScore: scoringResult.total_score,
      percentage: scoringResult.percentage,
      breakdown: scoringResult.breakdown,
    })
  } catch (error) {
    console.error("[v0] Intelligent scoring error:", error)
    return NextResponse.json(
      {
        error: "Internal server error during intelligent scoring",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
