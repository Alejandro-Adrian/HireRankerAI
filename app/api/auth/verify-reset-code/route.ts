import { type NextRequest, NextResponse } from "next/server"
import { getUserByEmail, checkCodeValid } from "@/lib/storage"

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()

    // Validate input
    if (!email || !code) {
      return NextResponse.json({ error: "Email and reset code are required" }, { status: 400 })
    }

    // Find user
    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (!user.is_verified) {
      return NextResponse.json({ error: "Please verify your email first" }, { status: 400 })
    }

    console.log(`Verifying reset code for email: ${email}, code: ${code}`)

    const isValidCode = await checkCodeValid(email, code.trim(), "reset")

    if (!isValidCode) {
      // Check if user has any reset code to determine if it's expired or invalid
      const userWithCode = await getUserByEmail(email)
      if (userWithCode?.reset_code && userWithCode?.reset_expires_at) {
        const now = new Date()
        const expiryDate = new Date(userWithCode.reset_expires_at)
        if (expiryDate < now) {
          return NextResponse.json({ error: "Reset code has expired. Please request a new one." }, { status: 400 })
        }
      }
      return NextResponse.json({ error: "Invalid reset code. Please check the code and try again." }, { status: 400 })
    }

    return NextResponse.json({
      message: "Reset code verified successfully",
      valid: true,
    })
  } catch (error) {
    console.error("Verify reset code error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
