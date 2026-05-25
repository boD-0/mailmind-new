# MailMind — Project Roadmap

---

## Faza 0: Fundație — înainte de orice altceva

| # | Task | Prioritate |
|---|---|---|
| 1 | Rulează migrările Drizzle pe Neon — `npx drizzle-kit push` și validează tabele: users, projects, vault_documents, swarm_executions, api_usage | ⚠️ CRITIC |
| 2 | Validează variabilele de mediu — creează `scripts/check-env.ts` care verifică `.env.local` la startup; blochează build-ul dacă lipsesc | ⚠️ CRITIC |
| 3 | Configurează Better-Auth complet — testează login email/password + Google OAuth end-to-end, sesiuni persistente, redirect-uri OAuth, middleware auth pe dashboard | ⚠️ CRITIC |
| 4 | Validează conexiunea Supabase (Realtime + pgvector) — verifică pgvector extension, testează insert + similarity search, client Realtime fără erori | 🔧 INFRA |
| 5 | Verifică conexiunea Upstash Redis — testează set/get, confirmă că `lib/rate-limit.ts` nu aruncă erori | 🔧 INFRA |
| 6 | Validează Cloudflare R2 (upload + signed URL) — upload fișier test, signed URL accesibil, test delete | 🔧 INFRA |

---

## Faza 1: Design System — refactorizare vizuală globală

| # | Task | Prioritate |
|---|---|---|
| 1 | Construiește fișierul de design tokens global — `src/styles/tokens.css` cu variabile light/dark, accent `#ff5f5f`, tipografie, border-radius 8-12px, border 1px structural | 🎨 DESIGN |
| 2 | Implementează dark mode complet cu next-themes — `ThemeProvider` în layout root, Tailwind `darkMode: 'class'`, toggle în settings | 🎨 DESIGN |
| 3 | Elimină elementele cartoonish / neo-brutalist — audit vizual: border-radius > 12px, culori saturate, shadow-uri exagerate, emoji-uri; înlocuiește cu Lucide icons | 🎨 DESIGN |
| 4 | Refactorizează cele ~70 componente UI la noul sistem — prioritate: Button, Card, Input, Badge, Dialog, Dropdown, Toast, Tabs | 🎨 DESIGN |
| 5 | Configurează Framer Motion cu physics global — `lib/motion.ts` cu preset-uri spring, `pressScale`, aplică pe butoane și card-uri | 🎨 DESIGN |
| 6 | Redesign layout principal (sidebar + CommandSurface) — border 1px structural, navigație geometrică, accent pe item activ, monospace metrici | 🎨 DESIGN |
| 7 | Redesign Landing Page + Pricing Page — ton B2B premium, hero cu copy clar, feature grid Lucide, pricing FREE/STARTER/PROFESSIONAL diferențiate | 🎨 DESIGN |
| 8 | Omni Command Palette (⌘K) — audit și polish: fuzzy search, async sources, keyboard navigation, mobile ⌃K | 💻 UX |

---

## Faza 2: AI Core — LangGraph Swarm end-to-end

