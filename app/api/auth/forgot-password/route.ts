import { type NextRequest, NextResponse } from "next/server"
import { getUserByEmail, storeVerificationCode } from "@/lib/storage"
import { sendEmail, generateVerificationCode, createPasswordResetEmailHTML } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    // Validate input
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: "No account found with this email address" }, { status: 404 })
    }

    if (!user.is_verified) {
      console.log(`Password reset attempted for unverified user: ${email}`)
      return NextResponse.json(
        {
          error:
            "Please verify your email first. Check your inbox for the verification email, or request a new verification code from the sign-up page.",
          needsVerification: true,
        },
        { status: 400 },
      )
    }

    // Generate reset code
    const resetCode = generateVerificationCode()
    const codeStored = await storeVerificationCode(email, resetCode, "reset")

    if (!codeStored) {
      return NextResponse.json({ error: "Failed to store reset code" }, { status: 500 })
    }

    // Send reset email
    const emailResult = await sendEmail({
      to: email,
      subject: "Password Reset Code",
      html: createPasswordResetEmailHTML(resetCode),
    })

    if (!emailResult.success) {
      console.error("Failed to send reset email:", emailResult.error)
      return NextResponse.json({ error: "Failed to send reset email" }, { status: 500 })
    }

    return NextResponse.json({
      message: "Password reset code sent to your email",
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
