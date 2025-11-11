-- ================================================================
-- CREATE ACTIVITY LOGS TABLE
-- Track all faculty actions on abstracts for audit trail
-- ================================================================

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL,
  action TEXT NOT NULL, -- 'approve', 'reject', 'edit', 'delete', 'publish', 'create'
  action_type TEXT NOT NULL, -- 'abstract_management', 'user_management', 'system'
  target_type TEXT, -- 'abstract', 'user', 'entity', etc.
  target_id TEXT, -- ID of the affected resource
  target_title TEXT, -- Title/name of the affected resource
  details JSONB, -- Additional details about the action
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON public.activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_email ON public.activity_logs(user_email);
CREATE INDEX IF NOT EXISTS idx_activity_logs_target_id ON public.activity_logs(target_id);

-- Enable RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Faculty can view all logs, students can view their own
CREATE POLICY "Faculty can view all activity logs"
  ON public.activity_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'faculty'
    )
  );

CREATE POLICY "Users can view their own activity logs"
  ON public.activity_logs
  FOR SELECT
  USING (user_id = auth.uid());

-- Only system/backend can insert logs (via service role)
CREATE POLICY "Service role can insert activity logs"
  ON public.activity_logs
  FOR INSERT
  WITH CHECK (true);

-- Function to automatically log abstract actions
CREATE OR REPLACE FUNCTION log_abstract_activity()
RETURNS TRIGGER AS $$
DECLARE
  v_user_email TEXT;
  v_user_name TEXT;
  v_user_role TEXT;
  v_action TEXT;
  v_details JSONB;
BEGIN
  -- Get user details
  SELECT email, full_name, role INTO v_user_email, v_user_name, v_user_role
  FROM public.profiles
  WHERE id = auth.uid();

  -- Determine action type
  IF TG_OP = 'INSERT' THEN
    v_action := 'create';
    v_details := jsonb_build_object(
      'title', NEW.title,
      'status', NEW.status
    );
  ELSIF TG_OP = 'UPDATE' THEN
    -- Determine specific update action
    IF OLD.status != NEW.status THEN
      IF NEW.status = 'approved' THEN
        v_action := 'approve';
      ELSIF NEW.status = 'rejected' THEN
        v_action := 'reject';
      ELSE
        v_action := 'status_change';
      END IF;
      v_details := jsonb_build_object(
        'title', NEW.title,
        'old_status', OLD.status,
        'new_status', NEW.status
      );
    ELSE
      v_action := 'edit';
      v_details := jsonb_build_object(
        'title', NEW.title,
        'status', NEW.status,
        'fields_changed', jsonb_build_array()
      );
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'delete';
    v_details := jsonb_build_object(
      'title', OLD.title,
      'status', OLD.status
    );
  END IF;

  -- Insert activity log
  INSERT INTO public.activity_logs (
    user_id,
    user_email,
    user_name,
    user_role,
    action,
    action_type,
    target_type,
    target_id,
    target_title,
    details
  ) VALUES (
    auth.uid(),
    COALESCE(v_user_email, 'system'),
    COALESCE(v_user_name, 'System'),
    COALESCE(v_user_role, 'system'),
    v_action,
    'abstract_management',
    'abstract',
    COALESCE(NEW.id::TEXT, OLD.id::TEXT),
    COALESCE(NEW.title, OLD.title),
    v_details
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for abstract changes (only for faculty actions)
DROP TRIGGER IF EXISTS trigger_log_abstract_activity ON abstracts;
CREATE TRIGGER trigger_log_abstract_activity
  AFTER UPDATE OR DELETE ON abstracts
  FOR EACH ROW
  WHEN (auth.uid() IS NOT NULL)
  EXECUTE FUNCTION log_abstract_activity();

-- Create view for formatted activity logs
CREATE OR REPLACE VIEW activity_logs_formatted AS
SELECT 
  id,
  user_name AS "Faculty Name",
  user_email AS "Email",
  CASE 
    WHEN action = 'approve' THEN 'Approved'
    WHEN action = 'reject' THEN 'Rejected'
    WHEN action = 'edit' THEN 'Edited'
    WHEN action = 'delete' THEN 'Deleted'
    WHEN action = 'publish' THEN 'Published'
    WHEN action = 'create' THEN 'Created'
    ELSE INITCAP(action)
  END AS "Action",
  target_title AS "Paper Title",
  details->>'old_status' AS "Previous Status",
  details->>'new_status' AS "New Status",
  created_at AS "Timestamp",
  ip_address AS "IP Address"
FROM public.activity_logs
WHERE action_type = 'abstract_management'
ORDER BY created_at DESC;

-- Grant permissions
GRANT SELECT ON activity_logs_formatted TO authenticated;

COMMENT ON TABLE public.activity_logs IS 'Audit trail for all user activities, especially faculty actions on abstracts';
COMMENT ON COLUMN public.activity_logs.action IS 'Action performed: approve, reject, edit, delete, publish, create';
COMMENT ON COLUMN public.activity_logs.details IS 'JSON object containing action-specific details';

-- Success message
SELECT 'Activity logs table created successfully!' as status;
