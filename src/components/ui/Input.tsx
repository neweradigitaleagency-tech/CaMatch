import type { InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  readonly label?: string;
  readonly error?: string;
  readonly icon?: ReactNode;
  readonly className?: string;
}

export default function Input({
  label,
  error,
  icon,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-[13px] font-medium text-cm-text">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-cm-text-muted">
            {icon}
          </div>
        )}
        <input
          className={`w-full h-11 text-[14px] bg-cm-elevated border border-cm-border rounded-[var(--radius-cm)] outline-none transition-all duration-200 text-cm-text placeholder-cm-text-muted focus:border-cm-accent ${
            error ? "border-cm-error" : ""
          } ${icon ? "pl-9 pr-3" : "px-3"} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="text-[12px] text-cm-error">{error}</p>
      )}
    </div>
  );
}
