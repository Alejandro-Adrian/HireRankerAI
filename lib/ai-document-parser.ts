import { generateText } from 'ai'

export interface AIExtractedResumeData {
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

export class AIDocumentParser {
  /**
   * Extract text and information from any document using AI
   */
  async parseDocument(file: File): Promise<AIExtractedResumeData> {
    try {
      console.log('[v0] AI Document Parser - Starting AI-based extraction for:', file.name, file.type)
      
      // Convert file to text or base64 depending on type
      let documentContent = ''
      const fileExtension = file.name.toLowerCase().split('.').pop() || ''
      
      if (file.type === 'text/plain' || fileExtension === 'txt') {
        // Plain text files
        documentContent = await file.text()
      } else if (file.type === 'application/pdf' || fileExtension === 'pdf') {
        // PDF files - convert to base64 and let AI handle it
        const arrayBuffer = await file.arrayBuffer()
        const base64 = Buffer.from(arrayBuffer).toString('base64')
        
        // Use AI to extract text from PDF
        console.log('[v0] Using AI to extract text from PDF...')
        const extractedText = await this.extractTextFromPDFWithAI(base64, file.name)
        documentContent = extractedText
      } else if (
        file.type === 'application/msword' ||
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        fileExtension === 'doc' ||
        fileExtension === 'docx'
      ) {
        // Word documents
        console.log('[v0] Word document detected - using AI extraction')
        const arrayBuffer = await file.arrayBuffer()
        const base64 = Buffer.from(arrayBuffer).toString('base64')
        const extractedText = await this.extractTextFromWordWithAI(base64, file.name)
        documentContent = extractedText
      } else if (file.type.startsWith('image/')) {
        // Image files
        const arrayBuffer = await file.arrayBuffer()
        const base64 = Buffer.from(arrayBuffer).toString('base64')
        const extractedText = await this.extractTextFromImageWithAI(base64, file.type)
        documentContent = extractedText
      } else {
        throw new Error(`Unsupported file format: ${fileExtension}. Supported: PDF, DOC, DOCX, TXT, PNG, JPG, GIF, WEBP`)
      }
      
      if (!documentContent || documentContent.trim().length < 10) {
        throw new Error('Could not extract meaningful content from document')
      }
      
      console.log('[v0] Document content extracted, length:', documentContent.length)
      console.log('[v0] Using AI to extract structured information...')
      
      // Use AI to extract structured information from the text
      const structuredData = await this.extractStructuredInformationWithAI(documentContent)
      
      console.log('[v0] AI extraction completed successfully')
      
      return {
        ...structuredData,
        rawText: documentContent
      }
      
    } catch (error) {
      console.error('[v0] AI document parsing error:', error)
      throw error
    }
  }
  
  /**
   * Use AI to extract text from PDF
   */
  private async extractTextFromPDFWithAI(base64: string, filename: string): Promise<string> {
    try {
      const { text } = await generateText({
        model: 'xai/grok-2-1212',
        prompt: `You are a document text extraction expert. 

I have a PDF resume/CV file (base64 encoded) that I need you to extract ALL text content from.

Please:
1. Extract ALL text content from the PDF, preserving the original structure and formatting as much as possible
2. Include names, contact information, work experience, education, skills, and any other text
3. Maintain line breaks and sections
4. Do NOT summarize or rewrite - just extract the raw text exactly as it appears

Return ONLY the extracted text, nothing else.

Filename: ${filename}

If you cannot directly process the base64 PDF, please respond with: "AI_CANNOT_PROCESS_PDF" and I will use an alternative method.`,
      })
      
      if (text.includes('AI_CANNOT_PROCESS_PDF')) {
        throw new Error('AI cannot process PDF directly - falling back to OCR')
      }
      
      return text
    } catch (error) {
      console.error('[v0] AI PDF extraction failed:', error)
      throw new Error('Failed to extract text from PDF using AI. Please try converting to PNG/JPG or use a different PDF.')
    }
  }
  
