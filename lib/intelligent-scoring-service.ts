import { directScoringService } from "@/lib/direct-scoring-service"

export const intelligentScoringService = {
  async scoreApplication(application: any, criteria: any[] = []) {
    // Use the direct scoring service as the intelligent scoring implementation
    const result = await directScoringService.scoreApplication(application.id)

    if (!result) {
      throw new Error("Failed to score application")
    }

    return {
      total_score: result.total_score,
      percentage: result.percentage,
      breakdown: result.score_breakdown,
    }
  },
}
