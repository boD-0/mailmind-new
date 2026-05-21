"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, Sparkles, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface HeroProps {
  locale?: string
}

function Hero({ locale = "" }: HeroProps) {
  const [titleNumber, setTitleNumber] = useState(0)
  const titles = useMemo(
    () => ["personalized", "researched", "calibrated", "converting", "team-written"],
    []
  )

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0)
      } else {
        setTitleNumber(titleNumber + 1)
      }
    }, 2500)
    return () => clearTimeout(timeoutId)
  }, [titleNumber, titles])

  return (
    <div className="w-full">
      <div className="container mx-auto">
        <div className="flex gap-8 py-20 lg:py-32 items-center justify-center flex-col">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-sm font-medium rounded-full border-[#ff5f5f]/20 bg-[#ff5f5f]/5 text-[#ff5f5f] hover:bg-[#ff5f5f]/10 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI-powered email campaigns
            </Button>
          </motion.div>

          <div className="flex gap-4 flex-col">
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="text-5xl md:text-7xl max-w-3xl tracking-tighter text-center font-bold text-[#1a1a1a] leading-[1.15]"
            >
              <span>Emails that feel</span>
              <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1">
                &nbsp;
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-bold bg-gradient-to-r from-[#ff5f5f] to-purple-500 bg-clip-text text-transparent"
                    initial={{ opacity: 0, y: -100 }}
                    transition={{ type: "spring", stiffness: 50 }}
                    animate={
                      titleNumber === index
                        ? { y: 0, opacity: 1 }
                        : { y: titleNumber > index ? -150 : 150, opacity: 0 }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg md:text-xl leading-relaxed tracking-tight text-gray-500 max-w-2xl text-center"
            >
              Four specialized AI agents — Researcher, Psychologist, Strategist and Copywriter —
              work as your virtual team to research prospects, craft emails, and continuously
              improve every campaign. Not templates. Not AI slop. Real emails that get replies.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
            className="flex flex-row gap-3"
          >
            <Link href={`/${locale}/demo`}>
              <Button size="lg" variant="outline" className="gap-3 rounded-full text-base font-semibold px-7 py-6 h-auto">
                <Users className="w-4 h-4" />
                Watch Demo
              </Button>
            </Link>
            <Link href={`/${locale}/sign-up`}>
              <Button
                size="lg"
                className="gap-3 rounded-full text-base font-semibold px-7 py-6 h-auto bg-[#ff5f5f] text-white hover:bg-red-500 transition-all hover:shadow-lg hover:shadow-red-200/50 group"
              >
                Start Writing Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.7 }}
            className="text-xs text-gray-400 mt-2"
          >
            No credit card required · Free plan available
          </motion.p>
        </div>
      </div>
    </div>
  )
}

export { Hero }
