-- Migration script to update entity classifications in existing abstracts
-- This will reclassify entities according to the new rules

-- This script needs to be run manually in your Supabase SQL Editor
-- or you can create a one-time migration function

-- Note: Since extracted_entities is stored as JSONB, we need to update the classification
-- The best approach is to re-extract entities for all existing abstracts

-- Option 1: Clear extracted_entities to force re-extraction on next view
-- UPDATE abstracts SET extracted_entities = NULL WHERE extracted_entities IS NOT NULL;

-- Option 2: Create a function to reclassify entities (more complex, preserves some data)
-- This would require a custom function to parse and reclassify the JSONB data

-- Recommended: Use Option 1 and have users re-extract entities
-- Or implement a background job to re-extract all abstracts with the new rules

-- For immediate testing, you can manually delete the extracted_entities for specific abstracts:
-- UPDATE abstracts 
-- SET extracted_entities = NULL 
-- WHERE title = 'Your Abstract Title Here';

-- Then re-extract entities through the UI
