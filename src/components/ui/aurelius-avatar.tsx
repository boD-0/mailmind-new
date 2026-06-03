"use client";

import { cn } from "@/lib/utils";

/* ════════════════════════════════════════════════════════════
   AURELIUS AVATAR
   Spec: Circle, amber background (#FAEEDA), initials "Au"
   in amber-800 (#633806), weight 500.
   - Default size: 36px (w-9 h-9)
   - Chat size: 44px (w-11 h-11)
   - Always accompanied by name "Aurelius" unless showName={false}
   ════════════════════════════════════════════════════════════ */

interface AureliusAvatarProps {
  /** 36px (default) or 44px (chat) */
  size?: "sm" | "md";
  /** Show "Aurelius" name beside the avatar */
  showName?: boolean;
  /** Extra message below the name (e.g. "Your agency strategist") */
  subtitle?: string;
  className?: string;
}

export function AureliusAvatar({
  size = "sm",
  showName = true,
  subtitle,
  className,
}: AureliusAvatarProps) {
  const dimensionClasses = size === "md" ? "w-11 h-11" : "w-9 h-9";
  const initialClasses = size === "md" ? "text-sm" : "text-xs";

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "rounded-full bg-[#FAEEDA] flex items-center justify-center shrink-0",
          dimensionClasses
        )}
      >
        <span
          className={cn(
            "font-bold text-[#633806] leading-none",
            initialClasses
          )}
        >
          Au
        </span>
      </div>
      {showName && (
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">Aurelius</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground/70">{subtitle}</p>
          )}
        </div>
      )}
    </div>
  );
}
