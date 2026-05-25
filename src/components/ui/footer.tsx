"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslation } from "@/components/I18nProvider";

export interface FooterLink {
  href: string | ((locale: string) => string);
  labelKey: string;
}

export interface FooterColumn {
  titleKey: string;
  links: FooterLink[];
}

export interface FooterProps {
  locale: string;
  columns: FooterColumn[];
  socialLinks: string[];
  brandName?: string;
}

function resolveHref(href: string | ((locale: string) => string), locale: string): string {
  return typeof href === "function" ? href(locale) : href;
}

export function Footer({
  locale,
  columns,
  socialLinks,
  brandName = "MailMind",
}: FooterProps) {
  const { t } = useTranslation();

  return (
    <footer className="bg-background border-t border-border py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href={`/${locale}`} className="flex items-center gap-2.5 group">
              <motion.div
                className="w-8 h-8 bg-copper rounded-xl flex items-center justify-center shadow-sm"
                whileHover={{ rotate: -10, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <span className="text-white text-xs font-extrabold">M</span>
              </motion.div>
              <span className="font-bold text-lg text-foreground tracking-tight">
                {brandName}
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-[200px]">
              {t("footer.tagline")}
            </p>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.titleKey}>
              <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-4">
                {t(col.titleKey)}
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {col.links.map((link) => (
                  <li key={link.labelKey}>
                    <Link
                      href={resolveHref(link.href, locale)}
                      className="hover:text-foreground transition-colors relative inline-block group/link"
                    >
                      {t(link.labelKey)}
                      <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-copper transition-all duration-300 group-hover/link:w-full" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <motion.div
          className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span>{t("footer.copyright")}</span>
          <div className="flex gap-6">
            {socialLinks.map((social) => (
              <a
                key={social}
                href="#"
                className="hover:text-muted-foreground transition-colors relative group/social"
              >
                {t(social)}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-gray-400 transition-all duration-300 group-hover/social:w-full" />
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
