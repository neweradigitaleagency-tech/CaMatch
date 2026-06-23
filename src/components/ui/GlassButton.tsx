import type { ButtonHTMLAttributes, ReactNode } from "react";

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: "primary" | "outline" | "ghost";
  readonly size?: "sm" | "md" | "lg";
  readonly loading?: boolean;
  readonly children: ReactNode;
  readonly className?: string;
}

const variants = {
  primary:
    "bg-cm-accent text-white hover:bg-cm-accent-hover",
  outline:
    "bg-cm-elevated text-cm-text border border-cm-border hover:border-cm-accent hover:text-cm-accent",
  ghost:
    "bg-transparent text-cm-text-soft hover:text-cm-text hover:bg-cm-accent-soft",
};

const sizes = {
  sm: "h-9 px-4 text-[13px] font-medium rounded-[var(--radius-cm)]",
  md: "h-11 px-5 text-[14px] font-medium rounded-[var(--radius-cm)]",
  lg: "h-13 px-6 text-[15px] font-medium rounded-[var(--radius-cm)]",
};

export default function GlassButton({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  children,
  className = "",
  ...props
}: GlassButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center font-medium transition-all duration-150 cm-scale-btn disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer font-sans ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>Chargement...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
