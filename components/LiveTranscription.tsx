"use client"
import { useState } from "react"
import { AlertCircle } from 'lucide-react'

interface LiveTranscriptionProps {
  stream: MediaStream | null
  isRecording: boolean
}

export function LiveTranscription({ stream, isRecording }: LiveTranscriptionProps) {
  // Post-call transcription will handle everything after call ends
  
  if (!isRecording) return null

  return (
    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
      <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-amber-600 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="truncate">
          <span className="text-amber-600">Audio recording in progress</span>
          <span className="text-muted-foreground ml-1">(transcription after call)</span>
        </p>
      </div>
    </div>
  )
}
