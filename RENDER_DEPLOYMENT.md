# DarkSpot AI — Render 1-Click Deployment Guide

This guide explains how to deploy **DarkSpot AI** directly using **Render Blueprints** (`render.yaml`).

---

## 🚀 Recommended: Deploy Everything via Render Blueprint (1-Click)

The repository includes a complete **Render Blueprint** (`render.yaml`) that defines the entire infrastructure:
1. **`darkspot-db`**: Managed PostgreSQL Database
2. **`darkspot-api`**: FastAPI Python Web Service (REST API)
3. **`darkspot-worker`**: Python Asynchronous Background Analysis Worker
4. **`darkspot-frontend`**: Next.js 14 App Router Web Service

---

### Step 1: Push Code to Your GitHub Repository

Ensure all local files are committed and pushed to your GitHub repository:
```bash
git add .
git commit -m "feat: DarkSpot AI enterprise redesign and Render blueprint"
git push origin main
```

---

### Step 2: Open Render and Create a Blueprint Instance

1. Navigate to the **[Render Dashboard](https://dashboard.render.com/)** and sign in (supports GitHub login).
2. Click the **"New +"** button in the top navigation bar.
3. Select **"Blueprint"** from the dropdown menu.
4. Select or connect your GitHub repository (`DarkSpot_AI`).
5. Choose a branch: `main`.
6. Click **"Connect"**.

---

### Step 3: Enter Your 2 Secret API Keys

Render will automatically parse `render.yaml` and ask you for the two secret environment variables:

| Environment Variable | Where to get it | Purpose |
| :--- | :--- | :--- |
| **`GEMINI_API_KEY`** | [Google AI Studio](https://aistudio.google.com/) | Decomposes questions, extracts claims, detects contradictions and gaps. |
| **`TAVILY_API_KEY`** | [Tavily Portal](https://app.tavily.com/) | Live authoritative web searches for research sources. |

*(Note: The PostgreSQL database connection string `DATABASE_URL` is automatically created and wired by Render to both the API and Worker!)*

---

### Step 4: Click "Apply"

1. Click **"Apply"** at the bottom of the page.
2. Render will automatically:
   - Provision your **PostgreSQL Database** (`darkspot-db`).
   - Build and start the **FastAPI Backend** (`darkspot-api`), initializing database tables automatically.
   - Build and start the **Background Worker** (`darkspot-worker`).
   - Build and launch the **Next.js Frontend** (`darkspot-frontend`).
3. Once all services show **Live** with green checkmarks, click on the **`darkspot-frontend`** URL to open your production web app!

---

## 🌐 Alternative: Render (Backend + Worker + DB) + Vercel (Frontend)

If you prefer hosting the Next.js frontend on **Vercel** (with global CDN edge network):

1. **On Render:** In the Blueprint setup, deploy `darkspot-db`, `darkspot-api`, and `darkspot-worker`.
2. Copy your backend URL from Render (e.g., `https://darkspot-api.onrender.com`).
3. **On Vercel:**
   - Go to [vercel.com](https://vercel.com/) and click **"Add New Project"**.
   - Import your GitHub repository (`DarkSpot_AI`).
   - Set **Root Directory** to `frontend`.
   - In **Environment Variables**, add:
     - `NEXT_PUBLIC_API_URL` = `https://darkspot-api.onrender.com`
   - Click **Deploy**!
