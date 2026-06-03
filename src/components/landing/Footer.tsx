"use client";

import React from "react";
import Link from "next/link";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border bg-background py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <span className="text-base font-semibold tracking-tight text-foreground">
              MailMind<span className="text-amber-500 ml-0.5">.</span>
            </span>
            <p className="mt-2 text-sm text-muted-foreground max-w-[200px]">
              Refined outreach for agencies
            </p>
            {/* Language Switcher Pills */}
            <div className="mt-4 flex flex-wrap gap-1.5">
              {[
                { code: "EN", label: "English" },
                { code: "RO", label: "Română" },
                { code: "DE", label: "Deutsch" },
                { code: "FR", label: "Français" },
              ].map((lang) => (
                <span
                  key={lang.code}
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer border border-border"
                >
                  {lang.code}
                </span>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Product</p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <Link href="#features" className="block hover:text-foreground transition-colors">Features</Link>
              <Link href="#pricing" className="block hover:text-foreground transition-colors">Pricing</Link>
              <Link href="#compare" className="block hover:text-foreground transition-colors">Compare</Link>
            </div>
          </div>

          {/* Company */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Company</p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <Link href="/about" className="block hover:text-foreground transition-colors">About</Link>
              <Link href="/blog" className="block hover:text-foreground transition-colors">Blog</Link>
              <Link href="/careers" className="block hover:text-foreground transition-colors">Careers</Link>
            </div>
          </div>

          {/* Legal */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Legal</p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <Link href="/privacy" className="block hover:text-foreground transition-colors">Privacy</Link>
              <Link href="/terms" className="block hover:text-foreground transition-colors">Terms</Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <span>© 2025 MailMind</span>
          <div className="flex gap-4">
            <Link href="/status" className="hover:text-foreground transition-colors">Status</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
