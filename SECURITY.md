# MailMind — Security Roadmap

---

## ⚠️ Vulnerabilități Critice Identificate — Starea Actuală

| # | Vulnerabilitate | Severitate |
|---|---|---|
| 1 | Orice user poate accesa datele oricărui alt user (zero RLS pe Supabase) | 🔴 CRITIC |
| 2 | Middleware gol — rutele `/dashboard` sunt complet neprotejate la nivel de server | 🔴 CRITIC |
| 3 | Zero validare input — SQL injection, prompt injection, payload malformat posibile | 🔴 CRITIC |
| 4 | Redis netestat — rate limiting inexistent în practică, API-ul AI e expus la spam | 🔴 CRITIC |
| 5 | Zero security headers — aplicația vulnerabilă la XSS, clickjacking, MIME sniffing | 🔴 CRITIC |
| 6 | Fără logging — un atac poate trece complet neobservat | 🟠 RIDICAT |

---

## Faza 1 — Săptămâna 1: Perimetru de Bază

> Fără acestea nu lansezi.

| # | Task | Prioritate |
|---|---|---|
| 1.1 | **Completează middleware.ts — protecție rute server-side** — Orice request către `/dashboard/*` sau `/api/*` (mai puțin auth și webhooks) verificat la nivel de middleware. Extrage sesiunea Better-Auth din cookie, verifică validitatea, redirect la `/login` dacă lipsește. | 🔴 CRITIC · AUTH |
| 1.2 | **Activează RLS pe toate tabelele Supabase** — Pe fiecare tabelă (`projects`, `vault_documents`, `swarm_executions`, `api_usage`): `ALTER TABLE x ENABLE ROW LEVEL SECURITY` + politici SELECT/INSERT/UPDATE/DELETE care verifică `auth.uid() = user_id`. | 🔴 CRITIC · DB |
| 1.3 | **Validează și testează Upstash Redis end-to-end** — Script `scripts/test-redis.ts` cu set/get/incr + verificare sliding window din `lib/rate-limit.ts`. Aplică rate limiting pe `/api/swarm/start` (5 req/min), `/api/aurelius` (10 req/min), `/api/auth/login` (5 req/15min). | 🔴 CRITIC · RATE LIMIT |
| 1.4 | **Adaugă security headers în next.config.ts** — `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (camera, mic, geolocation off), `Strict-Transport-Security` (HSTS, max-age 1 an). CSP — vezi task separat. | 🔴 CRITIC · INFRA |
| 1.5 | **Configurează Content Security Policy (CSP)** — CSP strict: `default-src 'self'`, `script-src 'self' 'nonce-{nonce}'` (generează nonce per request în middleware), `connect-src 'self' api.openai.com *.supabase.co *.upstash.io`, `img-src 'self' data: blob:`. | 🔴 CRITIC · INFRA |
| 1.6 | **Implementează validare Zod pe toate API routes** — Helper `lib/validate.ts` cu `validateBody(schema, req)`. Prioritate: `/api/swarm/start`, `/api/aurelius`, `/api/vault/upload`, `/api/auth/*`. Returnează 400 la erori, nu 500. | 🔴 CRITIC · VALIDATION |
| 1.7 | **Sanitizează toate input-urile înainte de OpenAI** — Strip HTML tags, limitare lungime (max 2000 chars), detectare prompt injection (`"ignore previous instructions"`, `"system:"`, `"[INST]"`). Creează `lib/sanitize.ts`. | 🔴 CRITIC · PROMPT INJECTION |

---

## Faza 2 — Săptămâna 2: Autentificare Solidă + CSRF + Sessions

| # | Task | Prioritate |
|---|---|---|
| 2.1 | **Testează Better-Auth complet și întărește sesiunile** — Login email/password, Google OAuth, logout, sesiune expirată, refresh token. Cookie-uri: `httpOnly: true`, `secure: true` (production), `sameSite: 'lax'`. Session expiry 7 zile sliding window. Invalidare sesiune la logout pe toate device-urile. | 🟠 AUTH |
| 2.2 | **Protecție brute-force pe login + signup** — 5 încercări eșuate pe același email → lockout 15 minute (Redis key cu TTL). 3 conturi noi de pe același IP în 1 oră → blocare temporară. Returnează mereu același mesaj: "Invalid credentials". | 🟠 AUTH · RATE LIMIT |
| 2.3 | **Implementează CSRF protection pe mutații sensibile** — Next.js App Router are CSRF built-in pentru Server Actions. Pentru API routes custom: verifică `Origin` și `Referer` headers. Adaugă `X-Requested-With` check. Nicio mutație cross-origin fără token explicit. | 🟠 AUTH |
| 2.4 | **Configurează CORS explicit pe toate API routes** — Helper `lib/cors.ts`: whitelist origini permise (doar domeniul tău în production, `localhost:3000` în dev). Blochează restul cu 403. Evită `Access-Control-Allow-Origin: *`. | 🟠 INFRA |
| 2.5 | **Verificare rol / tier pe fiecare API route protejată** — Helper `lib/auth/gatekeeper.ts`: `requireTier(userId, 'PROFESSIONAL')` verifică tier-ul din DB. War Room, Aurelius, Swarm start — verifică tier înainte de execuție. 403 cu mesaj clar. | 🟠 AUTH |
| 2.6 | **Protejează rutele de admin cu verificare email fondator** — În middleware: dacă ruta e `/dashboard/admin/*`, verifică `FOUNDER_EMAILS` env var. Redirect la 404 pentru oricine altcineva (nu 403). | 🟠 AUTH |

---

## Faza 3 — Săptămâna 2-3: API Security + Webhooks + File Upload

| # | Task | Prioritate |
|---|---|---|
| 3.1 | **Rate limiting granular pe toate endpoint-urile AI** — Sliding window Redis per `userId`: Swarm start 3/oră FREE, 10/oră STARTER, 50/oră PRO. Aurelius 20/oră FREE, 100/oră STARTER, unlim PRO. RAG ingest 5 doc/zi FREE. La 429: header `Retry-After` + UI toast. | 🟠 RATE LIMIT |
| 3.2 | **Webhook handler Polar.sh cu verificare semnătură** — `POST /api/webhooks/polar`: citește raw body, verifică HMAC-SHA256 cu `POLAR_WEBHOOK_SECRET`. 401 dacă nu bate. Procesează: `subscription.created/updated/cancelled` → actualizează tier atomic. | 🟠 WEBHOOKS |
| 3.3 | **Webhook handler Stripe cu verificare semnătură** — `stripe.webhooks.constructEvent(rawBody, sig, secret)`. Raw body parsing obligatoriu. Idempotency: verifică event ID în Redis. Procesează: `checkout.session.completed`, `invoice.paid`, `customer.subscription.deleted`. | 🟠 WEBHOOKS |
| 3.4 | **Validare și sanitizare fișiere upload (Vault)** — Verifică MIME type real cu `file-type` (nu extensia). Permis: `application/pdf`, `image/*`, `text/*`. Limită: 10MB/fișier, 100MB total/user FREE. UUID filename pe server — nu accepta filename de la client. | 🟠 VALIDATION |
| 3.5 | **API usage tracking + hard limits per user** — Loghează în `api_usage` (userId, model, tokens_in, tokens_out, cost, timestamp). Verifică limită lunară per tier la fiecare call. Depășire: 429 + email notificare via Resend. | 🟠 RATE LIMIT |
| 3.6 | **Protejează R2 signed URLs cu expiry scurt** — Signed URL-urile expiră în max 15 minute. Verifică ownership pe server (userId din sesiune deține fișierul) înainte de a genera URL. | 🟠 INFRA |
| 3.7 | **Env validation la startup cu schema Zod** — Creează `lib/env.ts` cu schema Zod completă. La startup (`instrumentation.ts`): dacă variabile critice lipsesc sau format greșit → eroare + oprește aplicația cu mesaj clar. | 🟠 INFRA |

---

## Faza 4 — Săptămâna 3: Database Security + RLS Avansat

| # | Task | Prioritate |
|---|---|---|
| 4.1 | **Politici RLS complete cu teste pe fiecare tabelă** — Testează cu 2 useri diferiți: User A nu citește/modifică datele User B. Tabele: `projects`, `vault_documents`, `swarm_executions`, `api_usage`, `api_usage_daily`. Service role key doar în server actions, niciodată pe client. | 🟡 DB |
| 4.2 | **Neon PostgreSQL — connection pooling + prepared statements** — Configurează PgBouncer. Verifică zero query-uri raw cu string interpolation. Folosește întotdeauna parametrii Drizzle. | 🟡 DB |
| 4.3 | **pgvector — izolează namespace-urile de embeddings per user** — Adaugă coloană `user_id` + RLS pe tabele embeddings. La similarity search: `WHERE user_id = $userId` înainte de `ORDER BY similarity`. | 🟡 DB |
| 4.4 | **Backup automat și retention policy pe Neon** — Activează point-in-time recovery (Neon Pro). Retention 7 zile minimum. Testează restore manual. Documentează procedura în `RUNBOOK.md`. | 🟡 DB |
| 4.5 | **Audit log pentru acțiuni sensibile** — Tabelă `audit_log` (userId, action, resource, resourceId, ip, userAgent, timestamp). Loghează: login, logout, swarm start, vault upload/delete, settings change, subscription change. Read-only pentru user. | 🟡 DB |

---

## Faza 5 — Săptămâna 3-4: Logging + Monitoring + Alerting

| # | Task | Prioritate |
|---|---|---|
| 5.1 | **Implementează structured logging cu Pino** — `lib/logger.ts`: JSON în production, pretty în dev. Loghează: fiecare API request (method, path, userId, duration, status), fiecare swarm execution, fiecare autentificare. Niciodată parole, tokens sau API keys. | 🟡 LOGGING |
| 5.2 | **Integrează Sentry pentru error tracking** — `@sentry/nextjs`, source maps în production. Alerte: error rate > 1% în 5 minute, orice eroare critică nouă. Filtrează date sensibile din request bodies. | 🟡 LOGGING |
| 5.3 | **Alerting pentru activitate suspicioasă** — Email/Discord alert: > 100 requests/oră, > 10 autentificări eșuate pe același IP în 5 min, API usage > 80% din limită lunară, swarm execution > 5 min (posibil stuck). | 🟡 LOGGING |
| 5.4 | **Health check endpoint + uptime monitoring** — `GET /api/health`: verifică DB, Redis, Supabase. Returnează JSON cu status per serviciu + latență. Conectează la Better Uptime / UptimeRobot. | 🟡 INFRA |
| 5.5 | **Dependency audit automat în CI/CD** — `npm audit --audit-level=high` la fiecare push. Blochează merge-ul la vulnerabilități high/critical. Rulează `npx depcheck` pentru dependențe neutilizate. | 🟡 INFRA |

---

## Faza 6 — Înainte de Lansare: GDPR + Privacy + Final Hardening

| # | Task | Prioritate |
|---|---|---|
| 6.1 | **GDPR — implementează data deletion request** — Buton "Delete my account" în settings. Șterge toate datele (projects, vault, swarm history, embeddings, api usage), revocă sesiuni, trimite email confirmare. Atomic: rollback complet dacă ceva eșuează. Max 30 zile. | 🟡 PRIVACY |
| 6.2 | **GDPR — data export (portabilitate)** — User descarcă toate datele ca ZIP: profil, proiecte, emailuri generate, history swarm. Generează async (job în background), trimite link download via email (expiră 24h). | 🟡 PRIVACY |
| 6.3 | **Secret scanning + .gitignore audit** — `git log --all --full-history -- .env*` — verifică zero secrets în history. Instalează `git-secrets` sau GitHub Secret Scanning. Pre-commit hook: blochează commit-uri cu pattern-uri de API keys (`sk-`, `Bearer `, etc.). | 🟡 INFRA |
| 6.4 | **Penetration test manual înainte de lansare** — Testează cu 2 conturi: accesează datele contului 2 din contul 1 prin ID manipulation. Testează toate API routes cu payload-uri malformate, SQL fragments, strings extrem de lungi. Verifică middleware-ul blochează toate rutele protejate. | 🔴 CRITIC |

---

## Legendă Severitate

| Simbol | Însemnare |
|---|---|
| 🔴 CRITIC | Exploatabil acum, fără efort — trebuie rezolvat prima dată |
| 🟠 RIDICAT | Exploatabil cu puțin efort |
| 🟡 MEDIU | Risc real dar mai greu de exploatat |

## Legendă Categorie

| Etichetă | Domeniu |
|---|---|
| AUTH | Autentificare și autorizare |
| DB | Database security |
| RATE LIMIT | Rate limiting și protecție abuz |
| INFRA | Infrastructură și configurare |
| VALIDATION | Validare și sanitizare input |
| WEBHOOKS | Webhook-uri externe |
| PROMPT INJECTION | Protecție injecție prompt-uri AI |
| LOGGING | Logging și observabilitate |
| PRIVACY | GDPR și protecția datelor |
