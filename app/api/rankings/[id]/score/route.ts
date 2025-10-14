import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { realScoring } from "@/lib/real-scoring"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()

    // Get ranking with all necessary data
    const { data: ranking, error: rankingError } = await supabase
      .from("rankings")
      .select("*")
      .eq("id", params.id)
      .single()

    if (rankingError || !ranking) {
      return NextResponse.json({ error: "Ranking not found" }, { status: 404 })
    }

    const { data: applications, error: applicationsError } = await supabase
      .from("applications")
      .select(`
        *,
        application_files (*)
      `)
      .eq("ranking_id", params.id)
      .eq("status", "pending")

    if (applicationsError) {
      console.error("[v0] Error fetching applications:", applicationsError)
      return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 })
    }

    if (!applications || applications.length === 0) {
      return NextResponse.json({ message: "No pending applications to score" }, { status: 200 })
    }

    const criteriaWeights = ranking.criteria_weights || {}
    let scoredCount = 0
    const scoringErrors: string[] = []

    console.log(`[v0] Starting to score ${applications.length} applications with criteria:`, ranking.criteria)
    console.log(`[v0] Using weights:`, criteriaWeights)
    console.log(`[v0] Other keyword:`, ranking.other_keyword)

    // Score each application
    for (const application of applications) {
      try {
        console.log(`[v0] Scoring application for ${application.applicant_name}`)

        if (!application.resume_summary && !application.key_skills && !application.ocr_transcript) {
          console.log(`[v0] Skipping ${application.applicant_name} - no resume data available`)
          scoringErrors.push(`Skipped ${application.applicant_name}: No resume data available`)
          continue
        }

        const scoringResult = realScoring.scoreApplication(application, criteriaWeights, ranking)

        const { error: updateError } = await supabase
          .from("applications")
          .update({
            scores: scoringResult.criteriaScores,
            total_score: scoringResult.totalScore,
            status: "scored",
            scored_at: new Date().toISOString(),
            scoring_summary: `Scored using ${Object.keys(criteriaWeights).length} criteria${ranking.other_keyword ? ` (including keyword: "${ranking.other_keyword}")` : ""}`,
          })
          .eq("id", application.id)

        if (updateError) {
          console.error(`[v0] Error updating application ${application.id}:`, updateError)
          scoringErrors.push(`Failed to update ${application.applicant_name}: ${updateError.message}`)
        } else {
          scoredCount++
          console.log(`[v0] Successfully scored ${application.applicant_name}: ${scoringResult.totalScore}%`)
        }
      } catch (error) {
        console.error(`[v0] Error scoring application ${application.id}:`, error)
        scoringErrors.push(`Failed to score ${application.applicant_name}: ${error.message}`)
      }
    }

    if (scoredCount > 0) {
      console.log(`[v0] Updating rankings for all scored applications`)

      // Fetch ALL scored applications for this ranking, not just the ones we just scored
      const { data: allScoredApplications, error: fetchError } = await supabase
        .from("applications")
        .select("id, total_score, applicant_name")
        .eq("ranking_id", params.id)
        .eq("status", "scored") // Only get scored applications
        .not("total_score", "is", null)
        .order("total_score", { ascending: false })

      if (!fetchError && allScoredApplications) {
        console.log(`[v0] Found ${allScoredApplications.length} scored applications to rank`)

        // Update rank_position for all scored applications
        for (let i = 0; i < allScoredApplications.length; i++) {
          const { error: rankError } = await supabase
            .from("applications")
            .update({ rank_position: i + 1 })
            .eq("id", allScoredApplications[i].id)

          if (rankError) {
            console.error(`[v0] Error updating rank for ${allScoredApplications[i].applicant_name}:`, rankError)
          } else {
            console.log(`[v0] Updated rank for ${allScoredApplications[i].applicant_name}: ${i + 1}`)
          }
        }

        console.log(`[v0] Updated rankings for ${allScoredApplications.length} applications`)
      } else {
        console.error(`[v0] Error fetching scored applications:`, fetchError)
      }
    }

    return NextResponse.json({
      message: `Successfully scored ${scoredCount} out of ${applications.length} applications`,
      scoredCount: scoredCount,
      totalApplications: applications.length,
      errors: scoringErrors.length > 0 ? scoringErrors : undefined,
      rankingInfo: {
        criteria: ranking.criteria,
        weights: criteriaWeights,
        otherKeyword: ranking.other_keyword,
      },
    })
  } catch (error) {
    console.error("[v0] Error in scoring API:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
