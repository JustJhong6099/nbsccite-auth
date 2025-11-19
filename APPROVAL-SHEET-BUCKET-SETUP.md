# Fix: "Bucket not found" Error for Approval Sheets

## Problem
When clicking "View" or "Download" buttons for approval sheets, you get:
```json
{"statusCode":"404","error":"Bucket not found","message":"Bucket not found"}
```

## Root Cause
The error occurs because:
1. ❌ The storage bucket `approval-sheets` doesn't exist, OR
2. ❌ Storage policies are not properly configured, OR  
3. ❌ The bucket is public but should be private (fixed in latest code)

## Solution Overview
✅ **Fixed in Code**: Now using **signed URLs** for private bucket access (more secure)  
⚠️ **Manual Setup Required**: Create bucket + apply storage policies

### What Changed (Latest Fix)
**Previous version** tried to use public URLs from a private bucket → ❌ Failed  
**Current version** generates signed URLs on-demand → ✅ Works securely

**Technical Details:**
- 🔐 Bucket is **private** (not public) for security
- 🔑 Signed URLs are generated when faculty views/downloads (valid for 1 hour)
- 📁 Database stores **file paths** (e.g., `user_id/abstract_id/approval_sheet.jpg`)
- 🚀 URLs generated dynamically using `storage.createSignedUrl()`

---

## Setup Steps

### Method 1: Via Supabase Dashboard (Recommended)

1. **Login to Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Navigate to Storage**
   - Click on **Storage** in the left sidebar
   - Click on **Buckets** tab

3. **Create New Bucket**
   - Click **"New bucket"** or **"Create a new bucket"** button
   - Fill in the form:
     ```
     Name: approval-sheets
     Public: ☐ (Leave unchecked - keep it private)
     File size limit: 5242880 (5MB in bytes)
     Allowed MIME types: image/jpeg,image/jpg,image/png,image/webp,application/pdf
     ```
   - Click **"Create bucket"**

4. **Verify Creation**
   - You should see `approval-sheets` in your buckets list
   - The bucket should show as "Private"

---

### Method 2: Via SQL (Alternative)

If you prefer SQL, run this in your **Supabase SQL Editor**:

```sql
-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'approval-sheets', 
  'approval-sheets', 
  false,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
);
```

---

## Apply Storage Policies

The storage policies should already be created if you ran the `approval-sheet-schema.sql` file.

If not, run this in your **Supabase SQL Editor**:

```sql
-- Storage policies for approval sheets bucket
CREATE POLICY "Students can upload own approval sheets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'approval-sheets' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Students can view own approval sheets"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'approval-sheets' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Faculty can view all approval sheets"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'approval-sheets' AND
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'faculty'
    )
);

CREATE POLICY "Students can update own approval sheets"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'approval-sheets' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Students can delete own approval sheets"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'approval-sheets' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Faculty can delete all approval sheets"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'approval-sheets' AND
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'faculty'
    )
);
```

---

## Verification

### Step 1: Run Setup Verification
Run this SQL in **Supabase SQL Editor**:
```sql
-- Check bucket exists and is configured correctly
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
WHERE name = 'approval-sheets';
```

**Expected Result:**
```
id: approval-sheets
name: approval-sheets
public: false ✅ (MUST be false for security)
file_size_limit: 5242880 (5MB)
allowed_mime_types: array of image/pdf types
```

### Step 2: Check Storage Policies
```sql
SELECT policyname
FROM pg_policies
WHERE tablename = 'objects'
AND schemaname = 'storage'
AND policyname LIKE '%approval%';
```

**Expected: 6 policies** (upload, view, update, delete for students + view/delete for faculty)

### Step 3: Test Upload (Student)
1. Login as **student** (email starts with numbers)
2. Go to **Abstract Submission**
3. Fill form and upload an approval sheet image
4. Click **Submit**
5. ✅ Should show "Approval sheet uploaded successfully!"
6. ✅ No errors in browser console

### Step 4: Test View (Faculty)
1. Login as **faculty** (email starts with letters)
2. Go to **Faculty Dashboard** → **Student Reviews**
3. Click on a submission with an approval sheet
4. ✅ Should see approval sheet section with preview
5. Click **"View"** button
6. ✅ Should open image in new tab with signed URL
7. ✅ URL should look like: `https://...supabase.co/storage/v1/object/sign/approval-sheets/...?token=...`

### Step 5: Test Download (Faculty)
1. Click **"Download"** button
2. ✅ File should download with correct name

---

## Common Issues & Solutions

### ❌ Issue: Still getting "Bucket not found" after creating bucket
**Solutions:**
1. Verify bucket name is **exactly** `approval-sheets` (with hyphen, no spaces)
2. Refresh your browser and clear cache (Ctrl+Shift+R)
3. Check Supabase project is connected correctly
4. Run verification SQL: `SELECT * FROM storage.buckets WHERE name = 'approval-sheets';`

### ❌ Issue: "Permission denied" or RLS policy errors
**Solutions:**
1. Make sure you ran the **full** `approval-sheet-schema.sql` file
2. Verify storage policies exist:
   ```sql
   SELECT COUNT(*) FROM pg_policies 
   WHERE tablename = 'objects' 
   AND schemaname = 'storage' 
   AND policyname LIKE '%approval%';
   ```
   Should return: `6`
3. Check your user has correct role in `profiles` table

### ❌ Issue: Upload works but view/download shows broken image
**Solutions:**
1. **Old data issue**: If you uploaded files BEFORE this fix, run:
   ```sql
   -- Run fix-approval-sheet-urls.sql
   UPDATE approval_sheets
   SET storage_url = file_path
   WHERE storage_url LIKE 'http%';
   ```
2. **Check signed URL generation**: Open browser console and look for errors
3. **Verify file exists** in Storage → approval-sheets bucket

### ❌ Issue: "getPublicUrl" error in console
**Solution:** This is expected! The bucket is now **private** (more secure). We use **signed URLs** instead.

### ❌ Issue: Image preview not showing but download works
**Solutions:**
1. Check file type is supported: JPG, JPEG, PNG, WebP
2. Look for CORS errors in browser console
3. Verify signed URL is generated (check Network tab)

### ❌ Issue: Student can see other students' approval sheets
**Solution:** 
- **SECURITY ISSUE!** Check RLS policies are applied correctly
- Run: `approval-sheet-schema.sql` lines 60-150 (storage policies)
- Verify student role is set correctly in profiles table

---

## File Structure in Storage

Files are organized as:
```
approval-sheets/
├── {student_user_id_1}/
│   ├── {abstract_id_1}/
│   │   └── approval_sheet.jpg
│   └── {abstract_id_2}/
│       └── approval_sheet.pdf
└── {student_user_id_2}/
    └── {abstract_id_3}/
        └── approval_sheet.png
```

---

## Security

- ✅ Bucket is **private** (not public)
- ✅ Students can only upload/view their own files
- ✅ Faculty can view/delete all approval sheets
- ✅ Maximum file size: 5MB
- ✅ Allowed types: JPG, PNG, WebP, PDF

---

## Need Help?

If you continue to have issues:
1. Check Supabase logs in Dashboard
2. Verify bucket name is exactly `approval-sheets`
3. Ensure you ran the full `approval-sheet-schema.sql` file
4. Check browser console for detailed error messages
