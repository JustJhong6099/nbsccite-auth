# NBSC CITE Authentication System Setup Guide

## 🔧 Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Supabase Setup

#### A. Run the SQL Schema
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase-setup.sql`
4. Click **Run** to execute the schema

#### B. Create Admin User
1. After running the SQL, sign up a user through your app
2. Go to **Authentication > Users** in Supabase dashboard
3. Find your user and copy their UUID
4. Run this query in SQL Editor with your actual UUID:
```sql
UPDATE public.profiles 
SET role = 'admin', status = 'active'
WHERE id = 'YOUR_ADMIN_USER_UUID_HERE';
```

### 3. Environment Variables
1. Copy `.env.example` to `.env`
2. Fill in your Supabase credentials:
```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_public_anon_key
```

### 4. GitHub Codespaces Secrets (Optional)
To use environment variables in GitHub Codespaces:
1. Go to your GitHub repository
2. Navigate to **Settings > Secrets and variables > Codespaces**
3. Add these secrets:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

### 5. Start Development Server
```bash
npm run dev
```

## 🎯 User Roles & Authentication Flow

### Student Registration
- ✅ **Automatic Approval**: Students can register and login immediately
- 📧 **Email Verification**: Required before first login
- 🔓 **Access**: Basic application features

### Faculty Registration  
- ⏳ **Admin Approval Required**: Faculty accounts are created but marked as "pending"
- 🚫 **Login Blocked**: Cannot login until approved by admin
- 📧 **Notification**: Admin receives notification of pending approval
- ✅ **Post-Approval**: Full access after admin approval

### Admin Access
- 🔑 **Manual Setup**: Must be manually assigned in Supabase
- 👑 **Full Control**: Can approve/reject faculty requests
- 📊 **Dashboard Access**: Complete admin dashboard functionality

## 📋 Features Implemented

- ✅ **Supabase Authentication** with email/password
- ✅ **Role-based Access Control** (Admin, Faculty, Student)
- ✅ **Faculty Approval Workflow**
- ✅ **Admin Dashboard** with pending approvals
- ✅ **Responsive UI** with Tailwind CSS
- ✅ **Form Validation** with Zod schemas
- ✅ **Toast Notifications** for user feedback
- ✅ **Loading States** and error handling

## 🗃️ Database Schema

### Tables Created:
- `profiles` - User profile information with roles and status
- `pending_approvals` - Faculty approval requests

### Functions:
- `handle_new_user()` - Automatically creates profile on signup
- `approve_faculty_request()` - Approves faculty account
- `reject_faculty_request()` - Rejects faculty account

### Security:
- Row Level Security (RLS) enabled
- Proper access policies for different user roles

## 🚀 Testing the System

1. **Test Student Registration**: 
   - Sign up as student → Should be able to login immediately

2. **Test Faculty Registration**:
   - Sign up as faculty → Should be marked as pending
   - Try to login → Should show "pending approval" message

3. **Test Admin Approval**:
   - Login as admin → View pending faculty requests
   - Approve/reject requests → Faculty should receive access

## 🔒 Security Notes

- Environment variables are properly gitignored
- Sensitive data is stored in Supabase securely
- RLS policies prevent unauthorized data access
- Email verification required for all users

## 📧 Email Configuration (Optional)

To enable email notifications and verification:
1. Configure SMTP settings in Supabase
2. Customize email templates in **Authentication > Email Templates**
3. Set up proper DNS records for your domain

---

**Need Help?** Check the Supabase documentation or review the code comments for additional guidance.
