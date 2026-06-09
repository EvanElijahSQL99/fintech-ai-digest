# FinTech × AI Digest

A weekly intelligence feed tracking AI strategy announcements from FinTech companies and major financial institutions (Goldman Sachs, JPMorgan, Stripe, Plaid, and more).

Built with **Next.js 14 · Tailwind CSS · Anthropic Claude + Web Search**.

---

## Deploy to Vercel (via v0.dev)

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "init"
gh repo create fintech-ai-digest --public --push
```

### 2. Import into v0.dev or Vercel
- Go to [vercel.com/new](https://vercel.com/new)
- Import your GitHub repo
- Vercel auto-detects Next.js — no build config needed

### 3. Add your Anthropic API key
In Vercel dashboard → **Settings → Environment Variables**:
```
ANTHROPIC_API_KEY = sk-ant-...
```

### 4. Deploy
Click **Deploy**. Your app will be live at `https://your-project.vercel.app`.

---

## Run locally

```bash
npm install
cp .env.example .env.local
# Add your key to .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Architecture

```
Browser (page.tsx)
    │
    │  GET /api/news
    ▼
Next.js API Route (app/api/news/route.ts)   ← ANTHROPIC_API_KEY stays here, server-side
    │
    │  POST https://api.anthropic.com/v1/messages
    │  + web_search tool enabled
    ▼
Claude Sonnet → searches web → returns structured JSON
    │
    ▼
Browser renders stories with category filters
```

The API key **never touches the browser**. All Anthropic calls are server-side.

---

## Customize

- **Add more institutions**: edit the `USER_PROMPT` in `app/api/news/route.ts`
- **Change cadence**: set up a Vercel Cron Job to hit `/api/news` weekly
- **Add email delivery**: pipe the JSON response into SendGrid or Resend
