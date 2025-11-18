import { NextRequest, NextResponse } from "next/server"
import { sendEmail } from "@/lib/email"
import { getBrevoAccountInfo, getBrevoSenders } from "@/lib/brevo-email"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] 🔍 Checking Brevo configuration...")
    
    // Get account info
    const accountResult = await getBrevoAccountInfo()
    
    // Get verified senders
    const sendersResult = await getBrevoSenders()
    
    return NextResponse.json({
      account: accountResult,
      senders: sendersResult,
      note: "Check the senders list to see which email addresses are verified and can be used as sender"
    })
  } catch (error) {
    console.error("[v0] ❌ Error checking Brevo config:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to check Brevo configuration"
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { type, to, subject, message } = await request.json()

    if (!to) {
      return NextResponse.json({ error: "Recipient email is required" }, { status: 400 })
    }

    // Generate test email based on type
    let emailSubject = subject
    let emailHtml = ""
    let emailText = ""

    switch (type) {
      case "verification":
        emailSubject = "Verify Your Email - HireRankerAI"
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
        emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Email Verification</h1>
            <p>Thank you for signing up with HireRankerAI!</p>
            <p>Your verification code is:</p>
            <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
              ${verificationCode}
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this verification, please ignore this email.</p>
          </div>
        `
        emailText = `Email Verification\n\nThank you for signing up with HireRankerAI!\n\nYour verification code is: ${verificationCode}\n\nThis code will expire in 10 minutes.`
        break

      case "password-reset":
        emailSubject = "Password Reset Request - HireRankerAI"
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString()
        emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Password Reset</h1>
            <p>We received a request to reset your password.</p>
            <p>Your password reset code is:</p>
            <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
              ${resetCode}
            </div>
            <p>This code will expire in 15 minutes.</p>
            <p>If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
          </div>
        `
        emailText = `Password Reset\n\nWe received a request to reset your password.\n\nYour password reset code is: ${resetCode}\n\nThis code will expire in 15 minutes.`
        break

      case "interview-invitation":
        emailSubject = "Interview Invitation - HireRankerAI"
        const interviewDate = new Date(Date.now() + 86400000 * 3).toLocaleDateString()
        emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">You're Invited to an Interview!</h1>
            <p>Congratulations! You have been selected for an interview.</p>
            <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0;">Interview Details</h3>
              <p style="margin: 5px 0;"><strong>Position:</strong> Test Position</p>
              <p style="margin: 5px 0;"><strong>Date:</strong> ${interviewDate}</p>
              <p style="margin: 5px 0;"><strong>Time:</strong> 2:00 PM</p>
              <p style="margin: 5px 0;"><strong>Format:</strong> Video Interview</p>
            </div>
            <p>Please click the button below to confirm your attendance:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="#" style="background-color: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Confirm Attendance</a>
            </div>
            <p>We look forward to speaking with you!</p>
          </div>
        `
        emailText = `You're Invited to an Interview!\n\nCongratulations! You have been selected for an interview.\n\nInterview Details:\nPosition: Test Position\nDate: ${interviewDate}\nTime: 2:00 PM\nFormat: Video Interview\n\nWe look forward to speaking with you!`
        break

      case "application-status":
        emailSubject = "Application Status Update - HireRankerAI"
        emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Application Status Update</h1>
            <p>Thank you for your application to Test Position.</p>
            <p>We wanted to update you on the status of your application:</p>
            <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; font-size: 18px; font-weight: bold; color: #10b981;">Your application is under review</p>
            </div>
            <p>Our hiring team is carefully reviewing all applications. We will contact you within the next few days with an update.</p>
            <p>Thank you for your patience and interest in joining our team!</p>
          </div>
        `
        emailText = `Application Status Update\n\nThank you for your application to Test Position.\n\nYour application is under review.\n\nOur hiring team is carefully reviewing all applications. We will contact you within the next few days with an update.`
        break

      case "custom":
      default:
        emailSubject = subject
        emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Test Email</h1>
            <p>${message}</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
            <p style="color: #6b7280; font-size: 12px;">This is a test email sent from HireRankerAI using Brevo.</p>
          </div>
        `
        emailText = message
        break
    }

    console.log("[v0] 📧 Sending test email via Brevo...")

    // Send email using Brevo
    await sendEmail({
      to,
      subject: emailSubject,
      html: emailHtml,
      text: emailText,
    })

    console.log("[v0] ✅ Test email sent successfully")

    return NextResponse.json({
      success: true,
      message: `${type} email sent successfully to ${to}`,
    })
  } catch (error) {
    console.error("[v0] ❌ Test email error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to send test email",
      },
      { status: 500 }
    )
  }
}
