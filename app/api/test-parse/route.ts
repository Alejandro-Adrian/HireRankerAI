import { type NextRequest, NextResponse } from "next/server"
import { ocrResumeParser } from "@/lib/ocr-resume-parser"

export async function POST(request: NextRequest) {
  console.log("[v0] Test parse endpoint called")

  try {
    const formData = await request.formData()
    const file = formData.get("resume") as File | null

    if (!file) {
      console.log("[v0] No file provided")
      return NextResponse.json({ error: "No resume file provided" }, { status: 400 })
    }

    console.log("[v0] Processing file:", file.name, file.type, file.size)

    const startTime = Date.now()
    const resumeData = await ocrResumeParser.parseFromFile(file)
    const parseTime = Date.now() - startTime

    console.log("[v0] Parse successful in", parseTime, "ms")
    console.log("[v0] Extracted data:", {
      name: resumeData.name,
      email: resumeData.email,
      city: resumeData.location,
      skills: resumeData.skills?.length,
    })

    // Return the parsed data for testing
    return NextResponse.json({
      success: true,
      parseTime,
      data: {
        applicant_name: resumeData.name,
        applicant_email: resumeData.email,
        applicant_phone: resumeData.phone,
        applicant_city: resumeData.location,
        resume_summary: resumeData.summary,
        skills: resumeData.skills || [],
        experience_years: resumeData.experience || "Not specified",
        education: resumeData.education,
        certifications: [],
        raw_text_length: resumeData.rawText?.length || 0,
      },
    })
  } catch (error) {
    console.error("[v0] Test parse error:", error)

    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 },
    )
  }
}
