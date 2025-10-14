import { type NextRequest, NextResponse } from "next/server"
import { findUserByEmail, updateUser, verifyCode, hashPassword } from "@/lib/storage"

export async function POST(request: NextRequest) {
  try {
    const { email, code, newPassword } = await request.json()

    // Validate input
    if (!email || !code || !newPassword) {
      return NextResponse.json({ error: "Email, reset code, and new password are required" }, { status: 400 })
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

    const user = await findUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (!user.is_verified) {
      return NextResponse.json({ error: "Please verify your email first" }, { status: 400 })
    }

    const isValidCode = await verifyCode(email, code, "reset")
    if (!isValidCode) {
      return NextResponse.json({ error: "Invalid or expired reset code" }, { status: 400 })
    }

    const hashedPassword = await hashPassword(newPassword)

    const updatedUser = await updateUser(email, { password_hash: hashedPassword })
    if (!updatedUser) {
      return NextResponse.json({ error: "Failed to update password" }, { status: 500 })
    }

    return NextResponse.json({
      message: "Password reset successfully",
    })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
