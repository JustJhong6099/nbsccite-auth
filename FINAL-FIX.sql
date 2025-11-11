-- ================================================================
-- COMPLETE CLEANUP AND FIX
-- This will remove ALL old triggers and functions, then create fresh ones
-- ================================================================

-- Step 1: Drop ALL triggers on abstracts table (no matter what they're called)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tgname 
        FROM pg_trigger 
        WHERE tgrelid = 'abstracts'::regclass 
          AND tgname NOT LIKE 'RI_%' 
          AND tgname NOT LIKE 'pg_%'
    ) LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || r.tgname || ' ON abstracts CASCADE';
        RAISE NOTICE 'Dropped trigger: %', r.tgname;
    END LOOP;
END $$;

-- Step 2: Drop ALL functions related to themes/research
DROP FUNCTION IF EXISTS auto_assign_research_themes() CASCADE;
DROP FUNCTION IF EXISTS classify_abstract_themes() CASCADE;
DROP FUNCTION IF EXISTS classify_research_theme() CASCADE;
DROP FUNCTION IF EXISTS auto_classify_theme() CASCADE;

-- Step 3: Verify columns exist (should already be there from improved-theme-assignment.sql)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'abstracts' AND column_name = 'research_theme'
  ) THEN
    ALTER TABLE abstracts ADD COLUMN research_theme TEXT;
    RAISE NOTICE 'Added research_theme column';
  ELSE
    RAISE NOTICE 'research_theme column already exists';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'abstracts' AND column_name = 'research_themes'
  ) THEN
    ALTER TABLE abstracts ADD COLUMN research_themes TEXT[];
    RAISE NOTICE 'Added research_themes column';
  ELSE
    RAISE NOTICE 'research_themes column already exists';
  END IF;
END $$;

-- Step 4: Create the CORRECT function (AFTER trigger, separate UPDATE)
CREATE OR REPLACE FUNCTION auto_assign_research_themes()
RETURNS TRIGGER AS $$
DECLARE
  themes_array TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Only process when status changes to 'approved' and title exists
  IF NEW.status = 'approved' AND NEW.title IS NOT NULL AND (OLD IS NULL OR OLD.status IS NULL OR OLD.status != 'approved') THEN
    
    -- IoT & Automation (check FIRST - most specific)
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
    
    -- Web-Based Information Systems (check LAST - most generic)
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
    
    -- CRITICAL: Use a separate UPDATE statement
    -- This completely isolates the theme assignment from the approval UPDATE
    -- Prevents any interaction with other columns or constraints
    UPDATE abstracts
    SET 
      research_themes = themes_array,
      research_theme = themes_array[1]
    WHERE id = NEW.id;
    
    RAISE NOTICE 'Assigned themes to abstract %: %', NEW.id, themes_array;
  END IF;
  
  -- Return NULL for AFTER trigger (return value is ignored anyway)
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create AFTER trigger (runs AFTER the approval UPDATE completes)
CREATE TRIGGER trigger_auto_assign_themes
  AFTER UPDATE ON abstracts
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_research_themes();

-- Success!
SELECT '✅ All triggers and functions cleaned up and recreated successfully!' as status;
