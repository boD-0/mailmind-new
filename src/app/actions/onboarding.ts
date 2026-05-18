"use server";

import { requireAuth } from "@/lib/auth/gatekeeper";
import { db } from "@/db/drizzle";
import { projects, users } from "@/db/schema";
import { eq } from "drizzle-orm";

import { headers } from "next/headers";

export async function submitOnboarding(formData: {
  name: string;
  industry: string;
  toneOfVoice: string;
  targetAudience: string;
  context?: string;
  brandValues: string[];
}) {
  const head = await headers();
  const mockReq = { headers: head } as unknown as Request;
  const user = await requireAuth(mockReq);

  try {
    // 1. Creează proiectul inițial
    await db.insert(projects).values({
      userId: user.id,
      name: formData.name,
      industry: formData.industry,
      toneOfVoice: formData.toneOfVoice,
      targetAudience: formData.targetAudience,
      context: formData.context,
      brandValues: formData.brandValues,
    });

    // 2. Marchez onboarding-ul ca fiind complet
    await db.update(users)
      .set({ onboardingComplete: true })
      .where(eq(users.id, user.id));

    return { success: true };
  } catch (error) {
    console.error("Onboarding error:", error);
    return { error: "A apărut o eroare la salvarea datelor." };
  }
}
