import { NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client, R2_BUCKET } from "@/lib/r2";
import { apiRequireAuth } from "@/lib/auth/gatekeeper";
import { safeJsonParse } from "@/lib/utils";

export async function POST(req: Request) {
  const user = await apiRequireAuth(req);
  if (user instanceof NextResponse) return user;

  try {
    const text = await req.text();
    const body = safeJsonParse<{ fileKey?: string }>(text, {});
    const fileKey = body.fileKey;

    if (!fileKey) {
      return NextResponse.json({ error: "Missing fileKey" }, { status: 400 });
    }

    // Verify the file belongs to this user
    if (!fileKey.startsWith(user.id + "/")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const command = new GetObjectCommand({
      Bucket: R2_BUCKET,
      Key: fileKey,
    });

    const signedUrl = await getSignedUrl(r2Client, command, {
      expiresIn: 3600,
    });

    return NextResponse.json({ signedUrl });
  } catch (error) {
    console.error("Signed URL error:", error);
    return NextResponse.json({ error: "Failed to generate signed URL" }, { status: 500 });
  }
}
