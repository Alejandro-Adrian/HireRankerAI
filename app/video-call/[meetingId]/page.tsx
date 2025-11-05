"use client"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { Loader2, Phone, Copy, Mic, MicOff, AlertCircle } from "lucide-react"
import { useAudioRecorder } from "@/hooks/use-audio-recorder"

export default function VideoCallPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const meetingId = params.meetingId as string
  const role = searchParams.get("role") || "participant"

  const [apiKey, setApiKey] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [audioToken, setAudioToken] = useState<string>("")
  const [startTime] = useState<number>(Date.now())
  const [accessAllowed, setAccessAllowed] = useState<boolean | null>(null)
  const meetingContainerRef = useRef<HTMLDivElement>(null)
  const meetingRef = useRef<any>(null)

  const {
    isRecording,
    error: recordingError,
    startRecording,
    stopRecording,
  } = useAudioRecorder({
    token: audioToken,
    sessionId: meetingId,
  })

  useEffect(() => {
    const initMeeting = async () => {
      try {
        const accessResponse = await fetch("/api/video-call/check-access", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ meetingId }),
        })

        if (!accessResponse.ok) {
          setAccessAllowed(false)
          setError("Meeting not found")
          setLoading(false)
          return
        }

        const accessData = await accessResponse.json()
        if (!accessData.allowed) {
          setAccessAllowed(false)
          setError("Meeting not found")
          setLoading(false)
          return
        }

        setAccessAllowed(true)

        // Get token and API key
        const tokenResponse = await fetch("/api/video-sdk/create-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            meetingId,
            isHost: role === "host",
            userName: role === "host" ? "Host" : "Participant",
          }),
        })

        const tokenData = await tokenResponse.json()
        if (!tokenResponse.ok) {
          throw new Error(tokenData.error || "Failed to create token")
        }

        setApiKey(tokenData.apiKey)

        // Now load the SDK script
        const script = document.createElement("script")
        script.src = "https://sdk.videosdk.live/rtc-js-prebuilt/0.3.43/rtc-js-prebuilt.js"
        script.type = "text/javascript"
        script.async = true

        script.onload = () => {
          // Wait for VideoSDKMeeting to be available
          let attempts = 0
          const checkAndInit = setInterval(() => {
            if (window.VideoSDKMeeting) {
              clearInterval(checkAndInit)
              initializeVideoMeeting(tokenData.apiKey)
            } else if (attempts > 50) {
              clearInterval(checkAndInit)
              setError("Failed to initialize VideoSDK")
              setLoading(false)
            }
            attempts++
          }, 100)
        }

        script.onerror = () => {
          setError("Failed to load VideoSDK library")
          setLoading(false)
        }

        document.head.appendChild(script)

        return () => {
          if (document.head.contains(script)) {
            document.head.removeChild(script)
          }
        }
      } catch (err: any) {
        setError(err.message)
        setLoading(false)
      }
    }

    initMeeting()
  }, [])

  const initializeVideoMeeting = (key: string) => {
    try {
      const config = {
        name: role === "host" ? "Host" : "Participant",
        meetingId: meetingId,
        apiKey: key,
        containerId: "videosdk-container",
        micEnabled: true,
        webcamEnabled: true,
        participantCanToggleSelfWebcam: true,
        participantCanToggleSelfMic: true,
        chatEnabled: true,
        screenShareEnabled: true,
        recording: {
          enabled: true,
          autoStart: false,
          theme: "DARK",
          layout: {
            type: "SIDEBAR",
            priority: "PIN",
          },
        },
        permissions: {
          toggleRecording: true,
        },
        joinScreen: {
          visible: true,
        },
      }

      const meeting = new window.VideoSDKMeeting()
      meetingRef.current = meeting
      meeting.init(config)
      setLoading(false)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const copyMeetingLink = () => {
    const participantLink = `${window.location.origin}/video-call/${meetingId}`
    navigator.clipboard.writeText(participantLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleEndCall = async () => {
    try {
      if (meetingRef.current) {
        meetingRef.current.leave()
      }

      const durationSeconds = Math.floor((Date.now() - startTime) / 1000)

      // Stop recording if active and process it
      if (isRecording) {
        await stopRecording()
      }

      // Update session as completed with duration
      await fetch(`/api/video-sessions/${meetingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "completed",
          ended_at: new Date().toISOString(),
          duration_seconds: durationSeconds,
        }),
      })

      // Redirect immediately to video-call page
      router.push("/video-call")
    } catch (err) {
      console.error("Error ending call:", err)
      // Redirect even if there's an error
      router.push("/video-call")
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Setting up your meeting...</h2>
          <p className="text-muted-foreground">Initializing VideoSDK</p>
        </div>
      </main>
    )
  }

  if (error || accessAllowed === false) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-4">Unable to join meeting</h2>
            <p className="text-destructive mb-6">{error}</p>
            <button
              onClick={() => router.push("/video-call")}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Back to Sessions
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="h-screen w-full bg-black flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 bg-card border-b border-border px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          {/* Title Section */}
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">
              Interview Session ({role === "host" ? "Host" : "Participant"})
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">Meeting ID: {meetingId}</p>
          </div>

          {/* Controls - wrap on mobile, inline on desktop */}
          <div className="flex flex-wrap gap-2 w-full sm:w-auto sm:flex-nowrap sm:gap-3">
            {/* Recording Button */}
            {role === "host" && (
              <button
                onClick={async () => {
                  // Save recording before stopping
                  const durationSeconds = Math.floor((Date.now() - startTime) / 1000)

                  try {
                    await fetch(`/api/video-sessions/${meetingId}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        recording_url: "recording-in-progress", // Mark as recorded
                        duration_seconds: durationSeconds,
                      }),
                    })
                  } catch (err) {
                    console.error("Error saving recording state:", err)
                  }

                  await stopRecording()
                }}
                disabled={recordingError ? true : false}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2.5 rounded-lg transition-colors font-medium text-sm whitespace-nowrap flex items-center justify-center gap-2 min-h-10 ${
                  isRecording
                    ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
                title={isRecording ? "Stop Recording" : "Start Recording"}
              >
                {isRecording ? (
                  <>
                    <MicOff className="h-4 w-4 flex-shrink-0" />
                    <span className="hidden sm:inline">Stop</span>
                    <span className="sm:hidden">Stop</span>
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 flex-shrink-0" />
                    <span className="hidden sm:inline">Record</span>
                    <span className="sm:hidden">Rec</span>
                  </>
                )}
              </button>
            )}

            {/* Copy Link Button - Host only */}
            {role === "host" && (
              <button
                onClick={copyMeetingLink}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm whitespace-nowrap flex items-center justify-center gap-2 min-h-10"
                title="Copy meeting link"
              >
                <Copy className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline">{copied ? "Copied!" : "Copy Link"}</span>
                <span className="sm:hidden">{copied ? "✓" : "Link"}</span>
              </button>
            )}

            {/* End Call Button */}
            <button
              onClick={handleEndCall}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors font-medium text-sm whitespace-nowrap flex items-center justify-center gap-2 min-h-10"
              title="End call"
            >
              <Phone className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">End Call</span>
              <span className="sm:hidden">End</span>
            </button>
          </div>
        </div>
      </header>

      {/* Status Messages */}
      {recordingError && (
        <div className="flex-shrink-0 bg-destructive/10 border-b border-destructive/20 px-4 sm:px-6 py-2 text-destructive text-xs sm:text-sm">
          Recording error: {recordingError}
        </div>
      )}
      {isRecording && (
        <div className="flex-shrink-0 bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-200 dark:border-emerald-800 px-4 sm:px-6 py-2 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse flex-shrink-0"></div>
          <span>Audio recording in progress</span>
        </div>
      )}

      {/* Video Container - Takes remaining space */}
      <div className="flex-1 w-full overflow-hidden bg-black">
        <div id="videosdk-container" className="w-full h-full" />
      </div>
    </main>
  )
}
