-- =============================================
-- Update User Profiles with Real Names
-- Run this in your Supabase SQL Editor
-- =============================================

-- First, let's see what users exist in auth.users
-- (Run this query first to see your current users)
-- SELECT id, email, raw_user_meta_data FROM auth.users ORDER BY created_at;

-- Update profiles with real names based on your existing users
-- Replace the UUIDs with the actual user IDs from your auth.users table

-- Student Sample
UPDATE public.profiles 
SET full_name = 'Student Sample'
WHERE email = 'student@nbsc.edu.ph';

-- Roger Dimatao
UPDATE public.profiles 
SET full_name = 'Roger Dimatao'
WHERE email = '20211113@nbsc.edu.ph';

-- Just Jhong
UPDATE public.profiles 
SET full_name = 'Just Jhong'
WHERE email = '20211199@nbsc.edu.ph';

-- Jhong Emats
UPDATE public.profiles 
SET full_name = 'Jhong Emats'
WHERE email = '20211740@nbsc.edu.ph';

-- Jhong Ematss (Faculty)
UPDATE public.profiles 
SET full_name = 'Jhong Ematss'
WHERE email = 'mami.daddy@nbsc.edu.ph';

-- NBSC Admin
UPDATE public.profiles 
SET full_name = 'NBSC Admin'
WHERE email = 'admin123@gmail.com';

-- If you need to update the auth.users table metadata as well:
-- UPDATE auth.users 
-- SET raw_user_meta_data = jsonb_set(
--   COALESCE(raw_user_meta_data, '{}'), 
--   '{full_name}', 
--   '"Student Sample"'
-- )
-- WHERE email = 'student@nbsc.edu.ph';

-- Verify the updates
SELECT id, email, full_name, role, status 
FROM public.profiles 
ORDER BY created_at;