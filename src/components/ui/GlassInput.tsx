import type { InputHTMLAttributes, ReactNode } from "react";

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  readonly label?: string;
  readonly error?: string;
  readonly icon?: ReactNode;
  readonly multiline?: boolean;
  readonly className?: string;
}

export default function GlassInput({
  label,
  error,
  icon,
  multiline = false,
  className = "",
  ...props
}: GlassInputProps) {
  const inputClasses = `w-full text-[14px] bg-cm-bg border border-cm-border rounded-[12px] outline-none transition-all duration-200 text-cm-text placeholder-cm-text-muted focus:border-cm-accent ${icon ? "pl-10" : "px-4"} ${error ? "border-cm-accent" : ""} ${multiline ? "py-3 min-h-[100px] resize-none" : "h-12"}`;

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-[12px] font-medium text-cm-text-soft uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-cm-text-muted">
            {icon}
          </div>
        )}
        {multiline ? (
          <textarea className={`${inputClasses} ${className}`} {...(props as any)} />
        ) : (
          <input className={`${inputClasses} ${className}`} {...(props as any)} />
        )}
      </div>
      {error && (
        <p className="text-[12px] text-cm-accent">{error}</p>
      )}
    </div>
  );
}
