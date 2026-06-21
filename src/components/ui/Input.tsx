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
        <label className="text-caption font-medium text-secondary uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary/60">
            {icon}
          </div>
        )}
        <input
          className={`w-full h-11 text-sm bg-white dark:bg-brand-forest/10 rounded-xl px-3 outline-none transition-all duration-200 border ${
            error
              ? "border-cm-error focus:ring-1 focus:ring-cm-error"
              : "border-pale-mint/30 focus:ring-1 focus:ring-cm-green"
          } ${icon ? "pl-10" : ""} text-brand-forest dark:text-brand-cream placeholder-secondary/50 ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="text-caption text-cm-error">{error}</p>
      )}
    </div>
  );
}
