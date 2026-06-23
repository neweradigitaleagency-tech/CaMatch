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
      className={`bg-cm-elevated border border-cm-border rounded-[var(--radius-cm-lg)] ${paddings[padding]} ${
        interactive ? "cm-scale-btn cursor-pointer hover:border-cm-accent/30" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
