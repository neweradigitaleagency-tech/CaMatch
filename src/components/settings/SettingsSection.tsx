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
          dangerous ? "text-red-500" : "text-gray-400"
        }`}>
          {label}
        </span>
        {description && (
          <p className="text-[12px] text-gray-400 mt-1 leading-relaxed">{description}</p>
        )}
      </div>
      <div className={`mx-4 rounded-2xl border overflow-hidden ${
        dangerous
          ? "bg-white border-red-200 shadow-sm"
          : "bg-white border-gray-100 shadow-cm-card"
      }`}>
        {children}
      </div>
    </div>
  );
}
