/**
 * Video Call Transcription Configuration
 * 
 * This file documents how transcription and summarization works in the video call system.
 * 
 * FLOW:
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  1. Video Call Recording (ALL PARTICIPANTS)                    │
 * │  - VideoSDK cloud recording captures all audio streams        │
 * │  - Includes host + all participants automatically             │
 * │  - Recording saved in VideoSDK cloud storage                  │
 * │  - Fallback: MediaRecorder for local audio if SDK fails      │
 * └─────────────────────────────────────────────────────────────────┘
 *                           ↓
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  2. Recording Retrieval                                        │
 * │  - Fetch recording URL from VideoSDK API                      │
 * │  - Download mixed audio file (MP4 format)                     │
 * │  - Contains all participants' voices in one stream           │
 * └─────────────────────────────────────────────────────────────────┘
 *                           ↓
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  3. Transcription with Speaker Diarization                    │
 * │  - Upload to Deepgram with diarize=true                      │
 * │  - Identifies and labels different speakers                  │
 * │  - Returns: "Speaker 1: ...", "Speaker 2: ..."              │
 * │  - Full transcript with all participants' speech             │
 * └─────────────────────────────────────────────────────────────────┘
 *                           ↓
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  4. AI Summarization (Grok/XAI)                              │
 * │  - Sends complete multi-speaker transcript to Grok           │
 * │  - Generates comprehensive interview summary                 │
 * │  - Includes all participants' contributions                 │
 * └─────────────────────────────────────────────────────────────────┘
 *                           ↓
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  5. Results Storage                                            │
 * │  - transcript: Full diarized text (all speakers)             │
 * │  - summary: AI summary of complete conversation              │
 * │  - status: Changed to "completed"                            │
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
  // Primary: VideoSDK cloud recording (captures ALL participants)
  recording: {
    method: "VideoSDK Cloud Recording",
    capturesAllParticipants: true,
    format: "MP4",
    layout: "GRID",
    fallback: "MediaRecorder (local audio only)",
  },

  // Deepgram transcription with speaker diarization
  transcription: {
    provider: "Deepgram",
    model: "nova-2",
    features: {
      smartFormat: true,
      diarization: true, // Identifies different speakers
      punctuation: true,
    },
    supportedFormats: ["audio/webm", "audio/mp4", "video/mp4"],
  },

  // AssemblyAI REST API batch configuration
  assemblyAI: {
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
