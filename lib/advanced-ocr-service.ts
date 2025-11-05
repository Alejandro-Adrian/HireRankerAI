export interface ExtractedResumeData {
  name: string
  email: string
  phone: string
  location: string
  skills: string[]
  experience: string
  education: string
  summary: string
  rawText: string
}

export class AdvancedOCRService {
  private readonly API_KEY = "K82009408488957"
  private readonly API_URL = "https://api.ocr.space/parse/image"

  private readonly COMMON_FIRST_NAMES = new Set([
    "james",
    "robert",
    "john",
    "michael",
    "david",
    "william",
    "richard",
    "charles",
    "joseph",
    "thomas",
    "christopher",
    "daniel",
    "paul",
    "mark",
    "donald",
    "george",
    "kenneth",
    "steven",
    "edward",
    "brian",
    "ronald",
    "anthony",
    "kevin",
    "jason",
    "matthew",
    "gary",
    "timothy",
    "jose",
    "larry",
    "jeffrey",
    "frank",
    "scott",
    "eric",
    "stephen",
    "andrew",
    "raymond",
    "gregory",
    "joshua",
    "jerry",
    "dennis",
    "walter",
    "patrick",
    "peter",
    "harold",
    "douglas",
    "henry",
    "carl",
    "arthur",
    "ryan",
    "roger",
    "mary",
    "patricia",
    "jennifer",
    "linda",
    "elizabeth",
    "barbara",
    "susan",
    "jessica",
    "sarah",
    "karen",
    "nancy",
    "lisa",
    "betty",
    "helen",
    "sandra",
    "donna",
    "carol",
    "ruth",
    "sharon",
    "michelle",
    "laura",
    "sarah",
    "kimberly",
    "deborah",
    "dorothy",
    "lisa",
    "nancy",
    "karen",
    "betty",
    "helen",
    "sandra",
    "donna",
    "carol",
    "ruth",
    "sharon",
    "michelle",
    "laura",
    "emily",
    "kimberly",
    "deborah",
    "amy",
    "angela",
    "ashley",
    "brenda",
    "emma",
    "olivia",
    "cynthia",
    "marie",
    "janet",
    "catherine",
  ])

  private readonly COMMON_LAST_NAMES = new Set([
    "smith",
    "johnson",
    "williams",
    "brown",
    "jones",
    "garcia",
    "miller",
    "davis",
    "rodriguez",
    "martinez",
    "hernandez",
    "lopez",
    "gonzalez",
    "wilson",
    "anderson",
    "thomas",
    "taylor",
    "moore",
    "jackson",
    "martin",
    "lee",
    "perez",
    "thompson",
    "white",
    "harris",
    "sanchez",
    "clark",
    "ramirez",
    "lewis",
    "robinson",
    "walker",
    "young",
    "allen",
    "king",
    "wright",
    "scott",
    "torres",
    "nguyen",
    "hill",
    "flores",
    "green",
    "adams",
    "nelson",
    "baker",
    "hall",
    "rivera",
    "campbell",
    "mitchell",
    "carter",
    "roberts",
  ])

  private readonly CITIES_COUNTRIES = new Set([
    "new york",
    "los angeles",
    "chicago",
    "houston",
    "phoenix",
    "philadelphia",
    "san antonio",
    "san diego",
    "dallas",
    "san jose",
    "austin",
    "jacksonville",
    "fort worth",
    "columbus",
    "charlotte",
    "francisco",
    "indianapolis",
    "seattle",
    "denver",
    "washington",
    "boston",
    "el paso",
    "detroit",
    "nashville",
    "portland",
    "memphis",
    "oklahoma city",
    "las vegas",
    "louisville",
    "baltimore",
    "milwaukee",
    "albuquerque",
    "tucson",
    "fresno",
    "sacramento",
    "mesa",
    "kansas city",
    "atlanta",
    "long beach",
    "colorado springs",
    "raleigh",
    "miami",
    "virginia beach",
    "omaha",
    "oakland",
    "minneapolis",
    "tulsa",
    "arlington",
    "united states",
    "usa",
    "canada",
    "mexico",
    "united kingdom",
    "england",
    "france",
    "germany",
    "italy",
    "spain",
    "australia",
    "japan",
    "china",
    "india",
    "brazil",
    "russia",
    "south africa",
    "california",
    "texas",
    "florida",
    "new york",
    "pennsylvania",
    "illinois",
    "ohio",
    "georgia",
    "north carolina",
    "michigan",
    "new jersey",
    "virginia",
    "washington",
    "arizona",
    "massachusetts",
    "tennessee",
    "indiana",
    "missouri",
    "maryland",
    "wisconsin",
    "colorado",
    "minnesota",
    "south carolina",
    "alabama",
    "louisiana",
    "kentucky",
    "oregon",
    "oklahoma",
    "connecticut",
    "utah",
    "iowa",
    "nevada",
    "arkansas",
    "mississippi",
    "kansas",
    "new mexico",
    "nebraska",
    "west virginia",
    "idaho",
    "hawaii",
    "new hampshire",
    "maine",
    "montana",
    "rhode island",
    "delaware",
    "south dakota",
    "north dakota",
    "alaska",
    "vermont",
    "wyoming",
    "monica",
    "culinary",
    "helper",
    "kingdom",
    "paul",
  ])

  private readonly JOB_TITLES = new Set([
    "kitchen helper",
    "labor relations",
    "resume applicant",
    "contact details",
    "personal information",
    "objective",
    "summary",
    "experience",
    "education",
    "skills",
    "references",
    "qualifications",
    "professional",
    "manager",
    "director",
    "assistant",
    "coordinator",
    "specialist",
    "analyst",
    "engineer",
    "developer",
    "designer",
    "consultant",
    "supervisor",
    "administrator",
    "executive",
    "representative",
    "technician",
    "operator",
    "clerk",
    "secretary",
    "receptionist",
    "sales",
    "marketing",
    "finance",
    "accounting",
    "human resources",
    "customer service",
    "project manager",
  ])

