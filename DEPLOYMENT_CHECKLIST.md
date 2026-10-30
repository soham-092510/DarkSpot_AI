# DarkSpot AI — Pre-Deployment & Production Verification Checklist

Use this checklist before and after deploying **DarkSpot AI** to ensure all requirements are met:

## Pre-Deployment Verification (Local)
- [x] All 14 automated backend unit and integration tests passing (`pytest backend/tests -v`).
- [x] Next.js frontend production build succeeds with zero TypeScript or lint errors (`npm run build`).
- [x] Dual-database compatibility verified (SQLite for dev, PostgreSQL with psycopg2 for prod).
- [x] SSRF Guard active: loopback (`127.0.0.1`), metadata IP (`169.254.169.254`), and private networks blocked.
- [x] Verbatim quote integrity enforced (claims must preserve exact source excerpt).
- [x] Uncertainty and limitation disclaimer visible in reports and dashboard.
- [x] Official pre-seeded demonstration workspace (`/demo`) fully operable offline without external API keys.
- [x] `.env.example` verified with no committed secrets.
- [x] `.gitignore` verified to exclude `.env`, `.venv`, `node_modules`, and local SQLite databases.

## Production Configuration
- [ ] Code committed and pushed to `https://github.com/soham-092510/DarkSpot_AI`.
- [ ] Supabase PostgreSQL database created and connection string obtained.
- [ ] Google Gemini API key generated in Google AI Studio.
- [ ] Tavily Search API key obtained from Tavily Portal.
- [ ] Render Web Service (`darkspot-api`) created with Python 3 runtime.
- [ ] Render environment variables configured (`DATABASE_URL`, `GEMINI_API_KEY`, `TAVILY_API_KEY`, etc.).
- [ ] Backend `/health` endpoint returns `200 OK`.
- [ ] Backend `/ready` endpoint confirms database connectivity.
- [ ] Vercel project imported with root directory set to `frontend`.
- [ ] Vercel environment variable `NEXT_PUBLIC_API_URL` set to Render backend URL.
- [ ] CORS origins configured on Render backend to accept the Vercel production domain.

## Live Post-Deployment Smoke Test
- [ ] Homepage (`/`) loads with professional enterprise light design.
- [ ] Demo workspace (`/demo`) renders Blind-Spot Radar, Evidence Matrix, Contradictions, and Gaps.
- [ ] Checklist toggle works and updates task status.
- [ ] User can create a new research project (`/research/new`).
- [ ] Project analysis pipeline completes and updates Evidence Coverage Score.
- [ ] Research Dossier (`/research/[id]/report`) renders and can be printed/copied.
