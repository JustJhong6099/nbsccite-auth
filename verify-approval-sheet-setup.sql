-- Verify Storage Bucket and Policies Setup
-- Run this in Supabase SQL Editor to check if everything is configured correctly

-- 1. Check if bucket exists
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
WHERE name = 'approval-sheets';

-- Expected result:
-- id: approval-sheets
-- name: approval-sheets  
-- public: false
-- file_size_limit: 5242880 (5MB)
-- allowed_mime_types: should show array of image types

-- 2. Check storage policies
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'objects'
AND schemaname = 'storage'
AND policyname LIKE '%approval%'
ORDER BY policyname;

-- Expected policies:
-- - Students can upload own approval sheets (INSERT)
-- - Students can view own approval sheets (SELECT)
-- - Faculty can view all approval sheets (SELECT)
-- - Students can update own approval sheets (UPDATE)
-- - Students can delete own approval sheets (DELETE)
-- - Faculty can delete all approval sheets (DELETE)

-- 3. Test file path format (if you have data)
SELECT 
    id,
    abstract_id,
    student_id,
    file_name,
    file_path,
    storage_url,
    CASE 
        WHEN storage_url LIKE 'http%' THEN '❌ OLD FORMAT (public URL)'
        WHEN storage_url LIKE '%/%/%' THEN '✅ CORRECT FORMAT (file path)'
        ELSE '⚠️ UNKNOWN FORMAT'
    END as url_format_check
FROM approval_sheets
ORDER BY created_at DESC;

-- If url_format_check shows "OLD FORMAT", run fix-approval-sheet-urls.sql
