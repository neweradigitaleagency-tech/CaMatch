import type { ReactNode } from "react";

interface BadgeProps {
  readonly variant?: "success" | "warning" | "error" | "info" | "neutral";
  readonly children: ReactNode;
  readonly className?: string;
}

const colors: Record<string, string> = {
  success: "bg-green-100 text-green-800",
  warning: "bg-amber-100 text-amber-800",
  error: "bg-red-100 text-red-800",
  info: "bg-cm-accent-soft text-cm-accent",
  neutral: "bg-gray-100 text-cm-text-soft",
};

export default function Badge({ variant = "neutral", children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center h-6 px-2.5 rounded-full text-[12px] font-medium ${colors[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
