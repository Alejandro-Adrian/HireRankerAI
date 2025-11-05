export const realScoring = {
  scoreApplication(application: any, criteriaWeights: any = {}, ranking: any = null) {
    // Enhanced scoring based on available data and ranking criteria
    const scores: any = {}
    let totalScore = 0
    let criteriaCount = 0

    // Get the selected criteria from ranking if available
    const selectedCriteria = ranking?.criteria || Object.keys(criteriaWeights)

    // Score each selected criteria
    selectedCriteria.forEach((criteriaId: string) => {
      const weight = criteriaWeights[criteriaId] || 0
      if (weight === 0) return // Skip criteria with no weight

      let criteriaScore = 0

      switch (criteriaId) {
        case "skill":
          if (application.key_skills) {
            criteriaScore = Math.min(100, application.key_skills.split(",").length * 20)
          }
          break

        case "experience":
          if (application.experience_years) {
            criteriaScore = Math.min(100, application.experience_years * 10)
          }
          break

        case "education":
          if (application.education_level) {
            const educationScores: any = {
              "high school": 30,
              associate: 50,
              bachelor: 70,
              master: 85,
              phd: 100,
            }
            criteriaScore = educationScores[application.education_level.toLowerCase()] || 50
          }
          break

        case "personality":
          // Base personality score - could be enhanced with AI analysis
          criteriaScore = 70 // Default moderate score
          break

        case "training":
          // Score based on training mentions in resume
          if (application.resume_summary || application.key_skills) {
            const text = `${application.resume_summary || ""} ${application.key_skills || ""}`.toLowerCase()
            const trainingKeywords = ["training", "course", "workshop", "seminar", "bootcamp", "certification"]
            const matches = trainingKeywords.filter((keyword) => text.includes(keyword)).length
            criteriaScore = Math.min(100, matches * 25)
          }
          break

        case "certification":
          if (application.certifications) {
            // Score based on number and quality of certifications
            const certCount = application.certifications.split(",").length
            criteriaScore = Math.min(100, certCount * 30)
          } else {
            // Check resume for certification keywords
            const text = `${application.resume_summary || ""} ${application.key_skills || ""}`.toLowerCase()
            const certKeywords = ["certified", "certificate", "license", "accredited", "qualified"]
            const matches = certKeywords.filter((keyword) => text.includes(keyword)).length
            criteriaScore = Math.min(100, matches * 20)
          }
          break

        case "area_living":
          if (application.applicant_city && ranking?.area_city) {
            // Simple city matching - could be enhanced with distance calculation
            const applicantCity = application.applicant_city.toLowerCase().trim()
            const preferredCity = ranking.area_city.toLowerCase().trim()

            if (applicantCity === preferredCity) {
              criteriaScore = 100 // Perfect match
            } else if (applicantCity.includes(preferredCity) || preferredCity.includes(applicantCity)) {
              criteriaScore = 75 // Partial match
            } else {
              criteriaScore = 30 // Different city but not zero
            }
          } else {
            criteriaScore = 50 // Default if no city data
          }
          break

        case "other":
          if (ranking?.other_keyword) {
            const keyword = ranking.other_keyword.toLowerCase().trim()
            const searchText =
              `${application.resume_summary || ""} ${application.key_skills || ""} ${application.ocr_transcript || ""}`.toLowerCase()

            if (searchText.includes(keyword)) {
              criteriaScore = 100 // Found the keyword - full points
              console.log(`Found keyword "${keyword}" in application for ${application.applicant_name}`)
            } else {
              // Check for partial matches or related terms
              const words = keyword.split(" ")
              const partialMatches = words.filter((word) => word.length > 2 && searchText.includes(word)).length

              if (partialMatches > 0) {
                criteriaScore = Math.min(75, partialMatches * 25) // Partial credit for related terms
                console.log(
                  `Found ${partialMatches} partial matches for "${keyword}" in application for ${application.applicant_name}`,
                )
              } else {
                criteriaScore = 0 // No match found
                console.log(
                  `No matches found for keyword "${keyword}" in application for ${application.applicant_name}`,
                )
              }
            }
          } else {
            criteriaScore = 50 // Default if no keyword specified
          }
          break

        default:
          criteriaScore = 50 // Default score for unknown criteria
          break
      }

      // Apply the weighted score
      const weightedScore = (criteriaScore * weight) / 100
      scores[criteriaId] = Math.round(criteriaScore)
      totalScore += weightedScore
      criteriaCount++

      console.log(
        `Scored ${criteriaId}: ${criteriaScore} (weight: ${weight}%, weighted: ${weightedScore.toFixed(1)})`,
      )
    })

    const finalScore = criteriaCount > 0 ? Math.round(totalScore) : 0

    console.log(`Final score for ${application.applicant_name}: ${finalScore}% (${criteriaCount} criteria)`)

    return {
      criteriaScores: scores,
      totalScore: finalScore,
    }
  },
}
