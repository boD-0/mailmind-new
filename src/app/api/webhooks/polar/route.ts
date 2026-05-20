import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { Plan } from "@/lib/auth/gatekeeper";
import crypto from "crypto";
import { getPostHogClient } from "@/lib/posthog-server";

import { safeJsonParse } from "@/lib/utils";

function verifyWebhookSignature(body: string, signature: string): boolean {
  const secret = process.env.POLAR_WEBHOOK_SECRET!;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");
  return `sha256=${expected}` === signature;
}

function getPlanFromProductId(productId: string): Plan {
  if (productId === process.env.NEXT_PUBLIC_PRO_TIER) return "PROFESSIONAL";
  if (productId === process.env.NEXT_PUBLIC_STARTER_TIER) return "STARTER";
  return "FREE";
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
      customer?: { id: string }; 
      product?: { id: string };
    } 
  } | null>(body, null);
  if (!event) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const { type, data } = event;

  const customerId = data?.customer?.id ?? data?.customerId;
  const subscriptionId = data?.id;
  const productId = data?.productId ?? data?.product?.id;

  if (!customerId) {
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
      .where(eq(users.polarCustomerId, customerId));

    if (type === "subscription.created") {
      getPostHogClient().capture({
        distinctId: customerId,
        event: 'subscription_created',
        properties: { plan, subscription_id: subscriptionId, product_id: productId },
      });
    }
  }

  if (type === "subscription.canceled" || type === "subscription.revoked") {
    await db
      .update(users)
      .set({ plan: "FREE", polarSubscriptionId: null, updatedAt: new Date() })
      .where(eq(users.polarCustomerId, customerId));

    getPostHogClient().capture({
      distinctId: customerId,
      event: 'subscription_canceled',
      properties: { subscription_id: subscriptionId, reason: type },
    });
  }

  return NextResponse.json({ received: true });
}
