"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

/**
 * Радиусы намеренно малые (6–10px), никаких rounded-full и тяжёлых теней.
 * Copper используется только в primary — это единственная кнопка с заливкой акцентом.
 */
const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-accent text-bg hover:bg-primary disabled:hover:bg-accent border border-transparent",
  secondary:
    "bg-surface text-primary border border-border hover:border-secondary/40 hover:bg-bg",
  ghost:
    "bg-transparent text-secondary border border-transparent hover:text-primary hover:bg-border/40",
  danger:
    "bg-transparent text-secondary border border-transparent hover:text-accent hover:bg-accent-soft/60",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-sm",
  md: "h-10 px-4 text-sm gap-2 rounded-md",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "secondary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center font-medium",
        "transition-colors duration-150",
        "disabled:opacity-40 disabled:pointer-events-none",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
