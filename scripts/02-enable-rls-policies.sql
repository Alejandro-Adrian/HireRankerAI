-- ============================================================================
-- CRITICAL SECURITY FIX: Row Level Security (RLS) Policies
-- ============================================================================
-- This script implements comprehensive RLS policies to ensure data isolation
-- between users and prevent unauthorized access to sensitive data.

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ranking_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_session_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE webrtc_signaling ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcription_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcription_results ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================
-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Users can delete their own data" ON users;

-- Users can only view their own user record
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT
    USING (id = (current_setting('app.current_user_id', TRUE))::uuid);

-- Users can only update their own user record
CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE
    USING (id = (current_setting('app.current_user_id', TRUE))::uuid);

-- Users can only delete their own user record
CREATE POLICY "Users can delete their own data" ON users
    FOR DELETE
    USING (id = (current_setting('app.current_user_id', TRUE))::uuid);

-- ============================================================================
-- RANKINGS TABLE POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Users can view their own rankings" ON rankings;
DROP POLICY IF EXISTS "Users can create their own rankings" ON rankings;
DROP POLICY IF EXISTS "Users can update their own rankings" ON rankings;
DROP POLICY IF EXISTS "Users can delete their own rankings" ON rankings;

-- Users can only view rankings they created
CREATE POLICY "Users can view their own rankings" ON rankings
    FOR SELECT
    USING (created_by = (current_setting('app.current_user_id', TRUE))::uuid);

-- Users can create rankings
CREATE POLICY "Users can create their own rankings" ON rankings
    FOR INSERT
    WITH CHECK (created_by = (current_setting('app.current_user_id', TRUE))::uuid);

-- Users can only update rankings they created
CREATE POLICY "Users can update their own rankings" ON rankings
    FOR UPDATE
    USING (created_by = (current_setting('app.current_user_id', TRUE))::uuid);

-- Users can only delete rankings they created
CREATE POLICY "Users can delete their own rankings" ON rankings
    FOR DELETE
    USING (created_by = (current_setting('app.current_user_id', TRUE))::uuid);

-- ============================================================================
-- APPLICATIONS TABLE POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Users can view applications for their rankings" ON applications;
DROP POLICY IF EXISTS "Users can create applications for their rankings" ON applications;
DROP POLICY IF EXISTS "Users can update applications for their rankings" ON applications;
DROP POLICY IF EXISTS "Users can delete applications for their rankings" ON applications;
DROP POLICY IF EXISTS "Public can create applications" ON applications;

-- Users can only view applications for rankings they own
CREATE POLICY "Users can view applications for their rankings" ON applications
    FOR SELECT
    USING (
        ranking_id IN (
            SELECT id FROM rankings 
            WHERE created_by = (current_setting('app.current_user_id', TRUE))::uuid
        )
    );

-- Allow public to submit applications (for application forms)
CREATE POLICY "Public can create applications" ON applications
    FOR INSERT
    WITH CHECK (TRUE);

-- Users can only update applications for rankings they own
CREATE POLICY "Users can update applications for their rankings" ON applications
    FOR UPDATE
    USING (
        ranking_id IN (
            SELECT id FROM rankings 
            WHERE created_by = (current_setting('app.current_user_id', TRUE))::uuid
        )
    );

-- Users can only delete applications for rankings they own
CREATE POLICY "Users can delete applications for their rankings" ON applications
    FOR DELETE
    USING (
        ranking_id IN (
            SELECT id FROM rankings 
            WHERE created_by = (current_setting('app.current_user_id', TRUE))::uuid
        )
    );

-- ============================================================================
-- APPLICATION FILES TABLE POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Users can view files for their applications" ON application_files;
DROP POLICY IF EXISTS "Users can create files for their applications" ON application_files;
DROP POLICY IF EXISTS "Users can delete files for their applications" ON application_files;
DROP POLICY IF EXISTS "Public can upload application files" ON application_files;

-- Users can view files for applications in their rankings
CREATE POLICY "Users can view files for their applications" ON application_files
    FOR SELECT
    USING (
        application_id IN (
            SELECT a.id FROM applications a
            JOIN rankings r ON a.ranking_id = r.id
            WHERE r.created_by = (current_setting('app.current_user_id', TRUE))::uuid
        )
    );

