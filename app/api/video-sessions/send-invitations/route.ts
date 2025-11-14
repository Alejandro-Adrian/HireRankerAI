import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendEmail, createVideoCallInvitationEmailHTML } from "@/lib/email"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const { session_id, application_ids } = await request.json()

    if (!session_id || !application_ids || application_ids.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = createClient()

    const { data: session, error: sessionError } = await supabase
      .from("video_sessions")
      .select("*")
      .eq("id", session_id)
      .single()

    if (sessionError || !session) {
      console.error("Session fetch error:", sessionError)
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    const { data: applications, error: appsError } = await supabase
      .from("applications")
      .select(`
        id,
        applicant_name,
        applicant_email,
        rankings (title, position)
      `)
      .in("id", application_ids)

    if (appsError) {
      console.error("Applications fetch error:", appsError)
      return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 })
    }

    if (!applications || applications.length === 0) {
      return NextResponse.json({ error: "No applications found" }, { status: 404 })
    }

    let successCount = 0
    let failureCount = 0

    const protocol = request.headers.get("x-forwarded-proto") || "https"
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000"
    const siteUrl = `${protocol}://${host}`

    for (const application of applications) {
      try {
        const candidateName = application.applicant_name || "Candidate"
        const candidateEmail = application.applicant_email
        const position = application.rankings?.title || application.rankings?.position || "Position"
        const scheduledTime = session.scheduled_at ? new Date(session.scheduled_at).toLocaleString() : undefined

        if (!candidateEmail) {
          console.error("No email found for application:", application.id)
          failureCount++
          continue
        }

        const participantUrl = `${siteUrl}/video-call/${session.meeting_id}`

        console.log("[v0] 🔗 Generated participant URL:", participantUrl)

        const emailResult = await sendEmail({
          to: candidateEmail,
          subject: `📹 Video Interview Invitation - ${session.title}`,
          html: createVideoCallInvitationEmailHTML(candidateName, position, participantUrl, scheduledTime),
        })

        console.log("[v0] 📧 Email send result:", emailResult.success ? "Success" : "Failed")

        if (emailResult.success) {
          successCount++
        } else {
          failureCount++
          console.error("Email send failed for:", candidateEmail, emailResult.error)
        }
      } catch (emailError) {
        console.error("Error sending email to application:", application.id, emailError)
        failureCount++
      }
    }

    if (successCount > 0) {
      await supabase
        .from("video_sessions")
        .update({ participants_count: (session.participants_count || 0) + successCount })
        .eq("id", session_id)
    }

    const message =
      successCount > 0
        ? `Successfully sent ${successCount} meeting invitations!${failureCount > 0 ? ` ${failureCount} failed.` : ""}`
        : "Failed to send meeting invitations"

    return NextResponse.json({
      message,
      sent_count: successCount,
      failed_count: failureCount,
    })
  } catch (error) {
    console.error("Error in send-invitations route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
