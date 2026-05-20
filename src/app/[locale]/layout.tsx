import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { BlueprintBg } from "@/components/ui/BlueprintBg";
import { locales, getMessages } from "@/lib/i18n";
import { notFound } from "next/navigation";
import { I18nProvider } from '@/components/I18nProvider';
import { PostHogProvider } from '@/components/PostHogProvider';
import { PostHogPageView } from '@/components/PostHogPageView';
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
  title: "MAILMIND | Swarm Intelligence Outreach",
  description: "Paradigmă de Swarm Intelligence + Prospect Empathy Mapping pentru outreach de lux.",
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
      <body className="selection:bg-copper/30 selection:text-copper bg-obsidian text-cream min-h-screen" suppressHydrationWarning>
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
      </body>
    </html>
  );
}
