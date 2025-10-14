import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { sendEmail } from "@/lib/email"
import { v4 as uuidv4 } from "uuid"

const supabase = createAdminClient()

export async function POST(request: NextRequest) {
  try {
    const { applicationIds, scheduledAt, notes } = await request.json()

    if (!applicationIds || applicationIds.length === 0) {
      return NextResponse.json({ error: "No applications selected" }, { status: 400 })
    }

    // Get all applications
    const { data: applications, error: appError } = await supabase
      .from("applications")
      .select("*")
      .in("id", applicationIds)

    if (appError || !applications) {
      return NextResponse.json({ error: "Applications not found" }, { status: 404 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    if (!siteUrl) {
      console.error("NEXT_PUBLIC_SITE_URL environment variable is not set")
      return NextResponse.json({ error: "Site URL configuration missing" }, { status: 500 })
    }

    const results = []

    // Process each application
    for (const application of applications) {
      try {
        // Generate unique meeting details for each candidate
        const meetingId = uuidv4()
        const hrAccessToken = uuidv4()
        const applicantAccessToken = uuidv4()
        const meetingUrl = `${siteUrl}/video-call/${meetingId}`

        // Update application
        const { error: updateError } = await supabase
          .from("applications")
          .update({
            selected_for_interview: true,
            interview_invitation_sent_at: new Date().toISOString(),
            interview_notes: notes,
            interview_scheduled_at: scheduledAt,
            interview_meeting_url: meetingUrl,
            interview_meeting_id: meetingId,
          })
          .eq("id", application.id)

        if (updateError) {
          results.push({ id: application.id, success: false, error: "Failed to update" })
          continue
        }

        // Create interview session
        await supabase.from("interview_sessions").insert({
          application_id: application.id,
          meeting_id: meetingId,
          meeting_url: meetingUrl,
          scheduled_at: scheduledAt,
          hr_access_token: hrAccessToken,
          applicant_access_token: applicantAccessToken,
        })

        // Send email
        const scheduledDate = scheduledAt ? new Date(scheduledAt) : null
        const isASAP = !scheduledDate
        const dateTimeText = isASAP
          ? "as soon as possible (ASAP)"
          : scheduledDate.toLocaleString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              timeZoneName: "short",
            })

        const emailHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .interview-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
                .meeting-link { background: #667eea; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 15px 0; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
                .important { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 15px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🎉 Congratulations!</h1>
                  <p>You've been selected for an interview</p>
                </div>
                <div class="content">
                  <p>Dear ${application.applicant_name},</p>
                  
                  <p>We are pleased to inform you that after reviewing your application, you have been selected to proceed to the interview stage for the position you applied for.</p>
                  
                  <div class="interview-details">
                    <h3>📅 Interview Details</h3>
                    <p><strong>Scheduled Time:</strong> ${dateTimeText}</p>
                    <p><strong>Format:</strong> Video Call Interview</p>
                    <p><strong>Your Application Score:</strong> ${application.total_score}%</p>
                  </div>

                  <div class="important">
                    <h4>🔗 Video Call Access</h4>
                    <p><strong>Important:</strong> You can only join the video call ${isASAP ? "when the interview begins" : "at your scheduled time"}. The HR team can join at any time to prepare.</p>
                    <a href="${meetingUrl}?token=${applicantAccessToken}" class="meeting-link">Join Interview Call</a>
                    <p><small>Click the link above ${isASAP ? "when your interview begins" : "at your scheduled time"} to join the video call.</small></p>
                  </div>

                  <h3>📋 Next Steps</h3>
                  <ul>
                    <li>Save this email and the meeting link for easy access</li>
                    <li>Test your camera and microphone before the interview</li>
                    <li>Prepare any questions you'd like to ask about the role</li>
                    <li>Join the call ${isASAP ? "when notified" : "at your scheduled time"}</li>
                  </ul>

                  <p>We look forward to speaking with you and learning more about your qualifications.</p>
                  
                  <p>Best regards,<br>The Hiring Team</p>
                </div>
                <div class="footer">
                  <p>This is an automated message from our hiring system.</p>
                </div>
              </div>
            </body>
          </html>
        `

        const emailResult = await sendEmail({
          to: application.applicant_email,
          subject: `Interview Invitation - Congratulations!`,
          html: emailHtml,
        })

        if (!emailResult.success) {
          console.error(`Email sending failed for ${application.applicant_email}:`, emailResult.error)
          results.push({ id: application.id, success: false, error: "Email failed" })
          continue
        }

        results.push({
          id: application.id,
          success: true,
          meetingUrl,
          hrAccessUrl: `${meetingUrl}?token=${hrAccessToken}`,
          applicantAccessUrl: `${meetingUrl}?token=${applicantAccessToken}`,
        })
      } catch (error) {
        console.error(`Error processing application ${application.id}:`, error)
        results.push({ id: application.id, success: false, error: error.message })
      }
    }

    const successCount = results.filter((r) => r.success).length
    const failureCount = results.filter((r) => !r.success).length

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: applications.length,
        successful: successCount,
        failed: failureCount,
      },
    })
  } catch (error) {
    console.error("Error in bulk interview scheduling:", error)
    return NextResponse.json({ error: "Failed to schedule interviews" }, { status: 500 })
  }
}
