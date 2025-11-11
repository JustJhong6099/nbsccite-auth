-- ================================================================
-- UPDATE EMERGING TECHNOLOGIES WITH CROSS-PLATFORM APPLICATION
-- Adds Cross-Platform Application to emerging technologies categorization
-- ================================================================

-- Update auto-assign emerging technologies function
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
    
    -- Category 12: Cross-Platform Application (NEW)
    IF LOWER(NEW.title) ~* '\y(cross-platform|cross platform|react native|flutter|xamarin|ionic|cordova|phonegap|nativescript|react|vue\.?js|angular|responsive design|mobile-first|mobile first|progressive web app|pwa|multi-platform|multiplatform)\y' THEN
      tech_array := array_append(tech_array, 'Cross-Platform Application');
    END IF;
    
    -- Set default if no technologies matched (unlikely for IT research)
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

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_auto_assign_emerging_tech ON abstracts;

-- Create AFTER trigger (runs after approval)
CREATE TRIGGER trigger_auto_assign_emerging_tech
  AFTER UPDATE ON abstracts
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_emerging_technologies();

-- Manually assign Cross-Platform Application to existing abstracts that match
UPDATE abstracts
SET emerging_technologies = array_append(COALESCE(emerging_technologies, ARRAY[]::TEXT[]), 'Cross-Platform Application')
WHERE 
  status = 'approved'
  AND LOWER(title) ~* '\y(cross-platform|cross platform|react native|flutter|xamarin|ionic|cordova|phonegap|nativescript|react|vue\.?js|angular|responsive design|mobile-first|mobile first|progressive web app|pwa|multi-platform|multiplatform)\y'
  AND NOT ('Cross-Platform Application' = ANY(emerging_technologies));

-- Success message
SELECT 
  'Cross-Platform Application added to emerging technologies!' as status,
  COUNT(*) as emerging_tech_abstracts_updated
FROM abstracts
WHERE 'Cross-Platform Application' = ANY(emerging_technologies);
