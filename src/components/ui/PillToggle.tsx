interface Pill {
  value: string;
  label: string;
}

interface Props {
  pills: [Pill, Pill];
  active: string;
  onChange: (value: string) => void;
}

export default function PillToggle({ pills, active, onChange }: Props) {
  return (
    <div className="flex items-center gap-1 h-[38px]">
      {pills.map((p) => {
        const isActive = active === p.value;
        return (
          <button
            key={p.value}
            onClick={() => onChange(p.value)}
            className={`px-[18px] py-[8px] rounded-full text-[15px] cursor-pointer transition-all duration-200 ${
              isActive
                ? "bg-cm-accent text-cm-text-onAccent font-medium"
                : "bg-transparent text-cm-text font-normal"
            }`}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}
