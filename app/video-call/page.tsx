"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Eye } from "lucide-react"
import VideoCallManager from "@/components/VideoCallManager"

interface Session {
  id: string
  title: string
  meeting_id: string
  meeting_url: string
  status: string
  participants_count: number
  created_at: string
  scheduled_at?: string
  transcript?: string
  summary?: string
  duration_seconds?: number
  ended_at?: string
}

export default function VideoCallPage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [showManager, setShowManager] = useState(false)

  const fetchSessions = async () => {
    try {
      const response = await fetch(`/api/video-sessions?t=${Date.now()}`)
      const data = await response.json()
      setSessions(data || [])
    } catch (err) {
      console.error("Error fetching sessions:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSessions()
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchSessions, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleViewSummary = (session: Session) => {
    setSelectedSession(session)
  }

  const handleCloseSummary = () => {
    setSelectedSession(null)
    fetchSessions()
  }

  if (showManager) {
    return <VideoCallManager rankings={[]} onBack={() => setShowManager(false)} onNotification={() => {}} user={null} />
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Loading sessions...</h2>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Video Call Sessions</h1>
            <p className="text-muted-foreground">Manage and view your interview sessions</p>
          </div>
          <button
            onClick={() => setShowManager(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Create Session
          </button>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No video sessions yet</p>
            <button
              onClick={() => setShowManager(true)}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Create First Session
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="border border-border rounded-lg p-6 bg-card hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-1">{session.title}</h3>
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                        session.status === "completed"
                          ? "bg-gray-100 text-gray-800"
                          : session.status === "active"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {session.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  <p>
                    <strong>Created:</strong> {new Date(session.created_at).toLocaleDateString()}
                  </p>
                  {session.duration_seconds && (
                    <p>
                      <strong>Duration:</strong> {Math.floor(session.duration_seconds / 60)}m{" "}
                      {session.duration_seconds % 60}s
                    </p>
                  )}
                  <p className="text-xs font-mono">ID: {session.meeting_id}</p>
                </div>

                <div className="space-y-2">
                  {session.status === "completed" && (
                    <button
                      onClick={() => handleViewSummary(session)}
                      className="w-full px-3 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View Summary
                    </button>
                  )}
                  {session.status === "active" && (
                    <button
                      onClick={() => window.open(session.meeting_url, "_blank")}
                      className="w-full px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                    >
                      Join Session
                    </button>
                  )}
                  {session.status === "scheduled" && (
                    <button
                      onClick={() => window.open(session.meeting_url, "_blank")}
                      className="w-full px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                    >
                      Join Session
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedSession && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-card rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto p-6 border border-border shadow-xl">
              <h2 className="text-2xl font-bold text-foreground mb-4">{selectedSession.title} - Summary</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Duration</h3>
                  <p className="text-muted-foreground">
                    {selectedSession.duration_seconds
                      ? `${Math.floor(selectedSession.duration_seconds / 60)} minutes ${selectedSession.duration_seconds % 60} seconds`
                      : "N/A"}
                  </p>
                </div>

                {selectedSession.transcript && (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-2">Transcript</h3>
                    <p className="text-muted-foreground text-sm bg-background p-3 rounded border border-border max-h-32 overflow-y-auto">
                      {selectedSession.transcript}
                    </p>
                  </div>
                )}

                {selectedSession.summary && (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-2">Summary</h3>
                    <p className="text-muted-foreground text-sm bg-background p-3 rounded border border-border">
                      {selectedSession.summary}
                    </p>
                  </div>
                )}

                {!selectedSession.transcript && !selectedSession.summary && (
                  <p className="text-muted-foreground text-sm italic">
                    No transcript or summary available yet. Check back soon!
                  </p>
                )}
              </div>

              <button
                onClick={handleCloseSummary}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
