import type { ButtonHTMLAttributes, ReactNode } from "react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly icon: ReactNode;
  readonly "aria-label": string;
  readonly variant?: "default" | "ghost" | "green";
  readonly size?: "sm" | "md";
  readonly className?: string;
}

const variants = {
  default: "bg-white dark:bg-brand-forest text-brand-forest dark:text-brand-cream hover:bg-pale-mint dark:hover:bg-pale-mint/30 shadow-sm",
  ghost: "bg-transparent text-secondary hover:bg-pale-mint/50",
  green: "bg-cm-green text-white hover:bg-cm-green-deep shadow-sm",
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
      className={`flex items-center justify-center rounded-full transition-all duration-200 active:scale-95 cursor-pointer shrink-0 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon}
    </button>
  );
}
