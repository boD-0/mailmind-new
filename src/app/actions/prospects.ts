"use server";

import { db } from "@/db/drizzle";
import { prospects } from "@/db/schema";
import { auth } from "@/lib/auth/auth";
import { eq, and, desc, ilike, or, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ProspectData {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  title: string | null;
  linkedinUrl: string | null;
  oceanoScores: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  } | null;
  tags: string[];
  notes: string | null;
  lastContactedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertProspectInput {
  name: string;
  email?: string;
  company?: string;
  title?: string;
  linkedinUrl?: string;
  oceanoScores?: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  tags?: string[];
  notes?: string;
}

function serialize(p: typeof prospects.$inferSelect): ProspectData {
  return {
    id: p.id,
    name: p.name,
    email: p.email,
    company: p.company,
    title: p.title,
    linkedinUrl: p.linkedinUrl,
    oceanoScores: p.oceanoScores ?? null,
    tags: p.tags ?? [],
    notes: p.notes,
    lastContactedAt: p.lastContactedAt?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

// ─── List Prospects ─────────────────────────────────────────────────────────

export async function listProspects(search?: string): Promise<ProspectData[]> {
  const head = await headers();
  const session = await auth.api.getSession({ headers: new Headers(head) } as any);
  if (!session) return [];

  const userId = session.user.id;

  const baseCondition = eq(prospects.userId, userId);

  if (search && search.trim().length >= 2) {
    const q = `%${search.trim()}%`;
    const rows = await db
      .select()
      .from(prospects)
      .where(
        and(
          baseCondition,
          or(
            ilike(prospects.name, q),
            ilike(prospects.email ?? "", q),
            ilike(prospects.company ?? "", q),
            ilike(prospects.title ?? "", q),
          ),
        ),
      )
      .orderBy(desc(prospects.updatedAt))
      .limit(50);
    return rows.map(serialize);
  }

  const rows = await db
    .select()
    .from(prospects)
    .where(baseCondition)
    .orderBy(desc(prospects.updatedAt))
    .limit(50);
  return rows.map(serialize);
}

// ─── Get Single Prospect ────────────────────────────────────────────────────

export async function getProspect(id: string): Promise<ProspectData | null> {
  const head = await headers();
  const session = await auth.api.getSession({ headers: new Headers(head) } as any);
  if (!session) return null;

  const row = await db
    .select()
    .from(prospects)
    .where(and(eq(prospects.id, id), eq(prospects.userId, session.user.id)))
    .limit(1);

  return row[0] ? serialize(row[0]) : null;
}

// ─── Upsert Prospect ────────────────────────────────────────────────────────

export async function upsertProspect(
  input: UpsertProspectInput & { id?: string },
): Promise<ProspectData> {
  const head = await headers();
  const session = await auth.api.getSession({ headers: new Headers(head) } as any);
  if (!session) throw new Error("Unauthorized");

  const userId = session.user.id;
  const now = new Date();

  const values = {
    name: input.name,
    email: input.email ?? null,
    company: input.company ?? null,
    title: input.title ?? null,
    linkedinUrl: input.linkedinUrl ?? null,
    oceanoScores: input.oceanoScores ?? null,
    tags: input.tags ?? [],
    notes: input.notes ?? null,
    updatedAt: now,
  };

  if (input.id) {
    // Update existing
    await db
      .update(prospects)
      .set(values)
      .where(and(eq(prospects.id, input.id), eq(prospects.userId, userId)));

    revalidatePath("/", "layout");
    const row = await getProspect(input.id);
    if (!row) throw new Error("Prospect not found after update");
    return row;
  }

  // Insert new
  const [row] = await db
    .insert(prospects)
    .values({
      ...values,
      userId,
      createdAt: now,
    } as typeof prospects.$inferInsert)
    .returning();

  revalidatePath("/", "layout");
  if (!row) throw new Error("Failed to create prospect");
  return serialize(row);
}

// ─── Delete Prospect ────────────────────────────────────────────────────────

export async function deleteProspect(id: string): Promise<void> {
  const head = await headers();
  const session = await auth.api.getSession({ headers: new Headers(head) } as any);
  if (!session) throw new Error("Unauthorized");

  await db
    .delete(prospects)
    .where(and(eq(prospects.id, id), eq(prospects.userId, session.user.id)));

  revalidatePath("/", "layout");
}

// ─── Touch Prospect (update last contacted) ─────────────────────────────────

export async function touchProspect(id: string): Promise<void> {
  const head = await headers();
  const session = await auth.api.getSession({ headers: new Headers(head) } as any);
  if (!session) throw new Error("Unauthorized");

  await db
    .update(prospects)
    .set({ lastContactedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(prospects.id, id), eq(prospects.userId, session.user.id)));
}
