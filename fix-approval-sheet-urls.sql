-- Fix for existing approval sheets if any were uploaded with public URLs
-- This migration updates storage_url to contain file paths instead of public URLs

-- Only run this if you have existing approval_sheets records
UPDATE approval_sheets
SET storage_url = file_path
WHERE storage_url LIKE 'http%' OR storage_url LIKE 'https%';

-- Verify the update
SELECT 
    id,
    abstract_id,
    file_name,
    storage_url,
    created_at
FROM approval_sheets
ORDER BY created_at DESC
LIMIT 10;
