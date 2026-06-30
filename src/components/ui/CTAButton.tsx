import { motion } from "motion/react";
import { Loader } from "lucide-react";

interface Props {
  children: React.ReactNode;
  onClick?: () => void;
  loading?: boolean;
  className?: string;
  disabled?: boolean;
}

export default function CTAButton({ children, onClick, loading, className = "", disabled }: Props) {
  return (
    <motion.button
      whileHover={!disabled ? { y: -1 } : {}}
      whileTap={!disabled ? { scale: 0.97, y: 0 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={onClick}
      disabled={disabled || loading}
      className={`h-[54px] w-full min-w-[160px] rounded-full bg-cm-accent text-cm-text text-[16px] font-bold flex items-center justify-center gap-2 shadow-cm-btn cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:bg-cm-accent-hover ${className}`}
    >
      {loading ? <Loader className="w-4 h-4 animate-spin" /> : children}
    </motion.button>
  );
}
