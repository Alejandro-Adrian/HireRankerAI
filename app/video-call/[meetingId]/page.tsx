"use client"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { Loader2, Phone, Copy, AlertCircle, CheckCircle } from "lucide-react"
import { LiveTranscription } from "@/components/LiveTranscription"

declare global {
  interface Window {
    VideoSDKMeeting: any
  }
}

export default function VideoCallPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const meetingId = params.meetingId as string
  const role = searchParams.get("role") || "participant"
  const token = searchParams.get("token")

  const [accessAllowed, setAccessAllowed] = useState<boolean | null>(null)
  const [startTime] = useState<number>(Date.now())
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [showCompletionMessage, setShowCompletionMessage] = useState(false)
  const [participantEmail, setParticipantEmail] = useState<string>("")
  const [participantName, setParticipantName] = useState<string>("")

  const meetingContainerRef = useRef<HTMLDivElement>(null)
  const meetingRef = useRef<any>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    try {
      console.log(`[v0] Starting audio recording for ${role}...`)
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      const mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4"
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000,
      })

      mediaRecorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      })

      mediaRecorder.start(1000)
      mediaRecorderRef.current = mediaRecorder
      setIsRecording(true)
      console.log(`[v0] ${role} recording started successfully`)
    } catch (err) {
      console.error(`[v0] Failed to start recording for ${role}:`, err)
    }
  }

  const stopRecording = async () => {
    if (!mediaRecorderRef.current) {
      console.log("[v0] No recording to stop")
      return
    }

    try {
      console.log(`[v0] Stopping ${role} recording...`)
      setIsRecording(false)
      mediaRecorderRef.current.stop()

      await new Promise((resolve) => setTimeout(resolve, 500))

      if (audioChunksRef.current.length > 0) {
        const mimeType = mediaRecorderRef.current.mimeType
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
        const extension = mimeType.includes("webm") ? "webm" : "mp4"

        const formData = new FormData()
        formData.append("audio", audioBlob, `recording-${meetingId}-${role}.${extension}`)
        formData.append("sessionId", meetingId)
        formData.append("participantRole", role)
        formData.append("participantName", participantName || (role === "host" ? "Host" : "Participant"))

        console.log(`[v0] Submitting ${role} recording for transcription...`)
        console.log(`[v0] Audio blob size: ${audioBlob.size} bytes`)

        const transcribeResponse = await fetch("/api/transcription/video-session-batch", {
          method: "POST",
          body: formData,
        })

        if (transcribeResponse.ok) {
          const result = await transcribeResponse.json()
          console.log(`[v0] ${role} recording submitted successfully:`, result)
        } else {
          const errorText = await transcribeResponse.text()
          console.error(`[v0] Failed to submit ${role} recording:`, transcribeResponse.status, errorText)
        }

        audioChunksRef.current = []
      }

      mediaRecorderRef.current = null
    } catch (err) {
      console.error(`[v0] Error stopping ${role} recording:`, err)
    }
  }

  const handleEndCall = async () => {
    try {
      console.log("[v0] handleEndCall triggered, role:", role)

      setShowCompletionMessage(true)

      if (isRecording) {
        console.log("[v0] Stopping recording in background...")
        stopRecording().catch((err) => console.error("[v0] Error stopping recording:", err))
      }

      if (meetingRef.current && typeof meetingRef.current.end === "function") {
        try {
          meetingRef.current.end()
        } catch (e) {
          console.warn("[v0] Error calling meeting.end():", e)
        }
      } else if (meetingRef.current && typeof meetingRef.current.leave === "function") {
        try {
          meetingRef.current.leave()
        } catch (e) {
          console.warn("[v0] Error calling meeting.leave():", e)
        }
      }

      const durationSeconds = Math.floor((Date.now() - startTime) / 1000)

      if (role === "host") {
        fetch(`/api/video-sessions/${meetingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "completed",
            ended_at: new Date().toISOString(),
            duration_seconds: durationSeconds,
          }),
        }).catch((err) => console.error("[v0] Failed to update session:", err))

        setTimeout(() => router.push("/dashboard"), 1500)
      }
    } catch (err) {
      console.error("[v0] Error ending call:", err)
      setShowCompletionMessage(true)
      if (role === "host") {
        setTimeout(() => router.push("/dashboard"), 1500)
      }
    }
  }

  useEffect(() => {
    const initMeeting = async () => {
      try {
        const accessResponse = await fetch("/api/video-call/check-access", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ meetingId, token }),
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

        if (accessData.participantName) setParticipantName(accessData.participantName)
        if (accessData.participantEmail) setParticipantEmail(accessData.participantEmail)

        if (role === "host") {
          try {
            console.log("[v0] Creating session record for meeting:", meetingId)
            const sessionResponse = await fetch("/api/video-sessions/ensure-session", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                meeting_id: meetingId,
                role,
              }),
            })
            if (sessionResponse.ok) {
              console.log("[v0] Session ensured in database")
            }
          } catch (err) {
            console.error("[v0] Error ensuring session:", err)
          }
        }

        setAccessAllowed(true)

        const tokenResponse = await fetch("/api/video-sdk/create-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            meetingId,
            isHost: role === "host",
            userName: participantName || (role === "host" ? "Host" : "Participant"),
          }),
        })

        const tokenData = await tokenResponse.json()
        if (!tokenResponse.ok) {
          throw new Error(tokenData.error || "Failed to create token")
        }

        const script = document.createElement("script")
        script.src = "https://sdk.videosdk.live/rtc-js-prebuilt/0.3.43/rtc-js-prebuilt.js"
        script.type = "text/javascript"
        script.async = true

        script.onload = () => {
          let attempts = 0
          const checkAndInit = setInterval(() => {
            if (window.VideoSDKMeeting) {
              clearInterval(checkAndInit)

              try {
                const config = {
                  name: participantName || (role === "host" ? "Host" : "Participant"),
                  meetingId: meetingId,
                  apiKey: tokenData.apiKey,
                  containerId: "videosdk-container",
                  micEnabled: true,
                  webcamEnabled: true,
                  participantCanToggleSelfWebcam: true,
                  participantCanToggleSelfMic: true,
                  chatEnabled: true,
                  screenShareEnabled: true,
                  joinScreen: {
                    visible: true,
                  },
                }

                const meeting = new window.VideoSDKMeeting()
                meetingRef.current = meeting
                meeting.init(config)
                setLoading(false)
              } catch (err: any) {
                console.error("[v0] Error initializing meeting:", err)
                setError(err.message || "Failed to initialize meeting")
                setLoading(false)
              }
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
  }, [meetingId, role, token])

  useEffect(() => {
    if (!loading && accessAllowed && !isRecording && meetingRef.current) {
      const timer = setTimeout(() => {
        console.log(`[v0] Auto-starting recording for ${role}...`)
        startRecording()
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [loading, accessAllowed, isRecording, role])

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
              onClick={() => router.push("/dashboard")}
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
    <main className="h-screen w-full bg-black flex flex-col overflow-hidden">
      {showCompletionMessage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="text-center">
            {role === "host" ? (
              <>
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 p-4">
                    <CheckCircle className="h-8 w-8 text-emerald-600" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Call Ended</h2>
                <p className="text-gray-300 mb-4">Returning to dashboard...</p>
                <p className="text-sm text-gray-400">Your session recording is being processed</p>
              </>
            ) : (
              <>
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 p-4">
                    <CheckCircle className="h-8 w-8 text-emerald-600" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Thank You!</h2>
                <p className="text-gray-300 mb-4">Your interview has been completed successfully</p>
                <p className="text-sm text-gray-400">
                  We appreciate your time. Our team will review your responses shortly.
                </p>
                <button
                  onClick={() => router.push("/")}
                  className="mt-6 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  Return to Home
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <header className="flex-shrink-0 bg-card border-b border-border px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">
              Interview Session ({role === "host" ? "Host" : "Participant"})
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">Meeting ID: {meetingId}</p>
          </div>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto sm:flex-nowrap sm:gap-3">
            {role === "host" && (
              <button
                onClick={() => {
                  const participantLink = `${window.location.origin}/video-call/${meetingId}`
                  navigator.clipboard.writeText(participantLink)
                  setCopied(true)
                  setTimeout(() => setCopied(false), 2000)
                }}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm whitespace-nowrap flex items-center justify-center gap-2 min-h-10"
              >
                <Copy className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline">{copied ? "Copied!" : "Copy Link"}</span>
                <span className="sm:hidden">{copied ? "✓" : "Link"}</span>
              </button>
            )}

            <button
              onClick={handleEndCall}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors font-medium text-sm whitespace-nowrap flex items-center justify-center gap-2 min-h-10"
            >
              <Phone className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">End Call</span>
              <span className="sm:hidden">End</span>
            </button>
          </div>
        </div>
      </header>

      <LiveTranscription isRecording={isRecording} stream={null} meetingId={meetingId} />

      <div className="flex-1 w-full overflow-hidden bg-black">
        <div id="videosdk-container" className="w-full h-full" ref={meetingContainerRef} />
      </div>
    </main>
  )
}
