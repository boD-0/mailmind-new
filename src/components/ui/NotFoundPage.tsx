'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams } from 'next/navigation'
import { useTranslation } from '@/components/I18nProvider'

const easeOut = [0.43, 0.13, 0.23, 0.96] as const

const containerVariants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: easeOut,
      delayChildren: 0.1,
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: easeOut,
    },
  },
}

const numberVariants = {
  hidden: (direction: number) => ({
    opacity: 0,
    x: direction * 40,
    y: 15,
    rotate: direction * 5,
  }),
  visible: {
    opacity: 0.7,
    x: 0,
    y: 0,
    rotate: 0,
    transition: {
      duration: 0.8,
      ease: easeOut,
    },
  },
}

const ghostVariants = {
  hidden: {
    scale: 0.8,
    opacity: 0,
    y: 15,
    rotate: -5,
  },
  visible: {
    scale: 1,
    opacity: 1,
    y: 0,
    rotate: 0,
    transition: {
      duration: 0.6,
      ease: easeOut,
    },
  },
  hover: {
    scale: 1.1,
    y: -10,
    rotate: [0, -5, 5, -5, 0],
    transition: {
      duration: 0.8,
      ease: 'easeInOut' as const,
      rotate: {
        duration: 2,
        ease: 'linear' as const,
        repeat: Infinity,
        repeatType: 'reverse' as const,
      },
    },
  },
  floating: {
    y: [-5, 5],
    transition: {
      y: {
        duration: 2,
        ease: 'easeInOut' as const,
        repeat: Infinity,
        repeatType: 'reverse' as const,
      },
    },
  },
}

interface NotFoundPageProps {
  /** Whether this is an error page (shows retry button) or a 404 page */
  isError?: boolean
  /** Optional error message to display */
  errorMessage?: string
  /** Retry callback for error pages */
  onRetry?: () => void
}

export function NotFoundPage({ isError, errorMessage, onRetry }: NotFoundPageProps) {
  const { locale } = useParams()
  const { t } = useTranslation()
  const homeUrl = `/${locale}`

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fdfbf7] px-4">
      <AnimatePresence mode="wait">
        <motion.div
          className="text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          key={isError ? 'error' : 'notfound'}
        >
          {/* 4 Ghost 4 */}
          <div className="flex items-center justify-center gap-4 md:gap-6 mb-8 md:mb-12">
            <motion.span
              className="text-[80px] md:text-[120px] font-bold text-[#1a1a1a] opacity-70 select-none"
              variants={numberVariants}
              custom={-1}
            >
              4
            </motion.span>
            <motion.div
              variants={ghostVariants}
              whileHover="hover"
              animate={['visible', 'floating']}
            >
              <Image
                src="https://xubohuah.github.io/xubohua.top/Group.png"
                alt="Ghost"
                width={120}
                height={120}
                className="w-[80px] h-[80px] md:w-[120px] md:h-[120px] object-contain select-none"
                draggable={false}
                priority
              />
            </motion.div>
            <motion.span
              className="text-[80px] md:text-[120px] font-bold text-[#1a1a1a] opacity-70 select-none"
              variants={numberVariants}
              custom={1}
            >
              4
            </motion.span>
          </div>

          {/* Title */}
          <motion.h1
            className="text-3xl md:text-5xl font-bold text-[#1a1a1a] mb-4 md:mb-6 opacity-70 select-none"
            variants={itemVariants}
          >
            {isError ? t('not_found.error_title') : t('not_found.not_found_title')}
          </motion.h1>

          {/* Description */}
          <motion.p
            className="text-lg md:text-xl text-[#1a1a1a] mb-8 md:mb-12 opacity-50 select-none max-w-md mx-auto"
            variants={itemVariants}
          >
            {isError
              ? errorMessage
                ? errorMessage
                : t('not_found.error_desc')
              : t('not_found.not_found_desc')}
          </motion.p>

          {/* Actions */}
          <motion.div className="flex flex-col sm:flex-row items-center justify-center gap-4" variants={itemVariants}>
            {/* Retry button for error pages */}
            {isError && onRetry && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                <button
                  onClick={onRetry}
                  className="inline-block bg-[#ff5f5f] text-white px-8 py-3 rounded-full text-lg font-medium hover:bg-red-500 transition-colors shadow-lg shadow-red-500/20 select-none"
                >
                  {t('not_found.try_again')}
                </button>
              </motion.div>
            )}

            {/* Go home button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              <Link
                href={homeUrl}
                className={`inline-block bg-[#ff5f5f] text-white px-8 py-3 rounded-full text-lg font-medium hover:bg-red-500 transition-colors shadow-lg shadow-red-500/20 select-none ${
                  isError ? 'sm:order-first' : ''
                }`}
              >
                {t('not_found.find_shelter')}
              </Link>
            </motion.div>
          </motion.div>

          {/* Info link */}
          <motion.div className="mt-12" variants={itemVariants}>
            <span className="text-[#1a1a1a] opacity-50 text-sm font-medium select-none">
              {isError ? t('not_found.error_info') : t('not_found.not_found_info')}
            </span>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
