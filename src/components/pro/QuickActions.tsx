import type { ReactNode } from "react";
import { motion } from "motion/react";

export interface QuickAction {
  icon: ReactNode;
  label: string;
  hint: string;
  onClick: () => void;
}

interface QuickActionsProps {
  actions: QuickAction[];
}

export default function QuickActions({ actions }: QuickActionsProps) {
  if (actions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.18 }}
      className="grid grid-cols-2 gap-2 mb-4"
    >
      {actions.map((a) => (
        <button
          key={a.label}
          onClick={a.onClick}
          className="bg-cm-elevated border border-cm-border rounded-[16px] p-3.5 text-left cursor-pointer active:scale-[0.98] transition-transform hover:bg-cm-surface shadow-sm"
        >
          <div className="text-cm-text mb-1.5">{a.icon}</div>
          <p className="text-[12px] font-bold text-cm-text">{a.label}</p>
          <p className="text-[9px] text-cm-text-muted">{a.hint}</p>
        </button>
      ))}
    </motion.div>
  );
}
