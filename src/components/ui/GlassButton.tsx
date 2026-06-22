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
    "bg-[rgba(45,106,79,0.85)] backdrop-blur-[8px] border border-[rgba(82,183,136,0.40)] text-white hover:bg-[rgba(45,106,79,0.95)]",
  outline:
    "bg-[rgba(255,255,255,0.50)] backdrop-blur-[8px] border border-[rgba(82,183,136,0.40)] text-ca-green-primary hover:bg-[rgba(255,255,255,0.70)]",
  ghost:
    "bg-transparent text-ca-green-primary hover:bg-[rgba(82,183,136,0.10)]",
};

const sizes = {
  sm: "h-9 px-3 text-[12px] rounded-[12px]",
  md: "h-12 px-5 text-[14px] rounded-[14px]",
  lg: "h-14 px-7 text-[15px] rounded-[16px]",
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
      className={`inline-flex items-center justify-center font-semibold transition-all duration-150 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${variants[variant]} ${sizes[size]} ${className}`}
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
