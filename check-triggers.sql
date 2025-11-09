-- Check all triggers on abstracts table
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_orientation
FROM information_schema.triggers
WHERE event_object_table = 'abstracts';

-- Check all functions that might be triggers
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_name LIKE '%theme%' OR routine_name LIKE '%research%';
