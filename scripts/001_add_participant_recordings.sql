-- Updated schema to match the actual database structure that was created
-- Create table to store individual participant audio recordings
CREATE TABLE IF NOT EXISTS video_session_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES video_sessions(id) ON DELETE CASCADE,
  participant_role TEXT NOT NULL CHECK (participant_role IN ('host', 'participant')),
  participant_name TEXT,
  audio_url TEXT NOT NULL,
  transcript TEXT,
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_session_recordings_session_id ON video_session_recordings(session_id);
CREATE INDEX IF NOT EXISTS idx_session_recordings_role ON video_session_recordings(participant_role);
CREATE INDEX IF NOT EXISTS idx_session_recordings_status ON video_session_recordings(status);
