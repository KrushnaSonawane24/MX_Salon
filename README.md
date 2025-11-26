# MX_Salon – Intelligent Barber & Salon Booking App

This monorepo contains the backend (FastAPI), web frontend (React), mobile app (Expo React Native), and ML training assets for MX_Salon.

## Stack
- Backend: FastAPI, MongoDB Atlas, Upstash Redis, Socket.IO, JWT
- Frontend Web: React, Tailwind, i18next, Axios, Socket.IO client
- Mobile: Expo React Native, React Navigation, i18next, Axios, Socket.IO client
- AI: XGBoost (wait-time), DistilBERT (sentiment)

## Directory
- backend
- frontend-web
- frontend-mobile
- ml
- docs

## Quickstart (Backend)
1. Create `.env` from example and fill values:
   - In `backend/`: copy `.env.example` to `.env`. Set `MONGO_URI`, `REDIS_URL`, `JWT_SECRET`, `ALLOWED_ORIGINS`.
2. Create virtual env and install deps:
   - Windows PowerShell
     - `py -3 -m venv .venv`
     - `.\.venv\Scripts\Activate.ps1`
     - `pip install -r backend/requirements.txt`
3. Run API (dev):
   - `uvicorn backend.main:app --reload --port 8000`
4. Test:
   - `GET http://localhost:8000/health` → `{ "status": "ok" }`

## Environment Variables
- MONGO_URI: Atlas connection string with default DB (e.g., `.../mxsalon`)
- REDIS_URL: Upstash Redis URL `redis://default:<password>@<host>:<port>`
- JWT_SECRET: long random string
- JWT_EXPIRE_MINUTES: default 1440
- ALLOWED_ORIGINS: CSV of allowed origins (localhost web ports, expo dev URL)

## API Overview (MVP)
- Auth: `/api/auth/signup`, `/api/auth/login`, `/api/auth/me`
- Salons: `/api/salons`, `/api/salons/{id}` (CRUD minimal)
- Queue: `/api/queue/join/{salon_id}`, `/api/queue/leave/{salon_id}`, `/api/queue/{salon_id}`
- Reviews: `/api/reviews/{salon_id}` (POST/GET)
- AI: `/api/ai/waittime`, `/api/ai/recommend`
- WebSocket: Socket.IO namespace via the same host; room key `salon:{salon_id}`; event `queue:update`

## Next Steps
- Scaffold `frontend-web` and `frontend-mobile` with auth, i18n, and pages
- Add role-based auth guards and admin/owner endpoints
- Persist queues (optional) and add no-show logic + loyalty points
- Add ML notebooks under `ml/` for training and export models to `backend/ai/`

## Deployment
- Backend: Render/Railway → Start command `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
- Frontend Web: Vercel/Netlify → connect repo, set envs for API base URL
- DB: MongoDB Atlas free tier
- Cache: Upstash Redis free tier
