/**
 * Video Call Transcription Configuration
 * 
 * This file documents how transcription and summarization works in the video call system.
 * 
 * FLOW:
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  1. Video Call Recording                                       │
 * │  - User joins video call                                       │
 * │  - Audio is recorded using MediaRecorder API                  │
 * │  - Recording saved as WebM format (audio/webm)               │
 * └─────────────────────────────────────────────────────────────────┘
 *                           ↓
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  2. Recording Upload                                           │
 * │  - Audio blob uploaded to Vercel Blob Storage                │
 * │  - Recording URL stored in video_sessions table              │
 * │  - Session status: "active"                                  │
 * └─────────────────────────────────────────────────────────────────┘
 *                           ↓
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  3. Batch Transcription (AssemblyAI REST API)                │
 * │  - POST /api/video-sessions/process-recording                │
 * │  - Downloads audio from storage                              │
 * │  - Uploads to AssemblyAI                                     │
 * │  - Polls for completion (max 5 minutes)                      │
 * │  - Returns: Full transcript text                             │
 * └─────────────────────────────────────────────────────────────────┘
 *                           ↓
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  4. AI Summarization (Grok/XAI)                              │
 * │  - Sends complete transcript to Grok                         │
 * │  - Generates 2-3 paragraph summary                           │
 * │  - Focuses on key points and qualifications                 │
 * └─────────────────────────────────────────────────────────────────┘
 *                           ↓
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  5. Results Storage                                            │
 * │  - transcript: Full transcribed text                         │
 * │  - summary: AI-generated summary                             │
 * │  - status: Changed to "completed"                            │
 * │  - Stored in video_sessions table                            │
 * └─────────────────────────────────────────────────────────────────┘
 *                           ↓
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  6. User Interface Display                                      │
 * │  - History tab shows completed sessions                      │
 * │  - Preview shows first 150 chars of summary                 │
 * │  - "View Full Summary" button opens modal                    │
 * │  - Modal displays:                                           │
 * │    * Duration                                               │
 * │    * Full transcript (scrollable)                           │
 * │    * Full summary                                           │
 * └─────────────────────────────────────────────────────────────────┘
 */

export const TRANSCRIPTION_CONFIG = {
  // AssemblyAI REST API batch configuration
  transcription: {
    provider: "AssemblyAI",
    method: "REST API (Batch)",
    maxDuration: 300, // 5 minutes polling
    pollingInterval: 2000, // 2 seconds between polls
    language: "en",
    features: {
      punctuation: true,
      formatText: true,
      speakerLabels: true,
    },
  },

  // Grok/XAI summarization configuration
  summarization: {
    provider: "XAI (Grok)",
    model: "grok-4",
    maxTokens: 300,
    temperature: 0.7,
    focus: [
      "Key qualifications discussed",
      "Technical skills mentioned",
      "Candidate strengths and expertise",
      "Overall assessment and recommendations",
    ],
  },

  // Database schema for storing results
  database: {
    table: "video_sessions",
    fields: {
      transcript: "TEXT - Full transcribed conversation",
      summary: "TEXT - AI-generated summary",
      status: "VARCHAR - 'completed' when ready",
      duration_seconds: "INTEGER - Call duration",
      recording_url: "TEXT - URL to stored recording",
    },
  },

  // UI Display configuration
  ui: {
    transcriptPreviewLength: 200,
    summaryPreviewLength: 150,
    truncationIndicator: "...",
    maxHeightTranscript: "192px", // max-h-48 in Tailwind
    maxHeightSummary: "auto",
    refreshButton: {
      enabled: true,
      interval: 5000, // Auto-refresh every 5 seconds during processing
    },
  },

  // Error handling
  errors: {
    noSpeechDetected: "No speech detected in the recording. Please ensure audio was captured during the call.",
    processingTimeout: "Processing took too long. Please refresh to check status.",
    uploadFailed: "Failed to upload recording. Please try again.",
    transcriptionFailed: "Transcription failed. Please try again.",
    summaryFailed: "Summary generation failed. Full transcript is still available.",
  },

  // Status messages
  messages: {
    processing: "Transcription and summary will be ready shortly",
    completed: "Transcription complete - view below",
    failed: "Unable to process recording",
  },
}

export type TranscriptionStatus = "active" | "completed" | "failed"

export interface SessionTranscriptionData {
  transcript: string
  summary: string
  status: TranscriptionStatus
  duration_seconds: number
  recording_url: string
  created_at: string
  updated_at: string
}
