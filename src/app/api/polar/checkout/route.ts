import { NextResponse } from "next/server";
import { apiRequireAuth } from "@/lib/auth/gatekeeper";
import { safeJsonParse } from "@/lib/utils";
import { getPostHogClient } from "@/lib/posthog-server";

/**
 * POST /api/polar/checkout
 *
 * Creates a Polar.sh checkout session for a given plan tier.
 * Body: { plan: "STARTER" | "PROFESSIONAL" }
 *
 * Returns: { url: string } — redirect URL for Polar hosted checkout
 */
export async function POST(req: Request) {
  const user = await apiRequireAuth(req);
  if (user instanceof NextResponse) return user;

  try {
    const text = await req.text();
    const body = safeJsonParse<{ plan?: string }>(text, {});
    const { plan } = body;

    if (!plan || (plan !== "STARTER" && plan !== "PROFESSIONAL")) {
      return NextResponse.json(
        { error: "Invalid plan. Must be STARTER or PROFESSIONAL." },
        { status: 400 }
      );
    }

    const accessToken = process.env.POLAR_ACCESS_TOKEN;
    if (!accessToken) {
      console.error("[Polar] POLAR_ACCESS_TOKEN not set");
      return NextResponse.json(
        { error: "Payment system not configured." },
        { status: 500 }
      );
    }

    const polarApiBase = "https://api.polar.sh/v1";

    // Step 1: Find or create customer in Polar
    let customerId = "";

    const customerSearch = await fetch(
      `${polarApiBase}/customers?external_id=${encodeURIComponent(user.id)}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (customerSearch.ok) {
      const customers = await customerSearch.json();
      if (customers.items?.length > 0) {
        customerId = customers.items[0].id;
      }
    }

    if (!customerId) {
      // Create new customer
      const customerRes = await fetch(`${polarApiBase}/customers`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          external_id: user.id,
          email: user.email,
          name: user.name || user.email,
          metadata: { userId: user.id },
        }),
      });

      if (!customerRes.ok) {
        const err = await customerRes.text();
        console.error("[Polar] Failed to create customer:", err);
        return NextResponse.json(
          { error: "Failed to create payment customer." },
          { status: 500 }
        );
      }

      const customer = await customerRes.json();
      customerId = customer.id;
    }

    // Step 2: Get the product ID for the plan
    const productId =
      plan === "PROFESSIONAL"
        ? process.env.POLAR_PRO_PRODUCT_ID
        : process.env.POLAR_STARTER_PRODUCT_ID;

    if (!productId) {
      console.error(`[Polar] Missing product ID env var for plan: ${plan}`);
      return NextResponse.json(
        { error: "Payment configuration missing for this plan." },
        { status: 500 }
      );
    }

    // Step 3: Create checkout session
    const successUrl = `${process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin}/dashboard?checkout=success`;
    const checkoutRes = await fetch(`${polarApiBase}/checkouts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_id: productId,
        customer_id: customerId,
        success_url: successUrl,
        metadata: { userId: user.id, plan },
      }),
    });

    if (!checkoutRes.ok) {
      const err = await checkoutRes.text();
      console.error("[Polar] Failed to create checkout:", err);
      return NextResponse.json(
        { error: "Failed to create checkout session." },
        { status: 500 }
      );
    }

    const checkout = await checkoutRes.json();

    getPostHogClient().capture({
      distinctId: user.id,
      event: "polar_checkout_initiated",
      properties: { plan, tier: plan },
    });

    return NextResponse.json({ url: checkout.url });
  } catch (error) {
    console.error("[Polar] Checkout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
