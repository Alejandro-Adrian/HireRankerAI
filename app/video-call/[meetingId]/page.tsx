"use client"
import { useParams, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Loader2, Phone, Copy, Mic, MicOff } from "lucide-react"
import { useAudioRecorder } from "@/hooks/use-audio-recorder"

export default function VideoCallPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const meetingId = params.meetingId as string
  const role = searchParams.get("role") || "participant"

  const [roomUrl, setRoomUrl] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [token, setToken] = useState<string>("")

  const {
    isRecording,
    error: recordingError,
    startRecording,
    stopRecording,
  } = useAudioRecorder({
    token: token,
    sessionId: meetingId,
  })

  useEffect(() => {
    const initializeRoom = async () => {
      try {
        // Get auth token for audio upload
        const tokenResponse = await fetch("/api/auth/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: meetingId }),
        })
        const tokenData = await tokenResponse.json()
        if (tokenData.token) {
          setToken(tokenData.token)
        }

        const response = await fetch("/api/jitsi/rooms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ meetingId, isHost: role === "host" }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to create room")
        }

        setRoomUrl(data.roomUrl)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    initializeRoom()
  }, [meetingId, role])

  const copyMeetingLink = () => {
    const participantLink = `${window.location.origin}/video-call/${meetingId}`
    navigator.clipboard.writeText(participantLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Setting up your meeting...</h2>
          <p className="text-muted-foreground">Please wait</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-foreground mb-4">Unable to join meeting</h2>
            <p className="text-destructive mb-6">{error}</p>
            <button
              onClick={() => (window.location.href = "/dashboard")}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center justify-between p-4 bg-card border-b border-border flex-shrink-0">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg md:text-xl font-bold text-foreground truncate">
            Interview Session ({role === "host" ? "Host" : "Participant"})
          </h1>
          <p className="text-muted-foreground text-xs md:text-sm truncate">Meeting ID: {meetingId}</p>
        </div>
        <div className="flex gap-2 ml-4">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`px-3 py-2 md:px-4 rounded-lg transition-colors text-xs md:text-sm font-medium whitespace-nowrap flex items-center gap-2 ${
              isRecording
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : "bg-emerald-600 text-white hover:bg-emerald-700"
            }`}
            disabled={recordingError ? true : false}
          >
            {isRecording ? (
              <>
                <MicOff className="h-4 w-4" />
                <span>Stop Recording</span>
              </>
            ) : (
              <>
                <Mic className="h-4 w-4" />
                <span>Start Recording</span>
              </>
            )}
          </button>
          {role === "host" && (
            <button
              onClick={copyMeetingLink}
              className="px-3 py-2 md:px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-xs md:text-sm font-medium whitespace-nowrap flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              <span>{copied ? "Copied!" : "Copy Link"}</span>
            </button>
          )}
          <button
            onClick={() => (window.location.href = "/dashboard")}
            className="px-3 py-2 md:px-4 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors text-xs md:text-sm font-medium whitespace-nowrap flex items-center gap-2"
          >
            <Phone className="h-4 w-4" />
            <span>End Call</span>
          </button>
        </div>
      </header>

      {recordingError && (
        <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-2 text-destructive text-sm">
          Recording error: {recordingError}
        </div>
      )}
      {isRecording && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-200 dark:border-emerald-800 px-4 py-2 text-emerald-800 dark:text-emerald-200 text-sm flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse"></div>
          Audio is being recorded and uploaded
        </div>
      )}

      <div className="flex-1 relative bg-black">
        <iframe
          src={roomUrl}
          className="absolute inset-0 w-full h-full"
          style={{ border: "none" }}
          allow="camera; microphone; fullscreen; speaker; display-capture; autoplay; clipboard-read; clipboard-write"
          allowFullScreen
          title="Video Conference"
        />
      </div>
    </main>
  )
}
  