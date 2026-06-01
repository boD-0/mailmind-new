/**
 * check-env.ts — Validates all required environment variables at startup.
 * Run: npx tsx scripts/check-env.ts
 * 
 * Blocks the build if critical variables are missing.
 * Non-critical variables show warnings but don't block.
 */

import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

// Check .env.local exists
const envPath = path.resolve(process.cwd(), ".env.local");
if (!fs.existsSync(envPath)) {
  console.error("❌ .env.local not found.\n   Copy .env.example → .env.local and fill in your values:");
  console.error("   cp .env.example .env.local");
  process.exit(1);
}

// Load .env.local
dotenv.config({ path: envPath });

interface EnvVar {
  key: string;
  critical: boolean;
  description: string;
}

const REQUIRED_VARS: EnvVar[] = [
  // ── DATABASE ────────────────────────────────────────────
  { key: "DATABASE_URL", critical: true, description: "Neon PostgreSQL connection string" },

  // ── AUTH ────────────────────────────────────────────────
  { key: "BETTER_AUTH_SECRET", critical: true, description: "Better-Auth secret key (openssl rand -base64 32)" },
  { key: "BETTER_AUTH_URL", critical: false, description: "Base URL (defaults to http://localhost:3000)" },
  { key: "GOOGLE_CLIENT_ID", critical: false, description: "Google OAuth client ID (set to enable Google sign-in)" },
  { key: "GOOGLE_CLIENT_SECRET", critical: false, description: "Google OAuth client secret (set to enable Google sign-in)" },

  // ── APP ─────────────────────────────────────────────────
  { key: "NEXT_PUBLIC_APP_URL", critical: false, description: "Public app URL (defaults to http://localhost:3000)" },
  { key: "ADMIN_EMAIL", critical: false, description: "Founder email for admin access" },
  { key: "FOUNDER_EMAILS", critical: false, description: "Comma-separated founder emails" },

  // ── OPENAI / LLM ────────────────────────────────────────
  { key: "OPENAI_API_KEY", critical: true, description: "OpenAI API key (primary LLM)" },
  { key: "OPENROUTER_API_KEY", critical: false, description: "OpenRouter API key (falls back to OpenAI)" },
  { key: "TOGETHER_AI_API_KEY", critical: false, description: "Together AI for Llama models (swarm agents)" },
  { key: "TAVILY_API_KEY", critical: false, description: "Tavily web search (Researcher agent)" },

  // ── SUPABASE ────────────────────────────────────────────
  { key: "NEXT_PUBLIC_SUPABASE_URL", critical: true, description: "Supabase project URL" },
  { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", critical: true, description: "Supabase anon/public key" },
  { key: "SUPABASE_SERVICE_ROLE_KEY", critical: true, description: "Supabase service role key (server only)" },

  // ── UPSTASH REDIS ───────────────────────────────────────
  { key: "UPSTASH_REDIS_REST_URL", critical: false, description: "Upstash Redis REST URL (rate limiting disabled if missing)" },
  { key: "UPSTASH_REDIS_REST_TOKEN", critical: false, description: "Upstash Redis REST token" },

  // ── CLOUDFLARE R2 ───────────────────────────────────────
  { key: "CLOUDFLARE_ACCOUNT_ID", critical: false, description: "Cloudflare account ID for R2" },
  { key: "R2_ACCESS_KEY_ID", critical: false, description: "R2 access key ID" },
  { key: "R2_SECRET_ACCESS_KEY", critical: false, description: "R2 secret access key" },
  { key: "R2_BUCKET_NAME", critical: false, description: "R2 bucket name" },
  { key: "R2_PUBLIC_URL", critical: false, description: "R2 public URL" },

  // ── STRIPE ──────────────────────────────────────────────
  { key: "STRIPE_SECRET_KEY", critical: true, description: "Stripe secret key (app crashes at startup if missing)" },
  { key: "STRIPE_WEBHOOK_SECRET", critical: false, description: "Stripe webhook signing secret" },
  { key: "STRIPE_PRICE_ID_FAST", critical: false, description: "Stripe price ID for fast scan" },
  { key: "STRIPE_PRICE_ID_DEEP", critical: false, description: "Stripe price ID for deep simulation" },
  { key: "STRIPE_CREDITS_PRICE_ID", critical: false, description: "Stripe price ID for swarm credit packs (1 pack = 10 extra swarms)" },

  // ── POLAR.SH ────────────────────────────────────────────
  { key: "POLAR_ACCESS_TOKEN", critical: false, description: "Polar.sh API access token for checkout + portal" },
  { key: "POLAR_WEBHOOK_SECRET", critical: false, description: "Polar.sh webhook signing secret" },
  { key: "POLAR_PRO_PRODUCT_ID", critical: false, description: "Polar product ID for PROFESSIONAL tier" },
  { key: "POLAR_STARTER_PRODUCT_ID", critical: false, description: "Polar product ID for STARTER tier" },

  // ── POSTHOG ─────────────────────────────────────────────
  { key: "NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN", critical: false, description: "PostHog project token" },
  { key: "NEXT_PUBLIC_POSTHOG_HOST", critical: false, description: "PostHog host (defaults to app.posthog.com)" },

  // ── EMAIL ───────────────────────────────────────────────
  { key: "RESEND_API_KEY", critical: false, description: "Resend API key (email verification + notifications)" },
  { key: "CRON_SECRET_KEY", critical: false, description: "Shared secret for cron job endpoints (cost monitoring)" },
  { key: "INNGEST_EVENT_KEY", critical: false, description: "Inngest event key (background job queue for swarm executions)" },
  { key: "EMAIL_FROM", critical: false, description: "From address for outgoing emails (e.g. MailMind <noreply@mailmind.ai>)" },

  // ── PROXYCURL (LinkedIn enrichment) ──────────────────────
  { key: "PROXYCURL_API_KEY", critical: false, description: "Proxycurl API key for LinkedIn prospect enrichment" },

  // ── GMAIL INTEGRATION ───────────────────────────────────
  { key: "GOOGLE_GMAIL_CLIENT_ID", critical: false, description: "Google OAuth client ID for Gmail send (separate from sign-in)" },
  { key: "GOOGLE_GMAIL_CLIENT_SECRET", critical: false, description: "Google OAuth client secret for Gmail send" },

  // ── MARKETING ───────────────────────────────────────────
  { key: "KLAVIYO_PRIVATE_KEY", critical: false, description: "Klaviyo private API key" },

  // ── MONITORING (Sentry) ─────────────────────────────────
  { key: "NEXT_PUBLIC_SENTRY_DSN", critical: false, description: "Sentry DSN for error tracking (sentry.io)" },

  // ── AUTH (Better Auth Dashboard) ─────────────────────────
  { key: "BETTER_AUTH_API_KEY", critical: false, description: "Better-Auth dashboard API key (enables dash plugin)" },

  // ── SWARM CONFIG ────────────────────────────────────────
  { key: "APPROVAL_THRESHOLD", critical: false, description: "Swarm consensus approval threshold 0-100 (defaults to 60)" },

  // ── INNGEST (Dev) ───────────────────────────────────────
  { key: "INNGEST_DEV_URL", critical: false, description: "Inngest dev server URL (defaults to http://localhost:8288)" },

  // ── AURELIUS (AI Coach) ─────────────────────────────────
  { key: "AURELIUS_MODEL", critical: false, description: "Custom model for Aurelius AI coach (defaults to openai/gpt-4o-mini)" },

  // ── HEALTH CHECK ────────────────────────────────────────
  { key: "HEALTH_CHECK_SECRET", critical: false, description: "Shared secret for /api/health endpoint (unprotected if missing)" },

  // ── DEMO / MARKETING ────────────────────────────────────
  { key: "NEXT_PUBLIC_DEMO_VIDEO_URL", critical: false, description: "Demo video embed URL (public, defaults to Loom placeholder)" },

  // ── NEXT.JS DEV ─────────────────────────────────────────
  { key: "ALLOWED_DEV_ORIGINS", critical: false, description: "Comma-separated allowed dev origins for CORS" },
];

function main() {
  let criticalMissing = 0;
  let warnings = 0;

  console.log("🔍 Checking environment variables...\n");

  for (const { key, critical, description } of REQUIRED_VARS) {
    const value = process.env[key];
    if (!value || value === "") {
      if (critical) {
        console.error(`  ❌ CRITICAL: ${key} is missing — ${description}`);
        criticalMissing++;
      } else {
        console.warn(`  ⚠️  WARNING: ${key} is missing — ${description}`);
        warnings++;
      }
    } else {
      const masked = value.length > 12 ? value.slice(0, 8) + "..." + value.slice(-4) : "***";
      console.log(`  ✅ ${key}=${masked}`);
    }
  }

  console.log("");

  if (criticalMissing > 0) {
    console.error(`❌ ${criticalMissing} critical variable(s) missing. Fix .env.local and try again.`);
    process.exit(1);
  }

  if (warnings > 0) {
    console.warn(`⚠️  ${warnings} optional variable(s) missing. Some features may be disabled.`);
  } else {
    console.log("✅ All environment variables present.");
  }
}

main();
