import type { EditableFieldProps } from "./types";

export default function EditableField({
  value, editing, onChange, type = "text", multiline, suffix, placeholder, className = "",
}: EditableFieldProps) {
  if (!editing) {
    return (
      <span className={`text-cm-text ${className}`}>
        {value}
        {suffix && <span className="text-cm-text-muted text-[9px] font-bold ml-0.5">{suffix}</span>}
      </span>
    );
  }

  const baseInput = "w-full text-[13px] bg-white rounded-[12px] px-3 outline-none focus:ring-1 focus:ring-cm-border-soft border border-cm-border-soft transition-all";
  const handler = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange?.(e.target.value);

  if (multiline) {
    return (
      <textarea
        value={String(value)}
        onChange={handler}
        placeholder={placeholder}
        className={`${baseInput} py-2.5 resize-none min-h-[80px]`}
      />
    );
  }

  return (
    <div className="relative">
      <input
        type={type}
        value={String(value)}
        onChange={handler}
        placeholder={placeholder}
        className={`${baseInput} h-11 ${suffix ? "pr-10" : ""}`}
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-cm-text-muted">
          {suffix}
        </span>
      )}
    </div>
  );
}
