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
</div>

<br>

> [!NOTE]
> Built with **Next.js 16**, **LangGraph**, **OpenAI**, **PostgreSQL + pgvector**, and a multi-agent architecture.

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
| 🔬 **Researcher** | Gathers prospect intel (LinkedIn, web, news, podcasts) |
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
| **📚 RAG Pipeline** | Document ingestion → Chunking → Embeddings → pgvector |
| **🛡️ Approval Gate** | Consensus-driven quality validation with configurable thresholds |
| **🧪 Sandbox** | Prospect reaction simulation before you hit send |

### Platform

| Feature | Description |
|---|---|
| **⚔️ War Room** | Real-time command center for swarm monitoring (PROFESSIONAL tier) |
| **💬 Aurelius** | Conversational AI assistant with tool calling (search, read, write code) |
| **⌨️ Omni Command Palette** | Universal command palette (⌘K/⌃K) with fuzzy search & async sources |
| **🔐 Vault** | Private file storage on Cloudflare R2 (briefs, references, assets) |
| **🛠️ Special Tools** | A/B Test, Sequence Builder (drag-and-drop), Send Test, Export |
| **📅 Deadlines & Events** | Scheduling & management with calendar picker |
| **🔔 Notifications** | In-app notification system (swarm events, deadlines, tasks) |
| **👤 Avatar System** | 4 customizable SVG avatars with DB persistence |
| **🔍 Global Search** | Cross-resource search (projects, documents, ideas) |
| **📈 PostHog Analytics** | Product & feature tracking |
| **🌐 Internationalization** | RO 🇷🇴, EN 🇬🇧, FR 🇫🇷, DE 🇩🇪 |

### Security & Infrastructure

| Feature | Description |
|---|---|
| **🔒 Authentication** | Better-Auth — email/password + Google OAuth |
| **🚦 Rate Limiting** | Redis sliding-window (login, signup, API, AI endpoints) |
| **🔧 Maintenance Mode** | Toggle via Redis with animated countdown page |
| **🔐 API Usage RLS** | Row-Level Security on API usage (Supabase) |
| **💳 Subscriptions** | FREE / STARTER / PROFESSIONAL tiers via Polar.sh + Stripe |
| **🍪 Cookie Consent** | Banner with PostHog opt-in/opt-out integration |
| **🎨 Warm Theme** | Cartoonish design — `#ff5f5f` accent, `#fdfbf7` background |

---

## 🚀 Tech Stack

