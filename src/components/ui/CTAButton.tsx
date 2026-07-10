import { Loader } from "lucide-react";
import TouchFeedback from "../TouchFeedback";

interface Props {
  children: React.ReactNode;
  onClick?: () => void;
  loading?: boolean;
  className?: string;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "ghost";
}

export default function CTAButton({ children, onClick, loading, className = "", disabled, variant = "primary" }: Props) {
  const base = "h-12 w-full min-w-[160px] rounded-[9999px] text-[16px] font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200";
  const variants = {
    primary: "bg-cm-accent text-cm-text-onAccent shadow-cm-btn hover:bg-cm-accent-hover",
    secondary: "bg-cm-elevated text-cm-text border border-cm-border hover:bg-cm-border",
    ghost: "bg-transparent text-cm-accent hover:bg-cm-elevated",
  };
  return (
    <TouchFeedback>
      <button
        onClick={onClick}
        disabled={disabled || loading}
        className={`${base} ${variants[variant]} ${className}`}
      >
        {loading ? <Loader className="w-4 h-4 animate-spin" /> : children}
      </button>
    </TouchFeedback>
  );
}
