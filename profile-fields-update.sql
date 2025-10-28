-- Update profiles table with additional fields for Student Profile Management
-- This adds fields that were referenced in the ProfileManagement component

-- Add profile fields if they don't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS student_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS enrollment_year TEXT;

-- Academic information
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS program TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS major TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS minor TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gpa DECIMAL(3,2);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS expected_graduation TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS advisor TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS research_interests TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS skills TEXT[];

-- Research information
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_citations INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS h_index INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS research_groups TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS conferences TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS awards TEXT[];

-- Privacy settings
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_visibility TEXT DEFAULT 'public';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_email BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_phone BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_research_interests BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_publications BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS allow_collaboration BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS index_in_search BOOLEAN DEFAULT true;

-- Add updated_at if not exists
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Create or replace function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_profiles_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

-- Create trigger for updated_at
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_profiles_updated_at_column();

-- Create index on student_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_student_id ON profiles(student_id);

-- Add check constraint for GPA (0.0 to 4.0 or 5.0 scale)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS check_gpa_range;
ALTER TABLE profiles ADD CONSTRAINT check_gpa_range CHECK (gpa IS NULL OR (gpa >= 0 AND gpa <= 5.0));

-- Add check constraint for profile visibility
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS check_profile_visibility;
ALTER TABLE profiles ADD CONSTRAINT check_profile_visibility CHECK (profile_visibility IN ('public', 'private', 'friends'));

-- Sample data structure for arrays:
-- research_interests: ARRAY['Machine Learning', 'AI', 'Web Development']
-- skills: ARRAY['Python', 'JavaScript', 'React']
-- research_groups: ARRAY['AI Research Lab', 'Data Science Group']
-- conferences: ARRAY['NBSC-ICS 2023', 'NBSC-ICS 2024']
-- awards: ARRAY['Best Paper Award 2023', 'Research Excellence 2024']

-- Comment on columns
COMMENT ON COLUMN profiles.phone IS 'Contact phone number';
COMMENT ON COLUMN profiles.date_of_birth IS 'Date of birth';
COMMENT ON COLUMN profiles.address IS 'Physical address';
COMMENT ON COLUMN profiles.bio IS 'Biography or personal statement';
COMMENT ON COLUMN profiles.avatar_url IS 'URL to profile picture';
COMMENT ON COLUMN profiles.student_id IS 'University student ID number';
COMMENT ON COLUMN profiles.enrollment_year IS 'Year of enrollment';
COMMENT ON COLUMN profiles.program IS 'Degree program (e.g., Bachelor of Science in Computer Science)';
COMMENT ON COLUMN profiles.major IS 'Major field of study';
COMMENT ON COLUMN profiles.minor IS 'Minor field of study';
COMMENT ON COLUMN profiles.gpa IS 'Grade Point Average';
COMMENT ON COLUMN profiles.expected_graduation IS 'Expected graduation date (YYYY-MM format)';
COMMENT ON COLUMN profiles.advisor IS 'Academic advisor name';
COMMENT ON COLUMN profiles.research_interests IS 'Array of research interest topics';
COMMENT ON COLUMN profiles.skills IS 'Array of technical skills';
COMMENT ON COLUMN profiles.total_citations IS 'Total number of citations';
COMMENT ON COLUMN profiles.h_index IS 'h-index metric';
COMMENT ON COLUMN profiles.research_groups IS 'Array of research groups/labs';
COMMENT ON COLUMN profiles.conferences IS 'Array of conferences attended';
COMMENT ON COLUMN profiles.awards IS 'Array of awards received';
COMMENT ON COLUMN profiles.profile_visibility IS 'Profile visibility setting (public, private, friends)';
COMMENT ON COLUMN profiles.show_email IS 'Whether to show email publicly';
COMMENT ON COLUMN profiles.show_phone IS 'Whether to show phone publicly';
COMMENT ON COLUMN profiles.show_research_interests IS 'Whether to show research interests publicly';
COMMENT ON COLUMN profiles.show_publications IS 'Whether to show publications publicly';
COMMENT ON COLUMN profiles.allow_collaboration IS 'Whether to allow collaboration requests';
COMMENT ON COLUMN profiles.index_in_search IS 'Whether to be indexed in search results';
