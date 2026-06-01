import {
  pgTable,
  pgEnum,
  text,
  boolean,
  timestamp,
  date,
  jsonb,
  uuid,
  integer,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

// ─── ENUM PLANURI ─────────────────────────────────────────────────────────────
export const planEnum = pgEnum("plan", ["FREE", "STARTER", "PROFESSIONAL"]);
export const agentEnum = pgEnum("agent_type", [
  "COPYWRITER",
  "RESEARCHER",
  "STRATEGIST",
  "ANALYST",
]);

// ─── USERS ────────────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  plan: planEnum("plan").notNull().default("FREE"),
  polarCustomerId: text("polar_customer_id"),
  polarSubscriptionId: text("polar_subscription_id"),
  onboardingComplete: boolean("onboarding_complete").notNull().default(false),
  trialEnd: timestamp("trial_end"),
  swarmCredits: integer("swarm_credits").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── SESSIONS ─────────────────────────────────────────────────────────────────
export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── ACCOUNTS (OAuth) ─────────────────────────────────────────────────────────
export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── VERIFICATION ─────────────────────────────────────────────────────────────
export const verifications = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── PROJECTS ─────────────────────────────────────────────────────────────────
export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  industry: text("industry"),
  toneOfVoice: text("tone_of_voice"),
  targetAudience: text("target_audience"),
  context: text("context"),
  brandValues: jsonb("brand_values").$type<string[]>(),
  painPoints: jsonb("pain_points").$type<string[]>(),
  deadline: timestamp("deadline"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── VAULT DOCUMENTS (R2) ─────────────────────────────────────────────────────
export const vaultDocuments = pgTable("vault_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  projectId: uuid("project_id").references(() => projects.id, {
    onDelete: "cascade",
  }),
  fileName: text("file_name").notNull(),
  fileKey: text("file_key").notNull(),       // cheia în bucket R2
  fileUrl: text("file_url").notNull(),       // URL public
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── API USAGE ─────────────────────────────────────────────────────────────────
export const apiUsage = pgTable("api_usage", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  endpoint: text("endpoint").notNull(),
  method: text("method").notNull().default("POST"),
  tokensUsed: integer("tokens_used").default(0),
  requestCount: integer("request_count").default(1),
  statusCode: integer("status_code").default(200),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_api_usage_user_id").on(table.userId),
  index("idx_api_usage_created_at").on(table.createdAt),
  index("idx_api_usage_endpoint").on(table.endpoint),
]);

export const apiUsageDaily = pgTable("api_usage_daily", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  endpoint: text("endpoint").notNull(),
  totalRequests: integer("total_requests").default(0),
  totalTokens: integer("total_tokens").default(0),
}, (table) => [
  uniqueIndex("idx_api_usage_daily_unique").on(table.userId, table.date, table.endpoint),
]);

// ─── SWARM EXECUTIONS ─────────────────────────────────────────────────────────
export const swarmExecutions = pgTable("swarm_executions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  projectId: uuid("project_id").references(() => projects.id),
  agentsUsed: agentEnum("agents_used").array(),
  inputPrompt: text("input_prompt"),
  outputResult: text("output_result"),
  modelUsed: text("model_used"),
  tokensUsed: integer("tokens_used"),
  durationMs: integer("duration_ms"),
  status: text("status").notNull().default("pending"),   // pending | success | error
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── WAITLIST ─────────────────────────────────────────────────────────────────
export const waitlist = pgTable("waitlist", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name"),
  referralSource: text("referral_source"),
  earlyBird: boolean("early_bird").notNull().default(false),
  earlyBirdClaimed: boolean("early_bird_claimed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── EMAIL EVENTS (open/click/bounce/reply tracking) ──────────────────────────
export const emailEvents = pgTable("email_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  campaignId: text("campaign_id"),
  eventType: text("event_type").notNull(),  // 'open' | 'click' | 'bounce' | 'reply'
  recipientEmail: text("recipient_email").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_email_events_user_id").on(table.userId),
  index("idx_email_events_campaign_id").on(table.campaignId),
  index("idx_email_events_type").on(table.eventType, table.createdAt),
]);

// ─── GMAIL CONNECTIONS ───────────────────────────────────────────────────────
export const gmailConnections = pgTable("gmail_connections", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  googleEmail: text("google_email").notNull(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  tokenExpiresAt: timestamp("token_expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  uniqueIndex("idx_gmail_user").on(table.userId),
]);

// ─── PROSPECTS ────────────────────────────────────────────────────────────────
export const prospects = pgTable("prospects", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email"),
  company: text("company"),
  title: text("title"),
  linkedinUrl: text("linkedin_url"),
  oceanoScores: jsonb("oceano_scores").$type<{
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  }>(),
  tags: jsonb("tags").$type<string[]>(),
  notes: text("notes"),
  lastContactedAt: timestamp("last_contacted_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("idx_prospects_user_id").on(table.userId),
  index("idx_prospects_email").on(table.email),
  index("idx_prospects_company").on(table.company),
  uniqueIndex("idx_prospects_user_email").on(table.userId, table.email),
]);

// ─── AUDIT LOG ────────────────────────────────────────────────────────────────
export const auditLog = pgTable("audit_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  action: text("action").notNull(),           // e.g. 'auth.login', 'swarm.launch'
  resourceType: text("resource_type"),        // e.g. 'campaign', 'vault_document'
  resourceId: text("resource_id"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_audit_log_user_id").on(table.userId),
  index("idx_audit_log_action").on(table.action),
  index("idx_audit_log_created_at").on(table.createdAt),
]);

// ─── TYPES ────────────────────────────────────────────────────────────────────
export type User = typeof users.$inferSelect;
export type AuditLogEntry = typeof auditLog.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type VaultDocument = typeof vaultDocuments.$inferSelect;
export type SwarmExecution = typeof swarmExecutions.$inferSelect;
export type ApiUsage = typeof apiUsage.$inferSelect;
export type ApiUsageDaily = typeof apiUsageDaily.$inferSelect;
export type EmailEvent = typeof emailEvents.$inferSelect;
export type GmailConnection = typeof gmailConnections.$inferSelect;
export type Prospect = typeof prospects.$inferSelect;
