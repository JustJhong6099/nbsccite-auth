-- =============================================
-- NBSC CITE Version 2.0 Migration
-- Removes admin role and transfers privileges to faculty
-- Faculty accounts no longer require admin approval
-- =============================================

-- Step 1: Update any existing pending faculty accounts to active status
UPDATE public.profiles
SET status = 'active'
WHERE role = 'faculty' AND status = 'pending';

-- Step 2: Convert all existing admin accounts to faculty role
-- This preserves their data while transferring admin privileges to faculty role
UPDATE public.profiles
SET role = 'faculty', updated_at = NOW()
WHERE role = 'admin';

COMMENT ON UPDATE IS 'v2.0: Converted all admin accounts to faculty role';

-- Step 3: Update the profiles table to remove 'admin' from role constraint
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('faculty', 'student'));

COMMENT ON CONSTRAINT profiles_role_check ON public.profiles IS 
'v2.0: Only faculty and student roles are allowed. Admin role has been removed.';

-- Step 4: Update the handle_new_user function to make faculty accounts active by default
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Version 2.0: Faculty accounts are now active by default (no admin approval needed)
  -- Admin role is no longer available
  INSERT INTO public.profiles (id, email, full_name, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Unknown'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    'active'  -- All users (including faculty) are active by default
  );
  
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user IS 
'v2.0: Creates user profiles with active status. Faculty approval removed. Admin role deprecated.';

-- Step 5: Mark pending approvals as approved (they are now obsolete)
UPDATE public.pending_approvals
SET status = 'approved', approved_at = NOW()
WHERE status = 'pending';

COMMENT ON TABLE public.pending_approvals IS 
'Deprecated in v2.0 - Faculty approvals are no longer required. Kept for historical records.';

-- Step 6: Update table comments for documentation
COMMENT ON TABLE public.profiles IS 
'v2.0: Faculty members now have full administrative privileges. Admin role has been removed and converted to faculty.';

COMMENT ON COLUMN public.profiles.role IS 
'User role: faculty or student. Admin role deprecated in v2.0 (converted to faculty).';

-- Step 7: Optional - Create a view for audit/reporting of the migration
CREATE OR REPLACE VIEW public.v2_migration_summary AS
SELECT 
  'Total Profiles' as metric,
  COUNT(*)::text as value
FROM public.profiles
UNION ALL
SELECT 
  'Faculty Accounts',
  COUNT(*)::text
FROM public.profiles WHERE role = 'faculty'
UNION ALL
SELECT 
  'Student Accounts',
  COUNT(*)::text
FROM public.profiles WHERE role = 'student'
UNION ALL
SELECT 
  'Active Accounts',
  COUNT(*)::text
FROM public.profiles WHERE status = 'active'
UNION ALL
SELECT 
  'Obsolete Pending Approvals',
  COUNT(*)::text
FROM public.pending_approvals WHERE status IN ('pending', 'approved');

COMMENT ON VIEW public.v2_migration_summary IS 
'Summary of v2.0 migration results';

-- Step 8: Update RLS policies to grant faculty full administrative access
-- Drop old admin-specific policies if they exist
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all approval requests" ON public.pending_approvals;
DROP POLICY IF EXISTS "Admins can manage approval requests" ON public.pending_approvals;

-- Create new faculty-centric RLS policies
-- v2.0: Faculty now have full administrative privileges

-- Profiles table policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles  
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Faculty can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'faculty' AND status = 'active'
    )
  );

CREATE POLICY "Faculty can update all profiles" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'faculty' AND status = 'active'
    )
  );

CREATE POLICY "Faculty can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'faculty' AND status = 'active'
    )
  );

CREATE POLICY "Faculty can delete profiles" ON public.profiles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'faculty' AND status = 'active'
    )
  );

-- Pending approvals table policies (kept for historical records)
CREATE POLICY "Users can view their own approval requests" ON public.pending_approvals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Faculty can view all approval requests" ON public.pending_approvals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'faculty' AND status = 'active'
    )
  );

CREATE POLICY "Faculty can manage all approval requests" ON public.pending_approvals
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'faculty' AND status = 'active'
    )
  );

COMMENT ON POLICY "Faculty can view all profiles" ON public.profiles IS 
'v2.0: Faculty members have full read access to all profiles (admin-level privileges)';

COMMENT ON POLICY "Faculty can update all profiles" ON public.profiles IS 
'v2.0: Faculty members can update any profile (admin-level privileges)';

-- Final message
DO $$
BEGIN
  RAISE NOTICE '✅ Version 2.0 Migration Complete!';
  RAISE NOTICE '   - Admin role removed from system';
  RAISE NOTICE '   - All admin accounts converted to faculty';
  RAISE NOTICE '   - Faculty approval requirement removed';
  RAISE NOTICE '   - All accounts set to active status';
  RAISE NOTICE '   - Database constraints updated';
  RAISE NOTICE '   - RLS policies updated (faculty has admin privileges)';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '   1. Deploy updated frontend code';
  RAISE NOTICE '   2. Test faculty login and features';
  RAISE NOTICE '   3. Verify analytics access for faculty';
  RAISE NOTICE '   4. Verify faculty can manage all users';
END $$;
