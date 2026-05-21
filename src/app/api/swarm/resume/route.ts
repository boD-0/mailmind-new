import { NextResponse } from "next/server";
import { apiRequireAuth } from "@/lib/auth/gatekeeper";

export async function GET(request: Request) {
  const user = await apiRequireAuth(request);
  if (user instanceof NextResponse) return user;

  return NextResponse.json({ message: "Resume endpoint", userId: user.id });
}
