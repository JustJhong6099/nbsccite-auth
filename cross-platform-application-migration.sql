-- ================================================================
-- COMPREHENSIVE CROSS-PLATFORM APPLICATION INTEGRATION
-- Adds Cross-Platform Application to both Research Themes and Emerging Technologies
-- Run this file in your Supabase SQL Editor
-- ================================================================

-- ================================================================
-- PART 1: UPDATE RESEARCH THEMES TRIGGER
-- ================================================================

CREATE OR REPLACE FUNCTION auto_assign_research_themes()
RETURNS TRIGGER AS $$
DECLARE
  themes_array TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Only process when status changes to 'approved' and title exists
  IF NEW.status = 'approved' AND NEW.title IS NOT NULL AND (OLD IS NULL OR OLD.status IS NULL OR OLD.status != 'approved') THEN
    
    -- IoT & Automation
    IF LOWER(NEW.title) ~* '\y(iot|internet of things|sensor|arduino|raspberry pi|microcontroller|embedded|actuator|rfid|relay|automation|smart device|monitoring system|ultrasonic|wifi module|esp|nodemcu|smart irrigation|temperature sensor|motion detector|environmental monitoring|wireless|prototype|micro controller|solar panel)\y' THEN
      themes_array := array_append(themes_array, 'IoT & Automation');
    END IF;
    
    -- Geographic Information Systems
    IF LOWER(NEW.title) ~* '\y(gis|geographic|geospatial|mapping|map|location tracking|coordinate|spatial|satellite|gps|terrain|route|boundary|navigation|cluster mapping|geolocation|kalasan)\y' THEN
      themes_array := array_append(themes_array, 'Geographic Information Systems');
    END IF;
    
    -- Agriculture & Smart Farming
    IF LOWER(NEW.title) ~* '\y(agriculture|farm|farming|crop|harvest|soil|irrigation|rice|livestock|fertilizer|plant monitoring|greenhouse|agricultural|smart farm)\y' THEN
      themes_array := array_append(themes_array, 'Agriculture & Smart Farming');
    END IF;
    
    -- Healthcare & Medical Systems
    IF LOWER(NEW.title) ~* '\y(health|medical|clinic|patient|doctor|hospital|medicine|appointment|prescription|consultation|mental health|counseling|health record|patient management|telehealth|nurse|treatment|e-health|nbsc)\y' THEN
      themes_array := array_append(themes_array, 'Healthcare & Medical Systems');
    END IF;
    
    -- Document & Records Management
    IF LOWER(NEW.title) ~* '\y(document|records?|record management|archiving|file management|tracking system|barcode|qr code|digital file|document retrieval|registry|indexing|file tracking|digital archive|recordata|filing)\y' THEN
      themes_array := array_append(themes_array, 'Document & Records Management');
    END IF;
    
    -- Security & Access Control
    IF LOWER(NEW.title) ~* '\y(security|access control|fingerprint|biometric|authentication|lock|facial recognition|encryption|secure|aes|advanced encryption|data security|door security|violation)\y' THEN
      themes_array := array_append(themes_array, 'Security & Access Control');
    END IF;
    
    -- Student Services & Administration
    IF LOWER(NEW.title) ~* '\y(student|guidance|discipline|enrollment|grade|attendance|sis|student information|learning management|adviser|class record|faculty evaluation|student portal|academic|student violation|e-pass|personnel)\y' THEN
      themes_array := array_append(themes_array, 'Student Services & Administration');
    END IF;
    
    -- Government & Public Services
    IF LOWER(NEW.title) ~* '\y(government|barangay|municipal|city hall|fire department|fire protection|public service|social welfare|lgu|resident|permit|citizen portal|community service|civil registry|ordinance|mswd|bureau)\y' THEN
      themes_array := array_append(themes_array, 'Government & Public Services');
    END IF;
    
    -- Business & E-Commerce
    IF LOWER(NEW.title) ~* '\y(inventory|supply chain|pos|point of sale|sales|billing|e-commerce|retail|logistics|warehouse|shop|order management|customer management|financial|product catalog|invoice|store|business management|stock)\y' THEN
      themes_array := array_append(themes_array, 'Business & E-Commerce');
    END IF;
    
    -- Data Analytics & Intelligence
    IF LOWER(NEW.title) ~* '\y(analytics|data analytics|big data|business intelligence|dashboard|predictive|data visualization|data mining|report generation|statistics|trend analysis|machine learning|insight|decision support|andam|visualization)\y' THEN
      themes_array := array_append(themes_array, 'Data Analytics & Intelligence');
    END IF;
    
    -- Education & E-Learning
    IF LOWER(NEW.title) ~* '\y(education|e-learning|learning tool|tutorial|quiz|educational|learning system|academic performance|school learning|course|training)\y' THEN
      themes_array := array_append(themes_array, 'Education & E-Learning');
    END IF;
    
    -- Tourism & Entertainment
    IF LOWER(NEW.title) ~* '\y(tourism|travel|booking|destination|hotel|resort|tour guide|virtual tour|entertainment|event|music|video|festival|cultural|visitor|tourist|vr|ar|virtual reality|augmented reality|dahilayan)\y' THEN
      themes_array := array_append(themes_array, 'Tourism & Entertainment');
    END IF;
    
    -- ★ NEW: Cross-Platform Application
    IF LOWER(NEW.title) ~* '\y(cross-platform|cross platform|web|android|ios|react native|flutter|xamarin|ionic|cordova|phonegap|nativescript|react|vue\.?js|angular|node\.?js|responsive design|responsive web|mobile-first|mobile first|progressive web app|pwa|multi-platform|multiplatform)\y' THEN
      themes_array := array_append(themes_array, 'Cross-Platform Application');
    END IF;
    
    -- Web-Based Information Systems
    IF LOWER(NEW.title) ~* '\y(web-based|website|online platform|responsive web|information system|portal|management system|web application|kanban|counseling|e-giyata|probe)\y' THEN
      themes_array := array_append(themes_array, 'Web-Based Information Systems');
    END IF;
    
    -- Community & Social Services
    IF LOWER(NEW.title) ~* '\y(livelihood|employment|alumni|community mapping|social services|community|profiling|household|adoption|pet|animal|pawster)\y' THEN
      themes_array := array_append(themes_array, 'Community & Social Services');
    END IF;
    
    -- Set default if no themes matched
    IF array_length(themes_array, 1) IS NULL OR array_length(themes_array, 1) = 0 THEN
      themes_array := ARRAY['Web-Based Information Systems'];
    END IF;
    
    -- Perform a separate UPDATE to set ONLY the theme columns
    UPDATE abstracts
    SET 
      research_themes = themes_array,
      research_theme = themes_array[1]
    WHERE id = NEW.id;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the research themes trigger
