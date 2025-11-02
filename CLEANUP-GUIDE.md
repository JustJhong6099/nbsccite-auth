# Cleanup Guide: Remove Temporary Extracted Entities

## 🎯 Purpose
Remove extracted entities from abstracts that were created before the temporary storage implementation. These are likely from:
- Testing entity extraction
- Cancelled submissions
- Abandoned drafts

## 📋 Prerequisites
- Access to Supabase Dashboard
- SQL Editor access in your project

## 🚀 Quick Start

### Step 1: Open Supabase SQL Editor
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `nbsccite-auth`
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Inspect Current Data

Run this query first to see what you have:

```sql
-- Check what will be affected
SELECT 
  status,
  COUNT(*) as total_abstracts,
  COUNT(CASE WHEN extracted_entities IS NOT NULL THEN 1 END) as with_entities
FROM abstracts
GROUP BY status
ORDER BY status;
```

### Step 3: Preview the Cleanup

See exactly what will be cleared:

```sql
-- Preview: Show abstracts that will be cleared
SELECT 
  id,
  title,
  status,
  created_at,
  submitted_by,
  (extracted_entities IS NOT NULL) as has_entities
FROM abstracts
WHERE extracted_entities IS NOT NULL
  AND status != 'approved'
ORDER BY created_at DESC;
```

### Step 4: Choose Your Cleanup Strategy

#### 🟢 **RECOMMENDED: Keep Approved Only**
Clears entities from pending/rejected abstracts, keeps published research:

```sql
-- Clear entities from non-approved abstracts
UPDATE abstracts 
SET extracted_entities = NULL
WHERE extracted_entities IS NOT NULL
  AND status != 'approved';
```

#### 🟡 **Conservative: Rejected Only**
Only clear definitely-abandoned abstracts:

```sql
-- Clear entities only from rejected abstracts
UPDATE abstracts 
SET extracted_entities = NULL
WHERE extracted_entities IS NOT NULL
  AND status = 'rejected';
```

#### 🔴 **Aggressive: Clear All**
Start fresh - all users will re-extract with new rules:

```sql
-- Clear ALL extracted entities
UPDATE abstracts 
SET extracted_entities = NULL
WHERE extracted_entities IS NOT NULL;
```

### Step 5: Verify the Cleanup

After running your chosen cleanup, verify the results:

```sql
-- Verify cleanup results
SELECT 
  status,
  COUNT(*) as total,
  COUNT(CASE WHEN extracted_entities IS NOT NULL THEN 1 END) as with_entities,
  COUNT(CASE WHEN extracted_entities IS NULL THEN 1 END) as without_entities
FROM abstracts
GROUP BY status;
```

## 📊 Expected Results

### Before Cleanup:
- **Pending abstracts**: May have entities (from testing/abandoned submissions)
- **Rejected abstracts**: May have entities (from rejected submissions)
- **Approved abstracts**: Have entities (from published research)

### After Cleanup (Recommended):
- **Pending abstracts**: No entities (cleared)
- **Rejected abstracts**: No entities (cleared)
- **Approved abstracts**: Still have entities (preserved)

## ✅ Benefits

1. **Database cleanliness**: Removes test/abandoned extraction data
2. **Analytics accuracy**: Research Insights only shows valid research
3. **Fresh start**: Users can re-extract with new classification rules
4. **No duplicates**: New extractions will use improved entity mappings

## 🔄 What Happens Next?

After cleanup:
- Users can extract entities normally
- New temporary storage system keeps entities in memory only
- Entities only save to database on actual submission/publish
- No more abandoned extractions cluttering your database

## 🆘 Troubleshooting

### "No rows affected"
- Good! This means no temporary entities to clean up
- Your database is already clean

### "Want to undo the cleanup"
- If you cleared approved abstracts by mistake, users can re-extract them
- The extraction process is non-destructive and can be re-run anytime

### "Research Insights looks empty"
- This is expected if you cleared all entities
- Faculty can re-publish abstracts to regenerate entities
- New classifications will be more accurate

## 📝 Notes

- This cleanup is **one-time only** before implementing temporary storage
- After this, the new system prevents abandoned extractions automatically
- Approved abstracts contain valuable research data - preserve them if possible
- The `cleanup-temporary-entities.sql` file contains more detailed options

## 🎉 You're Done!

Once cleanup is complete, your database is ready for the new temporary storage system. All future entity extractions will be properly managed!
