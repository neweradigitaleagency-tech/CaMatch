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
        <label className="text-[12px] font-medium text-ca-text-secondary uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-ca-text-muted">
            {icon}
          </div>
        )}
        <input
          className={`w-full h-12 text-[14px] bg-[rgba(255,255,255,0.50)] backdrop-blur-[8px] border border-[rgba(232,224,208,0.80)] rounded-[12px] outline-none transition-all duration-200 text-ca-text-primary placeholder-[#8A9E85] focus:border-[rgba(82,183,136,0.60)] focus:bg-[rgba(255,255,255,0.70)] ${
            error ? "border-ca-error" : ""
          } ${icon ? "pl-10 pr-4" : "px-4"} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="text-[12px] text-ca-error">{error}</p>
      )}
    </div>
  );
}
