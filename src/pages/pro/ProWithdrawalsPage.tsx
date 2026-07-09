import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, CheckCircle, Clock, ArrowUpRight } from "lucide-react";
import { MOCK_PAYMENT_TXS } from "../../services/mockData";
import { getPaymentMethodLabel } from "../../data/plans";

export default function ProWithdrawalsPage() {
  const nav = useNavigate();
  const withdrawals = MOCK_PAYMENT_TXS.filter((tx) => tx.status === "completed");

  return (
    <div className="min-h-dynamic bg-cm-bg">
      <div className="sticky top-0 z-10 bg-cm-elevated/80 backdrop-blur-lg border-b border-cm-border">
        <div className="flex items-center h-14 px-5 gap-3">
          <button type="button" onClick={() => nav(-1)} className="p-1 -ml-1 cursor-pointer active:scale-[0.97]">
            <ArrowLeft className="w-5 h-5 text-cm-text" />
          </button>
          <h1 className="text-[18px] font-bold text-cm-text">Retraits</h1>
        </div>
      </div>
      <div className="w-full max-w-[448px] mx-auto px-5 pt-4 pb-24 space-y-3">
        {withdrawals.map((tx, i) => (
          <motion.div key={tx.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-cm-elevated border border-cm-border rounded-[14px] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-green-500/15 flex items-center justify-center">
                {tx.status === "completed" ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Clock className="w-4 h-4 text-orange-500" />}
              </div>
              <div>
                <p className="text-[12px] font-medium text-cm-text">{getPaymentMethodLabel(tx.method)}</p>
                <p className="text-[10px] text-cm-text-muted">{new Date(tx.createdAt).toLocaleDateString("fr-FR")}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold font-mono text-green-600">+{tx.proAmountXOF.toLocaleString("fr-FR")} F</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-green-600" />
            </div>
          </motion.div>
        ))}
        {withdrawals.length === 0 && (
          <div className="text-center py-10">
            <p className="text-[13px] text-cm-text-muted">Aucun retrait effectué</p>
          </div>
        )}
      </div>
    </div>
  );
}
