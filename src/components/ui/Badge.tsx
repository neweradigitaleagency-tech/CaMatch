import type { ReactNode } from "react";

interface BadgeProps {
  readonly variant?: "success" | "warning" | "error" | "info" | "neutral";
  readonly children: ReactNode;
  readonly className?: string;
}

const colors: Record<string, string> = {
  success: "bg-cm-success/10 text-cm-success",
  warning: "bg-cm-warning/10 text-cm-warning",
  error: "bg-cm-error/10 text-cm-error",
  info: "bg-cm-info/10 text-cm-info",
  neutral: "bg-pale-mint/50 text-secondary",
};

export default function Badge({ variant = "neutral", children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center h-6 px-3 rounded-full text-xs font-medium ${colors[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
