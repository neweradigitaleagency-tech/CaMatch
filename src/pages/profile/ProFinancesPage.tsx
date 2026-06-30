import { useNavigate } from "react-router-dom";
import { MOCK_FINANCE_SUMMARY, MOCK_PAYMENT_TXS } from "../../services/mockData";
import { Wallet, ArrowLeft, TrendingUp, Clock } from "lucide-react";

export default function ProFinancesPage() {
  const nav = useNavigate();

  return (
    <div className="min-h-screen bg-cm-bg">
      <div className="sticky top-0 z-10 bg-cm-elevated/80 backdrop-blur-lg border-b border-cm-border">
        <div className="flex items-center h-14 px-5 gap-3">
          <button type="button" onClick={() => nav("/profile")} className="p-1 -ml-1">
            <ArrowLeft className="w-5 h-5 text-cm-text" />
          </button>
          <h1 className="text-[18px] font-bold text-cm-text">Finances</h1>
        </div>
      </div>
      <div className="px-5 pt-4 pb-24 space-y-4">
        <div className="bg-cm-elevated border border-cm-border rounded-[14px] p-5">
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="w-4 h-4 text-cm-accent" />
            <p className="text-[11px] text-cm-text-muted">Solde disponible</p>
          </div>
          <p className="text-[28px] font-bold text-cm-text font-mono">{MOCK_FINANCE_SUMMARY.availableBalanceXOF.toLocaleString("fr-FR")} F</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-cm-elevated border border-cm-border rounded-[14px] p-4">
            <TrendingUp className="w-4 h-4 text-cm-accent mb-1" />
            <p className="text-[11px] text-cm-text-muted">Mois</p>
            <p className="text-[16px] font-bold text-cm-text font-mono">{MOCK_FINANCE_SUMMARY.monthEarningsXOF.toLocaleString("fr-FR")} F</p>
          </div>
          <div className="bg-cm-elevated border border-cm-border rounded-[14px] p-4">
            <Clock className="w-4 h-4 text-cm-accent mb-1" />
            <p className="text-[11px] text-cm-text-muted">En attente</p>
            <p className="text-[16px] font-bold text-cm-text font-mono">{MOCK_FINANCE_SUMMARY.pendingBalanceXOF.toLocaleString("fr-FR")} F</p>
          </div>
        </div>
        <h2 className="text-[13px] font-bold text-cm-text">Transactions</h2>
        <div className="space-y-2">
          {MOCK_PAYMENT_TXS.map((tx) => (
            <div key={tx.id} className="bg-cm-elevated border border-cm-border rounded-[12px] p-3 flex items-center justify-between">
              <div>
                <p className="text-[12px] font-medium text-cm-text">{tx.id}</p>
                <p className="text-[10px] text-cm-text-muted">{new Date(tx.createdAt).toLocaleDateString("fr-FR")}</p>
              </div>
              <span className={`text-[12px] font-bold font-mono ${tx.status === "completed" ? "text-green-600" : tx.status === "pending" ? "text-orange-500" : "text-cm-error"}`}>
                {tx.amountXOF.toLocaleString("fr-FR")} F
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
