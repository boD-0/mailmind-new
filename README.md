<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/MailMind-🧠✉️-ff5f5f?style=flat-square&labelColor=1a1a1a">
    <img alt="MailMind" src="https://img.shields.io/badge/MailMind-🧠✉️-ff5f5f?style=flat-square&labelColor=fdfbf7" width="300">
  </picture>

  <h3 align="center">AI-Powered Email Marketing Platform</h3>
  <p align="center">Four specialized AI agents collaborate to craft hyper-personalized email campaigns<br>based on each prospect's psychological profile.</p>

  <p align="center">
    <a href="#-architecture"><img src="https://img.shields.io/badge/Architecture-🏗️-ff5f5f?style=flat-square&labelColor=fdfbf7" alt="Architecture"></a>
    <a href="#-features"><img src="https://img.shields.io/badge/Features-✨-ff5f5f?style=flat-square&labelColor=fdfbf7" alt="Features"></a>
    <a href="#-tech-stack"><img src="https://img.shields.io/badge/Tech_Stack-🚀-ff5f5f?style=flat-square&labelColor=fdfbf7" alt="Tech Stack"></a>
  </p>

  <br>

  <!-- Badges Row 1 -->
  <p align="center">
    <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js&logoColor=white" alt="Next.js 16">
    <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript">
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 19">
    <img src="https://img.shields.io/badge/LangGraph-1.3-FF6B35?style=flat-square" alt="LangGraph">
    <img src="https://img.shields.io/badge/OpenAI-GPT--4o-412991?style=flat-square&logo=openai&logoColor=white" alt="OpenAI">
    <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
  </p>

  <!-- Badges Row 2 -->
  <p align="center">
    <img src="https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL">
    <img src="https://img.shields.io/badge/Drizzle_ORM-0.45-C5F74F?style=flat-square&logo=drizzle&logoColor=black" alt="Drizzle ORM">
    <img src="https://img.shields.io/badge/Supabase-pgvector-3FCF8E?style=flat-square&logo=supabase&logoColor=white" alt="Supabase">
    <img src="https://img.shields.io/badge/Redis-Upstash-FF4438?style=flat-square&logo=redis&logoColor=white" alt="Redis">
    <img src="https://img.shields.io/badge/Cloudflare-R2-F38020?style=flat-square&logo=cloudflare&logoColor=white" alt="Cloudflare R2">
    <img src="https://img.shields.io/badge/Better--Auth-1.6-7C3AED?style=flat-square" alt="Better-Auth">
    <img src="https://img.shields.io/badge/License-Private-ff5f5f?style=flat-square" alt="License Private">
  </p>

  <!-- Badges Row 3 -->
  <p align="center">
    <img src="https://img.shields.io/badge/Polar.sh-💰-F5A623?style=flat-square" alt="Polar.sh">
    <img src="https://img.shields.io/badge/Stripe-22-635BFF?style=flat-square&logo=stripe&logoColor=white" alt="Stripe">
    <img src="https://img.shields.io/badge/Sentry-🔍-362D59?style=flat-square&logo=sentry&logoColor=white" alt="Sentry">
    <img src="https://img.shields.io/badge/PostHog-📊-000?style=flat-square&logo=posthog&logoColor=white" alt="PostHog">
    <img src="https://img.shields.io/badge/Resend-📧-000?style=flat-square&logo=resend&logoColor=white" alt="Resend">
    <img src="https://img.shields.io/badge/Inngest-⚡-4F46E5?style=flat-square" alt="Inngest">
  </p>
</div>

<br>

> [!NOTE]
> Built with **Next.js 16**, **LangGraph**, **OpenAI**, **PostgreSQL + pgvector**, and a multi-agent architecture.
> **TypeScript: 0 errors** ✅ | **i18n: 4 locales in sync** ✅

---

## 🚀 Quick Start

```bash
# 1. Clone & install
npm install

# 2. Set up environment variables
cp .env.example .env.local
# 🔴 Edit .env.local — at minimum you need:
#   DATABASE_URL (Neon PostgreSQL)
#   BETTER_AUTH_SECRET (run: openssl rand -base64 32)
#   BETTER_AUTH_URL (your local URL, e.g. http://localhost:3000)
#   OPENAI_API_KEY
#   UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
#   NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY
#   CLOUDFLARE_ACCOUNT_ID + R2_* + R2_BUCKET_NAME
#   RESEND_API_KEY (for email verification)

# 3. Validate environment variables
npm run check-env

# 4. Push the database schema
npm run db:push
# Or apply existing migrations:
npm run db:migrate

# 5. (Optional) Open Drizzle Studio to browse the DB
npm run db:studio

# 6. Start the dev server
npm run dev
# → Open http://localhost:3000
# → Visit /demo to see the interactive demo
# → Visit /sign-up to create an account
```

