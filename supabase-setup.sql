-- =============================================
-- NBSC CITE Authentication System Setup
-- Run this in your Supabase SQL Editor
-- =============================================

-- Note: auth.users table already has RLS enabled by default in Supabase

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'faculty', 'student')) DEFAULT 'student',
  status TEXT NOT NULL CHECK (status IN ('active', 'pending', 'rejected')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create pending approvals table for faculty requests
CREATE TABLE IF NOT EXISTS public.pending_approvals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  requested_role TEXT NOT NULL CHECK (requested_role IN ('faculty')) DEFAULT 'faculty',
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_approvals ENABLE ROW LEVEL SECURITY;

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Unknown'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    CASE 
      WHEN COALESCE(NEW.raw_user_meta_data->>'role', 'student') = 'faculty' THEN 'pending'
      ELSE 'active'
    END
  );
  
  -- If user is requesting faculty role, add to pending approvals
  IF COALESCE(NEW.raw_user_meta_data->>'role', 'student') = 'faculty' THEN
    INSERT INTO public.pending_approvals (user_id, full_name, email, requested_role)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'Unknown'),
      NEW.email,
      'faculty'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$;

-- Create trigger for updating updated_at on profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Drop existing RLS policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own approval requests" ON public.pending_approvals;
DROP POLICY IF EXISTS "Admins can view all approval requests" ON public.pending_approvals;
DROP POLICY IF EXISTS "Admins can update approval requests" ON public.pending_approvals;

-- Temporarily disable RLS to fix the recursion issue
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_approvals DISABLE ROW LEVEL SECURITY;

-- We'll re-enable RLS after testing that basic auth works

-- =============================================
-- PROPER RLS SETUP (Run after auth is working)
-- =============================================
-- Re-enable RLS with proper policies that avoid recursion
-- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.pending_approvals ENABLE ROW LEVEL SECURITY;

-- Basic policies for profiles (no admin checks to avoid recursion)
-- CREATE POLICY "Users can view their own profile" ON public.profiles
--   FOR SELECT USING (auth.uid() = id);

-- CREATE POLICY "Users can update their own profile" ON public.profiles  
--   FOR UPDATE USING (auth.uid() = id);

-- Basic policies for pending_approvals  
-- CREATE POLICY "Users can view their own approval requests" ON public.pending_approvals
--   FOR SELECT USING (auth.uid() = user_id);

-- Note: Admin access will be handled through the admin dashboard interface
-- rather than RLS policies to avoid recursion issues

-- Function to approve faculty request
CREATE OR REPLACE FUNCTION public.approve_faculty_request(request_id UUID)
RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  approval_record RECORD;
BEGIN
  -- Get the approval request
  SELECT * INTO approval_record 
  FROM public.pending_approvals 
  WHERE id = request_id AND status = 'pending';
  
  IF approval_record IS NULL THEN
    RAISE EXCEPTION 'Approval request not found or already processed';
  END IF;
  
  -- Update the user's profile to faculty role and active status
  UPDATE public.profiles 
  SET role = 'faculty', status = 'active', updated_at = NOW()
  WHERE id = approval_record.user_id;
  
  -- Update the approval request
  UPDATE public.pending_approvals 
  SET status = 'approved', approved_by = auth.uid(), approved_at = NOW()
  WHERE id = request_id;
END;
$$;

-- Function to reject faculty request
CREATE OR REPLACE FUNCTION public.reject_faculty_request(request_id UUID)
RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  approval_record RECORD;
BEGIN
  -- Get the approval request
  SELECT * INTO approval_record 
  FROM public.pending_approvals 
  WHERE id = request_id AND status = 'pending';
  
  IF approval_record IS NULL THEN
    RAISE EXCEPTION 'Approval request not found or already processed';
  END IF;
  
  -- Update the user's profile status to rejected
  UPDATE public.profiles 
  SET status = 'rejected', updated_at = NOW()
  WHERE id = approval_record.user_id;
  
  -- Update the approval request
  UPDATE public.pending_approvals 
  SET status = 'rejected', approved_by = auth.uid(), approved_at = NOW()
  WHERE id = request_id;
END;
$$;

-- =============================================
-- MANUAL ADMIN SETUP
-- =============================================
-- After running the above, you'll need to manually create an admin user:
-- 1. Sign up a user through your app
-- 2. Go to Authentication > Users in Supabase dashboard
-- 3. Find the user and note their UUID
-- 4. Run this query with the actual UUID:

-- UPDATE public.profiles 
-- SET role = 'admin', status = 'active'
-- WHERE id = 'YOUR_ADMIN_USER_UUID_HERE';

-- =============================================
-- Test Queries (Optional)
-- =============================================
-- View all profiles:
-- SELECT * FROM public.profiles;

-- View pending faculty approvals:
-- SELECT * FROM public.pending_approvals WHERE status = 'pending';

-- Check user role:
-- SELECT role, status FROM public.profiles WHERE id = auth.uid();
