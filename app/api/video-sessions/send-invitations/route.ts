import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendEmail, createVideoCallInvitationEmailHTML } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] 🚀 send-invitations API called")

    const { session_id, application_ids } = await request.json()
    console.log("[v0] Received session_id:", session_id)
    console.log("[v0] Received application_ids:", application_ids)

    if (!session_id || !application_ids || application_ids.length === 0) {
      console.error("[v0] ❌ Missing required fields")
      return NextResponse.json({ error: "Missing required fields: session_id and application_ids" }, { status: 400 })
    }

    const supabase = createClient()
    console.log("[v0] ✅ Supabase client created")

    const { data: session, error: sessionError } = await supabase
      .from("video_sessions")
      .select("*")
      .eq("id", session_id)
      .single()

    if (sessionError) {
      console.error("[v0] ❌ Session fetch error:", sessionError)
      return NextResponse.json({ error: `Session fetch error: ${sessionError.message}` }, { status: 404 })
    }

    if (!session) {
      console.error("[v0] ❌ Session not found")
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    console.log("[v0] ✅ Session found:", session.id)

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
      console.error("[v0] ❌ Applications fetch error:", appsError)
      return NextResponse.json({ error: `Applications fetch error: ${appsError.message}` }, { status: 500 })
    }

    if (!applications || applications.length === 0) {
      console.error("[v0] ❌ No applications found for ids:", application_ids)
      return NextResponse.json({ error: "No applications found" }, { status: 404 })
    }

    console.log("[v0] ✅ Found", applications.length, "applications")

    let successCount = 0
    let failureCount = 0
    const failedEmails: string[] = []

    for (const application of applications) {
      try {
        const candidateName = application.applicant_name || "Candidate"
        const candidateEmail = application.applicant_email
        const position = application.rankings?.title || application.rankings?.position || "Position"
        const scheduledTime = session.scheduled_at ? new Date(session.scheduled_at).toLocaleString() : undefined

        if (!candidateEmail) {
          console.error("[v0] ❌ No email found for application:", application.id)
          failureCount++
          failedEmails.push(candidateName)
          continue
        }

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
        if (!siteUrl) {
          console.error("[v0] ❌ NEXT_PUBLIC_SITE_URL environment variable not set")
          failureCount++
          failedEmails.push(candidateName)
          continue
        }

        const participantUrl = `${siteUrl}/video-call/${session.meeting_id}`
        console.log("[v0] 📧 Sending invitation to:", candidateEmail, "URL:", participantUrl)

        const emailResult = await sendEmail({
          to: candidateEmail,
          subject: `📹 Video Interview Invitation - ${session.title}`,
          html: createVideoCallInvitationEmailHTML(candidateName, position, participantUrl, scheduledTime),
        })

        if (emailResult.success) {
          console.log("[v0] ✅ Email sent successfully to:", candidateEmail)
          successCount++

          const { error: upsertError } = await supabase.from("video_session_participants").upsert(
            {
              session_id: session_id,
              application_id: application.id,
              applicant_email: candidateEmail,
              applicant_name: candidateName,
              invited_at: new Date().toISOString(),
            },
            { onConflict: "session_id,application_id" },
          )

          if (upsertError) {
            console.error("[v0] ⚠️ Failed to record participant:", upsertError)
            // Don't count as failure since email was sent
          }
        } else {
          console.error("[v0] ❌ Email send failed for:", candidateEmail, "Error:", emailResult.error)
          failureCount++
          failedEmails.push(candidateName)
        }
      } catch (emailError) {
        console.error("[v0] ❌ Exception sending email to application:", application.id, emailError)
        failureCount++
        failedEmails.push(application.applicant_name || "Unknown")
      }
    }

    console.log("[v0] 📊 Send summary - Success:", successCount, "Failures:", failureCount)

    if (successCount > 0) {
      const { error: updateError } = await supabase
        .from("video_sessions")
        .update({ participants_count: (session.participants_count || 0) + successCount })
        .eq("id", session_id)

      if (updateError) {
        console.error("[v0] ⚠️ Failed to update participants count:", updateError)
      }
    }

    const message =
      successCount > 0
        ? `Successfully sent ${successCount} meeting invitation${successCount !== 1 ? "s" : ""}!${failureCount > 0 ? ` ${failureCount} failed.` : ""}`
        : "Failed to send meeting invitations"

    return NextResponse.json({
      message,
      sent_count: successCount,
      failed_count: failureCount,
      failed_emails: failedEmails,
    })
  } catch (error) {
    console.error("[v0] ❌ Critical error in send-invitations route:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
