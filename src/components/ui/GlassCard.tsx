import type { ReactNode, HTMLAttributes } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  readonly children: ReactNode;
  readonly interactive?: boolean;
  readonly className?: string;
}

export default function GlassCard({
  children,
  interactive = false,
  className = "",
  ...props
}: GlassCardProps) {
  return (
    <div
      className={`bg-cm-elevated border border-cm-border rounded-[var(--radius-cm-lg)] ${
        interactive ? "cm-scale-btn cursor-pointer hover:border-cm-accent/30" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
