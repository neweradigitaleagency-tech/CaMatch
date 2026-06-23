import type { ButtonHTMLAttributes, ReactNode } from "react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly icon: ReactNode;
  readonly "aria-label": string;
  readonly variant?: "default" | "ghost" | "green";
  readonly size?: "sm" | "md";
  readonly className?: string;
}

const variants = {
  default: "bg-cm-elevated text-cm-text hover:bg-cm-accent-soft border border-cm-border",
  ghost: "bg-transparent text-cm-text-soft hover:bg-cm-accent-soft",
  green: "bg-cm-accent text-white hover:bg-cm-accent-hover shadow-cm-sm",
};

const sizes = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
};

export default function IconButton({
  icon,
  variant = "default",
  size = "md",
  className = "",
  ...props
}: IconButtonProps) {
  return (
    <button
      className={`flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer shrink-0 cm-scale-btn ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon}
    </button>
  );
}