  /**
   * Use AI to extract text from Word documents
   */
  private async extractTextFromWordWithAI(base64: string, filename: string): Promise<string> {
    try {
      const { text } = await generateText({
        model: 'xai/grok-2-1212',
        prompt: `You are a document text extraction expert.

I have a Word document (DOC/DOCX) resume/CV file (base64 encoded) that I need you to extract ALL text content from.

Please:
1. Extract ALL text content from the Word document
2. Include names, contact information, work experience, education, skills, and any other text
3. Preserve structure and formatting
4. Do NOT summarize - extract the complete raw text

Return ONLY the extracted text.

Filename: ${filename}

If you cannot process this Word document, respond with: "AI_CANNOT_PROCESS_WORD"`,
      })
      
      if (text.includes('AI_CANNOT_PROCESS_WORD')) {
        throw new Error('AI cannot process Word document - please convert to PDF or image format')
      }
      
      return text
    } catch (error) {
      console.error('[v0] AI Word extraction failed:', error)
      throw new Error('Failed to extract text from Word document. Please convert to PDF or save as PNG/JPG image.')
    }
  }
  
  /**
   * Use AI to extract text from images
   */
  private async extractTextFromImageWithAI(base64: string, mimeType: string): Promise<string> {
    try {
      const { text } = await generateText({
        model: 'xai/grok-2-1212',
        prompt: `You are an OCR and document analysis expert.

I have an image of a resume/CV that I need you to extract ALL text from.

Please:
1. Read ALL visible text in the image
2. Extract names, contact info, experience, education, skills - everything
3. Maintain the document structure
4. Be thorough and complete

Return ONLY the extracted text, nothing else.

Image type: ${mimeType}
Base64 image data follows.`,
      })
      
      return text
    } catch (error) {
      console.error('[v0] AI image extraction failed:', error)
      throw new Error('Failed to extract text from image using AI')
    }
  }
  
  /**
   * Use AI to extract structured information from text
   */
  private async extractStructuredInformationWithAI(rawText: string): Promise<Omit<AIExtractedResumeData, 'rawText'>> {
    try {
      const { text } = await generateText({
        model: 'xai/grok-2-1212',
        prompt: `You are an expert resume/CV parser. Extract structured information from this resume text.

Resume Text:
${rawText}

Extract and return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{
  "name": "Full name of the applicant",
  "email": "Email address (or empty string if not found)",
  "phone": "",
  "location": "City, State/Province, Country (or empty string if not found)",
  "skills": ["skill1", "skill2", "skill3"],
  "experience": "Number of years of experience or description (or 'Not specified')",
  "education": "Highest degree or education info (or 'Not specified')",
  "summary": "A 1-2 sentence professional summary highlighting key qualifications"
}

Important:
- For name: Extract the person's full name (usually at the top). Do NOT use job titles, company names, or city names as the name.
- For location: Extract actual city names from addresses or location sections, NOT job titles or personal names
- For phone: Always leave empty string - do not extract phone numbers
- For skills: List 5-15 most relevant technical or professional skills
- For experience: Calculate years from work history dates if possible
- Return valid JSON only, no additional text`,
      })
      
      // Parse the AI response as JSON
      console.log('[v0] AI structured extraction response:', text)
      
      // Clean up the response to extract JSON
      let jsonText = text.trim()
      
      // Remove markdown code blocks if present
      if (jsonText.startsWith('\`\`\`')) {
        jsonText = jsonText.replace(/\`\`\`json\n?/g, '').replace(/\`\`\`\n?/g, '')
      }
      
      const parsed = JSON.parse(jsonText)
      
      // Validate and clean the parsed data
      return {
        name: parsed.name || 'Name Not Found',
        email: parsed.email || '',
        phone: '', // Always return empty string for phone
        location: parsed.location || '',
        skills: Array.isArray(parsed.skills) ? parsed.skills : [],
        experience: parsed.experience || 'Not specified',
        education: parsed.education || 'Not specified',
        summary: parsed.summary || 'Professional candidate'
      }
      
    } catch (error) {
      console.error('[v0] AI structured extraction failed:', error)
      console.error('[v0] Raw AI response:', error.message)
      
      // Fallback to basic extraction
      return this.fallbackExtraction(rawText)
    }
  }
  
  /**
   * Fallback extraction if AI fails
   */
  private fallbackExtraction(text: string): Omit<AIExtractedResumeData, 'rawText'> {
    const lines = text.split('\n').filter(l => l.trim())
    
    return {
      name: lines[0]?.trim() || 'Name Not Found',
      email: this.extractEmail(text),
      phone: '', // Disabled phone detection - always return empty string
      location: '',
      skills: [],
      experience: 'Not specified',
      education: 'Not specified',
      summary: 'Resume applicant'
    }
  }
  
  private extractEmail(text: string): string {
    const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/)
    return emailMatch ? emailMatch[1] : ''
  }
}

export const aiDocumentParser = new AIDocumentParser()
