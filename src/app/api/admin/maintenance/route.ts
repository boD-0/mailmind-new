import { NextResponse } from "next/server";
import { toggleMaintenanceMode, getMaintenanceMode } from "@/app/actions/admin";

/**
 * GET /api/admin/maintenance — get current maintenance status
 */
export async function GET() {
  try {
    const active = await getMaintenanceMode();
    return NextResponse.json({ maintenance: active });
  } catch {
    return NextResponse.json({ maintenance: false });
  }
}

/**
 * POST /api/admin/maintenance — toggle maintenance mode
 * Body: { enabled: boolean }
 */
export async function POST(request: Request) {
  try {
    const { enabled } = await request.json();
    const result = await toggleMaintenanceMode(enabled);
    if (!result.success) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 },
      );
    }
    return NextResponse.json({ maintenance: result.maintenance });
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 },
    );
  }
}
