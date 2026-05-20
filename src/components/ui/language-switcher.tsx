'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Globe, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Locale } from '@/lib/i18n'
import { locales } from '@/lib/i18n'

const localeLabels: Record<Locale, { label: string; flag: string }> = {
  ro: { label: 'Română', flag: '🇷🇴' },
  en: { label: 'English', flag: '🇬🇧' },
  fr: { label: 'Français', flag: '🇫🇷' },
  de: { label: 'Deutsch', flag: '🇩🇪' },
}

export function LanguageSwitcher() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close on Escape
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  // Extract current locale from pathname
  const segments = pathname.split('/').filter(Boolean)
  const currentLocale = (segments[0] || 'ro') as Locale
  const current = localeLabels[currentLocale] ?? localeLabels.ro

  function switchTo(locale: Locale) {
    // Replace the first path segment with the new locale
    const newSegments = [locale, ...segments.slice(1)]
    const newPath = '/' + newSegments.join('/')
    router.push(newPath)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-gray-500 hover:text-[#1a1a1a] transition-colors text-sm font-medium px-2 py-1.5 rounded-lg hover:bg-gray-100/50"
        aria-label="Select language"
        aria-expanded={open}
      >
        <Globe size={14} />
        <span className="hidden sm:inline">{current.label}</span>
        <span className="sm:hidden">{current.flag}</span>
        <ChevronDown
          size={12}
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-1.5 w-44 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50"
          >
            {locales.map((loc) => {
              const info = localeLabels[loc]
              const isActive = loc === currentLocale
              return (
                <button
                  key={loc}
                  onClick={() => switchTo(loc)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                    isActive
                      ? 'bg-[#ff5f5f]/5 text-[#1a1a1a] font-semibold'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-[#1a1a1a]'
                  }`}
                >
                  <span className="text-base leading-none">{info.flag}</span>
                  <span>{info.label}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#ff5f5f]" />
                  )}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