| Category | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) — React 19 |
| **Language** | TypeScript 5 |
| **Database** | Neon PostgreSQL + Drizzle ORM 0.45 |
| **Vector DB** | pgvector (Supabase) |
| **AI Agents** | LangGraph 1.3 + OpenAI (GPT-4o / GPT-4o-mini) |
| **Auth** | Better-Auth 1.6 (email/password + Google OAuth) |
| **Payments** | Polar.sh + Stripe 22 |
| **File Storage** | Cloudflare R2 (S3-compatible) |
| **Realtime** | Supabase Realtime |
| **Web Search** | Tavily API |
| **Cache** | Upstash Redis |
| **Analytics** | PostHog |
| **Styling** | Tailwind CSS v4 + Radix UI |
| **Animations** | Framer Motion 12 + Motion + Vaul |
| **Icons** | Lucide React |
| **Forms** | React Hook Form + Zod 4 |
| **Charts** | Recharts |
| **Drag & Drop** | dnd-kit |
| **Graphs** | React Flow (@xyflow/react) |
| **PDF** | pdf-parse |
| **Email** | Resend |
| **State** | Zustand 5 (with localStorage persist) |

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
│   │   │   ├── settings/       # User settings
│   │   │   └── admin/          # Founder mode (admin panel)
│   │   ├── onboarding/         # 6-step brand configuration wizard
│   │   ├── pricing/            # Pricing page (FREE / STARTER / PROFESSIONAL)
│   │   ├── demo/               # Interactive live demo
│   │   ├── maintenance/        # Maintenance mode page
│   │   └── page.tsx            # Landing page
│   └── api/                    # API routes (swarm, vault, aurelius, webhooks, etc.)
├── components/                 # React components
│   ├── ui/                     # ~70 UI components (Radix-based, shadcn-style)
│   ├── swarm/                  # Swarm visualization (ReactFlow — SwarmCanvas, AgentNode)
│   ├── twin/                   # Digital Twin components (TwinProfile, ReactionPanel)
│   ├── aurelius/               # AI assistant chat (AureliusChat, AureliusHelper)
│   ├── vault/                  # File upload & browser (UploadZone)
│   ├── dashboard/              # Dashboard components (NewProjectDialog)
│   ├── tools/                  # Shared special tools (SpecialTools)
│   ├── layout/                 # Main layout (CommandSurface with sidebar)
│   └── editor/                 # Email editor (EmailEditor)
├── lib/                        # Core logic
│   ├── swarm/                  # AI Swarm system (LangGraph)
│   │   ├── graph.ts            # StateGraph definition & orchestration
│   │   ├── consensus.ts        # Confidence scoring
│   │   ├── sandbox.ts          # Prospect reaction simulation
│   │   ├── approval-gate.ts    # Quality gate
│   │   ├── resume.ts           # Resume interrupted swarms
│   │   └── agents/             # Individual agents (researcher, psychologist, etc.)
│   ├── aurelius/               # Aurelius system (prompt, context, tool calling)
│   │   └── tools/              # Tool definitions & runner (search, read, write)
│   ├── rag/                    # RAG pipeline (ingest → embed → query)
│   ├── vault/                  # File storage (R2 signed URLs)
│   ├── auth/                   # Better-Auth config & gatekeeper
│   ├── supabase/               # Supabase clients (server + browser + realtime)
│   ├── stripe.ts               # Stripe integration
│   ├── rate-limit.ts           # Redis sliding-window rate limiter
│   ├── spam-guard.ts           # Spam checking
│   ├── r2.ts                   # Cloudflare R2 client
│   ├── redis.ts                # Upstash Redis client
│   └── posthog-server.ts       # PostHog server client
├── db/                         # Drizzle schema & DB connection
│   ├── schema.ts               # Full DB schema (users, projects, vault, swarm_executions)
│   └── drizzle.ts              # DB client
├── stores/                     # State management (Zustand + persist)
│   ├── swarmStore.ts           # Real-time swarm state
│   ├── twinStore.ts            # Digital Twin state
│   ├── aureliusStore.ts        # Aurelius chat history (localStorage persist)
│   ├── notificationStore.ts    # In-app notifications
│   ├── avatarStore.ts          # Avatar state (DB-persisted)
│   └── founderStore.ts         # Founder mode state
├── types/                      # TypeScript types (swarm, twin)
├── hooks/                      # React hooks (use-mobile, useSwarmNotifications)
├── data/                       # Static data (SVG avatars)
└── messages/                   # i18n JSON files (en, ro, fr, de)
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

## 📊 Database Schema

```
users ──── projects ──── vault_documents
  │                        │
  ├── sessions             │
  ├── accounts             │
  ├── verifications        ▼
  │              swarm_executions
  │
  └── (api_usage + api_usage_daily for RLS + tracking)
```

**Tables managed by Drizzle ORM** on Neon PostgreSQL + **Supabase** for vector storage (pgvector) and realtime.

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

---

## 📄 License

**Private / Proprietary** — All rights reserved.

---

## 🤝 Contributing

1. Read `AGENTS.md` for AI-assisted development guidelines
2. This project uses **Next.js 16** with App Router — see `AGENTS.md` for breaking changes
3. Components follow shadcn/ui conventions
4. State management via Zustand stores (with localStorage persist)
5. i18n messages in `src/messages/{locale}.json` (ro, en, fr, de)
6. TypeScript strict mode — **0 errors**

---

## 🌐 Demo

Run the project locally and visit `/demo` to see MailMind in action — pick a sample prospect and watch 4 AI agents collaborate in real time.

---

<div align="center">
  <p>Built with ❤️ by <strong>Bogdan Pieszczoch</strong></p>
  <p>
    <img src="https://img.shields.io/badge/TypeScript_Strict-✅-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript Strict">
    <img src="https://img.shields.io/badge/PRs_Welcome-🙌-ff5f5f?style=flat-square" alt="PRs Welcome">
    <img src="https://img.shields.io/badge/Powered_by-LangGraph-FF6B35?style=flat-square" alt="Powered by LangGraph">
    <img src="https://img.shields.io/badge/AI-OpenAI_GPT--4o-412991?style=flat-square&logo=openai&logoColor=white" alt="OpenAI GPT-4o">
  </p>
</div>