  private readonly LOCATION_INDICATORS = [
    "angeles",
    "york",
    "francisco",
    "chicago",
    "houston",
    "phoenix",
    "philadelphia",
    "antonio",
    "diego",
    "dallas",
    "jose",
    "austin",
    "jacksonville",
    "columbus",
    "charlotte",
    "seattle",
    "denver",
    "boston",
    "nashville",
    "baltimore",
    "portland",
    "vegas",
    "detroit",
    "memphis",
    "louisville",
    "milwaukee",
    "albuquerque",
    "tucson",
    "fresno",
    "sacramento",
    "mesa",
    "atlanta",
    "omaha",
    "colorado",
    "raleigh",
    "miami",
    "virginia",
    "oakland",
    "minneapolis",
    "tulsa",
    "arlington",
    "tampa",
    "new",
    "saint",
    "st.",
    "mount",
    "fort",
    "lake",
    "river",
    "beach",
    "springs",
    "valley",
    "hills",
    "city",
    "town",
    "village",
    "county",
    "state",
    "usa",
    "america",
    "united",
    "states",
    "california",
    "texas",
    "florida",
    "illinois",
    "pennsylvania",
    "ohio",
    "georgia",
    "north carolina",
    "michigan",
    "new jersey",
    "virginia",
    "washington",
    "arizona",
    "massachusetts",
    "tennessee",
    "indiana",
    "missouri",
    "maryland",
    "wisconsin",
    "colorado",
    "minnesota",
    "south carolina",
    "alabama",
    "louisiana",
    "kentucky",
    "oregon",
    "oklahoma",
    "connecticut",
    "utah",
    "iowa",
    "nevada",
    "arkansas",
    "mississippi",
    "kansas",
    "new mexico",
    "nebraska",
    "west virginia",
    "idaho",
    "hawaii",
    "new hampshire",
    "maine",
    "montana",
    "ca",
    "ny",
    "tx",
    "fl",
    "il",
    "pa",
    "oh",
    "ga",
    "nc",
    "mi",
    "nj",
    "va",
    "wa",
    "az",
    "ma",
    "tn",
    "in",
    "mo",
    "md",
    "wi",
    "co",
    "mn",
    "sc",
    "al",
    "la",
    "ky",
    "or",
    "ok",
    "ct",
    "ut",
    "ia",
    "nv",
    "ar",
    "ms",
    "ks",
    "nm",
    "ne",
    "wv",
    "id",
    "hi",
    "nh",
    "me",
    "mt",
  ]

  async extractFromFile(file: File): Promise<ExtractedResumeData> {
    try {
      console.log("[v0] Starting advanced OCR extraction for file:", file.name, "Type:", file.type)

      if (file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt")) {
        return await this.extractFromTextFile(file)
      }

      if (
        file.type === "application/msword" ||
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.name.toLowerCase().endsWith(".doc") ||
        file.name.toLowerCase().endsWith(".docx")
      ) {
        return await this.extractFromDocumentFile(file)
      }

      let processFile = file
      const supportedTypes = ["image/png", "image/jpeg", "image/jpg", "application/pdf"]

      // Only convert on client if needed (this won't execute on server)
      if (!supportedTypes.includes(file.type) && typeof OffscreenCanvas !== "undefined") {
        try {
          processFile = await this.convertToSupportedFormat(file)
        } catch (error) {
          console.warn("[v0] Format conversion failed, using original:", error)
          // Continue with original file
        }
      }

      let base64: string

      if (processFile.type === "application/pdf" || processFile.name.toLowerCase().endsWith(".pdf")) {
        try {
          base64 = await this.fileToBase64ServerSide(processFile)
          return await this.extractFromPDFEnhanced(base64, processFile.name)
        } catch (pdfError) {
          console.error("[v0] PDF processing failed:", pdfError)
          throw new Error(
            `PDF processing failed: ${pdfError.message}. Please try uploading the PDF file separately, or convert it to an image format (PNG/JPG).`,
          )
        }
      } else {
        base64 = await this.fileToBase64ServerSide(processFile)
        return await this.extractFromImageEnhanced(base64)
      }
    } catch (error) {
      console.error("[v0] Advanced OCR extraction error:", error)
      throw new Error(`Failed to extract resume data: ${error.message}`)
    }
  }

