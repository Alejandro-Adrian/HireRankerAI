import { NextRequest, NextResponse } from 'next/server'
import { parseResumeWithOCR } from '@/lib/ocr-resume-parser'
import pdf from 'pdf-parse'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('resume') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const startTime = Date.now()
    console.log('[v0] Hybrid Parser - Processing file:', file.name, file.type)

    // Try pdf-parse first for PDFs
    if (file.type === 'application/pdf') {
      try {
        const buffer = Buffer.from(await file.arrayBuffer())
        const pdfData = await pdf(buffer)
        
        // Simple regex extraction
        const text = pdfData.text
        const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/)
        
        // Extract name (usually first line or near top)
        const lines = text.split('\n').filter(line => line.trim())
        const nameMatch = lines[0]?.trim()

        const parseTime = Date.now() - startTime

        return NextResponse.json({
          success: true,
          method: 'Hybrid (PDF Text + Regex)',
          data: {
            applicant_name: nameMatch || '',
            applicant_email: emailMatch?.[0] || '',
            applicant_phone: '', // Phone detection disabled
            applicant_city: '',
            skills: [],
            experience_years: 0,
            education: '',
            certifications: [],
            ai_score: 0,
            raw_text: text.substring(0, 500) + '...',
          },
          parseTime,
        })
      } catch (error) {
        console.log('[v0] PDF text extraction failed, falling back to OCR')
      }
    }

    // Fallback to OCR
    const result = await parseResumeWithOCR(file)
    const parseTime = Date.now() - startTime

    return NextResponse.json({
      success: true,
      method: 'Hybrid (OCR Fallback)',
      data: result,
      parseTime,
    })
  } catch (error) {
    console.error('[v0] Hybrid parser error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to parse with Hybrid method' },
      { status: 500 }
    )
  }
}
