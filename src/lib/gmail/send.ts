import { db } from "@/db/drizzle";
import { gmailConnections } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getValidAccessToken, refreshGmailToken } from "./oauth";

/**
 * Sends an email through the user's connected Gmail account.
 *
 * @param userId — authenticated user ID
 * @param params.to — recipient email address
 * @param params.subject — email subject
 * @param params.htmlBody — HTML email content
 * @returns the Gmail message ID
 */
export async function sendGmailEmail(
  userId: string,
  params: { to: string; subject: string; htmlBody: string },
): Promise<{ messageId: string; threadId: string }> {
  // Load the Gmail connection from DB
  const [connection] = await db
    .select()
    .from(gmailConnections)
    .where(eq(gmailConnections.userId, userId))
    .limit(1);

  if (!connection) {
    throw new Error("Gmail is not connected. Connect your Gmail account in Settings first.");
  }

  // Get a valid access token (auto-refresh if needed)
  let accessToken: string;
  try {
    accessToken = await getValidAccessToken(
      connection.accessToken,
      connection.refreshToken,
      connection.tokenExpiresAt,
    );

    // Persist refreshed tokens
    if (accessToken !== connection.accessToken) {
      await db
        .update(gmailConnections)
        .set({
          accessToken,
          tokenExpiresAt: new Date(Date.now() + 3600 * 1000),
          updatedAt: new Date(),
        })
        .where(eq(gmailConnections.userId, userId));
    }
  } catch {
    throw new Error("Gmail access token expired and could not be refreshed. Please reconnect your Gmail account in Settings.");
  }

  // Build RFC 2822 email
  const rawEmail = buildRawEmail({
    from: connection.googleEmail,
    to: params.to,
    subject: params.subject,
    htmlBody: params.htmlBody,
  });

  // Send via Gmail API
  const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw: rawEmail }),
  });

  const data = (await res.json()) as { id: string; threadId: string; error?: { message: string } };

  if (!res.ok) {
    const errorMsg = data.error?.message || "Gmail API send failed.";
    console.error(`[Gmail] Send error for user ${userId.slice(0, 8)}…:`, errorMsg);
    throw new Error(errorMsg);
  }

  return { messageId: data.id, threadId: data.threadId };
}

/**
 * Builds a base64url-encoded RFC 2822 email from its components.
 */
function buildRawEmail(params: {
  from: string;
  to: string;
  subject: string;
  htmlBody: string;
}): string {
  const headers = [
    `From: ${params.from}`,
    `To: ${params.to}`,
    `Subject: =?UTF-8?B?${Buffer.from(params.subject, "utf-8").toString("base64")}?=`,
    "MIME-Version: 1.0",
    'Content-Type: text/html; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
  ];

  const body = Buffer.from(params.htmlBody, "utf-8").toString("base64");
  const raw = `${headers.join("\r\n")}\r\n${body}`;
  return Buffer.from(raw, "utf-8").toString("base64url");
}
