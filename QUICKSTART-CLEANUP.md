# 🚀 Quick Start: Clean Up Temporary Entities

## ⚡ Fastest Method (30 seconds)

### Using Supabase Dashboard:

1. Go to https://supabase.com/dashboard
2. Open your project → SQL Editor → New Query
3. Paste and run:

```sql
-- Preview what will be cleared
SELECT 
  status,
  COUNT(*) as total,
  COUNT(CASE WHEN extracted_entities IS NOT NULL THEN 1 END) as will_clear
FROM abstracts
WHERE extracted_entities IS NOT NULL
  AND status != 'approved'
GROUP BY status;
```

4. If you're happy with the preview, run:

```sql
-- Clear temporary entities
UPDATE abstracts 
SET extracted_entities = NULL
WHERE extracted_entities IS NOT NULL
  AND status != 'approved';
```

5. Verify:

```sql
-- Check results
SELECT 
  status,
  COUNT(*) as total,
  COUNT(CASE WHEN extracted_entities IS NOT NULL THEN 1 END) as still_has_entities
FROM abstracts
GROUP BY status;
```

## ✅ Done!

**What you just did:**
- ✅ Cleared entities from pending abstracts (student submissions not yet approved)
- ✅ Cleared entities from rejected abstracts (denied submissions)
- ✅ Kept entities in approved abstracts (published faculty research)

**What happens next:**
- New extractions will be memory-only (temporary storage system)
- Entities only save when abstracts are actually submitted/published
- No more abandoned extractions cluttering your database

---

## 📚 Need More Options?

Check these files for detailed guides:

- **`CLEANUP-SUMMARY.md`** - Overview of all 3 cleanup methods
- **`CLEANUP-GUIDE.md`** - Step-by-step walkthrough
- **`cleanup-temporary-entities.sql`** - All SQL options with comments
- **`src/lib/cleanup-entities.ts`** - Browser console utilities
- **`cleanup-script.ts`** - CLI script for automation

---

## 🎯 Remember

This is a **one-time cleanup** for historical data. The new temporary storage system (already implemented) prevents this problem going forward!
