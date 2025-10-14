-- Fix Ranking Schema Issues
-- This script addresses field name mismatches and ensures proper data structure

-- First, let's check if we need to add any missing columns or fix existing ones
-- The rankings table should have proper field names that match the frontend expectations

-- Update any existing rankings to ensure proper data structure
UPDATE rankings 
SET criteria = COALESCE(criteria, '[]'::jsonb)
WHERE criteria IS NULL;

-- Ensure criteria_weights is properly structured
UPDATE rankings 
SET criteria_weights = COALESCE(criteria_weights, '{}'::jsonb)
WHERE criteria_weights IS NULL;

-- Add index for better performance on other_keyword searches
CREATE INDEX IF NOT EXISTS idx_rankings_other_keyword ON rankings(other_keyword) WHERE other_keyword IS NOT NULL;

-- Add index for area_city searches
CREATE INDEX IF NOT EXISTS idx_rankings_area_city ON rankings(area_city) WHERE area_city IS NOT NULL;

-- Ensure all boolean fields have proper defaults
UPDATE rankings 
SET show_criteria_to_applicants = COALESCE(show_criteria_to_applicants, true)
WHERE show_criteria_to_applicants IS NULL;

UPDATE rankings 
SET is_active = COALESCE(is_active, true)
WHERE is_active IS NULL;

-- Create a function to validate criteria weights sum to 100
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

-- Add a check constraint to ensure criteria weights sum to 100
-- Note: This is commented out to avoid breaking existing data
-- ALTER TABLE rankings ADD CONSTRAINT check_criteria_weights_sum 
-- CHECK (validate_criteria_weights(criteria_weights));

COMMIT;
