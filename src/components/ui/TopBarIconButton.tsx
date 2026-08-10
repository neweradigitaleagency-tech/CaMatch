import { motion } from "motion/react";

interface Props {
  icon: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export default function TopBarIconButton({ icon, onClick, className = "" }: Props) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`p-1 cursor-pointer active:scale-[0.97] transition-transform touch-min ${className}`}
    >
      {icon}
    </motion.button>
  );
}
