import { NextResponse } from 'next/server'

/**
 * GET /api/usage
 *
 * Returns API usage percentage for the current user.
 * Stub implementation — always returns 0% usage for first-time setup.
 * Will be replaced with real DB-backed usage tracking in production.
 */
export async function GET() {
  return NextResponse.json({
    usagePercent: 0,
    isExceeded: false,
  })
}
