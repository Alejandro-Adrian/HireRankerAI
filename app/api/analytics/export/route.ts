import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get user from session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const timeRange = Number.parseInt(searchParams.get("timeRange") || "30")
    const rankingId = searchParams.get("ranking") || "all"
    const format = searchParams.get("format") || "csv"

    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - timeRange)

    // Build query
    let query = supabase
      .from("applications")
      .select(`
        *,
        rankings!inner(
          id,
          title,
          position,
          created_by
        )
      `)
      .eq("rankings.created_by", user.id)
      .gte("submitted_at", startDate.toISOString())

    if (rankingId !== "all") {
      query = query.eq("ranking_id", rankingId)
    }

    const { data: applications, error } = await query

    if (error) {
      console.error("Error fetching applications for export:", error)
      return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
    }

    if (format === "csv") {
      // Generate CSV
      const headers = [
        "Application ID",
        "Applicant Name",
        "Email",
        "Phone",
        "City",
        "Position",
        "Ranking Title",
        "Total Score",
        "Status",
        "Submitted At",
        "Experience Years",
      ]

      const csvRows = [headers.join(",")]

      applications?.forEach((app) => {
        const row = [
          app.id,
          app.applicant_name || "",
          app.applicant_email || "",
          app.applicant_phone || "",
          app.applicant_city || "",
          app.rankings?.position || "",
          app.rankings?.title || "",
          app.total_score || 0,
          app.status || "pending",
          app.submitted_at,
          app.experience_years || 0,
        ]
        csvRows.push(row.map((field) => `"${field}"`).join(","))
      })

      const csvContent = csvRows.join("\n")

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="analytics-export-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      })
    }

    return NextResponse.json({ error: "Unsupported format" }, { status: 400 })
  } catch (error) {
    console.error("Error in analytics export API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
