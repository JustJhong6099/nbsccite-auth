-- ================================================================
-- IMPROVED MULTI-THEME ASSIGNMENT WITH COMPREHENSIVE KEYWORDS
-- Each abstract can have MULTIPLE themes
-- ================================================================

-- 1. Add columns for multiple themes
ALTER TABLE abstracts 
ADD COLUMN IF NOT EXISTS research_theme TEXT; -- Primary theme
ALTER TABLE abstracts 
ADD COLUMN IF NOT EXISTS research_themes TEXT[]; -- All matching themes (array)

-- 2. Clear existing assignments
UPDATE abstracts SET research_theme = NULL, research_themes = NULL WHERE status = 'approved';

-- 3. Assign themes based on comprehensive keyword matching
-- More specific themes FIRST to avoid mismatches

-- IoT & Automation (VERY SPECIFIC - check first!)
UPDATE abstracts 
SET research_themes = array_append(COALESCE(research_themes, ARRAY[]::TEXT[]), 'IoT & Automation')
WHERE status = 'approved' 
  AND (
    LOWER(title) ~* '\y(iot|internet of things|sensor|arduino|raspberry pi|microcontroller|embedded|actuator|rfid|relay|automation|smart device|monitoring system|ultrasonic|wifi module|esp|nodemcu|smart irrigation|temperature sensor|motion detector|environmental monitoring|wireless|prototype|micro controller|solar panel)\y'
  );

-- Geographic Information Systems (SPECIFIC)
UPDATE abstracts 
SET research_themes = array_append(COALESCE(research_themes, ARRAY[]::TEXT[]), 'Geographic Information Systems')
WHERE status = 'approved' 
  AND (
    LOWER(title) ~* '\y(gis|geographic|geospatial|mapping|map|location tracking|coordinate|spatial|satellite|gps|terrain|route|boundary|navigation|cluster mapping|geolocation|kalasan)\y'
  );

-- Agriculture & Smart Farming
UPDATE abstracts 
SET research_themes = array_append(COALESCE(research_themes, ARRAY[]::TEXT[]), 'Agriculture & Smart Farming')
WHERE status = 'approved' 
  AND (
    LOWER(title) ~* '\y(agriculture|farm|farming|crop|harvest|soil|irrigation|rice|livestock|fertilizer|plant monitoring|greenhouse|agricultural|smart farm)\y'
  );

-- Healthcare & Medical Systems
UPDATE abstracts 
SET research_themes = array_append(COALESCE(research_themes, ARRAY[]::TEXT[]), 'Healthcare & Medical Systems')
WHERE status = 'approved' 
  AND (
    LOWER(title) ~* '\y(health|medical|clinic|patient|doctor|hospital|medicine|appointment|prescription|consultation|mental health|counseling|health record|patient management|telehealth|nurse|treatment|e-health|nbsc)\y'
  );

-- Document & Records Management (SPECIFIC)
UPDATE abstracts 
SET research_themes = array_append(COALESCE(research_themes, ARRAY[]::TEXT[]), 'Document & Records Management')
WHERE status = 'approved' 
  AND (
    LOWER(title) ~* '\y(document|records?|record management|archiving|file management|tracking system|barcode|qr code|digital file|document retrieval|registry|indexing|file tracking|digital archive|recordata|filing)\y'
  );

-- Security & Access Control (SPECIFIC)
UPDATE abstracts 
SET research_themes = array_append(COALESCE(research_themes, ARRAY[]::TEXT[]), 'Security & Access Control')
WHERE status = 'approved' 
  AND (
    LOWER(title) ~* '\y(security|access control|fingerprint|biometric|authentication|lock|facial recognition|encryption|secure|aes|advanced encryption|data security|door security|violation)\y'
  );

-- Student Services & Administration
UPDATE abstracts 
SET research_themes = array_append(COALESCE(research_themes, ARRAY[]::TEXT[]), 'Student Services & Administration')
WHERE status = 'approved' 
  AND (
    LOWER(title) ~* '\y(student|guidance|discipline|enrollment|grade|attendance|sis|student information|learning management|adviser|class record|faculty evaluation|student portal|academic|student violation|e-pass|personnel)\y'
  );

