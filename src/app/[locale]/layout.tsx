import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { BlueprintBg } from "@/components/ui/BlueprintBg";
import { locales, getMessages } from "@/lib/i18n";
import { notFound } from "next/navigation";
import { I18nProvider } from '@/components/I18nProvider';
import { PostHogProvider } from '@/components/PostHogProvider';
import { PostHogPageView } from '@/components/PostHogPageView';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Suspense } from 'react';
import { CookieConsent } from '@/components/ui/cookie-consent';

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
  keywords: [
    "AI email",
    "cold email",
    "email personalization",
    "AI copywriting",
    "sales outreach",
    "swarm intelligence",
    "email automation",
  ],
  authors: [{ name: "MailMind" }],
  creator: "MailMind",
  publisher: "MailMind",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://mailmind.app"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "MailMind",
    title: "MailMind — AI Swarm for Cold Email That Actually Knows People",
    description:
      "Four specialized AI agents work in parallel to craft psychologically calibrated emails that don't sound like templates.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MailMind — AI Swarm Intelligence Email",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MailMind — AI Swarm for Cold Email That Actually Knows People",
    description:
      "Four specialized AI agents work in parallel to craft psychologically calibrated emails.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as typeof locales[number])) {
    notFound();
  }

  const messages = await getMessages(locale);

  return (
    <html lang={locale} className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
      <body className="selection:bg-copper/30 selection:text-copper bg-background text-foreground min-h-screen" suppressHydrationWarning>
        <ThemeProvider>
          <PostHogProvider>
            <Suspense fallback={null}>
              <PostHogPageView />
            </Suspense>
            <I18nProvider messages={messages}>
              <BlueprintBg />
              {children}
              <CookieConsent />
            </I18nProvider>
          </PostHogProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
