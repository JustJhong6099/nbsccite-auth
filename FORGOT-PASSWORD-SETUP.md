# Forgot Password Email Setup Guide

## � CRITICAL: Configure Redirect URL in Supabase

**This MUST be done first, or password reset won't work!**

### Step-by-Step:

1. **Go to your Supabase Dashboard**
   - Navigate to your project

2. **Open Authentication Settings**
   - Click on **Authentication** in the left sidebar
   - Click on **URL Configuration**

3. **Add Redirect URLs**
   - Find the **Redirect URLs** section
   - Add these URLs (one per line):
   ```
   http://localhost:5173/reset-password
   http://localhost:3000/reset-password
   https://yourdomain.com/reset-password
   https://your-vercel-app.vercel.app/reset-password
   ```
   
4. **Save Settings**
   - Click **Save** at the bottom

### ⚠️ Without this configuration:
- The reset link will redirect to login instead of reset-password page
- Users will be signed out immediately
- Password reset won't work

---

## �🔍 Problem: Password Reset Emails Not Sending

The "Forgot Password" feature is working correctly, but **emails are not being sent** because Supabase email delivery is not configured.

---

## 📧 Solution Options

### **Option 1: Development Mode (Quick Test)**

For development/testing, emails won't actually be sent. Instead:

1. **Go to Supabase Dashboard**
2. Navigate to **Authentication → Logs**
3. After requesting a password reset, look for the log entry
4. **Copy the reset link** from the logs
5. Paste it in your browser to test the reset flow

**Note:** This is only for testing. Production requires SMTP configuration.

---

### **Option 2: Configure SMTP (Production - Recommended)**

To actually send emails to users:

#### **Step 1: Set up SMTP Provider**

Choose an email provider:
- **Gmail** (Free, easy for testing)
- **SendGrid** (Free tier: 100 emails/day)
- **AWS SES** (Very cheap, reliable)
- **Mailgun** (Free tier: 100 emails/day)
- **Resend** (Modern, developer-friendly)

#### **Step 2: Configure in Supabase**

1. **Go to Supabase Dashboard**
2. Navigate to **Project Settings → Authentication**
3. Scroll to **SMTP Settings**
4. Enable **"Enable Custom SMTP"**
5. Fill in your SMTP details:

---

### **Gmail SMTP Configuration Example**

#### Prerequisites:
1. Gmail account with 2-Step Verification enabled
2. Create an App Password:
   - Go to [Google Account Settings](https://myaccount.google.com/)
   - Security → 2-Step Verification → App Passwords
   - Generate password for "Mail"

#### Supabase SMTP Settings:
```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP Username: your-email@gmail.com
SMTP Password: [16-character app password from Google]
Sender Email: your-email@gmail.com
Sender Name: NBSC Entity Extraction System
```

---

### **SendGrid Configuration Example**

#### Prerequisites:
1. Sign up at [SendGrid](https://sendgrid.com/)
2. Create API Key
3. Verify sender identity

#### Supabase SMTP Settings:
```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP Username: apikey
SMTP Password: [Your SendGrid API Key]
Sender Email: noreply@yourdomain.com
Sender Name: NBSC Entity Extraction System
```

---

### **AWS SES Configuration Example**

#### Prerequisites:
1. AWS Account
2. Verify email address in SES
3. Request production access (if needed)
4. Create SMTP credentials

#### Supabase SMTP Settings:
```
SMTP Host: email-smtp.[region].amazonaws.com (e.g., email-smtp.us-east-1.amazonaws.com)
SMTP Port: 587
SMTP Username: [Your AWS SMTP Username]
SMTP Password: [Your AWS SMTP Password]
Sender Email: verified@yourdomain.com
Sender Name: NBSC Entity Extraction System
```

---

## 🎨 Customize Email Template

After configuring SMTP:

1. **Go to Supabase Dashboard**
2. Navigate to **Authentication → Email Templates**
3. Select **"Reset Password"**
4. Customize the template:

```html
<h2>Reset Your Password</h2>
<p>Hi there,</p>
<p>We received a request to reset your password for the NBSC Entity Extraction System.</p>
<p>Click the link below to create a new password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
<p>This link will expire in 1 hour.</p>
<p>If you didn't request this, you can safely ignore this email.</p>
<p>Best regards,<br>NBSC Entity Extraction Team</p>
```

---

## ✅ Testing

After configuration:

1. Go to your login page
2. Click "Forgot Password?"
3. Enter your email address
4. Check your inbox (and spam folder)
5. Click the reset link
6. Create a new password

---

## 🔧 Troubleshooting

### Email Not Received?

1. **Check Supabase Logs:**
   - Dashboard → Authentication → Logs
   - Look for errors in email sending

2. **Verify SMTP Settings:**
   - Correct host and port
   - Valid credentials
   - Sender email verified

3. **Check Spam Folder:**
   - Password reset emails often land in spam initially

4. **Test SMTP Connection:**
   - Use a tool like [SMTP Test Tool](https://www.smtper.net/)
   - Verify credentials work outside Supabase

### Still Having Issues?

- Check Supabase status page
- Review SMTP provider logs
- Ensure sender email is verified
- Contact Supabase support

---

## 🚀 Production Checklist

Before going live:

- [ ] SMTP configured and tested
- [ ] Email template customized
- [ ] Sender email verified
- [ ] Password reset flow tested end-to-end
- [ ] Email deliverability tested
- [ ] Spam folder checked
- [ ] Link expiration verified (1 hour)
- [ ] Error handling tested

---

## 📚 Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase SMTP Setup](https://supabase.com/docs/guides/auth/auth-smtp)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [SendGrid Getting Started](https://docs.sendgrid.com/for-developers/sending-email/getting-started-smtp)