-- Government & Public Services
UPDATE abstracts 
SET research_themes = array_append(COALESCE(research_themes, ARRAY[]::TEXT[]), 'Government & Public Services')
WHERE status = 'approved' 
  AND (
    LOWER(title) ~* '\y(government|barangay|municipal|city hall|fire department|fire protection|public service|social welfare|lgu|resident|permit|citizen portal|community service|civil registry|ordinance|mswd|bureau)\y'
  );

-- Business & E-Commerce
UPDATE abstracts 
SET research_themes = array_append(COALESCE(research_themes, ARRAY[]::TEXT[]), 'Business & E-Commerce')
WHERE status = 'approved' 
  AND (
    LOWER(title) ~* '\y(inventory|supply chain|pos|point of sale|sales|billing|e-commerce|retail|logistics|warehouse|shop|order management|customer management|financial|product catalog|invoice|store|business management|stock)\y'
  );

-- Data Analytics & Intelligence
UPDATE abstracts 
SET research_themes = array_append(COALESCE(research_themes, ARRAY[]::TEXT[]), 'Data Analytics & Intelligence')
WHERE status = 'approved' 
  AND (
    LOWER(title) ~* '\y(analytics|data analytics|big data|business intelligence|dashboard|predictive|data visualization|data mining|report generation|statistics|trend analysis|machine learning|insight|decision support|andam|visualization)\y'
  );

-- Education & E-Learning
UPDATE abstracts 
SET research_themes = array_append(COALESCE(research_themes, ARRAY[]::TEXT[]), 'Education & E-Learning')
WHERE status = 'approved' 
  AND (
    LOWER(title) ~* '\y(education|e-learning|learning tool|tutorial|quiz|educational|learning system|academic performance|school learning|course|training)\y'
  );

-- Tourism & Entertainment (VERY SPECIFIC - avoid false positives!)
UPDATE abstracts 
SET research_themes = array_append(COALESCE(research_themes, ARRAY[]::TEXT[]), 'Tourism & Entertainment')
WHERE status = 'approved' 
  AND (
    LOWER(title) ~* '\y(tourism|travel|booking|destination|hotel|resort|tour guide|virtual tour|entertainment|event|music|video|festival|cultural|visitor|tourist|vr|ar|virtual reality|augmented reality|dahilayan)\y'
  );

-- Web-Based Information Systems (BROAD - check last!)
UPDATE abstracts 
SET research_themes = array_append(COALESCE(research_themes, ARRAY[]::TEXT[]), 'Web-Based Information Systems')
WHERE status = 'approved' 
  AND (
    LOWER(title) ~* '\y(web-based|website|online platform|responsive web|information system|portal|management system|web application|kanban|counseling|e-giyata|probe)\y'
  );

-- Community & Social Services
UPDATE abstracts 
SET research_themes = array_append(COALESCE(research_themes, ARRAY[]::TEXT[]), 'Community & Social Services')
WHERE status = 'approved' 
  AND (
    LOWER(title) ~* '\y(livelihood|employment|alumni|community mapping|social services|community|profiling|household|adoption|pet|animal|pawster)\y'
  );

-- 4. Set primary theme (first theme in the array)
UPDATE abstracts 
SET research_theme = research_themes[1]
WHERE status = 'approved' 
  AND research_themes IS NOT NULL 
  AND array_length(research_themes, 1) > 0;

-- 5. For abstracts with NO themes assigned, set default
UPDATE abstracts 
SET research_theme = 'Web-Based Information Systems',
    research_themes = ARRAY['Web-Based Information Systems']
WHERE status = 'approved' 
  AND (research_themes IS NULL OR array_length(research_themes, 1) = 0);

-- 6. Check the results
SELECT 
  title,
  research_theme as primary_theme,
  array_length(research_themes, 1) as theme_count,
  research_themes as all_themes
FROM abstracts 
WHERE status = 'approved'
ORDER BY array_length(research_themes, 1) DESC, title;

-- 7. Theme distribution summary
SELECT 
  unnest(research_themes) as theme,
  COUNT(*) as abstracts_count
FROM abstracts 
WHERE status = 'approved'
GROUP BY theme
ORDER BY abstracts_count DESC;
