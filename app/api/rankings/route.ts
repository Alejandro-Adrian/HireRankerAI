import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: rankings, error } = await supabase
      .from("rankings")
      .select(`
        *,
        applications:applications(count)
      `)
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching rankings:", error)
      return NextResponse.json({ error: "Failed to fetch rankings" }, { status: 500 })
    }

    // Transform the data to include application counts
    const transformedRankings =
      rankings?.map((ranking) => ({
        ...ranking,
        applications_count: ranking.applications?.[0]?.count || 0,
      })) || []

    return NextResponse.json(transformedRankings)
  } catch (error) {
    console.error("Error in rankings API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("Starting ranking creation...")
    const supabase = await createClient()

    const body = await request.json()
    console.log("Request body:", body)

    const {
      title,
      position,
      description,
      criteria_weights,
      specific_criteria,
      custom_criteria,
      area_city,
      other_keyword,
      show_criteria_to_applicants,
      is_active,
      selectedCriteria,
      criteriaWeights,
      areaLivingCity,
      otherKeyword,
    } = body

    const mappedCriteriaWeights = criteria_weights || criteriaWeights
    const mappedSelectedCriteria = specific_criteria || selectedCriteria
    const mappedAreaCity = area_city || areaLivingCity
    const mappedOtherKeyword = other_keyword || otherKeyword

    // Validate required fields
    if (!title || !position || !mappedCriteriaWeights) {
      console.log("Validation failed - missing fields:", { title, position, criteriaWeights: mappedCriteriaWeights })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

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
      console.log("Invalid position:", position)
      return NextResponse.json({ error: "Invalid position" }, { status: 400 })
    }

    const totalWeight = Object.values(mappedCriteriaWeights).reduce(
      (sum: number, weight: any) => sum + Number(weight),
      0,
    )
    if (Math.abs(totalWeight - 100) > 0.01) {
      // Allow for small floating point differences
      console.log("Invalid criteria weights - total:", totalWeight)
      return NextResponse.json({ error: "Criteria weights must sum to exactly 100%" }, { status: 400 })
    }

    const linkId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    console.log("Generated linkId:", linkId)

    const insertData = {
      title,
      position,
      description,
      criteria_weights: mappedCriteriaWeights,
      criteria: mappedSelectedCriteria || [], // Store selected criteria in the criteria field
      area_city: mappedAreaCity,
      other_keyword: mappedOtherKeyword,
      is_active: is_active !== false, // Default to true if not specified
      application_link_id: linkId,
      created_by: null, // Set to null since no authentication
      show_criteria_to_applicants: show_criteria_to_applicants !== false, // Default to true if not specified
    }

    console.log("Inserting data:", insertData)

    const { data: ranking, error } = await supabase.from("rankings").insert(insertData).select().single()

    if (error) {
      console.error("Supabase error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })
      return NextResponse.json(
        {
          error: "Failed to create ranking",
          details: error.message,
          supabaseError: error,
        },
        { status: 500 },
      )
    }

    console.log("Successfully created ranking:", ranking)
    return NextResponse.json({ ...ranking, linkId }, { status: 201 })
  } catch (error) {
    console.error("Unexpected error in rankings POST API:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
