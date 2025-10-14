// Email Templates for HireRankerAI
// This file contains all email templates used throughout the application

export function getVerificationEmailTemplate(verificationCode: string, userName: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Verify Your Email - HireRankerAI</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center;">
        <h1 style="color: white; margin: 0;">Welcome to HireRankerAI!</h1>
      </div>
      
      <div style="padding: 30px; background: #f8f9fa; border-radius: 10px; margin-top: 20px;">
        <h2 style="color: #333;">Hi ${userName},</h2>
        <p style="color: #666; line-height: 1.6;">
          Thank you for signing up! Please verify your email address using the code below:
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <h3 style="color: #333; margin: 0; font-size: 32px; letter-spacing: 4px; font-family: monospace;">
            ${verificationCode}
          </h3>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          This code will expire in 10 minutes. If you didn't create an account, please ignore this email.
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
        <p>© 2024 HireRankerAI. All rights reserved.</p>
      </div>
    </body>
    </html>
  `
}

export function getApprovalEmailTemplate(applicantName: string, jobTitle: string) {
  return `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #10b981; padding: 30px; border-radius: 10px; text-align: center;">
        <h1 style="color: white; margin: 0;">🎉 Congratulations!</h1>
      </div>
      
      <div style="padding: 30px; background: #f0fdf4; border-radius: 10px; margin-top: 20px;">
        <h2 style="color: #333;">Hi ${applicantName},</h2>
        <p style="color: #666; line-height: 1.6;">
          Great news! Your application for <strong>${jobTitle}</strong> has been approved.
        </p>
        <p style="color: #666; line-height: 1.6;">
          We were impressed by your qualifications and would like to move forward with the next steps.
          Our team will be in touch soon with more details.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="#" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Application Status
          </a>
        </div>
      </div>
    </body>
    </html>
  `
}

export function getRejectionEmailTemplate(applicantName: string, jobTitle: string) {
  return `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #6366f1; padding: 30px; border-radius: 10px; text-align: center;">
        <h1 style="color: white; margin: 0;">Thank You for Your Interest</h1>
      </div>
      
      <div style="padding: 30px; background: #f8fafc; border-radius: 10px; margin-top: 20px;">
        <h2 style="color: #333;">Hi ${applicantName},</h2>
        <p style="color: #666; line-height: 1.6;">
          Thank you for your interest in the <strong>${jobTitle}</strong> position at our company.
        </p>
        <p style="color: #666; line-height: 1.6;">
          After careful consideration, we have decided to move forward with other candidates 
          whose experience more closely matches our current needs.
        </p>
        <p style="color: #666; line-height: 1.6;">
          We encourage you to apply for future opportunities that match your skills and experience.
          We'll keep your information on file for future openings.
        </p>
        
        <p style="color: #666; line-height: 1.6; margin-top: 30px;">
          Best regards,<br>
          The HireRankerAI Team
        </p>
      </div>
    </body>
    </html>
  `
}

export function getInterviewInvitationTemplate(
  applicantName: string,
  jobTitle: string,
  interviewLink: string,
  interviewDate: string,
) {
  return `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #3b82f6; padding: 30px; border-radius: 10px; text-align: center;">
        <h1 style="color: white; margin: 0;">🎯 Interview Invitation</h1>
      </div>
      
      <div style="padding: 30px; background: #eff6ff; border-radius: 10px; margin-top: 20px;">
        <h2 style="color: #333;">Hi ${applicantName},</h2>
        <p style="color: #666; line-height: 1.6;">
          Congratulations! We'd like to invite you for an interview for the <strong>${jobTitle}</strong> position.
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
          <h3 style="color: #333; margin-top: 0;">Interview Details:</h3>
          <p style="color: #666; margin: 5px 0;"><strong>Date & Time:</strong> ${interviewDate}</p>
          <p style="color: #666; margin: 5px 0;"><strong>Format:</strong> Video Interview</p>
          <p style="color: #666; margin: 5px 0;"><strong>Duration:</strong> 45-60 minutes</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${interviewLink}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
            Join Interview
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px; line-height: 1.6;">
          Please click the link above at the scheduled time. Make sure you have a stable internet connection 
          and test your camera/microphone beforehand.
        </p>
      </div>
    </body>
    </html>
  `
}

export function getPasswordResetTemplate(resetLink: string, userName: string) {
  return `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #f59e0b; padding: 30px; border-radius: 10px; text-align: center;">
        <h1 style="color: white; margin: 0;">🔐 Password Reset</h1>
      </div>
      
      <div style="padding: 30px; background: #fffbeb; border-radius: 10px; margin-top: 20px;">
        <h2 style="color: #333;">Hi ${userName},</h2>
        <p style="color: #666; line-height: 1.6;">
          We received a request to reset your password for your HireRankerAI account.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
            Reset Password
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px; line-height: 1.6;">
          This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
        </p>
      </div>
    </body>
    </html>
  `
}
