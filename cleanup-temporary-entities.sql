-- Cleanup Script for Temporary Extracted Entities
-- Purpose: Remove extracted_entities from abstracts that were likely abandoned/cancelled
-- Created: November 2, 2025
-- Run this BEFORE the temporary storage implementation to clean up historical data

-- =============================================================================
-- STEP 1: INSPECT - See what we have
-- =============================================================================

-- Check total abstracts with extracted entities
SELECT 
  COUNT(*) as total_with_entities,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_with_entities,
  COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_with_entities,
  COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_with_entities
FROM abstracts
WHERE extracted_entities IS NOT NULL;

-- View sample of abstracts with entities
SELECT 
  id,
  title,
  status,
  created_at,
  submitted_by,
  jsonb_array_length(extracted_entities->'technologies') as tech_count,
  jsonb_array_length(extracted_entities->'domains') as domain_count,
  jsonb_array_length(extracted_entities->'methodologies') as method_count
FROM abstracts
WHERE extracted_entities IS NOT NULL
ORDER BY created_at DESC
LIMIT 20;

-- =============================================================================
-- STEP 2: IDENTIFY CANDIDATES - Abstracts that might be temporary/abandoned
-- =============================================================================

-- Option A: Pending/Rejected abstracts (likely abandoned by students)
-- These were extracted but never approved/published
SELECT 
  id,
  title,
  status,
  created_at,
  submitted_by
FROM abstracts
WHERE extracted_entities IS NOT NULL
  AND status IN ('pending', 'rejected')
ORDER BY created_at DESC;

-- =============================================================================
-- STEP 3: CLEANUP OPTIONS
-- =============================================================================

-- OPTION 1: Conservative - Only clear entities from rejected abstracts
-- (These are definitely abandoned)
-- UPDATE abstracts 
-- SET extracted_entities = NULL
-- WHERE extracted_entities IS NOT NULL
--   AND status = 'rejected';

-- OPTION 2: Moderate - Clear entities from pending and rejected
-- (Student submissions that weren't approved yet)
-- UPDATE abstracts 
-- SET extracted_entities = NULL
-- WHERE extracted_entities IS NOT NULL
--   AND status IN ('pending', 'rejected');

-- OPTION 3: Aggressive - Clear ALL entities and let users re-extract
-- (Use this if you want everyone to start fresh with new classification rules)
-- UPDATE abstracts 
-- SET extracted_entities = NULL
-- WHERE extracted_entities IS NOT NULL;

-- OPTION 4: Keep approved only - Clear everything except published abstracts
-- (Recommended: Keeps validated research data, clears test/abandoned data)
-- UPDATE abstracts 
-- SET extracted_entities = NULL
-- WHERE extracted_entities IS NOT NULL
--   AND status != 'approved';

-- =============================================================================
-- STEP 4: VERIFICATION - Run after cleanup
-- =============================================================================

-- Verify cleanup results
SELECT 
  status,
  COUNT(*) as total,
  COUNT(CASE WHEN extracted_entities IS NOT NULL THEN 1 END) as with_entities,
  COUNT(CASE WHEN extracted_entities IS NULL THEN 1 END) as without_entities
FROM abstracts
GROUP BY status
ORDER BY status;

-- =============================================================================
-- RECOMMENDED APPROACH
-- =============================================================================

-- Run this query to see what will be affected:
SELECT 
  'Will clear ' || COUNT(*) || ' abstracts with status: ' || status as preview
FROM abstracts
WHERE extracted_entities IS NOT NULL
  AND status != 'approved'
GROUP BY status;

-- If you're happy with the preview, uncomment and run this:
-- BEGIN;
-- 
-- UPDATE abstracts 
-- SET extracted_entities = NULL
-- WHERE extracted_entities IS NOT NULL
--   AND status != 'approved';
-- 
-- -- Verify the update
-- SELECT 
--   'Cleared extracted_entities from ' || COUNT(*) || ' abstracts' as result
-- FROM abstracts
-- WHERE extracted_entities IS NULL
--   AND status != 'approved';
-- 
-- COMMIT;

-- =============================================================================
-- NOTES
-- =============================================================================
-- 1. This script uses OPTION 4 (Keep approved only) as the recommended approach
-- 2. Approved abstracts are faculty-published research - their entities are valid
-- 3. Pending/rejected abstracts may have been test extractions or abandoned submissions
-- 4. After cleanup, users can re-extract entities with the new classification rules
-- 5. The new temporary storage system will prevent this issue going forward
