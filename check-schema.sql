-- Check the full schema of abstracts table
SELECT 
  column_name, 
  data_type,
  character_maximum_length,
  numeric_precision,
  numeric_scale,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'abstracts' 
ORDER BY ordinal_position;
