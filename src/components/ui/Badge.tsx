import type { ReactNode } from "react";

interface BadgeProps {
  readonly variant?: "success" | "warning" | "error" | "info" | "neutral";
  readonly children: ReactNode;
  readonly className?: string;
}

const colors: Record<string, string> = {
  success: "bg-[rgba(82,183,136,0.20)] text-ca-green-primary border border-[rgba(82,183,136,0.40)]",
  warning: "bg-[rgba(244,162,97,0.20)] text-[#B8632E] border border-[rgba(244,162,97,0.40)]",
  error: "bg-[rgba(230,57,70,0.15)] text-ca-error border border-[rgba(230,57,70,0.30)]",
  info: "bg-[rgba(69,123,157,0.20)] text-ca-info border border-[rgba(69,123,157,0.40)]",
  neutral: "bg-[rgba(255,255,255,0.50)] text-ca-text-muted border border-[rgba(232,224,208,0.60)]",
};

export default function Badge({ variant = "neutral", children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center h-6 px-3 rounded-[9999px] text-[11px] font-semibold backdrop-blur-[4px] ${colors[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
