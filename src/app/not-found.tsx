import Link from 'next/link'
import { Geist, Geist_Mono } from 'next/font/google'
import { headers } from 'next/headers'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export default async function NotFound() {
  const headersList = await headers()
  const acceptLang = headersList.get('accept-language') || ''
  const preferredLocale = acceptLang.startsWith('ro') ? 'ro' : 'en'

  return (
    <html lang={preferredLocale} className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="bg-background text-foreground font-sans min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          {/* 4 4 */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className="text-[80px] md:text-[100px] font-bold opacity-70 select-none">
              4
            </span>
            <div className="relative">
              {/* Simple inline ghost SVG */}
              <svg
                width="80"
                height="80"
                viewBox="0 0 120 120"
                className="md:w-[100px] md:h-[100px]"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="20" y="10" width="80" height="75" rx="40" fill="#e5e7eb" />
                <rect x="20" y="60" width="80" height="50" rx="10" fill="#e5e7eb" />
                <circle cx="45" cy="40" r="5" fill="#1a1a1a" />
                <circle cx="75" cy="40" r="5" fill="#1a1a1a" />
                <path d="M45 55 Q60 65, 75 55" stroke="#1a1a1a" strokeWidth="2" fill="none" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-[80px] md:text-[100px] font-bold opacity-70 select-none">
              4
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4 opacity-70">
            Boo! Page missing!
          </h1>

          <p className="text-lg text-muted-foreground mb-8 max-w-sm mx-auto">
            Whoops! This page must be a ghost — it&apos;s not here!
          </p>

          <Link
            href={`/${preferredLocale}`}
            className="inline-block bg-[#1a1a1a] text-white px-8 py-3 rounded-full text-lg font-medium hover:bg-black transition-colors"
          >
            Find shelter
          </Link>

          <p className="mt-12 text-sm text-muted-foreground">
            What means 404?
          </p>
        </div>
      </body>
    </html>
  )
}
