import React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "link";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-copper text-white hover:opacity-90 transition-all shadow-sm hover:shadow-md",
  secondary:
    "bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] border border-[var(--border-1)] hover:bg-[var(--color-background-tertiary)] transition-colors",
  ghost:
    "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-background-secondary)] transition-colors",
  link:
    "text-copper underline-offset-4 hover:underline transition-all",
};

export function buttonVariants({ variant = "primary", className }: { variant?: ButtonVariant; className?: string } = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-[8px] px-5 py-2.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-copper focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    variantStyles[variant],
    className,
  );
}

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[8px] px-5 py-2.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-copper focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
