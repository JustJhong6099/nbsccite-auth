# Setting up GitHub Codespaces Secrets

## 📦 Why Use Codespaces Secrets?

Codespaces secrets allow you to securely store environment variables that will be automatically available in your GitHub Codespaces environment, without exposing them in your repository.

## 🔧 How to Set Up Codespaces Secrets

### Step 1: Access Repository Settings
1. Go to your GitHub repository: `https://github.com/JustJhong6099/nbsccite-auth`
2. Click on the **Settings** tab (must be repository owner or have admin access)

### Step 2: Navigate to Codespaces Secrets
1. In the left sidebar, scroll down to **Security**
2. Click on **Secrets and variables**
3. Select **Codespaces** tab

### Step 3: Add Your Secrets
Click **New repository secret** and add these two secrets:

#### Secret 1: VITE_SUPABASE_URL
- **Name**: `VITE_SUPABASE_URL`
- **Value**: `your_supabase_project_url_here`

#### Secret 2: VITE_SUPABASE_ANON_KEY  
- **Name**: `VITE_SUPABASE_ANON_KEY`
- **Value**: `your_supabase_anon_key_here`

### Step 4: Restart Codespace (if already running)
If you already have a Codespace running:
1. Stop the current Codespace
2. Restart it to load the new environment variables

## 🔄 Alternative: Using .env File
If you prefer to use a local `.env` file instead:
1. Copy `.env.example` to `.env`
2. Add your actual Supabase credentials
3. The `.env` file is already in `.gitignore` so it won't be committed

## ✅ Verification
After setting up secrets, your environment variables will be automatically loaded when the Codespace starts. You can verify by checking if the Supabase client connects successfully when you run the app.

## 🔒 Security Benefits
- ✅ Credentials are encrypted and secure
- ✅ Not visible in repository code
- ✅ Automatically available in all Codespaces
- ✅ Can be updated without code changes
- ✅ Team members get access without seeing actual values

---

**Note**: Make sure to use the `VITE_` prefix for environment variables in Vite applications, as only variables with this prefix are exposed to the client-side code.
