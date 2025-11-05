import { advancedOCRService } from "./advanced-ocr-service"

export interface ParsedResumeData {
  applicant_name: string
  applicant_email: string
  applicant_phone: string
  applicant_city: string
  key_skills: string
  experience_years: number
  education_level: string
  resume_summary: string
  certifications: string
}

export class SimpleResumeParser {
  async parseFromFile(file: File): Promise<ParsedResumeData> {
    try {
      console.log("[v0] Starting advanced resume parsing for:", file.name)

      const extractedData = await advancedOCRService.extractFromFile(file)

      const parsedData: ParsedResumeData = {
        applicant_name: extractedData.name || "Unknown Applicant",
        applicant_email: extractedData.email || "",
        applicant_phone: extractedData.phone || "", // Re-enable phone extraction
        applicant_city: extractedData.location || "",
        key_skills: extractedData.skills.join(", ") || "Not specified",
        experience_years: this.parseExperienceYears(extractedData.experience),
        education_level: extractedData.education || "Not specified",
        resume_summary: extractedData.summary || "Resume processed successfully",
        certifications: this.extractCertifications(extractedData.rawText),
      }

      console.log("Advanced parsed resume data:", parsedData)
      return parsedData
    } catch (error) {
      console.error("Advanced resume parsing error:", error)
      throw new Error(`Resume parsing failed: ${error.message}`)
    }
  }

  private parseExperienceYears(experience: string): number {
    const match = experience.match(/(\d+)/)
    return match ? Number.parseInt(match[1]) : 0
  }

  private extractCertifications(text: string): string {
    const certKeywords = ["certified", "certification", "certificate", "license", "credential"]

    const lines = text.split("\n")
    const certifications: string[] = []

    for (const line of lines) {
      const lowerLine = line.toLowerCase()
      if (certKeywords.some((keyword) => lowerLine.includes(keyword))) {
        certifications.push(line.trim())
      }
    }

    return certifications.join("; ") || "None specified"
  }
}

export const simpleResumeParser = new SimpleResumeParser()
