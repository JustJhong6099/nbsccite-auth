# 📄 Web-Based Entity Extraction System using Dandelion API  

![React](https://img.shields.io/badge/React-JS-blue?logo=react&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn--ui-Components-6E40C9)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green?logo=supabase&logoColor=white)
![Dandelion](https://img.shields.io/badge/Dandelion-API-yellow)
![License](https://img.shields.io/badge/License-Academic-lightgrey)
![Status](https://img.shields.io/badge/Status-In%20Development-orange)

## 🌐 Live Demo
**🚀 [View Live Application](https://www.nbsc-xtract.tech/)**

---

## 📜 Project Overview  

This capstone project, developed for **Northern Bukidnon State College – Institute of Computer Studies (NBSC–ICS)**, is a **web-based platform** that extracts and organizes **entities** (keywords, technologies, and research domains) from **student research abstracts**.  

Using the **Dandelion API** for semantic analysis and **Supabase** for backend services, the system transforms unstructured academic content into a **searchable knowledge base** and visualizes it via **Disjoint force-directed graph**.  

---
 

## 🛠️ Tech Stack

| Technology        | Purpose                                                                 |
|-------------------|-------------------------------------------------------------------------|
| **Vite**          | Fast build tool and development server optimized for modern web projects |
| **TypeScript**    | Strongly typed superset of JavaScript for scalable and safer development |
| **React**         | JavaScript library for building interactive user interfaces              |
| **shadcn/ui**     | Accessible and customizable UI components built with Radix and Tailwind  |
| **Tailwind CSS**  | Utility-first CSS framework for rapid and consistent UI styling          |
| **Supabase**      | Backend-as-a-Service for authentication, database, and file storage      |


---

## 🚀 Getting Started  

### Prerequisites  
Before you begin, make sure you have:  
- Node.js and npm installed  
- Supabase account and project  
- Dandelion API account and token  

---

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/entity-extraction-system.git
   cd entity-extraction-system
2. Install dependencies:
   ```bash
   npm install
3. Install Supabase client and bycrypts
   ```bash
   npm install @supabase/supabase-js
   npm install bcryptjs
4. Create a .env file (or set your environment variables)
   ```ini
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_DANDELION_API_TOKEN=your-dandelion-api-token
   ```
   
   **📖 Dandelion API Setup:**  
   For detailed instructions on obtaining and configuring your Dandelion API token, see **[DANDELION-API-SETUP.md](./DANDELION-API-SETUP.md)**
   
   - **Free Tier:** 1,000 requests/day (sufficient for most academic use)
   - **Benefits:** Higher accuracy, context-aware entity extraction, false-positive filtering
   - **Fallback:** System automatically uses keyword-based extraction if API is unavailable

5. Start the development server:
   ```bash
   npm run dev
   ```
Make sure you have your own Supabase project and environment variables set up to connect the frontend to the backend.



## 📦 Features

### 🔍 Intelligent Entity Extraction
- **Dandelion API Integration** – Professional semantic text analytics with 80-95% accuracy
- **Context-Aware Recognition** – Understands meaning and relationships between entities
- **False-Positive Filtering** – Reduces irrelevant matches (e.g., filters generic "AR" vs "Augmented Reality")
- **Fallback Mode** – Automatic keyword-based extraction when API is unavailable
- **Multi-Category Detection** – Extracts technologies, research domains, and methodologies

### 📊 Visualization & Analysis
- **Interactive D3.js Graphs** – Drag-and-drop entity relationship visualization
- **Tag Clouds** – Visual representation of keyword frequency
- **Entity Analytics** – Track trends and patterns across abstracts

### 👥 Role-Based System
- **Student Portal** – Submit abstracts, view entity extractions, track submissions
- **Faculty Dashboard** – Review submissions, validate entities, direct publishing
- **Admin Tools** – User management, system monitoring, comprehensive analytics

### 🛠 Advanced Features
- **OCR Support** – Extract text from images before submission
- **Auto-Approval for Faculty** – Streamlined publishing workflow
- **Real-time Preview** – See extracted entities before submission
- **Edit & Delete** – Full CRUD operations for approved abstracts

### 📱 Cross-Platform
- Responsive design works on desktop, tablet, and mobile devices
- Optimized for modern web browsers


---

## 🚀 Deployment

### Deploying to Vercel

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com) and sign in
   - Click "New Project" and import your GitHub repository
   - Vercel will auto-detect it as a Vite project

3. **Configure Environment Variables**
   
   In your Vercel project settings, add these environment variables:
   
   | Variable Name | Value | Required |
   |--------------|-------|----------|
   | `VITE_SUPABASE_URL` | Your Supabase project URL | ✅ Yes |
   | `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key | ✅ Yes |
   | `VITE_DANDELION_API_TOKEN` | Your Dandelion API token | ✅ Yes |

   **Steps:**
   - Go to Project Settings → Environment Variables
   - Add each variable for Production, Preview, and Development
   - Click Save

4. **Deploy**
   - Click "Deploy" and Vercel will build and deploy your app
   - Your app will be live at `https://your-project.vercel.app`

5. **Update Supabase URL Allowlist**
   - Go to your Supabase project settings
   - Add your Vercel domain to the allowed origins
   - Format: `https://your-project.vercel.app`

### Custom Domain (Optional)
- In Vercel: Settings → Domains → Add your custom domain
- Update DNS records as instructed by Vercel

---

## 🙏 Acknowledgments
Special thanks to our faculty mentors and project adviser at NBSC–ICS for their valuable guidance and support.




## 📚 Project Info
This project is part of our academic journey to apply semantic analysis in academic research management, leveraging Ionic React, Supabase, and Dandelion API.
Built with 💻 code, ☕ coffee, and 📚 research.






