import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";

export async function GET() {
  try {
    // Test 1: Can we access the auth database adapter?
    const results: Record<string, unknown> = {};

    // Test 2: Try to list sessions (read operation - should work)
    try {
      const sessions = await auth.api.listSessions({
        headers: new Headers(),
      });
      results.listSessions = { ok: true, data: JSON.stringify(sessions).slice(0, 200) };
    } catch (e: unknown) {
      results.listSessions = { ok: false, error: e instanceof Error ? e.message : String(e) };
    }

    // Test 3: Try a sign-up mutation to capture the error
    try {
      const testEmail = `diag-${Date.now()}@test.example.com`;
      const result = await auth.api.signUpEmail({
        body: {
          name: "Diagnostic Test",
          email: testEmail,
          password: "DiagnosticTest123!",
          polarSubscriptionId: "",
          trialEnd: new Date(),
        },
      });
      results.signUp = { ok: true, data: JSON.stringify(result).slice(0, 500) };
    } catch (e: unknown) {
      results.signUp = {
        ok: false,
        error: e instanceof Error ? e.message : String(e),
        stack: e instanceof Error ? e.stack?.slice(0, 1000) : undefined,
        name: e instanceof Error ? e.name : undefined,
      };
    }

    // Test 4: Try a sign-in mutation
    try {
      const result = await auth.api.signInEmail({
        body: {
          email: "nonexistent@test.com",
          password: "test123",
        },
      });
      results.signIn = { ok: true, data: JSON.stringify(result).slice(0, 500) };
    } catch (e: unknown) {
      results.signIn = {
        ok: false,
        error: e instanceof Error ? e.message : String(e),
        stack: e instanceof Error ? e.stack?.slice(0, 1000) : undefined,
        name: e instanceof Error ? e.name : undefined,
      };
    }

    // Test 5: Sign-out (needs session — test with header-based auth)
    try {
      const result = await auth.api.signOut({
        headers: new Headers(),
      });
      results.signOut = { ok: true, data: JSON.stringify(result).slice(0, 500) };
    } catch (e: unknown) {
      results.signOut = {
        ok: false,
        error: e instanceof Error ? e.message : String(e),
        name: e instanceof Error ? e.name : undefined,
      };
    }

    return NextResponse.json(results, { status: 200 });
  } catch (e: unknown) {
    return NextResponse.json(
      {
        error: e instanceof Error ? e.message : String(e),
        stack: e instanceof Error ? e.stack?.slice(0, 2000) : undefined,
      },
      { status: 500 }
    );
  }
}
