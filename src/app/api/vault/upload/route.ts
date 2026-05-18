import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client, R2_BUCKET } from "@/lib/r2";
import { requireOnboarding, checkFeatureAccess } from "@/lib/auth/gatekeeper";
import { db } from "@/db/drizzle";
import { vaultDocuments } from "@/db/schema";
import { randomUUID } from "crypto";
import { safeJsonParse } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const user = await requireOnboarding(req);

  if (!checkFeatureAccess(user.plan, "hasVault")) {
    return NextResponse.json(
      { error: "Email Vault este disponibil doar pentru planurile STARTER și PROFESSIONAL." },
      { status: 403 }
    );
  }

  const text = await req.text();
  const body = safeJsonParse<{ fileName?: string, mimeType?: string, fileSize?: number, projectId?: string }>(text, {});
  const { fileName, mimeType, fileSize, projectId } = body;

  if (!fileName || !mimeType || !fileSize) {
    return NextResponse.json({ error: 'Missing file metadata' }, { status: 400 });
  }

  const fileKey = `${user.id}/${randomUUID()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: fileKey,
    ContentType: mimeType,
    ContentLength: fileSize,
  });

  const presignedUrl = await getSignedUrl(r2Client, command, {
    expiresIn: 3600,
  });

  const fileUrl = `${process.env.R2_PUBLIC_URL}/${fileKey}`;

  await db.insert(vaultDocuments).values({
    userId: user.id,
    projectId: projectId ?? null,
    fileName,
    fileKey,
    fileUrl,
    fileSize,
    mimeType,
  });

  return NextResponse.json({ presignedUrl, fileUrl, fileKey });
}
