# Changelog

## [Unreleased] — 2026-05-25

### 💰 Faza 6 — Payments + Auth + Security

#### Polar.sh Subscription Integration

- **`src/app/api/polar/checkout/route.ts`** *(NEW)* — Creates Polar.sh checkout sessions. Finds/creates customer by `external_id`, maps plan to product ID from `POLAR_PRO_PRODUCT_ID`/`POLAR_STARTER_PRODUCT_ID` env vars, returns redirect URL. Auth-gated + PostHog tracking.
- **`src/app/api/polar/portal/route.ts`** *(NEW)* — Creates Polar customer portal sessions for subscription management (upgrade/downgrade/cancel). Finds customer by `external_id`.
- **`src/app/api/webhooks/polar/route.ts`** *(UPDATED)* — Handles Polar webhook events (`subscription.created`/`updated`/`canceled`/`revoked`). Matches users by `polarCustomerId` with **email fallback** for first-time subscriptions. HMAC signature verification with graceful env-var-missing handling. PostHog event tracking.

#### Tiered Feature Gating

- **`src/lib/auth/gatekeeper.ts`** *(UPDATED)* — Added `canAccess` (alias for `checkFeatureAccess`), `requirePlan(userPlan, min)` returning `NextResponse | null` for API-level gating, `requirePlanPage(request, min)` for page-level redirect to `/pricing`. Plan ordering: FREE=0, STARTER=1, PROFESSIONAL=2.
- **`src/app/api/vault/upload/route.ts`** *(FIXED)* — Added missing imports (`safeJsonParse`, `randomUUID`, `db`, `vaultDocuments`).

#### Tiered Rate Limiting

- **`src/lib/rate-limit.ts`** *(UPDATED)* — Added `tieredAiRateLimit(plan, userId)` — FREE=3/min, STARTER=10/min, PROFESSIONAL=30/min. Added `tieredUploadRateLimit` — FREE=2/min, STARTER=5/min, PROFESSIONAL=10/min.
- Applied to **6 API endpoints**: Aurelius chat, Swarm launch, RAG ingest, A/B Test, Sequence Builder, Send Test email — all now have per-plan rate limits with `Retry-After` headers.

#### Admin Panel (Real Stats)

- **`src/app/actions/admin-stats.ts`** *(NEW)* — Real DB queries (swarm count, user count, document count, total tokens, recent executions). Admin-gated via `ADMIN_EMAIL` env var. Parallel Promise.all queries. Returns `formattedTokens` pre-computed.
- **`src/app/[locale]/dashboard/admin/page.tsx`** *(REWRITTEN)* — Real-time admin dashboard with stats grid (Total Swarms, Active Users, Documents Stored, Tokens Used), recent swarm executions table with status badges + time-ago formatting, maintenance mode toggle + swarm param sliders. Loading spinners on all stats while fetching.

#### Env Checker Update

- **`scripts/check-env.ts`** *(UPDATED)* — Added `POLAR_ACCESS_TOKEN`, `POLAR_WEBHOOK_SECRET`, `POLAR_PRO_PRODUCT_ID`, `POLAR_STARTER_PRODUCT_ID`, `EMAIL_FROM`.

#### Pricing Page → Polar CTAs

- **`src/app/[locale]/pricing/page.tsx`** *(UPDATED)* — STARTER and PROFESSIONAL tier CTAs now call `POST /api/polar/checkout` with loading spinner. 401 fallback redirects to sign-up. FREE tier CTA remains a sign-up link.

---

### 📧 Faza 6.5 — Send Test Email Wiring

- **`src/app/api/email/send-test/route.ts`** *(NEW)* — Auth-gated POST endpoint. Validates `to` (email), `subject` (max 200 chars), `html` (max 100KB). Sends via Resend API. Rate-limited at 5/min per user. Privacy-safe logging (emails masked).
- **`src/components/tools/SpecialTools.tsx`** *(UPDATED)* — Send Test section now has recipient input, subject input, HTML textarea (pre-filled from `emailContent` prop via `useEffect` sync), wired button to `POST /api/email/send-test` with loading spinner + toast feedback. Consistent React hook imports.

---

### 🌐 Faza 7 — i18n + Polish + Launch Prep

#### i18n Completeness

- **`src/messages/en.json`** *(FIXED)* — Onboarding section: replaced ALL Romanian strings with proper English translations (loading, step labels, Aurelius bubbles, labels, placeholders, hints, toast messages, recap, counter, section names).
- **`src/messages/fr.json`** *(UPDATED)* — Added missing keys: `no_campaigns`, `no_campaigns_hint`, `campaign_view_all`.
- **`src/messages/de.json`** *(UPDATED)* — Added missing keys: `no_campaigns`, `no_campaigns_hint`, `campaign_view_all`.
- **`scripts/check-i18n.ts`** *(NEW)* — Parity checker: flattens all JSON keys, compares `en.json` as reference against `ro`/`fr`/`de`, reports missing + extra keys per locale. Exits code 1 on mismatch. ESM-compatible via `import.meta.url`. **All 4 locales currently match** ✅.

#### Error Boundaries (13 files)

Added `error.tsx` to every route that lacked one: `login`, `sign-up`, `pricing`, `dashboard`, `dashboard/admin`, `dashboard/chat`, `dashboard/ideas`, `dashboard/tools`, `dashboard/settings`, `dashboard/war-room/[id]`, `onboarding`, `maintenance`, `demo`. All use the stable `reset()` API.

#### Loading States (13 files)

Added `loading.tsx` to every route that lacked one — same set as error boundaries. All use `LoadingScreen` with descriptive per-page messages.

#### SEO + Metadata

- **`src/app/[locale]/layout.tsx`** *(UPDATED)* — Enhanced metadata: template titles, OpenGraph (`og-image.png`), Twitter cards (`summary_large_image`), keywords, `metadataBase`, robots directives.
- **`src/app/robots.ts`** *(NEW)* — Dynamic `robots.txt`: allows `/`, `/demo`, `/pricing` (all locale-prefixed), disallows `/dashboard/*`, `/admin/*`, `/api/*`, `/login`, `/sign-up`, `/onboarding`, `/maintenance`.
- **`src/app/sitemap.ts`** *(NEW)* — Dynamic `sitemap.xml` with locale-prefixed landing (priority 1.0), demo (0.9), pricing (0.8) — weekly/monthly change frequency.

---

### 🔧 Post-Review Fixes (2026-05-25)

- Renamed `NEXT_PUBLIC_PRO_TIER`/`NEXT_PUBLIC_STARTER_TIER` → `POLAR_PRO_PRODUCT_ID`/`POLAR_STARTER_PRODUCT_ID` (no client-bundle leak)
- Fixed `POLAR_WEBHOOK_SECRET!` non-null assertion → graceful `if (!secret) return false` check
- Removed duplicate `formatTokens` — server now returns pre-formatted `formattedTokens`, client uses it directly
- Unified React hook imports in `SpecialTools.tsx` (all hooks imported at top level); simplified `useEffect` sync
- Privacy-safe logging in send-test route (emails masked in console)
- Removed unused `import React` from admin page; loading spinner now shows on all stats

**TypeScript: 0 errors** ✅ | **i18n diff: all locales match** ✅

---

### 📧 Gmail / Google Workspace OAuth Integration

- **`src/lib/gmail/oauth.ts`** *(NEW)* — Google OAuth2 client using `google-auth-library`. Generates consent URLs with `prompt=consent` + `access_type=offline` to ensure refresh tokens. Exchanges codes, refreshes tokens, auto-refreshes stale access tokens (5-min buffer).
- **`src/lib/gmail/send.ts`** *(NEW)* — `sendGmailEmail()` loads the user's Gmail connection from DB, auto-refreshes the token if needed, builds RFC 2822 base64url-encoded email, and sends via Gmail REST API.
- **`src/app/api/gmail/auth/route.ts`** *(NEW)* — `GET /api/gmail/auth` — auth-gated, stores CSRF state in Redis (5-min TTL), redirects to Google OAuth consent screen.
- **`src/app/api/gmail/callback/route.ts`** *(NEW)* — `GET /api/gmail/callback` — validates CSRF state, exchanges auth code, upserts connection via `onConflictDoUpdate` (race-safe), redirects to `/dashboard/settings?gmail=connected|denied|expired|error`.
- **`src/app/api/gmail/status/route.ts`** *(NEW)* — `GET /api/gmail/status` — returns `{ connected, googleEmail }` for the authenticated user.
- **`src/app/api/gmail/disconnect/route.ts`** *(NEW)* — `DELETE /api/gmail/disconnect` — revokes the refresh token on Google (best-effort), deletes the DB row.
- **`src/db/schema.ts`** *(UPDATED)* — Added `gmailConnections` table with unique index on `userId`, cascade delete.
- **`src/app/[locale]/dashboard/settings/page.tsx`** *(UPDATED)* — New "Gmail Integration" section with connect/disconnect buttons, loading skeletons, error states, callback param handling.
- **`scripts/check-env.ts`** *(UPDATED)* — Added `GOOGLE_GMAIL_CLIENT_ID` and `GOOGLE_GMAIL_CLIENT_SECRET`.
- **`src/messages/{en,ro,fr,de}.json`** *(UPDATED)* — 12 new `settings.gmail_*` keys across all 4 locales.
- **`drizzle/0006_gmail_connections.sql`** *(NEW)* — Migration with unique index per user.
- **`package.json`** *(UPDATED)* — Added `google-auth-library` dependency.

