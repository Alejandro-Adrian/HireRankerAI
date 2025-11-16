-- ============================================================================
-- HireRankerAI Complete Database Setup Script
-- ============================================================================
-- This is the single source of truth for all database setup and migrations.
-- Combines all previous migration scripts into one comprehensive setup.

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    firstname TEXT NOT NULL,
    lastname TEXT NOT NULL,
    company_name VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    verification_code VARCHAR(6),
    verification_expires_at TIMESTAMP WITH TIME ZONE,
    reset_code VARCHAR(6),
    reset_expires_at TIMESTAMP WITH TIME ZONE,
    password_change_code TEXT,
    password_change_expires_at TIMESTAMP WITH TIME ZONE,
    account_deletion_code TEXT,
    account_deletion_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- RANKINGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS rankings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    position VARCHAR(255),
    description TEXT,
    area_city VARCHAR(255),
    area_living_preference VARCHAR(255),
    application_link_id VARCHAR(255),
    other_keyword TEXT,
    criteria JSONB,
    criteria_weights JSONB,
    show_criteria_to_applicants BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    auto_score_threshold NUMERIC DEFAULT 70.0,
    enable_bulk_operations BOOLEAN DEFAULT TRUE,
    notification_settings JSONB DEFAULT '{"email": true, "in_app": true}',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- CRITERIA TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS criteria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- APPLICATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ranking_id UUID REFERENCES rankings(id) ON DELETE CASCADE,
    applicant_name VARCHAR(255),
    applicant_email VARCHAR(255),
    applicant_phone VARCHAR(255),
    applicant_city VARCHAR(255),
    hr_name VARCHAR(255),
    company_name VARCHAR(255),
    experience_years INTEGER,
    education_level TEXT,
    key_skills TEXT,
    certifications TEXT,
    resume_summary TEXT,
    ocr_transcript TEXT,
    scores JSONB,
    score_breakdown JSONB,
    total_score NUMERIC,
    rank_position INTEGER,
    scoring_summary TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    auto_approved BOOLEAN DEFAULT FALSE,
    interview_scheduled BOOLEAN DEFAULT FALSE,
    interview_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    scored_at TIMESTAMP WITH TIME ZONE,
    reviewed_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- APPLICATION FILES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS application_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(100),
    file_size INTEGER,
    file_category VARCHAR(100),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- NOTIFICATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ANALYTICS TABLES
-- ============================================================================
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    ranking_id UUID REFERENCES rankings(id) ON DELETE CASCADE,
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ranking_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ranking_id UUID REFERENCES rankings(id) ON DELETE CASCADE,
    total_applications INTEGER DEFAULT 0,
    avg_score NUMERIC DEFAULT 0,
    top_score NUMERIC DEFAULT 0,
    applications_this_week INTEGER DEFAULT 0,
    applications_this_month INTEGER DEFAULT 0,
    conversion_rate NUMERIC DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- VIDEO SESSION TABLES
-- ============================================================================
CREATE TABLE IF NOT EXISTS video_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id TEXT UNIQUE NOT NULL,
    title TEXT,
    meeting_url TEXT,
    status TEXT DEFAULT 'scheduled',
    participants_count INTEGER DEFAULT 0,
    transcript TEXT,
    summary TEXT,
    recording_url TEXT,
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS video_session_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES video_sessions(id) ON DELETE CASCADE,
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    applicant_name VARCHAR NOT NULL,
    applicant_email VARCHAR NOT NULL,
    access_token VARCHAR NOT NULL UNIQUE,
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    joined_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(session_id, application_id)
);

