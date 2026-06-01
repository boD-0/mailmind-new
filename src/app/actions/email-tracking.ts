"use server";

import { db } from "@/db/drizzle";
import { emailEvents } from "@/db/schema";
import { eq, and, sql, count } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";

export interface EmailTrackingStats {
  totalSent: number;
  uniqueOpens: number;
  uniqueClicks: number;
  openRate: number;
  clickRate: number;
  recentEvents: Array<{
    id: string;
    eventType: string;
    recipientEmail: string;
    campaignId: string | null;
    metadata: unknown;
    createdAt: string;
  }>;
}

export async function getEmailTrackingStats(campaignId?: string): Promise<EmailTrackingStats | null> {
  const head = await headers();
  const session = await auth.api.getSession({ headers: head });
  if (!session) return null;

  const userId = session.user.id;

  // Base condition: events for this user
  const userCondition = eq(emailEvents.userId, userId);
  const campaignCondition = campaignId ? eq(emailEvents.campaignId, campaignId) : undefined;

  // Total sent (could be a separate metric, for now count all)
  const totalSentResult = await db
    .select({ count: count() })
    .from(emailEvents)
    .where(and(userCondition, ...(campaignCondition ? [campaignCondition] : [])));

  // Unique opens
  const opensResult = await db
    .select({ count: count() })
    .from(emailEvents)
    .where(
      and(
        userCondition,
        eq(emailEvents.eventType, "open"),
        ...(campaignCondition ? [campaignCondition] : [])
      )
    );

  // Unique clicks
  const clicksResult = await db
    .select({ count: count() })
    .from(emailEvents)
    .where(
      and(
        userCondition,
        eq(emailEvents.eventType, "click"),
        ...(campaignCondition ? [campaignCondition] : [])
      )
    );

  const totalSent = totalSentResult[0]?.count ?? 0;
  const uniqueOpens = opensResult[0]?.count ?? 0;
  const uniqueClicks = clicksResult[0]?.count ?? 0;

  // Recent events (last 20)
  const recentEvents = await db
    .select({
      id: emailEvents.id,
      eventType: emailEvents.eventType,
      recipientEmail: emailEvents.recipientEmail,
      campaignId: emailEvents.campaignId,
      metadata: emailEvents.metadata,
      createdAt: emailEvents.createdAt,
    })
    .from(emailEvents)
    .where(and(userCondition, ...(campaignCondition ? [campaignCondition] : [])))
    .orderBy(sql`${emailEvents.createdAt} DESC`)
    .limit(20);

  return {
    totalSent,
    uniqueOpens,
    uniqueClicks,
    openRate: totalSent > 0 ? Math.round((uniqueOpens / totalSent) * 100) : 0,
    clickRate: totalSent > 0 ? Math.round((uniqueClicks / totalSent) * 100) : 0,
    recentEvents: recentEvents.map((e) => ({
      ...e,
      createdAt: e.createdAt instanceof Date ? e.createdAt.toISOString() : String(e.createdAt),
    })),
  };
}
