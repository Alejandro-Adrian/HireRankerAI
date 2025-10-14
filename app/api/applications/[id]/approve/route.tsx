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

    const emailResult = await sendEmail({
      to: application.applicant_email,
      subject: "🎉 Congratulations! Your Application Has Been Approved",
      html: createCongratulationsEmailHTML(application.applicant_name, "the position"),
    })

    if (!emailResult.success) {
      console.error("[v0] ❌ Email sending failed:", emailResult.error)
      return NextResponse.json({ error: "Failed to send approval email" }, { status: 500 })
    }

    console.log("[v0] ✅ Candidate approved and email sent successfully")

    return NextResponse.json({
      success: true,
      message: "Candidate approved successfully!",
      emailSent: true,
    })
  } catch (error) {
    console.error("[v0] ❌ Critical error in approval process:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
