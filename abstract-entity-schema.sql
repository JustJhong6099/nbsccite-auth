-- Abstract Submissions with Entity Extraction Schema
-- Creates tables for storing student abstract submissions with extracted entities

-- Create abstracts table
CREATE TABLE IF NOT EXISTS abstracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    authors TEXT[] NOT NULL,
    abstract_text TEXT NOT NULL,
    keywords TEXT[] NOT NULL,
    year INTEGER NOT NULL,
    department TEXT,
    category TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'needs-revision')),
    
    -- Entity extraction fields
    extracted_entities JSONB,
    entity_extraction_confidence DECIMAL(3,2),
    
    -- Metadata
    submitted_by TEXT DEFAULT 'Student',
    submitted_date TIMESTAMP DEFAULT NOW(),
    reviewed_date TIMESTAMP,
    reviewed_by UUID REFERENCES auth.users(id),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_abstracts_student_id ON abstracts(student_id);
CREATE INDEX IF NOT EXISTS idx_abstracts_status ON abstracts(status);
CREATE INDEX IF NOT EXISTS idx_abstracts_year ON abstracts(year);

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_abstracts_updated_at 
    BEFORE UPDATE ON abstracts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE abstracts ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Students can view their own abstracts
CREATE POLICY "Students can view own abstracts"
    ON abstracts FOR SELECT
    TO authenticated
    USING (student_id = auth.uid());

-- Students can insert their own abstracts
CREATE POLICY "Students can insert own abstracts"
    ON abstracts FOR INSERT
    TO authenticated
    WITH CHECK (student_id = auth.uid());

-- Students can update their own pending/rejected abstracts
CREATE POLICY "Students can update own pending abstracts"
    ON abstracts FOR UPDATE
    TO authenticated
    USING (student_id = auth.uid() AND status IN ('pending', 'rejected', 'needs-revision'));

-- Faculty can view all abstracts
CREATE POLICY "Faculty can view all abstracts"
    ON abstracts FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'faculty'
        )
    );

-- Faculty can update all abstracts (for review)
CREATE POLICY "Faculty can update all abstracts"
    ON abstracts FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'faculty'
        )
    );

-- Faculty can delete abstracts
CREATE POLICY "Faculty can delete abstracts"
    ON abstracts FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'faculty'
        )
    );

-- Everyone can view approved abstracts (for library)
CREATE POLICY "Anyone can view approved abstracts"
    ON abstracts FOR SELECT
    TO authenticated
    USING (status = 'approved');

-- Sample extracted_entities JSONB structure:
-- {
--   "technologies": ["Machine Learning", "IoT", "CNN", "RNN"],
--   "domains": ["Agriculture", "Precision Farming", "Computer Vision"],
--   "methodologies": ["Deep Learning", "Data Analytics"],
--   "confidence": 0.92
-- }
