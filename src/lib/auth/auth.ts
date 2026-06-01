import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { dash, sentinel } from "@better-auth/infra";
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
    requireEmailVerification: true,
  },
  emailVerification: {
    enabled: true,
    sendOnSignUp: true,
    tokenTTL: 3600, // Verification link expires in 1 hour
    // Custom email sender — logs to console in dev, sends via Resend in prod
    sendVerificationEmail: async (data) => {
      const { user, url, token } = data;
      console.log(`[Auth] Verification email for ${user.email}: ${url}`);

      const resendApiKey = process.env.RESEND_API_KEY;
      if (resendApiKey) {
        try {
          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${resendApiKey}`,
            },
            body: JSON.stringify({
              from: "MailMind <onboarding@resend.dev>",
              to: user.email,
              subject: "Verify your email address",
              html: `<p>Welcome to MailMind!</p><p>Click <a href="${url}">here</a> to verify your email address. This link expires in 1 hour.</p><p>If you didn't create an account, you can safely ignore this email.</p>`,
            }),
          });
          if (!res.ok) {
            console.error("[Auth] Resend API error:", res.status, await res.text());
          }
        } catch (error) {
          console.error("[Auth] Failed to send verification email:", error);
        }
      } else {
        console.log("[Auth] RESEND_API_KEY not set — verification email logged (dev mode). Click the link above to verify.");
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
    verifyEmail: "/verify-email",
    forgotPassword: "/forgot-password",
    resetPassword: "/reset-password",
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  plugins: [
    dash({
      apiKey: process.env.BETTER_AUTH_API_KEY!,
    }),
    sentinel(),
  ],
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