-- Allow public to upload files (for application forms)
CREATE POLICY "Public can upload application files" ON application_files
    FOR INSERT
    WITH CHECK (TRUE);

-- Users can delete files for applications in their rankings
CREATE POLICY "Users can delete files for their applications" ON application_files
    FOR DELETE
    USING (
        application_id IN (
            SELECT a.id FROM applications a
            JOIN rankings r ON a.ranking_id = r.id
            WHERE r.created_by = (current_setting('app.current_user_id', TRUE))::uuid
        )
    );

-- ============================================================================
-- NOTIFICATIONS TABLE POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;

-- Users can only view their own notifications
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT
    USING (user_id = (current_setting('app.current_user_id', TRUE))::uuid);

-- Users can only update their own notifications
CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE
    USING (user_id = (current_setting('app.current_user_id', TRUE))::uuid);

-- Users can only delete their own notifications
CREATE POLICY "Users can delete their own notifications" ON notifications
    FOR DELETE
    USING (user_id = (current_setting('app.current_user_id', TRUE))::uuid);

-- System can insert notifications
CREATE POLICY "System can create notifications" ON notifications
    FOR INSERT
    WITH CHECK (TRUE);

-- ============================================================================
-- ANALYTICS EVENTS TABLE POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Users can view their own analytics" ON analytics_events;
DROP POLICY IF EXISTS "System can create analytics" ON analytics_events;

-- Users can only view their own analytics
CREATE POLICY "Users can view their own analytics" ON analytics_events
    FOR SELECT
    USING (user_id = (current_setting('app.current_user_id', TRUE))::uuid);

-- System can create analytics events
CREATE POLICY "System can create analytics" ON analytics_events
    FOR INSERT
    WITH CHECK (TRUE);

-- ============================================================================
-- RANKING PERFORMANCE TABLE POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Users can view performance for their rankings" ON ranking_performance;
DROP POLICY IF EXISTS "System can manage ranking performance" ON ranking_performance;

-- Users can view performance for their rankings
CREATE POLICY "Users can view performance for their rankings" ON ranking_performance
    FOR SELECT
    USING (
        ranking_id IN (
            SELECT id FROM rankings 
            WHERE created_by = (current_setting('app.current_user_id', TRUE))::uuid
        )
    );

-- System can manage ranking performance
CREATE POLICY "System can manage ranking performance" ON ranking_performance
    FOR ALL
    USING (TRUE)
    WITH CHECK (TRUE);

-- ============================================================================
-- VIDEO SESSIONS TABLE POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Users can view video sessions for their rankings" ON video_sessions;
DROP POLICY IF EXISTS "Users can manage video sessions for their rankings" ON video_sessions;

-- Users can view video sessions for their rankings
CREATE POLICY "Users can view video sessions for their rankings" ON video_sessions
    FOR SELECT
    USING (
        id IN (
            SELECT vs.id FROM video_sessions vs
            JOIN video_session_participants vsp ON vs.id = vsp.session_id
            JOIN applications a ON vsp.application_id = a.id
            JOIN rankings r ON a.ranking_id = r.id
            WHERE r.created_by = (current_setting('app.current_user_id', TRUE))::uuid
        )
    );

-- Users can manage video sessions for their rankings
CREATE POLICY "Users can manage video sessions for their rankings" ON video_sessions
    FOR ALL
    USING (
        id IN (
            SELECT vs.id FROM video_sessions vs
            JOIN video_session_participants vsp ON vs.id = vsp.session_id
            JOIN applications a ON vsp.application_id = a.id
            JOIN rankings r ON a.ranking_id = r.id
            WHERE r.created_by = (current_setting('app.current_user_id', TRUE))::uuid
        )
    );

-- ============================================================================
-- VIDEO SESSION PARTICIPANTS TABLE POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Users can view participants for their sessions" ON video_session_participants;
DROP POLICY IF EXISTS "Users can manage participants for their sessions" ON video_session_participants;
DROP POLICY IF EXISTS "Participants can view their own access" ON video_session_participants;

