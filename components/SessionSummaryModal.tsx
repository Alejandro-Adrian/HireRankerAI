"use client"

import { X, Clock, FileText } from "lucide-react"

interface SessionSummaryModalProps {
  isOpen: boolean
  session: any
  onClose: () => void
}

export default function SessionSummaryModal({ isOpen, session, onClose }: SessionSummaryModalProps) {
  if (!isOpen || !session) return null

  const durationMinutes = session.duration_seconds ? Math.floor(session.duration_seconds / 60) : 0
  const durationSeconds = session.duration_seconds ? session.duration_seconds % 60 : 0

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="border border-border rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-4 sm:p-6 border-b border-border bg-card">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground">{session.title}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Session Summary</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <X className="h-5 w-5 text-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* Duration */}
          {session.duration_seconds && (
            <div className="flex items-start space-x-3">
              <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-medium text-foreground mb-1">Duration</h3>
                <p className="text-sm text-muted-foreground">
                  {durationMinutes}m {durationSeconds}s
                </p>
              </div>
            </div>
          )}

          {/* Transcript */}
          {session.transcript && (
            <div className="flex items-start space-x-3">
              <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-medium text-foreground mb-2">Transcript</h3>
                <div className="bg-muted p-4 rounded-lg text-sm text-foreground leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap break-words">
                  {session.transcript}
                </div>
              </div>
            </div>
          )}

          {/* Summary */}
          {session.summary && (
            <div className="flex items-start space-x-3">
              <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-medium text-foreground mb-2">Summary</h3>
                <div className="bg-muted p-4 rounded-lg text-sm text-foreground leading-relaxed">{session.summary}</div>
              </div>
            </div>
          )}

          {!session.transcript && !session.summary && (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">No transcript or summary available yet.</p>
              <p className="text-muted-foreground text-xs mt-2">
                Summary will appear after the session is completed and processed.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex justify-end p-4 sm:p-6 border-t border-border bg-card">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
