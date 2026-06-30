import { type LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  label: string;
}

export default function InfoChip({ icon: Icon, label }: Props) {
  return (
    <div className="h-[30px] flex items-center gap-1 px-[10px] py-[6px] rounded-[8px]">
      <Icon className="w-[14px] h-[14px] text-cm-text-soft" />
      <span className="text-[13px] font-medium text-cm-text whitespace-nowrap">{label}</span>
    </div>
  );
}