-- Users can view participants for their sessions
CREATE POLICY "Users can view participants for their sessions" ON video_session_participants
    FOR SELECT
    USING (
        application_id IN (
            SELECT a.id FROM applications a
            JOIN rankings r ON a.ranking_id = r.id
            WHERE r.created_by = (current_setting('app.current_user_id', TRUE))::uuid
        )
    );

-- Users can manage participants for their sessions
CREATE POLICY "Users can manage participants for their sessions" ON video_session_participants
    FOR ALL
    USING (
        application_id IN (
            SELECT a.id FROM applications a
            JOIN rankings r ON a.ranking_id = r.id
            WHERE r.created_by = (current_setting('app.current_user_id', TRUE))::uuid
        )
    );

-- Participants can view their own access via token
CREATE POLICY "Participants can view their own access" ON video_session_participants
    FOR SELECT
    USING (access_token = current_setting('app.access_token', TRUE));

-- ============================================================================
-- VIDEO SESSION RECORDINGS TABLE POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Users can view recordings for their sessions" ON video_session_recordings;
DROP POLICY IF EXISTS "System can manage recordings" ON video_session_recordings;

-- Users can view recordings for their sessions
CREATE POLICY "Users can view recordings for their sessions" ON video_session_recordings
    FOR SELECT
    USING (
        session_id IN (
            SELECT vs.id FROM video_sessions vs
            JOIN video_session_participants vsp ON vs.id = vsp.session_id
            JOIN applications a ON vsp.application_id = a.id
            JOIN rankings r ON a.ranking_id = r.id
            WHERE r.created_by = (current_setting('app.current_user_id', TRUE))::uuid
        )
    );

-- System can manage recordings
CREATE POLICY "System can manage recordings" ON video_session_recordings
    FOR ALL
    USING (TRUE)
    WITH CHECK (TRUE);

-- ============================================================================
-- WEBRTC SIGNALING TABLE POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Public can access signaling" ON webrtc_signaling;

-- Public access for WebRTC signaling (meeting_id acts as access control)
CREATE POLICY "Public can access signaling" ON webrtc_signaling
    FOR ALL
    USING (TRUE)
    WITH CHECK (TRUE);

-- ============================================================================
-- TRANSCRIPTION SESSIONS TABLE POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Users can view their own transcription sessions" ON transcription_sessions;
DROP POLICY IF EXISTS "Users can manage their own transcription sessions" ON transcription_sessions;

-- Users can view their own transcription sessions
CREATE POLICY "Users can view their own transcription sessions" ON transcription_sessions
    FOR SELECT
    USING (user_id = (current_setting('app.current_user_id', TRUE))::uuid);

-- Users can manage their own transcription sessions
CREATE POLICY "Users can manage their own transcription sessions" ON transcription_sessions
    FOR ALL
    USING (user_id = (current_setting('app.current_user_id', TRUE))::uuid)
    WITH CHECK (user_id = (current_setting('app.current_user_id', TRUE))::uuid);

-- ============================================================================
-- TRANSCRIPTION RESULTS TABLE POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Users can view transcriptions for their sessions" ON transcription_results;
DROP POLICY IF EXISTS "System can manage transcription results" ON transcription_results;

-- Users can view transcriptions for their sessions
CREATE POLICY "Users can view transcriptions for their sessions" ON transcription_results
    FOR SELECT
    USING (
        session_id IN (
            SELECT id FROM transcription_sessions 
            WHERE user_id = (current_setting('app.current_user_id', TRUE))::uuid
        )
    );

-- System can manage transcription results
CREATE POLICY "System can manage transcription results" ON transcription_results
    FOR ALL
    USING (TRUE)
    WITH CHECK (TRUE);

-- ============================================================================
-- HELPER FUNCTIONS FOR USER CONTEXT
-- ============================================================================
-- Function to set the current user context
CREATE OR REPLACE FUNCTION set_user_context(user_uuid UUID)
RETURNS void AS $$
BEGIN
    PERFORM set_config('app.current_user_id', user_uuid::text, TRUE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clear user context
CREATE OR REPLACE FUNCTION clear_user_context()
RETURNS void AS $$
BEGIN
    PERFORM set_config('app.current_user_id', '', TRUE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
