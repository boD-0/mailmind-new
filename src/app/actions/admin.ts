"use server";

import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redis } from "@/lib/redis";

const MAINTENANCE_KEY = "mailmind:maintenance";

/**
 * Check if the current user is an admin.
 * Admin is identified by matching their email against ADMIN_EMAIL env var.
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.email) return false;
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) return false;
    return session.user.email.toLowerCase() === adminEmail.toLowerCase();
  } catch {
    return false;
  }
}

/**
 * Get current maintenance mode status.
 * Returns false if Redis is unavailable (fail-open).
 */
export async function getMaintenanceMode(): Promise<boolean> {
  try {
    const val = await redis.get(MAINTENANCE_KEY);
    return val === "true" || val === "1";
  } catch {
    return false;
  }
}

/**
 * Toggle maintenance mode on/off. Only callable by admin.
 * Returns the new state.
 */
export async function toggleMaintenanceMode(
  enabled: boolean,
): Promise<{ success: boolean; maintenance: boolean }> {
  try {
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      return { success: false, maintenance: await getMaintenanceMode() };
    }

    if (enabled) {
      await redis.set(MAINTENANCE_KEY, "true");
    } else {
      await redis.del(MAINTENANCE_KEY);
    }

    return { success: true, maintenance: enabled };
  } catch {
    return { success: false, maintenance: false };
  }
}
