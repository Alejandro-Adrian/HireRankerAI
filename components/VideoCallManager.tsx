"use client"
import { Video, Calendar, Users, Send, Plus, Eye, Trash2, ArrowLeft } from "lucide-react"
import { useState, useEffect } from "react"
import { revalidateVideoSessions } from "@/app/actions/video-sessions"
import SuccessModal from "./SuccessModal"
import SessionSummaryModal from "./SessionSummaryModal" // Import the new SessionSummaryModal component

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

const VideoCallManager = ({ rankings, onBack, onNotification, user }: VideoCallManagerProps) => {
  const [sessions, setSessions] = useState<VideoSession[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showSendModal, setShowSendModal] = useState(false)
  const [selectedSession, setSelectedSession] = useState<VideoSession | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [selectedRankingId, setSelectedRankingId] = useState<string>("")
  const [selectedApplicationIds, setSelectedApplicationIds] = useState<string[]>([])
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState({ title: "", message: "" })

  // State for summary modal
  const [showSummaryModal, setShowSummaryModal] = useState(false)
  const [selectedSessionForSummary, setSelectedSessionForSummary] = useState<VideoSession | null>(null)

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

  const refreshSessions = async () => {
    try {
      await revalidateVideoSessions()

      const response = await fetch(`/api/video-sessions?_=${Date.now()}`, {
        method: "GET",
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setSessions(data)
        return true
      }
      return false
    } catch (error) {
      console.error("Error refreshing sessions:", error)
      return false
    }
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

        setSuccessMessage({
          title: "Session Created!",
          message: `Your video session "${sessionTitle}" has been created successfully. Click OK to proceed.`,
        })
        setShowSuccessModal(true)

        setShowCreateModal(false)
        setSessionTitle("")
        setScheduledDate("")
        setScheduledTime("")

        // Store the meeting URL to open after modal closes
        sessionStorage.setItem("meetingUrlToOpen", meetingUrl)
      } else {
        const error = await response.json()
        onNotification(error.error || "Failed to create session", "error")
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

      const data = await response.json()

      if (response.ok) {
        if (data.sent_count > 0) {
          setSuccessMessage({
            title: "Invitations Sent!",
            message: `Successfully sent invitations to ${data.sent_count} applicant${data.sent_count !== 1 ? "s" : ""}. Click OK to refresh the list.`,
          })
          setShowSuccessModal(true)

          setShowSendModal(false)
          setSelectedSession(null)
          setSelectedApplicationIds([])
          setSelectedRankingId("")
        } else {
          onNotification(data.message || "Failed to send invitations", "error")
        }
      } else {
        onNotification(data.error || "Failed to send invitations", "error")
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
        setSuccessMessage({
          title: "Session Deleted!",
          message: "The video session has been deleted successfully. Click OK to refresh the list.",
        })
        setShowSuccessModal(true)

        setSessions(sessions.filter((s) => s.id !== sessionId))
      } else {
        const error = await response.json()
        onNotification(error.error || "Failed to delete session", "error")
      }
    } catch (error) {
      console.error("Error deleting session:", error)
      onNotification("Error deleting session", "error")
    }
  }

  const handleSuccessModalOk = async () => {
    setShowSuccessModal(false)

    // Check if there's a meeting URL to open
    const meetingUrl = sessionStorage.getItem("meetingUrlToOpen")
    if (meetingUrl) {
      sessionStorage.removeItem("meetingUrlToOpen")
      await refreshSessions()
      window.open(meetingUrl, "_blank")
    } else {
      // Just refresh the sessions list
      await refreshSessions()
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

  // Function to handle viewing summary
  const handleViewSummary = (session: VideoSession) => {
    setSelectedSessionForSummary(session)
    setShowSummaryModal(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 z-40 bg-card">
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-1 sm:space-x-2 text-primary hover:text-primary/80 transition-all duration-200 hover:scale-105"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Back</span>
              </button>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-foreground">Video Calls</h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
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
        <div className="border border-border rounded-lg bg-card">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border">
            <h2 className="text-base sm:text-lg font-semibold text-foreground">Video Sessions</h2>
          </div>

          {loading ? (
            <div className="p-8 sm:p-12 text-center">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-4 text-sm sm:text-base">Loading sessions...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <Video className="h-12 w-12 sm:h-16 sm:w-16 text-muted mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-foreground mb-2">No video sessions yet</h3>
              <p className="text-muted-foreground mb-6 text-sm sm:text-base px-4">
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
            <div className="divide-y divide-border">
              {sessions.map((session) => (
                <div key={session.id} className="p-4 sm:p-6 hover:bg-muted/50 transition-all duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
                        <h3 className="text-base sm:text-lg font-medium text-foreground">{session.title}</h3>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full w-fit ${getStatusColor(session.status)}`}
                        >
                          {session.status}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-muted-foreground mb-2">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>{session.scheduled_at ? new Date(session.scheduled_at).toLocaleString() : "ASAP"}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>{session.participants_count || 0} participants</span>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground font-mono">ID: {session.meeting_id}</p>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                      {session.status === "completed" && (
                        <button
                          onClick={() => handleViewSummary(session)}
                          className="flex-1 sm:flex-none flex items-center justify-center space-x-1 px-3 py-2 text-primary hover:bg-primary/10 rounded-lg transition-all duration-200 hover:scale-105 text-sm"
                          title="View session summary"
                        >
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">Summary</span>
                        </button>
                      )}
                      {session.status !== "completed" && (
                        <>
                          <button
                            onClick={() => handleSendInvitation(session)}
                            className="flex-1 sm:flex-none flex items-center justify-center space-x-1 px-3 py-2 text-primary hover:bg-primary/10 rounded-lg transition-all duration-200 hover:scale-105 text-sm"
                          >
                            <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span>Send</span>
                          </button>
                          <button
                            onClick={() => window.open(session.meeting_url, "_blank")}
                            className="flex-1 sm:flex-none flex items-center justify-center space-x-1 px-3 py-2 text-primary hover:bg-primary/10 rounded-lg transition-all duration-200 hover:scale-105 text-sm"
                          >
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span>Join</span>
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => deleteSession(session.id)}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-all duration-200 hover:scale-105"
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
          <div className="border border-border rounded-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto bg-card">
            <h3 className="text-lg font-semibold text-foreground mb-4">Create Video Session</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Session Title</label>
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
                  <label className="block text-sm font-medium text-foreground mb-1">Date (Optional)</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="input-field w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Time (Optional)</label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="input-field w-full"
                  />
                </div>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                Leave date and time empty for ASAP scheduling (session starts immediately)
              </p>
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 text-foreground bg-muted rounded-lg hover:bg-muted/80 transition-all duration-200"
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
          <div className="border border-border rounded-xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card">
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">
              Send Invitation: {selectedSession.title}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Select Ranking</label>
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
                  <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Loading applicants...</p>
                </div>
              )}

              {applications.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Select Applicants ({applications.length} available)
                  </label>
                  <div className="max-h-48 sm:max-h-60 overflow-y-auto border border-border rounded-lg">
                    {applications.map((application) => (
                      <div
                        key={application.id}
                        className="flex items-center space-x-3 p-3 hover:bg-muted/50 border-b border-border last:border-b-0 transition-colors duration-200"
                      >
                        <input
                          type="checkbox"
                          checked={selectedApplicationIds.includes(application.id)}
                          onChange={() => toggleApplicationSelection(application.id)}
                          className="h-4 w-4 text-primary focus:ring-primary border-border rounded bg-background"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{application.candidate_name}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">
                            {application.candidate_email}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2 bg-muted p-2 rounded">
                    {selectedApplicationIds.length} of {applications.length} applicants selected
                  </p>
                </div>
              )}

              {!selectedRankingId && (
                <div className="text-center py-6 sm:py-8 text-muted-foreground">
                  <Users className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2 text-muted" />
                  <p className="text-sm">Please select a ranking to view applicants</p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
              <button
                onClick={() => setShowSendModal(false)}
                className="flex-1 px-4 py-2 text-foreground bg-muted rounded-lg hover:bg-muted/80 transition-all duration-200"
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

      {selectedSessionForSummary && (
        <SessionSummaryModal
          isOpen={showSummaryModal}
          session={selectedSessionForSummary}
          onClose={() => {
            setShowSummaryModal(false)
            setSelectedSessionForSummary(null)
          }}
        />
      )}

      <SuccessModal
        isOpen={showSuccessModal}
        title={successMessage.title}
        message={successMessage.message}
        onOk={handleSuccessModalOk}
        okButtonText="OK"
      />
    </div>
  )
}

export { VideoCallManager as default }
export { VideoCallManager }
