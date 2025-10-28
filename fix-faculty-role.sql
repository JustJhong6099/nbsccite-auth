-- Fix Faculty Role Access
-- This script helps diagnose and fix faculty access issues

-- 1. Check current user's profile and role
-- Run this query and replace 'faculty@nbsc.edu.ph' with your actual faculty email
SELECT 
    id,
    email,
    full_name,
    role,
    created_at
FROM profiles
WHERE email = 'faculty@nbsc.edu.ph'; -- REPLACE WITH YOUR FACULTY EMAIL

-- 2. If the role is NULL or 'student', update it to 'faculty'
-- Replace 'faculty@nbsc.edu.ph' with your actual faculty email
UPDATE profiles
SET role = 'faculty'
WHERE email = 'faculty@nbsc.edu.ph'; -- REPLACE WITH YOUR FACULTY EMAIL

-- 3. Verify the update
SELECT 
    id,
    email,
    full_name,
    role
FROM profiles
WHERE email = 'faculty@nbsc.edu.ph'; -- REPLACE WITH YOUR FACULTY EMAIL

-- 4. Check all abstracts in the database
SELECT 
    a.id,
    a.title,
    a.status,
    a.submitted_date,
    a.student_id,
    p.full_name as student_name,
    p.email as student_email
FROM abstracts a
LEFT JOIN profiles p ON a.student_id = p.id
ORDER BY a.submitted_date DESC;

-- 5. Check if faculty can see abstracts (test RLS policy)
-- This should return rows if RLS is working correctly
SELECT COUNT(*) as total_abstracts FROM abstracts;
SELECT COUNT(*) as pending_abstracts FROM abstracts WHERE status = 'pending';

-- 6. If you still can't see abstracts, temporarily disable RLS for testing
-- WARNING: Only do this in development, never in production!
-- ALTER TABLE abstracts DISABLE ROW LEVEL SECURITY;

-- 7. To re-enable RLS after testing:
-- ALTER TABLE abstracts ENABLE ROW LEVEL SECURITY;
