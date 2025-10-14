import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { email, verificationCode, newPassword } = await request.json()

    if (!email || !verificationCode || !newPassword) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createAdminClient()

    const { data: user, error: userError } = await supabase.from("users").select("*").eq("email", email).single()

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Verify the code
    if (
      !user.password_change_code ||
      user.password_change_code !== verificationCode ||
      !user.password_change_expires_at ||
      new Date(user.password_change_expires_at) <= new Date()
    ) {
      return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    const { error: updateError } = await supabase
      .from("users")
      .update({
        password_hash: hashedPassword,
        password_change_code: null,
        password_change_expires_at: null,
      })
      .eq("email", email)

    if (updateError) {
      return NextResponse.json({ error: "Failed to update password" }, { status: 500 })
    }

    return NextResponse.json({ message: "Password changed successfully" })
  } catch (error) {
    console.error("Password change error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  return POST(request)
}
