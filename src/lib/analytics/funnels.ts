/**
 * 📊 PostHog Funnel Definitions — MailMind
 *
 * Acest fișier documentează funnel-urile de conversie care trebuie
 * configurate în PostHog Dashboard. Evenimentele corespunzătoare
 * sunt deja track-uite în aplicație (vezi lista mai jos).
 *
 * Setup: PostHog → Product Analytics → Funnels → New Funnel
 *
 * @see https://app.posthog.com/funnels
 */

/** ─── FUNNEL 1: Signup → Onboarding → First Swarm → Upgrade ─── */

export const FUNNEL_SIGNUP_TO_PAID = {
  name: "Signup → Upgrade (Full Journey)",
  description:
    "Tracks users from account creation through onboarding and first swarm to paid subscription.",
  steps: [
    {
      order: 1,
      event: "signup_completed",
      label: "Signed Up",
      description: "User creates an account (email or Google OAuth).",
    },
    {
      order: 2,
      event: "onboarding_completed",
      label: "Onboarding Done",
      description:
        "User completes the 9-step onboarding wizard (brand, audience, voice, values, pain points, tools, documents, final).",
    },
    {
      order: 3,
      event: "swarm_launched",
      label: "First Swarm Launched",
      description:
        "User launches their first AI swarm. Filter by property `is_first = true` in PostHog.",
      propertyFilter: { is_first: true },
    },
    {
      order: 4,
      event: "subscription_created",
      label: "Upgraded to Paid",
      description:
        "User subscribes to a paid plan (STARTER or PROFESSIONAL via Polar.sh).",
    },
  ],
  /** Average expected conversion: ~15-20% from signup to paid */
  expectedConversion: "15–20%",
};

/** ─── FUNNEL 2: Trial → War Room → Upgrade ─── */

export const FUNNEL_TRIAL_TO_PAID = {
  name: "Trial → War Room → Upgrade",
  description:
    "Tracks users who start a free trial, explore the War Room, and convert to paid.",
  steps: [
    {
      order: 1,
      event: "trial_started",
      label: "Trial Started",
      description:
        "User signs up and automatically begins a 14-day PROFESSIONAL trial. Tracked in sign-up flow.",
      propertyFilter: { plan: "PROFESSIONAL" },
    },
    {
      order: 2,
      event: "war_room_viewed",
      label: "War Room Viewed",
      description:
        "User opens the War Room page — the most powerful feature (PROFESSIONAL-tier gated).",
    },
    {
      order: 3,
      event: "subscription_created",
      label: "Converted to Paid",
      description:
        "User subscribes to a paid plan before or after trial ends.",
    },
  ],
  /** Average expected conversion: ~8-12% from trial to paid */
  expectedConversion: "8–12%",
};

/** ─── FUNNEL 3 (Optional): Pricing → Checkout → Paid ─── */

export const FUNNEL_PRICING_TO_PAID = {
  name: "Pricing Page → Checkout → Paid",
  description:
    "Tracks visitors who view pricing, start checkout, and complete payment.",
  steps: [
    {
      order: 1,
      event: "pricing_viewed",
      label: "Viewed Pricing",
      description:
        "User visits the /pricing page. Automatically tracked on page mount.",
    },
    {
      order: 2,
      event: "checkout_started",
      label: "Checkout Started",
      description:
        "User clicks a paid tier CTA (STARTER or PROFESSIONAL). Tracked with `plan` and `billing` properties.",
    },
    {
      order: 3,
      event: "subscription_created",
      label: "Payment Completed",
      description:
        "User completes payment via Polar.sh checkout and subscription is created.",
    },
  ],
  /** Average expected conversion: ~25-35% from pricing view to paid */
  expectedConversion: "25–35%",
};

/** ─── FUNNEL 4 (Optional): Waitlist → Signup → Activation ─── */