  private async convertToSupportedFormat(file: File): Promise<File> {
    const supportedTypes = ["image/png", "image/jpeg", "image/jpg", "application/pdf"]

    if (supportedTypes.includes(file.type)) {
      return file
    }

    // Browser APIs (OffscreenCanvas, Image, URL.createObjectURL) don't exist on Node.js
    // The OCR service will handle unsupported formats gracefully
    if (typeof OffscreenCanvas === "undefined") {
      console.warn("[v0] Skipping format conversion on server (browser APIs unavailable), using original file")
      return file
    }

    // Convert unsupported image formats to PNG (browser only)
    if (file.type.startsWith("image/")) {
      try {
        const canvas = new OffscreenCanvas(800, 600)
        const ctx = canvas.getContext("2d")

        const imageUrl = URL.createObjectURL(file)
        const img = new Image()

        return new Promise((resolve, reject) => {
          img.onload = async () => {
            canvas.width = img.width
            canvas.height = img.height
            ctx?.drawImage(img, 0, 0)

            const blob = await canvas.convertToBlob({ type: "image/png" })
            const convertedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".png"), { type: "image/png" })

            URL.revokeObjectURL(imageUrl)
            resolve(convertedFile)
          }

          img.onerror = () => {
            URL.revokeObjectURL(imageUrl)
            reject(new Error("Failed to convert image format"))
          }

          img.src = imageUrl
        })
      } catch (error) {
        console.warn("[v0] Format conversion failed, using original file:", error)
        return file
      }
    }

    return file
  }

  private async extractFromImageEnhanced(base64: string): Promise<ExtractedResumeData> {
    console.log("[v0] Starting enhanced image processing")

    const formData = new FormData()
    formData.append("base64Image", `data:image/jpeg;base64,${base64}`)
    formData.append("language", "eng")
    formData.append("OCREngine", "2")
    formData.append("isOverlayRequired", "false")
    formData.append("detectOrientation", "true")
    formData.append("scale", "true")
    formData.append("isTable", "false")

    try {
      const response = await fetch(this.API_URL, {
        method: "POST",
        headers: { apikey: this.API_KEY },
        body: formData,
      })

      console.log("[v0] Image OCR response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] Image OCR API error:", response.status, errorText)
        throw new Error(`Image OCR API error: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log("[v0] Image OCR result:", result)

      if (result.OCRExitCode !== 1) {
        console.error("[v0] OCR failed with exit code:", result.OCRExitCode, "Error:", result.ErrorMessage)
        throw new Error(`Image OCR failed: ${result.ErrorMessage || "OCR processing failed"}`)
      }

      if (!result.ParsedResults?.[0]?.ParsedText) {
        throw new Error("No text found in image")
      }

      const rawText = result.ParsedResults[0].ParsedText
      console.log("[v0] Image text extracted successfully, length:", rawText.length)

      if (rawText.trim().length < 5) {
        throw new Error("Extracted text too short - image may be unclear or contain no readable text")
      }

      return this.extractInformationAdvanced(rawText)
    } catch (error) {
      console.error("[v0] Image OCR processing error:", error)
      throw new Error(`Image OCR error: ${error.message}`)
    }
  }

  private async extractFromPDFEnhanced(base64: string, filename?: string): Promise<ExtractedResumeData> {
    console.log("[v0] Starting enhanced PDF processing for:", filename || "unknown file")

    try {
      console.log("[v0] Attempting PDF OCR with Engine 2")

      const formData = new FormData()
      formData.append("base64Image", `data:application/pdf;base64,${base64}`)
      formData.append("language", "eng")
      formData.append("OCREngine", "2")
      formData.append("isOverlayRequired", "false")
      formData.append("isOverlayRequired", "false")
      formData.append("detectOrientation", "true")
      formData.append("scale", "true")
      formData.append("isTable", "true")
      formData.append("filetype", "PDF")

      const response = await fetch(this.API_URL, {
        method: "POST",
        headers: {
          apikey: this.API_KEY,
        },
        body: formData,
      })

      console.log("[v0] PDF OCR response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] PDF OCR API error:", response.status, errorText)
        throw new Error(`PDF OCR API error: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log("[v0] PDF OCR result success:", result.OCRExitCode === 1)

      if (result.OCRExitCode === 1 && result.ParsedResults?.[0]?.ParsedText) {
        const rawText = result.ParsedResults[0].ParsedText
        console.log("[v0] PDF text extracted successfully, length:", rawText.length)

        if (rawText.trim().length < 10) {
          console.log("[v0] PDF text too short, trying fallback")
          throw new Error("PDF text extraction insufficient")
        }

        return this.extractInformationAdvanced(rawText)
      }

      console.log("[v0] OCR Engine 2 failed, error:", result.ErrorMessage)
      throw new Error(`OCR Engine 2 failed: ${result.ErrorMessage || "Unknown error"}`)
    } catch (error) {
      console.log("[v0] Engine 2 failed, trying Engine 1 fallback:", error.message)

      try {
        const formData = new FormData()
        formData.append("base64Image", `data:application/pdf;base64,${base64}`)
        formData.append("language", "eng")
        formData.append("OCREngine", "1")
        formData.append("isOverlayRequired", "false")
        formData.append("detectOrientation", "true")
        formData.append("filetype", "PDF")

        const response = await fetch(this.API_URL, {
          method: "POST",
          headers: {
            apikey: this.API_KEY,
          },
          body: formData,
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error("[v0] PDF fallback API error:", response.status, errorText)
          throw new Error(`PDF OCR fallback API error: ${response.status} - ${errorText}`)
        }

        const result = await response.json()
        console.log("[v0] PDF fallback OCR result success:", result.OCRExitCode === 1)

        if (result.OCRExitCode !== 1 || !result.ParsedResults?.[0]?.ParsedText) {
          throw new Error(`PDF OCR failed: ${result.ErrorMessage || "No text extracted"}`)
        }

        const rawText = result.ParsedResults[0].ParsedText
        console.log("[v0] PDF fallback text extracted, length:", rawText.length)

        if (rawText.trim().length < 10) {
          throw new Error("PDF text extraction insufficient - file may be image-based or corrupted")
        }

        return this.extractInformationAdvanced(rawText)
      } catch (fallbackError) {
        console.error("[v0] All PDF OCR methods failed:", fallbackError)
        throw new Error(
          `PDF processing failed: ${fallbackError.message}. The PDF may be image-based, corrupted, or contain no readable text. Please try converting to PNG/JPG format.`,
        )
      }
    }
  }

  private async fileToBase64ServerSide(file: File): Promise<string> {
    try {
      console.log("[v0] Converting file to base64:", file.name, file.type, file.size)

      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const base64 = buffer.toString("base64")

      let mimeType = file.type
      if (!mimeType || mimeType === "application/octet-stream") {
        const extension = file.name.split(".").pop()?.toLowerCase()
        switch (extension) {
          case "pdf":
            mimeType = "application/pdf"
            break
          case "jpg":
          case "jpeg":
            mimeType = "image/jpeg"
            break
          case "png":
            mimeType = "image/png"
            break
          default:
            mimeType = file.type || "application/octet-stream"
        }
      }

      console.log("[v0] File converted to base64, MIME type:", mimeType, "Base64 length:", base64.length)
      return base64
    } catch (error) {
      console.error("[v0] Error converting file to base64:", error)
      throw new Error(`Failed to process file: ${error.message}`)
    }
  }

  private extractInformationAdvanced(text: string): ExtractedResumeData {
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)

    console.log("[v0] Processing text with", lines.length, "lines")

    const extractedData = {
      name: this.extractName(text),
      email: this.extractEmail(text),
      phone: this.extractPhoneEnhanced(text), // Use enhanced phone extraction
      location: this.extractLocationAdvanced(text),
      skills: this.extractSkillsAdvanced(text),
      experience: this.extractExperienceAdvanced(text),
      education: this.extractEducationAdvanced(text),
      summary: this.createSummaryAdvanced(text),
      rawText: text, // Store raw text for OCR transcript display
    }

    if (!extractedData.name || extractedData.name === "Name Not Found" || extractedData.name === "Contact Details") {
      console.log("[v0] Primary name extraction failed, trying fallback methods")
      extractedData.name = this.extractNameMultipleStrategies(text, lines) || "Resume Applicant"
    }

    if (!extractedData.email) {
      console.log("[v0] No email found, using placeholder for processing")
      extractedData.email = ""
    }

    if (extractedData.skills.length === 0) {
      // Extract any capitalized words that might be skills
      extractedData.skills = this.extractSkillsFallback(text)
    }

    console.log("[v0] Final extracted data:", {
      name: extractedData.name,
      email: extractedData.email,
      phone: extractedData.phone,
      location: extractedData.location,
      skillsCount: extractedData.skills.length,
      experience: extractedData.experience,
      education: extractedData.education,
    })

    return extractedData
  }

  private extractName(text: string): string {
    console.log("[v0] Starting enhanced name extraction")

    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
    const candidates: Array<{ name: string; score: number; line: number }> = []

    for (let i = 0; i < Math.min(lines.length, 10); i++) {
      const line = lines[i]

      // Skip lines that are clearly not names
      if (this.isDefinitelyNotName(line)) {
        continue
      }

      const words = line.split(/\s+/).filter((word) => word.length > 1)

      for (let j = 0; j < words.length - 1; j++) {
        const firstName = words[j].toLowerCase().replace(/[^a-z]/g, "")
        const lastName = words[j + 1].toLowerCase().replace(/[^a-z]/g, "")

        if (firstName.length < 2 || lastName.length < 2) continue

        const fullName = `${words[j]} ${words[j + 1]}`
        let score = 0

        // Positive scoring for actual names
        if (this.COMMON_FIRST_NAMES.has(firstName)) score += 50
        if (this.COMMON_LAST_NAMES.has(lastName)) score += 50

        // Bonus for proper capitalization
        if (words[j][0] === words[j][0].toUpperCase() && words[j + 1][0] === words[j + 1][0].toUpperCase()) {
          score += 20
        }

        // Bonus for being early in document
        score += Math.max(0, 20 - i * 2)

        // Heavy penalties for non-names
        if (this.CITIES_COUNTRIES.has(firstName) || this.CITIES_COUNTRIES.has(lastName)) score -= 100
        if (this.JOB_TITLES.has(fullName.toLowerCase())) score -= 100
        if (this.CITIES_COUNTRIES.has(fullName.toLowerCase())) score -= 100

        // Penalty for common resume words
        const resumeWords = [
          "contact",
          "details",
          "information",
          "resume",
          "curriculum",
          "vitae",
          "objective",
          "summary",
        ]
        if (resumeWords.some((word) => firstName.includes(word) || lastName.includes(word))) {
          score -= 80
        }

        // Only consider candidates with positive scores
        if (score > 0) {
          candidates.push({ name: fullName, score, line: i })
        }
      }
    }

    // Sort by score and return best candidate
    candidates.sort((a, b) => b.score - a.score)

    if (candidates.length > 0) {
      console.log("[v0] Best name candidate:", candidates[0].name, "Score:", candidates[0].score)
      return candidates[0].name
    }

    // Fallback: look for any properly capitalized two-word combination
    for (const line of lines.slice(0, 5)) {
      const words = line.split(/\s+/).filter((word) => word.length > 1)
      if (words.length >= 2) {
        const firstName = words[0]
        const lastName = words[1]

        if (
          firstName[0] === firstName[0].toUpperCase() &&
          lastName[0] === lastName[0].toUpperCase() &&
          !this.isDefinitelyNotName(`${firstName} ${lastName}`)
        ) {
          console.log("[v0] Fallback name found:", `${firstName} ${lastName}`)
          return `${firstName} ${lastName}`
        }
      }
    }

    console.log("[v0] No valid name found, using fallback")
    return "Name Not Found"
  }

  private isDefinitelyNotName(text: string): boolean {
    const lower = text.toLowerCase().trim()

    // Check against job titles, cities, and common non-name phrases
    if (this.JOB_TITLES.has(lower)) return true
    if (this.CITIES_COUNTRIES.has(lower)) return true

    // Common resume section headers
    const sectionHeaders = [
      "contact details",
      "personal information",
      "resume",
      "curriculum vitae",
      "objective",
      "summary",
      "experience",
      "education",
      "skills",
      "references",
      "qualifications",
      "profile",
      "about",
      "background",
      "career",
      "employment",
      "work history",
      "professional experience",
      "academic background",
    ]

    if (sectionHeaders.some((header) => lower.includes(header))) return true

    // Email patterns
    if (lower.includes("@") || lower.includes(".com") || lower.includes(".org")) return true

    // Phone patterns
    if (/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(text)) return true

    // Address patterns
    if (/\d+\s+\w+\s+(street|st|avenue|ave|road|rd|drive|dr|lane|ln|blvd|boulevard)/i.test(text)) return true

    return false
  }

  private extractNameAdvanced(lines: string[], text: string): string {
    // Score-based name detection
    const candidates: Array<{ name: string; score: number }> = []

    // Check first 10 lines for potential names
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      const line = lines[i].trim()

      // Skip obvious non-names
      if (this.isObviouslyNotName(line)) continue

      // Extract potential names from line
      const nameMatches = line.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/g) || []

      for (const match of nameMatches) {
        const score = this.calculateNameScore(match, i, text)
        if (score > 0) {
          candidates.push({ name: match, score })
        }
      }
    }

    // Sort by score and return best candidate
    candidates.sort((a, b) => b.score - a.score)
    return candidates.length > 0 ? candidates[0].name : "Name Not Found"
  }

  private isObviouslyNotName(line: string): boolean {
    const lowerLine = line.toLowerCase()

    // Skip lines that are clearly not names
    const nonNamePatterns = [
      /^(resume|cv|curriculum vitae|profile|summary|objective|experience|education|skills|contact|phone|email|address|references|certifications?|projects?|achievements?|awards?|languages?|interests?|hobbies?)$/i,
      /^(kitchen helper|chef|cook|manager|assistant|supervisor|director|coordinator|specialist|analyst|developer|engineer|designer|consultant|administrator|executive|officer|representative|associate|intern|trainee|server|waiter|waitress|bartender|host|hostess|cashier|sales|marketing|hr|human resources|accounting|finance|it|information technology|customer service|operations|logistics|maintenance|security|receptionist|secretary|administrative|clerical|data entry|quality assurance|qa|project manager|team lead|senior|junior|lead|principal|vice president|vp|ceo|cfo|cto|coo|president|founder|owner|partner|contractor|freelancer|consultant|advisor|board member|volunteer|student|graduate|undergraduate|intern|trainee|apprentice|entry level|experienced|professional|expert|specialist|generalist|multi-skilled|cross-functional|bilingual|multilingual|certified|licensed|registered|accredited|qualified|skilled|experienced|seasoned|veteran|senior level|mid level|entry level|junior level|associate level|manager level|director level|executive level|c-level|upper management|middle management|lower management|non-management|individual contributor|team player|self-starter|motivated|driven|results-oriented|goal-oriented|detail-oriented|customer-focused|client-focused|service-oriented|quality-focused|safety-conscious|cost-effective|efficient|productive|innovative|creative|analytical|strategic|tactical|operational|technical|non-technical|hands-on|leadership|management|supervisory|mentoring|coaching|training|teaching|presenting|public speaking|communication|interpersonal|organizational|time management|multitasking|prioritization|problem-solving|troubleshooting|decision-making|critical thinking|analytical thinking|strategic thinking|creative thinking|outside-the-box thinking|innovative thinking|collaborative|team-oriented|independent|self-motivated|proactive|reactive|flexible|adaptable|versatile|reliable|dependable|trustworthy|honest|ethical|professional|courteous|friendly|outgoing|personable|approachable|patient|calm|composed|confident|assertive|diplomatic|tactful|discreet|confidential|loyal|committed|dedicated|passionate|enthusiastic|energetic|dynamic|ambitious|career-focused|growth-oriented|learning-oriented|continuous improvement|best practices|industry standards|regulatory compliance|policy adherence|procedure following|protocol compliance|safety standards|quality standards|performance standards|productivity standards|efficiency standards|customer satisfaction|client satisfaction|stakeholder satisfaction|employee satisfaction|team satisfaction|organizational satisfaction|company satisfaction|business satisfaction|operational excellence|service excellence|quality excellence|performance excellence|leadership excellence|management excellence|technical excellence|professional excellence|personal excellence|continuous excellence|sustainable excellence|measurable excellence|demonstrable excellence|proven excellence|recognized excellence|awarded excellence|certified excellence|accredited excellence|licensed excellence|registered excellence|qualified excellence|experienced excellence|seasoned excellence|veteran excellence|expert excellence|specialist excellence|generalist excellence|multi-skilled excellence|cross-functional excellence|bilingual excellence|multilingual excellence)$/i,
      /^(new york|los angeles|chicago|houston|phoenix|philadelphia|san antonio|san diego|dallas|san jose|austin|jacksonville|fort worth|columbus|charlotte|san francisco|indianapolis|seattle|denver|washington|boston|el paso|detroit|nashville|portland|oklahoma city|las vegas|baltimore|louisville|milwaukee|albuquerque|tucson|fresno|sacramento|mesa|kansas city|atlanta|long beach|colorado springs|raleigh|miami|virginia beach|omaha|oakland|minneapolis|tulsa|cleveland|wichita|arlington|new orleans|bakersfield|tampa|honolulu|aurora|anaheim|santa ana|st. louis|riverside|corpus christi|lexington|pittsburgh|anchorage|stockton|cincinnati|saint paul|toledo|newark|greensboro|plano|henderson|lincoln|buffalo|jersey city|chula vista|fort wayne|orlando|st. petersburg|chandler|laredo|norfolk|durham|madison|lubbock|irvine|winston-salem|glendale|garland|hialeah|chesapeake|gilbert|baton rouge|irving|scottsdale|north las vegas|fremont|boise|richmond|san bernardino|birmingham|spokane|rochester|des moines|modesto|fayetteville|tacoma|oxnard|fontana|columbus|montgomery|moreno valley|shreveport|aurora|yonkers|akron|huntington beach|little rock|augusta|amarillo|glendale|mobile|grand rapids|salt lake city|tallahassee|huntsville|grand prairie|knoxville|worcester|newport news|brownsville|overland park|santa clarita|providence|garden grove|chattanooga|oceanside|jackson|fort lauderdale|santa rosa|rancho cucamonga|port st. lucie|tempe|ontario|vancouver|cape coral|sioux falls|springfield|peoria|pembroke pines|elk grove|salem|lancaster|corona|eugene|palmdale|salinas|springfield|pasadena|fort collins|hayward|pomona|cary|rockford|alexandria|escondido|mckinney|kansas city|joliet|sunnyvale|torrance|bridgeport|lakewood|hollywood|paterson|naperville|syracuse|mesquite|dayton|savannah|clarksville|orange|pasadena|fullerton|killeen|frisco|hampton|mcallen|warren|west valley city|columbia|olathe|sterling heights|new haven|miramar|waco|thousand oaks|cedar rapids|charleston|sioux city|round rock|fargo|carrollton|roseville|concord|thornton|visalia|beaumont|gainesville|simi valley|denton|green bay|lowell|pueblo|wichita falls|murfreesboro|lafayette|norwalk|bellingham|westminster|ventura|ann arbor|high point|hemet|west jordan|lakeland|nashua|midland|daly city|boulder|west palm beach|mckinney|clearwater|cambridge|billings|west covina|richmond|pearland|richardson|murrieta|antioch|temecula|inglewood|miami gardens|bloomington|santa maria|victorville|rialto|carson|santa monica|colton|college station|clovis|sandy springs|league city|tyler|sandy|sunrise|edinburg|el monte|carmel|tuscaloosa|roswell|clinton|vacaville|davie|laguna niguel|milpitas|upland|westland|cumming|norwalk|carlsbad|plantation|hammond|alpharetta|pompano beach|springfield|boynton beach|missouri city|vallejo|new bedford|quincy|brockton|roanoke|santa clara|lynn|lakewood|gary|lawrence|fort smith|evansville|independence|provo|athens|peoria|huntsville|reading|davenport|arvada|miami beach|troy|westminster|bloomington|dearborn|racine|yuma|burbank|fishers|ann arbor|richardson|pueblo west|broken arrow|sandy|renton|jurupa valley|compton|san mateo|las cruces|south bend)$/i,
      /^d+/g, // Lines starting with numbers
      /^[^a-zA-Z]/, // Lines not starting with letters
      /^.{1,2}$/, // Very short lines
      /^.{50,}$/, // Very long lines
      /@/, // Contains @ (likely email)
      /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/, // Contains phone number
      /^(monday|tuesday|wednesday|thursday|friday|saturday|sunday|january|february|march|april|may|june|july|august|september|october|november|december)$/i,
      /^(www\.|http|https)/i, // URLs
      /^(mr\.|mrs\.|ms\.|dr\.|prof\.)/i, // Titles only
    ]

    return nonNamePatterns.some((pattern) => pattern.test(line))
  }

  private calculateNameScore(name: string, lineIndex: number, fullText: string): number {
    let score = 0

    // Penalize obvious job titles and locations heavily
    const jobTitles =
      /^(kitchen helper|chef|cook|manager|assistant|supervisor|director|coordinator|specialist|analyst|developer|engineer|designer|consultant|administrator|executive|officer|representative|associate|intern|trainee|server|waiter|waitress|bartender|host|hostess|cashier|sales|marketing|hr|human resources|accounting|finance|it|information technology|customer service|operations|logistics|maintenance|security|receptionist|secretary|administrative|clerical|data entry|quality assurance|qa|project manager|team lead|senior|junior|lead|principal|vice president|vp|ceo|cfo|cto|coo|president|founder|owner|partner|contractor|freelancer|consultant|advisor|board member|volunteer|student|graduate|undergraduate|intern|trainee|apprentice|entry level|experienced|professional|expert|specialist|generalist|multi-skilled|cross-functional|bilingual|multilingual|certified|licensed|registered|accredited|qualified|skilled|experienced|seasoned|veteran|senior level|mid level|entry level|junior level|associate level|manager level|director level|executive level|c-level|upper management|middle management|lower management|non-management|individual contributor|team player|self-starter|motivated|driven|results-oriented|goal-oriented|detail-oriented|customer-focused|client-focused|service-oriented|quality-focused|safety-conscious|cost-effective|efficient|productive|innovative|creative|analytical|strategic|tactical|operational|technical|non-technical|hands-on|leadership|management|supervisory|mentoring|coaching|training|teaching|presenting|public speaking|communication|interpersonal|organizational|time management|multitasking|prioritization|problem-solving|troubleshooting|decision-making|critical thinking|analytical thinking|strategic thinking|creative thinking|outside-the-box thinking|innovative thinking|collaborative|team-oriented|independent|self-motivated|proactive|reactive|flexible|adaptable|versatile|reliable|dependable|trustworthy|honest|ethical|professional|courteous|friendly|outgoing|personable|approachable|patient|calm|composed|confident|assertive|diplomatic|tactful|discreet|confidential|loyal|committed|dedicated|passionate|enthusiastic|energetic|dynamic|ambitious|career-focused|growth-oriented|learning-oriented|continuous improvement|best practices|industry standards|regulatory compliance|policy adherence|procedure following|protocol compliance|safety standards|quality standards|performance standards|productivity standards|efficiency standards|customer satisfaction|client satisfaction|stakeholder satisfaction|employee satisfaction|team satisfaction|organizational satisfaction|company satisfaction|business satisfaction|operational excellence|service excellence|quality excellence|performance excellence|leadership excellence|management excellence|technical excellence|professional excellence|personal excellence|continuous excellence|sustainable excellence|measurable excellence|demonstrable excellence|proven excellence|recognized excellence|awarded excellence|certified excellence|accredited excellence|licensed excellence|registered excellence|qualified excellence|experienced excellence|seasoned excellence|veteran excellence|expert excellence|specialist excellence|generalist excellence|multi-skilled excellence|cross-functional excellence|bilingual excellence|multilingual excellence)$/i

    const locations =
      /^(new york|los angeles|chicago|houston|phoenix|philadelphia|san antonio|san diego|dallas|san jose|austin|jacksonville|fort worth|columbus|charlotte|san francisco|indianapolis|seattle|denver|washington|boston|el paso|detroit|nashville|portland|oklahoma city|las vegas|baltimore|louisville|milwaukee|albuquerque|tucson|fresno|sacramento|mesa|kansas city|atlanta|long beach|colorado springs|raleigh|miami|virginia beach|omaha|oakland|minneapolis|tulsa|cleveland|wichita|arlington|new orleans|bakersfield|tampa|honolulu|aurora|anaheim|santa ana|st. louis|riverside|corpus christi|lexington|pittsburgh|anchorage|stockton|cincinnati|saint paul|toledo|newark|greensboro|plano|henderson|lincoln|buffalo|jersey city|chula vista|fort wayne|orlando|st. petersburg|chandler|laredo|norfolk|durham|madison|lubbock|irvine|winston-salem|glendale|garland|hialeah|chesapeake|gilbert|baton rouge|irving|scottsdale|north las vegas|fremont|boise|richmond|san bernardino|birmingham|spokane|rochester|des moines|modesto|fayetteville|tacoma|oxnard|fontana|columbus|montgomery|moreno valley|shreveport|aurora|yonkers|akron|huntington beach|little rock|augusta|amarillo|glendale|mobile|grand rapids|salt lake city|tallahassee|huntsville|grand prairie|knoxville|worcester|newport news|brownsville|overland park|santa clarita|providence|garden grove|chattanooga|oceanside|jackson|fort lauderdale|santa rosa|rancho cucamonga|port st. lucie|tempe|ontario|vancouver|cape coral|sioux falls|springfield|peoria|pembroke pines|elk grove|salem|lancaster|corona|eugene|palmdale|salinas|springfield|pasadena|fort collins|hayward|pomona|cary|rockford|alexandria|escondido|mckinney|kansas city|joliet|sunnyvale|torrance|bridgeport|lakewood|hollywood|paterson|naperville|syracuse|mesquite|dayton|savannah|clarksville|orange|pasadena|fullerton|killeen|frisco|hampton|mcallen|warren|west valley city|columbia|olathe|sterling heights|new haven|miramar|waco|thousand oaks|cedar rapids|charleston|sioux city|round rock|fargo|carrollton|roseville|concord|thornton|visalia|beaumont|gainesville|simi valley|denton|green bay|lowell|pueblo|wichita falls|murfreesboro|lafayette|norwalk|bellingham|westminster|ventura|ann arbor|high point|hemet|west jordan|lakeland|nashua|midland|daly city|boulder|west palm beach|mckinney|clearwater|cambridge|billings|west covina|richmond|pearland|richardson|murrieta|antioch|temecula|inglewood|miami gardens|bloomington|santa maria|victorville|rialto|carson|santa monica|colton|college station|clovis|sandy springs|league city|tyler|sandy|sunrise|edinburg|el monte|carmel|tuscaloosa|roswell|clinton|vacaville|davie|laguna niguel|milpitas|upland|westland|cumming|norwalk|carlsbad|plantation|hammond|alpharetta|california|texas|florida|new york|pennsylvania|illinois|ohio|georgia|north carolina|michigan|new jersey|virginia|washington|arizona|massachusetts|tennessee|indiana|missouri|maryland|wisconsin|colorado|minnesota|south carolina|alabama|louisiana|kentucky|oregon|oklahoma|connecticut|utah|iowa|nevada|arkansas|mississippi|kansas|new mexico|nebraska|west virginia|idaho|hawaii|new hampshire|maine|montana|rhode island|delaware|south dakota|north dakota|alaska|vermont|wyoming|ca|tx|fl|ny|pa|il|oh|ga|nc|mi|nj|va|wa|az|ma|tn|in|mo|md|wi|co|mn|sc|al|la|ky|or|ok|ct|ut|ia|nv|ar|ms|ks|nm|ne|wv|id|hi|nh|me|mt|ri|de|sd|nd|ak|vt|wy|united states|usa|america|canada|mexico|uk|united kingdom|england|scotland|wales|ireland|france|germany|italy|spain|portugal|netherlands|belgium|switzerland|austria|sweden|norway|denmark|finland|poland|czech republic|hungary|romania|bulgaria|greece|turkey|russia|ukraine|belarus|lithuania|latvia|estonia|croatia|serbia|bosnia|montenegro|macedonia|albania|slovenia|slovakia|moldova|georgia|armenia|azerbaijan|kazakhstan|uzbekistan|turkmenistan|kyrgyzstan|tajikistan|afghanistan|pakistan|india|bangladesh|sri lanka|nepal|bhutan|maldives|myanmar|thailand|laos|cambodia|vietnam|malaysia|singapore|brunei|indonesia|philippines|china|japan|south korea|north korea|mongolia|taiwan|hong kong|macau|australia|new zealand|fiji|papua new guinea|solomon islands|vanuatu|new caledonia|samoa|tonga|kiribati|tuvalu|nauru|palau|marshall islands|micronesia|guam|northern mariana islands|cook islands|niue|tokelau|wallis and futuna|french polynesia|pitcairn islands|easter island|antarctica)$/i

    if (jobTitles.test(name.toLowerCase()) || locations.test(name.toLowerCase())) {
      return -100 // Heavy penalty for job titles and locations
    }

    // Basic name structure (2-3 words, proper capitalization)
    const words = name.split(/\s+/)
    if (words.length >= 2 && words.length <= 3) {
      score += 50
    }

    // Proper capitalization
    if (words.every((word) => /^[A-Z][a-z]+$/.test(word))) {
      score += 30
    }

    // Position bonus (earlier lines more likely to be names)
    if (lineIndex === 0) score += 40
    else if (lineIndex === 1) score += 30
    else if (lineIndex <= 3) score += 20
    else if (lineIndex <= 5) score += 10

    // Length bonus (reasonable name length)
    if (name.length >= 4 && name.length <= 30) {
      score += 20
    }

    // Penalty for common non-name patterns
    if (/\d/.test(name)) score -= 30 // Contains numbers
    if (/@/.test(name)) score -= 50 // Contains @
    if (/[^a-zA-Z\s]/.test(name)) score -= 20 // Contains special chars

    return score
  }

  private extractNameMultipleStrategies(text: string, lines: string[]): string {
    console.log("[v0] Trying multiple name extraction strategies")

    // Strategy 1: Look for name patterns in first few lines
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i].trim()

      // Skip lines that are obviously not names
      if (this.isObviouslyNotName(line)) continue

      // Look for 2-3 capitalized words
      const namePattern = /\b[A-Z][a-z]{1,15}(?:\s+[A-Z][a-z]{1,15}){1,2}\b/g
      const match = line.match(namePattern)

      if (match && !this.containsCommonNonNameWords(match[0])) {
        console.log("[v0] Found name using strategy 1:", match[0])
        return match[0]
      }
    }

    // Strategy 2: Look for names after common headers
    const nameHeaders = ["name:", "applicant:", "candidate:", "full name:"]
    for (const header of nameHeaders) {
      const headerIndex = text.toLowerCase().indexOf(header)
      if (headerIndex !== -1) {
        const afterHeader = text.substring(headerIndex + header.length, headerIndex + header.length + 100)
        const nameMatch = afterHeader.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/)
        if (nameMatch && !this.containsCommonNonNameWords(nameMatch[0])) {
          console.log("[v0] Found name using strategy 2:", nameMatch[0])
          return nameMatch[0]
        }
      }
    }

    // Strategy 3: Look for capitalized words that appear to be names
    const words = text.split(/\s+/)
    const capitalizedWords = words.filter((word) => /^[A-Z][a-z]{2,}$/.test(word))

    if (capitalizedWords.length >= 2) {
      const potentialName = capitalizedWords.slice(0, 2).join(" ")
      if (!this.containsCommonNonNameWords(potentialName)) {
        console.log("[v0] Found name using strategy 3:", potentialName)
        return potentialName
      }
    }

    console.log("[v0] All name extraction strategies failed")
    return ""
  }

  private containsCommonNonNameWords(text: string): boolean {
    const nonNameWords = [
      "resume",
      "cv",
      "curriculum",
      "vitae",
      "profile",
      "summary",
      "objective",
      "experience",
      "education",
      "skills",
      "contact",
      "phone",
      "email",
      "address",
      "references",
      "certifications",
      "projects",
      "achievements",
      "awards",
      "languages",
      "interests",
      "hobbies",
      "kitchen",
      "helper",
      "chef",
      "cook",
      "manager",
      "assistant",
      "supervisor",
      "director",
      "coordinator",
      "specialist",
      "analyst",
      "developer",
      "engineer",
      "designer",
      "consultant",
      "administrator",
      "executive",
      "officer",
      "representative",
      "associate",
      "intern",
      "trainee",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december",
      "street",
      "avenue",
      "road",
      "drive",
      "lane",
      "court",
      "place",
      "boulevard",
      "way",
      "circle",
      "square",
      "plaza",
      "university",
      "college",
      "school",
      "institute",
      "academy",
      "center",
      "department",
      "faculty",
      "program",
      "degree",
      "bachelor",
      "master",
      "phd",
      "doctorate",
      "company",
      "corporation",
      "inc",
      "llc",
      "ltd",
      "organization",
      "business",
      "enterprise",
      "firm",
      "agency",
      "group",
      "team",
      "department",
      "division",
      "unit",
      "branch",
      "office",
      "contact",
      "details",
      "information",
      "data",
      "personal",
      "professional",
      "work",
      "home",
      "mobile",
      "cell",
      "telephone",
      "fax",
    ]

    const lowerText = text.toLowerCase()
    return nonNameWords.some((word) => lowerText.includes(word))
  }

  private extractPhoneEnhanced(text: string): string {
    console.log("[v0] Starting enhanced phone extraction")

    // Extract all sequences of digits, spaces, dashes, dots, and parentheses
    const phonePattern = /[\d\s\-.$()]+/g
    const matches = text.match(phonePattern) || []

    for (const match of matches) {
      // Remove all non-digit characters to count digits
      const digitsOnly = match.replace(/\D/g, "")

      // Check for valid phone number lengths
      if (digitsOnly.length === 10) {
        // Format as (XXX) XXX-XXXX
        return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`
      } else if (digitsOnly.length === 11 && digitsOnly.startsWith("1")) {
        // Format as +1 (XXX) XXX-XXXX
        return `+1 (${digitsOnly.slice(1, 4)}) ${digitsOnly.slice(4, 7)}-${digitsOnly.slice(7)}`
      }
    }

    console.log("[v0] No valid phone number found")
    return ""
  }

  private extractLocationAdvanced(text: string): string {
    const locationPatterns = [
      /([A-Z][a-z]+(?:,\s*[A-Z]{2})?(?:\s+\d{5})?)/g, // City, ST ZIP or City, ST or City
      /([A-Z][a-z]+,\s*[A-Z][a-z]+)/g, // City, State/Country
      /([A-Z][a-z]+\s+[A-Z][a-z]+,\s*[A-Z]{2})/g, // City Name, ST
    ]

    // Combine patterns for better matching
    const allPatterns = locationPatterns.flatMap((pattern) => {
      const matches = text.match(pattern) || []
      return matches.map((match) => match.trim())
    })

    // Filter out obvious non-locations and common words
    const potentialLocations = allPatterns.filter((loc) =>
      this.LOCATION_INDICATORS.some((indicator) => loc.toLowerCase().includes(indicator)),
    )

    // Deduplicate and return the first valid location found
    const uniqueLocations = Array.from(new Set(potentialLocations))
    return uniqueLocations.length > 0 ? uniqueLocations[0] : ""
  }

  private extractSkillsAdvanced(text: string): string[] {
    const skillCategories = {
      programming: [
        "javascript",
        "python",
        "java",
        "react",
        "node",
        "typescript",
        "angular",
        "vue",
        "php",
        "c++",
        "c#",
        "ruby",
        "go",
        "swift",
        "kotlin",
        "html",
        "css",
        "sass",
        "bootstrap",
      ],
      databases: ["sql", "mysql", "postgresql", "mongodb", "redis", "elasticsearch", "oracle", "sqlite"],
      cloud: ["aws", "azure", "gcp", "docker", "kubernetes", "jenkins", "terraform", "git"],
      office: ["microsoft office", "excel", "word", "powerpoint", "outlook", "google sheets", "google docs"],
      soft: [
        "leadership",
        "management",
        "communication",
        "teamwork",
        "problem solving",
        "analytical",
        "creative",
        "customer service",
        "sales",
        "marketing",
        "project management",
        "time management",
      ],
      culinary: [
        "cooking",
        "baking",
        "food preparation",
        "kitchen management",
        "menu planning",
        "food safety",
        "culinary arts",
        "pastry",
        "grilling",
        "sautéing",
        "food service",
      ],
      healthcare: ["nursing", "medical", "patient care", "healthcare", "clinical", "pharmacy", "therapy"],
      education: ["teaching", "tutoring", "curriculum", "classroom management", "educational", "training"],
      finance: ["accounting", "bookkeeping", "financial analysis", "budgeting", "tax preparation", "auditing"],
      retail: ["retail", "cashier", "inventory", "merchandising", "point of sale", "pos", "customer service"],
    }

    const foundSkills: string[] = []
    const lowerText = text.toLowerCase()

    Object.values(skillCategories)
      .flat()
      .forEach((skill) => {
        if (lowerText.includes(skill.toLowerCase())) {
          const formattedSkill = skill
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")
          if (!foundSkills.includes(formattedSkill)) {
            foundSkills.push(formattedSkill)
          }
        }
      })

    return foundSkills
  }

  private extractExperienceAdvanced(text: string): string {
    const expPatterns = [
      /(\d+)\+?\s*years?\s*(?:of\s*)?(?:experience|exp)/i,
      /experience[:\s]*(\d+)\+?\s*years?/i,
      /(\d+)\+?\s*yrs?\s*(?:of\s*)?(?:exp|experience)/i,
    ]

    for (const pattern of expPatterns) {
      const match = text.match(pattern)
      if (match) {
        return `${match[1]} years`
      }
    }

    // Count job positions with dates
    const jobCount = (text.match(/\b(20\d{2})\s*[-–]\s*(20\d{2}|present|current)/gi) || []).length
    if (jobCount > 0) {
      const estimatedYears = Math.max(1, jobCount * 2)
      return `${estimatedYears} years (estimated)`
    }

    return "Not specified"
  }

  private extractEducationAdvanced(text: string): string {
    const educationPatterns = [
      /(bachelor'?s?\s+(?:of\s+)?(?:science|arts|engineering|business)?)/i,
      /(master'?s?\s+(?:of\s+)?(?:science|arts|engineering|business)?)/i,
      /(phd|doctorate|doctoral)/i,
      /(associate'?s?\s+degree)/i,
      /(high\s+school|diploma)/i,
    ]

    for (const pattern of educationPatterns) {
      const match = text.match(pattern)
      if (match) {
        return match[1]
      }
    }

    const educationKeywords = ["university", "college", "institute", "school", "graduated", "degree"]
    const lines = text.split("\n")

    for (const line of lines) {
      const lowerLine = line.toLowerCase()
      if (educationKeywords.some((keyword) => lowerLine.includes(keyword)) && line.length < 100) {
        return line.trim()
      }
    }

    return "Not specified"
  }

  private createSummaryAdvanced(text: string): string {
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 20)

    // Look for existing summary/objective sections
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase()
      if (line.includes("summary") || line.includes("objective") || line.includes("profile")) {
        if (i + 1 < lines.length) {
          const summaryLine = lines[i + 1]
          if (summaryLine.length > 50 && summaryLine.length < 300) {
            return summaryLine
          }
        }
      }
    }

    // Generate summary from content
    const skills = this.extractSkillsAdvanced(text)
    const experience = this.extractExperienceAdvanced(text)
    const skillsText = skills.length > 0 ? skills.slice(0, 5).join(", ") : "various skills"

    return `Professional with ${experience} of experience. Key competencies include: ${skillsText}.`
  }

  private async extractFromTextFile(file: File): Promise<ExtractedResumeData> {
    try {
      console.log("[v0] Processing plain text file:", file.name)
      const text = await file.text()
      return this.extractInformationAdvanced(text)
    } catch (error) {
      console.error("[v0] Text file extraction error:", error)
      throw new Error(`Failed to extract text file data: ${error.message}`)
    }
  }

  private async extractFromDocumentFile(file: File): Promise<ExtractedResumeData> {
    try {
      console.log("[v0] Processing document file:", file.name)

      // Read file as array buffer and extract readable text
      const arrayBuffer = await file.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)

      // Convert to string and extract readable characters
      let extractedText = ""
      for (let i = 0; i < uint8Array.length; i++) {
        const char = uint8Array[i]
        // Include printable ASCII characters and common extended characters
        if ((char >= 32 && char <= 126) || char === 10 || char === 13 || (char >= 160 && char <= 255)) {
          extractedText += String.fromCharCode(char)
        } else if (char === 0) {
          // Skip null bytes but add space for word separation
          if (extractedText[extractedText.length - 1] !== " ") {
            extractedText += " "
          }
        }
      }

      // Clean up the extracted text
      extractedText = extractedText
        .replace(/\s+/g, " ") // Replace multiple spaces with single space
        .replace(/[^\x20-\x7E\n\r]/g, " ") // Replace non-printable chars with space
        .trim()

      console.log("[v0] Extracted text length from document:", extractedText.length)
      console.log("[v0] First 200 chars:", extractedText.substring(0, 200))

      if (extractedText.length < 50) {
        throw new Error("Document appears to be empty or unreadable. Please try uploading as PDF or image format.")
      }

      return this.extractInformationAdvanced(extractedText)
    } catch (error) {
      console.error("[v0] Document file extraction error:", error)
      throw new Error(`Failed to extract document data: ${error.message}. Please try uploading as PDF or image format.`)
    }
  }

  private extractEmail(text: string): string {
    const emailPattern = /([a-zA-Z0-9._%+-]+)@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
    const matches = text.match(emailPattern)
    return matches ? matches[0] : ""
  }

  private extractSkillsFallback(text: string): string[] {
    // A very basic fallback to capture capitalized words that might be skills
    const words = text.split(/\s+/).filter((word) => word.length > 1)
    const potentialSkills = words.filter(
      (word) =>
        word.length > 2 &&
        word[0] === word[0].toUpperCase() &&
        word.toLowerCase() === word.replace(/[^a-z]/g, "").toLowerCase() && // Ensure it's mostly alphabetic
        !this.isDefinitelyNotName(word) && // Not a name
        !this.CITIES_COUNTRIES.has(word.toLowerCase()) && // Not a city/country
        !this.JOB_TITLES.has(word.toLowerCase()), // Not a job title
    )
    return Array.from(new Set(potentialSkills)) // Return unique skills
  }
}

export const advancedOCRService = new AdvancedOCRService()
