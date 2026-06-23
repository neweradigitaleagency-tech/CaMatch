import type { ReactNode, HTMLAttributes } from "react";

interface BentoCardProps extends HTMLAttributes<HTMLDivElement> {
  readonly children: ReactNode;
  readonly span?: 1 | 2;
  readonly className?: string;
}

export default function BentoCard({
  children,
  span = 1,
  className = "",
  ...props
}: BentoCardProps) {
  return (
    <div
      className={`cm-card p-4 ${
        span === 2 ? "cm-card--wide" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
