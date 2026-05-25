import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db/drizzle";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
    // Require email verification before allowing login.
    // IMPORTANT: If enabling this on an existing app with users who haven't verified,
    // run a migration to set emailVerified=true for existing users first.
    //   UPDATE users SET email_verified = true;
    // FIXME: Re-enable after email provider is configured
    requireEmailVerification: false,
  },
  emailVerification: {
    enabled: false,
    // Verification disabled for local testing. Re-enable when Resend is configured.
    // tokenTTL: 3600,
    sendOnSignUp: false,
    // Custom email sender — logs to console in dev, sends via Resend in prod
    sendVerificationEmail: async (data) => {
      const { user, url, token } = data;
      console.log(`[Auth] Verification email for ${user.email}: ${url}`);

      // In production, use Resend or similar email service
      if (process.env.NODE_ENV === "production" && process.env.RESEND_API_KEY) {
        try {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: "MailMind <noreply@mailmind.ai>",
              to: user.email,
              subject: "Verify your email address",
              html: `<p>Click <a href="${url}">here</a> to verify your email. This link expires in 1 hour.</p>`,
            }),
          });
        } catch (error) {
          console.error("[Auth] Failed to send verification email:", error);
        }
      }
    },
  },
  session: {
    // Session expires after 7 days of inactivity
    expiresIn: 60 * 60 * 24 * 7, // 604800 seconds
    // Refresh session expiry if user is active within 1 day of expiry
    updateAge: 60 * 60 * 24, // 86400 seconds
    // Max 5 concurrent sessions per user
    maxSessions: 5,
  },
  rateLimit: {
    enabled: true,
    // 100 requests per 60 seconds per endpoint
    window: 60,
    max: 100,
  },
  user: {
    additionalFields: {
      plan: {
        type: "string",
        defaultValue: "FREE",
      },
      onboardingComplete: {
        type: "boolean",
        defaultValue: false,
      },
      polarSubscriptionId: {
        type: "string",
        defaultValue: null,
        nullable: true,
      },
      trialEnd: {
        type: "date",
        defaultValue: null,
        nullable: true,
      },
    },
  },
  pages: {
    signIn: "/login",
    signUp: "/sign-up",
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    "http://localhost:3000",
    ...(process.env.ALLOWED_DEV_ORIGINS?.split(',').map(s => s.trim()) ?? []),
  ].filter(Boolean),

  // ─── Trial: 14-day PROFESSIONAL trial on signup ───────────────────────
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // Set a 14-day trial from now — user starts on PROFESSIONAL plan
          const trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
          return {
            data: {
              ...user,
              plan: "PROFESSIONAL",
              trialEnd: trialEnd.toISOString(),
            },
          };
        },
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
