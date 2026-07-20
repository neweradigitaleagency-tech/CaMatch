import { motion } from "motion/react";

interface Props {
  icon: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export default function TopBarIconButton({ icon, onClick, className = "" }: Props) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`w-10 h-10 rounded-full bg-[rgba(43,43,43,0.08)] backdrop-blur-sm border border-[rgba(43,43,43,0.10)] flex items-center justify-center cursor-pointer ${className}`}
    >
      {icon}
    </motion.button>
  );
}
