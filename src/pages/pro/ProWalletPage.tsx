import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Wallet, Send, CheckCircle, Clock } from "lucide-react";
import { MOCK_FINANCE_SUMMARY, MOCK_PAYMENT_TXS } from "../../services/mockData";

export default function ProWalletPage() {
  const nav = useNavigate();

  return (
    <div className="min-h-dynamic bg-cm-bg">
      <div className="sticky top-0 z-10 bg-cm-elevated/80 backdrop-blur-lg border-b border-cm-border">
        <div className="flex items-center justify-between h-14 px-5">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => nav(-1)} className="p-1 -ml-1 cursor-pointer active:scale-[0.97]">
              <ArrowLeft className="w-5 h-5 text-cm-text" />
            </button>
            <h1 className="text-[18px] font-bold text-cm-text">Portefeuille</h1>
          </div>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-cm-accent text-cm-text-onAccent text-[12px] font-semibold rounded-full cursor-pointer active:scale-[0.97]">
            <Send className="w-3.5 h-3.5" />
            <span>Retirer</span>
          </button>
        </div>
      </div>
      <div className="w-full max-w-[448px] mx-auto px-5 pt-4 pb-24 space-y-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-cm-elevated border border-cm-border rounded-[14px] p-5"
        >
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="w-4 h-4 text-cm-accent" />
            <p className="text-[11px] text-cm-text-muted">Solde disponible</p>
          </div>
          <p className="text-[28px] font-bold text-cm-text font-mono">
            {MOCK_FINANCE_SUMMARY.availableBalanceXOF.toLocaleString("fr-FR")} F
          </p>
          <div className="flex items-center gap-3 mt-3 text-[11px] text-cm-text-muted">
            <span>Total gagné: {MOCK_FINANCE_SUMMARY.totalEarningsXOF.toLocaleString("fr-FR")} F</span>
            <span>Retiré: {MOCK_FINANCE_SUMMARY.totalWithdrawnXOF.toLocaleString("fr-FR")} F</span>
          </div>
        </motion.div>

        <h2 className="text-[13px] font-bold text-cm-text">Transactions récentes</h2>
        <div className="space-y-2">
          {MOCK_PAYMENT_TXS.map((tx, i) => {
            const isCompleted = tx.status === "completed";
            return (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-cm-elevated border border-cm-border rounded-[14px] p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center ${
                      isCompleted ? "bg-green-500/15" : "bg-orange-500/15"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-orange-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-[12px] font-medium text-cm-text">
                      {tx.method.replace("_", " ")} · {tx.id}
                    </p>
                    <p className="text-[10px] text-cm-text-muted">
                      {new Date(tx.createdAt).toLocaleDateString("fr-FR")}
                      <span className={`ml-2 ${isCompleted ? "text-green-600" : "text-orange-500"}`}>
                        {isCompleted ? "Complété" : "En attente"}
                      </span>
                    </p>
                  </div>
                </div>
                <span className="text-[13px] font-bold font-mono text-cm-text">
                  {tx.amountXOF.toLocaleString("fr-FR")} F
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
