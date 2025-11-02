# 🧹 Entity Cleanup Summary

## What's the Problem?

Before implementing the temporary storage system, extracted entities were saved to the database immediately - even if users cancelled or abandoned their submissions. This resulted in:

- ❌ Test extractions cluttering the database
- ❌ Abandoned drafts with entity data
- ❌ Cancelled submissions still in database
- ❌ Inaccurate research analytics

## Three Ways to Clean Up

### 🎯 Option 1: Supabase SQL Editor (Recommended - Easiest)

**Best for:** Quick cleanup without code

1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Go to SQL Editor
3. Run this query:

```sql
-- RECOMMENDED: Clear non-approved abstracts only
UPDATE abstracts 
SET extracted_entities = NULL
WHERE extracted_entities IS NOT NULL
  AND status != 'approved';
```

**Files to use:**
- `cleanup-temporary-entities.sql` - Full SQL script with all options
- `CLEANUP-GUIDE.md` - Step-by-step instructions

---

### 💻 Option 2: Browser Console (For Developers)

**Best for:** Interactive cleanup with logging

1. Open your app in browser (localhost or production)
2. Open Developer Console (F12)
3. The cleanup utilities are auto-loaded
4. Run commands:

```javascript
// See what you have
await cleanupEntities.inspect()

// Clear non-approved (recommended)
await cleanupEntities.clearTemporary()

// Verify results
await cleanupEntities.verify()
```

**Available commands:**
- `cleanupEntities.inspect()` - See current state
- `cleanupEntities.clearTemporary()` - Clear pending/rejected (recommended)
- `cleanupEntities.clearRejected()` - Clear rejected only (conservative)
- `cleanupEntities.clearAll()` - Clear everything (aggressive)
- `cleanupEntities.verify()` - Check results

**File to use:**
- `src/lib/cleanup-entities.ts` - Import this in your app

**How to enable:**
In `src/main.tsx` or `src/App.tsx`, add:
```typescript
import './lib/cleanup-entities';
```

---

### 🖥️ Option 3: CLI Script (For Backend/Scripts)

**Best for:** Automated cleanup or CI/CD

1. Set environment variables:
```bash
export VITE_SUPABASE_URL="your-url"
export VITE_SUPABASE_ANON_KEY="your-key"
```

2. Run the script:
```bash
# See what you have
npx tsx cleanup-script.ts inspect

# Clear non-approved (recommended)
npx tsx cleanup-script.ts clear

# Verify results
npx tsx cleanup-script.ts verify
```

**File to use:**
- `cleanup-script.ts` - Standalone TypeScript script

---

## 🎯 Which Cleanup Strategy?

### ✅ **Keep Approved Only** (RECOMMENDED)
```sql
WHERE status != 'approved'
```
- **Clears:** Pending, rejected abstracts
- **Keeps:** Published faculty research
- **Use when:** You want to preserve valid research data
- **Result:** Clean database, accurate analytics

### 🟡 **Rejected Only** (CONSERVATIVE)
```sql
WHERE status = 'rejected'
```
- **Clears:** Only rejected abstracts
- **Keeps:** Pending and approved
- **Use when:** You want minimal impact
- **Result:** Only obviously-abandoned data removed

### 🔴 **Clear All** (AGGRESSIVE)
```sql
WHERE extracted_entities IS NOT NULL
```
- **Clears:** Everything
- **Keeps:** Nothing
- **Use when:** You want fresh start with new classification rules
- **Result:** All users must re-extract entities

---

## 📊 What Gets Affected?

### By Status:

| Status    | Typical Count | Contains                    | Recommended Action |
|-----------|---------------|-----------------------------|--------------------|
| Pending   | 10-50         | Student submissions         | ✅ Clear           |
| Rejected  | 5-20          | Denied submissions          | ✅ Clear           |
| Approved  | 50-200        | Published faculty research  | ❌ Keep            |

### Example Numbers:

**Before Cleanup:**
```
Pending:  23 abstracts (15 with entities) ← Should be cleared
Rejected: 8 abstracts  (5 with entities)  ← Should be cleared
Approved: 127 abstracts (89 with entities) ← Keep these!
```

**After Cleanup (Recommended):**
```
Pending:  23 abstracts (0 with entities)  ← Cleared
Rejected: 8 abstracts  (0 with entities)  ← Cleared
Approved: 127 abstracts (89 with entities) ← Preserved ✓
```

---

## ✅ Verification Steps

### 1. Before Cleanup
```sql
SELECT 
  status,
  COUNT(*) as total,
  COUNT(CASE WHEN extracted_entities IS NOT NULL THEN 1 END) as with_entities
FROM abstracts
GROUP BY status;
```

### 2. After Cleanup
Run the same query - should see:
- Pending: 0 with entities
- Rejected: 0 with entities
- Approved: Same count (preserved)

---

## 🎉 What Happens Next?

After cleanup:

1. ✅ **Database is clean** - No temporary/abandoned data
2. ✅ **Analytics are accurate** - Research Insights shows only real research
3. ✅ **New system prevents this** - Future extractions are memory-only
4. ✅ **Users can re-extract** - Faculty can re-publish to regenerate entities
5. ✅ **Better classifications** - New extractions use improved entity mappings

---

## 🔧 Quick Reference

| Task                  | SQL Editor | Browser Console         | CLI Script           |
|-----------------------|------------|-------------------------|----------------------|
| Inspect               | Copy query | `cleanupEntities.inspect()` | `tsx cleanup-script.ts inspect` |
| Clear (recommended)   | Copy query | `cleanupEntities.clearTemporary()` | `tsx cleanup-script.ts clear` |
| Verify                | Copy query | `cleanupEntities.verify()` | `tsx cleanup-script.ts verify` |

---

## 💡 Pro Tips

1. **Always inspect first** - See what you're dealing with
2. **Test on a few records** - Use `LIMIT` in SQL if nervous
3. **Keep approved abstracts** - These are valuable research data
4. **Users can re-extract** - The process is non-destructive
5. **New system prevents this** - This is a one-time cleanup

---

## 🆘 Troubleshooting

**"No rows affected"**
- ✅ Good! Your database is already clean

**"Too many rows"**
- Check with `inspect` first
- Verify your WHERE clause
- Consider conservative approach first

**"Accidentally cleared approved"**
- Don't worry! Faculty can re-publish
- Entities will be re-extracted with better rules

**"Research Insights empty"**
- Expected if you cleared all
- Faculty can re-publish abstracts
- New data will use improved classifications

---

## 📝 Files Created

- ✅ `cleanup-temporary-entities.sql` - Detailed SQL script
- ✅ `CLEANUP-GUIDE.md` - Step-by-step guide
- ✅ `src/lib/cleanup-entities.ts` - Browser console utilities
- ✅ `cleanup-script.ts` - CLI script
- ✅ `CLEANUP-SUMMARY.md` - This file

Choose the method that works best for you and clean up that database! 🚀