| # | Task | Prioritate |
|---|---|---|
| 1 | Testează LangGraph StateGraph complet — swarm end-to-end cu prospect real, 4 agenți în ordine, state propagat corect, output email | 🤖 AI · ⚠️ CRITIC |
| 2 | Validează Tavily în Researcher agent — test search real, rate limits, error handling, date corect în state | 🤖 AI |
| 3 | Implementează Consensus + scor de încredere 0-100% — finalizează `lib/swarm/consensus.ts`, algoritm scoring, parametri, ponderare, threshold Approval Gate | 🤖 AI |
| 4 | Implementează Approval Gate cu threshold configurabil — finalizează `lib/swarm/approval-gate.ts`, scor < threshold → oprire + motiv eșec structurat | 🤖 AI |
| 5 | Implementează Sandbox — simulare reacție prospect — finalizează `lib/swarm/sandbox.ts`, folosește Digital Twin OCEAN, output: scor probabilitate + feedback | 🤖 AI |
| 6 | Implementează SpamGuard — finalizează `lib/spam-guard.ts`: spam trigger words, ratio text/link, subject length, SPF/DKIM hints, scor deliverability | 🤖 AI |
| 7 | Implementează State Resume pentru swarm-uri întrerupte — finalizează `lib/swarm/resume.ts`, persistă checkpoint LangGraph în `swarm_executions`, rehidratează state | 🤖 AI |
| 8 | Optimizează model routing GPT-4o vs GPT-4o-mini — Researcher+Psychologist → mini, Strategist+Copywriter → 4o, loghează cost per execuție în `api_usage` | 🤖 AI |
| 9 | Implementează Aurelius tool calling complet — finalizează 3 tool-uri: search (Tavily), read (vault), write (cod/text), testează în conversație reală | 🤖 AI |

---

## Faza 3: War Room — construcție completă

| # | Task | Prioritate |
|---|---|---|
| 1 | Implementează SSE streaming pentru swarm events — `app/api/swarm/stream/route.ts` cu Server-Sent Events, event structurat per step LangGraph | 🔧 INFRA |
| 2 | Construiește AgentNode.tsx — nod ReactFlow: header `SYSTEM_AGENT_01 // RESEARCHER`, status pulsant `#ff5f5f`, terminal 4-5 linii monospace, expandabil | 🎨 DESIGN |
| 3 | Construiește SwarmCanvas — layout ReactFlow cu 4 noduri + Consensus, Approval Gate, Sandbox, End; edges animate, fundal dark cu grid | 🎨 DESIGN |
| 4 | Construiește ApprovalMatrix.tsx — grid parametri: Tone Compliance, Fact Accuracy, Length Guard, OCEAN Match; failure: split-view Strategist vs Copywriter | 🎨 DESIGN |
| 5 | Implementează notificarea de State Resume — banner persistent în layout, click → War Room cu diagnostic pane auto-expanded, animat, dismissabil | 💻 UX |
| 6 | Construiește Digital Twin profile view — pentagon chart OCEAN (Recharts radar), 5 dimensiuni 0-100, ReactionPanel cu output sandbox + probabilitate | ✨ FEAT |
| 7 | Construiește panoul de metrici War Room — live: timp elapsed per agent, scor consensus, token usage, cost estimat; SSE, vibe Datadog/Grafana | ✨ FEAT |

---

## Faza 4: RAG + Vault + Onboarding

| # | Task | Prioritate |
|---|---|---|
| 1 | Testează și finalizează RAG pipeline end-to-end — PDF → text → chunking → embeddings OpenAI → pgvector → similarity query; ajustează chunk size | 🤖 AI |
| 2 | Construiește RAG Onboarding Workspace (multi-step) — step 1: drag-and-drop PDF/URL, step 2: procesare background, step 3: editare/confirmare parametri | 💻 UX |
| 3 | Vault — finalizează upload + browser UI — UploadZone R2, list view cu metadata, preview PDF/imagini, signed URL download, delete cu confirmare | ✨ FEAT |
| 4 | Finalizează wizard onboarding 6-step pentru brand — 6 pași: brand name, tonalitate, ICP, exemple emailuri, integrare RAG, confirmare; progress bar, skip inteligent | 💻 UX |
| 5 | Implementează Row-Level Security (RLS) pe Supabase — activează RLS pe `api_usage` și `vault_documents`, user vede doar propriile date | 🔧 INFRA |
| 6 | Construiește ideas/ — captură campanii cu tagging — input rapid idei, tagging categorii, căutare locală, launch swarm direct din idee, integrare global search | ✨ FEAT |

---

## Faza 5: Editor + Version Control + Tools

