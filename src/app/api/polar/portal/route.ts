import { NextResponse } from "next/server";
import { apiRequireAuth } from "@/lib/auth/gatekeeper";

/**
 * POST /api/polar/portal
 *
 * Creates a Polar.sh customer portal session so users can manage
 * their subscription (upgrade, downgrade, cancel, update payment method).
 *
 * Returns: { url: string } — redirect URL for Polar customer portal
 */
export async function POST(req: Request) {
  const user = await apiRequireAuth(req);
  if (user instanceof NextResponse) return user;

  try {
    const accessToken = process.env.POLAR_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json(
        { error: "Payment system not configured." },
        { status: 500 }
      );
    }

    const polarApiBase = "https://api.polar.sh/v1";

    // Find the customer by external ID
    const customerSearch = await fetch(
      `${polarApiBase}/customers?external_id=${encodeURIComponent(user.id)}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!customerSearch.ok) {
      return NextResponse.json(
        { error: "No billing account found. Subscribe first." },
        { status: 404 }
      );
    }

    const customers = await customerSearch.json();
    const customerId = customers.items?.[0]?.id;

    if (!customerId) {
      return NextResponse.json(
        { error: "No billing account found. Subscribe first." },
        { status: 404 }
      );
    }

    // Create customer portal session
    const portalRes = await fetch(`${polarApiBase}/customer-sessions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customer_id: customerId,
      }),
    });

    if (!portalRes.ok) {
      const err = await portalRes.text();
      console.error("[Polar] Failed to create portal session:", err);
      return NextResponse.json(
        { error: "Failed to open billing portal." },
        { status: 500 }
      );
    }

    const portal = await portalRes.json();

    return NextResponse.json({ url: portal.customer_portal_url || portal.url });
  } catch (error) {
    console.error("[Polar] Portal error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