---

### 🪙 Swarm Credits Add-on — Usage-based Pricing

- **`src/lib/swarm/credits.ts`** *(NEW)* — `getCreditBalance`, `consumeCredit` (atomic `WHERE swarm_credits > 0 RETURNING`), `addCredits` helpers.
- **`src/app/api/stripe/credits/checkout/route.ts`** *(NEW)* — `POST /api/stripe/credits/checkout` — auth-gated Stripe Checkout session for credit packs. 1 pack = 10 swarm executions, quantity clamped 1–50.
- **`src/app/api/stripe/webhook/route.ts`** *(UPDATED)* — Added credit purchase handler: checks `metadata.type === "swarm_credits"`, atomic increment via `sql`, PostHog `credits_purchased` tracking.
- **`src/app/api/swarm/launch/route.ts`** *(UPDATED)* — Falls through to `consumeCredit()` when plan limit exceeded. Tracks `credit_consumed` PostHog event.
- **`src/app/actions/swarm-credits.ts`** *(NEW)* — `getSwarmCredits()` server action for dashboard.
- **`src/components/dashboard/SwarmUsageBar.tsx`** *(UPDATED)* — Credit balance display with Coins icon, "Buy More" button (always visible for limited plans), loading spinner, error toast, success toast on Stripe redirect with URL param cleanup.
- **`src/db/schema.ts`** *(UPDATED)* — Added `swarmCredits` integer column (default 0) to users table.
- **`scripts/check-env.ts`** *(UPDATED)* — Added `STRIPE_CREDITS_PRICE_ID`.
- **`src/messages/{en,ro,fr,de}.json`** *(UPDATED)* — Added `credits_extra`, `credits_buy`, `credits_purchase_success` across all 4 locales.
- **`drizzle/0007_swarm_credits.sql`** *(NEW)* — Migration adding `swarm_credits INTEGER` column.

---

### 📥 Bulk CSV Import — Batch Prospect Upload

- **`src/app/api/prospects/import/route.ts`** *(NEW)* — `POST /api/prospects/import` — auth-gated, receives CSV via FormData, parses with papaparse, validates columns (name/company required, email/goal/tone/url optional), 2MB max / 100 row limit, creates campaigns via `createCampaign()`. PostHog `bulk_import_completed` tracking.
- **`src/components/dashboard/BulkImportDialog.tsx`** *(NEW)* — Multi-step dialog: drag & drop CSV → preview table → progress bar → success stats + error details. Client-side papaparse preview + sample CSV download. Fully i18n'd with `t()`.
- **`src/app/[locale]/dashboard/page.tsx`** *(UPDATED)* — Added "Import CSV" button (dashed emerald border) next to "New Campaign", opens BulkImportDialog.
- **`src/messages/{en,ro,fr,de}.json`** *(UPDATED)* — 30 new `dashboard.bulk_import_*` keys across all 4 locales.
- **`package.json`** *(UPDATED)* — Added `papaparse` + `@types/papaparse` dependencies.

**TypeScript: 0 errors** ✅ | **i18n: all 4 locales match** ✅

---

### 🔗 LinkedIn Sales Navigator Integration (Proxycurl)

- **`src/lib/proxycurl/client.ts`** *(NEW)* — Proxycurl API client with `fetchLinkedinProfile(url)` and `searchLinkedinProfile(name, company?)`. Graceful env-var-missing handling.
- **`src/app/api/prospects/linkedin/route.ts`** *(NEW)* — `POST /api/prospects/linkedin` — two modes: enrich by LinkedIn URL or search by name+company. Auth + tiered rate limit via `getUserWithPlan`.
- **`src/components/dashboard/NewProjectDialog.tsx`** *(UPDATED)* — Added LinkedIn import section: paste URL → fetch profile → auto-fill name/company/goal. Loading spinner, error handling, keyboard support (Enter). PostHog `linkedin_import_success` tracking.
- **`src/messages/{en,ro,fr,de}.json`** *(UPDATED)* — 19 new `linkedin.*` keys across all 4 locales.
- **`scripts/check-env.ts`** *(UPDATED)* — Added `PROXYCURL_API_KEY`.

---

### 📊 Email Tracking Dashboard Panel

- **`src/app/actions/email-tracking.ts`** *(NEW)* — `getEmailTrackingStats(campaignId?)` server action. Aggregates sent/opens/clicks/engagement rates + recent events from `emailEvents` table.
- **`src/components/dashboard/EmailTrackingPanel.tsx`** *(NEW)* — Dashboard panel with 4-metric grid (sent/opens/clicks/engagement), recent events timeline with type-colored dots, loading spinner. Fully i18n'd.
- **`src/app/[locale]/dashboard/page.tsx`** *(UPDATED)* — EmailTrackingPanel wired below campaign list.
- **`src/messages/{en,ro,fr,de}.json`** *(UPDATED)* — 6 new `email_tracking.*` keys across all 4 locales.

---

### ⚡ Inngest Queue System — Async Swarm Execution

- **`src/lib/inngest/client.ts`** *(NEW)* — Inngest client with graceful fallback when `INNGEST_EVENT_KEY` is missing.
- **`src/lib/inngest/functions.ts`** *(NEW)* — `executeSwarm` background function: 3 retries, throttle (3/60s per user), priority per plan (PRO=100, STARTER=50, FREE=10). Executes swarm graph in `step.run`, saves results via Supabase.
- **`src/app/api/inngest/route.ts`** *(NEW)* — Inngest serve endpoint at `/api/inngest`.
- **`src/app/api/swarm/launch/route.ts`** *(UPDATED)* — Sends to Inngest queue when `INNGEST_EVENT_KEY` is set, falls back to inline execution otherwise. Fixes Vercel 60s timeout for large swarms.
- **`scripts/check-env.ts`** *(UPDATED)* — Added `INNGEST_EVENT_KEY` and `CRON_SECRET_KEY`.
- **`package.json`** *(UPDATED)* — Added `inngest` dependency.

---

### 🔒 SOC 2 / GDPR Trust Page (i18n Refactor)

- **`src/app/[locale]/security/page.tsx`** *(REWRITTEN)* — All strings now use `t()` i18n calls. 7 sections: SOC 2, GDPR, Encryption, Data Processing, Retention, Subprocessors, Contact. Removed dead `Server` import.
- **`src/messages/{en,ro,fr,de}.json`** *(UPDATED)* — 15 new `security.*` keys across all 4 locales.

---

### 🚀 CI/CD Pipeline — GitHub Actions

- **`.github/workflows/ci.yml`** *(NEW)* — PR workflow: TypeScript check + ESLint. Publish workflow triggered by release. Matrix support for future test sharding.

---

### 📊 Campaign Analytics — Recharts Dashboard

- **`src/app/actions/analytics.ts`** *(NEW)* — Server action `getCampaignAnalytics(campaignId?)` aggregating OCEAN scores, agent performance, reply/open/click rates, confidence over time from Supabase.
- **`src/components/dashboard/CampaignAnalytics.tsx`** *(NEW)* — Recharts-powered panel: horizontal bar chart (agent performance), radar chart (OCEAN profile), line chart (confidence trend), engagement stat cards. Per-bar coloring via `<Cell fill />`. Fully i18n'd.
- **`src/app/[locale]/dashboard/page.tsx`** *(UPDATED)* — CampaignAnalytics wired below email tracking panel.
- **`src/messages/{en,ro,fr,de}.json`** *(UPDATED)* — 8 new `analytics.*` keys.

---

### 🎯 Onboarding Checklist — Gamified Progress

- **`src/components/dashboard/OnboardingChecklist.tsx`** *(NEW)* — Animated checklist with progress bar, 4 milestone tasks (Profile, Swarm, Vault, War Room), unlockable feature badges, motion-powered item transitions. Fetches from `/api/user/progress`.
- **`src/app/[locale]/dashboard/page.tsx`** *(UPDATED)* — OnboardingChecklist wired at top of dashboard.
- **`src/messages/{en,ro,fr,de}.json`** *(UPDATED)* — 10 new `checklist.*` keys.

---

### 📝 Blog SEO — B2B Psychology Content

- **`src/app/[locale]/blog/page.tsx`** *(NEW)* — Blog index with 6 B2B psychology articles (OCEAN profiling, reciprocity, calibrated email, AI specialization, SDR burnout, deliverability guide). Hero with badge, article cards with hover lift.
- **`src/app/[locale]/blog/[slug]/page.tsx`** *(NEW)* — Dynamic blog post page. Renders full article body from i18n keys. "Coming soon" placeholder, back navigation, CTA section.
- **`src/messages/{en,ro,fr,de}.json`** *(UPDATED)* — 28 new `blog.*` keys including article titles, excerpts, and full body text.

