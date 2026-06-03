import { createAuthClient } from "better-auth/react"
import { sentinelClient } from "@better-auth/infra/client"

export const authClient = createAuthClient({
  baseURL: (typeof window !== 'undefined' ? window.location.origin : undefined) ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000",
  plugins: [
    sentinelClient({
      identifyUrl: process.env.NEXT_PUBLIC_BETTER_AUTH_SENTINEL_URL ?? undefined,
    }),
  ],
})

export const { signIn, signUp, signOut, useSession } = authClient
