# VGYM — Aesthetic Physique Tracker

AI-powered gym tracker for aesthetic physique development. Built with Next.js, Tailwind CSS, Recharts, and the Anthropic API.

## Features

- Multi-step onboarding (body weight → exercises → PR baselines)
- 7-tier rank progression engine (Bronze → Diamond) based on relative strength
- 5-day training split planner with weekly completion tracking
- Progress charts: Estimated 1RM and weekly volume via Recharts
- Personal records table with rank progress bars
- AI Coach chat powered by Claude (server-side, API key never exposed)
- Workout logging (Sets × Reps × Weight × Date)

## Deploy to Vercel (3 steps)

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial VGYM commit"
git remote add origin https://github.com/YOUR_USERNAME/vgym.git
git push -u origin main
```

### 2. Import on Vercel
Go to [vercel.com/new](https://vercel.com/new), import your GitHub repo. Vercel auto-detects Next.js — no config needed.

### 3. Add your API key
In Vercel → Project Settings → Environment Variables, add:
```
ANTHROPIC_API_KEY = sk-ant-...
```

Redeploy and you're live.

## Local Development

```bash
npm install
cp .env.example .env.local
# Add your ANTHROPIC_API_KEY to .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## File Structure

```
vgym/
├── app/
│   ├── api/coach/route.ts   # Secure Anthropic API server route
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── VgymApp.tsx          # Root client component
│   ├── Onboarding.tsx       # Multi-step setup wizard
│   ├── Dashboard.tsx        # Main 4-tab dashboard
│   ├── AIChat.tsx           # AI coach slide-out panel
│   ├── LogModal.tsx         # Workout logging modal
│   ├── ProgressChart.tsx    # 1RM area chart
│   ├── VolumeChart.tsx      # Volume area chart
│   ├── RankBadge.tsx        # Rank tier badge
│   └── StatCard.tsx         # Metric stat card
└── lib/
    └── constants.ts         # Types, exercises, rank engine, helpers
```
