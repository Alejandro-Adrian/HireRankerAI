import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { duplicateDetectionService } from "@/lib/duplicate-detection"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Starting manual application submission")

    const supabase = createClient()
    const body = await request.json()

    const {
      ranking_id,
      applicant_name,
      applicant_email,
      applicant_phone,
      applicant_city,
      experience_years,
      education_level,
      key_skills,
      certifications,
      resume_summary,
      ocr_transcript,
    } = body

    if (!ranking_id || !applicant_name) {
      return NextResponse.json({ error: "Missing required fields: ranking_id and applicant_name" }, { status: 400 })
    }

    console.log("[v0] Manual application for:", applicant_name)

    // Verify ranking exists and is active
    const { data: ranking, error: rankingError } = await supabase
      .from("rankings")
      .select("id, is_active, title, created_by")
      .eq("id", ranking_id)
      .eq("is_active", true)
      .single()

    if (rankingError || !ranking) {
      console.error("[v0] Ranking validation failed:", rankingError)
      return NextResponse.json({ error: "Invalid or inactive ranking" }, { status: 400 })
    }

    // Check for duplicates
    const { data: existingApplications } = await supabase
      .from("applications")
      .select("id, applicant_name, applicant_email, applicant_phone, applicant_city")
      .eq("ranking_id", ranking_id)

    if (existingApplications && existingApplications.length > 0) {
      const duplicateResult = await duplicateDetectionService.checkDuplicate(
        {
          applicant_name,
          applicant_email,
          applicant_phone,
          applicant_city,
        },
        existingApplications,
      )

      if (duplicateResult.isDuplicate) {
        return NextResponse.json(
          {
            error: "Duplicate application detected",
            details: `A similar application already exists. Matched fields: ${duplicateResult.matchedFields.join(", ")}`,
          },
          { status: 409 },
        )
      }
    }

    // Create application
    const applicationData = {
      ranking_id,
      applicant_name: applicant_name.trim(),
      applicant_email: applicant_email?.trim() || `manual-${Date.now()}@placeholder.com`,
      applicant_phone: applicant_phone?.trim() || null,
      applicant_city: applicant_city?.trim() || null,
      experience_years: experience_years || 0,
      education_level: education_level || "Not specified",
      key_skills: key_skills || "Not specified",
      certifications: certifications || "None specified",
      resume_summary: resume_summary || "Manually entered application",
      ocr_transcript: ocr_transcript || null,
      status: "pending",
      submitted_at: new Date().toISOString(),
    }

    const { data: application, error: applicationError } = await supabase
      .from("applications")
      .insert(applicationData)
      .select()
      .single()

    if (applicationError) {
      console.error("[v0] Error creating manual application:", applicationError)
      return NextResponse.json(
        { error: "Failed to create application", details: applicationError.message },
        { status: 500 },
      )
    }

    console.log("[v0] Manual application created:", application.id)

    // Score the application
    try {
      const { directScoringService } = await import("@/lib/direct-scoring-service")
      const scoringResult = await directScoringService.scoreApplication(application.id)

      if (scoringResult) {
        console.log("[v0] Manual application scored successfully")

        // Create notification
        await supabase.from("notifications").insert({
          user_id: ranking.created_by,
          type: "application_submitted",
          title: "New Manual Application",
          message: `${applicant_name} - Manual entry for ${ranking.title}`,
          data: {
            application_id: application.id,
            ranking_id: ranking_id,
            applicant_name: applicant_name,
            is_manual: true,
          },
        })
      }
    } catch (scoringError) {
      console.error("[v0] Scoring error:", scoringError)
    }

    return NextResponse.json(
      {
        message: "Manual application submitted successfully",
        application_id: application.id,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] Error in manual applications API:", error)
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}
