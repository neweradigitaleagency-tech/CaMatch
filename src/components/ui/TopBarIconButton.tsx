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
      className={`w-10 h-10 rounded-full bg-cm-elevated flex items-center justify-center shadow-cm-md cursor-pointer ${className}`}
    >
      {icon}
    </motion.button>
  );
}
