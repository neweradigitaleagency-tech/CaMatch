import { motion } from "motion/react";
import type { ProfileSectionProps } from "./types";

export default function ProfileSection({ title, subtitle, children, className = "", editable }: ProfileSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`px-4 mt-4 ${className}`}
    >
      {(title || subtitle) && (
        <div className="flex items-center justify-between mb-3 px-0.5">
          {title && (
            <h3 className={`text-[13px] font-black text-cm-text tracking-tight ${editable ? "text-cm-accent" : ""}`}>
              {title}
            </h3>
          )}
          {subtitle && (
            <span className="text-[10px] font-bold text-cm-text-muted">{subtitle}</span>
          )}
        </div>
      )}
      {children}
    </motion.section>
  );
}
