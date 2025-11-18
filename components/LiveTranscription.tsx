"use client"
import { useState, useEffect } from "react"
import { Mic, CheckCircle2 } from 'lucide-react'

interface LiveTranscriptionProps {
  stream: MediaStream | null
  isRecording: boolean
  meetingId?: string
}

export function LiveTranscription({ isRecording }: LiveTranscriptionProps) {
  // The actual transcription happens at end-call using the working batch API

  if (!isRecording) return null

  return (
    <div className="w-full bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-200 dark:border-emerald-800 px-4 sm:px-6 py-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse"></div>
          <Mic className="h-4 w-4 text-emerald-600" />
          <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
            Audio recording in progress
          </span>
        </div>
        <span className="text-xs text-emerald-700 dark:text-emerald-300 ml-auto">
          Transcription will be available after call ends
        </span>
      </div>
    </div>
  )
}
