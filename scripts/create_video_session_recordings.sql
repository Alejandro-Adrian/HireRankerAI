-- Create video_session_recordings table to store individual participant audio recordings
CREATE TABLE IF NOT EXISTS public.video_session_recordings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.video_sessions(id) ON DELETE CASCADE,
    participant_role TEXT NOT NULL CHECK (participant_role IN ('host', 'participant')),
    participant_name TEXT,
    audio_url TEXT NOT NULL,
    transcript TEXT,
    status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
    duration_seconds INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_video_session_recordings_session_id 
ON public.video_session_recordings(session_id);

CREATE INDEX IF NOT EXISTS idx_video_session_recordings_status 
ON public.video_session_recordings(status);
