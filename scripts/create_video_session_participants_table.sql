-- Create video_session_participants table to track which applicants are invited to which sessions
CREATE TABLE IF NOT EXISTS public.video_session_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.video_sessions(id) ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  applicant_name VARCHAR NOT NULL,
  applicant_email VARCHAR NOT NULL,
  access_token VARCHAR NOT NULL UNIQUE,
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  joined_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Add unique constraint to prevent duplicate invitations
  UNIQUE(session_id, application_id)
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_video_session_participants_session_id 
  ON public.video_session_participants(session_id);
  
CREATE INDEX IF NOT EXISTS idx_video_session_participants_application_id 
  ON public.video_session_participants(application_id);
  
CREATE INDEX IF NOT EXISTS idx_video_session_participants_access_token 
  ON public.video_session_participants(access_token);

-- Add RLS policies
ALTER TABLE public.video_session_participants ENABLE ROW LEVEL SECURITY;
