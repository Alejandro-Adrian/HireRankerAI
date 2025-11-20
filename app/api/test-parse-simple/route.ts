import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('resume') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    const startTime = Date.now()

    // Only support text files for simple parser
    if (!file.type.startsWith('text/') && !file.name.toLowerCase().endsWith('.txt')) {
      return NextResponse.json(
        { error: 'Simple parser only supports TXT files. Please use other methods for PDF/images.' },
        { status: 400 }
      )
    }

    // Read text file
    const bytes = await file.arrayBuffer()
    const text = new TextDecoder().decode(bytes)

    // Simple extraction using regex
    const lines = text.split('\n').filter(line => line.trim())
    
    // Try to find name (usually first non-empty line)
    const name = lines[0]?.trim() || ''
    
    // Find email
    const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/)
    
    // Find phone (disabled as per request)
    const phone = ''
    
    // Find city (look for common patterns)
    const cityMatch = text.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z]{2})\b/)
    const city = cityMatch ? cityMatch[1] : ''

    const parseTime = Date.now() - startTime

    const extractedData = {
      applicant_name: name,
      applicant_email: emailMatch ? emailMatch[0] : '',
      applicant_phone: phone,
      applicant_city: city,
      skills: [],
      experience_years: 0,
      education: '',
      raw_text: text.slice(0, 500)
    }

    return NextResponse.json({
      success: true,
      method: 'Simple Text Parser',
      data: extractedData,
      parseTime,
    })

  } catch (error) {
    console.error('Simple parse error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        method: 'Simple Text Parser'
      },
      { status: 500 }
    )
  }
}
