import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Download, TrendingUp, TrendingDown } from "lucide-react";
import { MOCK_FINANCE_SUMMARY, MOCK_REVENUE_HISTORY, MONTH_LABELS } from "../../services/mockData";

export default function ProRevenusPage() {
  const nav = useNavigate();
  const maxVal = Math.max(...MOCK_REVENUE_HISTORY, 1);
  const current = MOCK_REVENUE_HISTORY[MOCK_REVENUE_HISTORY.length - 1] ?? 0;
  const prev = MOCK_REVENUE_HISTORY[MOCK_REVENUE_HISTORY.length - 2] ?? 0;
  const trend = current > prev;

  return (
    <div className="min-h-dynamic bg-cm-bg">
      <div className="sticky top-0 z-10 bg-cm-elevated/80 backdrop-blur-lg border-b border-cm-border">
        <div className="flex items-center justify-between h-14 px-5">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => nav(-1)} className="p-1 -ml-1 cursor-pointer active:scale-[0.97]">
              <ArrowLeft className="w-5 h-5 text-cm-text" />
            </button>
            <h1 className="text-[18px] font-bold text-cm-text">Revenus</h1>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-cm-accent text-white text-[12px] font-semibold rounded-full cursor-pointer active:scale-[0.97]">
            <Download className="w-3.5 h-3.5" />
            <span>Exporter</span>
          </button>
        </div>
      </div>
      <div className="w-full max-w-[448px] mx-auto px-5 pt-4 pb-24 space-y-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-cm-elevated border border-cm-border rounded-[14px] p-5"
        >
          <p className="text-[11px] text-cm-text-muted mb-1">Solde disponible</p>
          <p className="text-[28px] font-bold text-cm-text font-mono">
            {MOCK_FINANCE_SUMMARY.availableBalanceXOF.toLocaleString("fr-FR")} FCFA
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            {trend ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span className={`text-[12px] font-medium ${trend ? "text-green-500" : "text-red-500"}`}>
              {trend ? "+" : ""}{(current - prev).toLocaleString("fr-FR")} FCFA vs mois dernier
            </span>
          </div>
        </motion.div>

        <div className="bg-cm-elevated border border-cm-border rounded-[14px] p-5">
          <h2 className="text-[13px] font-bold text-cm-text mb-4">Évolution (6 mois)</h2>
          <div className="flex items-end justify-between h-32 gap-1.5">
            {MOCK_REVENUE_HISTORY.map((val, i) => {
              const h = (val / maxVal) * 100;
              const isLast = i === MOCK_REVENUE_HISTORY.length - 1;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px] font-mono text-cm-text-muted">{val.toLocaleString("fr-FR")}</span>
                  <div
                    className={`w-full rounded-t-sm transition-all ${
                      isLast ? "bg-cm-accent" : "bg-cm-accent/40"
                    }`}
                    style={{ height: `${h}%`, minHeight: 4 }}
                  />
                  <span className="text-[9px] text-cm-text-muted">{MONTH_LABELS[i]}</span>
                </div>
              );
            })}
          </div>
        </div>

        <h2 className="text-[13px] font-bold text-cm-text">Détail mensuel</h2>
        <div className="space-y-2">
          {MOCK_REVENUE_HISTORY.map((val, i) => (
            <div
              key={i}
              className="bg-cm-elevated border border-cm-border rounded-[12px] p-3 flex items-center justify-between"
            >
              <p className="text-[12px] font-medium text-cm-text">{MONTH_LABELS[i]} 2026</p>
              <span className="text-[13px] font-bold font-mono text-cm-text">
                {val.toLocaleString("fr-FR")} FCFA
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
