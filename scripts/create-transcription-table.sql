-- Create transcription_sessions table to store recording sessions
CREATE TABLE IF NOT EXISTS transcription_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  session_ended_at TIMESTAMP WITH TIME ZONE,
  final_transcripts TEXT[] DEFAULT '{}',
  transcript_count INTEGER DEFAULT 0,
  duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create transcription_results table to store individual results
CREATE TABLE IF NOT EXISTS transcription_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES transcription_sessions(id) ON DELETE CASCADE,
  transcript_text TEXT,
  is_final BOOLEAN DEFAULT FALSE,
  confidence NUMERIC,
  received_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_transcription_sessions_user_id ON transcription_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_transcription_sessions_created_at ON transcription_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_transcription_results_session_id ON transcription_results(session_id);
CREATE INDEX IF NOT EXISTS idx_transcription_results_is_final ON transcription_results(is_final);
