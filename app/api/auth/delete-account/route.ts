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

    console.log('[v0] Starting comprehensive account deletion for user:', user.id)

    // Delete all rankings and their cascading data (applications, files, etc.)
    const { error: rankingsError } = await supabase
      .from("rankings")
      .delete()
      .eq("created_by", user.id)

    if (rankingsError) {
      console.error('[v0] Error deleting rankings:', rankingsError)
    }

    // Delete all notifications
    const { error: notificationsError } = await supabase
      .from("notifications")
      .delete()
      .eq("user_id", user.id)

    if (notificationsError) {
      console.error('[v0] Error deleting notifications:', notificationsError)
    }

    // Delete all analytics events
    const { error: analyticsError } = await supabase
      .from("analytics_events")
      .delete()
      .eq("user_id", user.id)

    if (analyticsError) {
      console.error('[v0] Error deleting analytics:', analyticsError)
    }

    // Delete all transcription sessions
    const { error: transcriptionsError } = await supabase
      .from("transcription_sessions")
      .delete()
      .eq("user_id", user.id)

    if (transcriptionsError) {
      console.error('[v0] Error deleting transcriptions:', transcriptionsError)
    }

    // Finally, delete the user account
    const { error: deleteError } = await supabase.from("users").delete().eq("email", email)

    if (deleteError) {
      console.error('[v0] Error deleting user:', deleteError)
      return NextResponse.json({ error: "Failed to delete account" }, { status: 500 })
    }

    console.log('[v0] Successfully deleted account and all associated data for user:', user.id)

    return NextResponse.json({ message: "Account and all associated data deleted successfully" })
  } catch (error) {
    console.error("Account deletion error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Keep POST method for backward compatibility
export async function POST(request: NextRequest) {
  return DELETE(request)
}
