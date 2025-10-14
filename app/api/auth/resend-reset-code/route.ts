import { type NextRequest, NextResponse } from "next/server"
import { sendEmail, generateVerificationCode, createPasswordResetEmailHTML } from "@/lib/email"
import { updateUser, getUserByEmail } from "@/lib/storage"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Check if user exists
    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Generate new reset code
    const resetCode = generateVerificationCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Update user with new reset code
    await updateUser(email, {
      resetCode,
      resetExpires: expiresAt,
    })

    // Send password reset email
    const emailResult = await sendEmail({
      to: email,
      subject: "Password Reset Code - HireRankerAI",
      html: createPasswordResetEmailHTML(resetCode),
    })

    if (!emailResult.success) {
      return NextResponse.json({ error: "Failed to send reset email" }, { status: 500 })
    }

    return NextResponse.json({ message: "Reset code sent successfully" })
  } catch (error) {
    console.error("Resend reset code error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
