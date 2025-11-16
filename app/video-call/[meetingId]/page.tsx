"use client"
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from "react"
import { Loader2, Phone, Copy, AlertCircle } from 'lucide-react'
import { LiveTranscription } from "@/components/LiveTranscription"

export default function VideoCallPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const meetingId = params.meetingId as string
  const role = searchParams.get("role") || "participant"
  const token = searchParams.get("token")

  const [apiKey, setApiKey] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [audioToken, setAudioToken] = useState<string>("")
  const [startTime] = useState<number>(Date.now())
  const [accessAllowed, setAccessAllowed] = useState<boolean | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingError, setRecordingError] = useState<string | null>(null)
  const [showCompletionMessage, setShowCompletionMessage] = useState(false)

  const meetingContainerRef = useRef<HTMLDivElement>(null)
  const meetingRef = useRef<any>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    try {
      setRecordingError(null)
      console.log("[v0] Requesting microphone access...")
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      
      console.log("[v0] Audio stream obtained, track count:", stream.getAudioTracks().length)

      const mimeType = "audio/webm"
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000,
      })
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      console.log("[v0] MediaRecorder created with mimeType:", mimeType)

      mediaRecorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) {
          console.log("[v0] Audio chunk received, size:", event.data.size, "bytes")
          audioChunksRef.current.push(event.data)
        }
      })

      mediaRecorder.start()
      console.log("[v0] Recording started")
      setIsRecording(true)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to start recording"
      console.error("[v0] Recording start error:", errorMsg)
      setRecordingError(errorMsg)
    }
  }

  const stopRecording = async () => {
    try {
      if (mediaRecorderRef.current && isRecording) {
        console.log("[v0] Stopping MediaRecorder...")
        mediaRecorderRef.current.stop()

        await new Promise((resolve) => {
          const checkInterval = setInterval(() => {
            if (!mediaRecorderRef.current || mediaRecorderRef.current.state === "inactive") {
              clearInterval(checkInterval)
              resolve(null)
            }
          }, 100)
        })

        console.log("[v0] MediaRecorder stopped, total chunks:", audioChunksRef.current.length)

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop())
          console.log("[v0] Audio stream tracks stopped")
        }

        setIsRecording(false)

        if (audioChunksRef.current.length > 0) {
          const mimeType = "audio/webm"
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })

          console.log("[v0] Audio blob created, total size:", audioBlob.size, "bytes")

          const formData = new FormData()
          formData.append("audio", audioBlob, `recording-${meetingId}.webm`)
          formData.append("sessionId", meetingId)

          console.log("[v0] Submitting to /api/transcription/video-call-batch endpoint")
          const transcribeResponse = await fetch("/api/transcription/video-call-batch", {
            method: "POST",
            body: formData,
          })

          if (transcribeResponse.ok) {
            const result = await transcribeResponse.json()
            console.log("[v0] Transcription submitted successfully:", result)
          } else {
            console.error("[v0] Transcription submission failed:", transcribeResponse.status, await transcribeResponse.text())
          }
        } else {
          console.warn("[v0] No audio chunks to transcribe")
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to stop recording"
      console.error("[v0] Recording stop error:", errorMsg)
      setRecordingError(errorMsg)
    }
  }

  const handleEndCall = async () => {
    try {
      console.log("[v0] handleEndCall triggered")

      // Stop recording FIRST before ending call
      if (isRecording) {
        console.log("[v0] Stopping recording before ending call...")
        await stopRecording()
        console.log("[v0] Recording stopped")
        
        // Give a moment for the transcription to start
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      if (meetingRef.current && typeof meetingRef.current.end === "function") {
        try {
          console.log("[v0] Calling meeting.end()")
          meetingRef.current.end()
        } catch (e) {
          console.warn("[v0] Error calling meeting.end():", e)
        }
      } else if (meetingRef.current && typeof meetingRef.current.leave === "function") {
        try {
          console.log("[v0] Calling meeting.leave()")
          meetingRef.current.leave()
        } catch (e) {
          console.warn("[v0] Error calling meeting.leave():", e)
        }
      }

      const durationSeconds = Math.floor((Date.now() - startTime) / 1000)

      console.log("[v0] Updating session status to completed...")
      const updateResponse = await fetch(`/api/video-sessions/${meetingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "completed",
          ended_at: new Date().toISOString(),
          duration_seconds: durationSeconds,
        }),
      })

      if (updateResponse.ok) {
        console.log("[v0] Session updated")
      } else {
        console.error("[v0] Failed to update session:", updateResponse.status)
      }

      setShowCompletionMessage(true)
      setTimeout(() => router.push("/dashboard"), 2500)
    } catch (err) {
      console.error("[v0] Error ending call:", err)
      setShowCompletionMessage(true)
      setTimeout(() => router.push("/dashboard"), 2500)
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
          if (!sessionResponse.ok) {
            console.error("[v0] Failed to ensure session:", await sessionResponse.text())
          } else {
            console.log("[v0] Session ensured in database")
          }
        } catch (err) {
          console.error("[v0] Error ensuring session:", err)
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

  useEffect(() => {
    if (!loading && accessAllowed && !isRecording) {
      const timer = setTimeout(() => {
        console.log("[v0] Auto-starting recording...")
        startRecording()
      }, 1500) // Give the meeting a moment to fully initialize

      return () => clearTimeout(timer)
    }
  }, [loading, accessAllowed, isRecording])

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
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 p-4">
                <svg className="h-8 w-8 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Call Ended</h2>
            <p className="text-gray-300 mb-4">Your session recording is being processed</p>
            <p className="text-sm text-gray-400">Transcription and summary will be ready shortly...</p>
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

      {isRecording && (
        <div className="flex-shrink-0 bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-200 dark:border-emerald-800 px-4 sm:px-6 py-2 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse"></div>
            <span>Audio recording in progress</span>
          </div>
        </div>
      )}

      <div className="flex-1 w-full overflow-hidden bg-black">
        <div id="videosdk-container" className="w-full h-full" ref={meetingContainerRef} />
      </div>
    </main>
  )
}
