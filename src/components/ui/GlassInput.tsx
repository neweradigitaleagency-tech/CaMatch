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
  const inputClasses = `w-full text-[14px] bg-[rgba(255,255,255,0.50)] backdrop-blur-[8px] border border-[rgba(232,224,208,0.80)] rounded-[12px] outline-none transition-all duration-200 text-ca-text-primary placeholder-[#8A9E85] focus:border-[rgba(82,183,136,0.60)] focus:bg-[rgba(255,255,255,0.70)] ${icon ? "pl-10" : "px-4"} ${error ? "border-ca-error" : ""} ${multiline ? "py-3 min-h-[100px] resize-none" : "h-12"}`;

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
        {multiline ? (
          <textarea className={`${inputClasses} ${className}`} {...(props as any)} />
        ) : (
          <input className={`${inputClasses} ${className}`} {...(props as any)} />
        )}
      </div>
      {error && (
        <p className="text-[12px] text-ca-error">{error}</p>
      )}
    </div>
  );
}
