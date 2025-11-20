/**
 * Robust Document Parser
 * Simplified, reliable document parsing with clear error handling
 * Supports: Images, PDFs, Text files
 */

interface ParsedResumeData {
  applicant_name: string
  applicant_email: string
  applicant_phone: string
  applicant_city: string
  resume_summary: string
  key_skills: string
  experience_years: number
  education_level: string
  certifications: string
  raw_text: string
}

export class RobustDocumentParser {
  private readonly OCR_API_KEY = process.env.OCR_API_KEY || ""
  private readonly OCR_API_URL = "https://api.ocr.space/parse/image"
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
  private readonly TIMEOUT = 45000 // 45 seconds

  /**
   * Step 1: Validate File
   */
  private validateFile(file: File): { valid: boolean; error?: string } {
    console.log("[v0] Step 1: Validating file", { name: file.name, size: file.size, type: file.type })

    // Check if file exists
    if (!file || !file.name) {
      return { valid: false, error: "No file provided" }
    }

    // Check file size
    if (file.size === 0) {
      return { valid: false, error: "File is empty" }
    }

    if (file.size > this.MAX_FILE_SIZE) {
      return { 
        valid: false, 
        error: `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 5MB. Please compress or convert to JPG.`
      }
    }

    // Check file type
    const fileName = file.name.toLowerCase()
    const fileType = file.type.toLowerCase()

    const isImage = fileType.startsWith("image/") || /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileName)
    const isPDF = fileType === "application/pdf" || fileName.endsWith(".pdf")
    const isText = fileType.startsWith("text/") || fileName.endsWith(".txt")

    if (!isImage && !isPDF && !isText) {
      return { 
        valid: false, 
        error: `Unsupported file format. Please upload: PDF, JPG, PNG, or TXT files only. Word documents (.docx) are not supported - please convert to PDF first.`
      }
    }

