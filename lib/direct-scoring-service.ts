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

      const baseSkillScore = 45 // Reduced from 50 to 45 for more accurate base scoring
      const skillScore = Math.round(
        baseSkillScore +
          ((requiredSkills.score * SCORING_WEIGHTS.skills.required +
            preferredSkills.score * SCORING_WEIGHTS.skills.preferred +
            bonusSkills.score * SCORING_WEIGHTS.skills.bonus) /
            3) *
            0.5 * // Adjusted multiplier for better score distribution
            multipliers.skills,
      )

      const allSkillMatches = [...requiredSkills.matches, ...preferredSkills.matches, ...bonusSkills.matches]

      results.push({
        criterion: "skill",
        score: Math.min(100, skillScore),
        maxScore: 100,
        reasoning: `Found ${allSkillMatches.length} relevant skills: ${requiredSkills.matches.length} required, ${preferredSkills.matches.length} preferred, ${bonusSkills.matches.length} bonus`,
        keywords: allSkillMatches, // ONLY DETECTED SKILLS
      })

      const experienceMatch = SkillMatcher.matchExperience(resumeText, position)
      let experienceScore = Math.max(40, experienceMatch.score * 100)

      const experienceYears = application.experience_years || 0
      let yearMultiplier = 1.0
      if (experienceYears >= 10) yearMultiplier = 1.25
      else if (experienceYears >= 5) yearMultiplier = 1.15
      else if (experienceYears >= 3) yearMultiplier = 1.05
      else if (experienceYears >= 1) yearMultiplier = 0.95
      else yearMultiplier = 0.85

      experienceScore = Math.round(experienceScore * yearMultiplier * multipliers.experience)

      results.push({
        criterion: "experience",
        score: Math.min(100, experienceScore),
        maxScore: 100,
        reasoning: `${experienceYears} years experience with ${experienceMatch.matchedKeywords.length} relevant indicators`,
        keywords: experienceMatch.matchedKeywords, // ONLY DETECTED EXPERIENCE KEYWORDS
      })

      const educationText = application.education_level || ""
      let educationScore = 45 // Reduced base education score from 50 to 45
      let educationLevel = "basic"
      let educationKeywords: string[] = [] // Will only contain DETECTED education markers

      for (const [level, weight] of Object.entries(SCORING_WEIGHTS.education)) {
        if (resumeText.includes(level) || educationText.toLowerCase().includes(level)) {
          if (weight > educationScore - 45) {
            educationScore = 45 + weight
            educationLevel = level
            educationKeywords = [level] // Store ONLY what was detected
          }
        }
      }

      // Check for relevant education fields - ONLY add if actually found
      const relevantEducation = positionRef.education.preferred.filter(
        (field) =>
          resumeText.includes(field.toLowerCase()) || educationText.toLowerCase().includes(field.toLowerCase()),
      )

      if (relevantEducation.length > 0) {
        educationScore += relevantEducation.length * 15
        educationKeywords.push(...relevantEducation) // Add only detected fields
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
        keywords: educationKeywords, // ONLY DETECTED EDUCATION
      })

      const trainingKeywords = [
        ...positionRef.training.certifications,
        ...positionRef.training.courses,
        ...positionRef.training.workshops,
      ]

      // Filter to ONLY certifications actually found in the resume
      const trainingMatches = trainingKeywords.filter((training) => resumeText.includes(training.toLowerCase()))

      let trainingScore = 45 // Reduced base certification score from 50 to 45

      trainingMatches.forEach((training) => {
        for (const [level, weight] of Object.entries(SCORING_WEIGHTS.certifications)) {
          if (training.toLowerCase().includes(level)) {
            trainingScore += weight * 0.25
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
        keywords: trainingMatches, // ONLY DETECTED CERTIFICATIONS
      })

      const personalityMatch = SkillMatcher.matchPersonality(resumeText, position)
      const personalityScore = Math.max(50, Math.round(personalityMatch.score * 100))

      results.push({
        criterion: "personality",
        score: Math.min(100, personalityScore),
        maxScore: 100,
        reasoning:
          personalityMatch.matchedTraits.length > 0
            ? `Found ${personalityMatch.matchedTraits.length} relevant personality traits`
            : "Professional presentation detected",
        keywords: personalityMatch.matchedTraits, // ONLY DETECTED TRAITS
      })

      const totalCriteria = results.length
      const criteriaWithGoodScores = results.filter((r) => r.score >= 60).length
      const criteriaWithExcellentScores = results.filter((r) => r.score >= 80).length

      let totalScore = Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)

      let bonusPoints = 0
      const bonusReasons: string[] = []

      if (criteriaWithGoodScores >= 3) {
        bonusPoints += 12
        bonusReasons.push(`+12 for meeting ${criteriaWithGoodScores}/${totalCriteria} criteria well`)
      }

      if (criteriaWithExcellentScores >= 2) {
        bonusPoints += 15
        bonusReasons.push(`+15 for excelling in ${criteriaWithExcellentScores} criteria`)
      }

      if (allSkillMatches.length >= 5) {
        bonusPoints += 10
        bonusReasons.push(`+10 for comprehensive skill match (${allSkillMatches.length} skills)`)
      }

      if (allSkillMatches.length >= 2) {
        bonusPoints += 4
        bonusReasons.push(`+4 for relevant skill matches`)
      }

      if (
        results.find((r) => r.criterion === "experience")?.score >= 60 &&
        results.find((r) => r.criterion === "education")?.score >= 60
      ) {
        bonusPoints += 6
        bonusReasons.push("+6 for strong experience-education combination")
      }

      if (resumeText.length > 100) {
        bonusPoints += 4
        bonusReasons.push("+4 for detailed application")
      }

      totalScore = Math.min(100, totalScore + bonusPoints)
      totalScore = Math.max(25, totalScore)

      const scores: Record<string, number> = {}
      const scoreBreakdown: Record<string, any> = {}

      results.forEach((result) => {
        scores[result.criterion] = result.score
        scoreBreakdown[result.criterion] = {
          score: result.score,
          maxScore: result.maxScore,
          reasoning: result.reasoning,
          matched_items: result.keywords, // NOW ONLY CONTAINS DETECTED KEYWORDS
        }
      })

      if (bonusPoints > 0) {
        scoreBreakdown["bonus"] = {
          score: bonusPoints,
          maxScore: 40,
          reasoning: bonusReasons.join(", "),
          matched_items: [],
        }
      }

      console.log("[v0] DirectScoringService: Detected keywords only - no hallucination:", 
        results.map(r => ({ criterion: r.criterion, detected: r.keywords.length })))
      console.log("[v0] DirectScoringService: Final score:", totalScore)

      const { error: updateError } = await supabase
        .from("applications")
        .update({
          scores: scores,
          total_score: totalScore,
          score_breakdown: scoreBreakdown,
          scoring_summary: `Accurate scoring: ${totalScore}% (base: ${totalScore - bonusPoints}% + bonus: ${bonusPoints}%) with ONLY detected keywords`,
        })
        .eq("id", applicationId)

      if (updateError) {
        console.error("[v0] DirectScoringService: Error updating scores:", updateError)
        return false
      }

      console.log("[v0] DirectScoringService: Successfully scored with accurate keyword detection")
      return true
    } catch (error) {
      console.error("[v0] DirectScoringService: Scoring failed:", error)
      return false
    }
  }
}

export const directScoringService = new DirectScoringService()
