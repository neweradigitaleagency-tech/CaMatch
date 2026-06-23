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
  pending: "bg-cm-accent-soft text-cm-accent",
  completed: "bg-cm-elevated text-cm-text border border-cm-border",
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
    <div className="flex flex-col w-full min-h-screen bg-cm-bg pb-32">
      <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-10 bg-cm-elevated border-b border-cm-border">
        <button onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-full text-cm-text hover:bg-cm-accent-soft transition-colors cursor-pointer active:scale-95">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[14px] font-display font-bold text-cm-text">Finances</h1>
        <div className="w-10" />
      </header>

      <div className="px-4 pt-5 space-y-4">
        <div className="bg-cm-elevated rounded-2xl p-5 border border-cm-border">
          <p className="text-[11px] font-mono text-cm-text-soft uppercase mb-1">Solde disponible</p>
          <p className="text-[28px] font-display font-bold text-cm-text font-mono tracking-tight">
            {summary.availableBalanceXOF.toLocaleString("fr-FR")} F
          </p>
          <p className="text-[11px] font-mono text-cm-text-soft mt-1">
            En attente : {summary.pendingBalanceXOF.toLocaleString("fr-FR")} F
          </p>
          <div className="flex gap-2 mt-4">
            <button onClick={onWithdraw}
              className="flex-1 h-11 bg-cm-text text-cm-bg rounded-xl text-[12px] font-display font-bold cursor-pointer active:scale-95 hover:opacity-90 transition-all">
              <ArrowUpRight className="w-4 h-4 inline mr-1" /> Retirer
            </button>
            <button onClick={onShowQR}
              className="flex-1 h-11 border border-cm-border text-cm-text rounded-xl text-[12px] font-display font-bold cursor-pointer active:scale-95 hover:bg-cm-accent-soft transition-all">
              <QrCode className="w-4 h-4 inline mr-1" /> QR Code
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Aujourd'hui", value: summary.todayEarningsXOF },
            { label: "Cette semaine", value: summary.weekEarningsXOF },
            { label: "Ce mois", value: summary.monthEarningsXOF },
          ].map((e) => (
            <div key={e.label} className="bg-cm-elevated rounded-xl p-3 border border-cm-border text-center">
              <p className="text-[10px] font-mono text-cm-text-soft uppercase">{e.label}</p>
              <p className="text-[14px] font-display font-bold text-cm-text mt-1 font-mono">{e.value.toLocaleString("fr-FR")} F</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 border-b border-cm-border pb-3">
          {(["all", "completed", "pending"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-full text-[12px] font-medium font-display transition-all cursor-pointer active:scale-95 ${
                tab === t
                  ? "bg-cm-text text-cm-bg"
                  : "bg-cm-elevated text-cm-text-soft border border-cm-border hover:bg-cm-accent-soft"
              }`}>
              {t === "all" ? "Tout" : t === "completed" ? "Complétés" : "En attente"}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <Landmark className="w-10 h-10 text-cm-text-soft/50 mx-auto mb-3" />
              <p className="text-[13px] text-cm-text-soft">Aucune transaction</p>
            </div>
          ) : (
            filtered.map((tx) => {
              const Icon = STATUS_ICONS[tx.status] || Clock;
              const style = STATUS_STYLES[tx.status] || "bg-gray-100 text-gray-600";
              return (
                <div key={tx.id} className="bg-cm-elevated rounded-xl p-4 border border-cm-border flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cm-accent-soft flex items-center justify-center shrink-0">
                    <ArrowDownLeft className="w-5 h-5 text-cm-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-cm-text truncate">
                      Mission #{tx.missionId.slice(0, 8)}
                    </p>
                    <p className="text-[11px] font-mono text-cm-text-soft">
                      {tx.method.replace("_", " ")} • {new Date(tx.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] font-display font-bold text-cm-text font-mono">
                      {tx.amountXOF.toLocaleString("fr-FR")} F
                    </p>
                    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full ${style}`}>
                      <Icon className="w-3 h-3" />
                      {tx.status === "completed" ? "Payé" : tx.status === "pending" ? "En attente" : "Échoué"}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
