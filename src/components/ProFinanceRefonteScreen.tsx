import { useState } from "react";
import { ArrowLeft, Landmark, ArrowUpRight, ArrowDownLeft, QrCode, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { PaymentTransaction, ProFinanceSummary } from "../types";

interface ProFinanceRefonteScreenProps {
  summary: ProFinanceSummary;
  transactions: PaymentTransaction[];
  onBack: () => void;
  onShowQR: () => void;
  onWithdraw: () => void;
}

const STATUS_ICONS: Record<string, typeof Clock> = {
  pending: Clock,
  completed: CheckCircle,
  failed: AlertCircle,
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-600",
  completed: "bg-green-100 text-green-600",
  failed: "bg-red-100 text-red-600",
};

export default function ProFinanceRefonteScreen({
  summary, transactions, onBack, onShowQR, onWithdraw,
}: ProFinanceRefonteScreenProps) {
  const [tab, setTab] = useState<"all" | "completed" | "pending">("all");

  const filtered = transactions.filter(t => {
    if (tab === "completed") return t.status === "completed";
    if (tab === "pending") return t.status === "pending";
    return true;
  });

  return (
    <div className="flex flex-col w-full min-h-screen bg-brand-cream pb-32">
      <header className="flex items-center justify-between px-4 py-3 bg-brand-cream/90 backdrop-blur-md sticky top-0 z-10">
        <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-full bg-white text-brand-forest hover:bg-pale-mint transition-colors shadow-sm cursor-pointer active:scale-95">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="font-sans text-sm font-bold">Finance</h1>
        <button onClick={onShowQR} className="w-9 h-9 flex items-center justify-center rounded-full bg-brand-lime text-brand-forest cursor-pointer active:scale-95">
          <QrCode className="w-4 h-4" />
        </button>
      </header>

      {/* Balance cards */}
      <div className="px-4 pt-4 space-y-2">
        <div className="bg-gradient-to-br from-brand-forest to-brand-forest/90 rounded-2xl p-5 shadow-premium">
          <p className="text-[10px] text-white/60 font-bold uppercase tracking-wider">Solde disponible</p>
          <p className="text-3xl font-extrabold text-white mt-1">{summary.availableBalanceXOF.toLocaleString()} F</p>
          <div className="flex gap-2 mt-3">
            <button onClick={onWithdraw} className="flex-1 h-10 bg-white/15 rounded-xl text-white text-[10px] font-bold flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 hover:bg-white/20 transition-all">
              <ArrowUpRight className="w-3.5 h-3.5" /> Retirer
            </button>
            <button onClick={onShowQR} className="flex-1 h-10 bg-brand-lime rounded-xl text-brand-forest text-[10px] font-bold flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 hover:brightness-105 transition-all">
              <QrCode className="w-3.5 h-3.5" /> QR Code
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="bg-white rounded-2xl p-3 border border-pale-mint/20 shadow-sm flex-1">
            <p className="text-[9px] text-secondary">En attente</p>
            <p className="text-sm font-extrabold">{summary.pendingBalanceXOF.toLocaleString()} F</p>
          </div>
          <div className="bg-white rounded-2xl p-3 border border-pale-mint/20 shadow-sm flex-1">
            <p className="text-[9px] text-secondary">Ce mois</p>
            <p className="text-sm font-extrabold">{summary.monthEarningsXOF.toLocaleString()} F</p>
          </div>
        </div>
      </div>

      {/* Tab filter */}
      <div className="px-4 mt-4 flex gap-1.5">
        {(["all", "completed", "pending"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-xl text-[9px] font-bold cursor-pointer active:scale-95 transition-all ${
              tab === t ? "bg-brand-forest text-white" : "bg-white text-secondary border border-pale-mint/20"
            }`}
          >
            {t === "all" ? "Tout" : t === "completed" ? "Réalisés" : "En attente"}
          </button>
        ))}
      </div>

      {/* Transaction list */}
      <div className="px-4 mt-3 space-y-1.5">
        {filtered.map((tx) => {
          return (
            <div key={tx.id} className="bg-white rounded-2xl p-3.5 border border-pale-mint/20 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-green-100">
                <ArrowDownLeft className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-xs truncate">Paiement #{tx.missionId.slice(0, 6)}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-[9px] text-secondary">{new Date(tx.createdAt).toLocaleDateString("fr-FR")}</p>
                  <div className={`w-1 h-1 rounded-full ${STATUS_STYLES[tx.status]?.split(" ")[0] || "bg-secondary"}`} />
                  <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold ${STATUS_STYLES[tx.status] || "bg-secondary/10 text-secondary"}`}>
                    {tx.status === "completed" ? "Réalisé" : tx.status === "pending" ? "En attente" : "Échoué"}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-xs font-extrabold text-green-600`}>
                  +{tx.amountXOF.toLocaleString()} F
                </p>
                <p className="text-[8px] text-secondary/60">{100 - tx.commissionPercent}% net</p>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-8">
            <Landmark className="w-10 h-10 text-pale-mint mx-auto mb-2" />
            <p className="text-xs text-secondary/50">Aucune transaction</p>
          </div>
        )}
      </div>
    </div>
  );
}
