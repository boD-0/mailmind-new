import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { vaultDocuments } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { apiRequireAuth } from "@/lib/auth/gatekeeper";

export async function GET(req: Request) {
  const user = await apiRequireAuth(req);
  if (user instanceof NextResponse) return user;

  try {
    const docs = await db
      .select({
        id: vaultDocuments.id,
        fileName: vaultDocuments.fileName,
        fileKey: vaultDocuments.fileKey,
        fileUrl: vaultDocuments.fileUrl,
        fileSize: vaultDocuments.fileSize,
        mimeType: vaultDocuments.mimeType,
        projectId: vaultDocuments.projectId,
        createdAt: vaultDocuments.createdAt,
      })
      .from(vaultDocuments)
      .where(eq(vaultDocuments.userId, user.id))
      .orderBy(desc(vaultDocuments.createdAt))
      .limit(100);

    return NextResponse.json({ documents: docs });
  } catch (error) {
    console.error("Vault list error:", error);
    return NextResponse.json({ error: "Failed to list documents" }, { status: 500 });
  }
}
