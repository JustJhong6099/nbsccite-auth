-- Quick Fix Script for "Bucket not found" Error
-- Run this in Supabase SQL Editor if you're still getting errors

-- STEP 1: Verify bucket exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'approval-sheets') THEN
        RAISE NOTICE '❌ BUCKET NOT FOUND - Creating it now...';
        
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES (
            'approval-sheets',
            'approval-sheets',
            false,
            5242880,
            ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
        );
        
        RAISE NOTICE '✅ Bucket created successfully!';
    ELSE
        RAISE NOTICE '✅ Bucket already exists';
    END IF;
END $$;

-- STEP 2: Fix any old approval sheet records with public URLs
UPDATE approval_sheets
SET storage_url = file_path
WHERE storage_url LIKE 'http%' OR storage_url LIKE 'https%';

-- STEP 3: Verify storage policies exist
SELECT 
    CASE 
        WHEN COUNT(*) >= 6 THEN '✅ All storage policies found (' || COUNT(*) || ' policies)'
        WHEN COUNT(*) > 0 THEN '⚠️ Some policies missing (' || COUNT(*) || ' found, need 6)'
        ELSE '❌ No storage policies found - run approval-sheet-schema.sql!'
    END as policy_status
FROM pg_policies
WHERE tablename = 'objects'
AND schemaname = 'storage'
AND policyname LIKE '%approval%';

-- STEP 4: Show current approval sheets status
SELECT 
    COUNT(*) as total_records,
    COUNT(CASE WHEN storage_url LIKE 'http%' THEN 1 END) as old_format_count,
    COUNT(CASE WHEN storage_url NOT LIKE 'http%' THEN 1 END) as correct_format_count
FROM approval_sheets;

-- If you see results, the table exists and has data
-- If error "relation does not exist", run approval-sheet-schema.sql first
