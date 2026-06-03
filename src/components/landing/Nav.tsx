"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const Nav: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 transition-all duration-300 ${
        scrolled
          ? "bg-background/92 backdrop-blur-xl border-b border-border/50 shadow-sm"
          : "bg-background border-b border-border/50"
      }`}
    >
      <Link href="/" className="flex items-center gap-2 font-medium text-foreground">
        <span className="text-lg font-semibold tracking-tight">
          MailMind<span className="text-amber-500 ml-0.5">•</span>
        </span>
      </Link>

      <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
        <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
        <Link href="#pricing" className="hover:text-foreground transition-colors">Pricing</Link>
        <Link href="#compare" className="hover:text-foreground transition-colors">Compare</Link>
        <Link href="#blog" className="hover:text-foreground transition-colors">Blog</Link>
      </div>

      <div className="flex items-center gap-3">
        <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Log in
        </Link>
        <Link href="/sign-up">
          <Button variant="default" className="bg-amber-500 hover:bg-amber-600 text-white rounded-full px-5 py-2 h-auto text-sm font-semibold">
            Start free
          </Button>
        </Link>
      </div>
    </nav>
  );
};

export default Nav;
