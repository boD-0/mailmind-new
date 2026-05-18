import {
  pgTable,
  pgEnum,
  text,
  boolean,
  timestamp,
  jsonb,
  uuid,
  integer,
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

// ─── TYPES ────────────────────────────────────────────────────────────────────
export type User = typeof users.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type VaultDocument = typeof vaultDocuments.$inferSelect;
export type SwarmExecution = typeof swarmExecutions.$inferSelect;
