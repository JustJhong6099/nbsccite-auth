-- Add profile fields to existing profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS position TEXT,
ADD COLUMN IF NOT EXISTS biography TEXT,
ADD COLUMN IF NOT EXISTS research_interests TEXT[];

-- Update department constraint (optional)
COMMENT ON COLUMN public.profiles.department IS 'User department/institute';
COMMENT ON COLUMN public.profiles.position IS 'Faculty position or student program';
COMMENT ON COLUMN public.profiles.biography IS 'Professional background and interests';
COMMENT ON COLUMN public.profiles.research_interests IS 'Array of research interests';
