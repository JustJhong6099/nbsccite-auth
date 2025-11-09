-- ================================================================
-- INITIAL EMERGING TECHNOLOGIES ASSIGNMENT
-- Assigns validated technologies to existing approved abstracts
-- Run this ONCE after running emerging-tech-schema.sql
-- ================================================================

-- Assign technologies to all approved abstracts based on title keywords
UPDATE abstracts
SET emerging_technologies = ARRAY[]::TEXT[]
WHERE status = 'approved';

-- Web Technologies
UPDATE abstracts
SET emerging_technologies = array_append(emerging_technologies, 'Web Technologies')
WHERE status = 'approved'
  AND LOWER(title) ~* '\y(web-based|website|web system|php|javascript|js|html|css|frontend|backend|react|node\.js|node|web development|responsive web|web application|online platform|portal)\y';

-- IoT & Hardware
UPDATE abstracts
SET emerging_technologies = array_append(emerging_technologies, 'IoT & Hardware')
WHERE status = 'approved'
  AND LOWER(title) ~* '\y(iot|internet of things|sensor|arduino|microcontroller|wifi|esp32|esp8266|raspberry pi|hardware|automation|smart device|embedded|actuator|rfid module|relay|ultrasonic|nodemcu)\y';

-- Data & Analytics
UPDATE abstracts
SET emerging_technologies = array_append(emerging_technologies, 'Data & Analytics')
WHERE status = 'approved'
  AND LOWER(title) ~* '\y(data analytics|data visualization|dashboard|report|database|mysql|sql|data mining|query|storage|predictive analysis|business intelligence|big data|analytics|statistics)\y';

-- Security & Authentication
UPDATE abstracts
SET emerging_technologies = array_append(emerging_technologies, 'Security & Authentication')
WHERE status = 'approved'
  AND LOWER(title) ~* '\y(authentication|encrypt|encryption|biometric|fingerprint|secure|security|access control|data security|login|authorization|aes|password|otp)\y';

-- Identification & Tracking
UPDATE abstracts
SET emerging_technologies = array_append(emerging_technologies, 'Identification & Tracking')
WHERE status = 'approved'
  AND LOWER(title) ~* '\y(qr code|rfid|radio frequency|facial recognition|face detection|barcode|tracking|document access|location tracking|gps|geolocation)\y';

-- Mobile Technologies
UPDATE abstracts
SET emerging_technologies = array_append(emerging_technologies, 'Mobile Technologies')
WHERE status = 'approved'
  AND LOWER(title) ~* '\y(mobile|android|mobile application|ios|apk|react native|mobile system|smartphone|app development|cross platform)\y';

-- Frameworks & Programming
UPDATE abstracts
SET emerging_technologies = array_append(emerging_technologies, 'Frameworks & Programming')
WHERE status = 'approved'
  AND LOWER(title) ~* '\y(agile|vb\.net|dotnet|java|framework|programming|software development|scrum|dev process|python|c\+\+|typescript)\y';

-- Immersive Technologies
UPDATE abstracts
SET emerging_technologies = array_append(emerging_technologies, 'Immersive Technologies')
WHERE status = 'approved'
  AND LOWER(title) ~* '\y(virtual reality|vr|vr headset|augmented reality|ar|simulation|3d|immersive|game|metaverse)\y';

-- Cloud & Backend Services
UPDATE abstracts
SET emerging_technologies = array_append(emerging_technologies, 'Cloud & Backend Services')
WHERE status = 'approved'
  AND LOWER(title) ~* '\y(firebase|cloud|backend|server|database hosting|authentication service|storage|realtime database|aws|azure|api|rest)\y';

-- Machine Learning & AI
UPDATE abstracts
SET emerging_technologies = array_append(emerging_technologies, 'Machine Learning & AI')
WHERE status = 'approved'
  AND LOWER(title) ~* '\y(machine learning|artificial intelligence|ai|neural network|deep learning|computer vision|natural language|nlp|prediction|classification|model training)\y';

-- Geographic Information Systems
UPDATE abstracts
SET emerging_technologies = array_append(emerging_technologies, 'Geographic Information Systems')
WHERE status = 'approved'
  AND LOWER(title) ~* '\y(gis|geographic information|geospatial|mapping|map|coordinate|spatial|satellite|terrain|route|navigation)\y';

-- Set default for any abstracts with no technologies matched
UPDATE abstracts
SET emerging_technologies = ARRAY['Web Technologies']
WHERE status = 'approved'
  AND (emerging_technologies IS NULL OR array_length(emerging_technologies, 1) IS NULL OR array_length(emerging_technologies, 1) = 0);

-- Verification query - see distribution
SELECT 
  UNNEST(emerging_technologies) as technology,
  COUNT(*) as count
FROM abstracts
WHERE status = 'approved'
  AND emerging_technologies IS NOT NULL
GROUP BY technology
ORDER BY count DESC;

SELECT '✅ Initial emerging technologies assignment complete!' as status;
