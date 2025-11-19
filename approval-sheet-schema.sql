-- Approval Sheet Upload Schema
-- Creates table for storing approval sheet images for research abstracts

-- Create approval_sheets table
CREATE TABLE IF NOT EXISTS approval_sheets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    abstract_id UUID REFERENCES abstracts(id) ON DELETE CASCADE,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- File storage information
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_type TEXT NOT NULL,
    storage_url TEXT NOT NULL,
    
    -- Upload metadata
    uploaded_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Verification status
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES auth.users(id),
    verified_at TIMESTAMP,
    verification_notes TEXT,
    
    CONSTRAINT unique_abstract_approval UNIQUE (abstract_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_approval_sheets_abstract_id ON approval_sheets(abstract_id);
CREATE INDEX IF NOT EXISTS idx_approval_sheets_student_id ON approval_sheets(student_id);
CREATE INDEX IF NOT EXISTS idx_approval_sheets_verified ON approval_sheets(is_verified);

-- Create trigger for updated_at
CREATE TRIGGER update_approval_sheets_updated_at 
    BEFORE UPDATE ON approval_sheets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE approval_sheets ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Students can view their own approval sheets
CREATE POLICY "Students can view own approval sheets"
    ON approval_sheets FOR SELECT
    TO authenticated
    USING (student_id = auth.uid());

-- Students can insert their own approval sheets
CREATE POLICY "Students can insert own approval sheets"
    ON approval_sheets FOR INSERT
    TO authenticated
    WITH CHECK (student_id = auth.uid());

-- Students can update their own unverified approval sheets
CREATE POLICY "Students can update own unverified approval sheets"
    ON approval_sheets FOR UPDATE
    TO authenticated
    USING (student_id = auth.uid() AND is_verified = FALSE);

-- Students can delete their own unverified approval sheets
CREATE POLICY "Students can delete own unverified approval sheets"
    ON approval_sheets FOR DELETE
    TO authenticated
    USING (student_id = auth.uid() AND is_verified = FALSE);

-- Faculty can view all approval sheets
CREATE POLICY "Faculty can view all approval sheets"
    ON approval_sheets FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'faculty'
        )
    );

-- Faculty can update all approval sheets (for verification)
CREATE POLICY "Faculty can update all approval sheets"
    ON approval_sheets FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'faculty'
        )
    );

-- Faculty can delete approval sheets
CREATE POLICY "Faculty can delete approval sheets"
    ON approval_sheets FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'faculty'
        )
    );

-- Create storage bucket for approval sheets (Run this in Supabase Dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('approval-sheets', 'approval-sheets', false);

-- Storage policies for approval sheets bucket
CREATE POLICY "Students can upload own approval sheets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'approval-sheets' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Students can view own approval sheets"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'approval-sheets' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Faculty can view all approval sheets"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'approval-sheets' AND
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'faculty'
    )
);

CREATE POLICY "Students can update own approval sheets"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'approval-sheets' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Students can delete own approval sheets"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'approval-sheets' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Faculty can delete all approval sheets"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'approval-sheets' AND
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'faculty'
    )
);

COMMENT ON TABLE approval_sheets IS 'Stores approval sheet images for research abstracts';
COMMENT ON COLUMN approval_sheets.abstract_id IS 'References the abstract this approval sheet belongs to';
COMMENT ON COLUMN approval_sheets.storage_url IS 'Storage file path for the approval sheet (e.g., user_id/abstract_id/approval_sheet.jpg)';
COMMENT ON COLUMN approval_sheets.is_verified IS 'Whether the approval sheet has been verified by faculty';
