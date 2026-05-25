import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { Plan } from "@/lib/auth/gatekeeper";
import crypto from "crypto";
import { getPostHogClient } from "@/lib/posthog-server";

import { safeJsonParse } from "@/lib/utils";

function verifyWebhookSignature(body: string, signature: string): boolean {
  const secret = process.env.POLAR_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[Polar] POLAR_WEBHOOK_SECRET not configured — rejecting webhook");
    return false;
  }
  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");
  return `sha256=${expected}` === signature;
}

function getPlanFromProductId(productId: string): Plan {
  if (productId === process.env.POLAR_PRO_PRODUCT_ID) return "PROFESSIONAL";
  if (productId === process.env.POLAR_STARTER_PRODUCT_ID) return "STARTER";
  return "FREE";
}

/**
 * Look up a user by Polar customer ID or, as a fallback, by email
 * (email comes from the customer metadata on the checkout/event).
 */
async function findUserByCustomer(
  customerId: string,
  customerEmail?: string
): Promise<string | null> {
  // Try by polarCustomerId first (the normal path)
  const byCustomer = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.polarCustomerId, customerId))
    .limit(1);
  if (byCustomer.length > 0) return byCustomer[0]!.id;

  // Fallback: match by email (handles first-time subscription where
  // the customer was just created and user row may not have polarCustomerId yet)
  if (customerEmail) {
    const byEmail = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, customerEmail.toLowerCase()))
      .limit(1);
    if (byEmail.length > 0) return byEmail[0]!.id;
  }

  return null;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("webhook-signature") ?? "";

  if (!verifyWebhookSignature(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = safeJsonParse<{ 
    type: string; 
    data: { 
      id?: string; 
      customerId?: string; 
      productId?: string; 
      customer?: { id: string; email?: string }; 
      product?: { id: string };
    } 
  } | null>(body, null);
  if (!event) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const { type, data } = event;

  const customerId = data?.customer?.id ?? data?.customerId;
  const customerEmail = data?.customer?.email;
  const subscriptionId = data?.id;
  const productId = data?.productId ?? data?.product?.id;

  if (!customerId) {
    return NextResponse.json({ received: true });
  }

  const userId = await findUserByCustomer(customerId, customerEmail);
  if (!userId) {
    console.warn(`[Polar] No user matched for customer ${customerId} — event ${type} skipped`);
    return NextResponse.json({ received: true });
  }

  if (type === "subscription.created" || type === "subscription.updated") {
    const plan = getPlanFromProductId(productId ?? '');
    await db
      .update(users)
      .set({
        plan,
        polarCustomerId: customerId,
        polarSubscriptionId: subscriptionId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    if (type === "subscription.created") {
      getPostHogClient().capture({
        distinctId: userId,
        event: 'subscription_created',
        properties: { plan, subscription_id: subscriptionId, product_id: productId },
      });
    }
  }

  if (type === "subscription.canceled" || type === "subscription.revoked") {
    await db
      .update(users)
      .set({ plan: "FREE", polarSubscriptionId: null, updatedAt: new Date() })
      .where(eq(users.id, userId));

    getPostHogClient().capture({
      distinctId: userId,
      event: 'subscription_canceled',
      properties: { subscription_id: subscriptionId, reason: type },
    });
  }

  return NextResponse.json({ received: true });
}