DROP TRIGGER IF EXISTS auto_assign_themes_trigger ON abstracts;
CREATE TRIGGER auto_assign_themes_trigger
  AFTER INSERT OR UPDATE OF status ON abstracts
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_research_themes();

-- ================================================================
-- PART 2: UPDATE EMERGING TECHNOLOGIES TRIGGER
-- ================================================================

CREATE OR REPLACE FUNCTION auto_assign_emerging_technologies()
RETURNS TRIGGER AS $$
DECLARE
  tech_array TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Only process when status changes to 'approved' and title exists
  IF NEW.status = 'approved' AND NEW.title IS NOT NULL AND (OLD IS NULL OR OLD.status IS NULL OR OLD.status != 'approved') THEN
    
    -- Category 1: Web Technologies
    IF LOWER(NEW.title) ~* '\y(web-based|website|web system|php|javascript|js|html|css|frontend|backend|node\.js|node|web development|responsive web|web application|online platform|portal)\y' THEN
      tech_array := array_append(tech_array, 'Web Technologies');
    END IF;
    
    -- Category 2: IoT & Hardware
    IF LOWER(NEW.title) ~* '\y(iot|internet of things|sensor|arduino|microcontroller|wifi|esp32|esp8266|raspberry pi|hardware|automation|smart device|embedded|actuator|rfid module|relay|ultrasonic|nodemcu)\y' THEN
      tech_array := array_append(tech_array, 'IoT & Hardware');
    END IF;
    
    -- Category 3: Data & Analytics
    IF LOWER(NEW.title) ~* '\y(data analytics|data visualization|dashboard|report|database|mysql|sql|data mining|query|storage|predictive analysis|business intelligence|big data|analytics|statistics)\y' THEN
      tech_array := array_append(tech_array, 'Data & Analytics');
    END IF;
    
    -- Category 4: Security & Authentication
    IF LOWER(NEW.title) ~* '\y(authentication|encrypt|encryption|biometric|fingerprint|secure|security|access control|data security|login|authorization|aes|password|otp)\y' THEN
      tech_array := array_append(tech_array, 'Security & Authentication');
    END IF;
    
    -- Category 5: Identification & Tracking
    IF LOWER(NEW.title) ~* '\y(qr code|rfid|radio frequency|facial recognition|face detection|barcode|tracking|document access|location tracking|gps|geolocation)\y' THEN
      tech_array := array_append(tech_array, 'Identification & Tracking');
    END IF;
    
    -- Category 6: Mobile Technologies
    IF LOWER(NEW.title) ~* '\y(mobile|android|mobile application|ios|apk|mobile system|smartphone|app development)\y' THEN
      tech_array := array_append(tech_array, 'Mobile Technologies');
    END IF;
    
    -- Category 7: Frameworks & Programming
    IF LOWER(NEW.title) ~* '\y(agile|vb\.net|dotnet|java|framework|programming|software development|scrum|dev process|python|c\+\+|typescript)\y' THEN
      tech_array := array_append(tech_array, 'Frameworks & Programming');
    END IF;
    
    -- Category 8: Immersive Technologies
    IF LOWER(NEW.title) ~* '\y(virtual reality|vr|vr headset|augmented reality|ar|simulation|3d|immersive|game|metaverse)\y' THEN
      tech_array := array_append(tech_array, 'Immersive Technologies');
    END IF;
    
    -- Category 9: Cloud & Backend Services
    IF LOWER(NEW.title) ~* '\y(firebase|cloud|backend|server|database hosting|authentication service|storage|realtime database|aws|azure|api|rest)\y' THEN
      tech_array := array_append(tech_array, 'Cloud & Backend Services');
    END IF;
    
    -- Category 10: Machine Learning & AI
    IF LOWER(NEW.title) ~* '\y(machine learning|artificial intelligence|ai|neural network|deep learning|computer vision|natural language|nlp|prediction|classification|model training)\y' THEN
      tech_array := array_append(tech_array, 'Machine Learning & AI');
    END IF;
    
    -- Category 11: Geographic Information Systems
    IF LOWER(NEW.title) ~* '\y(gis|geographic information|geospatial|mapping|map|coordinate|spatial|satellite|terrain|route|navigation)\y' THEN
      tech_array := array_append(tech_array, 'Geographic Information Systems');
    END IF;
    
    -- ★ Category 12: Cross-Platform Application (NEW)
    IF LOWER(NEW.title) ~* '\y(cross-platform|cross platform|react native|flutter|xamarin|ionic|cordova|phonegap|nativescript|react|vue\.?js|angular|responsive design|mobile-first|mobile first|progressive web app|pwa|multi-platform|multiplatform)\y' THEN
      tech_array := array_append(tech_array, 'Cross-Platform Application');
    END IF;
    
    -- Set default if no technologies matched
    IF array_length(tech_array, 1) IS NULL OR array_length(tech_array, 1) = 0 THEN
      tech_array := ARRAY['Web Technologies'];
    END IF;
    
    -- Perform a separate UPDATE to set ONLY the emerging_technologies field
    UPDATE abstracts
    SET emerging_technologies = tech_array
    WHERE id = NEW.id;
    
    RAISE NOTICE 'Assigned technologies to abstract %: %', NEW.id, tech_array;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Recreate the emerging technologies trigger
