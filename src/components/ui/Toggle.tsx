interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  id?: string;
}

export default function Toggle({ enabled, onChange, id }: ToggleProps) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={`relative w-12 h-7 rounded-full transition-colors border-2 cursor-pointer shrink-0 ${
        enabled
          ? "bg-cm-accent border-cm-accent"
          : "bg-cm-border-soft border-cm-border"
      }`}
    >
      <div
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-300 shadow-sm ${
          enabled ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
