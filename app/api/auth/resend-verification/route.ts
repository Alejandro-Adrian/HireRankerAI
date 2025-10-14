import { type NextRequest, NextResponse } from "next/server"
import { sendEmail, generateVerificationCode, createVerificationEmailHTML } from "@/lib/email"
import { storeVerificationCode, getUserByEmail } from "@/lib/storage"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Check if user exists and is not verified
    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.is_verified) {
      return NextResponse.json({ error: "User is already verified" }, { status: 400 })
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode()

    const codeStored = await storeVerificationCode(email, verificationCode, "verification")

    if (!codeStored) {
      return NextResponse.json({ error: "Failed to store verification code" }, { status: 500 })
    }

    // Send verification email
    const emailResult = await sendEmail({
      to: email,
      subject: "Email Verification Code - HireRankerAI",
      html: createVerificationEmailHTML(verificationCode),
    })

    if (!emailResult.success) {
      return NextResponse.json({ error: "Failed to send verification email" }, { status: 500 })
    }

    return NextResponse.json({ message: "Verification code sent successfully" })
  } catch (error) {
    console.error("Resend verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
