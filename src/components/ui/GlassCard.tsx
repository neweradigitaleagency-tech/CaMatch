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
      className={`bg-[rgba(255,255,255,0.60)] backdrop-blur-[16px] border border-[rgba(255,255,255,0.35)] rounded-[20px] shadow-[0_8px_32px_rgba(45,106,79,0.10)] ${
        interactive ? "hover:scale-[1.02] hover:shadow-[0_12px_48px_rgba(45,106,79,0.15)] active:scale-[0.98] transition-all duration-200 cursor-pointer" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
