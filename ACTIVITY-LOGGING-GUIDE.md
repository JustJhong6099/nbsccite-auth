# Activity Logging System

## Overview
The Activity Logging system tracks all faculty actions on abstracts for audit trail and accountability purposes.

## Database Setup

### Step 1: Create Activity Logs Table
Run the SQL migration file in your Supabase SQL Editor:
```bash
/workspaces/nbsccite-auth/create-activity-logs.sql
```

This will create:
- `activity_logs` table with proper indexes
- RLS policies (faculty can view all logs, students see their own)
- Automatic trigger for abstract status changes
- Formatted view for easy querying

## Features

### Activity Log Tab
Located in **Faculty Dashboard → System Monitoring → Activity Log**

**Displays:**
- Faculty name and email
- Action performed (Approve, Reject, Edit, Delete, Publish)
- Paper title
- Status changes (e.g., "pending → approved")
- Timestamp
- IP address (optional)

**Filters:**
- Search by faculty name, email, paper title, or action
- Filter by action type (All, Approved, Rejected, Edited, Deleted, Published)
- Refresh button for real-time updates
- Export functionality (future enhancement)

**Summary Statistics:**
- Total actions count
- Number of approvals
- Number of rejections
- Active faculty count

## Usage in Code

### Automatic Logging
The database trigger automatically logs:
- Abstract status changes (pending → approved/rejected)
- Abstract updates
- Abstract deletions

### Manual Logging
Use the activity logger utility for explicit logging:

```typescript
import { 
  logAbstractApproval,
  logAbstractRejection,
  logAbstractEdit,
  logAbstractDeletion,
  logAbstractPublication
} from '@/lib/activity-logger';

// When approving an abstract
await logAbstractApproval(abstract.id, abstract.title);

// When rejecting an abstract
await logAbstractRejection(abstract.id, abstract.title, 'Reason for rejection');

// When editing an abstract
await logAbstractEdit(abstract.id, abstract.title, ['title', 'keywords']);

// When deleting an abstract
await logAbstractDeletion(abstract.id, abstract.title, 'approved');

// When faculty publishes their own abstract
await logAbstractPublication(abstract.id, abstract.title);
```

### Custom Activity Logging
For custom actions:

```typescript
import { logActivity } from '@/lib/activity-logger';

await logActivity({
  action: 'custom_action',
  targetType: 'abstract',
  targetId: 'abstract-id',
  targetTitle: 'Paper Title',
  details: {
    custom_field: 'value',
    old_value: 'before',
    new_value: 'after'
  }
});
```

## Integration Points

### AbstractManagement Component
Add logging when faculty:
- Approve abstracts
- Reject abstracts
- Edit abstract details
- Delete abstracts

Example integration:
```typescript
const handleApprove = async (abstractId: string, title: string) => {
  // Approve logic
  const { error } = await supabase
    .from('abstracts')
    .update({ status: 'approved' })
    .eq('id', abstractId);
  
  if (!error) {
    // Log the action
    await logAbstractApproval(abstractId, title);
    toast.success('Abstract approved and logged');
  }
};
```

### FacultyAbstractSubmission Component
Add logging when faculty publish their own research:
```typescript
const handlePublish = async (formData) => {
  // Publish logic
  const { data, error } = await supabase
    .from('abstracts')
    .insert({ ...formData, status: 'approved' })
    .select()
    .single();
  
  if (!error && data) {
    // Log the publication
    await logAbstractPublication(data.id, data.title);
  }
};
```

## Data Structure

### Activity Log Record
```typescript
{
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  user_role: string;
  action: 'approve' | 'reject' | 'edit' | 'delete' | 'publish';
  action_type: 'abstract_management';
  target_type: 'abstract';
  target_id: string;
  target_title: string;
  details: {
    old_status?: string;
    new_status?: string;
    fields_changed?: string[];
    reason?: string;
    [key: string]: any;
  };
  ip_address?: string;
  created_at: string;
}
```

## Security & Privacy

### Row Level Security (RLS)
- **Faculty**: Can view all activity logs
- **Students**: Can only view their own related logs
- **Insert**: Only service role can insert (backend/triggers)

### Audit Trail
- Immutable once created
- No delete permissions (audit integrity)
- Automatic timestamps
- User tracking via auth.uid()

## Future Enhancements

1. **Export Functionality**
   - CSV export of filtered logs
   - PDF reports for specific date ranges

2. **IP Address Tracking**
   - Capture client IP for security
   - Geo-location mapping

3. **User Agent Tracking**
   - Browser/device information
   - Security analysis

4. **Email Notifications**
   - Notify faculty of significant actions
   - Weekly activity summaries

5. **Advanced Filtering**
   - Date range selection
   - Faculty-specific views
   - Paper-specific history

## Troubleshooting

### Logs Not Appearing
1. Verify table exists: `SELECT * FROM activity_logs LIMIT 1;`
2. Check RLS policies are enabled
3. Ensure user is faculty role
4. Check browser console for errors

### Permission Errors
1. Verify RLS policies in Supabase dashboard
2. Check user authentication status
3. Confirm faculty role assignment

### Trigger Not Firing
1. Check trigger exists: `\df log_abstract_activity`
2. Verify trigger is attached to abstracts table
3. Test with manual UPDATE query

## Testing

### Test Activity Logging
```sql
-- View recent logs
SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 10;

-- View logs by specific faculty
SELECT * FROM activity_logs WHERE user_email = 'faculty@nbsc.edu.ph';

-- View logs for specific abstract
SELECT * FROM activity_logs WHERE target_id = 'abstract-id';

-- Count actions by type
SELECT action, COUNT(*) FROM activity_logs GROUP BY action;
```

## Support
For issues or questions, contact the development team.
