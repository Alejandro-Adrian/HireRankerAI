// Simplified OCR resume parser without problematic dependencies
import pdfParse from "pdf-parse/lib/pdf-parse.js"

interface ResumeData {
  name: string
  email: string
  phone: string
  location: string
  summary: string
  skills: string[]
  experience: string
  education: string
  rawText: string
}

export class OCRResumeParser {
  async parseFromFile(file: File): Promise<ResumeData> {
    console.log("[v0] 📄 OCR Parser: Starting resume parsing...")
    console.log("[v0] 📁 File:", file.name, file.type, file.size)

    try {
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      let text = ""

      if (file.type === "application/pdf") {
        console.log("[v0] 📄 Extracting text from PDF...")
        const data = await pdfParse(buffer)
        text = data.text
        console.log("[v0] ✅ PDF text extracted, length:", text.length)
      } else if (file.type.startsWith("text/")) {
        console.log("[v0] 📄 Reading text file...")
        text = buffer.toString("utf-8")
        console.log("[v0] ✅ Text file read, length:", text.length)
      } else {
        throw new Error("Unsupported file type. Only PDF and TXT files are supported.")
      }

      if (!text || text.length < 10) {
        throw new Error("Failed to extract meaningful text from the document")
      }

      const resumeData: ResumeData = {
        name: this.extractName(text),
        email: this.extractEmail(text),
        phone: "", // Disabled
        location: this.extractLocation(text),
        summary: this.extractSummary(text),
        skills: this.extractSkills(text),
        experience: this.extractExperience(text),
        education: this.extractEducation(text),
        rawText: text,
      }

      console.log("[v0] ✅ Parsing complete:", {
        name: resumeData.name,
        email: resumeData.email,
        location: resumeData.location,
        skills: resumeData.skills.length,
      })

      return resumeData
    } catch (error) {
      console.error("[v0] ❌ OCR Parser error:", error)
      throw error
    }
  }

  private extractName(text: string): string {
    const lines = text.split("\n").filter((l) => l.trim())
    const firstLine = lines[0]?.trim() || ""
    const namePattern = /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})$/
    const match = firstLine.match(namePattern)
    return match ? match[1] : firstLine.substring(0, 50) || "Name Not Found"
  }

  private extractEmail(text: string): string {
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
    const match = text.match(emailPattern)
    return match ? match[0] : ""
  }

  private extractLocation(text: string): string {
    const cityPattern = /(?:City|Location|Address):\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i
    const match = text.match(cityPattern)
    return match ? match[1] : ""
  }

  private extractSummary(text: string): string {
    const summaryPattern = /(?:Summary|Profile|About|Objective):?\s*([^\n]+(?:\n[^\n]+){0,3})/i
    const match = text.match(summaryPattern)
    return match ? match[1].trim() : ""
  }

  private extractSkills(text: string): string[] {
    const skills: string[] = []
    const skillsSection = text.match(/Skills?:?\s*([^\n]+(?:\n[^\n]+)*)/i)
    if (skillsSection) {
      const extracted = skillsSection[1]
        .split(/[,;•\n]/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
      skills.push(...extracted)
    }
    return skills.slice(0, 20)
  }

  private extractExperience(text: string): string {
    const yearPattern = /(\d+)\+?\s*years?\s+(?:of\s+)?experience/i
    const match = text.match(yearPattern)
    return match ? match[1] : "0"
  }

  private extractEducation(text: string): string {
    const educationPattern = /(?:Education|Degree):\s*([^\n]+)/i
    const match = text.match(educationPattern)
    return match ? match[1].trim() : ""
  }
}

export const ocrResumeParser = new OCRResumeParser()
