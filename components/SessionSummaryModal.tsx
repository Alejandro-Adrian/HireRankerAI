"use client"

import { X, Clock, FileText, UserCog, User } from 'lucide-react'

interface ParticipantRecording {
  id: string
  participant_role: string
  participant_name?: string
  transcript?: string
}

interface SessionSummaryModalProps {
  isOpen: boolean
  session: any
  participantRecordings?: ParticipantRecording[]
  onClose: () => void
}

export default function SessionSummaryModal({ isOpen, session, participantRecordings = [], onClose }: SessionSummaryModalProps) {
  if (!isOpen || !session) return null

  const durationMinutes = session.duration_seconds ? Math.floor(session.duration_seconds / 60) : 0
  const durationSeconds = session.duration_seconds ? session.duration_seconds % 60 : 0

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1f2e] border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-xl font-bold text-white">{session.title}</h2>
            <p className="text-sm text-slate-400">Session Summary</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Duration */}
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-white mb-1">Duration</h3>
              <p className="text-sm text-slate-300">
                {durationMinutes}m {durationSeconds}s
              </p>
            </div>
          </div>

          {participantRecordings.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-teal-400" />
                <h3 className="font-semibold text-white">Transcript</h3>
              </div>
              
              {participantRecordings.map((recording) => (
                <div
                  key={recording.id}
                  className="bg-slate-800/50 rounded-lg p-4 border border-slate-700"
                >
                  <div className="flex items-center gap-2 mb-3">
                    {recording.participant_role === 'host' ? (
                      <UserCog className="h-4 w-4 text-blue-400" />
                    ) : (
                      <User className="h-4 w-4 text-purple-400" />
                    )}
                    <h4 className="font-semibold text-sm text-white">
                      {recording.participant_role === 'host' ? 'Host' : 'Participant'}
                      {recording.participant_name && ` - ${recording.participant_name}`}
                    </h4>
                  </div>
                  {recording.transcript ? (
                    <div className="bg-slate-900/50 p-3 rounded text-sm text-slate-300 leading-relaxed max-h-64 overflow-y-auto whitespace-pre-wrap break-words">
                      {recording.transcript}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 italic">
                      No speech detected
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Summary */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-teal-400" />
              <h3 className="font-semibold text-white">Summary</h3>
            </div>
            
            {session.summary ? (
              <div className="bg-slate-800/50 p-4 rounded-lg text-sm text-slate-300 leading-relaxed border border-slate-700 whitespace-pre-wrap">
                {session.summary}
              </div>
            ) : (
              <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                <p className="text-sm text-slate-500">No speech detected</p>
              </div>
            )}
          </div>

          {participantRecordings.length === 0 && !session.summary && (
            <div className="text-center py-8">
              <p className="text-slate-400 text-sm">No transcript or summary available yet.</p>
              <p className="text-slate-500 text-xs mt-2">
                Summary will appear after the session is completed and processed.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-slate-700">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
