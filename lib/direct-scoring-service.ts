import { createClient } from "@/lib/supabase/server"
import {
  POSITION_SKILLS_REFERENCE,
  SCORING_WEIGHTS,
  POSITION_SCORING_MULTIPLIERS,
  SkillMatcher,
} from "./position-skills-reference"

interface ScoringResult {
  criterion: string
  score: number
  maxScore: number
  reasoning: string
  keywords: string[]
}

interface ApplicationData {
  applicant_name: string
  applicant_email: string
  key_skills: string
  experience_years: number
  education_level: string
  resume_summary: string
  ocr_transcript: string
}

export class DirectScoringService {
  private getSupabaseClient() {
    return createClient()
  }

  async scoreApplication(applicationId: string): Promise<boolean> {
    try {
      console.log("[v0] DirectScoringService: Starting weighted scoring for application", applicationId)

      const supabase = this.getSupabaseClient()

      // Get application with ranking data
      const { data: application, error: appError } = await supabase
        .from("applications")
        .select(`
          *,
          rankings (
            position,
            criteria
          )
        `)
        .eq("id", applicationId)
        .single()

      if (appError || !application) {
        console.error("[v0] DirectScoringService: Error fetching application:", appError)
        return false
      }

      const position = application.rankings?.position || "kitchen-helper"
      const resumeText = (application.ocr_transcript || application.resume_summary || "").toLowerCase()
      const positionRef = POSITION_SKILLS_REFERENCE[position]
      const multipliers = POSITION_SCORING_MULTIPLIERS[position] || POSITION_SCORING_MULTIPLIERS["kitchen-helper"]

      console.log("[v0] DirectScoringService: Scoring position:", position)
      console.log("[v0] DirectScoringService: Resume text length:", resumeText.length)

      if (!positionRef) {
        console.error("[v0] DirectScoringService: No reference found for position:", position)
        return false
      }

      const results: ScoringResult[] = []

      const requiredSkills = SkillMatcher.matchSkills(resumeText, positionRef.skills.required)
      const preferredSkills = SkillMatcher.matchSkills(resumeText, positionRef.skills.preferred)
      const bonusSkills = SkillMatcher.matchSkills(resumeText, positionRef.skills.bonus)

      const baseSkillScore = 50 // Reduced from 55 to 50 for more moderate base scoring
      const skillScore = Math.round(
        baseSkillScore +
          ((requiredSkills.score * SCORING_WEIGHTS.skills.required +
            preferredSkills.score * SCORING_WEIGHTS.skills.preferred +
            bonusSkills.score * SCORING_WEIGHTS.skills.bonus) /
            3) *
            0.45 * // Reduced from 0.6 to 0.45 for less harsh scaling
            multipliers.skills,
      )

      const allSkillMatches = [...requiredSkills.matches, ...preferredSkills.matches, ...bonusSkills.matches]

      results.push({
        criterion: "skill",
        score: Math.min(100, skillScore),
        maxScore: 100,
        reasoning: `Found ${allSkillMatches.length} relevant skills: ${requiredSkills.matches.length} required, ${preferredSkills.matches.length} preferred, ${bonusSkills.matches.length} bonus`,
        keywords: allSkillMatches,
      })

      const experienceMatch = SkillMatcher.matchExperience(resumeText, position)
      let experienceScore = Math.max(40, experienceMatch.score * 100) // Reduced minimum from 45 to 40 points

      // Apply experience level weights with more generous scaling
      const experienceYears = application.experience_years || 0
      let yearMultiplier = 1.0
      if (experienceYears >= 10)
        yearMultiplier = 1.3 // Increased from 1.2 to 1.3
      else if (experienceYears >= 5)
        yearMultiplier = 1.15 // Increased from 1.1 to 1.15
      else if (experienceYears >= 3)
        yearMultiplier = 1.05 // Increased from 1.0 to 1.05
      else if (experienceYears >= 1)
        yearMultiplier = 0.95 // Increased from 0.9 to 0.95
      else yearMultiplier = 0.85 // Increased from 0.8 to 0.85 - less harsh for entry level

      experienceScore = Math.round(experienceScore * yearMultiplier * multipliers.experience)

      results.push({
        criterion: "experience",
        score: Math.min(100, experienceScore),
        maxScore: 100,
        reasoning: `${experienceYears} years experience with ${experienceMatch.matchedKeywords.length} relevant indicators`,
        keywords: experienceMatch.matchedKeywords,
      })

      const educationText = application.education_level || ""
      let educationScore = 50 // Reduced base education score from 60 to 50
      let educationLevel = "basic"
      let educationKeywords: string[] = []

      // Check for education levels with weighted scoring
      for (const [level, weight] of Object.entries(SCORING_WEIGHTS.education)) {
        if (resumeText.includes(level) || educationText.toLowerCase().includes(level)) {
          if (weight > educationScore - 50) {
            educationScore = 50 + weight // Base + bonus
            educationLevel = level
            educationKeywords = [level]
          }
        }
      }

      // Check for relevant education fields
      const relevantEducation = positionRef.education.preferred.filter(
        (field) =>
          resumeText.includes(field.toLowerCase()) || educationText.toLowerCase().includes(field.toLowerCase()),
      )

      if (relevantEducation.length > 0) {
        educationScore += relevantEducation.length * 20 // More generous bonus
        educationKeywords.push(...relevantEducation)
      }

      educationScore = Math.round(educationScore * multipliers.education)

      results.push({
        criterion: "education",
        score: Math.min(100, educationScore),
        maxScore: 100,
        reasoning:
          educationLevel !== "basic"
            ? `${educationLevel} education${relevantEducation.length > 0 ? ` in relevant field (${relevantEducation.join(", ")})` : ""}`
            : "Basic education level detected",
        keywords: educationKeywords,
      })

      const trainingKeywords = [
        ...positionRef.training.certifications,
        ...positionRef.training.courses,
        ...positionRef.training.workshops,
      ]

      const trainingMatches = trainingKeywords.filter((training) => resumeText.includes(training.toLowerCase()))

      let trainingScore = 50 // Reduced base certification score from 55 to 50

      trainingMatches.forEach((training) => {
        // Apply certification weights with more generous scaling
        for (const [level, weight] of Object.entries(SCORING_WEIGHTS.certifications)) {
          if (training.toLowerCase().includes(level)) {
            trainingScore += weight * 0.3 // More generous scaling
            break
          }
        }
      })

      trainingScore = Math.round(trainingScore * multipliers.certifications)

      results.push({
        criterion: "certification",
        score: Math.min(100, trainingScore),
        maxScore: 100,
        reasoning:
          trainingMatches.length > 0
            ? `Found ${trainingMatches.length} relevant certifications/training`
            : "Basic qualification level",
        keywords: trainingMatches,
      })

      const personalityMatch = SkillMatcher.matchPersonality(resumeText, position)
      const personalityScore = Math.max(50, Math.round(personalityMatch.score * 100)) // Reduced minimum from 60 to 50 points

      results.push({
        criterion: "personality",
        score: Math.min(100, personalityScore),
        maxScore: 100,
        reasoning:
          personalityMatch.matchedTraits.length > 0
            ? `Found ${personalityMatch.matchedTraits.length} relevant personality traits`
            : "Professional presentation detected",
        keywords: personalityMatch.matchedTraits,
      })

      const totalCriteria = results.length
      const criteriaWithGoodScores = results.filter((r) => r.score >= 60).length
      const criteriaWithExcellentScores = results.filter((r) => r.score >= 80).length

      // Calculate base weighted total score
      let totalScore = Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)

      // Apply multi-criteria bonuses
      let bonusPoints = 0
      const bonusReasons: string[] = []

      // Bonus for meeting multiple criteria well
      if (criteriaWithGoodScores >= 3) {
        bonusPoints += 15 // Increased from 10 to 15
        bonusReasons.push(`+15 for meeting ${criteriaWithGoodScores}/${totalCriteria} criteria well`)
      }

      if (criteriaWithExcellentScores >= 2) {
        bonusPoints += 20 // Increased from 15 to 20
        bonusReasons.push(`+20 for excelling in ${criteriaWithExcellentScores} criteria`)
      }

      // Bonus for comprehensive skill matching
      if (allSkillMatches.length >= 5) {
        bonusPoints += 12 // Increased from 8 to 12
        bonusReasons.push(`+12 for comprehensive skill match (${allSkillMatches.length} skills)`)
      }

      if (allSkillMatches.length >= 2) {
        bonusPoints += 5
        bonusReasons.push(`+5 for relevant skill matches`)
      }

      // Experience + Education combo bonus
      if (
        results.find((r) => r.criterion === "experience")?.score >= 60 &&
        results.find((r) => r.criterion === "education")?.score >= 60
      ) {
        bonusPoints += 8 // Increased from 5 to 8
        bonusReasons.push("+8 for strong experience-education combination")
      }

      if (resumeText.length > 100) {
        bonusPoints += 5
        bonusReasons.push("+5 for detailed application")
      }

      // Apply bonus points
      totalScore = Math.min(100, totalScore + bonusPoints)

      totalScore = Math.max(25, totalScore) // Minimum 25% score for any application

      // Prepare data for database
      const scores: Record<string, number> = {}
      const scoreBreakdown: Record<string, any> = {}

      results.forEach((result) => {
        scores[result.criterion] = result.score
        scoreBreakdown[result.criterion] = {
          score: result.score,
          maxScore: result.maxScore,
          reasoning: result.reasoning,
          matched_items: result.keywords,
        }
      })

      if (bonusPoints > 0) {
        scoreBreakdown["bonus"] = {
          score: bonusPoints,
          maxScore: 50,
          reasoning: bonusReasons.join(", "),
          matched_items: [],
        }
      }

      console.log("[v0] DirectScoringService: Enhanced scores:", scores)
      console.log("[v0] DirectScoringService: Bonus points applied:", bonusPoints)
      console.log("[v0] DirectScoringService: Final score:", totalScore)

      // Update application with scores
      const { error: updateError } = await supabase
        .from("applications")
        .update({
          scores: scores,
          total_score: totalScore,
          score_breakdown: scoreBreakdown,
          scoring_summary: `Enhanced scoring: ${totalScore}% (base: ${totalScore - bonusPoints}% + bonus: ${bonusPoints}%) across ${results.length} criteria with multi-criteria bonuses`,
        })
        .eq("id", applicationId)

      if (updateError) {
        console.error("[v0] DirectScoringService: Error updating scores:", updateError)
        return false
      }

      console.log("[v0] DirectScoringService: Successfully scored application with enhanced total:", totalScore)
      return true
    } catch (error) {
      console.error("[v0] DirectScoringService: Enhanced scoring failed:", error)
      return false
    }
  }
}

export const directScoringService = new DirectScoringService()
