import { NextResponse } from "next/server";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { r2Client, R2_BUCKET } from "@/lib/r2";
import { db } from "@/db/drizzle";
import { vaultDocuments } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { apiRequireAuth } from "@/lib/auth/gatekeeper";
import { safeJsonParse } from "@/lib/utils";

export async function POST(req: Request) {
  const user = await apiRequireAuth(req);
  if (user instanceof NextResponse) return user;

  try {
    const text = await req.text();
    const body = safeJsonParse<{ documentId?: string }>(text, {});
    const documentId = body.documentId;

    if (!documentId) {
      return NextResponse.json({ error: "Missing documentId" }, { status: 400 });
    }

    // Fetch document and verify ownership
    const [doc] = await db
      .select({ id: vaultDocuments.id, fileKey: vaultDocuments.fileKey, userId: vaultDocuments.userId })
      .from(vaultDocuments)
      .where(and(eq(vaultDocuments.id, documentId), eq(vaultDocuments.userId, user.id)))
      .limit(1);

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Delete from R2
    try {
      await r2Client.send(
        new DeleteObjectCommand({
          Bucket: R2_BUCKET,
          Key: doc.fileKey,
        })
      );
    } catch (r2Error) {
      console.error("R2 delete error:", r2Error);
      // Continue with DB delete even if R2 delete fails
    }

    // Delete from DB
    await db.delete(vaultDocuments).where(eq(vaultDocuments.id, documentId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Vault delete error:", error);
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
  }
}
