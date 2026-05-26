# MailMind — Next Steps (prioritized)

> Generat: May 26, 2026 | Bazat pe TODO.md + TODO-2.md + analiză proiect

---

## 🔴 NOW — Launch Prerequisites

- [ ] **Fill `.env.local` with real values**
  - `DATABASE_URL` — Neon PostgreSQL connection string
  - `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` + `SUPABASE_SERVICE_ROLE_KEY`
  - `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET`
  - `OPENAI_API_KEY` (and optionally `OPENROUTER_API_KEY`, `TAVILY_API_KEY`)
  - `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`
  - `CLOUDFLARE_ACCOUNT_ID` + `R2_ACCESS_KEY_ID` + `R2_SECRET_ACCESS_KEY`
  - `ADMIN_EMAIL` + `FOUNDER_EMAILS`
  - `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` (if using Google OAuth sign-in)

- [ ] **Run Drizzle migrations** — `npx drizzle-kit push` to sync schema to Neon DB
  - Validates: users, projects, vault_documents, swarm_executions, api_usage, etc.

- [ ] **Validate auth end-to-end**
  - Email/password login + session persistence
  - Google OAuth sign-in (if configured)
  - Protected routes redirect to login
  - API routes return 401 without session

- [ ] **Validate Supabase connection**
  - Realtime client without errors
  - pgvector extension working (needed for RAG)

---

## 🟠 NEAR-TERM — AI Core (TODO.md Faza 2)

- [ ] **LangGraph swarm end-to-end** — 4 agents in sequence:
  - Researcher (Tavily web search) → Psychologist (OCEAN profile) → Strategist (email strategy) → Copywriter (email draft)
  - State propagates correctly through the graph
  - Output: complete email draft

- [ ] **Consensus scoring** (0-100%) — `lib/swarm/consensus.ts`
  - Algorithm: weigh Tone Compliance, Fact Accuracy, Length Guard, OCEAN Match
  - Threshold configurable per campaign

- [ ] **Approval Gate** — `lib/swarm/approval-gate.ts`
  - Score < threshold → stops with structured failure reason
  - Score ≥ threshold → proceeds to output

- [ ] **Sandbox simulation** — `lib/swarm/sandbox.ts`
  - Uses Digital Twin OCEAN to simulate prospect reaction
  - Output: probability score + feedback text

- [ ] **SpamGuard** — `lib/spam-guard.ts`
  - Checks: spam trigger words, text/link ratio, subject length, SPF/DKIM hints
  - Output: deliverability score

- [ ] **State Resume** — `lib/swarm/resume.ts`
  - Persists LangGraph checkpoint in `swarm_executions` table
  - Rehydrates state on resume after interruption

- [ ] **Model routing** — GPT-4o-mini for cheap agents, GPT-4o for critical ones
  - Log cost per execution in `api_usage`

---

## 🟠 NEAR-TERM — War Room (TODO.md Faza 3)

- [ ] **SSE streaming** — `app/api/swarm/stream/route.ts`
  - Server-Sent Events for real-time swarm progress
  - Structured events per LangGraph step

- [ ] **AgentNode.tsx** — ReactFlow node component
  - Header: `SYSTEM_AGENT_01 // RESEARCHER`
  - Status pulse animation (`#ff5f5f`)
  - Terminal with 4-5 lines of monospace log
  - Expandable on click

- [ ] **SwarmCanvas** — ReactFlow layout
  - 4 agent nodes + Consensus + Approval Gate + Sandbox + End
  - Animated edges between nodes
  - Grid background

- [ ] **ApprovalMatrix.tsx** — Grid of parameters
  - Tone Compliance, Fact Accuracy, Length Guard, OCEAN Match
  - Failure mode: split-view Strategist vs Copywriter

- [ ] **Digital Twin profile** — Radar chart (Recharts)
  - 5 OCEAN dimensions (0-100)
  - ReactionPanel with sandbox output + probability

- [ ] **War Room metrics panel** — Live metrics
  - Time elapsed per agent, consensus score, token usage, estimated cost
  - SSE-driven, Datadog/Grafana vibe

---

## 🟢 GROWTH & BUSINESS (TODO-2.md)

- [ ] **Product Hunt launch**
  - 60s demo video, screenshots, tagline, 50+ hunters
  - Can bring 500-2000 users/day

- [ ] **Demo video** on landing page
  - 90 seconds: swarm from input to output email
  - Loom or Screen Studio — increases conversion 2-3x

- [ ] **Agency/Team tier** at $299/mo
  - 5 seats + shared workspace + centralized billing
  - After first enterprise inquiries

- [ ] **Public API** with per-execution pricing
  - $0.10 per swarm execution
  - Documentation + rate limiting + usage dashboard
  - New B2B channel without sales effort

- [ ] **HubSpot / Salesforce CRM integration**
  - Bi-directional sync: import contacts, write back as activity
  - OAuth + webhook

---

## 🟢 QUICK WINS (anytime)

- [ ] **Smart send scheduling** — Optimal send time by timezone + industry + history
- [ ] **Follow-up sequences** — Auto-generate based on reply/no-reply detection
- [ ] **Responsiveness polish** — Mobile + tablet layout fixes
- [ ] **Status page** (status.mailmind.app) — BetterStack or Instatus, 30min setup
- [ ] **Preview environments** on each PR — Vercel auto-deploy with test DB

---

## 📊 Progress

| Phase | Total | Done | Left |
|-------|-------|------|------|
| 🔴 Launch Prerequisites | 4 | 0 | 4 |
| 🟠 AI Core (Faza 2) | 7 | 0 | 7 |
| 🟠 War Room (Faza 3) | 6 | 0 | 6 |
| 🟢 Growth & Business | 5 | 0 | 5 |
| 🟢 Quick Wins | 5 | 0 | 5 |
| **Total** | **27** | **0** | **27** |
