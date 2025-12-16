import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { sendEmail, createCongratulationsEmailHTML } from "@/lib/email"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("[v0] 🚀 Starting candidate approval for application:", params.id)

    const supabase = createAdminClient()

    const { data: application, error: fetchError } = await supabase
      .from("applications")
      .select("*")
      .eq("id", params.id)
      .single()

    if (fetchError || !application) {
      console.error("[v0] ❌ Failed to fetch application:", fetchError)
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    if (!application.applicant_email || !application.applicant_email.includes("@")) {
      console.error("[v0] ❌ Invalid email address:", application.applicant_email)
      return NextResponse.json(
        {
          error: "Invalid applicant email address",
          details: "Cannot send email to invalid address",
        },
        { status: 400 },
      )
    }

    // Update application status
    const { error: updateError } = await supabase
      .from("applications")
      .update({
        status: "approved",
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", params.id)

    if (updateError) {
      console.error("[v0] ❌ Failed to update application:", updateError)
      return NextResponse.json({ error: "Failed to update application status" }, { status: 500 })
    }

    console.log("[v0] 📧 Preparing to send approval email to:", application.applicant_email)
    console.log("[v0] 📧 Applicant name:", application.applicant_name)

    const emailResult = await sendEmail({
      to: application.applicant_email,
      subject: "🎉 Congratulations! Your Application Has Been Approved",
      html: createCongratulationsEmailHTML(application.applicant_name, "the position"),
    })

    console.log("[v0] 📧 Email send result:", emailResult)

    if (!emailResult.success) {
      console.error("[v0] ❌ Email sending failed:", emailResult.error)
      return NextResponse.json(
        {
          success: true,
          message: "Candidate approved successfully, but email delivery failed",
          emailSent: false,
          emailError: emailResult.error,
        },
        { status: 200 },
      )
    }

    console.log("[v0] ✅ Candidate approved and email sent successfully")

    return NextResponse.json({
      success: true,
      message: "Candidate approved successfully!",
      emailSent: true,
    })
  } catch (error) {
    console.error("[v0] ❌ Critical error in approval process:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
