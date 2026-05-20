"use server";

import { requireAuth } from "@/lib/auth/gatekeeper";
import { db } from "@/db/drizzle";
import { projects, vaultDocuments } from "@/db/schema";
import { like, or, and, eq, desc } from "drizzle-orm";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type SearchResult = {
  id: string;
  title: string;
  subtitle: string;
  type: "project" | "document" | "idea";
  href: string;
  tag?: string;
  date?: string;
};

export async function searchAll(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) return [];
  const q = query.trim();

  try {
    const head = await headers();
    const mockReq = { headers: head } as unknown as Request;
    const user = await requireAuth(mockReq);

    const results: SearchResult[] = [];

    // ── Search Projects ──
    try {
      const projectResults = await db
        .select({
          id: projects.id,
          name: projects.name,
          industry: projects.industry,
          targetAudience: projects.targetAudience,
          createdAt: projects.createdAt,
        })
        .from(projects)
        .where(
          and(
            eq(projects.userId, user.id),
            or(
              like(projects.name, `%${q}%`),
              like(projects.industry ?? "", `%${q}%`),
              like(projects.targetAudience ?? "", `%${q}%`),
              like(projects.context ?? "", `%${q}%`),
            ),
          ),
        )
        .orderBy(desc(projects.createdAt))
        .limit(5);

      for (const p of projectResults) {
        results.push({
          id: `project-${p.id}`,
          title: p.name,
          subtitle: p.industry ?? "No industry set",
          type: "project",
          href: `/dashboard/war-room/${p.id}`,
          tag: "Project",
          date: p.createdAt?.toISOString().slice(0, 10),
        });
      }
    } catch (e) {
      console.error("Search projects error:", e);
    }

    // ── Search Vault Documents ──
    try {
      const docResults = await db
        .select({
          id: vaultDocuments.id,
          fileName: vaultDocuments.fileName,
          mimeType: vaultDocuments.mimeType,
          projectId: vaultDocuments.projectId,
          createdAt: vaultDocuments.createdAt,
        })
        .from(vaultDocuments)
        .where(
          and(
            eq(vaultDocuments.userId, user.id),
            like(vaultDocuments.fileName, `%${q}%`),
          ),
        )
        .orderBy(desc(vaultDocuments.createdAt))
        .limit(5);

      for (const d of docResults) {
        results.push({
          id: `doc-${d.id}`,
          title: d.fileName,
          subtitle: d.mimeType ?? "Document",
          type: "document",
          href: d.projectId ? `/dashboard/war-room/${d.projectId}` : "/dashboard/vault",
          tag: "Document",
          date: d.createdAt?.toISOString().slice(0, 10),
        });
      }
    } catch (e) {
      console.error("Search documents error:", e);
    }

    // ── Search Ideas (via Supabase) ──
    try {
      const supabase = await createClient();
      const { data: ideaResults, error: ideaErr } = await supabase
        .from("ideas")
        .select("id, title, body, tag, created_at")
        .eq("user_id", user.id)
        .or(`title.ilike.%${q}%,body.ilike.%${q}%,tag.ilike.%${q}%`)
        .order("created_at", { ascending: false })
        .limit(5);

      if (!ideaErr && ideaResults) {
        for (const idea of ideaResults) {
          results.push({
            id: `idea-${idea.id}`,
            title: idea.title,
            subtitle: idea.body?.slice(0, 80) ?? idea.tag ?? "Idea",
            type: "idea",
            href: `/dashboard/ideas`,
            tag: idea.tag ?? undefined,
            date: new Date(idea.created_at).toISOString().slice(0, 10),
          });
        }
      }
    } catch (e) {
      console.error("Search ideas error:", e);
    }

    // Sort combined results by date desc
    results.sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return b.date.localeCompare(a.date);
    });

    return results.slice(0, 15);
  } catch (err) {
    console.error("Search error:", err);
    return [];
  }
}
