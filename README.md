# MailMind 🧠✉️

**AI-Powered Email Marketing Platform** — Un swarm de agenți AI care colaborează pentru a crea campanii de email hiper-personalizate.

> Built with Next.js 16, LangGraph, and a multi-agent AI system.

---

## 🏗️ Architecture Overview

```
User → Dashboard → War Room → AI Swarm → Email Draft
                              ↓
                     Digital Twin Simulation
                              ↓
                     Consensus → Approval → Send
```

### Core System: The AI Swarm

MailMind uses a **LangGraph-based multi-agent system** where specialized AI agents collaborate in a directed graph:

| Agent | Role |
|---|---|
| 🔬 **Researcher** | Gathers prospect intel (LinkedIn, web, Tavily) |
| 🧠 **Psychologist** | Builds OCEAN personality profile & Digital Twin |
| 📊 **Strategist** | Defines email strategy & angle based on research + psychology |
| ✍️ **Copywriter** | Writes the actual email copy |
| 🤝 **Consensus** | Aggregates agent outputs & computes confidence score |
| 🛡️ **Approval Gate** | Validates quality & blocks low-confidence drafts |
| 🧪 **Sandbox** | Simulates prospect reaction via Digital Twin |

### Key Features

- **AI Swarm** — Multi-agent orchestration with LangGraph state machine
- **Digital Twin** — OCEAN-based prospect personality simulation
- **RAG Pipeline** — Document ingestion → Chunking → Embeddings → pgvector
- **Vault** — Private file storage on Cloudflare R2
- **Subscription Tiers** — FREE / STARTER / PROFESSIONAL via Polar.sh
- **Internationalization** — RO, EN, FR, DE
- **Real-time Updates** — Supabase Realtime for swarm progress
- **Analytics** — PostHog for product & feature tracking
- **Authentication** — Better-Auth with email/password + Google OAuth

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Database** | Neon PostgreSQL + Drizzle ORM |
| **Vector DB** | pgvector (Supabase) |
| **AI Agents** | LangGraph + OpenAI (GPT-4o / GPT-4o-mini) |
| **Auth** | Better-Auth |
| **Payments** | Polar.sh + Stripe |
| **File Storage** | Cloudflare R2 (AWS S3-compatible) |
| **Realtime** | Supabase Realtime |
| **Search** | Tavily API |
| **Cache** | Upstash Redis |
| **Analytics** | PostHog |
| **Styling** | Tailwind CSS v4 + Radix UI + Framer Motion |
| **Icons** | Lucide React |

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages & API routes
│   ├── [locale]/           # i18n routing (ro, en, fr, de)
│   │   ├── (auth)/         # Login, Sign-up, Callback
│   │   ├── dashboard/      # Main dashboard pages
│   │   │   ├── war-room/   # AI Swarm interface
│   │   │   ├── ideas/      # Campaign ideas
│   │   │   ├── chat/       # Global AI chat
│   │   │   └── admin/      # Founder mode (admin panel)
│   │   ├── onboarding/     # User onboarding flow
│   │   └── page.tsx        # Landing page
│   └── api/                # API routes (webhooks, swarm, vault, etc.)
├── components/             # React components
│   ├── ui/                 # shadcn-style UI components (Radix-based)
│   ├── swarm/              # Swarm visualization (ReactFlow)
│   ├── twin/               # Digital Twin components
│   ├── vault/              # File upload & browser
│   ├── aurelius/           # AI assistant chat
│   └── dashboard/          # Dashboard-specific components
├── lib/                    # Core logic
│   ├── swarm/              # AI Swarm system (LangGraph)
│   │   ├── graph.ts        # StateGraph definition & orchestration
│   │   ├── consensus.ts    # Confidence scoring
│   │   ├── sandbox.ts      # Prospect simulation
│   │   ├── approval-gate.ts# Quality gate
│   │   ├── resume.ts       # Resume interrupted swarms
│   │   └── agents/         # Individual AI agents
│   ├── rag/                # RAG pipeline (ingest → embed → query)
│   ├── vault/              # File storage (R2 signed URLs)
│   ├── auth/               # Better-Auth config & gatekeeper
│   ├── supabase/           # Supabase client (server + browser + realtime)
│   ├── stripe.ts           # Stripe integration
│   └── posthog-server.ts   # PostHog server client
├── db/                     # Drizzle schema & connection
│   ├── schema.ts           # Full database schema
│   └── drizzle.ts          # DB client
├── stores/                 # Zustand state stores
├── types/                  # TypeScript types (swarm, twin)
├── hooks/                  # React hooks (use-mobile)
└── messages/               # i18n JSON files (en, ro, fr, de)
```

---

## 🧠 AI Swarm Flow

```
                    ┌──────────────┐
                    │   START      │
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
                    │  Consensus   │
                    └──────┬───────┘
                           ▼
                    ┌──────────────┐
                    │Approval Gate │◄── Blocks if confidence < threshold
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

