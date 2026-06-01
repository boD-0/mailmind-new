import { Geist, Geist_Mono } from "next/font/google";
import type { Metadata } from "next";
import { headers } from "next/headers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | MailMind",
    default: "MailMind — AI Swarm for Cold Email That Actually Knows People",
  },
  description:
    "Four specialized AI agents — Researcher, Psychologist, Strategist, and Copywriter — work in parallel to craft psychologically calibrated cold emails that don't sound like templates.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers();
  const locale = headersList.get("x-locale") || "en";

  return (
    <html lang={locale} className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
      <body className="selection:bg-copper/30 selection:text-copper bg-background text-foreground min-h-screen" suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
