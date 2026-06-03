CREATE TABLE "api_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"endpoint" text NOT NULL,
	"method" text DEFAULT 'POST' NOT NULL,
	"tokens_used" integer DEFAULT 0,
	"request_count" integer DEFAULT 1,
	"status_code" integer DEFAULT 200,
	"ip_address" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "api_usage_daily" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"date" date NOT NULL,
	"endpoint" text NOT NULL,
	"total_requests" integer DEFAULT 0,
	"total_tokens" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"action" text NOT NULL,
	"resource_type" text,
	"resource_id" text,
	"metadata" jsonb,
	"ip_address" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"prospect_name" text,
	"prospect_url" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"swarm_params" jsonb DEFAULT '{}'::jsonb,
	"research_data" jsonb DEFAULT '{}'::jsonb,
	"twin_profile" jsonb DEFAULT '{}'::jsonb,
	"strategy" jsonb DEFAULT '{}'::jsonb,
	"email_draft" text,
	"confidence_score" integer DEFAULT 0,
	"brand_context" jsonb DEFAULT '{}'::jsonb,
	"swarm_mode" text DEFAULT 'deep',
	"project_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"campaign_id" text,
	"event_type" text NOT NULL,
	"recipient_email" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gmail_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"google_email" text NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text,
	"token_expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ideas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"body" text,
	"tag" text,
	"campaign_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prospects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"company" text,
	"title" text,
	"linkedin_url" text,
	"oceano_scores" jsonb,
	"tags" jsonb,
	"notes" text,
	"last_contacted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "swarm_traces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid,
	"user_id" text NOT NULL,
	"run_index" integer DEFAULT 1 NOT NULL,
	"trace_log" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"final_scores" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"twin_snapshot" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "waitlist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"referral_source" text,
	"early_bird" boolean DEFAULT false NOT NULL,
	"early_bird_claimed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "waitlist_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "pain_points" jsonb;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "deadline" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "trial_end" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "swarm_credits" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "api_usage" ADD CONSTRAINT "api_usage_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_usage_daily" ADD CONSTRAINT "api_usage_daily_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_events" ADD CONSTRAINT "email_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gmail_connections" ADD CONSTRAINT "gmail_connections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ideas" ADD CONSTRAINT "ideas_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ideas" ADD CONSTRAINT "ideas_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prospects" ADD CONSTRAINT "prospects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "swarm_traces" ADD CONSTRAINT "swarm_traces_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "swarm_traces" ADD CONSTRAINT "swarm_traces_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_api_usage_user_id" ON "api_usage" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_api_usage_created_at" ON "api_usage" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_api_usage_endpoint" ON "api_usage" USING btree ("endpoint");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_api_usage_daily_unique" ON "api_usage_daily" USING btree ("user_id","date","endpoint");--> statement-breakpoint
CREATE INDEX "idx_audit_log_user_id" ON "audit_log" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_audit_log_action" ON "audit_log" USING btree ("action");--> statement-breakpoint
CREATE INDEX "idx_audit_log_created_at" ON "audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_campaigns_user_id" ON "campaigns" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_campaigns_status" ON "campaigns" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_campaigns_created_at" ON "campaigns" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_email_events_user_id" ON "email_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_email_events_campaign_id" ON "email_events" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "idx_email_events_type" ON "email_events" USING btree ("event_type","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_gmail_user" ON "gmail_connections" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_ideas_user_id" ON "ideas" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_ideas_created_at" ON "ideas" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_prospects_user_id" ON "prospects" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_prospects_email" ON "prospects" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_prospects_company" ON "prospects" USING btree ("company");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_prospects_user_email" ON "prospects" USING btree ("user_id","email");--> statement-breakpoint
CREATE INDEX "idx_swarm_traces_user_id" ON "swarm_traces" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_swarm_traces_campaign_id" ON "swarm_traces" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "idx_swarm_traces_created_at" ON "swarm_traces" USING btree ("created_at");