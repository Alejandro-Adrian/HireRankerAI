import pdfParse from "pdf-parse/lib/pdf-parse.js"

interface ParsedResumeData {
  applicant_name: string
  applicant_email: string
  applicant_phone: string
  applicant_city: string
  skills: string[]
  experience_years: number
  education: string
  certifications: string[]
}

export async function parseResumeSimple(fileBuffer: Buffer, mimeType: string): Promise<ParsedResumeData> {
  console.log("[v0] 📄 Starting simple PDF parsing...")

  let text = ""

  if (mimeType === "application/pdf") {
    try {
      const data = await pdfParse(fileBuffer)
      text = data.text
      console.log("[v0] ✅ PDF text extracted:", text.substring(0, 200))
    } catch (error) {
      console.error("[v0] ❌ PDF parsing error:", error)
      throw new Error("Failed to extract text from PDF")
    }
  } else if (mimeType.startsWith("text/")) {
    text = fileBuffer.toString("utf-8")
    console.log("[v0] ✅ Text file loaded")
  } else {
    throw new Error("Unsupported file type. Only PDF and TXT files are supported.")
  }

  const extractedData: ParsedResumeData = {
    applicant_name: extractName(text),
    applicant_email: extractEmail(text),
    applicant_phone: "", // Disabled phone detection
    applicant_city: extractCity(text),
    skills: extractSkills(text),
    experience_years: extractExperienceYears(text),
    education: extractEducation(text),
    certifications: extractCertifications(text),
  }

  console.log("[v0] ✅ Extraction complete:", extractedData)
  return extractedData
}

function extractName(text: string): string {
  // Look for name at the beginning of the document
  const lines = text.split("\n").filter((l) => l.trim())
  const firstLine = lines[0]?.trim() || ""

  // Check if first line looks like a name (2-4 words, mostly letters)
  const namePattern = /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})$/
  const match = firstLine.match(namePattern)

  return match ? match[1] : firstLine.substring(0, 50)
}

function extractEmail(text: string): string {
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
  const match = text.match(emailPattern)
  return match ? match[0] : ""
}

function extractCity(text: string): string {
  // Common city patterns
  const cityPattern = /(?:City|Location|Address):\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i
  const match = text.match(cityPattern)
  return match ? match[1] : ""
}

function extractSkills(text: string): string[] {
  const skills: string[] = []

  // Look for skills section
  const skillsSection = text.match(/Skills?:?\s*([^\n]+(?:\n[^\n]+)*)/i)
  if (skillsSection) {
    const skillsText = skillsSection[1]
    // Split by common separators
    const extracted = skillsText
      .split(/[,;•\n]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
    skills.push(...extracted)
  }

  return skills.slice(0, 20) // Limit to 20 skills
}

function extractExperienceYears(text: string): number {
  // Look for years of experience
  const yearPattern = /(\d+)\+?\s*years?\s+(?:of\s+)?experience/i
  const match = text.match(yearPattern)
  return match ? Number.parseInt(match[1]) : 0
}

function extractEducation(text: string): string {
  // Look for education section
  const educationPattern = /(?:Education|Degree):\s*([^\n]+)/i
  const match = text.match(educationPattern)
  return match ? match[1].trim() : ""
}

function extractCertifications(text: string): string[] {
  const certs: string[] = []

  // Look for certifications section
  const certsSection = text.match(/Certifications?:?\s*([^\n]+(?:\n[^\n]+)*)/i)
  if (certsSection) {
    const certsText = certsSection[1]
    const extracted = certsText
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
    certs.push(...extracted)
  }

  return certs.slice(0, 10) // Limit to 10 certifications
}
