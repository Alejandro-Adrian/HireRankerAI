import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { sendEmail, createCongratulationsEmailHTML } from "@/lib/email"

const supabase = createAdminClient()

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { notes } = await request.json()
    const applicationId = params.id

    // Get application details
    const { data: application, error: fetchError } = await supabase
      .from("applications")
      .select(`
        *,
        rankings (
          title,
          position,
          description
        )
      `)
      .eq("id", applicationId)
      .single()

    if (fetchError || !application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    // Update application to mark as selected
    const { error: updateError } = await supabase
      .from("applications")
      .update({
        selected_for_interview: true,
        interview_invitation_sent_at: new Date().toISOString(),
        interview_notes: notes || null,
        status: "selected",
      })
      .eq("id", applicationId)

    if (updateError) {
      return NextResponse.json({ error: "Failed to update application status" }, { status: 500 })
    }

    const jobTitle = application.rankings.position.replace("/", " / ")
    const candidateName = application.applicant_name || application.candidate_name || "Candidate"
    const ranking = application.rank_position || application.rank || 1
    const score = application.total_score || 0

    const emailResult = await sendEmail({
      to: application.applicant_email || application.candidate_email,
      subject: `🎉 Congratulations! Interview Invitation for ${jobTitle} Position`,
      html: createCongratulationsEmailHTML(candidateName, jobTitle, ranking, score),
    })

    if (!emailResult.success) {
      console.error("Email sending failed:", emailResult.error)
      return NextResponse.json({
        success: true,
        message: "Candidate selected successfully, but email delivery failed. Please contact them manually.",
        emailError: true,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Candidate selected and email sent successfully",
    })
  } catch (error) {
    console.error("Error selecting candidate:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
