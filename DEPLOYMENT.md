# AURA Learn — Deployment Guide (Final Year Demo)

Two parts: **Next.js frontend → Vercel** (free), **FastAPI backend → Render** (free).
Any device can then access `https://<your-app>.vercel.app`.

---

## 1. One-time: Get a free Groq API key (AI features)

1. Go to https://console.groq.com → Sign up (free, no card).
2. **API Keys** → Create key → copy it.
3. It has a very generous free tier (~30k requests/min on `llama-3.3-70b-versatile`).

If Groq is unavailable, the app automatically falls back to Gemini, then to
realistic mock data — demos never break.

---

## 2. Deploy the backend (FastAPI) on Render

1. Push this repo to GitHub.
2. https://render.com → New → **Blueprint** → pick the repo.
   `render.yaml` is already included — it sets up the `auralearn-api` web service automatically.
3. In the service settings → **Environment**, fill in:
   - `GROQ_API_KEY` = your key from step 1 (required for real AI)
   - `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` = from your Firebase
     service account (only needed for login-protected endpoints)
   - Leave `DATABASE_URL` / `REDIS_URL` empty (gracefully disabled)
4. Deploy. You get a URL like `https://auralearn-api.onrender.com`.

> Free tier: the service sleeps after 15 min idle — first request takes ~30 s to wake up.

---

## 3. Deploy the frontend (Next.js) on Vercel

1. https://vercel.com → Add New Project → import the same GitHub repo.
2. **Settings → Environment Variables** (must match your `.env.local`):
   | Variable | Value |
   |---|---|
   | `NEXT_PUBLIC_BACKEND_URL` | `https://auralearn-api.onrender.com` (your Render URL — also used by `/api/resume-hub/*`) |
   | `NEXT_PUBLIC_FIREBASE_API_KEY` | from Firebase console |
   | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | e.g. `auralearn-d0548.firebaseapp.com` |
   | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | e.g. `auralearn-d0548` |
   | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | from Firebase console |
   | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | from Firebase console |
   | `NEXT_PUBLIC_FIREBASE_APP_ID` | from Firebase console |
   | `GEMINI_API_KEY` | (optional fallback) |
   | `NEXT_PUBLIC_GEMINI_API_KEY` | (optional fallback) |
3. Deploy. Done — `https://<your-app>.vercel.app/classroom` works from any device.

> The `next.config.js` rewrite sends all `/api/v1/*` calls to `NEXT_PUBLIC_BACKEND_URL`.
> The `/api/resume-hub/*` routes run natively on Vercel (serverless) and call the
> backend's `/api/v1/agents/resume/*` endpoints.

---

## 4. Show it on multiple devices (during the demo, no deployment needed)

```bat
start-demo.bat
```

Then:
- On your PC: `http://localhost:3000`
- On other devices (same WiFi): `http://<YOUR-LAN-IP>:3000`
  - Find your IP: `ipconfig` → IPv4 Address (e.g. `192.168.1.5`)
- Allow Node.js + Python through Windows Firewall (private networks) the first time.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Chat/lesson shows mock text | `GROQ_API_KEY` missing or quota hit — set it, restart backend |
| Login fails on deployed app | Set the 6 `NEXT_PUBLIC_FIREBASE_*` vars on Vercel + admin creds on Render |
| "Unable to connect" from phone | Check Windows Firewall; same WiFi network; use LAN IP not localhost |
| Backend sleep on Render free | Wait ~30 s on first call after idle |