    console.log("[v0] File validation passed:", { isImage, isPDF, isText })
    return { valid: true }
  }

  /**
   * Step 2: Extract Text from File
   */
  private async extractText(file: File): Promise<string> {
    console.log("[v0] Step 2: Extracting text from file")

    const fileName = file.name.toLowerCase()
    const fileType = file.type.toLowerCase()

    // Handle text files directly
    if (fileType.startsWith("text/") || fileName.endsWith(".txt")) {
      console.log("[v0] Text file detected - reading directly")
      const text = await file.text()
      console.log("[v0] Extracted text length:", text.length)
      return text
    }

    // Handle images and PDFs with OCR
    if (!this.OCR_API_KEY) {
      throw new Error("OCR API key not configured. Cannot process image/PDF files.")
    }

    console.log("[v0] Calling OCR API for", fileName)

    try {
      // Create form data for OCR API
      const formData = new FormData()
      formData.append("apikey", this.OCR_API_KEY)
      formData.append("file", file)
      formData.append("language", "eng")
      formData.append("isOverlayRequired", "false")
      formData.append("detectOrientation", "true")
      formData.append("scale", "true")
      formData.append("OCREngine", "2") // Engine 2 for better accuracy

      // Call OCR API with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT)

      const response = await fetch(this.OCR_API_URL, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] OCR API HTTP error:", response.status, errorText)
        throw new Error(`OCR service returned error ${response.status}`)
      }

      const result = await response.json()
      console.log("[v0] OCR API response received")

      // Check OCR result
      if (result.OCRExitCode !== 1) {
        const errorMsg = result.ErrorMessage?.[0] || result.ErrorMessage || "OCR processing failed"
        console.error("[v0] OCR failed:", errorMsg)
        throw new Error(`OCR error: ${errorMsg}`)
      }

      // Extract text from all pages
      const extractedText = result.ParsedResults?.map((page: any) => page.ParsedText || "").join("\n\n") || ""

      if (!extractedText || extractedText.trim().length < 10) {
        throw new Error("No text could be extracted from the document. The image may be too blurry or low quality.")
      }

      console.log("[v0] Successfully extracted text, length:", extractedText.length)
      return extractedText

    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error("OCR processing timeout. The file may be too large or complex. Try converting to JPG and reducing file size.")
      }
      throw error
    }
  }

  /**
   * Step 3: Extract Information from Text
   */
  private extractInformation(text: string): ParsedResumeData {
    console.log("[v0] Step 3: Extracting information from text")

    const lines = text.split("\n").map((line) => line.trim()).filter((line) => line.length > 0)

    // Extract name (usually first few lines)
    let applicant_name = "Name Not Found"
    for (const line of lines.slice(0, 10)) {
      // Look for lines that might be a name (2-4 words, proper case, no special chars)
      const words = line.split(/\s+/)
      if (words.length >= 2 && words.length <= 4) {
        const looksLikeName = words.every(
          (word) => /^[A-Z][a-z]+$/.test(word) || /^[A-Z]\.$/.test(word) // Proper case or initial
        )
        if (looksLikeName && line.length < 50) {
          applicant_name = line
          console.log("[v0] Found name:", applicant_name)
          break
        }
      }
    }

    // Extract email
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
    const applicant_email = emailMatch ? emailMatch[0] : ""
    console.log("[v0] Found email:", applicant_email || "Not found")

    // Extract phone - simple patterns only
    const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?$$?\d{3}$$?[-.\s]?\d{3}[-.\s]?\d{4}/)
    const applicant_phone = phoneMatch ? phoneMatch[0] : ""
    console.log("[v0] Found phone:", applicant_phone || "Not found")

    // Extract city/location
    let applicant_city = ""
    const locationKeywords = ["location", "address", "city", "residence"]
    for (const line of lines) {
      const lowerLine = line.toLowerCase()
      if (locationKeywords.some((keyword) => lowerLine.includes(keyword))) {
        // Try to extract city name after the keyword
        const parts = line.split(/[:\-,]/)
        if (parts.length > 1) {
          applicant_city = parts[1].trim().split(/[,\n]/)[0].trim()
          if (applicant_city.length > 2 && applicant_city.length < 50) {
            console.log("[v0] Found city:", applicant_city)
            break
          }
        }
      }
    }

    // Extract skills
    const skillsSection = this.extractSection(text, ["skills", "technical skills", "competencies"])
    const key_skills = skillsSection.substring(0, 500) // Limit to 500 chars

    // Extract experience years
    let experience_years = 0
    const expMatch = text.match(/(\d+)\+?\s*(years?|yrs?)\s*(of)?\s*(experience|work|professional)/i)
    if (expMatch) {
      experience_years = parseInt(expMatch[1], 10)
      console.log("[v0] Found experience:", experience_years, "years")
    }

    // Extract education
    const educationSection = this.extractSection(text, ["education", "academic", "qualification"])
    let education_level = "Not specified"
    const lowerEdu = educationSection.toLowerCase()
    if (lowerEdu.includes("phd") || lowerEdu.includes("doctorate")) education_level = "PhD"
    else if (lowerEdu.includes("master") || lowerEdu.includes("mba") || lowerEdu.includes("msc")) education_level = "Master's Degree"
    else if (lowerEdu.includes("bachelor") || lowerEdu.includes("bsc") || lowerEdu.includes("ba ")) education_level = "Bachelor's Degree"
    else if (lowerEdu.includes("diploma") || lowerEdu.includes("associate")) education_level = "Diploma"
    console.log("[v0] Found education:", education_level)

    // Extract certifications
    const certSection = this.extractSection(text, ["certification", "certificate", "license"])
    const certifications = certSection.substring(0, 300)

    // Create summary
    const resume_summary = text.substring(0, 1000).trim()

    return {
      applicant_name,
      applicant_email,
      applicant_phone,
      applicant_city,
      resume_summary,
      key_skills,
      experience_years,
      education_level,
      certifications,
      raw_text: text,
    }
  }

  /**
   * Helper: Extract section from text
   */
  private extractSection(text: string, keywords: string[]): string {
    const lines = text.split("\n")
    let capturing = false
    const captured: string[] = []
    let captureCount = 0

    for (const line of lines) {
      const lowerLine = line.toLowerCase().trim()

      // Start capturing when we find a keyword
      if (!capturing && keywords.some((kw) => lowerLine.includes(kw))) {
        capturing = true
        continue
      }

      // Stop if we hit another major section
      if (capturing) {
        if (
          lowerLine.match(/^(experience|work|employment|education|projects|references|contact)/i) &&
          !keywords.some((kw) => lowerLine.includes(kw))
        ) {
          break
        }

        captured.push(line)
        captureCount++

        // Stop after capturing reasonable amount
        if (captureCount > 20) break
      }
    }

    return captured.join("\n").trim()
  }

  /**
   * Main Parse Function - Step by Step
   */
  async parseFromFile(file: File): Promise<ParsedResumeData> {
    console.log("[v0] ===== STARTING ROBUST DOCUMENT PARSING =====")

    try {
      // Step 1: Validate
      const validation = this.validateFile(file)
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      // Step 2: Extract Text
      const text = await this.extractText(file)

      // Step 3: Extract Information
      const data = this.extractInformation(text)

      console.log("[v0] ===== PARSING COMPLETED SUCCESSFULLY =====")
      return data

    } catch (error) {
      console.error("[v0] ===== PARSING FAILED =====")
      console.error("[v0] Error:", error)
      throw error
    }
  }
}

export const robustDocumentParser = new RobustDocumentParser()