## 🚦 Getting Started

### Prerequisites

- **Node.js** 20+
- **PostgreSQL** (Neon recommended) or Supabase project
- **OpenAI API Key**
- **Cloudflare R2** bucket (or S3-compatible storage)
- **Upstash Redis** instance (for caching)

### Environment Variables

Create a `.env.local` file with:

```env
# Database
DATABASE_URL=postgresql://...

# Auth
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# OpenAI
OPENAI_API_KEY=sk-...

# Supabase (for realtime & vector storage)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Cloudflare R2 (or S3-compatible)
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET=...
R2_ENDPOINT=...
R2_PUBLIC_URL=...

# Upstash Redis
UPSTASH_REDIS_URL=...
UPSTASH_REDIS_TOKEN=...

# Polar.sh (subscriptions)
POLAR_WEBHOOK_SECRET=...
NEXT_PUBLIC_PRO_TIER=...
NEXT_PUBLIC_STARTER_TIER=...

# Stripe (alternative payments)
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
NEXT_PUBLIC_STRIPE_PRICE_ID=...

# Tavily (web search for researcher agent)
TAVILY_API_KEY=...

# PostHog (analytics)
NEXT_PUBLIC_POSTHOG_KEY=...
NEXT_PUBLIC_POSTHOG_HOST=...
```

### Installation

```bash
# Install dependencies
npm install

# Run database migrations
npm run db:generate
npm run db:migrate

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Making It Public on GitHub (Codespace)

### 1. Remove sensitive data

```bash
# Ensure .env files are in .gitignore (they already are)
# Check .gitignore contains:
#   .env*
#   .env.local

# Verify no secrets are tracked
git secrets  # or manually check
```

### 2. Push to GitHub from Codespace

```bash
# If starting fresh
git init
git add .
git commit -m "Initial commit: MailMind AI Email Platform"

# Create a repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/mailmind.git
git branch -M main
git push -u origin main
```

### 3. Set up for Contributors

Add a `CONTRIBUTING.md` and ensure the `AGENTS.md` file remains (it helps AI coding assistants understand the Next.js version).

### 4. Deploy (Optional)

- **Frontend**: Vercel (recommended) — `vercel --prod`
- **Database**: Neon (free tier) or Supabase
- **Vector Store**: Supabase pgvector
- **File Storage**: Cloudflare R2 (free tier: 10GB)
- **Cache**: Upstash Redis (free tier: 10MB)
- **Auth**: Built-in with Better-Auth
- **Analytics**: PostHog Cloud (free tier: 1M events/month)

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
  └── (Supabase documents + document_chunks for RAG)
```

Tables managed by Drizzle ORM with Neon PostgreSQL.

---

## 🧪 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint check |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Apply Drizzle migrations |
| `npm run db:studio` | Open Drizzle Studio (GUI) |

---

## 📄 License

Private / Proprietary — All rights reserved.

---

## 🤝 Contributing

1. Read `AGENTS.md` for AI-assisted development notes
2. The project uses Next.js 16 with App Router
3. Components follow shadcn/ui conventions
4. State management via Zustand stores
5. i18n messages in `src/messages/{locale}.json`

---

> Built with ❤️ by Alex Iancu
