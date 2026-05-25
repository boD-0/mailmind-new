import { OAuth2Client } from "google-auth-library";

const GMAIL_SEND_SCOPE = "https://www.googleapis.com/auth/gmail.send";

/**
 * Creates a configured Google OAuth2 client for Gmail send access.
 * Uses separate credentials from the sign-in Google OAuth provider
 * to avoid scope conflicts with Better-Auth.
 */
export function createGmailOAuthClient(redirectUri?: string): OAuth2Client {
  const clientId = process.env.GOOGLE_GMAIL_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_GMAIL_CLIENT_SECRET;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const resolvedRedirectUri = redirectUri || `${baseUrl}/api/gmail/callback`;

  if (!clientId || !clientSecret) {
    throw new Error(
      "GOOGLE_GMAIL_CLIENT_ID and GOOGLE_GMAIL_CLIENT_SECRET must be set to enable Gmail integration.",
    );
  }

  return new OAuth2Client({
    clientId,
    clientSecret,
    redirectUri: resolvedRedirectUri,
  });
}

/**
 * Generates the Google OAuth consent URL for connecting Gmail.
 * Uses `prompt=consent` + `access_type=offline` to ensure a refresh token is returned.
 *
 * @param state — a CSRF token bound to the user's session (passed back in the callback)
 */
export function generateGmailAuthUrl(state: string, redirectUri?: string): string {
  const oauth2Client = createGmailOAuthClient(redirectUri);

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [GMAIL_SEND_SCOPE, "https://www.googleapis.com/auth/userinfo.email"],
    state,
  });
}

export interface GmailTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
  googleEmail: string;
}

/**
 * Exchanges an OAuth authorization code for access + refresh tokens,
 * then fetches the user's Google email address.
 */
export async function exchangeGmailCode(
  code: string,
  redirectUri?: string,
): Promise<GmailTokens> {
  const oauth2Client = createGmailOAuthClient(redirectUri);

  const { tokens } = await oauth2Client.getToken(code);

  if (!tokens.access_token) {
    throw new Error("Google OAuth did not return an access token.");
  }

  // Fetch the user's Gmail address
  oauth2Client.setCredentials(tokens);
  const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  if (!userInfoRes.ok) {
    throw new Error("Failed to fetch Google user info.");
  }

  const userInfo = (await userInfoRes.json()) as { email: string };

  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token ?? undefined,
    expiresAt: tokens.expiry_date
      ? new Date(tokens.expiry_date)
      : new Date(Date.now() + 3600 * 1000),
    googleEmail: userInfo.email,
  };
}

/**
 * Refreshes an expired access token using the refresh token.
 * Returns updated tokens.
 */
export async function refreshGmailToken(
  refreshToken: string,
): Promise<{ accessToken: string; expiresAt: Date }> {
  const oauth2Client = createGmailOAuthClient();
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  const { credentials } = await oauth2Client.refreshAccessToken();

  if (!credentials.access_token) {
    throw new Error("Failed to refresh Gmail access token.");
  }

  return {
    accessToken: credentials.access_token,
    expiresAt: credentials.expiry_date
      ? new Date(credentials.expiry_date)
      : new Date(Date.now() + 3600 * 1000),
  };
}

/**
 * Returns a valid access token for a Gmail connection.
 * Automatically refreshes if the token has expired.
 *
 * @param accessToken — current access token
 * @param refreshToken — refresh token for renewal
 * @param expiresAt — current token expiry date
 */
export async function getValidAccessToken(
  accessToken: string,
  refreshToken: string | null,
  expiresAt: Date,
): Promise<string> {
  // Buffer: refresh if token expires within 5 minutes
  const bufferMs = 5 * 60 * 1000;
  if (new Date(expiresAt).getTime() - Date.now() > bufferMs) {
    return accessToken;
  }

  if (!refreshToken) {
    throw new Error("Gmail access token expired and no refresh token available.");
  }

  const refreshed = await refreshGmailToken(refreshToken);
  return refreshed.accessToken;
}
