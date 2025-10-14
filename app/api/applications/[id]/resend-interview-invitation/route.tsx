import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendEmail } from "@/lib/email"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const applicationId = params.id
    console.log("[v0] Resending invitation for application ID:", applicationId)

    const { notes } = await request.json()
    console.log("[v0] Request notes:", notes)

    const supabase = createClient()

    // Get application and ranking details
    const { data: application, error: appError } = await supabase
      .from("applications")
      .select(`
        *,
        rankings (
          position,
          company_name
        )
      `)
      .eq("id", applicationId)
      .single()

    console.log("[v0] Application query result:", { application: !!application, error: appError })

    if (appError || !application) {
      console.log("[v0] Application not found error:", appError)
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    if (!application.selected_for_interview) {
      console.log("[v0] Application not selected for interview")
      return NextResponse.json({ error: "Application not selected for interview" }, { status: 400 })
    }

    // Email content
    const position = application.rankings?.position || "Position"
    const company = application.rankings?.company_name || "Our Company"

    console.log("[v0] Sending email to:", application.applicant_email, "for position:", position)

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Interview Invitation - ${position}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Congratulations!</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <p style="font-size: 18px; margin-bottom: 20px;">Dear ${application.applicant_name},</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              We are pleased to inform you that you have been <strong>selected for an interview</strong> for the 
              <strong>${position}</strong> position at ${company}.
            </p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Our HR team will contact you shortly with interview details and scheduling information.
            </p>
            
            ${
              notes
                ? `
            <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-style: italic;"><strong>Additional Notes:</strong> ${notes}</p>
            </div>
            `
                : ""
            }
            
            <p style="font-size: 16px; margin-bottom: 30px;">
              Thank you for your interest in joining our team. We look forward to speaking with you!
            </p>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #666; font-size: 14px;">Best regards,<br><strong>${company} HR Team</strong></p>
            </div>
          </div>
        </body>
      </html>
    `

    const emailResult = await sendEmail({
      to: application.applicant_email,
      subject: `Interview Invitation - ${position} at ${company}`,
      html: htmlContent,
    })

    if (!emailResult.success) {
      console.error("[v0] Email sending failed:", emailResult.error)
      return NextResponse.json({ error: "Failed to send invitation email" }, { status: 500 })
    }

    console.log("[v0] Email sent successfully")

    // Update the resent timestamp
    const { error: updateError } = await supabase
      .from("applications")
      .update({
        interview_invitation_sent_at: new Date().toISOString(),
        interview_notes: notes || application.interview_notes,
      })
      .eq("id", applicationId)

    if (updateError) {
      console.error("[v0] Failed to update application:", updateError)
      return NextResponse.json({ error: "Failed to update application" }, { status: 500 })
    }

    console.log("[v0] Application updated successfully")

    return NextResponse.json({
      success: true,
      message: "Interview invitation resent successfully",
    })
  } catch (error) {
    console.error("[v0] Error resending interview invitation:", error)
    return NextResponse.json({ error: "Failed to resend invitation" }, { status: 500 })
  }
}
