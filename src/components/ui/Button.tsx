// CineStream — atomic Button component

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface BaseButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-white hover:bg-[#c4080f] hover:shadow-[0_0_24px_rgba(229,9,20,0.45)] focus-visible:outline-accent",
  secondary:
    "bg-surface text-text-primary border border-border-subtle hover:border-text-secondary focus-visible:outline-text-secondary",
  ghost:
    "bg-transparent text-text-primary hover:bg-surface focus-visible:outline-text-secondary",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3 text-base",
};

function buttonClasses(variant: ButtonVariant, size: ButtonSize, className?: string) {
  return [
    "inline-flex items-center justify-center gap-2 rounded-lg font-semibold",
    "transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2",
    "disabled:opacity-50 disabled:pointer-events-none",
    variantClasses[variant],
    sizeClasses[size],
    className ?? "",
  ].join(" ");
}

export function Button({
  variant = "primary",
  size = "md",
  children,
  className,
  ...rest
}: BaseButtonProps & ComponentProps<"button">) {
  return (
    <button className={buttonClasses(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  children,
  className,
  href,
  ...rest
}: BaseButtonProps & ComponentProps<typeof Link>) {
  return (
    <Link href={href} className={buttonClasses(variant, size, className)} {...rest}>
      {children}
    </Link>
  );
}
