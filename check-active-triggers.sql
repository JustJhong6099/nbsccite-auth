-- Get detailed trigger information
SELECT 
  t.trigger_name,
  t.event_manipulation,
  t.action_timing,
  t.action_statement
FROM information_schema.triggers t
WHERE t.event_object_table = 'abstracts'
ORDER BY t.trigger_name;

-- Also check the actual trigger definitions
SELECT 
  tgname AS trigger_name,
  tgtype AS trigger_type,
  tgenabled AS enabled
FROM pg_trigger
WHERE tgrelid = 'abstracts'::regclass
  AND tgname NOT LIKE 'RI_%'  -- Exclude foreign key triggers
  AND tgname NOT LIKE 'pg_%'; -- Exclude system triggers
