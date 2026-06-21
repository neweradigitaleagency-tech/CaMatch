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
  primary:
    "bg-cm-green text-white hover:bg-cm-green-deep active:bg-cm-green-dark disabled:opacity-50",
  secondary:
    "bg-transparent text-cm-green border-2 border-cm-green hover:bg-cm-green-light active:scale-[0.98]",
  ghost:
    "bg-transparent text-cm-green hover:bg-cm-green-light",
  danger:
    "bg-cm-error text-white hover:bg-red-600",
};

const sizes = {
  sm: "h-9 px-3 text-xs rounded-lg",
  md: "h-12 px-4 text-sm rounded-xl",
  lg: "h-14 px-6 text-base rounded-xl",
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
      className={`inline-flex items-center justify-center font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 cursor-pointer ${variants[variant]} ${sizes[size]} ${className}`}
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
