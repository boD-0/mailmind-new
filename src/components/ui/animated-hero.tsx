"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, Sparkles, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useTranslation } from "@/components/I18nProvider"

interface HeroProps {
  locale?: string
}

function Hero({ locale = "" }: HeroProps) {
  const { t } = useTranslation()
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
            <motion.div
              whileHover={{ y: -1 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-sm font-semibold rounded-full border-copper/20 bg-copper-muted text-copper hover:bg-copper-muted/60 hover:border-copper/30 transition-all duration-300"
              >
                <motion.span
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </motion.span>
                {t('home.hero.badge')}
              </Button>
            </motion.div>
          </motion.div>

          <div className="flex gap-4 flex-col">
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="text-5xl md:text-7xl max-w-3xl tracking-tighter text-center font-bold text-foreground leading-[1.15]"
            >
              <span>{t('home.hero.headline_1')}</span>
              <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1">
                &nbsp;
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-bold text-copper"
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
              className="text-lg md:text-xl leading-relaxed tracking-tight text-muted-foreground max-w-2xl text-center"
            >
              {t('home.hero.subheadline')}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
            className="flex flex-row gap-3"
          >
            <Link href={`/${locale}/demo`}>

                <Button size="lg" variant="outline"                className="gap-3 rounded-full text-base font-semibold px-7 py-6 h-auto border border-border bg-card text-foreground hover:border-copper/30 hover:bg-copper/10 transition-all duration-300 group">
                  <Users className="w-4 h-4" />
                  {t('home.hero.cta_live_demo')}
                  <span className="inline-block ml-1 text-[10px] bg-copper-muted text-copper px-2 py-0.5 rounded-full font-bold">
                    FREE
                  </span>
                </Button>

            </Link>
            <Link href={`/${locale}/sign-up`}>
              <Button
                size="lg"
                className="gap-3 rounded-full text-base font-semibold px-7 py-6 h-auto bg-copper text-white hover:bg-copper-light transition-all duration-300 group"
              >
                {t('home.hero.cta_get_started')}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.7 }}
            className="text-xs text-muted-foreground mt-2"
          >
            {t('home.cta.trust_nocc')} · {t('home.cta.trust_uptime')}
          </motion.p>
        </div>
      </div>
    </div>
  )
}

export { Hero }
