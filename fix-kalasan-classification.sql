-- ================================================================
-- FIX KALASAN MISCLASSIFICATION
-- Move KALASAN papers from Education to Geographic Information Systems
-- ================================================================

-- Update existing KALASAN papers
UPDATE abstracts
SET research_themes = array_remove(research_themes, 'Education & E-Learning')
WHERE LOWER(title) LIKE '%kalasan%'
  AND 'Education & E-Learning' = ANY(research_themes);

-- Add Geographic Information Systems theme to KALASAN papers
UPDATE abstracts
SET research_themes = array_append(research_themes, 'Geographic Information Systems')
WHERE LOWER(title) LIKE '%kalasan%'
  AND NOT ('Geographic Information Systems' = ANY(research_themes));

-- Verify the changes
SELECT 
  id,
  title,
  research_themes
FROM abstracts
WHERE LOWER(title) LIKE '%kalasan%';
