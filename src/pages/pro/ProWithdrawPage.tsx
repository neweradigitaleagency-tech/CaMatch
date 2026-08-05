import { useAppNavigation } from "../../navigation/useAppNavigation";
import { motion } from "motion/react";
import { ArrowLeft, Send, Wallet, ChevronDown, CheckCircle } from "lucide-react";
import { useState } from "react";
import { MOCK_FINANCE_SUMMARY } from "../../services/mockData";
import { PAYMENT_METHODS } from "../../data/plans";

export default function ProWithdrawPage() {
  const { goBack, complete } = useAppNavigation();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("orange_money");
  const [showMethods, setShowMethods] = useState(false);
  const [success, setSuccess] = useState(false);

  const balance = MOCK_FINANCE_SUMMARY.availableBalanceXOF;
  const numAmount = parseInt(amount.replace(/\s/g, "")) || 0;
  const isValid = numAmount > 0 && numAmount <= balance;

  const handleSubmit = () => {
    if (!isValid) return;
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-dynamic bg-cm-bg">
        <div className="w-full max-w-[448px] mx-auto px-5 pt-20 pb-24 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-[18px] font-bold text-cm-text mb-1">Retrait en cours</h2>
          <p className="text-[13px] text-cm-text-muted mb-6">
            {numAmount.toLocaleString("fr-FR")} F vers {PAYMENT_METHODS.find((p) => p.value === method)?.label || method}
          </p>
          <button onClick={() => complete()}
            className="h-11 px-6 bg-cm-text text-white text-[12px] font-bold rounded-[14px] cursor-pointer active:scale-[0.97]">
            Voir le portefeuille
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dynamic bg-cm-bg">
      <div className="sticky top-0 z-10 bg-cm-elevated/80 backdrop-blur-lg border-b border-cm-border">
        <div className="flex items-center h-14 px-5 gap-3">
          <button type="button" onClick={() => goBack()} className="p-1 -ml-1 cursor-pointer active:scale-[0.97]">
            <ArrowLeft className="w-5 h-5 text-cm-text" />
          </button>
          <h1 className="text-[18px] font-bold text-cm-text">Retirer mes revenus</h1>
        </div>
      </div>
      <div className="w-full max-w-[448px] mx-auto px-5 pt-4 pb-24 space-y-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="bg-cm-elevated border border-cm-border rounded-[14px] p-5">
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="w-4 h-4 text-cm-accent" />
            <p className="text-[11px] text-cm-text-muted">Solde disponible</p>
          </div>
          <p className="text-[26px] font-bold text-cm-text font-mono">{balance.toLocaleString("fr-FR")} F</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-cm-elevated border border-cm-border rounded-[14px] p-5 space-y-4">
          <div>
            <p className="text-[11px] font-medium text-cm-text-muted mb-1.5">Montant à retirer</p>
            <div className="relative">
              <input
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full h-12 px-4 text-[20px] font-bold font-mono bg-cm-bg border border-cm-border rounded-[12px] outline-none text-cm-text placeholder-cm-text-muted"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[14px] font-bold text-cm-text-muted">F</span>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-medium text-cm-text-muted mb-1.5">Méthode de retrait</p>
            <button onClick={() => setShowMethods(!showMethods)}
              className="w-full flex items-center justify-between h-12 px-4 bg-cm-bg border border-cm-border rounded-[12px] cursor-pointer active:scale-[0.97]">
              <div className="flex items-center gap-2">
                <span className="text-[16px]">{PAYMENT_METHODS.find((p) => p.value === method)?.icon || "📱"}</span>
                <span className="text-[13px] text-cm-text">{PAYMENT_METHODS.find((p) => p.value === method)?.label || method}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-cm-text-muted" />
            </button>
            {showMethods && (
              <div className="mt-1 bg-cm-bg border border-cm-border rounded-[12px] overflow-hidden">
                {PAYMENT_METHODS.map((pm) => (
                  <button key={pm.value} onClick={() => { setMethod(pm.value); setShowMethods(false); }}
                    className={`w-full flex items-center gap-2 px-4 py-3 text-[13px] cursor-pointer active:scale-[0.97] ${method === pm.value ? "bg-cm-accent/10 text-cm-accent font-semibold" : "text-cm-text"}`}>
                    <span className="text-[16px]">{pm.icon}</span> {pm.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        <button onClick={handleSubmit} disabled={!isValid}
          className={`w-full h-12 rounded-[14px] text-[13px] font-bold flex items-center justify-center gap-2 cursor-pointer active:scale-[0.97] transition-all ${isValid ? "bg-cm-text text-white" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>
          <Send className="w-4 h-4" /> Retirer
        </button>

        {numAmount > balance && (
          <p className="text-[11px] text-red-500 text-center">Le montant dépasse votre solde disponible</p>
        )}
      </div>
    </div>
  );
}
