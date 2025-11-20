import { z } from 'zod'
import pdf from 'pdf-parse'

const resumeDataSchema = z.object({
  applicant_name: z.string().describe('Full name of the applicant'),
  applicant_email: z.string().email().optional().describe('Email address'),
  applicant_phone: z.string().optional().describe('Phone number - DISABLED'),
  applicant_city: z.string().optional().describe('City or location'),
  resume_summary: z.string().optional().describe('Brief professional summary or objective'),
  key_skills: z.array(z.string()).optional().describe('List of technical and professional skills'),
  experience_years: z.number().optional().describe('Total years of work experience'),
  education_level: z.string().optional().describe('Highest education level'),
  certifications: z.array(z.string()).optional().describe('Professional certifications'),
  raw_text: z.string().describe('Complete text content extracted from the document'),
})

type ResumeData = z.infer<typeof resumeDataSchema>

export class AIResumeParser {
  /**
   * Parse resume from file using AI - Direct xAI API call
   */
  async parseFromFile(file: File): Promise<ResumeData> {
    console.log('[v0] AI Resume Parser: Starting to parse file:', file.name)
    console.log('[v0] File details:', {
      name: file.name,
      size: file.size,
      type: file.type,
    })

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      throw new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB (max 10MB)`)
    }

    // Validate file type
    const supportedImageTypes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/gif',
      'image/webp',
    ]

    const supportedDocTypes = [
      'application/pdf',
      'text/plain',
    ]

    const isImage = supportedImageTypes.includes(file.type)
    const isDoc = supportedDocTypes.includes(file.type)

    if (!isImage && !isDoc) {
      throw new Error(
        `Unsupported file type: ${file.type}. Please use PDF, PNG, JPG, GIF, WEBP, or TXT files.`
      )
    }

    try {
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      
      let content: any[] = []
      const systemPrompt = `You are an expert resume parser. Extract information from resumes and return it in JSON format.`
      
      let userPrompt = `Extract the following information from this resume:

1. Full name of the applicant (required)
2. Email address
3. City/location (DO NOT extract phone numbers)
4. Professional summary or objective
5. Key skills (as an array)
6. Total years of work experience (as a number)
7. Highest education level (e.g., "Bachelor's", "Master's", "PhD", "High School")
8. Professional certifications (as an array)
9. Complete text content from the document

Important guidelines:
- For name: Extract the full name, typically found at the top of the resume
- For city: Only extract the actual city name, not job titles or company names
- For skills: Extract technical and professional skills
- For experience: Calculate total years from all work experiences
- For education: Return the highest degree obtained
- For raw_text: Include all text content from the document
- DO NOT extract or include phone numbers

Return the data in this exact JSON format:
{
  "applicant_name": "string",
  "applicant_email": "string or null",
  "applicant_phone": null,
  "applicant_city": "string or null",
  "resume_summary": "string or null",
  "key_skills": ["string"] or null,
  "experience_years": number or null,
  "education_level": "string or null",
  "certifications": ["string"] or null,
  "raw_text": "string"
}

If any field is not found, return null.`

      if (file.type === 'application/pdf') {
        console.log('[v0] Extracting text from PDF...')
        try {
          const pdfData = await pdf(buffer)
          const text = pdfData.text
          console.log('[v0] PDF text extracted, length:', text.length, 'pages:', pdfData.numpages)
          
          if (!text || text.trim().length === 0) {
            throw new Error('Could not extract text from PDF. The PDF might be an image-based scan.')
          }
          
          userPrompt += `\n\nResume Text:\n${text}`
          
          content = [
            {
              type: 'text',
              text: userPrompt,
            },
          ]
        } catch (pdfError) {
          console.error('[v0] PDF extraction error:', pdfError)
          throw new Error('Failed to extract text from PDF. Please ensure the PDF contains selectable text, not just scanned images.')
        }
      } else if (file.type === 'text/plain') {
        // For text files, extract text directly
        const text = new TextDecoder().decode(arrayBuffer)
        console.log('[v0] Text file extracted, length:', text.length)
        userPrompt += `\n\nResume Text:\n${text}`
        
        content = [
          {
            type: 'text',
            text: userPrompt,
          },
        ]
      } else if (supportedImageTypes.includes(file.type)) {
        const base64Data = buffer.toString('base64')
        const dataUrl = `data:${file.type};base64,${base64Data}`
        
        content = [
          {
            type: 'text',
            text: userPrompt,
          },
          {
            type: 'image_url',
            image_url: {
              url: dataUrl,
            },
          },
        ]
      }

      console.log('[v0] Calling xAI API directly...')

      // Direct xAI API call
      const apiKey = process.env.XAI_API_KEY
      if (!apiKey) {
        throw new Error('XAI_API_KEY not configured')
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

      try {
        const response = await fetch('https://api.x.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'grok-2-vision-1212',
            messages: [
              {
                role: 'system',
                content: systemPrompt,
              },
              {
                role: 'user',
                content,
              },
            ],
            temperature: 0.1,
            response_format: { type: 'json_object' },
          }),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          let errorText = 'Unknown error'
          try {
            errorText = await response.text()
            console.error('[v0] xAI API error response:', errorText)
          } catch (e) {
            console.error('[v0] Could not read error response')
          }
          throw new Error(`xAI API error: ${response.status} - ${errorText}`)
        }

        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
          const responseText = await response.text()
          console.error('[v0] Non-JSON response:', responseText)
          throw new Error('xAI API returned non-JSON response')
        }

        let result
        try {
          result = await response.json()
        } catch (jsonError) {
          const responseText = await response.text()
          console.error('[v0] JSON parse error. Response text:', responseText)
          throw new Error('Failed to parse xAI API response as JSON')
        }

        console.log('[v0] xAI API response received')
        console.log('[v0] Response structure:', {
          hasChoices: !!result.choices,
          choicesLength: result.choices?.length,
          hasMessage: !!result.choices?.[0]?.message,
          hasContent: !!result.choices?.[0]?.message?.content,
        })

        const messageContent = result.choices?.[0]?.message?.content
        if (!messageContent) {
          console.error('[v0] No content in response:', JSON.stringify(result, null, 2))
          throw new Error('No content in xAI API response')
        }

        let parsedData
        try {
          parsedData = JSON.parse(messageContent)
        } catch (parseError) {
          console.error('[v0] Failed to parse message content:', messageContent)
          throw new Error('AI returned invalid JSON format')
        }

        console.log('[v0] AI parsing completed successfully')
        console.log('[v0] Extracted name:', parsedData.applicant_name)
        console.log('[v0] Extracted email:', parsedData.applicant_email)
        console.log('[v0] Extracted city:', parsedData.applicant_city)

        // Validate that we got at least a name
        if (!parsedData.applicant_name || parsedData.applicant_name.trim() === '') {
          throw new Error('Failed to extract applicant name from resume')
        }

        // Return structured data
        return {
          applicant_name: parsedData.applicant_name.trim(),
          applicant_email: parsedData.applicant_email || undefined,
          applicant_phone: undefined, // Phone detection disabled
          applicant_city: parsedData.applicant_city || undefined,
          resume_summary: parsedData.resume_summary || undefined,
          key_skills: parsedData.key_skills && parsedData.key_skills.length > 0 ? parsedData.key_skills : undefined,
          experience_years: parsedData.experience_years || undefined,
          education_level: parsedData.education_level || undefined,
          certifications: parsedData.certifications && parsedData.certifications.length > 0 ? parsedData.certifications : undefined,
          raw_text: parsedData.raw_text || '',
        }
      } catch (error) {
        clearTimeout(timeoutId)
        
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('AI request timed out after 30 seconds. Please try a smaller file.')
        }
        
        throw error
      }
    } catch (error) {
      console.error('[v0] AI Resume Parser error:', error)

      if (error instanceof Error) {
        // Provide helpful error messages
        if (error.message.includes('timeout')) {
          throw new Error('AI processing timeout. Please try a smaller file or simpler format.')
        } else if (error.message.includes('rate limit')) {
          throw new Error('AI service rate limit reached. Please try again in a moment.')
        } else if (error.message.includes('model')) {
          throw new Error('AI model unavailable. Please try again later.')
        }
      }

      throw error
    }
  }
}

// Export singleton instance
export const aiResumeParser = new AIResumeParser()
