# Fitness | दर्जी — Personal Health Engine

> दर्जी means **tailor** in Hindi. Everything is personalised to you.

A single-page health & fitness app with AI-powered meal plans, workout programmes, body scan analysis, skin care routines, and a full coaching chat — all running in the browser with no backend except a thin Vercel proxy.

---

## Project Structure

```
fitnessdarji/
├── index.html          # HTML shell — links CSS + JS, no logic here
├── css/
│   └── styles.css      # All styling (biopunk dark theme)
├── js/
│   ├── state.js        # Global state object (S) + runtime vars
│   ├── calc.js         # BMI / BMR / TDEE / macro calculations
│   ├── api.js          # OpenAI key, model picker, callAPI, callVisionAPI
│   ├── ui.js           # Toasts, progress dots, score rings, CORS banner
│   ├── camera.js       # getUserMedia, capture, file-reader (shared)
│   ├── onboarding.js   # 6-step onboarding flow
│   ├── dashboard.js    # Tab bar builder & router
│   ├── overview.js     # Tab 1 — BMI gauge + macro bars
│   ├── timeline.js     # Tab 2 — milestone roadmap
│   ├── meals.js        # Tab 3 — AI meal plan
│   ├── exercise.js     # Tab 4 — AI workout plan
│   ├── bodyscan.js     # Tab 5 — AI body composition analysis
│   ├── skincare.js     # Tab 6 — AI skin analysis & routines
│   ├── alerts.js       # Tab 7 — reminder toggles & notifications
│   ├── cheat.js        # Tab 8 — strategic cheat meal planner
│   ├── coach.js        # Tab 9 — multi-turn AI coach chat
│   └── main.js         # Entry point — protocol check + goStep(1)
├── api/
│   └── chat.js         # Vercel serverless proxy → OpenAI (bypasses CORS)
├── vercel.json         # Vercel routing config
├── .gitignore
└── README.md
```

> **No build tools.** Scripts load in order via `<script src>` and share the global scope, so there is nothing to compile or bundle.

---

## Quick Start (local)

```bash
# Recommended — runs both the static files and the /api/chat proxy
npx vercel dev
# then open http://localhost:3000
```

Any other static server will serve the UI but AI features need the proxy:

```bash
python3 -m http.server 8080   # UI only — AI calls will fail
```

---

## Deploy to Vercel

1. Push to GitHub (already done)
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import this repo
3. Leave all settings default — Vercel auto-detects the `api/` folder
4. Click **Deploy**

Every push to `main` triggers a redeploy automatically.

---

## Using the App

1. Paste your **OpenAI API key** (`sk-…`) into the header bar
2. Select a model (default: **GPT-4o**)
3. Complete the **6-step onboarding** — bio stats, goal, target weight, diet, reminders
4. Explore all 9 dashboard tabs

Get an API key at [platform.openai.com/api-keys](https://platform.openai.com/api-keys).

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | Vanilla HTML + CSS + JS (no framework) |
| Fonts | Space Mono (data) + Syne (display) via Google Fonts |
| AI text | OpenAI Chat Completions — `gpt-4o` |
| AI vision | OpenAI Vision — `gpt-4o` / `gpt-4o-mini` |
| Proxy | Vercel serverless function (`api/chat.js`) |
| Hosting | Vercel (free tier) |
| State | In-memory only — no `localStorage`, no database |
