"use server";

import { requireAuth } from "@/lib/auth/gatekeeper";
import { db } from "@/db/drizzle";
import { projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function getUserProjectProfile() {
  const head = await headers();
  const mockReq = { headers: head } as unknown as Request;
  const user = await requireAuth(mockReq);

  try {
    const project = await db
      .select()
      .from(projects)
      .where(eq(projects.userId, user.id))
      .limit(1);

    if (!project[0]) return null;

    return {
      name: project[0].name,
      industry: project[0].industry || "",
      toneOfVoice: project[0].toneOfVoice || "",
      targetAudience: project[0].targetAudience || "",
      context: project[0].context || "",
      brandValues: project[0].brandValues || [],
      painPoints: project[0].painPoints ?? [],
    };
  } catch {
    return null;
  }
}
