import { directScoringService } from "@/lib/direct-scoring-service"
import { createClient } from "@/lib/supabase/server"

export const scoringService = {
  async scoreAllApplicationsForRanking(rankingId: string) {
    const supabase = createClient()

    const { data: applications, error } = await supabase
      .from("applications")
      .select("*")
      .eq("ranking_id", rankingId)
      .eq("status", "pending")

    if (error) throw error

    let scoredCount = 0

    // Score each application
    for (const application of applications || []) {
      try {
        const result = await directScoringService.scoreApplication(application.id)
        if (result) {
          scoredCount++
        }
      } catch (error) {
        console.error(`Failed to score application ${application.id}:`, error)
      }
    }

    return { scoredCount, totalApplications: applications?.length || 0 }
  },
}
