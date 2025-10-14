-- Add missing other_keyword column to rankings table
-- This column is used to store additional keyword criteria for ranking applications

-- Add the other_keyword column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'rankings' 
        AND column_name = 'other_keyword'
    ) THEN
        ALTER TABLE rankings 
        ADD COLUMN other_keyword TEXT;
        
        RAISE NOTICE 'Added other_keyword column to rankings table';
    ELSE
        RAISE NOTICE 'other_keyword column already exists';
    END IF;
END $$;

-- Add index for better performance on other_keyword searches
CREATE INDEX IF NOT EXISTS idx_rankings_other_keyword ON rankings(other_keyword) WHERE other_keyword IS NOT NULL;

COMMIT;
