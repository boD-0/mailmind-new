"use server";

import { requireAuth } from "@/lib/auth/gatekeeper";
import { db } from "@/db/drizzle";
import { users, projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

// ─── Update user name ────────────────────────────────────────────────────────
// ─── Update avatar ────────────────────────────────────────────────────────
export async function updateAvatar(avatarId: number) {
  const head = await headers();
  const mockReq = { headers: head } as unknown as Request;
  const user = await requireAuth(mockReq);

  try {
    await db
      .update(users)
      .set({ image: String(avatarId) })
      .where(eq(users.id, user.id));

    return { success: true };
  } catch (error) {
    console.error("Update avatar error:", error);
    return { error: "Failed to update avatar." };
  }
}

// ─── Update user name ────────────────────────────────────────────────────────
export async function updateProfileName(name: string) {
  const head = await headers();
  const mockReq = { headers: head } as unknown as Request;
  const user = await requireAuth(mockReq);

  try {
    await db
      .update(users)
      .set({ name })
      .where(eq(users.id, user.id));

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Update name error:", error);
    return { error: "Failed to update name." };
  }
}

// ─── Update brand profile ────────────────────────────────────────────────────
export type BrandProfile = {
  name: string;
  industry: string;
  toneOfVoice: string;
  targetAudience: string;
  context: string;
  brandValues: string[];
  painPoints: string[];
};

export async function updateBrandProfile(data: BrandProfile) {
  const head = await headers();
  const mockReq = { headers: head } as unknown as Request;
  const user = await requireAuth(mockReq);

  try {
    const existing = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.userId, user.id))
      .limit(1);

    if (existing[0]) {
      await db
        .update(projects)
        .set({
          name: data.name,
          industry: data.industry,
          toneOfVoice: data.toneOfVoice,
          targetAudience: data.targetAudience,
          context: data.context,
          brandValues: data.brandValues,
          painPoints: data.painPoints,
        })
        .where(eq(projects.id, existing[0].id));
    } else {
      await db.insert(projects).values({
        userId: user.id,
        ...data,
      });
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Update brand error:", error);
    return { error: "Failed to update brand profile." };
  }
}

// ─── Get user profile (name + brand) ─────────────────────────────────────────
export async function getUserProfile() {
  const head = await headers();
  const mockReq = { headers: head } as unknown as Request;
  const user = await requireAuth(mockReq);

  try {
    const project = await db
      .select()
      .from(projects)
      .where(eq(projects.userId, user.id))
      .limit(1);

    return {
      name: user.name,
      email: user.email,
      plan: user.plan,
      avatarId: user.image ? parseInt(user.image) : 1,
      brand: project[0]
        ? {
            name: project[0].name,
            industry: project[0].industry || "",
            toneOfVoice: project[0].toneOfVoice || "",
            targetAudience: project[0].targetAudience || "",
            context: project[0].context || "",
            brandValues: project[0].brandValues || [],
            painPoints: project[0].painPoints ?? [],
          }
        : null,
    };
  } catch {
    return {
      name: user.name,
      email: user.email,
      plan: user.plan,
      avatarId: 1,
      brand: null,
    };
  }
}
