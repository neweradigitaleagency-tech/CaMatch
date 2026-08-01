import type { ReactNode } from "react";

interface DrawerSectionProps {
  label: string;
  children: ReactNode;
}

export default function DrawerSection({ label, children }: DrawerSectionProps) {
  return (
    <div className="mb-1">
      <div className="px-4 pt-4 pb-1">
        <span className="text-[11px] font-bold text-cm-text-muted uppercase tracking-wider">{label}</span>
      </div>
      {children}
    </div>
  );
}