| # | Task | Prioritate |
|---|---|---|
| 1 | Construiește EmailEditor cu rich text de bază — bold, italic, liste, link-uri; focus pe editare rapidă post-generare AI; integrare version sidebar | ✨ FEAT |
| 2 | Construiește VersionSidebar.tsx — git-like commits: hash scurt + autor (agent/user) + descriere, timeline vertical cu branch indicator, click selectează versiunea | 🎨 DESIGN |
| 3 | Construiește Split Diff View pentru version compare — full-screen side-by-side: stânga istoric (locked), dreapta draft; highlight verde/roșu, buton rollback | 🎨 DESIGN |
| 4 | Construiește A/B Test tool — generează 2 variante email (subiect/opening diferit), side-by-side, lansează sandbox pe ambele, compară scoruri | ✨ FEAT |
| 5 | Construiește Sequence Builder cu drag-and-drop — dnd-kit reordonare emailuri în secvență, card: ziua, subject preview, status; export JSON | ✨ FEAT |
| 6 | Implementează Export (PDF + HTML + plain text) — PDF via browser print API, HTML curat inline styles, plain text fallback; one-click download | ✨ FEAT |

---

## Faza 6: Payments + Auth + Security

| # | Task | Prioritate |
|---|---|---|
| 1 | Integrează Polar.sh complet (subscriptions + webhooks) — configurează FREE/STARTER/PROFESSIONAL, webhook handler pentru create/update/cancel, actualizează tier în DB | 🔧 INFRA |
| 2 | Implementează gating funcționalități pe tier — War Room → PROFESSIONAL only, swarm executions limitat pe STARTER, Vault storage limitat pe FREE; helper `canAccess(user, feature)` centralizat | ✨ FEAT |
| 3 | Finalizează rate limiting Redis pe toate endpoint-urile AI — sliding-window pe `/api/swarm/start`, `/api/aurelius`, `/api/rag/ingest`; limite per tier; 429 + `Retry-After` + UI feedback | 🔧 INFRA |
| 4 | Construiește Admin Panel (founder mode) — useri activi, execuții swarm, API usage agregat, toggle maintenance mode via Redis; protejat cu email fondator | ✨ FEAT |
| 5 | Cookie consent + PostHog opt-in/opt-out — banner GDPR-compliant, refuz → PostHog nu inițializează, accept → tracking activ; preferință în localStorage | 💻 UX |

---

## Faza 7: i18n + Polish + Launch prep

| # | Task | Prioritate |
|---|---|---|
| 1 | Auditează și completează fișierele i18n (ro, en, fr, de) — toate string-urile externalizate în `src/messages/{locale}.json`, nicio cheie lipsă, script de diff | ✨ FEAT |
| 2 | Construiește pagina /demo — live demo interactiv — prospect pre-setat, "Run Swarm" → 4 agenți în timp real cu date mock, output email generat; tool de vânzare #1 | 💻 UX |
| 3 | Responsiveness complet — mobile + tablet — War Room: canvas → list view pe mobile; sidebar: hamburger < 768px; EmailEditor full-width; Command Palette touch | 🎨 DESIGN |
| 4 | Error boundaries + loading states peste tot — fiecare pagină cu `error.tsx` și `loading.tsx`, skeleton loaders War Room + dashboard, toast notifications erori AI | 💻 UX |
| 5 | SEO + metadata + OG images — metadata complet în layout, sitemap.xml dinamic, robots.txt; /demo și /pricing indexate, War Room noindex | ✨ FEAT |

---

## Legendă

| Simbol | Însemnare |
|---|---|
| ⚠️ CRITIC | Trebuie făcut prima dată — blocant pentru restul |
| 🔧 INFRA | Infrastructură / conexiuni externe |
| 🎨 DESIGN | UI / componente vizuale |
| 💻 UX | Experiență utilizator / flow-uri |
| 🤖 AI | Inteligență artificială / LLM |
| ✨ FEAT | Funcționalitate nouă |
