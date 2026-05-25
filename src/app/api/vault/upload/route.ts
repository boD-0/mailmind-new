import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import { r2Client, R2_BUCKET } from "@/lib/r2";
import { db } from "@/db/drizzle";
import { vaultDocuments } from "@/db/schema";
import { safeJsonParse } from "@/lib/utils";
import { requireOnboarding, checkFeatureAccess } from "@/lib/auth/gatekeeper";
import { tieredUploadRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const user = await requireOnboarding(req);

  // Tiered rate limit: FREE=2/min, STARTER=5/min, PROFESSIONAL=10/min
  const rateLimitResult = await tieredUploadRateLimit(user.plan, user.id);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Upload limit reached. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimitResult.retryAfterSeconds),
          "X-RateLimit-Limit": String(rateLimitResult.limit),
          "X-RateLimit-Remaining": String(rateLimitResult.remaining),
          "X-RateLimit-Reset": String(rateLimitResult.reset),
        },
      },
    );
  }

  if (!checkFeatureAccess(user.plan, "hasVault")) {
    return NextResponse.json(
      { error: "Vault access requires at least the STARTER plan." },
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