export const FUNNEL_WAITLIST_TO_ACTIVE = {
  name: "Waitlist → Signup → First Swarm",
  description:
    "Tracks waitlist signups who later create accounts and launch their first swarm.",
  steps: [
    {
      order: 1,
      event: "$pageview",
      label: "Waitlist Joined",
      description:
        "User submits the waitlist form. Tracked via pageview on /waitlist (or custom event).",
    },
    {
      order: 2,
      event: "signup_completed",
      label: "Signed Up",
      description: "User creates an account after being on the waitlist.",
    },
    {
      order: 3,
      event: "swarm_launched",
      label: "First Swarm",
      description: "First swarm execution. Filter by `is_first = true`.",
      propertyFilter: { is_first: true },
    },
  ],
  expectedConversion: "10–15%",
};

/** ─── ALL TRACKED EVENTS REFERENCE ─── */

/**
 * Complete list of PostHog events tracked in the application.
 * Use these when building funnels, trends, or dashboards.
 */
export const TRACKED_EVENTS = {
  // ── Auth ──
  signup_completed: {
    description: "User completes email signup",
    properties: ["method"],
    location: "src/app/[locale]/(auth)/sign-up/page.tsx",
  },
  signup_social_clicked: {
    description: "User clicks Google OAuth signup",
    properties: ["provider"],
    location: "src/app/[locale]/(auth)/sign-up/page.tsx",
  },
  trial_started: {
    description: "14-day PROFESSIONAL trial auto-starts on signup",
    properties: ["plan", "source"],
    location: "src/app/[locale]/(auth)/sign-up/page.tsx",
  },

  // ── Onboarding ──
  onboarding_completed: {
    description: "User completes 9-step onboarding wizard",
    properties: ["industry", "tone_of_voice", "brand_values_count", "pain_points_count"],
    location: "src/app/[locale]/onboarding/page.tsx",
  },

  // ── Swarm ──
  swarm_launched: {
    description: "User launches an AI swarm execution",
    properties: ["campaign_id", "swarm_mode", "prospect_name", "is_first"],
    location: "src/app/api/swarm/launch/route.ts",
  },

  // ── Projects ──
  project_created: {
    description: "User creates a new project/campaign",
    properties: [],
    location: "src/components/dashboard/NewProjectDialog.tsx",
  },

  // ── War Room ──
  war_room_viewed: {
    description: "User opens the War Room page",
    properties: ["campaign_id"],
    location: "src/app/[locale]/dashboard/war-room/[id]/page.tsx",
  },

  // ── Pricing ──
  pricing_viewed: {
    description: "User views the pricing page",
    properties: [],
    location: "src/app/[locale]/pricing/page.tsx",
  },
  checkout_started: {
    description: "User clicks a paid tier CTA on pricing page",
    properties: ["plan", "billing"],
    location: "src/app/[locale]/pricing/page.tsx",
  },

  // ── Subscriptions (server-side via Polar webhooks) ──
  subscription_created: {
    description: "New subscription created via Polar.sh",
    properties: ["product_id", "plan"],
    location: "src/app/api/webhooks/polar/route.ts",
  },
  subscription_updated: {
    description: "Subscription plan changed (upgrade/downgrade)",
    properties: ["product_id", "plan"],
    location: "src/app/api/webhooks/polar/route.ts",
  },
  subscription_canceled: {
    description: "Subscription canceled or revoked",
    properties: ["product_id", "plan"],
    location: "src/app/api/webhooks/polar/route.ts",
  },

  // ── Page Views (automatic) ──
  $pageview: {
    description: "Automatic page view tracking (every route change)",
    properties: ["$current_url"],
    location: "src/components/PostHogPageView.tsx",
  },
} as const;

/** ─── HOW TO SET UP FUNNELS IN POSTHOG ─── */

/**
 * Setup instructions:
 *
 * 1. Go to https://app.posthog.com/funnels
 * 2. Click "New Funnel"
 * 3. Name it using the funnel names above
 * 4. Add each step as an event from the TRACKED_EVENTS list
 * 5. For steps with propertyFilter (e.g. `is_first: true`), add a filter:
 *    - Click "Add filter" on the step
 *    - Select property, operator "equals", and value
 * 6. Set conversion window: 30 days
 * 7. Save and monitor
 *
 * Optional: Create a PostHog Dashboard with:
 * - Funnel 1 & 2 as main conversion metrics
 * - A trend of signup_completed over time
 * - A trend of subscription_created over time
 * - A breakdown of checkout_started by plan
 */
