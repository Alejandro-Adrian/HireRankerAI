import { NextRequest, NextResponse } from 'next/server'
import pdf from 'pdf-parse'

const TIMEOUT_MS = 30000

export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] Direct parse: Starting...')
    
    const formData = await request.formData()
    const file = formData.get('resume') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    console.log('[v0] Direct parse: File received:', file.name, file.type, file.size)

    const startTime = Date.now()

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('PDF parsing timed out after 30 seconds')), TIMEOUT_MS)
    })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    console.log('[v0] Direct parse: Buffer created, size:', buffer.length)

    let text = ''

    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      console.log('[v0] Direct parse: Extracting PDF text...')
      
      const data = await Promise.race([
        pdf(buffer),
        timeoutPromise
      ]) as any
      
      text = data.text
      console.log('[v0] Direct parse: PDF text extracted, length:', text.length)
    } else if (file.type.startsWith('text/') || file.name.toLowerCase().endsWith('.txt')) {
      text = new TextDecoder().decode(buffer)
      console.log('[v0] Direct parse: Text file read, length:', text.length)
    } else {
      return NextResponse.json(
        { error: 'Unsupported file format. This method only supports PDF and TXT files.' },
        { status: 400 }
      )
    }

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'No text could be extracted from the file' }, { status: 400 })
    }

    const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/)
    const firstLines = text.split('\n').slice(0, 5).join('\n')
    const nameMatch = firstLines.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/m) ||
                      text.match(/Name:\s*([A-Za-z\s]+)/i)
    const cityMatch = text.match(/(?:City|Location|Address):\s*([A-Za-z\s,]+)/i)
    
    const skillKeywords = [
      'JavaScript', 'TypeScript', 'Python', 'Java', 'React', 'Node.js', 'Angular',
      'Customer Service', 'Communication', 'Leadership', 'Barista', 'Coffee', 'Food Service'
    ]
    
    const skills: string[] = []
    const lowerText = text.toLowerCase()
    skillKeywords.forEach(keyword => {
      if (lowerText.includes(keyword.toLowerCase())) {
        skills.push(keyword)
      }
    })

    const expMatch = text.match(/(\d+)\+?\s*(years?|yrs?)(\s+of)?\s+(experience|exp)/i)
    const experienceYears = expMatch ? parseInt(expMatch[1]) : 0

    const educationMatch = text.match(/(bachelor|master|phd|associate|diploma|degree|college|university)[^.!?]*[.!?]/gi)
    const education = educationMatch ? educationMatch.join(' ').slice(0, 200) : ''

    const parseTime = Date.now() - startTime

    const extractedData = {
      applicant_name: nameMatch ? nameMatch[1].trim() : '',
      applicant_email: emailMatch ? emailMatch[0] : '',
      applicant_phone: '',
      applicant_city: cityMatch ? cityMatch[1].trim() : '',
      skills: skills,
      experience_years: experienceYears,
      education: education,
      raw_text: text.slice(0, 1000) + (text.length > 1000 ? '...' : '')
    }

    console.log('[v0] Direct parse: Success')

    return NextResponse.json({
      success: true,
      method: 'Direct PDF Text Extraction',
      data: extractedData,
      parseTime,
    })

  } catch (error) {
    console.error('[v0] Direct parse error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    )
  }
}
