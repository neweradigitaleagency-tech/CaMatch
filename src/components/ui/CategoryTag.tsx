interface Props {
  flag: string;
  label: string;
}

export default function CategoryTag({ flag, label }: Props) {
  return (
    <div className="absolute bottom-2 left-2 px-2 py-1 rounded-[6px] bg-black/50 backdrop-blur-[4px] flex items-center gap-1">
      <span className="text-[14px]">{flag}</span>
      <span className="text-[11px] font-semibold text-white uppercase tracking-[0.5px]">{label}</span>
    </div>
  );
}
