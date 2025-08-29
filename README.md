# 📄 Web-Based Entity Extraction System using Dandelion API  

![Ionic](https://img.shields.io/badge/Ionic-React-blue?logo=ionic&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green?logo=supabase&logoColor=white)
![Dandelion](https://img.shields.io/badge/Dandelion-API-yellow)
![License](https://img.shields.io/badge/License-Academic-lightgrey)
![Status](https://img.shields.io/badge/Status-In%20Development-orange)

---

## 📜 Project Overview  

This capstone project, developed for **Northern Bukidnon State College – Institute of Computer Studies (NBSC–ICS)**, is a **web-based platform** that extracts and organizes **entities** (keywords, technologies, locations, and research domains) from **student research abstracts**.  

Using the **Dandelion API** for semantic analysis and **Supabase** for backend services, the system transforms unstructured academic content into a **searchable knowledge base** and visualizes it via **tag clouds and charts**.  

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
- Ionic CLI installed globally  
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
   VITE_DANDELION_TOKEN=your-dandelion-token
6. Start the development server:
   ```bash
   npm run dev / ionic serve
Make sure you have your own Supabase project and environment variables set up to connect the frontend to the backend.



## 📦 Features
🔍 Automated Entity Extraction – Detects keywords, technologies, locations, and research domains from abstracts

📊 Visualization Tools – Tag clouds, frequency charts, and entity lists

👥 Role-Based Access – Different permissions for students and faculty

🛠 Admin Dashboard – Manage submissions, validate extractions, and generate reports

📱 Cross-Platform – Works on both web and mobile devices




## 🙏 Acknowledgments
Special thanks to our faculty mentors and project adviser at NBSC–ICS for their valuable guidance and support.




## 📚 Project Info
This project is part of our academic journey to apply semantic analysis in academic research management, leveraging Ionic React, Supabase, and Dandelion API.
Built with 💻 code, ☕ coffee, and 📚 research.