---

### 🆕 Sidebar Changelog Badge

- **`src/components/layout/CommandSurface.tsx`** *(UPDATED)* — Added 'NEW' badge (red pill with pulse animation) to "Changelog" nav item linking to `/changelog`.

---

### 📇 Prospect Database — OCEAN History & Search

- **`src/db/schema.ts`** *(UPDATED)* — Added `prospects` table: name, email, company, title, linkedinUrl, oceanoScores (JSONB), tags, notes, userId FK with cascade delete.
- **`drizzle/0008_prospects.sql`** *(NEW)* — Migration with indexes on userId + email.
- **`src/app/actions/prospects.ts`** *(NEW)* — Server actions: `listProspects(userId, search?)` (search by name/email/company), `getProspect(id)`, `upsertProspect(data)`, `deleteProspect(id)`. All auth-gated.
- **`src/components/dashboard/ProspectsList.tsx`** *(NEW)* — Interactive prospect list: search with 300ms debounce, expandable rows with OCEAN mini-bars (5 personality dimensions color-coded), tags, delete with confirmation, motion-powered expand/collapse. Fully i18n'd.
- **`src/app/[locale]/dashboard/page.tsx`** *(UPDATED)* — ProspectsList wired below campaign list.
- **`src/messages/{en,ro,fr,de}.json`** *(UPDATED)* — 12 new `prospects.*` keys.

---

### 🧠 AI Coaching — Aurelius Campaign Insights

- **`src/app/actions/coaching.ts`** *(NEW)* — Server action `getCoachingInsights(userId, campaignId?)`: analyzes email event patterns (open rate, reply rate, click rate) + campaign data, returns 4 insight cards with type, title, body, confidence %, actionable bool.
- **`src/components/dashboard/CoachingInsights.tsx`** *(NEW)* — Aurelius coaching panel: summary pills (campaigns/opens/replies/top agent), insight cards with type-colored icons (lightbulb/target/trending-up/zap/alert), confidence % bar, CTA link, animated entrance. Fully i18n'd.
- **`src/lib/aurelius/tools/db-runner.ts`** *(UPDATED)* — Added `get_campaign_insights` tool: queries emailEvents + campaigns from Supabase for pattern analysis. Added `upsert_prospect` for DB-backed prospect persistence from swarm context.
- **`src/lib/aurelius/tools/definitions.ts`** *(UPDATED)* — Added tool schemas for `get_campaign_insights` and `upsert_prospect`.
- **`src/lib/aurelius/prompt.ts`** *(UPDATED)* — Coaching capabilities section: Aurelius now proactively analyzes campaign patterns and suggests optimizations.
- **`src/app/[locale]/dashboard/page.tsx`** *(UPDATED)* — CoachingInsights wired below analytics.
- **`src/messages/{en,ro,fr,de}.json`** *(UPDATED)* — 11 new `coaching.*` keys.

---

### 🔧 i18n Fixes

- **`src/messages/ro.json`** *(FIXED)* — Renamed `blog.why-personalized-emails-work_excerpt/_body` → `why-personalized-emails_excerpt/_body` to match en.json reference.
- **`src/messages/fr.json`** *(FIXED)* — Same blog key naming fix.
- **`src/messages/de.json`** *(FIXED)* — Same blog key naming fix + restored accidentally-removed `dashboard.no_campaigns` and `dashboard.no_campaigns_hint` keys.

---

### 🧪 Trial 14 Zile PROFESSIONAL — Auto-activare la Signup

- **`src/lib/auth/auth.ts`** *(UPDATED)* — La creare cont: `trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)`. Coloana `trialEnd` salvată în `users`.
- **`src/db/schema.ts`** *(UPDATED)* — Coloana `trialEnd: timestamp("trial_end")`.
- **`drizzle/0003_trial_end.sql`** *(NEW)* — Migrare pentru coloana `trial_end`.
- **`src/components/dashboard/TrialBanner.tsx`** *(NEW)* — Banner în dashboard: zile rămase din trial, CTA upgrade când expiră. PostHog `trial_started` tracking la signup.
- **`src/app/[locale]/(auth)/sign-up/page.tsx`** *(UPDATED)* — `posthog.capture('trial_started', { plan: 'PROFESSIONAL' })` la signup email + Google.

---

### 📋 Waitlist — Early Bird Access

- **`src/app/[locale]/waitlist/page.tsx`** *(NEW)* — Pagină de waitlist cu formular email + name + source. Early bird: primii 100 primesc 3 luni STARTER gratuit.
- **`src/app/api/waitlist/route.ts`** *(NEW)* — `POST /api/waitlist` — rate limit 3/ora per IP, salvare în `waitlist` table.
- **`src/db/schema.ts`** *(UPDATED)* — Tabel `waitlist` (email, name, source, createdAt).
- **`src/app/[locale]/waitlist/loading.tsx`** *(NEW)* — Loading state.
- **`src/app/[locale]/waitlist/error.tsx`** *(NEW)* — Error boundary.

---

### 🚀 Product Hunt Launch Page

- **`src/app/[locale]/launch/page.tsx`** *(NEW)* — Pagină dedicată lansării Product Hunt: hero cu badge "Launching on Product Hunt", 6 key differentiators, 4-step how-it-works, 3 testimoniale beta, CTA early access.
- **`src/app/[locale]/launch/error.tsx`** *(NEW)* — Error boundary.

---

### 📊 PostHog Funnels — Conversie Tracking

- **`src/lib/analytics/funnels.ts`** *(NEW)* — 4 funnel-uri definite + documentate: Signup→Upgrade, Trial→War Room→Paid, Pricing→Checkout→Paid, Waitlist→Signup→First Swarm. Setup instructions. `TRACKED_EVENTS` reference cu locațiile tuturor evenimentelor.

---

### 💬 In-App Feedback Widget

- **`src/components/ui/feedback-widget.tsx`** *(NEW)* — Buton flotant "Give feedback" cu popover: rating 1-5 stele + text. Trimite la `POST /api/feedback`.
- **`src/app/api/feedback/route.ts`** *(NEW)* — Salvează feedback în DB cu userId, rating, text.

---

### ⭐ Testimoniale + Case Studies

- **`src/components/ui/testimonials-section.tsx`** *(NEW)* — Secțiune reutilizabilă cu 4 testimoniale animate: quote i18n, metric badge (reply rate / open rate / time saved / meetings booked), hover lift.
- **`src/app/[locale]/page.tsx`** *(UPDATED)* — TestimonialsSection integrat pe landing page.
- **`src/messages/{en,ro,fr,de}.json`** *(UPDATED)* — 12 keys `home.testimonials.*`.

---

### ⚖️ Comparison Page — MailMind vs Competitori

- **`src/app/[locale]/compare/page.tsx`** *(NEW)* — Pagină de comparație: MailMind vs Lemlist / Apollo / Clay. Tabel comparativ: AI agents, OCEAN profiling, Digital Twin, War Room, pricing, etc.
- **`src/app/[locale]/compare/error.tsx`** *(NEW)* — Error boundary.

---

### 💰 Cost Monitoring — OpenAI Token Usage

- **`src/app/api/admin/cost-monitoring/route.ts`** *(NEW)* — `GET /api/admin/cost-monitoring?key=<CRON_SECRET_KEY>` — agregare zilnică token usage + cost per user/tier. Compară cost vs revenue. Cron job-ready.
- **`scripts/check-env.ts`** *(UPDATED)* — Added `CRON_SECRET_KEY`.

---

**TypeScript: 0 errors** ✅ | **i18n: all 4 locales match** ✅

---

## [Unreleased] — 2026-05-22

### 🎨 UI Component Audit — All Remaining Components Uniformized

Audited and fixed ALL remaining UI components that still used semantic CSS variables (`bg-popover`, `bg-accent`, `bg-muted`, `text-muted-foreground`, `bg-background`, `border-input`, `ring-ring`, `bg-border`). These resolved to dark theme by default (`:root`) and only worked correctly inside `.dashboard-light`.

Now all components use explicit warm theme colors everywhere:

