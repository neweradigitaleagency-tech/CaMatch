import type { ReactNode, HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  readonly children: ReactNode;
  readonly interactive?: boolean;
  readonly padding?: "sm" | "md" | "lg";
  readonly className?: string;
}

const paddings = {
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

export default function Card({
  children,
  interactive = false,
  padding = "md",
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={`bg-white dark:bg-brand-forest/10 rounded-2xl border border-pale-mint/30 shadow-ambient ${paddings[padding]} ${
        interactive ? "hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
