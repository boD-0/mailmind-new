# Changelog

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