#### Files changed:
- **accordion.tsx** — `text-muted-foreground` → `text-gray-400` (chevron icon)
- **popover.tsx** — `bg-popover text-popover-foreground` → `bg-white text-[#1a1a1a]`, `text-foreground` → `text-[#1a1a1a]`, `text-muted-foreground` → `text-gray-500`, header/footer borders → `border-gray-100`, added `border-gray-200 shadow-lg rounded-xl`
- **select.tsx** — `border-input bg-transparent` → `border-gray-200 bg-white`, `ring-ring` → `ring-[#ff5f5f]/30`, `bg-popover text-popover-foreground` → `bg-white text-[#1a1a1a]`, items: `focus:bg-accent` → `focus:bg-[#ff5f5f]/10 focus:text-[#ff5f5f]`, separator: `bg-muted` → `bg-gray-100`
- **dropdown-menu.tsx** — Content/SubContent: `bg-popover text-popover-foreground` → `bg-white text-[#1a1a1a] border-gray-200 rounded-xl shadow-lg`. Items/triggers: `focus:bg-accent` → `focus:bg-[#ff5f5f]/10 focus:text-[#ff5f5f]`. Separator: `bg-muted` → `bg-gray-100`. Label: added `text-xs text-gray-500`
- **menubar.tsx** — Root: `bg-background` → `bg-white border-gray-200 rounded-lg`. All interactive items: `focus:bg-accent focus:text-accent-foreground` → `focus:bg-[#ff5f5f]/10 focus:text-[#ff5f5f]`. Content/SubContent: warm + `rounded-xl`. Separator/shortcut/label updated
- **navigation-menu.tsx** — Trigger style: `bg-background hover:bg-accent` → `bg-white hover:bg-[#ff5f5f]/10 hover:text-[#ff5f5f]`. Viewport: `bg-popover` → `bg-white border-gray-200 rounded-xl shadow-lg`. Indicator: `bg-border` → `bg-gray-200`

### 🎨 UI Component Audit — Warm Theme Uniformization (earlier)

Audited and fixed ALL UI components that still used old `dark:` variants, CSS variables (`var(--border-subtle)`, `var(--obsidian-light)`), or dark glassmorphism patterns.

#### Files changed:
- `dialog.tsx` — `var(--border-subtle)`/`var(--obsidian-light)` → `border-gray-200`/`bg-white` + `shadow-2xl` + `rounded-2xl`
- `tooltip.tsx` — Same CSS var → warm white replacement
- `button.tsx` — Removed ALL `dark:` variants across `outline`, `ghost`, `destructive` variants. `focus-visible` ring uses `#ff5f5f`. Destructive → `bg-red-50`/`text-red-600`
- `input.tsx` — Removed `dark:` variants. `border-gray-200`/`bg-white`, focus ring uses `#ff5f5f`
- `toolbar.tsx` — Dark glassmorphism (`bg-black/60`, `border-white/10`, `text-white/60`) → warm light (`bg-white/90`, `border-gray-200`, `text-gray-400`)
- `the-future-arrives-soon-cta.tsx` — Complete rewrite: dark `bg-[#1a1a1a]` → warm `bg-[#fdfbf7]`, cartoonish shadows (`shadow-[8px_8px_0px_#1a1a1a]`), time units with border-2 + hover lift
- `alert.tsx` — Replaced `dark:border-destructive` with `border-red-300`
- `api-limit-notification.tsx` — Removed `dark:bg-amber-950/50` and `dark:border-red-800`
- `logo-cloud-4.tsx` — Removed `dark:brightness-0 dark:invert`
- `NotFoundPage.tsx` — Buttons from `bg-[#1a1a1a]` → `bg-[#ff5f5f]` with warm shadows

## [Unreleased] — 2026-05-22 (earlier)

### 🎯 Dashboard Simplificat + Tema Cartoonish

#### `src/app/[locale]/dashboard/page.tsx` *(REWRITE)*
Dashboard complet simplificat, conectat la date reale din Supabase:
- Salut: doar "Buna ziua/dimineata/seara, {nume}" din sesiune
- Ceas/data in colt dreapta-sus, font mono compact
- Statistici transformate in pastile compacte cu emoji
- Pipeline ascuns default (collapsible) cu progress bar gradient colorat + iconite animate
- Doar ultimele 2 campanii afisate in carduri calde cu hover animations, confidence emoji, status pulsing dot
- Empty state pentru 0 campanii cu emoticon animat
- Activitate + grafic eliminate complet
- Termene colapsabile
- Layout fara scroll: `h-[calc(100vh-65px)]`
- Date reale din `getDashboardData()` (Supabase) in loc de mock CAMPAIGNS

#### Landing Page — Tema Cartoonish
- Hero: buton "AI-powered" gradient purple/pink, sparkles animate, badge "FREE" pe Watch Demo
- Pricing: toggle lunar/anual cu switch animat + sparkles, badge MOST POPULAR cu plutire (motion.span wrapper separat), floating shapes animate in background
- CTA: gradient multicolor cu emoticoane plutitoare, trust badges animate
- Features: carduri cu hover glow, iconite se rotesc la hover
- Demo: progress bar animata cu puncte pulsand, carduri colorate cu hover lift
- Differentiation: radar chart OCEAN animat
- FAQ: iconite Zap se rotesc la hover in accordion

#### Search Components — Tema Calda
- `animated-glowing-search-bar.tsx`: tema dark → light calda, accent `#ff5f5f`, glow cartoonish pe focus
- `omni-command-palette.tsx`: HSL variables → culori statice calde, functii moarte eliminate (`useIsDarkMode`, `ThemeIndicator`)
- `search-overlay.tsx`: backdrop + text in romana

#### Sidebar + Avatar Popup
- Founder Mode eliminat din sidebar NAV_ITEMS (vizibil doar admin in popup-ul de avatar)
- Avatar popup in Header: Settings, Account, Founder Mode (doar admin), Sign Out

#### Mentenanta + Middleware
- `src/middleware.ts`: redirect non-admin la `/maintenance` cand modul e activ
- `src/app/api/admin/maintenance/route.ts`: toggle mentenanta via Redis
- `src/app/actions/admin.ts`: `isUserAdmin()` + `toggleMaintenanceMode()` server actions
- `src/app/[locale]/maintenance/page.tsx`: pagina de mentenanta cu countdown animat

#### `src/messages/{en,ro}.json` *(MODIFIED)*
- Traduceri CTA + trust badges actualizate
- Adaugat `no_campaigns`, `no_campaigns_hint` pentru empty state

**TypeScript: 0 erori**

---

## [Unreleased] — 2026-05-18

### 🔒 Security Hardening — Full Infrastructure Audit

#### `src/lib/rate-limit.ts` *(NEW)*
Redis sliding-window rate limiter cu pipeline-uri atomice și fail-open pattern:
- Pre-configured limiters: login (5/min), signup (3/min), password reset (3/10min), API (100/min), AI (10/min), upload (5/min)
- Atomic operations via Redis sorted sets + pipelines, auto-expiry

#### `src/middleware.ts` *(NEW)*
API gateway middleware:
- Rate limiting aplicat pe auth endpoints (login, signup, password reset)
- Security headers: CSP strict, HSTS (production), X-Content-Type-Options, X-Frame-Options
- X-Request-Id injection pentru request tracing

#### `src/lib/auth/auth.ts` *(MODIFIED)*
- Email verification activat cu Resend sender
- Sesiuni: 7 zile expiry, 1 zi updateAge, max 5 sesiuni active
- Built-in rate limiting: 100 req/60s
- Migration comment pentru userii existenți (`email_verified`)

#### `src/lib/auth/gatekeeper.ts` *(MODIFIED)*
- Adăugat `apiRequireAuth` și `verifyOwnership` helpers
- Audit logging pe auth failures (session missing, user not found)
- `checkFeatureAccess` și `getPlanLimits` pentru verificări de plan

#### `supabase/migrations/20260508000004_api_usage_rls.sql` *(NEW)*
Row-Level Security pe API usage:
- Tabel `api_usage` — tracking per request (user_id, endpoint, method, tokens_used, status_code, ip_address)
- Tabel `api_usage_daily` — agregări zilnice pre-calculate
- RLS policies SELECT-only (`user_id = auth.uid()`) — aplicația scrie via service role
- Indexes: user_id + created_at, user_id + date, endpoint + date

#### API Routes securizate *(7 fișiere)*
Rute care erau fără auth — acum folosesc `apiRequireAuth` + ownership checks:
- `swarm/approve/route.ts`, `swarm/resume/route.ts`, `swarm/launch/route.ts`
- `war-room/sequence/route.ts`, `war-room/ab-test/route.ts`
- `rag/ingest/route.ts`, `aurelius/chat/route.ts`
- Input size limits adăugate (topic max 500, context max 5000)

**TypeScript: 0 erori**

---

### 💰 Pricing — Discount + Most Popular Badge

#### `src/app/[locale]/pricing/page.tsx` *(MODIFIED)*
- Starer tier: preț $29 cu `originalPrice: "$49"` tăiat (line-through) — efect de reducere
- Badge "MOST POPULAR" cu iconiță `Crown` 👑 pe tier-ul din mijloc
- Interfață `Tier` TypeScript (fără `any` casts)
- `originalPrice` salvat și în i18n keys

#### `src/app/[locale]/page.tsx` *(MODIFIED)*
- Aceeași logică de discount aplicată în secțiunea Pricing de pe landing page
- Badge "MOST POPULAR" + `Crown` icon

#### `src/messages/{en,ro,de,fr}.json` *(MODIFIED)*
- Adăugat `original_price: "$49"` în `pricing.tier_starter` și `home.pricing.pro`

**TypeScript: 0 erori**

---

### 🎬 Animated Hero Component

#### `src/components/ui/animated-hero.tsx` *(NEW)*
Componentă hero cu cuvinte rotative animate:
- 5 cuvinte: "personalized", "researched", "calibrated", "converting", "team-written"
- Animație spring framer-motion (sus/jos, fade in/out)
- Brand styling: gradient `#ff5f5f` → purple, butoane către demo + sign-up
- Acceptă `locale` prop opțional pentru link-uri corecte

