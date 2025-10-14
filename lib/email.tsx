import { Resend } from "resend"
import nodemailer from "nodemailer"
import { config } from "dotenv"

if (typeof window === "undefined") {
  // Load .env file in all environments (development and production)
  config()
}

let resendClient: Resend | null = null

function getResendClient(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      throw new Error("RESEND_API_KEY environment variable is required")
    }
    resendClient = new Resend(apiKey)
  }
  return resendClient
}

let transporter: nodemailer.Transporter | null = null

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: "smtp.resend.com",
      port: 587,
      secure: false, // Use STARTTLS
      auth: {
        user: "resend",
        pass: process.env.RESEND_API_KEY,
      },
      connectionTimeout: 30000,
      greetingTimeout: 15000,
      socketTimeout: 30000,
      pool: false,
      debug: process.env.NODE_ENV === "development",
      logger: process.env.NODE_ENV === "development",
    })
  }
  return transporter
}

interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail(options: EmailOptions) {
  const { to, subject, html } = options

  try {
    console.log("[v0] 🚀 Starting email send via Resend API...")
    console.log("[v0] 📧 To:", to)
    console.log("[v0] 📝 Subject:", subject)

    const resend = getResendClient()
    const { data, error } = await resend.emails.send({
      from: "HireRankerAI <noreply@resend.dev>",
      to: [to],
      subject: subject,
      html: html,
    })

    if (error) {
      console.error("[v0] ❌ Resend API error:", error)
      if (error.message?.includes("403") || error.message?.includes("testing")) {
        return {
          success: false,
          error:
            "Email service is in testing mode. Please verify your email domain in Resend dashboard or contact support.",
        }
      }
      return { success: false, error: error.message }
    }

    console.log("[v0] ✅ Email sent successfully via Resend API:", data?.id)
    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error("[v0] ❌ Resend email sending failed:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function sendEmailLegacy(to: string, subject: string, html: string) {
  return sendEmail({ to, subject, html })
}

export async function testEmailConnection() {
  try {
    console.log("[v0] 🔍 Testing Resend API connection...")

    const resend = getResendClient()
    const { data, error } = await resend.emails.send({
      from: "HireRankerAI <noreply@resend.dev>",
      to: ["delivered@resend.dev"], // Use Resend's test email for connection testing
      subject: "Connection Test",
      html: "<p>Testing Resend API connection</p>",
    })

    if (error) {
      console.error("[v0] ❌ Resend API connection test failed:", error)
      return { success: false, error: error.message }
    }

    console.log("[v0] ✅ Resend API connection test successful")
    return { success: true }
  } catch (error) {
    console.error("[v0] ❌ Resend API connection test failed:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function createVerificationEmailHTML(code: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification - HireRankerAI</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body { 
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
          line-height: 1.6; 
          color: #374151; 
          background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 50%, #dcfce7 100%);
          margin: 0;
          padding: 20px;
          min-height: 100vh;
        }
        
        .email-container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 25px 50px rgba(5, 150, 105, 0.1);
          padding: 40px;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .logo {
          font-size: 24px;
          font-weight: 700;
          color: #059669;
          margin-bottom: 10px;
        }
        
        .verification-code {
          background: #f0fdf4;
          border: 2px solid #059669;
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          margin: 30px 0;
        }
        
        .code {
          font-size: 32px;
          font-weight: 700;
          color: #059669;
          letter-spacing: 4px;
          font-family: 'Courier New', monospace;
        }
        
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 14px;
          color: #6b7280;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <div class="logo">🚀 HireRankerAI</div>
          <h1>Verify Your Email Address</h1>
        </div>
        
        <p>Welcome to HireRankerAI! Please verify your email address by entering the code below:</p>
        
        <div class="verification-code">
          <div class="code">${code}</div>
          <p style="margin-top: 10px; color: #059669; font-weight: 500;">Enter this code to complete your registration</p>
        </div>
        
        <p>This code will expire in 10 minutes for security reasons.</p>
        <p>If you didn't create an account with HireRankerAI, please ignore this email.</p>
        
        <div class="footer">
          <p>Best regards,<br>The HireRankerAI Team</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function createPasswordResetEmailHTML(resetCode: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset - HireRankerAI</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body { 
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
          line-height: 1.6; 
          color: #374151; 
          background: linear-gradient(135deg, #eff6ff 0%, #f0f9ff 50%, #e0f2fe 100%);
          margin: 0;
          padding: 20px;
          min-height: 100vh;
        }
        
        .email-container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 25px 50px rgba(59, 130, 246, 0.1);
          padding: 40px;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .logo {
          font-size: 24px;
          font-weight: 700;
          color: #3b82f6;
          margin-bottom: 10px;
        }
        
        .reset-code {
          background: #eff6ff;
          border: 2px solid #3b82f6;
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          margin: 30px 0;
        }
        
        .code {
          font-size: 32px;
          font-weight: 700;
          color: #3b82f6;
          letter-spacing: 4px;
          font-family: 'Courier New', monospace;
        }
        
        .security-notice {
          background: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
        }
        
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 14px;
          color: #6b7280;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <div class="logo">🔐 HireRankerAI</div>
          <h1>Password Reset Request</h1>
        </div>
        
        <p>You requested a password reset for your HireRankerAI account. Use the code below to reset your password:</p>
        
        <div class="reset-code">
          <div class="code">${resetCode}</div>
          <p style="margin-top: 10px; color: #3b82f6; font-weight: 500;">Enter this code to reset your password</p>
        </div>
        
        <div class="security-notice">
          <strong>Security Notice:</strong> This code will expire in 10 minutes. If you didn't request this password reset, please ignore this email and your password will remain unchanged.
        </div>
        
        <div class="footer">
          <p>Best regards,<br>The HireRankerAI Team</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function createPasswordChangeEmailHTML(userName: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Changed - HireRankerAI</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body { 
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
          line-height: 1.6; 
          color: #374151; 
          background: linear-gradient(135deg, #eff6ff 0%, #f0f9ff 50%, #e0f2fe 100%);
          margin: 0;
          padding: 20px;
          min-height: 100vh;
        }
        
        .email-container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 25px 50px rgba(59, 130, 246, 0.1);
          padding: 40px;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <h1>Password Changed Successfully</h1>
        <p>Hello ${userName},</p>
        <p>Your password has been successfully changed for your HireRankerAI account.</p>
        <p>If you didn't make this change, please contact our support team immediately.</p>
        <p>Your account security is important to us.</p>
      </div>
    </body>
    </html>
  `
}

export function createAccountDeletionEmailHTML(userName: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Account Deletion Confirmation - HireRankerAI</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body { 
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
          line-height: 1.6; 
          color: #374151; 
          background: linear-gradient(135deg, #fef2f2 0%, #fef7f7 50%, #fee2e2 100%);
          margin: 0;
          padding: 20px;
          min-height: 100vh;
        }
        
        .email-container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 25px 50px rgba(239, 68, 68, 0.1);
          padding: 40px;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <h1>Account Deletion Confirmation</h1>
        <p>Hello ${userName},</p>
        <p>Your HireRankerAI account has been successfully deleted as requested.</p>
        <p>All your data has been permanently removed from our systems.</p>
        <p>Thank you for using HireRankerAI. We're sorry to see you go!</p>
      </div>
    </body>
    </html>
  `
}

export function createVideoCallInvitationEmailHTML(
  candidateName: string,
  meetingLink: string,
  meetingTime: string,
  position?: string,
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Video Interview Invitation - HireRankerAI</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body { 
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
          line-height: 1.6; 
          color: #374151; 
          background: linear-gradient(135deg, #f3e8ff 0%, #f5f3ff 50%, #ede9fe 100%);
          margin: 0;
          padding: 20px;
          min-height: 100vh;
        }
        
        .email-container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 25px 50px rgba(139, 92, 246, 0.1);
          padding: 40px;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .logo {
          font-size: 24px;
          font-weight: 700;
          color: #8b5cf6;
          margin-bottom: 10px;
        }
        
        .meeting-button {
          display: inline-block;
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          color: white;
          padding: 16px 32px;
          text-decoration: none;
          border-radius: 12px;
          font-weight: 600;
          margin: 20px 0;
          text-align: center;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
        }
        
        .meeting-details {
          background: #f8fafc;
          padding: 24px;
          border-radius: 12px;
          margin: 20px 0;
          border-left: 4px solid #8b5cf6;
        }
        
        .preparation-tips {
          background: #f0fdf4;
          padding: 20px;
          border-radius: 12px;
          margin: 20px 0;
        }
        
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 14px;
          color: #6b7280;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <div class="logo">🎥 HireRankerAI</div>
          <h1>Video Interview Invitation</h1>
        </div>
        
        <p>Hello <strong>${candidateName}</strong>,</p>
        <p>Congratulations! You've been selected for a video interview${position ? ` for the <strong>${position}</strong> position` : ""}.</p>
        
        <div class="meeting-details">
          <h3 style="color: #8b5cf6; margin-bottom: 15px;">📅 Meeting Details</h3>
          <p><strong>Date & Time:</strong> ${meetingTime}</p>
          <p><strong>Duration:</strong> 30-45 minutes</p>
          <p><strong>Format:</strong> Video Call</p>
        </div>
        
        <div style="text-align: center;">
          <a href="${meetingLink}" class="meeting-button">🚀 Join Video Call</a>
        </div>
        
        <div class="preparation-tips">
          <h3 style="color: #059669; margin-bottom: 15px;">💡 Preparation Tips</h3>
          <ul style="margin-left: 20px;">
            <li>Test your camera and microphone 15 minutes before the call</li>
            <li>Find a quiet, well-lit space with a professional background</li>
            <li>Have your resume and portfolio ready to reference</li>
            <li>Prepare thoughtful questions about the role and company</li>
            <li>Ensure stable internet connection</li>
          </ul>
        </div>
        
        <p>We're excited to learn more about you and discuss how you can contribute to our team!</p>
        
        <div class="footer">
          <p>Best regards,<br>The HireRankerAI Team</p>
          <p style="margin-top: 10px;"><em>If you have any technical issues joining the call, please contact us immediately.</em></p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function createApprovalEmailHTML(candidateName: string, position: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Application Approved! - HireRankerAI</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body { 
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
          line-height: 1.6; 
          color: #374151; 
          background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 50%, #dcfce7 100%);
          margin: 0;
          padding: 20px;
          min-height: 100vh;
        }
        
        .email-container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 25px 50px rgba(5, 150, 105, 0.1);
          padding: 40px;
        }
        
        .celebration {
          text-align: center;
          font-size: 64px;
          margin: 20px 0;
          animation: bounce 2s infinite;
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .logo {
          font-size: 24px;
          font-weight: 700;
          color: #059669;
          margin-bottom: 10px;
        }
        
        .next-steps {
          background: #f0fdf4;
          padding: 24px;
          border-radius: 12px;
          margin: 20px 0;
          border-left: 4px solid #059669;
        }
        
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 14px;
          color: #6b7280;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <div class="logo">✅ HireRankerAI</div>
        </div>
        
        <div class="celebration">🎉</div>
        <h1 style="text-align: center; color: #059669; margin-bottom: 20px;">Application Approved!</h1>
        
        <p>Dear <strong>${candidateName}</strong>,</p>
        <p>Great news! Your application for the <strong>${position}</strong> position has been approved and moved to the next stage of our hiring process.</p>
        
        <div class="next-steps">
          <h3 style="color: #059669; margin-bottom: 15px;">🚀 What's Next?</h3>
          <ul style="margin-left: 20px;">
            <li>Our HR team will review your application in detail</li>
            <li>You may be contacted for a phone screening within 2-3 business days</li>
            <li>If selected, you'll be invited for a video interview</li>
            <li>We'll keep you updated throughout the process</li>
          </ul>
        </div>
        
        <p>Your qualifications and experience caught our attention, and we're excited to learn more about you!</p>
        <p>Thank you for your interest in joining our team.</p>
        
        <div class="footer">
          <p>Best regards,<br>The HireRankerAI Team</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function createCongratulationsEmailHTML(candidateName: string, position: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Congratulations! - HireRankerAI</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body { 
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
          line-height: 1.6; 
          color: #374151; 
          background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 50%, #dcfce7 100%);
          margin: 0;
          padding: 20px;
          min-height: 100vh;
        }
        
        .email-container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 25px 50px rgba(5, 150, 105, 0.1);
          padding: 40px;
        }
        
        .celebration {
          text-align: center;
          font-size: 48px;
          margin: 20px 0;
        }
        
        .next-steps {
          background: #f0fdf4;
          padding: 20px;
          border-radius: 12px;
          margin: 20px 0;
          border-left: 4px solid #059669;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="celebration">🎉</div>
        <h1>Congratulations, ${candidateName}!</h1>
        <p>We're thrilled to inform you that you've been selected for the <strong>${position}</strong> position!</p>
        
        <div class="next-steps">
          <h3>Next Steps:</h3>
          <ul>
            <li>HR will contact you within 2 business days</li>
            <li>We'll discuss compensation and benefits</li>
            <li>You'll receive your official offer letter</li>
            <li>We'll schedule your onboarding process</li>
          </ul>
        </div>
        
        <p>Your skills and experience impressed our team, and we can't wait to have you join us!</p>
        <p>Welcome to the team!</p>
        
        <p>Best regards,<br>The HireRankerAI Team</p>
      </div>
    </body>
    </html>
  `
}

export function createRejectionEmailHTML(candidateName: string, position: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Application Update - HireRankerAI</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body { 
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
          line-height: 1.6; 
          color: #374151; 
          background: linear-gradient(135deg, #fefbf3 0%, #fef7ed 50%, #fed7aa 100%);
          margin: 0;
          padding: 20px;
          min-height: 100vh;
        }
        
        .email-container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 25px 50px rgba(251, 146, 60, 0.1);
          padding: 40px;
        }
        
        .encouragement {
          background: #fef7ed;
          padding: 20px;
          border-radius: 12px;
          margin: 20px 0;
          border-left: 4px solid #f59e0b;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <h1>Thank you for your application</h1>
        <p>Dear ${candidateName},</p>
        
        <p>Thank you for your interest in the <strong>${position}</strong> position and for taking the time to interview with us.</p>
        
        <p>After careful consideration, we have decided to move forward with another candidate whose experience more closely aligns with our current needs.</p>
        
        <div class="encouragement">
          <h3>We were impressed by:</h3>
          <ul>
            <li>Your professional background and skills</li>
            <li>Your enthusiasm for the role</li>
            <li>Your thoughtful responses during the interview</li>
          </ul>
        </div>
        
        <p>We encourage you to apply for future opportunities that match your qualifications. We'll keep your information on file and reach out if a suitable position becomes available.</p>
        
        <p>We wish you the best of luck in your job search and future endeavors.</p>
        
        <p>Best regards,<br>The HireRankerAI Team</p>
      </div>
    </body>
    </html>
  `
}
