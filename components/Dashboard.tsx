"use client"
import {
  BarChart3,
  Users,
  Calendar,
  CheckCircle,
  Settings,
  LogOut,
  Plus,
  TrendingUp,
  Eye,
  Edit,
  Link2,
  Trash2,
  Search,
  X,
  Menu,
  ChevronRight,
} from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import SettingsComponent from "./Settings"
import RankingBuilder from "./RankingBuilder"
import ResultsDashboard from "./ResultsDashboard"
import VideoCallManager from "./VideoCallManager"
import NotificationCenter from "./NotificationCenter"
import { useRouter } from "next/navigation"

interface DashboardProps {
  user: any
  onLogout: () => void
}

interface Ranking {
  id: string
  title: string
  position: string
  description: string
  application_link_id: string
  is_active: boolean
  created_at: string
  applications_count: number
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [showSettings, setShowSettings] = useState(false)
  const [showRankingBuilder, setShowRankingBuilder] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [showVideoCalls, setShowVideoCalls] = useState(false)
  const [activeTab, setActiveTab] = useState<"rankings" | "videocalls">("rankings")
  const [selectedRanking, setSelectedRanking] = useState<Ranking | null>(null)
  const [rankings, setRankings] = useState<Ranking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [filterPosition, setFilterPosition] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("newest")
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchRankings()
  }, [])

  const fetchRankings = async () => {
    try {
      const response = await fetch("/api/rankings")
      if (response.ok) {
        const data = await response.json()
        setRankings(data)
      }
    } catch (error) {
      console.error("Error fetching rankings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRanking = () => {
    router.push("/rankings/create")
  }

  const handleEditRanking = (ranking: Ranking) => {
    router.push(`/rankings/${ranking.id}/edit`)
  }

  const handleCopyLink = (linkId: string) => {
    const applicationUrl = `${window.location.origin}/apply/${linkId}`
    navigator.clipboard.writeText(applicationUrl)
    // addNotification("Application link copied to clipboard!", "success") // Replaced by NotificationCenter
  }

  const handleRankingComplete = () => {
    setShowRankingBuilder(false)
    setSelectedRanking(null)
    fetchRankings() // Refresh the rankings list
    // addNotification("Ranking saved successfully!", "success") // Replaced by NotificationCenter
  }

  const handleViewApplications = (ranking: Ranking) => {
    setSelectedRanking(ranking)
    setShowResults(true)
  }

  const handleDeleteRanking = async (ranking: Ranking) => {
    if (!confirm(`Are you sure you want to delete the ranking "${ranking.title}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/rankings/${ranking.id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (response.ok) {
        // addNotification("Ranking deleted successfully!", "success") // Replaced by NotificationCenter
        fetchRankings() // Refresh the rankings list
      } else {
        const errorData = await response.json()
        // addNotification(errorData.error || "Failed to delete ranking", "error") // Replaced by NotificationCenter
      }
    } catch (error) {
      console.error("Error deleting ranking:", error)
      // addNotification("An error occurred while deleting the ranking", "error") // Replaced by NotificationCenter
    }
  }

  const handleShowVideoCalls = () => {
    setActiveTab("videocalls")
    setShowVideoCalls(true)
  }

  const handleShowRankings = () => {
    setActiveTab("rankings")
    setShowVideoCalls(false)
  }

  const filteredAndSortedRankings = useMemo(() => {
    const filtered = rankings
      .filter((ranking) => {
        // Search filter
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase()
          return (
            ranking.title.toLowerCase().includes(query) ||
            ranking.position.toLowerCase().includes(query) ||
            ranking.description.toLowerCase().includes(query)
          )
        }
        return true
      })
      .filter((ranking) => {
        // Position filter
        if (filterPosition !== "all") {
          return ranking.position === filterPosition
        }
        return true
      })
      .filter((ranking) => {
        // Status filter
        if (filterStatus === "active") return ranking.is_active
        if (filterStatus === "inactive") return !ranking.is_active
        return true
      })

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case "title-az":
          return a.title.localeCompare(b.title)
        case "title-za":
          return b.title.localeCompare(a.title)
        case "position-az":
          return a.position.localeCompare(b.position)
        case "position-za":
          return b.position.localeCompare(a.position)
        case "most-applications":
          return (b.applications_count || 0) - (a.applications_count || 0)
        case "least-applications":
          return (a.applications_count || 0) - (b.applications_count || 0)
        default:
          return 0
      }
    })
  }, [rankings, searchQuery, filterPosition, filterStatus, sortBy])

  const handleMetricClick = (metricTitle: string) => {
    switch (metricTitle) {
      case "Active Rankings":
        setFilterStatus("active")
        // addNotification("Filtered to show active rankings", "info") // Replaced by NotificationCenter
        break
      case "Total Rankings":
        setFilterStatus("all")
        setFilterPosition("all")
        setSearchQuery("")
        setSortBy("newest")
        // addNotification("Showing all rankings", "info") // Replaced by NotificationCenter
        document.querySelector(".bg-white.rounded-lg.border.border-gray-200")?.scrollIntoView({ behavior: "smooth" })
        break
      case "This Month":
        // Filter to show rankings created this month
        const thisMonthRankings = rankings.filter((r) => {
          const created = new Date(r.created_at)
          const now = new Date()
          return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
        })
        if (thisMonthRankings.length > 0) {
          setSortBy("newest")
          // addNotification(`Showing ${thisMonthRankings.length} rankings created this month`, "info") // Replaced by NotificationCenter
        } else {
          // addNotification("No rankings created this month", "info") // Replaced by NotificationCenter
        }
        break
      case "Total Applications":
        if (rankings.length > 0) {
          setSortBy("most-applications")
          // addNotification("Sorted by most applications", "info") // Replaced by NotificationCenter
        } else {
          // addNotification("No rankings available to view applications", "info") // Replaced by NotificationCenter
        }
        break
      default:
        break
    }
  }

  if (showSettings) {
    return (
      <SettingsComponent
        onBack={() => setShowSettings(false)}
        userEmail={user.email}
        // onNotification={addNotification} // Replaced by NotificationCenter
      />
    )
  }

  if (showRankingBuilder) {
    return (
      <RankingBuilder
        ranking={selectedRanking}
        onBack={() => setShowRankingBuilder(false)}
        onComplete={handleRankingComplete}
        // onNotification={addNotification} // Replaced by NotificationCenter
      />
    )
  }

  if (showResults && selectedRanking) {
    return (
      <ResultsDashboard
        rankingId={selectedRanking.id} // Pass rankingId instead of ranking object
        onBack={() => {
          setShowResults(false)
          setSelectedRanking(null)
        }}
        // onNotification={addNotification} // Replaced by NotificationCenter
      />
    )
  }

  if (showVideoCalls) {
    return (
      <VideoCallManager
        rankings={rankings}
        onBack={handleShowRankings} /* onNotification={addNotification} */
        user={user}
      />
    )
  }

  const metrics = [
    {
      title: "Active Rankings",
      value: rankings.filter((r) => r.is_active).length.toString(),
      icon: BarChart3,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
      textColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Total Rankings",
      value: rankings.length.toString(),
      icon: Users,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      textColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "This Month",
      value: rankings
        .filter((r) => {
          const created = new Date(r.created_at)
          const now = new Date()
          return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
        })
        .length.toString(),
      icon: Calendar,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      textColor: "text-purple-600 dark:text-purple-400",
    },
    {
      title: "Total Applications",
      value: rankings.reduce((sum, r) => sum + (r.applications_count || 0), 0).toString(),
      icon: CheckCircle,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      textColor: "text-orange-600 dark:text-orange-400",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-border bg-background">
          <div className="px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowMobileSidebar(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <Menu className="h-6 w-6 text-foreground" />
              </button>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-foreground font-work-sans">HR Dashboard</h1>
                  <p className="text-sm text-muted-foreground font-open-sans hidden sm:block">
                    Welcome back, {user.email}
                  </p>
                </div>
              </div>

              <div className="hidden sm:flex items-center space-x-4">
                <div className="flex bg-muted rounded-lg p-1">
                  <button
                    onClick={handleShowRankings}
                    className={`px-4 py-2 sm:px-6 sm:py-3 rounded-md text-sm font-semibold transition-all duration-300 font-work-sans ${
                      activeTab === "rankings"
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-muted-foreground/10"
                    }`}
                  >
                    Rankings
                  </button>
                  <button
                    onClick={handleShowVideoCalls}
                    className={`px-4 py-2 sm:px-6 sm:py-3 rounded-md text-sm font-semibold transition-all duration-300 font-work-sans ${
                      activeTab === "videocalls"
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-muted-foreground/10"
                    }`}
                  >
                    Video Calls
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2 sm:space-x-4">
                <NotificationCenter user={user} />

                <button
                  onClick={() => setShowSettings(true)}
                  className="hidden sm:flex items-center space-x-2 p-3 hover:bg-muted rounded-lg transition-colors"
                >
                  <Settings className="h-5 w-5 text-foreground" />
                  <span className="text-foreground font-medium font-work-sans hidden lg:block">Settings</span>
                </button>

                <button
                  onClick={onLogout}
                  className="flex items-center space-x-2 p-2 sm:p-3 hover:bg-muted rounded-lg transition-colors"
                >
                  <LogOut className="h-5 w-5 text-foreground" />
                  <span className="text-foreground font-medium font-work-sans hidden lg:block">Sign Out</span>
                </button>
              </div>
            </div>

            <div className="sm:hidden mt-4">
              <div className="flex bg-muted rounded-lg p-1">
                <button
                  onClick={handleShowRankings}
                  className={`flex-1 py-3 px-4 rounded-md text-sm font-semibold transition-all duration-300 font-work-sans ${
                    activeTab === "rankings" ? "bg-primary text-primary-foreground" : "text-foreground"
                  }`}
                >
                  Rankings
                </button>
                <button
                  onClick={handleShowVideoCalls}
                  className={`flex-1 py-3 px-4 rounded-md text-sm font-semibold transition-all duration-300 font-work-sans ${
                    activeTab === "videocalls" ? "bg-primary text-primary-foreground" : "text-foreground"
                  }`}
                >
                  Video Calls
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Sidebar */}
        {showMobileSidebar && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowMobileSidebar(false)}></div>
            <div className="fixed left-0 top-0 h-full w-80 bg-background border-r border-border">
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold text-foreground font-work-sans">Quick Actions</h2>
                  <button onClick={() => setShowMobileSidebar(false)} className="p-2 rounded-lg hover:bg-muted">
                    <X className="h-5 w-5 text-foreground" />
                  </button>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      handleCreateRanking()
                      setShowMobileSidebar(false)
                    }}
                    className="flex items-center space-x-3 w-full p-4 text-left hover:bg-muted rounded-lg transition-colors group"
                  >
                    <Plus className="h-5 w-5 text-primary" />
                    <span className="font-medium text-foreground font-work-sans">Create New Ranking</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
                  </button>

                  <button
                    onClick={() => {
                      setShowSettings(true)
                      setShowMobileSidebar(false)
                    }}
                    className="flex items-center space-x-3 w-full p-4 text-left hover:bg-muted rounded-lg transition-colors group"
                  >
                    <Settings className="h-5 w-5 text-primary" />
                    <span className="font-medium text-foreground font-work-sans">Settings</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
                  </button>

                  <button
                    onClick={() => {
                      handleShowVideoCalls()
                      setShowMobileSidebar(false)
                    }}
                    className="flex items-center space-x-3 w-full p-4 text-left hover:bg-muted rounded-lg transition-colors group"
                  >
                    <Calendar className="h-5 w-5 text-primary" />
                    <span className="font-medium text-foreground font-work-sans">Manage Video Calls</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Main Content Area */}
            <div className="flex-1">
              {/* Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                {metrics.map((metric, index) => (
                  <div
                    key={index}
                    onClick={() => handleMetricClick(metric.title)}
                    className="bg-card border border-border rounded-lg p-6 cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2 font-work-sans">{metric.title}</p>
                        <p className="text-3xl font-bold text-foreground font-work-sans">{metric.value}</p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <metric.icon className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Rankings Section */}
              <div className="bg-card border border-border rounded-lg">
                <div className="px-4 sm:px-6 py-4 sm:py-6 border-b border-border">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-foreground font-work-sans">Job Rankings</h2>
                      <p className="text-sm text-muted-foreground font-open-sans">Manage your hiring campaigns</p>
                    </div>
                    <button
                      onClick={handleCreateRanking}
                      className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-work-sans font-semibold"
                    >
                      <Plus className="h-5 w-5" />
                      <span>New Ranking</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                      <Input
                        placeholder="Search rankings by title, position, or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 pr-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
                      <Select value={filterPosition} onValueChange={setFilterPosition}>
                        <SelectTrigger className="w-full sm:w-48 h-12 bg-muted border border-border rounded-lg hover:border-primary/50 transition-colors">
                          <SelectValue placeholder="Filter by position" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border border-border rounded-lg">
                          <SelectItem value="all">All Positions</SelectItem>
                          <SelectItem value="kitchen-helper">Kitchen Helper</SelectItem>
                          <SelectItem value="server/waiter">Server/Waiter</SelectItem>
                          <SelectItem value="housekeeping">Housekeeping</SelectItem>
                          <SelectItem value="cashier">Cashier</SelectItem>
                          <SelectItem value="barista">Barista</SelectItem>
                          <SelectItem value="gardener">Gardener</SelectItem>
                          <SelectItem value="receptionist">Receptionist</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-full sm:w-40 h-12 bg-muted border border-border rounded-lg hover:border-primary/50 transition-colors">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border border-border rounded-lg">
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-full sm:w-52 h-12 bg-muted border border-border rounded-lg hover:border-primary/50 transition-colors">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border border-border rounded-lg">
                          <SelectItem value="newest">Newest First</SelectItem>
                          <SelectItem value="oldest">Oldest First</SelectItem>
                          <SelectItem value="title-az">Title (A-Z)</SelectItem>
                          <SelectItem value="title-za">Title (Z-A)</SelectItem>
                          <SelectItem value="position-az">Position (A-Z)</SelectItem>
                          <SelectItem value="position-za">Position (Z-A)</SelectItem>
                          <SelectItem value="most-applications">Most Applications</SelectItem>
                          <SelectItem value="least-applications">Least Applications</SelectItem>
                        </SelectContent>
                      </Select>

                      {(searchQuery.trim() ||
                        filterPosition !== "all" ||
                        filterStatus !== "all" ||
                        sortBy !== "newest") && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSearchQuery("")
                            setFilterPosition("all")
                            setFilterStatus("all")
                            setSortBy("newest")
                          }}
                          className="flex items-center gap-2 h-12 px-6 border border-border rounded-lg text-foreground hover:bg-muted transition-colors font-work-sans"
                        >
                          <X className="w-4 h-4" />
                          Clear Filters
                        </Button>
                      )}
                    </div>

                    <div className="text-sm text-muted-foreground font-open-sans">
                      Showing {filteredAndSortedRankings.length} of {rankings.length} rankings
                    </div>
                  </div>
                </div>

                {/* Rankings List */}
                {loading ? (
                  <div className="p-12 text-center">
                    <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin mx-auto"></div>
                    <p className="text-muted-foreground mt-6 font-open-sans">Loading rankings...</p>
                  </div>
                ) : filteredAndSortedRankings.length === 0 ? (
                  <div className="p-12 text-center">
                    {rankings.length === 0 ? (
                      <>
                        <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center mx-auto mb-6">
                          <BarChart3 className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-3 font-work-sans">No rankings yet</h3>
                        <p className="text-muted-foreground mb-8 font-open-sans max-w-md mx-auto">
                          Create your first ranking to start hiring with AI-powered candidate evaluation
                        </p>
                        <button
                          onClick={handleCreateRanking}
                          className="flex items-center space-x-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors mx-auto font-work-sans font-semibold"
                        >
                          <Plus className="h-5 w-5" />
                          <span>Create First Ranking</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center mx-auto mb-6">
                          <Search className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-3 font-work-sans">
                          No rankings match your filters
                        </h3>
                        <p className="text-muted-foreground mb-8 font-open-sans max-w-md mx-auto">
                          Try adjusting your search criteria or clear the filters to see all rankings
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSearchQuery("")
                            setFilterPosition("all")
                            setFilterStatus("all")
                            setSortBy("newest")
                          }}
                          className="flex items-center gap-2 mx-auto px-8 py-4 border border-border rounded-lg text-foreground hover:bg-muted transition-colors font-work-sans font-semibold"
                        >
                          <X className="w-5 h-5" />
                          Clear All Filters
                        </Button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {filteredAndSortedRankings.map((ranking) => (
                      <div key={ranking.id} className="hover:bg-muted/50 transition-colors">
                        <div className="p-4 sm:p-6 cursor-pointer" onClick={() => handleViewApplications(ranking)}>
                          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                            <div className="flex-1 w-full">
                              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-3">
                                <h3 className="text-lg font-bold text-foreground font-work-sans">{ranking.title}</h3>
                                <div className="flex flex-wrap gap-2">
                                  <span
                                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                      ranking.is_active
                                        ? "bg-primary/10 text-primary"
                                        : "bg-muted text-muted-foreground"
                                    }`}
                                  >
                                    {ranking.is_active ? "Active" : "Inactive"}
                                  </span>
                                  <span className="px-3 py-1 text-xs font-semibold bg-muted text-foreground rounded-full capitalize">
                                    {ranking.position?.replace("/", " / ") || "Position"}
                                  </span>
                                </div>
                              </div>
                              <p className="text-muted-foreground mb-3 font-open-sans">{ranking.description}</p>
                              <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-sm text-muted-foreground font-open-sans">
                                <span>Created {new Date(ranking.created_at).toLocaleDateString()}</span>
                                <span className="hidden sm:inline">•</span>
                                <span>{ranking.applications_count || 0} applications</span>
                              </div>
                            </div>
                            <div
                              className="flex items-center space-x-2 w-full sm:w-auto justify-end"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => handleCopyLink(ranking.application_link_id)}
                                className="p-3 hover:bg-muted rounded-lg transition-colors"
                                title="Copy application link"
                              >
                                <Link2 className="h-4 w-4 text-foreground" />
                              </button>
                              <button
                                onClick={() => handleEditRanking(ranking)}
                                className="p-3 hover:bg-muted rounded-lg transition-colors"
                                title="Edit ranking"
                              >
                                <Edit className="h-4 w-4 text-foreground" />
                              </button>
                              <button
                                onClick={() => handleViewApplications(ranking)}
                                className="p-3 hover:bg-muted rounded-lg transition-colors"
                                title="View applications"
                              >
                                <Eye className="h-4 w-4 text-foreground" />
                              </button>
                              <button
                                onClick={() => handleDeleteRanking(ranking)}
                                className="p-3 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Delete ranking"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="hidden lg:block w-80 space-y-6">
              {/* Quick Actions */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-xl font-bold text-foreground mb-2 font-work-sans">Quick Actions</h3>
                <p className="text-sm text-muted-foreground mb-6 font-open-sans">Common tasks and shortcuts</p>

                <div className="space-y-3">
                  <button
                    onClick={handleCreateRanking}
                    className="flex items-center space-x-3 w-full p-4 text-left hover:bg-muted rounded-lg transition-colors group"
                  >
                    <Plus className="h-5 w-5 text-primary" />
                    <span className="font-medium text-foreground font-work-sans">Create New Ranking</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
                  </button>
                  <button
                    onClick={() => {
                      if (rankings.length > 0) {
                        handleViewApplications(rankings[0])
                      }
                    }}
                    disabled={rankings.length === 0}
                    className="flex items-center space-x-3 w-full p-4 text-left hover:bg-muted rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <Users className="h-5 w-5 text-primary" />
                    <span className="font-medium text-foreground font-work-sans">View All Applications</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
                  </button>
                  <button
                    onClick={handleShowVideoCalls}
                    className="flex items-center space-x-3 w-full p-4 text-left hover:bg-muted rounded-lg transition-colors group"
                  >
                    <Calendar className="h-5 w-5 text-primary" />
                    <span className="font-medium text-foreground font-work-sans">Manage Video Calls</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
                  </button>
                  <button className="flex items-center space-x-3 w-full p-4 text-left hover:bg-muted rounded-lg transition-colors group">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <span className="font-medium text-foreground font-work-sans">Analytics Report</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
                  </button>
                </div>
              </div>

              {/* Getting Started */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-xl font-bold text-foreground mb-6 font-work-sans">Getting Started</h3>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div
                      className={`flex-shrink-0 w-8 h-8 ${rankings.length > 0 ? "bg-primary text-primary-foreground" : "bg-primary text-primary-foreground"} text-sm font-bold rounded-full flex items-center justify-center`}
                    >
                      {rankings.length > 0 ? "✓" : "1"}
                    </div>
                    <div>
                      <p
                        className={`font-bold ${rankings.length > 0 ? "text-primary" : "text-foreground"} font-work-sans`}
                      >
                        Create a ranking
                      </p>
                      <p className="text-sm text-muted-foreground font-open-sans">
                        Set up criteria and questions for a position
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-muted text-muted-foreground text-sm font-bold rounded-full flex items-center justify-center">
                      2
                    </div>
                    <div>
                      <p className="font-bold text-muted-foreground font-work-sans">Share application link</p>
                      <p className="text-sm text-muted-foreground font-open-sans">
                        Send the link to candidates to apply
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-muted text-muted-foreground text-sm font-bold rounded-full flex items-center justify-center">
                      3
                    </div>
                    <div>
                      <p className="font-bold text-muted-foreground font-work-sans">Review results</p>
                      <p className="text-sm text-muted-foreground font-open-sans">AI will rank and score candidates</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
