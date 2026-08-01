import type { ReactNode } from "react";

interface SettingsSectionProps {
  label: string;
  description?: string;
  dangerous?: boolean;
  children: ReactNode;
}

export default function SettingsSection({ label, description, dangerous, children }: SettingsSectionProps) {
  return (
    <div className="mb-6">
      <div className="px-4 mb-2">
        <span className={`text-[11px] font-semibold uppercase tracking-wider ${
          dangerous ? "text-cm-error" : "text-cm-text-muted"
        }`}>
          {label}
        </span>
        {description && (
          <p className="text-[12px] text-cm-text-muted mt-1 leading-relaxed">{description}</p>
        )}
      </div>
      <div className={`mx-4 rounded-2xl border overflow-hidden ${
        dangerous
          ? "bg-cm-elevated border-red-200 shadow-sm"
          : "bg-cm-elevated border-cm-border-soft shadow-cm-card"
      }`}>
        {children}
      </div>
    </div>
  );
}
