import React from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "link"
  | "outline"
  | "default"
  | "destructive";

export type ButtonSize = "sm" | "md" | "lg" | "icon" | "default";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-copper text-white hover:opacity-90 transition-all shadow-sm hover:shadow-md",
  default:
    "bg-copper text-white hover:opacity-90 transition-all shadow-sm hover:shadow-md",
  secondary:
    "bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] border border-[var(--border-1)] hover:bg-[var(--color-background-tertiary)] transition-colors",
  ghost:
    "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-background-secondary)] transition-colors",
  link:
    "text-copper underline-offset-4 hover:underline transition-all",
  outline:
    "border border-[var(--border-1)] bg-transparent text-[var(--color-text-primary)] hover:bg-[var(--color-background-secondary)] transition-colors",
  destructive:
    "bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm",
};

const sizeStyles: Record<ButtonSize, string> = {
  default: "px-5 py-2.5 text-sm",
  md:      "px-5 py-2.5 text-sm",
  sm:      "px-3 py-1.5 text-xs",
  lg:      "px-6 py-3 text-base",
  icon:    "p-2 w-9 h-9",
};

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-[8px] font-medium focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-copper focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

export function buttonVariants({
  variant = "primary",
  size = "default",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(baseStyles, sizeStyles[size], variantStyles[variant], className);
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "default", className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      {...props}
    >
      {children}
    </button>
  )
);

Button.displayName = "Button";

export default Button;