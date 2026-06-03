# MailMind — TODO Rămas (Consolidat & Verificat)

> **Generat:** June 2026 | **Status:** ~85% complet
>
> **Auditat în cod:** Fiecare item a fost verificat în fișierele reale.
>
> Fișiere șterse: TODO.md, TODO-NEXT.md, TODO-2.md, SECURITY.md, mailmind-dashboard.html, UI_UX_REFACTOR_PROMPT.md, ui.ux.md

---

## 🔴 Prioritate 1 — Launch Blocking

| # | Task | Fișiere | Efort |
|---|------|---------|-------|
| 1 | **Env validation la startup cu Zod** — Creează `lib/env.ts` cu schemă completă. În `instrumentation.ts`: variabile critice lipsă → eroare + oprește aplicația. Script `scripts/check-env.ts` există deja, trebuie doar integrat la startup | `lib/env.ts` (nou), `instrumentation.ts` | 30min |
| 2 | **Wire tiered rate limiting în endpoint-uri AI** — `tieredAiRateLimit()` există în `lib/rate-limit.ts` (FREE=3/min, STARTER=10/min, PRO=30/min). Trebuie apelat din `/api/swarm/launch` și `/api/aurelius/chat`. Header `Retry-After` + UI toast la 429 | `app/api/swarm/launch/route.ts`, `app/api/aurelius/chat/route.ts` | 1h |
| 3 | **Penetration test manual pre-launch** — 2 conturi: accesează datele contului 2 din contul 1 prin ID manipulation. Testează toate API routes cu payload-uri malformate | Manual | 3h |

---

## 🟠 Prioritate 2 — Security (Importante)

| # | Task | Fișiere | Efort |
|---|------|---------|-------|
| 4 | **CSRF protection pe API routes custom** — Pentru `/api/aurelius`, `/api/swarm/*`, `/api/email/*`: verifică `Origin` și `Referer` headers. Server Actions (mutations prin form) sunt deja protejate de Next.js | `lib/csrf.ts` (nou) + integrare în API routes | 1h |
| 5 | **Admin route protection — founder email check** — Funcția `isAdmin()` există deja în `proxy.ts` (folosită pentru maintenance mode). Trebuie doar adăugat un check pe ruta `/dashboard/admin/*` | `proxy.ts` | 30min |
| 6 | **Backup automation + RUNBOOK.md** — Point-in-time recovery (Neon Pro). Retention 7 zile. Testează restore manual. Documentează procedura | `RUNBOOK.md` (nou), Neon dashboard | 1h |

---

## 🟠 Prioritate 3 — Features de Produs

| # | Task | Fișiere | Efort |
|---|------|---------|-------|
| 7 | **Model routing per agent type în swarm graph** — `runAgentsInParallel()` acceptă deja `"gpt-4o" \| "gpt-4o-mini"`. Researcher + Psychologist → gpt-4o-mini (ieftin). Strategist + Copywriter → gpt-4o (calitate). Loghează cost per execuție | `lib/swarm/graph.ts`, `lib/agents/swarm.ts` | 2h |
| 8 | **Sequence Builder UI cu drag-and-drop** — Endpoint API `/api/war-room/sequence` există. Componentă nouă cu dnd-kit: reordonează emailuri, preview subject, export JSON | `components/editor/SequenceBuilder.tsx` (nou) | 6h |
| 9 | **Automated follow-up scheduling** — Generarea de follow-up sequences există (API + UI + sugestii chat). Ce lipsește: declanșare automată pe timer (X zile fără răspuns → trimite follow-up) | `lib/swarm/followup.ts` (nou) + Inngest job | 4h |
| 10 | **Smart send scheduling** — Recomandă ora optimă de trimitere bazată pe timezone + industrie + date istorice | `lib/email/scheduler.ts` (nou) | 4h |

---

## 🟢 Prioritate 4 — Growth & Infrastructure

| # | Task | Categorie | Efort |
|---|------|-----------|-------|
| 11 | **Agency/Team tier $299/mo** — 5 seat-uri, workspace partajat, billing centralizat | REVENUE | 6h |
| 12 | **Public API cu per-execution pricing** — $0.10/swarm. Documentație + rate limiting + usage dashboard | REVENUE | 12h |
| 13 | **CRM integration (HubSpot / Salesforce)** — Sync bidirecțional: import contacte, trimite emailuri ca activitate. OAuth + webhook | DIFERENȚIATOR | 16h |
| 14 | **Affiliate program** — 30% comision 12 luni. Target: creatori B2B, consultanți sales. Polar.sh sau Rewardful | REVENUE | 4h |
| 15 | **Demo video pe landing page** — 90 secunde: swarm complet de la input la email. Loom sau Screen Studio | CONVERSIE | 3h |
| 16 | **Marketplace de template-uri OCEAN** — Userii publică template-uri de strategie per profil OCEAN. Network effect | DIFERENȚIATOR | 8h |
| 17 | **Public status page** — BetterStack/Instatus: API, War Room, AI Swarm, Database uptime | INFRA | 30min |
| 18 | **Preview environments per PR** — Vercel auto-deploy cu test DB + Redis | INFRA | 2h |

---

## Statistici Finale

| Sursa | Total | DONE | Rămas |
|-------|-------|------|-------|
| TODO.md + NEXT + 2 | ~119 | ~95 | ~24 |
| SECURITY.md | ~30 | ~25 | ~5 |
| **Consolidat final** | **~149** | **~120** | **~18** |

### Ce am șters și de ce

| Item Șters | Motiv |
|------------|-------|
| S6 — CORS handler | Toate API-urile sunt same-origin. Nu e nevoie. |
| S7 — Rate limiting per tier | `tieredAiRateLimit()` există în cod. A devenit task #2 (wire în endpoint-uri). |
| S8 — Polar webhook signature | `verifyWebhookSignature()` cu HMAC-SHA256 există în `polar/route.ts`. |
| S10 — Pino logging | Sentry face deja asta. Prea mult pentru un startup. |
| S11 — Alerting suspicious | Sentry face error rate alerts. Over-engineering acum. |
| S12 — PgBouncer pooling | Neon Serverless are pooling built-in. |
| S13 — pgvector isolation | `user_id` pe fiecare chunk + `p_user_id` în query. Verificat. |
| S15 — Session hardening | `expiresIn: 7 zile`, `updateAge: 1 zi`, `maxSessions: 5` în `auth.ts`. |
| S1 — middleware.ts redenumire | Păstrăm `proxy.ts` — funcționează, nu schimbăm. |
| G6 — Mobile app | Prea devreme pentru app nativă. |
| M1, M2 — Marketing | Nu sunt itemi de cod. Mutați în doc separat. |

---

*Fișiere originale șterse: TODO.md, TODO-NEXT.md, TODO-2.md, SECURITY.md, mailmind-dashboard.html, UI_UX_REFACTOR_PROMPT.md, ui.ux.md*
