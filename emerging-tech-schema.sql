-- ================================================================
-- EMERGING TECHNOLOGIES SCHEMA
-- Add validated emerging technologies column to abstracts table
-- ================================================================

-- Add emerging_technologies array column
ALTER TABLE abstracts 
ADD COLUMN IF NOT EXISTS emerging_technologies TEXT[];

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_abstracts_emerging_tech 
ON abstracts USING GIN (emerging_technologies);

-- Verify column exists
SELECT 'Emerging technologies column added successfully!' as status;
