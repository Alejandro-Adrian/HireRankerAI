import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

export async function DELETE(request: NextRequest) {
  try {
    const { email, verificationCode } = await request.json()

    if (!email || !verificationCode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createAdminClient()

    const { data: user, error: userError } = await supabase.from("users").select("*").eq("email", email).single()

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Verify the code
    if (
      !user.account_deletion_code ||
      user.account_deletion_code !== verificationCode ||
      !user.account_deletion_expires_at ||
      new Date(user.account_deletion_expires_at) <= new Date()
    ) {
      return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 })
    }

    // Delete user and all related data
    const { error: deleteError } = await supabase.from("users").delete().eq("email", email)

    if (deleteError) {
      return NextResponse.json({ error: "Failed to delete account" }, { status: 500 })
    }

    return NextResponse.json({ message: "Account deleted successfully" })
  } catch (error) {
    console.error("Account deletion error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Keep POST method for backward compatibility
export async function POST(request: NextRequest) {
  return DELETE(request)
}