#### `src/app/[locale]/page.tsx` *(MODIFIED)*
- Hero-ul vechi `HeroSection` + `FloatingParticles` eliminate (cod mort)
- Înlocuite cu `<Hero locale={l} />` din animated-hero
- Importuri nefolosite curățate (`useEffect`, `Play`)

**TypeScript: 0 erori**

---

### 🦶 Reusable Footer Component

#### `src/components/ui/footer.tsx` *(NEW)*
Footer reutilizabil cu i18n, acceptă:
- `columns` — array de `FooterColumn` (titleKey + links cu href/labelKey)
- `socialLinks` — array de string-uri (i18n keys)
- `brandName` — opțional, default "MailMind"
- Logo animat cu hover rotation (spring), link-uri cu underline animat

#### `src/app/[locale]/page.tsx` *(MODIFIED)*
- Footer-ul inline eliminat, înlocuit cu `<Footer locale={l} columns={LANDING_FOOTER_COLUMNS} socialLinks={LANDING_SOCIAL_LINKS} />`

#### `src/app/[locale]/pricing/page.tsx` *(MODIFIED)*
- Footer-ul inline eliminat, înlocuit cu `<Footer locale={l} columns={FOOTER_COLUMNS} socialLinks={SOCIAL_LINKS} />`

**TypeScript: 0 erori**

---

### 📊 Dashboard Redesign — Campaign Writing Studio

#### `src/app/[locale]/dashboard/page.tsx` *(COMPLETE REWRITE)*

Dashboard transformat din CRM/outlook în studio de campanii AI:

**Pipeline Stages** — 4 carduri animate:
- Research (emerald), Draft (amber), Review (indigo), Send (rose)
- Fiecare cu icon, count, progress bar, hover lift + box shadow
- Stage mapping corect: draft/active/review/complete → pipeline keys

**Active Campaigns** — listă în loc de "Your roster":
- Nume campanie + companie + dată + status dot + confidence bar
- Link către War Room per campanie
- Status dots colorate (active=roșu, review=amber, draft=gri, complete=verde)
- Empty state cu icon Target

**Swarm Activity Feed** — conectat la `useSwarmStore.traceLogs`:
- Agent-specific icons (Search/Brain/Target/PenTool) + culori
- Timestamp formatat, nume agent, mesaj
- Scroll personalizat, max 8 mesaje, reverse chronological

**Dynamic Greeting** — `authClient.useSession()`:
- Salut bazat pe ora zilei (morning/afternoon/evening)
- Nume user din session (nu hardcodat "Bogdan")
- Agent count bazat pe plan (FREE=1, STARTER=2, PRO=4)

**Metrics Row** — derivat din date:
- Emails drafted, avg confidence, active agents, total campaigns
- 4 coloane cu iconițe colorate

**Păstrat:**
- Weekly chart (recharts AreaChart cu gradient)
- EventScheduler pentru deadlines
- NewProjectDialog integrat

**TypeScript: 0 erori** — `counts` cu null coalescing, `User` cast eliminat

---

### 🌐 Dashboard i18n — 4 Limbi

#### `src/messages/{en,ro,de,fr}.json` *(MODIFIED)*
Adăugate ~30 de chei noi în namespace-ul `dashboard`:
- `greeting_morning/afternoon/evening`, `agents_awake/asleep`, `new_campaign`
- `pipeline_label/title/highlight` + 4 stage names + descriptions
- `campaigns_*` (label, title, highlight, view_all, empty, status_*)
- `activity_*` (label, title, highlight, empty)
- `chart_title/insight/attribution`, `deadlines_label/title`
- `metrics_emails/confidence/agents/campaigns`

**TypeScript: 0 erori**

---

## [Unreleased] — 2026-05-17

### 🌐 Internationalization — Full i18n Migration

ALL text across ALL pages migrated to use the `t()` translation hook from `@/components/I18nProvider`. Text is no longer hardcoded — everything translates based on the URL locale prefix (`/ro/...`, `/en/...`, `/fr/...`, `/de/...`).

#### `src/messages/en.json`, `ro.json`, `fr.json`, `de.json` *(FULL)*
Fișiere comprehensive cu TOATE cheile de traducere:
- **home** — Hero, Features, Demo Steps, Differentiation, Pricing, FAQ, CTA, Footer
- **pricing** — Hero, Cards, Comparison Table, FAQ, CTA, Footer
- **demo** — Steps, Agents, Actions, Email Preview, Stats
- **auth** — Form labels, buttons, error messages, quotes
- **notFound** — Ghost text, action buttons
- **common** — Navigation, shared labels
- **onboarding** — Aurelius bubbles, step labels, form fields, tone options, brand values, pain points, tool cards
- Toate textele rămase în engleză traduse complet în **franceză** și **germană**
- `brand_values`, `pain_labels`, `tone_options`, `tool_titles/descriptions/features` adăugate și în **română**

#### `src/app/[locale]/page.tsx` *(MODIFIED)*
- Header, Hero, Features, Demo, Differentiation, Pricing, FAQ, CTA, Footer → totul prin `t()`

#### `src/app/[locale]/pricing/page.tsx` *(MODIFIED)*
- Header, Hero, Cards, Comparison, FAQ, CTA, Footer → totul prin `t()`

#### `src/app/[locale]/demo/page.tsx` *(MODIFIED)*
- Steps, Agents, Actions, Email, Stats → totul prin `t()`

#### `src/app/[locale]/(auth)/sign-up/page.tsx` / `login/page.tsx` *(MODIFIED)*
- Form labels, toast messages → prin `t()`

#### `src/components/ui/auth-fuse.tsx` *(MODIFIED)*
- Form labels, buttons, toggles, quotes → prin `t()`

#### `src/components/ui/NotFoundPage.tsx` *(MODIFIED)*
- Ghost text, buttons → prin `t()`

#### `src/app/[locale]/loading.tsx` *(MODIFIED)*
- Loading text → prin `t()`

#### `src/app/[locale]/onboarding/page.tsx` *(MODIFIED)*
- Rescris complet: Aurelius bubbles, labels, placeholders, hints, tone options, brand values, pain points, tool cards, buttons, toasts, step counter → **TOATE** prin `t()`

**TypeScript: 0 erori**

---

### 🚀 Live Demo Page

#### `src/app/[locale]/demo/page.tsx` *(NEW)*
Pagină interactivă de demo care simulează flow-ul MailMind:

**Input stage:**
- 3 quick-pick prospects (Sarah Chen / Marcus Webb / Priya Patel) cu avatar + company
- Custom name + company input fields
- Divider între preset și custom
- Buton Launch Demo cu numele prospectului afișat

**Agent Pipeline (animație):**
- 4 AI agents activați secvențial (Researcher → Psychologist → Strategist → Copywriter)
- Fiecare agent: icon animat, nume, status (waiting → working → done cu checkmark)
- Progress bar per agent (2s fill animation)
- Live status bar cu text dinamic (`Working on {agent}...` / `Finalizing your text...`)
- Prospect info badge în centru
- Colaborare/finalizare mesaje glisante

**Email Preview:**
- Success banner cu Sparkles + animate
- Agent recap badges (toți 4 cu checkmark)
- Email card: header (to, company, clock), body text (formatat pentru Sarah Chen), acțiuni (Try Again / Try MailMind Free)
- Stats grid: 12s processing time, 4 agents, 93% confidence
- Bottom CTA section după finalizare

**UX:**
- Step indicator cu 3 pași (Enter → Process → Ready), checkmark pe completat
- AnimatePresence pentru tranziții între pași
- Reset complet la Try Again
- Header cu MailMind logo + Live Demo badge + Sign Up CTA
- Toate textele traduse prin i18n

**TypeScript: 0 erori**

---

### 🌍 Language Switcher

#### `src/components/ui/language-switcher.tsx` *(NEW)*
Componentă dropdown reutilizabilă:
- 4 limbi: Română 🇷🇴, English 🇬🇧, Français 🇫🇷, Deutsch 🇩🇪
- Afișare label complet pe desktop, doar flag pe mobile
- Active language indicator cu bulină roșie
- Animații: dropdown scale+fade la deschidere/închidere, ChevronDown rotate
- Outside-click-to-close + Escape-key-to-close
- Schimbă prefixul URL pentru a schimba limba (ex: `/ro/pricing` → `/en/pricing`)

#### `src/app/[locale]/page.tsx` *(MODIFIED)*
- Adăugat în header-ul desktop (între nav links și auth buttons)
- Adăugat în mobile menu (secțiune "Language" cu separator)

#### `src/app/[locale]/pricing/page.tsx` *(MODIFIED)*
- Adăugat în header-ul desktop și mobile menu

#### `src/app/[locale]/page.tsx` *(MODIFIED)*
- Eliminat textul "The AI Swarm for Outreach" din HeroSection badge
- Curățat wrapper-ul motion.div rămas gol

