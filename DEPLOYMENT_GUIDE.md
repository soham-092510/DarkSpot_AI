# DarkSpot AI — Complete Beginner-Friendly Deployment Guide

This guide walks you step-by-step through deploying the entire **DarkSpot AI** platform to the cloud for production.

Deployment Architecture:
- **Frontend**: Vercel (Next.js 14)
- **Backend API**: Render (FastAPI Web Service)
- **Background Worker**: Render (Background Worker)
- **Database**: Supabase (PostgreSQL)
- **Source Code**: GitHub (`https://github.com/soham-092510/DarkSpot_AI`)

---

## STEP 1 — Push Code to GitHub

### 1. What We Are Doing
Uploading all project files to your GitHub repository so hosting services (Render and Vercel) can automatically build and deploy them.

### 2. Why We Are Doing It
Cloud platforms connect to GitHub to download your code and automatically deploy updates when you push changes.

### 3. Step-by-Step Instructions
In your terminal in the `DarkSpot_AI` project directory, run:

```bash
git add .
git commit -m "feat: complete DarkSpot AI platform with full evidence intelligence and deployment configs"
git push -u origin main
```

### 4. How to Verify
1. Open your repository in a browser: [https://github.com/soham-092510/DarkSpot_AI](https://github.com/soham-092510/DarkSpot_AI)
2. Verify that you see `frontend/`, `backend/`, `render.yaml`, `README.md`, and `DEPLOYMENT_GUIDE.md`.
3. Verify that sensitive `.env` files are NOT uploaded (they are protected by `.gitignore`).

---

## STEP 2 — Set Up Supabase (PostgreSQL Database)

### 1. What We Are Doing
Creating a managed PostgreSQL database in the cloud.

### 2. Why We Are Doing It
PostgreSQL stores users, research projects, dimensions, atomic claims, findings, and verification tasks permanently.

### 3. Step-by-Step Instructions
1. Open [https://supabase.com](https://supabase.com) and click **Sign In** (or **Sign Up** using your GitHub account).
2. Click **New Project**.
3. Fill in the details:
   - **Name**: `darkspot-db`
   - **Database Password**: Choose a strong password and save it in a safe place.
   - **Region**: Select a region close to you (e.g., `South Asia (Mumbai)` or `East US`).
   - **Pricing Plan**: Select **Free tier**.
4. Click **Create new project** and wait 1–2 minutes while it initializes.
5. In the left sidebar, click the **Project Settings** (gear icon) -> **Database**.
6. Scroll down to **Connection parameters** or **Connection string**.
7. Click the **URI** tab, copy the string:
   ```
   postgresql://postgres.[REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```
   Replace `[YOUR-PASSWORD]` with the password you set in step 3.
8. In SQLAlchemy format, prefix with `postgresql+psycopg2://`:
   ```
   postgresql+psycopg2://postgres.[REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```

### 4. How to Verify
DarkSpot AI auto-creates all database tables (`init_db()`) on startup. You do not need to manually write SQL queries.

---

## STEP 3 — Obtain Google Gemini API Key

### 1. What We Are Doing
Obtaining an API key for Google Gemini to power question decomposition, claim extraction, and gap detection.

### 2. Why We Are Doing It
Gemini acts as the structured reasoning engine that extracts atomic facts and synthesizes unanswered questions.

### 3. Step-by-Step Instructions
1. Open [https://aistudio.google.com/](https://aistudio.google.com/) and sign in with your Google account.
2. Click **Get API key** in the left sidebar or top banner.
3. Click **Create API key** -> Select a project (or create a new one).
4. Copy the generated key (it looks like `AIzaSy...`).
5. Keep this key safe. Do not share it in public chats or commit it to GitHub.

---

## STEP 4 — Obtain Tavily Search API Key

### 1. What We Are Doing
Obtaining an API key for the Tavily Search API to perform live research web searches.

### 2. Step-by-Step Instructions
1. Open [https://app.tavily.com/](https://app.tavily.com/) and sign in (supports Google sign-in).
2. On your dashboard, copy your **API Key** (it looks like `tvly-...`).
3. The free plan includes 1,000 free searches per month, which is ideal for testing and demonstration.

---

## STEP 5 — Deploy FastAPI Backend on Render

### 1. What We Are Doing
Deploying the Python FastAPI backend as a cloud web service.

### 2. Step-by-Step Instructions
1. Open [https://render.com](https://render.com) and click **Sign In** (sign in with GitHub).
2. Click **New +** -> **Web Service**.
3. Select your repository: `soham-092510/DarkSpot_AI`.
4. Configure the Web Service:
   - **Name**: `darkspot-api`
   - **Language**: `Python 3`
   - **Branch**: `main`
   - **Region**: Choose the region closest to your Supabase region (e.g. `Frankfurt` or `Oregon`).
   - **Build Command**:
     ```bash
     pip install -r backend/requirements.txt
     ```
   - **Start Command**:
     ```bash
     uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT
     ```
   - **Plan**: Select **Free**.
5. Click **Advanced** -> **Add Environment Variable**:
   | Key | Value | Notes |
   | :--- | :--- | :--- |
   | `ENVIRONMENT` | `production` | Production mode |
   | `DATABASE_URL` | *Your Supabase PostgreSQL URI from Step 2* | Starting with `postgresql+psycopg2://` |
   | `GEMINI_API_KEY` | *Your Gemini API key from Step 3* | Server-side secret |
   | `GEMINI_MODEL` | `gemini-2.0-flash` | Fast, high-intelligence model |
   | `TAVILY_API_KEY` | *Your Tavily key from Step 4* | Server-side secret |
   | `FRONTEND_URL` | `https://darkspot-ai.vercel.app` | Updated in Step 8 if different |
   | `BACKEND_CORS_ORIGINS` | `["http://localhost:3000","https://darkspot-ai.vercel.app"]` | Allowed origins |
6. Click **Create Web Service**.
7. Wait 2–3 minutes for the build to finish. Once live, copy your backend URL (e.g., `https://darkspot-api.onrender.com`).

### 3. How to Verify
Open `https://your-backend-name.onrender.com/health` in your browser.  
Expected response:
```json
{
  "status": "ok",
  "app": "DarkSpot AI",
  "version": "1.0.0",
  "environment": "production"
}
```

---

## STEP 6 — Deploy Background Worker on Render

### 1. What We Are Doing
Running a dedicated background process that claims and executes long-running analysis jobs.

### 2. Step-by-Step Instructions
1. On the Render Dashboard, click **New +** -> **Background Worker**.
2. Select the same repository: `soham-092510/DarkSpot_AI`.
3. Configure the worker:
   - **Name**: `darkspot-worker`
   - **Language**: `Python 3`
   - **Branch**: `main`
   - **Build Command**:
     ```bash
     pip install -r backend/requirements.txt
     ```
   - **Start Command**:
     ```bash
     python -m backend.app.workers.analysis_worker
     ```
4. Add the same Environment Variables as the Web Service:
   - `DATABASE_URL`
   - `GEMINI_API_KEY`
   - `GEMINI_MODEL`
   - `TAVILY_API_KEY`
   - `ENVIRONMENT`
5. Click **Create Background Worker**.

*(Note: On Render's free tier if background workers are restricted, the FastAPI backend already contains an automated background thread dispatcher that seamlessly runs analysis jobs asynchronously without a standalone worker!)*

---

## STEP 7 — Deploy Next.js Frontend on Vercel

### 1. What We Are Doing
Deploying the Next.js frontend to Vercel's global CDN.

### 2. Step-by-Step Instructions
1. Open [https://vercel.com](https://vercel.com) and click **Sign In** (sign in with GitHub).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository: `soham-092510/DarkSpot_AI`.
4. In the project setup screen:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click **Edit** and select `frontend` (CRITICAL STEP).
5. Open the **Environment Variables** section and add:
   | Key | Value |
   | :--- | :--- |
   | `NEXT_PUBLIC_API_URL` | *Your Render backend URL from Step 5, e.g.* `https://darkspot-api.onrender.com` |
6. Click **Deploy**.
7. Wait 1–2 minutes. Once deployment completes, Vercel will give you a public URL (e.g. `https://darkspot-ai.vercel.app`).

---

## STEP 8 — Connect Everything & Final Verification

1. Go back to Render -> `darkspot-api` -> **Environment**.
2. If your Vercel URL is different from `https://darkspot-ai.vercel.app`, update:
   - `FRONTEND_URL` = `https://your-actual-app.vercel.app`
   - `BACKEND_CORS_ORIGINS` = `["https://your-actual-app.vercel.app","http://localhost:3000"]`
3. Click **Save Changes**. Render will automatically redeploy the service.

---

## STEP 9 — Final Live Production Smoke Test

Open your live Vercel URL and test the complete workflow:
1. **Landing Page**: Verify hero section and feature cards load cleanly.
2. **Evaluation Showcase**: Click **Explore Evaluation Demo** or navigate to `/demo`.
   - Verify that the 4 dimensions, 2 gaps, 1 contradiction, and 4 checklist tasks appear immediately.
   - Click a checkbox on the verification checklist and confirm it marks as completed.
3. **New Research Project**: Click **Launch Research** (`/research/new`).
   - Enter a title: `State Engineering Scholarship 2026 Verification`
   - Enter a question: `What are the eligibility criteria, required documents, and renewal conditions?`
   - Click **Start Evidence Analysis**.
   - Confirm that the workspace opens and the background analysis completes successfully!
4. **Export Dossier**: Click **Export Dossier** (`/research/[id]/report`) and verify the full markdown audit dossier renders.

Congratulations! Your **DarkSpot AI** platform is live in production!
