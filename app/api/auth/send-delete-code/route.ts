import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { sendEmail, createAccountDeletionEmailHTML } from "@/lib/email"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const supabase = await createAdminClient()

    // Get user
    const { data: user, error: userError } = await supabase.from("users").select("*").eq("email", email).single()

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Password is incorrect" }, { status: 400 })
    }

    // Generate verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    const { error: updateError } = await supabase
      .from("users")
      .update({
        account_deletion_code: code,
        account_deletion_expires_at: expiresAt.toISOString(),
      })
      .eq("email", email)

    if (updateError) {
      return NextResponse.json({ error: "Failed to store verification code" }, { status: 500 })
    }

    // Send email
    const emailResult = await sendEmail({
      to: email,
      subject: "Account Deletion Verification - HireRankerAI",
      html: createAccountDeletionEmailHTML(code),
    })

    if (!emailResult.success) {
      return NextResponse.json({ error: "Failed to send verification email" }, { status: 500 })
    }

    return NextResponse.json({ message: "Verification code sent successfully" })
  } catch (error) {
    console.error("Send delete code error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
