-- Add transcript and summary columns to video_sessions table if they don't exist
ALTER TABLE video_sessions 
ADD COLUMN IF NOT EXISTS transcript TEXT,
ADD COLUMN IF NOT EXISTS summary TEXT,
ADD COLUMN IF NOT EXISTS recording_url TEXT,
ADD COLUMN IF NOT EXISTS ended_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS duration_seconds INTEGER;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_video_sessions_status ON video_sessions(status);
