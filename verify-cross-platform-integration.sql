-- ================================================================
-- VERIFICATION AND TESTING SCRIPT
-- Run this AFTER applying cross-platform-application-migration.sql
-- ================================================================

-- ================================================================
-- TEST 1: Verify Trigger Functions Exist
-- ================================================================

SELECT 
  'Test 1: Trigger Functions' as test_name,
  CASE 
    WHEN COUNT(*) = 2 THEN '✅ PASS - Both trigger functions exist'
    ELSE '❌ FAIL - Missing trigger functions'
  END as result
FROM pg_proc 
WHERE proname IN ('auto_assign_research_themes', 'auto_assign_emerging_technologies');

-- ================================================================
-- TEST 2: Verify Triggers Are Active
-- ================================================================

SELECT 
  'Test 2: Active Triggers' as test_name,
  CASE 
    WHEN COUNT(*) >= 2 THEN '✅ PASS - Triggers are active'
    ELSE '❌ FAIL - Triggers not found'
  END as result
FROM pg_trigger 
WHERE tgname IN ('auto_assign_themes_trigger', 'trigger_auto_assign_emerging_tech');

-- ================================================================
-- TEST 3: Count Abstracts with Cross-Platform Classification
-- ================================================================

SELECT 
  'Test 3: Cross-Platform Classification' as test_name,
  COUNT(*) FILTER (WHERE 'Cross-Platform Application' = ANY(research_themes)) as theme_count,
  COUNT(*) FILTER (WHERE 'Cross-Platform Application' = ANY(emerging_technologies)) as tech_count,
  CASE 
    WHEN COUNT(*) FILTER (WHERE 'Cross-Platform Application' = ANY(research_themes)) > 0 
      OR COUNT(*) FILTER (WHERE 'Cross-Platform Application' = ANY(emerging_technologies)) > 0 
    THEN '✅ PASS - Abstracts classified'
    ELSE '⚠️  WARNING - No abstracts found (may need abstracts with matching keywords)'
  END as result
FROM abstracts
WHERE status = 'approved';

-- ================================================================
-- TEST 4: Sample Classified Abstracts
-- ================================================================

SELECT 
  'Test 4: Sample Abstracts' as test_name,
  '✅ See results below' as result;

SELECT 
  id,
  LEFT(title, 60) || '...' as title_preview,
  research_themes,
  emerging_technologies,
  status,
  created_at
FROM abstracts
WHERE 'Cross-Platform Application' = ANY(research_themes)
   OR 'Cross-Platform Application' = ANY(emerging_technologies)
ORDER BY created_at DESC
LIMIT 5;

-- ================================================================
-- TEST 5: Check Keyword Pattern Matching
-- ================================================================

-- This simulates what abstracts WOULD match if they existed
SELECT 
  'Test 5: Keyword Pattern Matching' as test_name,
  '✅ See test cases below' as result;

-- Test case examples (these are simulated titles to verify regex patterns)
WITH test_titles AS (
  SELECT 'Development of React Native Mobile App' as title, 'react native' as keyword UNION ALL
  SELECT 'Flutter-based Cross-Platform System', 'flutter' UNION ALL
  SELECT 'Progressive Web Application for E-Commerce', 'pwa' UNION ALL
  SELECT 'Ionic Framework for Mobile Development', 'ionic' UNION ALL
  SELECT 'Angular and Node.js Web Platform', 'angular, node.js' UNION ALL
  SELECT 'Responsive Design Implementation', 'responsive design' UNION ALL
  SELECT 'Legacy Desktop Application', 'none (should NOT match)'
)
SELECT 
  title,
  keyword,
  CASE 
    WHEN LOWER(title) ~* '\y(cross-platform|cross platform|web|android|ios|react native|flutter|xamarin|ionic|cordova|phonegap|nativescript|react|vue\.?js|angular|node\.?js|responsive design|responsive web|mobile-first|mobile first|progressive web app|pwa|multi-platform|multiplatform)\y'
    THEN '✅ MATCH - Would be classified'
    ELSE '❌ NO MATCH'
  END as pattern_test
FROM test_titles;

-- ================================================================
-- TEST 6: Category Distribution
-- ================================================================

SELECT 
  'Test 6: Category Distribution' as test_name,
  '✅ See distribution below' as result;

-- Show all research themes with counts
WITH theme_counts AS (
  SELECT 
    unnest(research_themes) as theme,
    COUNT(*) as count
  FROM abstracts
  WHERE status = 'approved'
  GROUP BY unnest(research_themes)
)
SELECT 
  theme,
  count,
  ROUND((count::NUMERIC / SUM(count) OVER ()) * 100, 1) || '%' as percentage,
  CASE 
    WHEN theme = 'Cross-Platform Application' THEN '✨ NEW CATEGORY'
    ELSE ''
  END as notes
FROM theme_counts
ORDER BY count DESC;

-- ================================================================
-- TEST 7: Emerging Technologies Distribution
-- ================================================================

SELECT 
  'Test 7: Emerging Tech Distribution' as test_name,
  '✅ See distribution below' as result;

WITH tech_counts AS (
  SELECT 
    unnest(emerging_technologies) as technology,
    COUNT(*) as count
  FROM abstracts
  WHERE status = 'approved'
  GROUP BY unnest(emerging_technologies)
)
SELECT 
  technology,
  count,
  ROUND((count::NUMERIC / SUM(count) OVER ()) * 100, 1) || '%' as percentage,
  CASE 
    WHEN technology = 'Cross-Platform Application' THEN '✨ NEW CATEGORY'
    ELSE ''
  END as notes
FROM tech_counts
ORDER BY count DESC;

-- ================================================================
-- TEST 8: Trigger Test (Manual)
-- ================================================================

-- Uncomment and modify this section to test with a real abstract
/*
-- Update an existing abstract to test trigger (replace ABSTRACT_ID_HERE)
UPDATE abstracts
SET status = 'pending'  -- First set to pending
WHERE id = 'ABSTRACT_ID_HERE';

-- Then approve it to trigger the classification
UPDATE abstracts
SET status = 'approved'
WHERE id = 'ABSTRACT_ID_HERE';

-- Check if it was classified
SELECT 
  id,
  title,
  research_themes,
  emerging_technologies
FROM abstracts
WHERE id = 'ABSTRACT_ID_HERE';
*/

-- ================================================================
-- SUMMARY REPORT
-- ================================================================

SELECT 
  '========================================' as separator,
  'VERIFICATION SUMMARY' as report_title,
  '========================================' as separator2;

SELECT 
  'Total Approved Abstracts' as metric,
  COUNT(*)::TEXT as value
FROM abstracts
WHERE status = 'approved'

UNION ALL

SELECT 
  'Cross-Platform Theme Count',
  COUNT(*)::TEXT
FROM abstracts
WHERE 'Cross-Platform Application' = ANY(research_themes)

UNION ALL

SELECT 
  'Cross-Platform Tech Count',
  COUNT(*)::TEXT
FROM abstracts
WHERE 'Cross-Platform Application' = ANY(emerging_technologies)

UNION ALL

SELECT 
  'Total Research Themes',
  COUNT(DISTINCT unnest(research_themes))::TEXT
FROM abstracts
WHERE status = 'approved'

UNION ALL

SELECT 
  'Total Emerging Technologies',
  COUNT(DISTINCT unnest(emerging_technologies))::TEXT
FROM abstracts
WHERE status = 'approved';

-- Final success message
SELECT 
  '✅ Verification Complete!' as status,
  'Review the test results above to confirm integration' as next_step,
  'If all tests pass, the Cross-Platform Application category is ready!' as note;
