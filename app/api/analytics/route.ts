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

    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - timeRange)

    // Build base query
    let applicationsQuery = supabase
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
      applicationsQuery = applicationsQuery.eq("ranking_id", rankingId)
    }

    const { data: applications, error: appsError } = await applicationsQuery

    if (appsError) {
      console.error("Error fetching applications:", appsError)
      return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 })
    }

    // Get rankings for user
    let rankingsQuery = supabase.from("rankings").select("*").eq("created_by", user.id)

    if (rankingId !== "all") {
      rankingsQuery = rankingsQuery.eq("id", rankingId)
    }

    const { data: rankings, error: rankingsError } = await rankingsQuery

    if (rankingsError) {
      console.error("Error fetching rankings:", rankingsError)
      return NextResponse.json({ error: "Failed to fetch rankings" }, { status: 500 })
    }

    // Calculate analytics
    const totalApplications = applications?.length || 0
    const totalRankings = rankings?.length || 0

    const scores = applications?.map((app) => app.total_score || 0).filter((score) => score > 0) || []
    const averageScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0
    const topScore = scores.length > 0 ? Math.max(...scores) : 0

    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const applicationsThisWeek = applications?.filter((app) => new Date(app.submitted_at) >= oneWeekAgo).length || 0

    const oneMonthAgo = new Date()
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30)
    const applicationsThisMonth = applications?.filter((app) => new Date(app.submitted_at) >= oneMonthAgo).length || 0

    const hiredCount = applications?.filter((app) => app.status === "hired" || app.status === "approved").length || 0
    const conversionRate = totalApplications > 0 ? (hiredCount / totalApplications) * 100 : 0

    // Calculate average time to hire (mock data for now)
    const timeToHire = 21 // This would be calculated from actual hire dates

    // Applications by day
    const applicationsByDay = []
    for (let i = timeRange - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]
      const count = applications?.filter((app) => app.submitted_at.split("T")[0] === dateStr).length || 0
      applicationsByDay.push({
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        applications: count,
      })
    }

    // Score distribution
    const scoreRanges = [
      { range: "0-20", min: 0, max: 20 },
      { range: "21-40", min: 21, max: 40 },
      { range: "41-60", min: 41, max: 60 },
      { range: "61-80", min: 61, max: 80 },
      { range: "81-100", min: 81, max: 100 },
    ]

    const scoreDistribution = scoreRanges.map((range) => ({
      range: range.range,
      count: applications?.filter((app) => app.total_score >= range.min && app.total_score <= range.max).length || 0,
    }))

    // Position breakdown
    const positionMap = new Map()
    applications?.forEach((app) => {
      const position = app.rankings?.position || "Unknown"
      const current = positionMap.get(position) || { applications: 0, totalScore: 0, count: 0 }
      current.applications += 1
      if (app.total_score) {
        current.totalScore += app.total_score
        current.count += 1
      }
      positionMap.set(position, current)
    })

    const positionBreakdown = Array.from(positionMap.entries()).map(([position, data]) => ({
      position: position.replace("/", " / "),
      applications: data.applications,
      avgScore: data.count > 0 ? data.totalScore / data.count : 0,
    }))

    const criteriaPerformance = []
    if (rankings && rankings.length > 0) {
      const allCriteria = new Set()
      rankings.forEach((ranking) => {
        if (ranking.criteria_weights) {
          Object.keys(ranking.criteria_weights).forEach((criterion) => allCriteria.add(criterion))
        }
      })

      allCriteria.forEach((criterion) => {
        const relevantApps =
          applications?.filter((app) => app.score_breakdown && app.score_breakdown[criterion] !== undefined) || []

        const avgScore =
          relevantApps.length > 0
            ? relevantApps.reduce((sum, app) => sum + (app.score_breakdown[criterion] || 0), 0) / relevantApps.length
            : 0

        const avgWeight =
          rankings
            .filter((r) => r.criteria_weights && r.criteria_weights[criterion])
            .reduce((sum, r) => sum + (r.criteria_weights[criterion] || 0), 0) /
            rankings.filter((r) => r.criteria_weights && r.criteria_weights[criterion]).length || 0

        criteriaPerformance.push({
          criterion,
          avgScore,
          weight: avgWeight,
        })
      })
    }

    // If no criteria data available, use fallback
    if (criteriaPerformance.length === 0) {
      criteriaPerformance.push(
        { criterion: "personality", avgScore: 72.5, weight: 0.5 },
        { criterion: "skill", avgScore: 68.3, weight: 0.8 },
        { criterion: "experience", avgScore: 75.1, weight: 0.7 },
        { criterion: "education", avgScore: 65.8, weight: 0.5 },
      )
    }

    // Monthly trends (mock data for demonstration)
    const monthlyTrends = [
      { month: "Jan", applications: 45, avgScore: 68.2, hired: 8 },
      { month: "Feb", applications: 52, avgScore: 71.5, hired: 12 },
      { month: "Mar", applications: 38, avgScore: 69.8, hired: 7 },
      { month: "Apr", applications: 61, avgScore: 73.1, hired: 15 },
      { month: "May", applications: 48, avgScore: 70.4, hired: 9 },
      { month: "Jun", applications: totalApplications, avgScore: averageScore, hired: hiredCount },
    ]

    // Status breakdown
    const statusMap = new Map()
    applications?.forEach((app) => {
      const status = app.status || "pending"
      statusMap.set(status, (statusMap.get(status) || 0) + 1)
    })

    const statusBreakdown = Array.from(statusMap.entries()).map(([status, count]) => ({
      status,
      count,
      percentage: totalApplications > 0 ? (count / totalApplications) * 100 : 0,
    }))

    const analyticsData = {
      totalApplications,
      totalRankings,
      averageScore,
      topScore,
      applicationsThisWeek,
      applicationsThisMonth,
      conversionRate,
      timeToHire,
      applicationsByDay,
      scoreDistribution,
      positionBreakdown,
      criteriaPerformance,
      monthlyTrends,
      statusBreakdown,
    }

    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error("Error in analytics API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
