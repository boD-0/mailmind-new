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
  painPoints: string[];
  selectedPlan: "FREE" | "STARTER" | "PROFESSIONAL";
}) {
  const head = await headers();
  const mockReq = { headers: head } as unknown as Request;
  const user = await requireAuth(mockReq);

  try {
    // 1. Determine trial end date if PROFESSIONAL plan selected
    let trialEnd: Date | null = null;
    if (formData.selectedPlan === "PROFESSIONAL") {
      // 14-day trial from signup
      trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    }

    // 2. Creează proiectul inițial
    await db.insert(projects).values({
      userId: user.id,
      name: formData.name,
      industry: formData.industry,
      toneOfVoice: formData.toneOfVoice,
      targetAudience: formData.targetAudience,
      context: formData.context,
      brandValues: formData.brandValues,
      painPoints: formData.painPoints,
    });

    // 3. Update user plan and trial
    await db.update(users)
      .set({
        onboardingComplete: true,
        plan: formData.selectedPlan,
        trialEnd: trialEnd || null,
      })
      .where(eq(users.id, user.id));

    return { success: true };
  } catch (error) {
    console.error("Onboarding error:", error);
    return { error: "A apărut o eroare la salvarea datelor." };
  }
}
