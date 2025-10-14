"use client"
import { useState, useEffect } from "react"
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  Target,
  Download,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

interface AnalyticsDashboardProps {
  onBack: () => void
  user: any
}

interface AnalyticsData {
  totalApplications: number
  totalRankings: number
  averageScore: number
  topScore: number
  applicationsThisWeek: number
  applicationsThisMonth: number
  conversionRate: number
  timeToHire: number
  applicationsByDay: Array<{ date: string; applications: number }>
  scoreDistribution: Array<{ range: string; count: number }>
  positionBreakdown: Array<{ position: string; applications: number; avgScore: number }>
  criteriaPerformance: Array<{ criterion: string; avgScore: number; weight: number }>
  monthlyTrends: Array<{ month: string; applications: number; avgScore: number; hired: number }>
  statusBreakdown: Array<{ status: string; count: number; percentage: number }>
}

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#84cc16", "#f97316"]

export default function AnalyticsDashboard({ onBack, user }: AnalyticsDashboardProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("30")
  const [selectedRanking, setSelectedRanking] = useState("all")
  const [rankings, setRankings] = useState<any[]>([])

  useEffect(() => {
    fetchAnalyticsData()
    fetchRankings()
  }, [timeRange, selectedRanking])

  const fetchRankings = async () => {
    try {
      const response = await fetch("/api/rankings")
      if (response.ok) {
        const data = await response.json()
        setRankings(data)
      }
    } catch (error) {
      console.error("Error fetching rankings:", error)
    }
  }

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        timeRange,
        ranking: selectedRanking,
      })

      const response = await fetch(`/api/analytics?${params}`)
      if (response.ok) {
        const data = await response.json()
        setAnalyticsData(data)
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const exportData = async () => {
    try {
      const params = new URLSearchParams({
        timeRange,
        ranking: selectedRanking,
        format: "csv",
      })

      const response = await fetch(`/api/analytics/export?${params}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `analytics-report-${new Date().toISOString().split("T")[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error("Error exporting data:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 dark:from-slate-900 dark:via-slate-800 dark:to-emerald-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-200 dark:border-emerald-800 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400 font-open-sans">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 dark:from-slate-900 dark:via-slate-800 dark:to-emerald-950 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 font-open-sans">Failed to load analytics data</p>
          <Button onClick={fetchAnalyticsData} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  const kpiCards = [
    {
      title: "Total Applications",
      value: analyticsData.totalApplications.toLocaleString(),
      change: `+${analyticsData.applicationsThisWeek}`,
      changeLabel: "this week",
      icon: Users,
      color: "emerald",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
      textColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Average Score",
      value: `${analyticsData.averageScore.toFixed(1)}/100`,
      change: analyticsData.averageScore > 70 ? "Good" : analyticsData.averageScore > 50 ? "Fair" : "Low",
      changeLabel: "quality",
      icon: Target,
      color: "blue",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      textColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Conversion Rate",
      value: `${analyticsData.conversionRate.toFixed(1)}%`,
      change: analyticsData.conversionRate > 15 ? "High" : analyticsData.conversionRate > 8 ? "Good" : "Low",
      changeLabel: "performance",
      icon: TrendingUp,
      color: "purple",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      textColor: "text-purple-600 dark:text-purple-400",
    },
    {
      title: "Time to Hire",
      value: `${analyticsData.timeToHire} days`,
      change: analyticsData.timeToHire < 14 ? "Fast" : analyticsData.timeToHire < 30 ? "Good" : "Slow",
      changeLabel: "speed",
      icon: Clock,
      color: "orange",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      textColor: "text-orange-600 dark:text-orange-400",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 dark:from-slate-900 dark:via-slate-800 dark:to-emerald-950 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200/20 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-300/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <header className="relative z-10 glass-emerald border-b border-emerald-200/20 dark:border-emerald-800/20 animate-fade-in-down">
        <div className="px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 p-3 glass-emerald hover-glow rounded-xl transition-all duration-300 group"
              >
                <ArrowLeft className="h-5 w-5 text-emerald-600 dark:text-emerald-400 group-hover:-translate-x-1 transition-transform duration-200" />
                <span className="text-emerald-700 dark:text-emerald-300 font-medium font-work-sans hidden sm:block">
                  Back to Dashboard
                </span>
              </button>
              <div className="h-8 w-px bg-emerald-200/50 dark:bg-emerald-800/50 hidden sm:block"></div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg animate-bounce-gentle">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold gradient-text font-work-sans">Analytics Dashboard</h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-open-sans hidden sm:block">
                    Comprehensive hiring insights and metrics
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32 glass-emerald border-emerald-200/20 dark:border-emerald-800/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 3 months</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedRanking} onValueChange={setSelectedRanking}>
                <SelectTrigger className="w-48 glass-emerald border-emerald-200/20 dark:border-emerald-800/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Rankings</SelectItem>
                  {rankings.map((ranking) => (
                    <SelectItem key={ranking.id} value={ranking.id}>
                      {ranking.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                onClick={fetchAnalyticsData}
                variant="outline"
                size="sm"
                className="glass-emerald border-emerald-200/20 dark:border-emerald-800/20 bg-transparent"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>

              <Button
                onClick={exportData}
                variant="outline"
                size="sm"
                className="glass-emerald border-emerald-200/20 dark:border-emerald-800/20 bg-transparent"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 p-4 sm:p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {kpiCards.map((kpi, index) => (
            <div
              key={kpi.title}
              className="glass hover-lift rounded-2xl p-6 group animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl ${kpi.bgColor} group-hover:scale-110 transition-all duration-300`}>
                  <kpi.icon className={`h-6 w-6 ${kpi.textColor}`} />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white font-work-sans">{kpi.value}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-open-sans">{kpi.title}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${kpi.textColor}`}>{kpi.change}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{kpi.changeLabel}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Applications Over Time */}
          <div className="glass rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 font-work-sans">
              Applications Over Time
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsData.applicationsByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="applications"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Score Distribution */}
          <div className="glass rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 font-work-sans">Score Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.scoreDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="range" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                    }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Position Breakdown */}
          <div className="glass rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 font-work-sans">
              Applications by Position
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.positionBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ position, applications }) => `${position}: ${applications}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="applications"
                  >
                    {analyticsData.positionBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Trends */}
          <div className="glass rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: "0.7s" }}>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 font-work-sans">Monthly Trends</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="applications"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                    name="Applications"
                  />
                  <Line
                    type="monotone"
                    dataKey="avgScore"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                    name="Avg Score"
                  />
                  <Line
                    type="monotone"
                    dataKey="hired"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }}
                    name="Hired"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Detailed Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Criteria Performance */}
          <div className="glass rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: "0.8s" }}>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 font-work-sans">
              Criteria Performance
            </h3>
            <div className="space-y-3">
              {analyticsData.criteriaPerformance.map((criterion, index) => (
                <div
                  key={criterion.criterion}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
                >
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white capitalize">
                      {criterion.criterion.replace("_", " ")}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Weight: {(criterion.weight * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{criterion.avgScore.toFixed(1)}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">avg score</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Application Status */}
          <div className="glass rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: "0.9s" }}>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 font-work-sans">Application Status</h3>
            <div className="space-y-3">
              {analyticsData.statusBreakdown.map((status, index) => {
                const getStatusIcon = (statusName: string) => {
                  switch (statusName.toLowerCase()) {
                    case "approved":
                    case "hired":
                      return <CheckCircle className="h-5 w-5 text-green-600" />
                    case "rejected":
                      return <XCircle className="h-5 w-5 text-red-600" />
                    case "pending":
                    case "reviewing":
                      return <Clock className="h-5 w-5 text-yellow-600" />
                    case "interview":
                      return <Eye className="h-5 w-5 text-blue-600" />
                    default:
                      return <AlertCircle className="h-5 w-5 text-slate-600" />
                  }
                }

                return (
                  <div
                    key={status.status}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
                  >
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(status.status)}
                      <p className="font-medium text-slate-900 dark:text-white capitalize">{status.status}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{status.count}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{status.percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
