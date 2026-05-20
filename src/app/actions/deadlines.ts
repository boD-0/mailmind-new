"use server";

import { requireAuth } from "@/lib/auth/gatekeeper";
import { db } from "@/db/drizzle";
import { projects } from "@/db/schema";
import { eq, and, isNotNull } from "drizzle-orm";
import { headers } from "next/headers";

export type DeadlineAlert = {
  id: string
  projectName: string
  deadline: string // ISO string
  type: 'within_24h' | 'within_7d' | 'overdue'
}

export async function checkDeadlines(): Promise<DeadlineAlert[]> {
  const head = await headers();
  const mockReq = { headers: head } as unknown as Request;
  const user = await requireAuth(mockReq);

  try {
    const now = new Date()
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const in7d = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    const userProjects = await db
      .select({ id: projects.id, name: projects.name, deadline: projects.deadline })
      .from(projects)
      .where(
        and(
          eq(projects.userId, user.id),
          isNotNull(projects.deadline),
        )
      )

    const alerts: DeadlineAlert[] = []

    for (const p of userProjects) {
      if (!p.deadline) continue
      const deadlineDate = new Date(p.deadline)

      if (deadlineDate < now) {
        alerts.push({
          id: p.id,
          projectName: p.name,
          deadline: deadlineDate.toISOString(),
          type: 'overdue',
        })
      } else if (deadlineDate <= in24h) {
        alerts.push({
          id: p.id,
          projectName: p.name,
          deadline: deadlineDate.toISOString(),
          type: 'within_24h',
        })
      } else if (deadlineDate <= in7d) {
        alerts.push({
          id: p.id,
          projectName: p.name,
          deadline: deadlineDate.toISOString(),
          type: 'within_7d',
        })
      }
    }

    return alerts
  } catch {
    return []
  }
}
