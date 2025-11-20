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
  raw_text?: string
}

export class SimpleResumeParser {
  async parseFromFile(file: File): Promise<ParsedResumeData> {
    try {
      console.log("[v0] Starting resume parsing for:", file.name, "Type:", file.type, "Size:", file.size)
      
      // Use only the advanced OCR service which is more reliable
      
      const extractedData = await advancedOCRService.extractFromFile(file)

      const parsedData: ParsedResumeData = {
        applicant_name: extractedData.name || "Unknown Applicant",
        applicant_email: extractedData.email || "",
        applicant_phone: extractedData.phone || "",
        applicant_city: extractedData.location || "",
        key_skills: extractedData.skills.join(", ") || "Not specified",
        experience_years: this.parseExperienceYears(extractedData.experience),
        education_level: extractedData.education || "Not specified",
        resume_summary: extractedData.summary || "Resume processed successfully",
        certifications: this.extractCertifications(extractedData.rawText),
        raw_text: extractedData.rawText
      }

      console.log("[v0] Resume parsing completed successfully")
      console.log("[v0] Parsed data:", {
        name: parsedData.applicant_name,
        email: parsedData.applicant_email,
        phone: parsedData.applicant_phone,
        city: parsedData.applicant_city,
        skills: parsedData.key_skills.substring(0, 50) + '...',
      })
      
      return parsedData
      
    } catch (error) {
      console.error("[v0] Resume parsing error:", error)
      console.error("[v0] Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
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
