import * as React from "react";
import { cn } from "../../lib/cn";

type Variant = "cyan" | "blue" | "indigo" | "white" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  cyan: "bg-cyan-500 text-black hover:bg-cyan-400 shadow-cyan-500/30",
  blue: "bg-blue-500 text-white hover:bg-blue-400 shadow-blue-500/30",
  indigo: "bg-indigo-500 text-white hover:bg-indigo-400 shadow-indigo-500/30",
  white: "bg-white text-black hover:bg-white/90 border border-black/10",
  ghost: "bg-transparent text-white hover:bg-white/10 border border-white/15",
  danger: "bg-rose-500 text-white hover:bg-rose-400 shadow-rose-500/30",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
};

export function Button({
  variant = "blue",
  size = "md",
  loading,
  disabled,
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition active:scale-[0.98]",
        "disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      )}
      {children}
    </button>
  );
}