**TypeScript: 0 erori**

---

### 🐛 Error Pages

#### `src/app/[locale]/not-found.tsx` *(MODIFIED)*
- Pagina 404 cu fantomă + butoane traduse prin i18n

#### `src/app/[locale]/error.tsx` *(MODIFIED)*
- Pagina de eroare cu fantomă + Try Again button

**TypeScript: 0 erori**

### 🛠 Standalone War Room Tools Page

#### `src/app/[locale]/dashboard/tools/page.tsx` *(NEW)*
Pagină separată pentru toate tool-urile speciale, accesibilă din sidebar:
- **UpgradeGate** — blochează accesul utilizatorilor non-PROFESSIONAL cu feature list + CTA
- **Quick-jump pills** — row de badge-uri colorate (A/B Test, Sequence Builder, Send Test, Export) ca navigare rapidă
- **SpecialTools unificat** — panelul complet cu tool grid + panouri expandabile (generate A/B variants, build sequence, send test, export options)
- Header cu time-based greeting + tool badge animat
- Locale propagat corect la toate link-urile

#### `src/components/tools/SpecialTools.tsx` *(NEW)*
Componentă partajată extrasă din war-room page:
- `SPECIAL_TOOLS` constant array exportat (A/B Test, Sequence Builder, Send Test, Export Campaign)
- `ToolCard` type exportat pentru reutilizare
- `SortableStep` — drag-and-drop reorder cu `@dnd-kit/sortable` (mutat la nivel de modul)
- `SpecialTools` — tool grid + 4 panouri interactive cu A/B generation, Sequence builder, Send test, Export options

#### `src/components/layout/CommandSurface.tsx` *(MODIFIED)*
- Adăugat `'Tools'` în `NAV_ITEMS` cu icon `Wrench`, href `/dashboard/tools`
- Adăugat `Wrench` la importul lucide-react

#### `src/app/[locale]/dashboard/war-room/[id]/page.tsx` *(MODIFIED)*
- Acum importă `SpecialTools` din `@/components/tools/SpecialTools` în loc de definiție inline
- Importurile dnd-kit rămân doar în componenta partajată

**TypeScript: 0 erori**

---

### 🤖 Aurelius Tool Calling System

Aurelius (dashboard AI assistant) can now **search, read, and explore the codebase** directly via OpenAI function calling.

#### `src/lib/aurelius/tools/definitions.ts` *(NEW)*
5 tool schemas in OpenAI-compatible format:
- `search_codebase` — grep-based regex search (file pattern filter, max results configurable)
- `read_files` — read up to 5 files with path-traversal protection
- `list_directory` — list contents with icons + file sizes
- `search_files_by_name` — `find`-based glob search (excludes `node_modules`/`.git`/`.next`)
- `write_file` — create/overwrite files (gated by `getToolDefinitions(true)`)
- `getToolDefinitions(includeWrite?)` — safety filter excludes `write_file` by default

#### `src/lib/aurelius/tools/runner.ts` *(NEW)*
Tool execution engine:
- `executeToolCall(toolCall)` — single entry point dispatching to 5 implementations
- Shell command execution via `execSync` with timeouts + error capture
- ANSI stripping for grep output, file-grouped results formatting
- Safe path resolution prevents traversal outside project root

#### `src/app/api/aurelius/chat/route.ts` *(MODIFIED)*
Two-phase flow:
1. **Non-streaming call** with `tool_choice: 'auto'` — model decides whether to call tools
2. If tool calls: execute each → pass results back → **streaming call** with full context
3. If no tool calls: wrap text in a stream for client compatibility
4. Fallback for models without tool support (opt-out blocklist: `o1-mini`, `o1-preview`, `o3-mini`)
5. Error handling: tool failures are sent back to the model for graceful responses

#### `src/lib/aurelius/prompt.ts` *(MODIFIED)*
- Added **🧰 Tool Calling** capabilities section with all 5 tools + usage guidelines
- Brand profile now dynamically injected into system prompt (name, industry, tone, audience, values, pain points)
- "User's Brand Profile" section shown only when data exists
- Personality/tone guidelines updated with proactive, context-aware instructions

---

### 💬 Chat History Persistence

#### `src/stores/aureliusStore.ts` *(MODIFIED)*
- **Zustand `persist` middleware** — saves conversation history to `localStorage` under key `aurelius-history`
- `partialize: (state) => ({ history })` — persists only messages, not transient UI state (`isOpen`, `streamingContent`, etc.)
- `merge` callback — rehydrates history on load with `_hydrated: true` flag
- `migrate` with versioning (v1) for future format migrations
- `clearHistory()` — clears localStorage + resets to welcome message
- Extracted `WELCOME_MESSAGE` constant, SSR-safe with `typeof window` guard

---

### 🚪 Onboarding Guard

#### `src/components/layout/CommandSurface.tsx` *(MODIFIED)*
- **Onboarding redirect guard** — `authClient.useSession()` in Header checks `onboardingComplete`
- If session exists but `onboardingComplete` is falsy → `window.location.href = /${locale}/onboarding`
- Loading spinner during session fetch (after all hooks, respecting React Rules of Hooks)
- Integrated `NotificationsPopover`, `AvatarCircle`, `SearchOverlay`, `ApiLimitNotification`
- `useSwarmNotifications()` hook for real-time swarm alerts
- Avatar loaded from DB via `getUserProfile()` on mount

---

### 🎨 Onboarding Page Redesign

#### `src/app/[locale]/onboarding/page.tsx` *(MODIFIED — +548 loc)*
Complete redesign as a 6-step wizard:

| Step | Content | Validation |
|---|---|---|
| 1. Brand | Nume brand + Industrie | Required fields |
| 2. Public | Target audience input | Required |
| 3. Voce | Tone of voice input | Required |
| 4. Valori | 12 brand values as toggle badges | ≥1 selected |
| 5. Provocări | 8 pain point options + custom input | Optional |
| 6. Final | Context/slogan textarea + AvatarPicker | Optional |

- Animated transitions via framer-motion (`spring` stiffness/damping)
- Step indicator with icons, progress bar, and checkmarks
- PostHog tracking on completion (`onboarding_completed` event)
- Auth guard: redirects to sign-up if no session
- Mobile-responsive grid layout

---

### 🔔 Notification System

#### `src/stores/notificationStore.ts` *(NEW)*
Zustand store for in-app notifications:
- Types: `swarm_complete`, `swarm_error`, `deadline`, `incomplete_task`, `info`
- Max 50 notifications, auto-ID + timestamp
- `markAsRead`, `markAllAsRead`, `clearAll`, `removeNotification`

#### `src/hooks/useSwarmNotifications.ts` *(NEW)*
React hook that watches swarm state and generates notifications:
1. Per-agent completion (Researcher/Psychologist/Strategist/Copywriter/Consensus)
2. Swarm status changes (`consensus_reached`, `awaiting_approval`)
3. Interrupted swarm detection (status `idle` + active agent)
4. Deadline polling every 5 min via `checkDeadlines()`

#### `src/components/ui/notifications-popover.tsx` *(NEW)*
Popover with:
- Bell icon + unread badge counter
- Type-specific icons/colors (emerald/red/amber/blue)
- Agent-specific icons (Search/Brain/Target/PenTool/Flask/Shield)
- Time-ago formatting, action links, dismiss button
- Empty state, "Mark all read", "Clear all"
- Animated list via framer-motion `AnimatePresence`

#### `src/app/actions/deadlines.ts` *(NEW)*
Server action: `checkDeadlines()` — returns alerts for overdue, within 24h, within 7d deadlines per user's projects.

---

### 👤 Avatar System

#### `src/data/avatars.tsx` *(NEW)*
4 hand-crafted SVG avatars with distinct color palettes and facial expressions.

#### `src/stores/avatarStore.ts` *(NEW)*
Zustand store: `selectedAvatarId`, `initAvatar(id)` (from DB), `setSelectedAvatar(id)` (persists to DB via `updateAvatar`).

#### `src/components/ui/avatar-picker.tsx` *(NEW)*
- **AvatarPicker** — full picker with animated selection, gradient header, 4 avatar options, spring transitions
- **AvatarCircle** — mini avatar circle for header/sidebar, 3 sizes

#### `src/app/actions/profile.ts` *(NEW)*
Server actions:
- `updateAvatar(avatarId)` — saves to `users.image`
- `updateProfileName(name)` — updates user name
- `updateBrandProfile(data)` — upserts project brand profile
- `getUserProfile()` — returns user + brand data for the header

---

### 🔍 Global Search

#### `src/app/actions/search.ts` *(NEW)*
`searchAll(query)` — searches across:
- **Projects** (name, industry, audience, context via Drizzle)
- **Vault documents** (file name via Drizzle)
- **Ideas** (title, body, tag via Supabase)
- Results sorted by date, max 15 total, minimum 2 chars

#### `src/components/ui/search-overlay.tsx` *(NEW)*
Search overlay triggered by Cmd+K or search bar click (referenced in CommandSurface).

---

### 📅 Deadline & Event Scheduling