### Required Services & API Keys

| Service | Why | Where to Get |
|---|---|---|
| **Neon PostgreSQL** | Primary database (via Drizzle ORM) | [neon.tech](https://neon.tech) — free tier |
| **Supabase** | pgvector (embeddings) + Realtime | [supabase.com](https://supabase.com) — free tier |
| **OpenAI** | LLM inference (GPT-4o / GPT-4o-mini) | [platform.openai.com](https://platform.openai.com) |
| **Upstash Redis** | Rate limiting + cache + maintenance mode | [upstash.com](https://upstash.com) — free tier |
| **Cloudflare R2** | File storage (Vault uploads) | [cloudflare.com](https://cloudflare.com) — 10GB free |
| **Resend** | Email verification + notifications | [resend.com](https://resend.com) — 100 emails/day free |
| **PostHog** | Product analytics + funnels | [posthog.com](https://posthog.com) — 1M events/mo free |
| **Better-Auth** | Auth (email/password + Google OAuth) | Built-in — just set `BETTER_AUTH_SECRET` |
| **Tavily** | Web search for Researcher agent | [tavily.com](https://tavily.com) — 1000 API calls/mo free |
| **Polar.sh** | Subscription management | [polar.sh](https://polar.sh) |
| **Stripe** | Usage-based credits (swarm credits) | [stripe.com](https://stripe.com) |
| **Proxycurl** | LinkedIn profile enrichment | [nubela.co/proxycurl](https://nubela.co/proxycurl) |
| **Sentry** | Error tracking | [sentry.io](https://sentry.io) — free tier |
| **Inngest** | Background job queue (async swarm) | [inngest.com](https://inngest.com) — free tier |
| **Google OAuth** | Gmail API (send email directly) | Google Cloud Console → Gmail API |

### Optional: Run with Docker

If you prefer a containerized approach, ensure all `.env.local` variables are set, then:

```bash
docker compose up --build
```

> **Note**: The project does not include a pre-built `Dockerfile` — you'll need to create one if targeting containerized deployment. The app is optimized for **Vercel** (zero-config) serverless deployment.

### Verify Everything Works

```bash
# TypeScript check — should be 0 errors
npx tsc --noEmit

# ESLint
npm run lint

# i18n parity check
npm run check-i18n

# Health check (after starting server)
curl http://localhost:3000/api/health
```

---

## 🏗️ Architecture

```
User → Dashboard → War Room → AI Swarm → Email Draft
                              ↓
                     Digital Twin (OCEAN profile)
                              ↓
                     Consensus → Approval → Sandbox → Send
```

### The AI Swarm System

MailMind uses a **LangGraph-based multi-agent system** — 4 specialized agents collaborate autonomously:

| Agent | Role |
|---|---|
| 🔬 **Researcher** | Gathers prospect intel (LinkedIn, web, news, podcasts) via Tavily API |
| 🧠 **Psychologist** | Builds a Big Five OCEAN personality profile & Digital Twin |
| 📊 **Strategist** | Defines email strategy, angle, hook, and tone |
| ✍️ **Copywriter** | Writes the actual email — psychologically calibrated |

### Validation Mechanisms

| Component | Role |
|---|---|
| 🤝 **Consensus** | Aggregates agent outputs & computes confidence score (0-100%) |
| 🛡️ **Approval Gate** | Validates quality & blocks low-confidence drafts |
| 🧪 **Sandbox** | Simulates prospect reaction via the Digital Twin |
| 🔒 **SpamGuard** | Checks deliverability before sending |

---

## ✨ Features

### Core AI

| Feature | Description |
|---|---|
| **🤖 AI Swarm** | Multi-agent orchestration via LangGraph — 4 specialists working in parallel |
| **🧬 Digital Twin** | OCEAN (Big Five) psychological profile for each prospect |
| **📚 RAG Pipeline** | Document ingestion → Chunking → Embeddings → pgvector (Supabase) |
| **🛡️ Approval Gate** | Consensus-driven quality validation with configurable thresholds |
| **🧪 Sandbox** | Prospect reaction simulation before you hit send |
| **🔒 SpamGuard** | Deliverability analysis — spam triggers, link ratio, subject length, SPF/DKIM hints |
| **💰 Cost Monitoring** | Token usage tracking per user/tier, cost vs revenue comparison |
| **📝 State Resume** | LangGraph checkpoint persistence for interrupted swarm executions |

### Platform Features

| Feature | Description |
|---|---|
| **⚔️ War Room** | Real-time command center for swarm monitoring (PROFESSIONAL tier) |
| **💬 Aurelius** | Conversational AI assistant with tool calling (search, read, write code) |
| **💡 AI Coaching** | Campaign insight analysis — open rate, reply patterns, agent performance |
| **⌨️ Omni Command Palette** | Universal command palette (⌘K/⌃K) with fuzzy search & async sources |
| **🔐 Vault** | Private file storage on Cloudflare R2 (briefs, references, assets) |
| **🛠️ Special Tools** | A/B Test, Sequence Builder (drag-and-drop), Send Test, Export |
| **📊 Campaign Analytics** | Recharts-powered charts: OCEAN radar, agent performance, confidence trends, engagement |
| **📧 Email Tracking** | Open rate, click rate, reply detection with Resend webhooks |
| **📁 Prospect Database** | OCEAN history, tags, search — persists across campaigns |
| **📥 Bulk CSV Import** | Upload 100 prospects at once with preview, validation, and progress |
| **🔗 LinkedIn Integration** | Import prospects via LinkedIn URL (Proxycurl API) |
| **📧 Gmail Integration** | OAuth-based Gmail send — no copy-paste needed |
| **📅 Deadlines & Events** | Scheduling with calendar picker, overdue/soon indicators |
| **🔔 Notifications** | In-app notification system (swarm events, deadlines, tasks) |
| **👤 Avatar System** | 4 customizable SVG avatars with DB persistence |
| **🔍 Global Search** | Cross-resource search (projects, documents, ideas) |
| **📈 PostHog Analytics** | Product & feature tracking, conversion funnels (Signup→Upgrade, Trial→Paid) |
| **💬 Feedback Widget** | In-app 5-star rating + text feedback |
| **🌐 Internationalization** | RO 🇷🇴, EN 🇬🇧, FR 🇫🇷, DE 🇩🇪 — all strings externalized |
| **🎯 Onboarding Checklist** | Gamified 4-milestone checklist with feature unlock badges |
| **🏅 Testimonials** | Live testimonials section on landing page with metrics |
| **🚦 PostHog Funnels** | 4 defined funnels: Signup→Upgrade, Trial→War Room, Pricing→Checkout, Waitlist→Signup |

### Security & Trust

| Feature | Description |
|---|---|
| **🔒 Authentication** | Better-Auth — email/password + Google OAuth, 7-day sliding sessions |
| **🛡️ Middleware** | Full auth protection on `/dashboard/*` and `/api/*` routes |
| **🚦 Rate Limiting** | Redis sliding-window (login 5/15min, signup 3/h, AI endpoints per tier) |
| **🔧 Maintenance Mode** | Redis toggle with animated countdown page — admin bypass |
| **🔐 Row-Level Security** | Supabase RLS on vault_documents, api_usage — user isolates their data |
| **👑 Admin Panel** | Founder mode with real stats, maintenance toggle, swarm param sliders |
| **💳 Subscriptions** | Polar.sh + Stripe — FREE / STARTER $49/mo / PROFESSIONAL $149/mo |
| **🆓 14-Day Trial** | PROFESSIONAL trial on every signup — auto-activation, no credit card |
| **🪙 Swarm Credits** | Usage-based add-on: $5 for 10 extra swarm executions |
| **🗑️ GDPR Deletion** | Account deletion with cascade cleanup, audit logging |
| **📦 Data Export** | JSON export of all user data (GDPR portability) |
| **✅ Input Validation** | Zod schemas on all AI endpoints — no malformed payloads |
| **🧹 Sanitization** | Prompt injection detection + HTML/script stripping before LLM calls |
| **📁 MIME Validation** | `file-type` magic byte checking on uploads — blocks executables |
| **🏥 Health Check** | `GET /api/health` — DB + Redis status, uptime monitoring |
| **🔍 Sentry** | Error tracking on all runtimes (client, server, edge) |
| **📋 Audit Log** | DB-backed audit trail for auth events, account actions |
| **🔐 Pre-commit Hook** | Secret scanning for API keys, tokens before each commit |
| **🍪 Cookie Consent** | GDPR banner with PostHog opt-in/opt-out via localStorage |
| **🌍 Trust Pages** | /security (SOC 2, GDPR, encryption), /privacy, /terms |
| **📄 Legal Pages** | /about (company values & story), /privacy, /terms of service |

### Pages & Public Routes

| Page | Description |
|---|---|
| `/` | Animated landing page with floating orbs, staggered entrance, interactive demo preview |
| `/pricing` | 3-tier pricing (FREE/STARTER/PROFESSIONAL) with monthly/annual toggle, comparison table |
| `/demo` | Interactive live demo — pick a prospect, watch 4 AI agents collaborate in real time |
| `/blog` | B2B psychology blog — 6 SEO articles on OCEAN profiling, cold email strategy, deliverability |
| `/changelog` | Public changelog with timeline, version badges, release notes |
| `/about` | Company story, mission, and values |
| `/privacy` | Privacy policy — data collection, storage, usage, cookies, GDPR rights |
| `/terms` | Terms of service — payment, liability, restrictions, termination |
| `/security` | Trust page — SOC 2, GDPR, encryption, data processing, retention, subprocessors |
| `/compare` | Comparison table vs Lemlist, Apollo, Clay, Instantly |
| `/waitlist` | Waitlist with live counter, early bird badges, stats |
| `/launch` | Product Hunt launch page with differentiators, testimonials, CTA |
| `/maintenance` | Animated maintenance mode countdown page |
| `/sign-up` | Auth form with email/password + Google OAuth |
| `/login` | Login form with redirect preservation |
| `/onboarding` | 6-step brand configuration wizard guided by Aurelius AI |
| `/dashboard` | Campaign studio with pipeline stages, active campaigns, swarm activity feed, metrics |
| `/dashboard/war-room/[id]` | Real-time swarm command center (PROFESSIONAL tier) |
| `/dashboard/tools` | Standalone tools page: A/B Test, Sequence Builder, Send Test, Export |
| `/dashboard/chat` | Global Aurelius chat |
| `/dashboard/ideas` | Campaign idea capture |
| `/dashboard/settings` | User settings with Gmail integration, privacy controls, data export, account deletion |
| `/dashboard/admin` | Founder mode — real stats, maintenance mode, swarm param sliders |

### API Routes (22+)

| Route | Description |
|---|---|
| `POST /api/swarm/launch` | Start swarm execution (Inngest async or inline) |
| `GET /api/swarm/stream` | SSE streaming for real-time agent events |
| `POST /api/swarm/approve` | Approve pending swarm output |
| `GET /api/swarm/resume` | Resume interrupted swarm from checkpoint |
| `POST /api/aurelius/chat` | Two-phase AI chat with tool calling (search, read, write) |
| `POST /api/rag/ingest` | Document → chunk → embed → pgvector pipeline |
| `POST /api/vault/upload` | File upload with MIME validation, R2 storage |
| `POST /api/war-room/ab-test` | Generate A/B test variants |
| `POST /api/war-room/sequence` | Save email sequence |
| `POST /api/email/send-test` | Send test email via Resend |
| `POST /api/prospects/import` | Bulk CSV import (FormData, papaparse) |
| `POST /api/prospects/linkedin` | LinkedIn enrich/search via Proxycurl |
| `GET /api/gmail/auth` | Start Gmail OAuth flow |
| `GET /api/gmail/callback` | Gmail OAuth callback handler |
| `GET /api/gmail/status` | Check Gmail connection status |
| `DELETE /api/gmail/disconnect` | Revoke Gmail connection |
| `POST /api/polar/checkout` | Create Polar.sh checkout session |
| `POST /api/polar/portal` | Create Polar customer portal session |
| `POST /api/webhooks/polar` | Polar.sh subscription webhooks |
| `POST /api/webhooks/stripe` | Stripe webhooks (credits purchase) |
| `POST /api/feedback` | Save in-app feedback |
| `GET /api/health` | Health check (DB + Redis status) |
| `GET /api/admin/cost-monitoring` | Token cost aggregation per user/tier |
| `POST /api/admin/maintenance` | Toggle maintenance mode |
| `POST /api/account/delete` | GDPR account deletion |
| `GET /api/account/export` | GDPR data export |
| `GET /api/waitlist` | Waitlist stats |
| `POST /api/waitlist` | Join waitlist |

---

## 🚀 Tech Stack

| Category | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) — React 19 |
| **Language** | TypeScript 5 (strict mode) |
| **Database** | Neon PostgreSQL + Drizzle ORM 0.45 |
| **Vector DB** | pgvector (Supabase) |
| **AI Agents** | LangGraph 1.3 + OpenAI (GPT-4o / GPT-4o-mini) |
| **Auth** | Better-Auth 1.6 (email/password + Google OAuth) |
| **Payments** | Polar.sh + Stripe 22 |
| **File Storage** | Cloudflare R2 (S3-compatible) |
| **Async Queue** | Inngest (serverless background jobs) |
| **Web Search** | Tavily API |
| **Cache** | Upstash Redis |
| **Analytics** | PostHog + Sentry error tracking |
| **Email** | Resend + Gmail API (direct send) |
| **Styling** | Tailwind CSS v4 + Radix UI (~70 components) |
| **Animations** | Framer Motion 12 + Motion + Vaul |
| **Icons** | Lucide React |
| **Forms** | React Hook Form + Zod 4 |
| **Charts** | Recharts |
| **Drag & Drop** | dnd-kit |
| **Graphs** | React Flow (@xyflow/react) |
| **PDF** | pdf-parse |
| **State** | Zustand 5 (with localStorage persist) |
| **LinkedIn** | Proxycurl API |
| **CSV** | PapaParse |
| **CI/CD** | GitHub Actions (TS check + ESLint) |

---

## 📁 Project Structure

```
src/
├── app/                        # Next.js App Router — pages & API routes
│   ├── [locale]/               # i18n routing (ro, en, fr, de)
│   │   ├── (auth)/             # Login, Sign-up, OAuth Callback
│   │   ├── dashboard/          # Main dashboard
│   │   │   ├── war-room/[id]/  # ⚔️ War Room (swarm command center)
│   │   │   ├── ideas/          # Campaign idea capture
│   │   │   ├── chat/           # Global AI chat (Aurelius)
│   │   │   ├── tools/          # Special tools (A/B Test, Sequence, Export)
│   │   │   ├── settings/       # User settings + Gmail + Privacy
│   │   │   └── admin/          # Founder mode (admin panel)
│   │   ├── onboarding/         # 6-step brand configuration wizard
│   │   ├── pricing/            # Pricing page (FREE / STARTER / PROFESSIONAL)
│   │   ├── demo/               # Interactive live demo
│   │   ├── blog/               # B2B psychology blog (SEO)
│   │   ├── changelog/          # Public changelog
│   │   ├── about/              # Company story & values
│   │   ├── privacy/            # Privacy policy
│   │   ├── terms/              # Terms of service
│   │   ├── security/           # SOC 2 / GDPR trust page
│   │   ├── compare/            # Comparison vs competitors
│   │   ├── waitlist/           # Early bird waitlist
│   │   ├── launch/             # Product Hunt launch page
│   │   ├── status/             # Public system status page
│   │   ├── maintenance/        # Maintenance mode page
│   │   └── page.tsx            # Landing page
│   └── api/                    # API routes (22+ endpoints)
├── components/                 # React components
│   ├── ui/                     # ~70 UI components (Radix-based, shadcn-style)
│   ├── swarm/                  # Swarm visualization (ReactFlow — SwarmCanvas, AgentNode)
│   ├── twin/                   # Digital Twin components (TwinProfile, ReactionPanel)
│   ├── aurelius/               # AI assistant chat system
│   ├── vault/                  # File upload & browser (UploadZone, VaultBrowser)
│   ├── dashboard/              # Dashboard components (panels, dialogs)
│   ├── tools/                  # Shared special tools (A/B Test, Sequence, Send Test)
│   ├── layout/                 # Main layout (CommandSurface with sidebar)
│   ├── editor/                 # Email editor
│   └── rag/                    # RAG onboarding workspace
├── lib/                        # Core logic
│   ├── swarm/                  # AI Swarm system (LangGraph)
│   │   ├── graph.ts            # StateGraph definition & orchestration
│   │   ├── consensus.ts        # Confidence scoring algorithm
│   │   ├── sandbox.ts          # Prospect reaction simulation
│   │   ├── approval-gate.ts    # Quality gate (configurable threshold)
│   │   ├── resume.ts           # Resume interrupted swarms (checkpoint)
│   │   ├── credits.ts          # Swarm credit balance & consumption
│   │   ├── usage.ts            # Token usage tracking
│   │   └── agents/             # Individual agents (researcher, psychologist, etc.)
│   ├── aurelius/               # Aurelius AI assistant system
│   │   ├── prompt.ts           # System prompt with brand profile injection
│   │   ├── context.ts          # Context management
│   │   └── tools/              # Tool definitions & runner (search, read, write)
│   ├── rag/                    # RAG pipeline (ingest → embed → query)
│   ├── vault/                  # File storage (R2 signed URLs + upload)
│   ├── auth/                   # Better-Auth config, gatekeeper, client
│   ├── gmail/                  # Gmail OAuth & send
│   ├── proxycurl/              # LinkedIn API client
│   ├── inngest/                # Background job queue (async swarm execution)
│   ├── supabase/               # Supabase clients (server + browser + realtime)
│   ├── analytics/              # PostHog funnels
│   ├── stripe.ts               # Stripe integration
│   ├── rate-limit.ts           # Redis sliding-window + tiered rate limiter
│   ├── spam-guard.ts           # Deliverability analysis
│   ├── r2.ts                   # Cloudflare R2 client
│   ├── redis.ts                # Upstash Redis client
│   ├── posthog-server.ts       # PostHog server client
│   ├── validate.ts             # Zod validation helper for API routes
│   ├── sanitize.ts             # Prompt injection sanitization
│   ├── audit.ts                # Audit logging (auth events, account actions)
│   ├── get-client-ip.ts        # Client IP extraction utility
│   ├── motion.ts               # Framer Motion presets
│   └── i18n.ts                 # Locale config & translation helper
├── db/                         # Drizzle schema & DB connection
│   ├── schema.ts               # Full DB schema (12+ tables)
│   └── drizzle.ts              # DB client
├── stores/                     # State management (Zustand + persist)
│   ├── swarmStore.ts           # Real-time swarm state
│   ├── twinStore.ts            # Digital Twin state
│   ├── aureliusStore.ts        # Aurelius chat history (localStorage persist)
│   ├── notificationStore.ts    # In-app notifications (5 types, 50 max)
│   ├── avatarStore.ts          # Avatar state (DB-persisted)
│   └── founderStore.ts         # Founder mode state & swarm params
├── types/                      # TypeScript types (swarm, twin, editor)
├── hooks/                      # React hooks (use-mobile, useSwarmNotifications)
├── data/                       # Static data (SVG avatars)
├── messages/                   # i18n JSON files (en, ro, fr, de)
├── styles/                     # CSS design tokens (light/dark variables)
├── middleware.ts               # Route protection + locale redirect
└── proxy.ts                    # Main proxy: auth, rate limiting, security headers, maintenance
```

---

## 🧠 AI Swarm Flow

```
                    ┌──────────────┐
                    │    START     │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │Researcher│ │Psychologist│ │Strategist│
        └─────┬────┘ └─────┬────┘ └─────┬────┘
              └────────────┼────────────┘
                           ▼
                    ┌──────────────┐
                    │  Consensus   │── Confidence score (0-100%)
                    └──────┬───────┘
                           ▼
                    ┌──────────────┐
                    │Approval Gate │── Blocks if below threshold
                    └──────┬───────┘
                           ▼
                    ┌──────────────┐
                    │  Copywriter  │
                    └──────┬───────┘
                           ▼
                    ┌──────────────┐
                    │   Sandbox    │── Simulates prospect reaction
                    └──────┬───────┘
                           ▼
                    ┌──────────────┐
                    │     END      │
                    └──────────────┘
```

---

## 📊 Database Schema (Drizzle ORM — Neon PostgreSQL)

```
users ──── projects ──── vault_documents
  │                        │
  ├── sessions              │
  ├── accounts              │
  ├── verifications         ▼
  │              swarm_executions
  ├── waitlist
  ├── gmail_connections
  ├── email_events
  ├── prospects
  ├── feedback
  ├── audit_log
  └── (api_usage + api_usage_daily for RLS + tracking)
```

**Supabase tables** (separate for pgvector + Realtime):
- `profiles`, `campaigns`, `swarm_traces`, `empathy_simulations`
- `ideas`, `chat_sessions`, `assets`
- Full RLS on all tables

---

## 🧪 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint check |
| `npm run db:push` | Push schema to database |
| `npm run db:generate` | Generate SQL migration files |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:studio` | Open Drizzle Studio (GUI database viewer) |
| `npm run check-env` | Validate environment variables |
| `npm run check-i18n` | i18n parity checker (all 4 locales in sync) |

**Pre-commit hook** (`.githooks/pre-commit`): scans staged files for leaked secrets (API keys, tokens, JWTs). Install with `git config core.hooksPath .githooks`.

---

## 🔐 Security Architecture

```
                     ┌──────────────────────┐
                     │    CF R2 (Vault)      │
                     │  Signed URLs (15min)  │
                     └──────────────────────┘
                              │
User ── HTTPS ──┬── Middleware ──┬── Page / API
                │               │
                │  • Auth check  │  • Zod validation
                │  • Rate limit  │  • Sanitization
                │  • CSP/HSTS   │  • Tier gate
                │  • Redis      │  • Audit log
                │  • Maintenance│  • Sentry
                └───────────────┴────────────────
```

**Security features applied to every request:**
1. **Middleware** (`proxy.ts`): auth protection, rate limiting (login/signup/password-reset), security headers (CSP, HSTS, XSS), maintenance mode check, IP extraction, request tracing
2. **Rate Limiting** (`lib/rate-limit.ts`): Redis sliding-window — tiered for AI endpoints (FREE: 3/min, STARTER: 10/min, PRO: 30/min)
3. **Input Validation** (`lib/validate.ts`): Zod schemas on all 7 AI endpoints
4. **Sanitization** (`lib/sanitize.ts`): Prompt injection detection, HTML stripping, length capping
5. **MIME Validation**: `file-type` magic byte checking on uploads
6. **Audit Log** (`lib/audit.ts`): All auth events + account actions logged
7. **Sentry**: Error tracking on client, server, and edge runtimes
8. **GDPR**: Account deletion + data export endpoints
9. **Pre-commit Hook**: Secret scanning before every commit

---

## 🌐 Internationalization

4 locales fully supported — all strings externalized in `src/messages/{locale}.json`:

| Locale | Code | Status |
|---|---|---|
| 🇷🇴 Română | `ro` | ✅ Complete |
| 🇬🇧 English | `en` | ✅ Complete |
| 🇫🇷 Français | `fr` | ✅ Complete |
| 🇩🇪 Deutsch | `de` | ✅ Complete |

**i18n parity checker**: `npm run check-i18n` validates all locales have matching keys (0 drift).

---

## 📄 License

**Private / Proprietary** — All rights reserved.

---

## 🤝 Contributing

1. Read `AGENTS.md` for AI-assisted development guidelines
2. This project uses **Next.js 16** with App Router — see `AGENTS.md` for breaking changes
3. Components follow shadcn/ui conventions (Radix-based)
4. State management via Zustand stores (with localStorage persist)
5. i18n messages in `src/messages/{locale}.json` (ro, en, fr, de)
6. TypeScript strict mode — **0 errors**
7. Pre-commit hook scans for secrets — run `git config core.hooksPath .githooks`

---

## 🌐 Demo

Run the project locally and visit `/demo` to see MailMind in action — pick a sample prospect and watch 4 AI agents collaborate in real time. Or visit `/waitlist` to join the early access list.

---

<div align="center">
  <p>Built with ❤️ by <strong>Bogdan Pieszczoch</strong></p>
  <p>
    <img src="https://img.shields.io/badge/TypeScript_Strict-✅-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript Strict">
    <img src="https://img.shields.io/badge/PRs_Welcome-🙌-ff5f5f?style=flat-square" alt="PRs Welcome">
    <img src="https://img.shields.io/badge/Powered_by-LangGraph-FF6B35?style=flat-square" alt="Powered by LangGraph">
    <img src="https://img.shields.io/badge/AI-OpenAI_GPT--4o-412991?style=flat-square&logo=openai&logoColor=white" alt="OpenAI GPT-4o">
    <img src="https://img.shields.io/badge/i18n-4_🌍-ff5f5f?style=flat-square" alt="4 Languages">
    <img src="https://img.shields.io/badge/API-22_🚀-3178C6?style=flat-square" alt="22+ API Endpoints">
  </p>
</div>
