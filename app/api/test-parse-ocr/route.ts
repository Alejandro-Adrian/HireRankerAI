import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('resume') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'OCR method only supports image files (PNG, JPG, JPEG). For PDFs, use the Direct method.' },
        { status: 400 }
      )
    }

    const startTime = Date.now()

    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`

    const ocrApiKey = process.env.OCR_API_KEY
    if (!ocrApiKey) {
      return NextResponse.json({ error: 'OCR API key not configured' }, { status: 500 })
    }

    const ocrResponse = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: { 'apikey': ocrApiKey },
      body: new URLSearchParams({
        base64Image: dataUrl,
        language: 'eng',
        isOverlayRequired: 'false',
        detectOrientation: 'true',
        scale: 'true',
        OCREngine: '2',
      }),
    })

    const ocrData = await ocrResponse.json()

    if (ocrData.IsErroredOnProcessing || !ocrData.ParsedResults || ocrData.ParsedResults.length === 0) {
      return NextResponse.json({ error: 'OCR failed to extract text from image' }, { status: 500 })
    }

    const text = ocrData.ParsedResults[0].ParsedText
    const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/)
    const nameMatch = text.match(/^([A-Z][a-z]+ [A-Z][a-z]+)/m)
    
    const skillKeywords = ['JavaScript', 'TypeScript', 'Python', 'Customer Service', 'Barista', 'Coffee']
    const skills: string[] = []
    const lowerText = text.toLowerCase()
    skillKeywords.forEach(keyword => {
      if (lowerText.includes(keyword.toLowerCase())) skills.push(keyword)
    })

    const parseTime = Date.now() - startTime

    return NextResponse.json({
      success: true,
      method: 'OCR (Images Only)',
      data: {
        applicant_name: nameMatch ? nameMatch[1] : '',
        applicant_email: emailMatch ? emailMatch[0] : '',
        applicant_phone: '',
        applicant_city: '',
        skills: skills,
        experience_years: 0,
        education: '',
        raw_text: text.slice(0, 500)
      },
      parseTime,
    })

  } catch (error) {
    console.error('[v0] OCR error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'OCR processing failed' },
      { status: 500 }
    )
  }
}