#### `src/components/ui/deadline-picker.tsx` *(NEW)*
Combined date + time picker:
- Calendar from shadcn/ui
- Hour (1-12) + minute (00/15/30/45) + AM/PM selectors
- "Clear deadline" option
- Syncs time selectors when value changes externally

#### `src/components/ui/event-scheduler.tsx` *(NEW)*
Two-panel event manager:
- **Left panel**: creation form (title, type selector, deadline picker, add button)
- **Right panel**: event list sorted by date, overdue/soon indicators, delete button
- "Next event" summary footer, animated list

#### `src/app/actions/deadlines.ts` *(already listed above)*

---

### 🛠 Infrastructure

#### `src/app/api/aurelius/chat/route.ts`
- Rewritten to support tool calling two-phase flow
- `maxDuration: 120` seconds for tool execution time
- Model fallback logic: OpenRouter vs OpenAI, env var override

#### `src/app/[locale]/(auth)/sign-up/page.tsx`
- Post-signup redirect to `/${locale}/onboarding`

#### `src/db/schema.ts`
- Added `deadline` column to `projects` table (timestamp)

#### Drizzle migrations
- `drizzle/0001_pain_points.sql` — pain points schema
- `drizzle/0002_deadline.sql` — deadline column

---

### ✨ New Components (from previous session)

#### `src/components/ui/404-page-not-found.tsx`
404 error page component with dribbble GIF and "Go to Home" button.

#### `src/components/ui/loader-one.tsx`
Bouncing dots loader with framer-motion animation.

#### `src/components/ui/the-future-arrives-soon-cta.tsx`
CountdownBanner — maintenance mode page with animated countdown, dark theme, gradient orbs + grid pattern, CTA buttons.

#### `src/lib/notifications.ts`
Slack webhook notification module for maintenance mode toggles.

---

### 🔄 Updated Components (from previous session)

#### `src/components/ui/popover.tsx`
Enhanced with `PopoverHeader`, `PopoverTitle`, `PopoverDescription`, `PopoverBody`, `PopoverFooter`, `PopoverClose`, `PopoverAnchor` — backward compatible, `data-slot` attributes.

#### `src/components/aurelius/AureliusChat.tsx`
Redesigned: Sparkles empty state, typing dots animation, polished message bubbles, Paperclip/Context/Send buttons, context mode indicator.

#### `src/components/aurelius/AureliusHelper.tsx`
Redesigned: 420px wide, polished header with Sparkles + "Aurelius · AI Assistant", Trash2 for clearing history, `#fdfbf7` background.

---

### 🎨 Dashboard Light Theme Migration (from previous session)

Entire dashboard migrated from dark to light (`#fdfbf7` bg, `#ff5f5f` accent, `#1a1a1a` text, `#e0ddd5` border).

**16 files updated:** `globals.css`, `CommandSurface.tsx`, dashboard pages (5), onboarding, swarm components (5), editor, vault, dialogs, twin components.

---

### ✨ New Components

#### `src/components/ui/animated-glowing-search-bar.tsx`
Animated search bar with multi-layered conic-gradient glow effects — hover/focus triggers rotation animation across 6 layered pseudo-elements, providing a neon purple/pink luminescent border.

#### `src/app/globals.css`
- Added `@keyframes spin-slow` / `.animate-spin-slow` — 6s linear rotation used by the filter button spinner