DROP TRIGGER IF EXISTS trigger_auto_assign_emerging_tech ON abstracts;
CREATE TRIGGER trigger_auto_assign_emerging_tech
  AFTER UPDATE ON abstracts
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_emerging_technologies();

-- ================================================================
-- PART 3: UPDATE EXISTING APPROVED ABSTRACTS
-- ================================================================

-- Add Cross-Platform Application theme to existing abstracts
UPDATE abstracts
SET 
  research_themes = array_append(COALESCE(research_themes, ARRAY[]::TEXT[]), 'Cross-Platform Application'),
  research_theme = COALESCE(research_theme, 'Cross-Platform Application')
WHERE 
  status = 'approved'
  AND LOWER(title) ~* '\y(cross-platform|cross platform|web|android|ios|react native|flutter|xamarin|ionic|cordova|phonegap|nativescript|react|vue\.?js|angular|node\.?js|responsive design|responsive web|mobile-first|mobile first|progressive web app|pwa|multi-platform|multiplatform)\y'
  AND NOT ('Cross-Platform Application' = ANY(COALESCE(research_themes, ARRAY[]::TEXT[])));

-- Add Cross-Platform Application to emerging technologies for existing abstracts
UPDATE abstracts
SET emerging_technologies = array_append(COALESCE(emerging_technologies, ARRAY[]::TEXT[]), 'Cross-Platform Application')
WHERE 
  status = 'approved'
  AND LOWER(title) ~* '\y(cross-platform|cross platform|react native|flutter|xamarin|ionic|cordova|phonegap|nativescript|react|vue\.?js|angular|responsive design|mobile-first|mobile first|progressive web app|pwa|multi-platform|multiplatform)\y'
  AND NOT ('Cross-Platform Application' = ANY(COALESCE(emerging_technologies, ARRAY[]::TEXT[])));

-- ================================================================
-- PART 4: VERIFICATION AND SUCCESS MESSAGE
-- ================================================================

-- Show results
SELECT 
  '✅ Cross-Platform Application category added successfully!' as status,
  (SELECT COUNT(*) FROM abstracts WHERE 'Cross-Platform Application' = ANY(research_themes)) as theme_count,
  (SELECT COUNT(*) FROM abstracts WHERE 'Cross-Platform Application' = ANY(emerging_technologies)) as tech_count,
  (SELECT COUNT(*) FROM abstracts WHERE status = 'approved') as total_approved;

-- Show sample abstracts that were classified
SELECT 
  title,
  research_themes,
  emerging_technologies
FROM abstracts
WHERE 'Cross-Platform Application' = ANY(research_themes)
   OR 'Cross-Platform Application' = ANY(emerging_technologies)
LIMIT 10;
