"use client"

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { FileText, Clock, Users, Sparkles } from 'lucide-react'
import SessionSummaryModal from './SessionSummaryModal'
import { Button } from '@/components/ui/button'

interface ParticipantRecording {
  id: string
  participant_role: string
  participant_name?: string
  transcript?: string
  status?: string
  created_at?: string
}

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
  const [participantRecordings, setParticipantRecordings] = useState<ParticipantRecording[]>([])
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)

  const loadParticipantRecordings = async () => {
    try {
      const response = await fetch(`/api/video-sessions/${session.id}/recordings`)
      if (response.ok) {
        const data = await response.json()
        setParticipantRecordings(data.recordings || [])
      }
    } catch (error) {
      console.error("[v0] Error loading participant recordings:", error)
    }
  }

  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true)
    console.log('[v0] Manually triggering summary generation for session:', session.id)
    
    try {
      const response = await fetch(`/api/video-sessions/${session.id}/generate-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      
      if (response.ok) {
        console.log('[v0] Summary generated successfully:', data)
        if (onRefresh) {
          onRefresh()
        }
      } else {
        console.error('[v0] Summary generation failed:', data)
        alert(`Failed to generate summary: ${data.error}`)
      }
    } catch (error) {
      console.error('[v0] Error generating summary:', error)
      alert('Error generating summary. Check console for details.')
    } finally {
      setIsGeneratingSummary(false)
    }
  }

  useEffect(() => {
    loadParticipantRecordings()
  }, [session.id])

  const combinedTranscript = participantRecordings
    .filter(r => r.transcript)
    .map(r => r.transcript)
    .join(' ')

  const hasTranscription = combinedTranscript.trim().length > 0
  const hasSummary = !!(session.summary && session.summary.trim().length > 0)

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
        {/* Header */}
        <div className="p-6 border-b border-border bg-card">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-semibold text-foreground">{session.title}</h3>
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
          <p className="text-sm text-muted-foreground">
            {new Date(session.created_at).toLocaleString()}
          </p>
        </div>

        {/* Metadata */}
        <div className="px-6 py-3 bg-muted/30 flex gap-4 text-sm text-muted-foreground border-b border-border">
          {session.duration_seconds !== undefined && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span>{Math.floor(session.duration_seconds / 60)}m {session.duration_seconds % 60}s</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 flex-shrink-0" />
            <span>{participantRecordings.length} participants</span>
          </div>
        </div>

        {/* Transcript and Summary Sections */}
        <div className="p-6 space-y-4">
          {/* Transcript Section */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900/30 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-slate-600 dark:text-slate-400 flex-shrink-0" />
              <h4 className="text-sm font-semibold text-foreground">Transcript</h4>
            </div>
            {hasTranscription ? (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {combinedTranscript.substring(0, 150)}...
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">No speech detected...</p>
            )}
          </div>

          {/* Summary Section */}
          <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-700">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                <h4 className="text-sm font-semibold text-foreground">Summary</h4>
              </div>
              {hasTranscription && !hasSummary && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleGenerateSummary}
                  disabled={isGeneratingSummary}
                  className="h-7 text-xs"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  {isGeneratingSummary ? 'Generating...' : 'Generate'}
                </Button>
              )}
            </div>
            {hasSummary ? (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {session.summary.substring(0, 150)}...
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                {hasTranscription ? 'Click "Generate" to create AI summary' : 'No speech detected...'}
              </p>
            )}
          </div>

          {/* View Full Button */}
          <button
            onClick={() => setShowModal(true)}
            className="w-full px-4 py-2.5 text-sm font-medium text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors border border-teal-600 dark:border-teal-400"
          >
            View Full Transcription & Summary
          </button>
        </div>
      </Card>

      {/* Summary Modal */}
      {showModal && (
        <SessionSummaryModal
          isOpen={showModal}
          session={session}
          participantRecordings={participantRecordings}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}
