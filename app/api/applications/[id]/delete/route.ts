import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createAdminClient()
    const applicationId = params.id

    // Delete the application
    const { error } = await supabase.from("applications").delete().eq("id", applicationId)

    if (error) {
      console.error("Error deleting application:", error)
      return NextResponse.json({ error: "Failed to delete application" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in delete application API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
