# 🔧 Entity Extraction Bug - Diagnosis & Fix

## 🔍 **Problem Summary**
Entity extraction is failing in both Faculty and Student dashboards when using the Dandelion API for abstract submissions.

## 🎯 **Root Cause Identified**
The `.env` file contains a **placeholder token** instead of a real Dandelion API token:
```
VITE_DANDELION_API_TOKEN=your_dandelion_api_token_here
```

## ✅ **Solution: Get and Configure Dandelion API Token**

### **Step 1: Get Your Free Dandelion API Token**

1. **Sign up for Dandelion API (Free Tier)**
   - Visit: https://dandelion.eu/
   - Click "Sign Up" and create an account
   - Verify your email address

2. **Get Your API Token**
   - Log in and go to: https://dandelion.eu/profile/dashboard/
   - Copy your API token (it looks like: `abc123def456ghi789jkl012mno345pqr678`)
   - Keep it secure!

**Free Tier Benefits:**
- ✅ 1,000 API requests per day
- ✅ No credit card required
- ✅ Perfect for development and testing

---

### **Step 2: Configure the Token**

#### **Option A: Using .env File (Quick Testing)**

1. Open `/workspaces/nbsccite-auth/.env`
2. Replace the placeholder with your actual token:
   ```bash
   VITE_DANDELION_API_TOKEN=your_actual_token_here
   ```
3. Save the file
4. Restart the dev server:
   ```bash
   npm run dev
   ```

#### **Option B: Using GitHub Codespaces Secrets (Recommended)**

1. **Add Secret to GitHub:**
   - Go to: https://github.com/JustJhong6099/nbsccite-auth/settings/secrets/codespaces
   - Click "New repository secret"
   - Name: `VITE_DANDELION_API_TOKEN`
   - Value: `[paste your actual token]`
   - Click "Add secret"

2. **Rebuild Codespace:**
   - Close and reopen your Codespace, OR
   - Run: `Codespaces: Rebuild Container` from command palette

3. **Verify:**
   ```bash
   echo $VITE_DANDELION_API_TOKEN
   ```

---

### **Step 3: Test the Configuration**

Run the diagnostic script:
```bash
./test-dandelion-api.sh
```

**Expected Success Output:**
```
✅ .env file found
✅ VITE_DANDELION_API_TOKEN is configured
🔑 Token length: 32 characters
🧪 Testing API connection...
✅ API Connection Successful!
```

---

## 🧪 **Testing Entity Extraction**

### **Faculty Dashboard Test:**
1. Navigate to Faculty Dashboard
2. Click "Submit New Abstract"
3. Fill in the form with sample data:
   - **Title:** Machine Learning for Healthcare
   - **Abstract:** This research explores machine learning algorithms for medical diagnosis...
   - **Keywords:** machine learning, healthcare, diagnosis
4. Click "Extract Entities" button
5. Should see: Technologies, Domains, Methodologies extracted

### **Student Dashboard Test:**
1. Navigate to Student Dashboard
2. Click "Submit Abstract"
3. Fill in similar sample data
4. Click "Extract Entities"
5. Should see entity graph visualization

---

## 📊 **How Entity Extraction Works**

### **API Call Flow:**
```
User clicks "Extract Entities"
    ↓
performEntityExtraction() called
    ↓
callDandelionAPI() sends text to Dandelion
    ↓
Dandelion returns raw entities with confidence scores
    ↓
filterRelevantEntities() removes low-confidence/irrelevant entities
    ↓
classifyEntity() categorizes into:
   - Technologies (blue badges)
   - Domains (purple badges)
   - Methodologies (green badges)
    ↓
buildEntityGraph() creates D3 visualization
    ↓
Display results to user
```

### **Console Logs to Watch:**
When extraction works, you'll see:
```
🔑 Dandelion API Token Status: ✅ Token loaded
🔑 Token length: 32 characters
=== Starting Entity Extraction (Dandelion API Only) ===
📡 Calling Dandelion API...
✅ Dandelion API Success! Found 15 entities
Filtered to 8 relevant entities
✅ Entity extraction completed using Dandelion API
```

---

## ⚠️ **Common Issues & Solutions**

### **Issue 1: "Failed to extract entities" Error**
**Cause:** Invalid or missing API token
**Fix:** Follow Step 1 & 2 above to configure token

### **Issue 2: "Daily limit exceeded" (HTTP 403)**
**Cause:** Used more than 1,000 requests today
**Fix:** Wait until tomorrow, or upgrade to paid tier

### **Issue 3: "Token missing" in console**
**Cause:** Environment variable not loaded
**Fix:** Restart dev server after adding token to .env

### **Issue 4: Empty entity results**
**Cause:** Text too short or no recognizable entities
**Fix:** Use longer, more descriptive abstract text with technical terms

---

## 🔧 **Diagnostic Tools**

### **Test Script:**
```bash
./test-dandelion-api.sh
```

### **Manual API Test:**
```bash
curl "https://api.dandelion.eu/datatxt/nex/v1?text=machine%20learning&token=YOUR_TOKEN&confidence=0.5&lang=en"
```

### **Check Environment Variable:**
```bash
# In terminal
echo $VITE_DANDELION_API_TOKEN

# In browser console (after dev server starts)
console.log(import.meta.env.VITE_DANDELION_API_TOKEN ? '✅ Token loaded' : '❌ Token missing');
```

---

## 📝 **Files Modified/Created**

1. **Created:** `/workspaces/nbsccite-auth/.env`
   - Environment configuration file
   - Needs your actual Dandelion token

2. **Created:** `/workspaces/nbsccite-auth/test-dandelion-api.sh`
   - Diagnostic script for testing API connection

3. **Reference Files:**
   - `DANDELION-API-SETUP.md` - Detailed setup guide
   - `DANDELION-IMPLEMENTATION.md` - Technical implementation details
   - `.env.example` - Template for environment variables

---

## 🎓 **Next Steps After Fixing**

1. ✅ Configure Dandelion API token (follow steps above)
2. ✅ Test entity extraction in Faculty Dashboard
3. ✅ Test entity extraction in Student Dashboard
4. ✅ Verify entity graph visualization displays correctly
5. ✅ Check that entities are saved with abstract submissions

---

## 💡 **Alternative: Manual Entity Management**

If you prefer not to use the Dandelion API, you can:
1. Skip the "Extract Entities" step
2. Manually add entities using the entity manager interface
3. Add technologies, domains, and methodologies manually

This is already implemented in the Student "Edit & Resubmit" modal for rejected abstracts.

---

## 📞 **Need More Help?**

- **Dandelion API Docs:** https://dandelion.eu/docs/api/datatxt/nex/
- **Setup Guide:** See `DANDELION-API-SETUP.md`
- **Implementation Details:** See `DANDELION-IMPLEMENTATION.md`

---

**Created:** November 4, 2025  
**Status:** Ready for token configuration
