import { type NextRequest, NextResponse } from "next/server"
import { createUser, findUserByEmail, storeVerificationCode } from "@/lib/storage"
import { sendEmail, generateVerificationCode, createVerificationEmailHTML, testEmailConnection } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] 🚀 Signup request received")

    const connectionTest = await testEmailConnection()
    if (!connectionTest.success) {
      console.error("[v0] ❌ Email connection test failed:", connectionTest.error)
      return NextResponse.json({ error: "Email service unavailable. Please try again later." }, { status: 503 })
    }

    const { email, password, firstname, lastname, company_name } = await request.json()
    console.log("[v0] 📝 Request data:", { email, firstname, lastname, company_name, passwordLength: password?.length })

    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Email and password are required and must be strings" }, { status: 400 })
    }

    if (!firstname || !lastname || typeof firstname !== "string" || typeof lastname !== "string") {
      return NextResponse.json({ error: "First name and last name are required and must be strings" }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 })
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return NextResponse.json(
        { error: "Password must contain at least one uppercase letter, one lowercase letter, and one number" },
        { status: 400 },
      )
    }

    // Check if user already exists
    const existingUser = await findUserByEmail(email.trim().toLowerCase())
    if (existingUser) {
      if (!existingUser.is_verified) {
        // Generate new verification code for existing unverified user
        const verificationCode = generateVerificationCode()
        const codeStored = await storeVerificationCode(existingUser.email, verificationCode, "verification")

        if (!codeStored) {
          return NextResponse.json({ error: "Failed to store verification code" }, { status: 500 })
        }

        // Send verification email
        const emailResult = await sendEmail({
          to: existingUser.email,
          subject: "Verify Your Email Address",
          html: createVerificationEmailHTML(verificationCode),
        })

        if (!emailResult.success) {
          console.error("Email sending failed:", emailResult.error)
          return NextResponse.json({ error: "Failed to send verification email. Please try again." }, { status: 500 })
        }

        return NextResponse.json({
          message: "Account exists but not verified. New verification code sent to your email.",
          userId: existingUser.id,
          requiresVerification: true,
        })
      }
      return NextResponse.json(
        { error: "User already exists and is verified. Please sign in instead." },
        { status: 400 },
      )
    }

    const sanitizedEmail = email.trim().toLowerCase()
    const sanitizedFirstname = firstname.trim()
    const sanitizedLastname = lastname.trim()
    const sanitizedCompanyName = company_name?.trim() || null

    console.log("[v0] 👤 Creating user with email:", sanitizedEmail)
    const user = await createUser(sanitizedEmail, password, sanitizedFirstname, sanitizedLastname, sanitizedCompanyName)
    if (!user) {
      console.error("[v0] ❌ Failed to create user in database")
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }
    console.log("[v0] ✅ User created successfully with ID:", user.id)

    // Generate verification code
    console.log("[v0] 🔢 Generating verification code")
    const verificationCode = generateVerificationCode()
    const codeStored = await storeVerificationCode(sanitizedEmail, verificationCode, "verification")

    if (!codeStored) {
      console.error("[v0] ❌ Failed to store verification code")
      return NextResponse.json({ error: "Failed to store verification code" }, { status: 500 })
    }
    console.log("[v0] ✅ Verification code stored successfully")

    // Send verification email
    console.log("[v0] 📧 Attempting to send verification email")
    const emailResult = await sendEmail({
      to: sanitizedEmail,
      subject: "Verify Your Email Address",
      html: createVerificationEmailHTML(verificationCode),
    })

    if (!emailResult.success) {
      console.error("[v0] ❌ Email sending failed:", emailResult.error)
      const errorMsg = emailResult.error?.includes("timeout")
        ? "Email service is taking too long to respond. Please try again."
        : "Failed to send verification email. Please try again."
      return NextResponse.json({ error: errorMsg }, { status: 500 })
    }
    console.log("[v0] ✅ Verification email sent successfully")

    return NextResponse.json({
      message: "User created successfully. Please check your email for verification code.",
      userId: user.id,
      requiresVerification: true,
    })
  } catch (error) {
    console.error("[v0] ❌ Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