CREATE TABLE IF NOT EXISTS webrtc_signaling (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id TEXT NOT NULL,
    peer_id TEXT NOT NULL,
    peer_type TEXT NOT NULL,
    signal_type TEXT NOT NULL,
    signal_data JSONB NOT NULL,
    consumed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_verification_code ON users(verification_code);
CREATE INDEX IF NOT EXISTS idx_users_reset_code ON users(reset_code);

-- Rankings indexes
CREATE INDEX IF NOT EXISTS idx_rankings_created_by ON rankings(created_by);
CREATE INDEX IF NOT EXISTS idx_rankings_is_active ON rankings(is_active);
CREATE INDEX IF NOT EXISTS idx_rankings_other_keyword ON rankings(other_keyword) WHERE other_keyword IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rankings_area_city ON rankings(area_city) WHERE area_city IS NOT NULL;

-- Applications indexes
CREATE INDEX IF NOT EXISTS idx_applications_ranking_id ON applications(ranking_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_hr_name ON applications(hr_name);
CREATE INDEX IF NOT EXISTS idx_applications_company_name ON applications(company_name);
CREATE INDEX IF NOT EXISTS idx_applications_auto_approved ON applications(auto_approved);
CREATE INDEX IF NOT EXISTS idx_applications_interview_scheduled ON applications(interview_scheduled);
CREATE INDEX IF NOT EXISTS idx_applications_interview_date ON applications(interview_date);

-- Application files indexes
CREATE INDEX IF NOT EXISTS idx_application_files_application_id ON application_files(application_id);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created ON notifications(user_id, read, created_at DESC);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_ranking_id ON analytics_events(ranking_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ranking_performance_ranking_id ON ranking_performance(ranking_id);

-- Video session indexes
CREATE INDEX IF NOT EXISTS idx_video_sessions_meeting_id ON video_sessions(meeting_id);
CREATE INDEX IF NOT EXISTS idx_video_sessions_status ON video_sessions(status);
CREATE INDEX IF NOT EXISTS idx_video_session_participants_session_id ON video_session_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_video_session_participants_application_id ON video_session_participants(application_id);
CREATE INDEX IF NOT EXISTS idx_video_session_participants_access_token ON video_session_participants(access_token);
CREATE INDEX IF NOT EXISTS idx_webrtc_signaling_meeting_id ON webrtc_signaling(meeting_id);
CREATE INDEX IF NOT EXISTS idx_webrtc_signaling_consumed ON webrtc_signaling(consumed);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_rankings_updated_at ON rankings;
CREATE TRIGGER update_rankings_updated_at
    BEFORE UPDATE ON rankings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_video_sessions_updated_at ON video_sessions;
CREATE TRIGGER update_video_sessions_updated_at
    BEFORE UPDATE ON video_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STORED PROCEDURES
-- ============================================================================
-- Stored procedure for safe ranking deletion with cascade
CREATE OR REPLACE FUNCTION delete_ranking_with_cascade(
    ranking_id UUID,
    user_id UUID
)
RETURNS TABLE(deleted_id UUID, deleted_title TEXT) 
LANGUAGE plpgsql
AS $$
DECLARE
    ranking_record RECORD;
    applications_count INTEGER;
    files_count INTEGER;
BEGIN
    -- Check if ranking exists and user has permission
    SELECT id, title, created_by INTO ranking_record
    FROM rankings 
    WHERE id = ranking_id AND created_by = user_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Ranking not found or access denied';
    END IF;
    
    -- Get counts for logging
    SELECT COUNT(*) INTO applications_count 
    FROM applications 
    WHERE applications.ranking_id = delete_ranking_with_cascade.ranking_id;
    
    SELECT COUNT(*) INTO files_count 
    FROM application_files af
    JOIN applications a ON af.application_id = a.id
    WHERE a.ranking_id = delete_ranking_with_cascade.ranking_id;
    
    RAISE NOTICE 'Deleting ranking % with % applications and % files', 
        ranking_record.title, applications_count, files_count;
    
    -- Delete the ranking (CASCADE will handle applications and files)
    DELETE FROM rankings 
    WHERE id = ranking_id AND created_by = user_id;
    
    -- Return the deleted ranking info
    RETURN QUERY SELECT ranking_record.id, ranking_record.title;
END;
$$;

-- Validation function for criteria weights
CREATE OR REPLACE FUNCTION validate_criteria_weights(weights jsonb)
RETURNS boolean AS $$
DECLARE
    total_weight numeric := 0;
    weight_value numeric;
    key text;
BEGIN
    -- Sum all weight values
    FOR key IN SELECT jsonb_object_keys(weights)
    LOOP
        weight_value := (weights ->> key)::numeric;
        total_weight := total_weight + weight_value;
    END LOOP;
    
    -- Return true if total equals 100
    RETURN total_weight = 100;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SEED DATA
-- ============================================================================
INSERT INTO criteria (name, description) VALUES
    ('Technical Skills', 'Assessment of technical competencies and expertise'),
    ('Communication', 'Evaluation of verbal and written communication abilities'),
    ('Problem Solving', 'Ability to analyze and solve complex problems'),
    ('Experience', 'Relevant work experience and background'),
    ('Cultural Fit', 'Alignment with company values and culture')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE video_session_participants ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- DATA CLEANUP (for existing data)
-- ============================================================================
-- Ensure all existing rankings have proper default values
UPDATE rankings 
SET criteria = COALESCE(criteria, '[]'::jsonb)
WHERE criteria IS NULL;

UPDATE rankings 
SET criteria_weights = COALESCE(criteria_weights, '{}'::jsonb)
WHERE criteria_weights IS NULL;

UPDATE rankings 
SET show_criteria_to_applicants = COALESCE(show_criteria_to_applicants, true)
WHERE show_criteria_to_applicants IS NULL;

UPDATE rankings 
SET is_active = COALESCE(is_active, true)
WHERE is_active IS NULL;

COMMIT;
