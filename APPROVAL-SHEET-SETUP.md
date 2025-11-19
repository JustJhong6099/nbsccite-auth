# Approval Sheet Upload Feature

This feature allows students to upload approval sheet images for their research abstracts, providing validation and authenticity to their submissions.

## Database Schema

The approval sheet functionality requires a new database table and Supabase storage bucket.

### 1. Run the Schema Migration

Execute the SQL file to create the necessary database structure:

```bash
# In Supabase SQL Editor, run:
cat approval-sheet-schema.sql
```

Or run it directly in the Supabase Dashboard SQL Editor.

### 2. Create Storage Bucket

In your Supabase Dashboard:

1. Navigate to **Storage** → **Buckets**
2. Click **Create a new bucket**
3. Set the following:
   - **Name**: `approval-sheets`
   - **Public**: `false` (keep it private)
   - **File size limit**: 5MB
   - **Allowed MIME types**: `image/jpeg, image/jpg, image/png, image/webp, application/pdf`

The storage policies are already defined in the schema file and will be automatically applied.

## Features

### For Students:

1. **Upload Approval Sheet** (Optional)
   - Upload during abstract submission
   - Supports: JPG, PNG, WebP, PDF
   - Max file size: 5MB
   - Preview before submission
   - Can remove and re-upload before final submission

2. **File Validation**
   - Automatic file type validation
   - File size validation (max 5MB)
   - Real-time preview for images

3. **Secure Storage**
   - Files stored in private Supabase Storage bucket
   - Access controlled via Row Level Security (RLS)
   - Organized by user ID and abstract ID

### For Faculty:

1. **View Approval Sheets**
   - Access all submitted approval sheets
   - Verify authenticity of submissions
   - Mark sheets as verified/unverified
   - Add verification notes

2. **Management Actions**
   - Update verification status
   - Add verification notes
   - Delete invalid submissions

## Database Structure

### `approval_sheets` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `abstract_id` | UUID | References abstracts table |
| `student_id` | UUID | References auth.users |
| `file_name` | TEXT | Original filename |
| `file_path` | TEXT | Storage path |
| `file_size` | INTEGER | File size in bytes |
| `file_type` | TEXT | MIME type |
| `storage_url` | TEXT | Public URL |
| `uploaded_at` | TIMESTAMP | Upload timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |
| `is_verified` | BOOLEAN | Faculty verification status |
| `verified_by` | UUID | Faculty who verified |
| `verified_at` | TIMESTAMP | Verification timestamp |
| `verification_notes` | TEXT | Faculty notes |

### Unique Constraints

- One approval sheet per abstract (`unique_abstract_approval`)

## Security (Row Level Security)

### Students:
- ✅ Can view their own approval sheets
- ✅ Can insert their own approval sheets
- ✅ Can update their own unverified sheets
- ✅ Can delete their own unverified sheets
- ❌ Cannot modify verified sheets

### Faculty:
- ✅ Can view all approval sheets
- ✅ Can update all approval sheets (for verification)
- ✅ Can delete any approval sheet

## Usage Example

### Student Submitting Abstract:

```typescript
// 1. Fill in abstract form
// 2. Upload approval sheet (optional)
// 3. Preview abstract and entities
// 4. Submit

// The system automatically:
// - Saves abstract to database
// - Uploads approval sheet to storage
// - Creates approval_sheets record
// - Links them together
```

### Faculty Verification:

```sql
-- View unverified approval sheets
SELECT 
    a.title,
    a.authors,
    s.file_name,
    s.storage_url,
    s.uploaded_at
FROM approval_sheets s
JOIN abstracts a ON s.abstract_id = a.id
WHERE s.is_verified = false;

-- Mark as verified
UPDATE approval_sheets
SET 
    is_verified = true,
    verified_by = '{{faculty_user_id}}',
    verified_at = NOW(),
    verification_notes = 'Approval sheet verified and authentic'
WHERE id = '{{approval_sheet_id}}';
```

## File Organization

Files are stored with the following path structure:

```
approval-sheets/
├── {student_user_id}/
│   ├── {abstract_id_1}/
│   │   └── approval_sheet.jpg
│   ├── {abstract_id_2}/
│   │   └── approval_sheet.pdf
│   └── ...
```

## Benefits

1. **Authenticity Validation**: Provides proof of research approval
2. **Faster Review**: Faculty can quickly verify submissions
3. **Compliance**: Meets institutional requirements
4. **Security**: Private storage with access control
5. **Flexibility**: Optional feature, doesn't block submission

## API Integration

The feature integrates with:
- **Supabase Storage**: For file uploads
- **Supabase Database**: For metadata storage
- **Row Level Security**: For access control
- **React Context**: For user authentication

## Future Enhancements

Potential improvements:
- [ ] OCR extraction from approval sheets
- [ ] Digital signature verification
- [ ] Bulk approval sheet upload
- [ ] Email notifications on verification
- [ ] Approval sheet templates
- [ ] Version history tracking

## Troubleshooting

### Upload Fails

1. Check storage bucket exists: `approval-sheets`
2. Verify RLS policies are active
3. Check file size (must be < 5MB)
4. Verify file type is allowed
5. Ensure user is authenticated

### Cannot View Uploaded Sheet

1. Verify RLS policies allow access
2. Check user role in profiles table
3. Ensure file was uploaded successfully
4. Check storage URL is correct

### Storage Quota Issues

Monitor your Supabase storage quota in the Dashboard. Each project has storage limits based on the plan.

## Support

For issues or questions:
1. Check Supabase logs in Dashboard
2. Review browser console for errors
3. Verify database schema is correct
4. Check RLS policies are enabled