#### `src/components/ui/cookie-consent.tsx`
Functional cookie consent banner with:
- Animated slide-up card (framer-motion spring) fixed at bottom-center
- Cookie SVG icon, heading, description with privacy policy link
- Accept button (purple, #7b57ff) and Decline button (gray)
- **localStorage persistence** (`mailmind-cookie-consent`) — choice remembered across sessions
- **PostHog integration** — `opt_in_capturing()` / `opt_out_capturing()` based on user choice
- Hydration-safe (no flash before localStorage read)

#### `src/app/[locale]/layout.tsx` *(MODIFIED)*
- Integrated `<CookieConsent />` in root layout for global visibility

---

---

### 🏰 War Room — PROFESSIONAL-Only Command Center

#### `src/app/[locale]/dashboard/war-room/[id]/page.tsx` *(COMPLETE REWRITE)*

**Access Gate:**
- Non-PROFESSIONAL users see an `UpgradeGate` with feature-locked list + CTA to upgrade
- PROFESSIONAL badge in header with gradient pill
- `swarm.status="conflict"` properly mapped to `"error"` for AureliusChat context

**Right Panel — 4 Tabs:**
| Tab | Content |
|---|---|
| **Twin** | Prospect Analysis — TwinProfile + ReactionPanel inside glass card |
| **Chat** | Full AureliusChat with real-time swarm context (status, confidence, active agent) |
| **Tools** | 4 Special Tools (A/B Test, Sequence Builder, Send Test, Export) with animated expand panels |
| **API** | API Configuration — provider/model select, override key with localStorage persistence |

**Header:**
- Live `ApiUsageGauge` — animated bar, auto-refresh every 30s, color-coded (green/amber/red)
- `ConfidenceScore` + Launch Campaign button
- Red pulsing dot + "War Room #xxxx" title

**Left Panel:**
- `UploadZone` + asset file list
- `SwarmFeed` with real-time trace logs

**Center:**
- `SwarmCanvas` for agent orchestration
- `EmailEditor` below for drafting

**Cleanup:**
- All unused lucide imports removed (`Lock`, `Sparkles`, `RefreshCw`, `Loader2`, `Zap`, `Target`, `PenTool`, `Search`, `ShieldCheck`)
- Unused `useCallback` removed
- Dead feature-gating lock icons removed (all features unlocked for PROFESSIONAL)

---

---

### ✨ Landing Page Animations

#### `src/app/[locale]/page.tsx` *(COMPLETE REWRITE)*

Every section of the landing page now has rich framer-motion animations:

**Global:**
- `FloatingOrbs` — 3 large gradient orbs that float slowly in the background (parallax-like)
- `FloatingParticles` — 12 tiny pulsing dots scattered across the hero
- `SectionHeading` — reusable animated heading with gradient highlight (`animate-gradient-x`)

**Header:**
- Scroll-aware background opacity (`useScroll` → `useTransform`)
- Logo hover rotation/scale via spring
- Nav links with animated underline on hover
- Get Started button with shimmer overlay loop
- Mobile menu with staggered item entrance

**Hero:**
- Staggered entrance for badge, heading, paragraph, CTA buttons, mock dashboard
- Gradient text animation on "actually knows" (`animate-gradient-x`)
- Animated highlight box that scales in from left behind text
- CTA buttons with hover scale + tap scale
- Shimmer sweep on primary CTA (white/10 gradient)
- Mock dashboard: 3 cards slide up staggered, skeleton bars pulse, progress bar fills in
- Browser chrome dots pulse sequentially

**Features (4 Specialists):**
- Cards enter with `fadeUpScale` stagger
- Hover: lift -6px, glow box shadow
- Icon rotate+scale on hover
- Hover radial gradient overlay per card accent color

**Interactive Demo:**
- Progress bar fills in on scroll (`whileInView`)
- 5 pulsing dots along the progress line with spring scale-in
- Step cards with `fadeUpScale` stagger
- Icon rotates 360° on hover

**Differentiation:**
- `slideInLeft` / `slideInRight` for left text + right chart
- SVG OCEAN radar chart: grid lines draw in (stroke-dasharray animation), data polygon scales in, data points spring-scale with pulsing animation
- Checkmark items with staggered `fadeUp` + hover scale effect

**Pricing:**
- Cards with `fadeUpScale` stagger
- Price amounts spring-scale in
- Feature list items fade in from left with stagger
- Hover: lift with colored box shadow
- Popular badge springs in from above

**FAQ:**
- Staggered items with `fadeUp`
- Zap icon rotates 90° on hover
- Gradient highlight on "questions"

**Final CTA:**
- Animated gradient overlay sweeping across background (8s loop)
- 4 floating translucent shapes with bob animation
- "that get replies" gently pulses
- Success state with spring scale-in
- Trust indicators fade in with stagger

**Footer:**
- Logo hover rotation
- Nav links with animated underline
- Social links with animated underline

#### `src/app/globals.css` *(MODIFIED)*
- Added `@keyframes gradient-x` / `.animate-gradient-x` — animated background position for gradient text

**Cleanup:**
- Removed unused imports (`Plus`, `Star`)
- Removed unused `glowVariants` object
- TypeScript: 0 errors

---

---

### 🎙️ Onboarding — Aurelius-Guided Experience

#### `src/app/[locale]/onboarding/page.tsx` *(COMPLETE REWRITE)*

Onboarding transformat într-o experiență ghidată de **Aurelius**, asistentul AI:

**8 steps cu flow conversațional:**
| Step | Ce se întâmplă |
|---|---|
| 0. Welcome | Aurelius salută, se prezintă, explică procesul — 3 mesaje eșalonate |
| 1. Brand | Aurelius întreabă numele + industria, câmpuri side-by-side |
| 2. Audience | Aurelius cere detalii despre publicul țintă, cu exemplu + sfat |
| 3. Voice | Aurelius explică tonul vocii, input + quick-select badges |
| 4. Values | Aurelius invită la selecția valorilor, badges toggle cu checkmark |
| 5. Pain Points | Aurelius prezintă provocările + input custom |
| 6. Tools | Aurelius prezintă cele 4 tool-uri (Swarm, Twin, Vault, War Room) — expandabile |
| 7. Final | Aurelius încurajează, recap + avatar picker + context |

**Componente noi inline:**
- `AureliusBubble` — balon de chat cu avatarul Aurelius (gradient roșu → violet) + text cu delay progresiv → senzație de „scrie"
- `ToolCard` — card expandabil cu iconiță gradient, titlu, descriere, 4 feature-uri, animație chevron
- `ProgressBar` — bară gradient care se umple la fiecare pas

**Tool Showcase (step 6):**
- 4 carduri expandabile: Swarm, Digital Twin, Vault, War Room
- Fiecare cu icon, descriere detaliată, 4 feature-uri specifice
- Click pe card → se extinde cu animație, click din nou → se minimizează

**UX improvements:**
- Fiecare pas are intrare `slideUp` cu spring framer-motion
- Auto-scroll la începutul conținutului la schimbarea pasului
- Gradient decorativ de fundal (blur 3xl)
- Buton „Activează MailMind" cu gradient roșu → violet la submit
- Recap card în pasul final cu rezumatul brand-ului
- Indicator de fază în counter („Întrebări" → „Prezentare tool-uri" → „Finalizare")
- Importuri moarte curățate (`Target`, `Shield`)

**TypeScript: 0 erori**

---

### ⌨️ Omni Command Palette

#### `src/components/ui/omni-command-palette.tsx` *(NEW)*
O paletă universală de comenzi cu:
- **Fuzzy search** — scorare sub-string + subsequență cu evidențiere automată
- **Multi-source async** — fiecare sursă fetch-uiește independent cu debounce configurabil
- **Recents** — persistate în localStorage cu max configurabil
- **Pinned items** — afișați primii la query gol
- **Keyboard-first** — arrow keys, Enter, Escape, ⌘K/⌃K global
- **Theme indicator** — detectare dark/light mode automată
- **Render overrides** — `renderItem`, `renderHeader`, `renderFooter` pentru personalizare

#### `src/app/[locale]/demo-omni/page.tsx` *(NEW)*
Demo page cu 3 surse (Commands, Pages, People) — async fetch cu delay simulat, pinned items, navigare completă.

#### `src/app/globals.css` *(MODIFIED)*
- Adăugat `--elevation` CSS variable pentru dark mode

**TypeScript: 0 erori**

---

### 💰 Real Pricing Page (`/pricing`)

#### `src/app/[locale]/pricing/page.tsx` *(NEW)*
Pagină de prețuri completă cu 3 planuri (FREE / STARTER / PROFESSIONAL):

**Hero:**
- Badge animat cu `Sparkles` + tagline "Simple, Transparent Pricing"
- Titlu gradient cu floating orbs decorative pe fundal

**Pricing Cards:**
- Billing toggle (Monthly / Annual) cu switch animat — anual = preț × 10, badge "Save 17%"
- 3 carduri responsive cu stări de hover (lift + box shadow)
- STARTER evidențiat cu border `#ff5f5f`, badge POPULAR cu `Crown`, scală 1.05x
- PROFESSIONAL cu CTA gradient roșu→violet
- Prețurile intră cu spring scale, feature-urile cu fade-in din stânga
- `locale` prop corect propagată la toate componentele care au link-uri

**Comparison Table:**
- Desktop: tabel complet cu 10 rânduri, rânduri alternante, hover highlight
- Mobile: carduri expandabile per feature cu grid 3 coloane
- Iconițe Check (emerald) / X (gri) pentru feature-uri booleene, text pentru valori (ex: "2 agents")
- CTA secțiune: "Start Free — No Credit Card Required"

**FAQ:**
- 6 întrebări cu accordion animat (ChevronDown rotire, conținut slide)
- Gradient highlight pe text

**CTA Section:**
- Fundal gradient `#ff5f5f`→violet cu overlay animat
- Formular email cu Mail icon + buton Get Started
- Trust indicators (Shield, Globe, Heart)

**Footer:**
- Logo cu hover rotation + underline animat pe link-uri
- Coloane: Product (Features, How it Works, Pricing), Company, Legal

**Curățenie:**
- 11 importuri moarte eliminate (`Search`, `Brain`, `Target`, `PenTool`, `Play`, `Send`, `Zap`, `Database`, `Layout`, `Users`, `HelpCircle`)
- `locale` prop adăugată la `PricingCards` și `ComparisonTable`
- Non-null assertions pe `PLAN_DETAILS[tier.id]!` (3 locații) — sigur deoarece datele sunt complete static

#### `src/app/[locale]/page.tsx` *(MODIFIED)*
- Header nav link-ul "Pricing" acum link-uiește la `/${locale}/pricing` în loc de `#pricing`
- Mobile menu updated similarly

**TypeScript: 0 erori**

### 🏷️ LogoCloud Component

#### `src/components/ui/infinite-slider.tsx` *(NEW)*
Animated infinite carousel using framer-motion + `react-use-measure`:
- Horizontal/vertical direction, configurable gap/duration
- Hover speed control (`durationOnHover`) with smooth transition
- Duplicated children for seamless loop, `repeat: Infinity`

#### `src/components/ui/progressive-blur.tsx` *(NEW)*
Multi-layer blur mask using `motion/react`:
- 4-direction support (top/right/bottom/left)
- Configurable `blurLayers` and `blurIntensity`
- Per-layer gradient masks with stacked backdrop-filter

#### `src/components/ui/logo-cloud-4.tsx` *(NEW)*
LogoCloud wrapper using InfiniteSlider + ProgressiveBlur:
- Accepts `logos` array of `{ src, alt }` — renders infinite scrolling img tags
- Responsive image sizing (`h-4` mobile → `md:h-5`)
- Dark-mode support via `dark:brightness-0 dark:invert`
- Progressive blur edges on both sides (left + right)

#### `src/app/[locale]/demo-logo-cloud/page.tsx` *(NEW)*
Demo page with 8 brand logos from svgl.app (Nvidia, Supabase, OpenAI, Turso, Vercel, GitHub, Claude, Clerk).

**TypeScript: 0 erori**

---

### 🔄 OmniCommandPalette — SearchOverlay Replacement

#### `src/components/layout/CommandSurface.tsx` *(MODIFIED)*
`SearchOverlay` înlocuit cu `OmniCommandPalette` conectat la surse reale:
- **PAGES_SOURCE** — 5 pagini dashboard statice (Dashboard, Ideas, Global Chat, Founder Mode, Settings) cu keywords, Dashboard e `pinned`
- **SEARCH_SOURCE** — fetch-uiește `searchAll()` server action pentru search real în proiecte/documente/idei, cu iconițe specifice tipului (FolderKanban/FileText/Lightbulb)
- **initialQuery** — preia textul din glowing search bar la deschidere
- **showRecents + showPinnedFirst** — comenzi recente și favorite persistate în localStorage
- Avatar loading (`avatarInitialized` + `getUserProfile` useEffect) păstrat intact
- ⌘K handling preluat de `useHotkeys` din OmniCommandPalette (fără dublare)

#### `src/components/ui/omni-command-palette.tsx` *(MODIFIED)*
Adăugat `initialQuery` prop:
- Sincronizează query-ul intern la deschiderea paletei
- Folosit în `useState(initialQuery ?? "")` + effect de sync când `open` se schimbă

**Importuri:** adăugate `FolderKanban`, `FileText` (lucide) + `searchAll` (server action)

**TypeScript: 0 erori**

---

- All `console.log`/`console.error` cleaned across auth, dashboard, swarm
- Dead code removed from maintenance page

### 🔀 Sequence Builder — Drag-and-Drop Reordering

#### `src/app/[locale]/dashboard/war-room/[id]/page.tsx` *(MODIFIED)*

**Sequence Builder** poate reordona pașii cu drag-and-drop:

- Instalate `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- **`SortableStep`** — componentă independentă (la nivel de modul) care folosește `useSortable` cu `transform`/`transition` CSS, drag handle cu icon `GripVertical`
- **DndContext** + **SortableContext** înfășoară lista de pași, folosind `closestCenter` + `verticalListSortingStrategy`
- **PointerSensor** cu 5px activation constraint — evită drag-urile accidentale la click simplu
- **`handleDragEnd`** — folosește `arrayMove` pentru reordonare pe bază de `id`
- **ID-uri unice** — fiecare pas primește `crypto.randomUUID()` la creare (API sau manual)
- **Ștergere** — acum pe bază de `id` în loc de index (`sequence.filter((s) => s.id !== id)`)
- **Importuri:** adăugate `GripVertical` (lucide) + toate dnd-kit utilities (DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent, SortableContext, useSortable, arrayMove, verticalListSortingStrategy, CSS)

**TypeScript: 0 erori** across the entire codebase
