"use client"

import { useState, useEffect } from "react"
import { Mic, MicOff, RefreshCw, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AudioTestPage() {
  const [isRecording, setIsRecording] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [token, setToken] = useState<string>("")
  const [sessionId, setSessionId] = useState("test-session-" + Date.now())
  const [uploadedChunks, setUploadedChunks] = useState<number>(0)
  const [logs, setLogs] = useState<string[]>([])
  const [isMerging, setIsMerging] = useState(false)
  const [mergeStatus, setMergeStatus] = useState<string | null>(null)

  // Initialize token
  useEffect(() => {
    const getToken = async () => {
      try {
        const response = await fetch("/api/auth/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: sessionId }),
        })
        const data = await response.json()
        if (data.token) {
          setToken(data.token)
          addLog(`Token obtained: ${data.token.substring(0, 20)}...`)
        }
      } catch (err) {
        addLog(`Error getting token: ${err instanceof Error ? err.message : "Unknown error"}`)
      }
    }
    getToken()
  }, [sessionId])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`])
  }

  const startRecording = async () => {
    try {
      setError(null)
      setUploadedChunks(0)
      addLog("Starting audio recording...")

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = "audio/webm"
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000,
      })

      addLog("Audio stream captured")

      const chunks: Blob[] = []

      mediaRecorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      })

      // Upload chunks every 5 seconds
      const chunkInterval = setInterval(async () => {
        if (chunks.length > 0) {
          const audioBlob = new Blob(chunks, { type: mimeType })
          addLog(`Uploading chunk (size: ${(audioBlob.size / 1024).toFixed(2)} KB)...`)

          const formData = new FormData()
          formData.append("audio", audioBlob, `chunk_${Date.now()}.webm`)
          formData.append("session_id", sessionId)

          try {
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/upload_audio_chunk`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
                body: formData,
              },
            )

            if (response.ok) {
              setUploadedChunks((prev) => prev + 1)
              addLog(`✓ Chunk uploaded successfully (Total: ${uploadedChunks + 1})`)
            } else {
              addLog(`✗ Upload failed: ${response.statusText}`)
            }
          } catch (err) {
            addLog(`✗ Upload error: ${err instanceof Error ? err.message : "Unknown error"}`)
          }

          chunks.length = 0
        }
      }, 5000)

      setIsRecording(true)
      ;(mediaRecorder as any)._stopInterval = chunkInterval

      mediaRecorder.start(5000)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to start recording"
      setError(errorMsg)
      addLog(`Error: ${errorMsg}`)
    }
  }

  const stopRecording = () => {
    const mediaRecorders = document.querySelectorAll("audio")
    const stream = mediaRecorders[0]?.srcObject as MediaStream | undefined

    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
    }

    setIsRecording(false)
    addLog("Recording stopped")
  }

  const mergeAudio = async () => {
    try {
      setIsMerging(true)
      setMergeStatus(null)
      addLog("Requesting audio merge...")

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/merge_audio`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username: sessionId }),
      })

      const data = await response.json()

      if (response.ok) {
        setMergeStatus("Audio merged successfully!")
        addLog(`✓ Audio merge completed: ${data.message || "Success"}`)
      } else {
        setMergeStatus(`Merge failed: ${data.error || response.statusText}`)
        addLog(`✗ Merge error: ${data.error || response.statusText}`)
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error"
      setMergeStatus(`Error: ${errorMsg}`)
      addLog(`✗ Merge error: ${errorMsg}`)
    } finally {
      setIsMerging(false)
    }
  }

  const resetSession = () => {
    setSessionId("test-session-" + Date.now())
    setUploadedChunks(0)
    setLogs([])
    setMergeStatus(null)
    setError(null)
    addLog("New test session created")
  }

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Audio Chunking Test</h1>
          <p className="text-muted-foreground">
            Test the audio recording and chunking functionality without a video call
          </p>
        </div>

        {/* Session Info */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Session Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Session ID</p>
              <p className="text-foreground font-mono text-sm break-all">{sessionId}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Token Status</p>
              <p className="text-foreground text-sm">
                {token ? (
                  <span className="text-emerald-600 dark:text-emerald-400">✓ Authenticated</span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400">⏳ Loading...</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6 text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Recording Controls */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Recording Controls</h2>
          <div className="flex gap-3 flex-wrap mb-4">
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              className={`flex items-center gap-2 ${
                isRecording
                  ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
              disabled={!token}
            >
              {isRecording ? (
                <>
                  <MicOff className="h-4 w-4" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4" />
                  Start Recording
                </>
              )}
            </Button>

            <Button
              onClick={mergeAudio}
              disabled={!token || isMerging || uploadedChunks === 0}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Download className="h-4 w-4" />
              {isMerging ? "Merging..." : "Merge Audio"}
            </Button>

            <Button onClick={resetSession} variant="outline" className="flex items-center gap-2 bg-transparent">
              <RefreshCw className="h-4 w-4" />
              New Session
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-background rounded p-4">
              <p className="text-sm text-muted-foreground mb-1">Chunks Uploaded</p>
              <p className="text-2xl font-bold text-foreground">{uploadedChunks}</p>
            </div>
            <div className="bg-background rounded p-4">
              <p className="text-sm text-muted-foreground mb-1">Recording Status</p>
              <p className="text-foreground font-semibold">
                {isRecording ? (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse"></span>
                    Recording...
                  </span>
                ) : (
                  <span className="text-muted-foreground">Idle</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Merge Status */}
        {mergeStatus && (
          <div
            className={`rounded-lg p-4 mb-6 text-sm ${
              mergeStatus.startsWith("Audio merged")
                ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
                : "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200"
            }`}
          >
            {mergeStatus}
          </div>
        )}

        {/* Logs */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Event Logs</h2>
            <button
              onClick={() => setLogs([])}
              className="text-xs px-3 py-1 rounded bg-background hover:bg-muted text-foreground"
            >
              Clear Logs
            </button>
          </div>
          <div className="bg-background rounded-lg p-4 h-64 overflow-y-auto font-mono text-xs text-muted-foreground space-y-1">
            {logs.length === 0 ? (
              <p className="text-muted-foreground/50">No logs yet. Start by pressing "Start Recording"</p>
            ) : (
              logs.map((log, i) => <div key={i}>{log}</div>)
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 text-sm text-blue-800 dark:text-blue-200">
          <h3 className="font-semibold mb-2">How to use this test page:</h3>
          <ol className="list-decimal list-inside space-y-1">
            <li>Click "Start Recording" to begin capturing audio from your microphone</li>
            <li>Audio will be uploaded in 5-second chunks automatically</li>
            <li>Watch the "Chunks Uploaded" counter increase</li>
            <li>Click "Stop Recording" when done</li>
            <li>Click "Merge Audio" to merge all chunks into a single WAV file</li>
            <li>Check the Event Logs for detailed information about each step</li>
            <li>Your audio will be saved to: uploads/{"{sessionId}"}/audio/ on your API server</li>
          </ol>
        </div>
      </div>
    </main>
  )
}
