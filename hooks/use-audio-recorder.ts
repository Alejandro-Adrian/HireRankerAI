"use client"

import { useState, useRef, useCallback } from "react"

interface UseAudioRecorderProps {
  token: string
  sessionId: string
  chunkDurationMs?: number
}

export function useAudioRecorder({ token, sessionId, chunkDurationMs = 5000 }: UseAudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunkIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const startRecording = useCallback(async () => {
    try {
      setError(null)

      // Request user's microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Create MediaRecorder
      const mimeType = "audio/webm"
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType,
        audioBitsPerSecond: 128000,
      })
      mediaRecorderRef.current = mediaRecorder

      const chunks: Blob[] = []

      // Collect audio data
      mediaRecorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      })

      // Upload chunks periodically
      chunkIntervalRef.current = setInterval(() => {
        if (chunks.length > 0) {
          const audioBlob = new Blob(chunks, { type: mimeType })
          uploadChunk(audioBlob)
          chunks.length = 0
        }
      }, chunkDurationMs)

      mediaRecorder.start(chunkDurationMs)
      setIsRecording(true)

      console.log("[v0] Audio recording started")
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to start recording"
      setError(errorMsg)
      console.error("[v0] Error starting recording:", err)
    }
  }, [chunkDurationMs])

  const uploadChunk = useCallback(
    async (audioBlob: Blob) => {
      try {
        const formData = new FormData()
        formData.append("audio", audioBlob, `chunk_${Date.now()}.webm`)
        formData.append("session_id", sessionId)

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

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`)
        }

        console.log("[v0] Audio chunk uploaded successfully")
      } catch (err) {
        console.error("[v0] Error uploading chunk:", err)
        // Don't set error state for individual chunk failures
      }
    },
    [token, sessionId],
  )

  const stopRecording = useCallback(async () => {
    try {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop()

        // Clear the chunk interval
        if (chunkIntervalRef.current) {
          clearInterval(chunkIntervalRef.current)
        }

        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop())
        }

        setIsRecording(false)
        console.log("[v0] Audio recording stopped")

        // Optional: Trigger merge on backend
        await mergeAudioChunks()
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to stop recording"
      setError(errorMsg)
      console.error("[v0] Error stopping recording:", err)
    }
  }, [isRecording])

  const mergeAudioChunks = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/merge_audio`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username: sessionId }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Audio chunks merged successfully:", data)
        return data
      } else {
        throw new Error(`Merge failed: ${response.statusText}`)
      }
    } catch (err) {
      console.error("[v0] Error merging audio chunks:", err)
      // Don't fail completely if merge fails
    }
  }, [token, sessionId])

  return {
    isRecording,
    error,
    startRecording,
    stopRecording,
  }
}
