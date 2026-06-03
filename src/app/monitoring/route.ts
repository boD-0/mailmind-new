import { NextRequest, NextResponse } from "next/server";

/**
 * Sentry tunnel route — proxies Sentry envelope payloads to the Sentry ingest
 * endpoint so they bypass ad-blockers.  The route is declared explicitly because
 * `withSentryConfig({ tunnelRoute: "/monitoring" })` creates a virtual route
 * that Turbopack does not always surface.
 */
export async function POST(request: NextRequest) {
  try {
    const envelope = await request.text();
    const piece = envelope.split("\n")[0] ?? "";
    const header = JSON.parse(piece);

    if (!header.dsn) {
      return NextResponse.json({ error: "Missing DSN" }, { status: 400 });
    }

    const dsn = new URL(header.dsn);
    const projectId = dsn.pathname?.replace("/", "") ?? "";

if (!projectId) {
  return NextResponse.json({ error: "Invalid DSN" }, { status: 400 });
}
    const sentryUrl = `https://${dsn.host}/api/${projectId}/envelope/`;

    const response = await fetch(sentryUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-sentry-envelope",
      },
      body: envelope,
    });

    return new NextResponse(response.body, {
      status: response.status,
    });
  } catch {
    return NextResponse.json({ error: "Tunnel error" }, { status: 500 });
  }
}
