import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import { r2Client, R2_BUCKET } from "@/lib/r2";
import { db } from "@/db/drizzle";
import { vaultDocuments } from "@/db/schema";
import { requireOnboarding, checkFeatureAccess } from "@/lib/auth/gatekeeper";
import { tieredUploadRateLimit } from "@/lib/rate-limit";
import { vaultUploadSchema, validateBody } from "@/lib/validate";
import { logAuditEvent } from "@/lib/audit";
import { getClientIp } from "@/lib/get-client-ip";

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
  let body: unknown;
  try {
    body = JSON.parse(text || "{}");
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Zod validation
  const parsed = validateBody(vaultUploadSchema, body);
  if (parsed instanceof NextResponse) return parsed;
  const { fileName, mimeType, fileSize, projectId } = parsed;

  // MIME type whitelist (block dangerous file types)
  const ALLOWED_MIME_TYPES = new Set([
    "application/pdf",
    "text/plain",
    "text/csv",
    "application/json",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "application/msword",
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/gif",
  ]);

  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    return NextResponse.json(
      { error: `File type '${mimeType}' is not allowed. Accepted: ${[...ALLOWED_MIME_TYPES].join(", ")}` },
      { status: 400 },
    );
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

  // Audit log
  logAuditEvent({
    userId: user.id,
    action: "vault.upload",
    resourceType: "vault_document",
    resourceId: fileKey,
    metadata: { fileName, fileSize, mimeType },
    ipAddress: getClientIp(req),
  }).catch(() => {});

  return NextResponse.json({ presignedUrl, fileUrl, fileKey });
}
