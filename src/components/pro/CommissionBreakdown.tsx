import { commissionBreakdown } from "../../data/proCommission";
import { formatXOF } from "./dashboard";

interface CommissionBreakdownProps {
  subtotalXOF: number;
  percent: number;
  compact?: boolean;
}

export default function CommissionBreakdown({ subtotalXOF, percent, compact = false }: CommissionBreakdownProps) {
  const { commissionXOF, proNetXOF } = commissionBreakdown(subtotalXOF, percent);

  return (
    <div className="rounded-[16px] bg-cm-surface p-3.5 space-y-1.5">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-cm-text-muted">Sous-total</span>
        <span className="font-semibold text-cm-text">{formatXOF(subtotalXOF)}</span>
      </div>
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-cm-text-muted">Frais de service Ça Match ({percent}%)</span>
        <span className="font-semibold text-cm-accent">−{formatXOF(commissionXOF)}</span>
      </div>
      <div className={`flex items-center justify-between pt-1.5 border-t border-cm-border ${compact ? "" : "mt-1"}`}>
        <span className={`font-bold text-cm-text ${compact ? "text-[12px]" : "text-[13px]"}`}>Vous percevrez</span>
        <span className={`font-bold text-cm-text font-mono ${compact ? "text-[14px]" : "text-[17px]"}`}>{formatXOF(proNetXOF)}</span>
      </div>
    </div>
  );
}
