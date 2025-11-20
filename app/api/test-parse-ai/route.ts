import { NextRequest, NextResponse } from 'next/server'
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
    console.log('[v0] AI Parser - Processing file:', file.name, file.type)

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())
    let textContent = ''

    // Extract text based on file type
    if (file.type === 'application/pdf') {
      const pdfData = await pdf(buffer)
      textContent = pdfData.text
    } else if (file.type.startsWith('image/')) {
      return NextResponse.json({ 
        error: 'AI vision parsing not available - please use OCR method' 
      }, { status: 400 })
    } else if (file.type === 'text/plain') {
      textContent = buffer.toString('utf-8')
    } else {
      return NextResponse.json({ 
        error: 'Unsupported file type for AI parsing' 
      }, { status: 400 })
    }

    // Call xAI API directly
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'grok-beta',
        messages: [
          {
            role: 'system',
            content: 'You are a resume parser. Extract structured information from resumes and return JSON only.',
          },
          {
            role: 'user',
            content: `Extract the following from this resume:\n\n${textContent}\n\nReturn JSON with: name, email, phone, city, skills (array), experience_years (number), education, certifications (array).`,
          },
        ],
        temperature: 0.1,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[v0] xAI API error:', response.status, errorText)
      return NextResponse.json({ 
        error: `xAI API error: ${response.status} ${errorText}` 
      }, { status: 500 })
    }

    const aiResponse = await response.json()
    const aiText = aiResponse.choices?.[0]?.message?.content || '{}'
    
    // Try to parse JSON from AI response
    let parsedData
    try {
      const jsonMatch = aiText.match(/\{[\s\S]*\}/)
      parsedData = JSON.parse(jsonMatch ? jsonMatch[0] : aiText)
    } catch {
      parsedData = { error: 'Failed to parse AI response as JSON', raw: aiText }
    }

    const parseTime = Date.now() - startTime

    return NextResponse.json({
      success: true,
      method: 'AI',
      data: {
        applicant_name: parsedData.name || '',
        applicant_email: parsedData.email || '',
        applicant_phone: parsedData.phone || '',
        applicant_city: parsedData.city || '',
        skills: parsedData.skills || [],
        experience_years: parsedData.experience_years || 0,
        education: parsedData.education || '',
        certifications: parsedData.certifications || [],
        ai_score: 0,
      },
      parseTime,
    })
  } catch (error) {
    console.error('[v0] AI parser error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to parse with AI' },
      { status: 500 }
    )
  }
}
