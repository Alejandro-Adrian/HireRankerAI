"use client"

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { FileText, Clock, Users, AlertCircle, Loader2 } from 'lucide-react'
import SessionSummaryModal from './SessionSummaryModal'

interface SessionDetailCardProps {
  session: {
    id: string
    title: string
    meeting_id: string
    status: string
    created_at: string
    duration_seconds?: number
    participants_count?: number
    transcript?: string
    summary?: string
  }
  onRefresh?: () => void
}

export default function SessionDetailCard({ session, onRefresh }: SessionDetailCardProps) {
  const [showModal, setShowModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleRefresh = async () => {
    if (!onRefresh) return
    setIsLoading(true)
    try {
      await onRefresh()
    } finally {
      setIsLoading(false)
    }
  }

  const hasTranscription = !!(session.transcript && session.transcript.trim().length > 0)
  const hasSummary = !!(session.summary && session.summary.trim().length > 0)
  const isProcessing = session.status === 'active' || (session.status === 'completed' && !hasTranscription)

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-border bg-card">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-base sm:text-lg font-semibold text-foreground">{session.title}</h3>
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ml-2 flex-shrink-0 ${
                session.status === 'completed'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200'
                  : session.status === 'active'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200'
              }`}
            >
              {session.status}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {new Date(session.created_at).toLocaleString()}
          </p>
        </div>

        {/* Metadata */}
        <div className="px-4 sm:px-6 py-3 bg-muted/30 flex flex-wrap gap-3 text-xs sm:text-sm text-muted-foreground border-b border-border">
          {session.duration_seconds && (
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span>{Math.floor(session.duration_seconds / 60)}m {session.duration_seconds % 60}s</span>
            </div>
          )}
          {session.participants_count !== undefined && (
            <div className="flex items-center gap-2">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span>{session.participants_count} participants</span>
            </div>
          )}
        </div>

        {/* Transcription Status */}
        <div className="p-4 sm:p-6">
          {isProcessing ? (
            <div className="flex items-center justify-between p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg mb-4">
              <div className="flex items-center gap-3">
                <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400 animate-spin flex-shrink-0" />
                <div>
                  <p className="text-xs sm:text-sm font-medium text-blue-900 dark:text-blue-200">
                    Processing recording...
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Transcription and summary will be ready shortly
                  </p>
                </div>
              </div>
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="text-xs sm:text-sm px-2 sm:px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded transition-colors flex-shrink-0"
              >
                {isLoading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          ) : null}

          {/* Transcription Preview */}
          {hasTranscription || hasSummary ? (
            <div className="space-y-3">
              {hasTranscription && (
                <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-900/20 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                    <h4 className="text-xs sm:text-sm font-semibold text-foreground">Transcript</h4>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3">
                    {session.transcript?.substring(0, 200)}...
                  </p>
                </div>
              )}

              {hasSummary && (
                <div className="p-3 sm:p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-700">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <h4 className="text-xs sm:text-sm font-semibold text-foreground">Summary</h4>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                    {session.summary?.substring(0, 150)}...
                  </p>
                </div>
              )}

              <button
                onClick={() => setShowModal(true)}
                className="w-full mt-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors border border-primary"
              >
                View Full Transcription & Summary
              </button>
            </div>
          ) : session.status === 'completed' && !isProcessing ? (
            <div className="flex items-start gap-3 p-3 sm:p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs sm:text-sm font-medium text-amber-900 dark:text-amber-200">
                  No speech detected
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  The recording did not contain any audio or speech to transcribe.
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </Card>

      {/* Summary Modal */}
      {showModal && (
        <SessionSummaryModal
          isOpen={showModal}
          session={session}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}
