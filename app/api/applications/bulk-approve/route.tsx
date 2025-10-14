import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { sendEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { applicationIds } = await request.json()

    if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
      return NextResponse.json({ error: "No application IDs provided" }, { status: 400 })
    }

    console.log("[v0] 🚀 Starting bulk candidate approval for applications:", applicationIds)

    const supabase = createAdminClient()

    // Fetch all applications with ranking information
    const { data: applications, error: fetchError } = await supabase
      .from("applications")
      .select(`
        *,
        rankings!inner(title, position)
      `)
      .in("id", applicationIds)

    if (fetchError || !applications) {
      console.error("[v0] ❌ Failed to fetch applications:", fetchError)
      return NextResponse.json({ error: "Applications not found" }, { status: 404 })
    }

    // Update all application statuses
    const { error: updateError } = await supabase
      .from("applications")
      .update({
        status: "approved",
        reviewed_at: new Date().toISOString(),
      })
      .in("id", applicationIds)

    if (updateError) {
      console.error("[v0] ❌ Failed to update applications:", updateError)
      return NextResponse.json({ error: "Failed to update application statuses" }, { status: 500 })
    }

    // Send congratulations emails to all approved candidates
    let emailsSent = 0
    const emailPromises = applications.map(async (application) => {
      try {
        await sendEmail({
          to: application.applicant_email,
          subject: "🎉 Congratulations! Your Application Has Been Approved",
          html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border-radius: 16px; overflow: hidden;">
              <div style="padding: 40px 30px; text-align: center;">
                <h1 style="margin: 0 0 20px 0; font-size: 28px; font-weight: 700;">🎉 Congratulations!</h1>
                <p style="font-size: 18px; margin: 0 0 30px 0; opacity: 0.9;">Your application has been approved!</p>
                
                <div style="background: rgba(255,255,255,0.1); border-radius: 12px; padding: 25px; margin: 20px 0; backdrop-filter: blur(10px);">
                  <h2 style="margin: 0 0 15px 0; font-size: 20px;">Dear ${application.applicant_name},</h2>
                  <p style="margin: 0 0 15px 0; line-height: 1.6;">We're excited to inform you that your application for <strong>${application.rankings?.position || "the position"}</strong> has been approved! Our team was impressed with your qualifications and experience.</p>
                  <p style="margin: 15px 0 0 0; line-height: 1.6;">We'll be in touch soon with next steps. Thank you for your interest in joining our team!</p>
                </div>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.2);">
                  <p style="margin: 0; font-size: 14px; opacity: 0.8;">Best regards,<br>The HireRankerAI Team</p>
                </div>
              </div>
            </div>
          `,
        })
        emailsSent++
        console.log(`[v0] ✅ Email sent to ${application.applicant_email}`)
      } catch (emailError) {
        console.error(`[v0] ⚠️ Failed to send email to ${application.applicant_email}:`, emailError)
      }
    })

    await Promise.all(emailPromises)

    console.log("[v0] ✅ Bulk candidate approval completed successfully")

    return NextResponse.json({
      success: true,
      message: `Successfully approved ${applications.length} candidates`,
      count: applications.length,
      emailsSent,
      applications: applications.map((app) => ({
        id: app.id,
        name: app.applicant_name,
        email: app.applicant_email,
        status: "approved",
      })),
    })
  } catch (error) {
    console.error("[v0] ❌ Critical error in bulk approval process:", error)
    return NextResponse.json(
      {
        error: "Failed to approve candidates due to system error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
