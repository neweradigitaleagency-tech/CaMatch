import { useState } from "react";
import { motion } from "motion/react";
import { Wallet, ChevronRight, ArrowDownToLine } from "lucide-react";
import { MOCK_REVENUE_HISTORY } from "../../services/mockData";
import { formatXOF } from "./dashboard";

interface EarningsCardProps {
  finance: {
    today: number;
    week: number;
    month: number;
    available: number;
    pending: number;
  };
  onWithdraw: () => void;
  onViewAll: () => void;
}

type Segment = "jour" | "semaine" | "mois";

const SEGMENTS: { key: Segment; label: string }[] = [
  { key: "jour", label: "Jour" },
  { key: "semaine", label: "Semaine" },
  { key: "mois", label: "Mois" },
];

export default function EarningsCard({ finance, onWithdraw, onViewAll }: EarningsCardProps) {
  const [segment, setSegment] = useState<Segment>("jour");
  const chartMax = Math.max(...MOCK_REVENUE_HISTORY);
  const value = segment === "jour" ? finance.today : segment === "semaine" ? finance.week : finance.month;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="bg-cm-elevated border border-cm-border rounded-[20px] p-4 shadow-sm mb-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-cm-text" />
          <span className="text-[14px] font-bold text-cm-text">Revenus</span>
        </div>
        <button
          onClick={onViewAll}
          className="text-[11px] font-medium text-cm-text-soft cursor-pointer hover:underline flex items-center gap-0.5"
        >
          Voir tout <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      <div className="bg-cm-surface rounded-[12px] p-1 flex mb-4">
        {SEGMENTS.map((s) => (
          <button
            key={s.key}
            onClick={() => setSegment(s.key)}
            className={`flex-1 h-8 rounded-[8px] text-[11px] font-bold cursor-pointer active:scale-[0.98] transition-colors ${
              segment === s.key ? "bg-cm-text text-white shadow-sm" : "text-cm-text-muted hover:text-cm-text-soft"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="flex items-end gap-1 mb-4">
        <motion.span
          key={value}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[28px] font-extrabold text-cm-text font-mono"
        >
          {value.toLocaleString("fr-FR")}
        </motion.span>
        <span className="text-[12px] font-medium text-cm-text-muted mb-1">F</span>
      </div>

      <div className="flex items-end gap-1 h-12 mb-4">
        {MOCK_REVENUE_HISTORY.map((v, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${(v / chartMax) * 100}%` }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="flex-1 bg-cm-text rounded-t-sm opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
          />
        ))}
      </div>

      <div className="bg-cm-surface rounded-[14px] p-3 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-cm-text-muted">Solde disponible</p>
          <p className="text-[16px] font-extrabold text-cm-text font-mono">{formatXOF(finance.available)}</p>
          <p className="text-[10px] text-cm-text-muted mt-1">
            + {formatXOF(finance.pending)} en attente
          </p>
        </div>
        <button
          onClick={onWithdraw}
          className="h-10 px-4 rounded-[12px] bg-cm-text text-white text-[12px] font-bold cursor-pointer active:scale-[0.97] transition-transform hover:bg-cm-text/90 shadow-sm flex items-center gap-1.5 shrink-0"
        >
          <ArrowDownToLine className="w-3.5 h-3.5" /> Retirer
        </button>
      </div>
    </motion.div>
  );
}
