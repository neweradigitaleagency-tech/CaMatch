import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: "primary" | "secondary" | "ghost" | "danger";
  readonly size?: "sm" | "md" | "lg";
  readonly loading?: boolean;
  readonly children: ReactNode;
  readonly className?: string;
  readonly disabled?: boolean;
}

const variants = {
  primary: "bg-cm-accent text-white hover:bg-cm-accent-hover font-semibold",
  secondary: "bg-cm-elevated text-cm-text border border-cm-border hover:bg-cm-accent-soft",
  ghost: "bg-transparent text-cm-text hover:bg-cm-accent-soft",
  danger: "bg-cm-elevated text-cm-error border border-cm-border hover:bg-red-50",
};

const sizes = {
  sm: "h-9 px-4 text-[13px] rounded-[var(--radius-cm)]",
  md: "h-11 px-5 text-[14px] rounded-[var(--radius-cm)]",
  lg: "h-13 px-6 text-[15px] rounded-[var(--radius-cm)]",
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer cm-scale-btn ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Chargement...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
