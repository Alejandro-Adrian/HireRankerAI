"use client"
import { Video, Calendar, Users, Send, Plus, Eye, Trash2, ArrowLeft } from "lucide-react"
import { useState, useEffect } from "react"

interface VideoCallManagerProps {
  rankings: any[]
  onBack: () => void
  onNotification: (message: string, type: "success" | "error" | "info") => void
  user: any
}

interface VideoSession {
  id: string
  title: string
  scheduled_at: string | null
  meeting_url: string
  meeting_id: string
  created_at: string
  status: "scheduled" | "active" | "completed"
  participants_count: number
}

interface Application {
  id: string
  applicant_name: string
  applicant_email: string
  ranking_title: string
  ranking_id: string
}

export default function VideoCallManager({ rankings, onBack, onNotification, user }: VideoCallManagerProps) {
  const [sessions, setSessions] = useState<VideoSession[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showSendModal, setShowSendModal] = useState(false)
  const [selectedSession, setSelectedSession] = useState<VideoSession | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [selectedRankingId, setSelectedRankingId] = useState<string>("")
  const [selectedApplicationIds, setSelectedApplicationIds] = useState<string[]>([])
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Create session form
  const [sessionTitle, setSessionTitle] = useState("")
  const [scheduledDate, setScheduledDate] = useState("")
  const [scheduledTime, setScheduledTime] = useState("")

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/video-sessions")
      if (response.ok) {
        const data = await response.json()
        setSessions(data)
      }
    } catch (error) {
      console.error("Error fetching sessions:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchApplications = async (rankingId: string) => {
    try {
      setApplications([]) // Clear previous applications
      console.log("[v0] Fetching applications for ranking:", rankingId)

      const response = await fetch(`/api/rankings/${rankingId}/applications`)
      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Raw API response:", data)

        let applicationsData = []
        if (data.applications) {
          applicationsData = data.applications
        } else if (Array.isArray(data)) {
          applicationsData = data
        } else {
          console.error("[v0] Unexpected data structure:", data)
          applicationsData = []
        }

        // Map the data to ensure we have the required fields
        const mappedApplications = applicationsData.map((app: any) => ({
          id: app.id,
          candidate_name: app.applicant_name || app.candidate_name || app.name || "Unknown Candidate",
          candidate_email: app.applicant_email || app.candidate_email || app.email || "No email",
          ranking_title: app.ranking_title || "Unknown Position",
          ranking_id: rankingId,
        }))

        console.log("[v0] Mapped applications:", mappedApplications)
        setApplications(mappedApplications)
      } else {
        console.error("[v0] Failed to fetch applications:", response.status, response.statusText)
        onNotification("Failed to load applicants", "error")
      }
    } catch (error) {
      console.error("[v0] Error fetching applications:", error)
      onNotification("Error loading applicants", "error")
    }
  }

  const generateMeetingId = () => {
    return "meeting-" + Math.random().toString(36).substring(2, 15)
  }

  const createSession = async () => {
    if (!sessionTitle.trim()) {
      onNotification("Please enter a session title", "error")
      return
    }

    const meetingId = generateMeetingId()
    const meetingUrl = `${window.location.origin}/video-call/${meetingId}?role=host`

    let scheduledAt = null
    if (scheduledDate && scheduledTime) {
      scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString()
    }

    try {
      const response = await fetch("/api/video-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: sessionTitle,
          scheduled_at: scheduledAt,
          meeting_url: meetingUrl,
          meeting_id: meetingId,
        }),
      })

      if (response.ok) {
        const data = await response.json()

        setSessions((prev) => [data, ...prev])

        onNotification("Video session created successfully! Joining now...", "success")

        setShowCreateModal(false)
        setSessionTitle("")
        setScheduledDate("")
        setScheduledTime("")

        // Navigate to the video call page
        window.location.href = meetingUrl
      } else {
        onNotification("Failed to create session", "error")
      }
    } catch (error) {
      console.error("Error creating session:", error)
      onNotification("Error creating session", "error")
    }
  }

  const sendInvitations = async () => {
    if (!selectedSession || selectedApplicationIds.length === 0) {
      onNotification("Please select a session and at least one applicant", "error")
      return
    }

    try {
      const response = await fetch("/api/video-sessions/send-invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: selectedSession.id,
          application_ids: selectedApplicationIds,
        }),
      })

      if (response.ok) {
        onNotification(`Invitations sent to ${selectedApplicationIds.length} candidates!`, "success")
        setShowSendModal(false)
        setSelectedSession(null)
        setSelectedApplicationIds([])
        setSelectedRankingId("")
      } else {
        onNotification("Failed to send invitations", "error")
      }
    } catch (error) {
      console.error("Error sending invitations:", error)
      onNotification("Error sending invitations", "error")
    }
  }

  const deleteSession = async (sessionId: string) => {
    if (!confirm("Are you sure you want to delete this session?")) return

    try {
      const response = await fetch(`/api/video-sessions/${sessionId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setSessions((prev) => prev.filter((session) => session.id !== sessionId))

        onNotification("Session deleted successfully!", "success")
      } else {
        onNotification("Failed to delete session", "error")
      }
    } catch (error) {
      console.error("Error deleting session:", error)
      onNotification("Error deleting session", "error")
    }
  }

  const handleSendInvitation = (session: VideoSession) => {
    setSelectedSession(session)
    setShowSendModal(true)
  }

  const handleRankingChange = (rankingId: string) => {
    setSelectedRankingId(rankingId)
    setSelectedApplicationIds([])
    if (rankingId) {
      setApplications([])
      fetchApplications(rankingId)
    } else {
      setApplications([])
    }
  }

  const toggleApplicationSelection = (applicationId: string) => {
    setSelectedApplicationIds((prev) =>
      prev.includes(applicationId) ? prev.filter((id) => id !== applicationId) : [...prev, applicationId],
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-emerald-50 text-emerald-800"
      case "active":
        return "bg-teal-50 text-teal-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-900/20">
      <header className="glass-card border-b border-emerald-200/20 dark:border-emerald-800/20 sticky top-0 z-40">
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-1 sm:space-x-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-all duration-200 hover:scale-105"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Back</span>
              </button>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Video Calls
                </h1>
                <p className="text-xs sm:text-sm text-emerald-600/70 dark:text-emerald-400/70 hidden sm:block">
                  Create and manage interview sessions
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 text-sm sm:text-base"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Create Session</span>
              <span className="sm:hidden">Create</span>
            </button>
          </div>
        </div>
      </header>

      <div className="p-4 sm:p-6">
        <div className="glass-card border border-emerald-200/20 dark:border-emerald-800/20">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-emerald-200/20 dark:border-emerald-800/20">
            <h2 className="text-base sm:text-lg font-semibold text-emerald-900 dark:text-emerald-100">
              Video Sessions
            </h2>
          </div>

          {loading ? (
            <div className="p-8 sm:p-12 text-center">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-emerald-600 mx-auto"></div>
              <p className="text-emerald-600/70 dark:text-emerald-400/70 mt-4 text-sm sm:text-base">
                Loading sessions...
              </p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <Video className="h-12 w-12 sm:h-16 sm:w-16 text-emerald-300 dark:text-emerald-600 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-emerald-900 dark:text-emerald-100 mb-2">
                No video sessions yet
              </h3>
              <p className="text-emerald-600/70 dark:text-emerald-400/70 mb-6 text-sm sm:text-base px-4">
                Create your first video session to start interviewing candidates
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 mx-auto text-sm sm:text-base"
              >
                <Plus className="h-4 w-4" />
                <span>Create First Session</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-emerald-200/20 dark:divide-emerald-800/20">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="p-4 sm:p-6 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-all duration-200"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
                        <h3 className="text-base sm:text-lg font-medium text-emerald-900 dark:text-emerald-100">
                          {session.title}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full w-fit ${getStatusColor(session.status)} dark:bg-opacity-20`}
                        >
                          {session.status}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-emerald-600/70 dark:text-emerald-400/70 mb-2">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>{session.scheduled_at ? new Date(session.scheduled_at).toLocaleString() : "ASAP"}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>{session.participants_count || 0} participants</span>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-emerald-600/60 dark:text-emerald-400/60 font-mono">
                        ID: {session.meeting_id}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-emerald-200/20 dark:border-emerald-800/20">
                      <button
                        onClick={() => handleSendInvitation(session)}
                        className="flex-1 sm:flex-none flex items-center justify-center space-x-1 px-3 py-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all duration-200 hover:scale-105 text-sm"
                      >
                        <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>Send</span>
                      </button>
                      <button
                        onClick={() => window.open(session.meeting_url, "_blank")}
                        className="flex-1 sm:flex-none flex items-center justify-center space-x-1 px-3 py-2 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-all duration-200 hover:scale-105 text-sm"
                      >
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>Join as Host</span>
                      </button>
                      <button
                        onClick={() => deleteSession(session.id)}
                        className="p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 hover:scale-105"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card border border-emerald-200/20 dark:border-emerald-800/20 rounded-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100 mb-4">Create Video Session</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-1">
                  Session Title
                </label>
                <input
                  type="text"
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                  className="input-field w-full"
                  placeholder="e.g., Frontend Developer Interview"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-1">
                    Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="input-field w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-1">
                    Time (Optional)
                  </label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="input-field w-full"
                  />
                </div>
              </div>

              <p className="text-xs sm:text-sm text-emerald-600/70 dark:text-emerald-400/70 bg-emerald-50/50 dark:bg-emerald-900/20 p-3 rounded-lg">
                Leave date and time empty for ASAP scheduling (session starts immediately)
              </p>
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 text-emerald-700 dark:text-emerald-300 bg-emerald-100/50 dark:bg-emerald-900/20 rounded-lg hover:bg-emerald-200/50 dark:hover:bg-emerald-800/30 transition-all duration-200"
              >
                Cancel
              </button>
              <button onClick={createSession} className="btn-primary flex-1 px-4 py-2">
                Create Session
              </button>
            </div>
          </div>
        </div>
      )}

      {showSendModal && selectedSession && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card border border-emerald-200/20 dark:border-emerald-800/20 rounded-xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-base sm:text-lg font-semibold text-emerald-900 dark:text-emerald-100 mb-4">
              Send Invitation: {selectedSession.title}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-1">
                  Select Ranking
                </label>
                <select
                  value={selectedRankingId}
                  onChange={(e) => handleRankingChange(e.target.value)}
                  className="input-field w-full"
                >
                  <option value="">Choose a ranking...</option>
                  {rankings.map((ranking) => (
                    <option key={ranking.id} value={ranking.id}>
                      {ranking.title} ({ranking.applications_count || 0} applications)
                    </option>
                  ))}
                </select>
              </div>

              {selectedRankingId && applications.length === 0 && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-emerald-600 mx-auto mb-2"></div>
                  <p className="text-xs sm:text-sm text-emerald-600/70 dark:text-emerald-400/70">
                    Loading applicants...
                  </p>
                </div>
              )}

              {applications.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-2">
                    Select Applicants ({applications.length} available)
                  </label>
                  <div className="max-h-48 sm:max-h-60 overflow-y-auto border border-emerald-200/20 dark:border-emerald-800/20 rounded-lg">
                    {applications.map((application) => (
                      <div
                        key={application.id}
                        className="flex items-center space-x-3 p-3 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 border-b border-emerald-100/50 dark:border-emerald-800/20 last:border-b-0 transition-colors duration-200"
                      >
                        <input
                          type="checkbox"
                          checked={selectedApplicationIds.includes(application.id)}
                          onChange={() => toggleApplicationSelection(application.id)}
                          className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-emerald-300 dark:border-emerald-600 rounded bg-white dark:bg-gray-700"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-emerald-900 dark:text-emerald-100 truncate">
                            {application.candidate_name}
                          </p>
                          <p className="text-xs sm:text-sm text-emerald-600/70 dark:text-emerald-400/70 truncate">
                            {application.candidate_email}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-emerald-600/70 dark:text-emerald-400/70 mt-2 bg-emerald-50/50 dark:bg-emerald-900/20 p-2 rounded">
                    {selectedApplicationIds.length} of {applications.length} applicants selected
                  </p>
                </div>
              )}

              {!selectedRankingId && (
                <div className="text-center py-6 sm:py-8 text-emerald-600/70 dark:text-emerald-400/70">
                  <Users className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2 text-emerald-300 dark:text-emerald-600" />
                  <p className="text-sm">Please select a ranking to view applicants</p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
              <button
                onClick={() => setShowSendModal(false)}
                className="flex-1 px-4 py-2 text-emerald-700 dark:text-emerald-300 bg-emerald-100/50 dark:bg-emerald-900/20 rounded-lg hover:bg-emerald-200/50 dark:hover:bg-emerald-800/30 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={sendInvitations}
                disabled={selectedApplicationIds.length === 0}
                className="btn-primary flex-1 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send Invitations ({selectedApplicationIds.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
