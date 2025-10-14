import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, position, description, criteria_weights, area_city, is_active } = body

    // Validate required fields
    if (!title || !position || !criteria_weights) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate position
    const validPositions = [
      "kitchen-helper",
      "server/waiter",
      "housekeeping",
      "cashier",
      "barista",
      "gardener",
      "receptionist",
    ]
    if (!validPositions.includes(position)) {
      return NextResponse.json({ error: "Invalid position" }, { status: 400 })
    }

    // Update the ranking (only if owned by current user)
    const { data: ranking, error } = await supabase
      .from("rankings")
      .update({
        title,
        position,
        description,
        criteria_weights,
        area_city,
        is_active: is_active ?? true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .eq("created_by", user.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating ranking:", error)
      return NextResponse.json({ error: "Failed to update ranking" }, { status: 500 })
    }

    if (!ranking) {
      return NextResponse.json({ error: "Ranking not found or access denied" }, { status: 404 })
    }

    try {
      const { scoringService } = await import("@/lib/scoring-service")
      await scoringService.scoreAllApplicationsForRanking(params.id)
      console.log("Re-scored all applications after criteria update")
    } catch (scoringError) {
      console.error("Error re-scoring applications:", scoringError)
      // Don't fail the update if scoring fails
    }

    return NextResponse.json(ranking)
  } catch (error) {
    console.error("Error in rankings PUT API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    const { data: ranking, error: deleteError } = await supabase
      .from("rankings")
      .delete()
      .eq("id", params.id)
      .select()
      .single()

    if (deleteError) {
      console.error("Error deleting ranking:", deleteError)
      return NextResponse.json({ error: "Failed to delete ranking" }, { status: 500 })
    }

    if (!ranking) {
      return NextResponse.json({ error: "Ranking not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Ranking deleted successfully",
      ranking,
    })
  } catch (error) {
    console.error("Error in rankings DELETE API:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
