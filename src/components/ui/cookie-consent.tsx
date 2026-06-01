"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import posthog from "posthog-js";

const STORAGE_KEY = "mailmind-cookie-consent";

type ConsentState = "accepted" | "declined" | null;

export function CookieConsent() {
  const [consent, setConsent] = useState<ConsentState>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY) as ConsentState;
    if (stored === "accepted" || stored === "declined") {
      setConsent(stored);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    posthog.opt_in_capturing();
    setConsent("accepted");
  };

  const handleDecline = () => {
    localStorage.setItem(STORAGE_KEY, "declined");
    posthog.opt_out_capturing();
    setConsent("declined");
  };

  // Don't render until mounted (hydration safety) or if already decided
  if (!mounted || consent !== null) return null;

  return (
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", damping: 22, stiffness: 280 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[320px]"
      >
        <div className="bg-white rounded-2xl shadow-2xl shadow-black/10 border border-border p-7 flex flex-col items-center gap-4">
          {/* Cookie SVG Icon */}
          <svg
            id="cookieSvg"
            width="44"
            height="44"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="24" cy="24" r="18" fill="#D4A06A" />
            <circle cx="24" cy="24" r="15" fill="#E8C48A" />
            {/* Chocolate chips */}
            <circle cx="18" cy="18" r="2.5" fill="#5C3D2E" />
            <circle cx="28" cy="16" r="2" fill="#5C3D2E" />
            <circle cx="22" cy="26" r="2.5" fill="#5C3D2E" />
            <circle cx="30" cy="24" r="1.8" fill="#5C3D2E" />
            <circle cx="16" cy="28" r="1.5" fill="#5C3D2E" />
            <circle cx="26" cy="32" r="2" fill="#5C3D2E" />
          </svg>

          <h3 className="text-base font-extrabold text-foreground">
            Cookies Consent
          </h3>

          <p className="text-xs font-semibold text-muted-foreground text-center leading-relaxed">
            This website uses cookies to improve your experience. By accepting,
            you agree to our{" "}
            <a
              href="/privacy"
              className="text-blue-500 hover:underline transition-colors"
            >
              Privacy Policy
            </a>
            .
          </p>

          <div className="flex gap-3 mt-1">
            <button
              onClick={handleAccept}
              className="w-20 h-8 bg-[#7b57ff] text-white text-xs font-semibold rounded-full cursor-pointer shadow-[0_4px_6px_-1px_#977ef3,0_2px_4px_-1px_#977ef3] hover:bg-[#9173ff] hover:shadow-[0_10px_15px_-3px_#977ef3,0_4px_6px_-2px_#977ef3] transition-all duration-300"
            >
              Accept
            </button>
            <button
              onClick={handleDecline}
              className="w-20 h-8 bg-gray-200 text-muted-foreground text-xs font-semibold rounded-full cursor-pointer shadow-[0_4px_6px_-1px_#bebdbd,0_2px_4px_-1px_#bebdbd] hover:bg-muted hover:shadow-[0_10px_15px_-3px_#bebdbd,0_4px_6px_-2px_#bebdbd] transition-all duration-300"
            >
              Decline
            </button>
          </div>
        </div>
      </motion.div>
  );
}
