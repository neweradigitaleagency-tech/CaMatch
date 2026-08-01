import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBackNavigation } from "../../hooks/useBackNavigation";
import { motion } from "motion/react";
import { ArrowLeft, Coins, Plus, Check, Loader, AlertCircle, ArrowUpRight, Gift } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useAuthStore } from "../../stores/authStore";
import { getCreditBalance, getCreditPacks, purchaseCredits, fetchCreditHistory } from "../../services/creditService";
import type { Credit, CreditTransaction } from "../../types/subscription";

const TX_TYPE_LABELS: Record<string, string> = {
  purchase: "Achat",
  spend: "Dépense",
  refund: "Remboursement",
  bonus: "Bonus",
  expired: "Expiré",
};

const TX_TYPE_COLORS: Record<string, string> = {
  purchase: "text-green-600 bg-green-50",
  spend: "text-red-600 bg-red-50",
  refund: "text-blue-600 bg-blue-50",
  bonus: "text-purple-600 bg-purple-50",
  expired: "text-cm-text-muted bg-cm-surface",
};

export default function ProCreditsPage() {
  const nav = useNavigate();
  const goBack = useBackNavigation("/pro/dashboard");
  const userId = useAuthStore((s) => s.userId) || "user_1";

  const [credit, setCredit] = useState<Credit | null>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPack, setSelectedPack] = useState<number | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  const packs = getCreditPacks();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [creditData, txData] = await Promise.all([
        getCreditBalance(userId),
        fetchCreditHistory(userId),
      ]);
      setCredit(creditData);
      setTransactions(txData);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  const handlePurchase = async (amount: number) => {
    setPurchasing(true);
    setPurchaseSuccess(false);
    try {
      const result = await purchaseCredits(userId, amount);
      setCredit(result.credit);
      setTransactions((prev) => [result.transaction, ...prev]);
      setSelectedPack(null);
      setPurchaseSuccess(true);
      setTimeout(() => setPurchaseSuccess(false), 3000);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPurchasing(false);
    }
  };

  if (error && !credit) {
    return (
      <div className="min-h-dynamic bg-cm-bg">
        <div className="sticky top-0 z-10 bg-cm-elevated/80 backdrop-blur-lg border-b border-cm-border">
          <div className="flex items-center h-14 px-5 gap-3">
            <button type="button" onClick={goBack} className="p-1 -ml-1 cursor-pointer active:scale-[0.97]">
              <ArrowLeft className="w-5 h-5 text-cm-text" />
            </button>
            <h1 className="text-[18px] font-bold text-cm-text">Crédits</h1>
          </div>
        </div>
        <div className="w-full max-w-[448px] mx-auto px-5 pt-4 pb-24">
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-3">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-[14px] font-semibold text-cm-text mb-1">Une erreur est survenue</h3>
            <p className="text-[12px] text-cm-text-soft text-center max-w-xs mb-4">{error}</p>
            <button
              onClick={fetchData}
              className="h-9 px-4 text-[12px] font-medium text-cm-text bg-cm-elevated border border-cm-border rounded-[var(--radius-cm)] cursor-pointer"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dynamic bg-cm-bg">
      <div className="sticky top-0 z-10 bg-cm-elevated/80 backdrop-blur-lg border-b border-cm-border">
        <div className="flex items-center h-14 px-5 gap-3">
          <button type="button" onClick={goBack} className="p-1 -ml-1 cursor-pointer active:scale-[0.97]">
            <ArrowLeft className="w-5 h-5 text-cm-text" />
          </button>
          <h1 className="text-[18px] font-bold text-cm-text">Crédits</h1>
        </div>
      </div>

      <div className="w-full max-w-[448px] mx-auto px-5 pt-4 pb-24 space-y-4">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-[10px]"
          >
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span className="text-[11px] text-red-600 flex-1">{error}</span>
            <button onClick={() => setError(null)} className="text-[11px] text-red-500 font-semibold cursor-pointer">
              OK
            </button>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-cm-elevated border border-cm-border rounded-[14px] p-5"
        >
          <div className="flex items-center gap-2 mb-1">
            <Coins className="w-5 h-5 text-amber-500" />
            <p className="text-[11px] text-cm-text-soft">Solde de crédits</p>
          </div>
          {loading ? (
            <div className="h-9 w-40 bg-cm-border rounded animate-pulse mt-1" />
          ) : (
            <p className="text-[32px] font-bold text-cm-text font-mono">
              {credit?.balance.toLocaleString("fr-FR") ?? 0}
            </p>
          )}
          {credit && (
            <div className="flex items-center gap-3 mt-2 text-[10px] text-cm-text-soft">
              <span>Gagnés: {credit.lifetime_earned.toLocaleString("fr-FR")}</span>
              <span>Dépensés: {credit.lifetime_spent.toLocaleString("fr-FR")}</span>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <h2 className="text-[13px] font-bold text-cm-text mb-3">Acheter des crédits</h2>
          <div className="grid grid-cols-1 gap-2">
            {packs.map((pack, i) => {
              const isSelected = selectedPack === pack.amount;
              const pricePerUnit = (pack.price / pack.amount).toFixed(2);
              return (
                <motion.div
                  key={pack.amount}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                >
                  <button
                    onClick={() => setSelectedPack(isSelected ? null : pack.amount)}
                    className={`w-full flex items-center gap-4 p-4 rounded-[var(--radius-cm)] border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "border-cm-accent bg-cm-accent-soft"
                        : "border-cm-border bg-cm-elevated hover:border-cm-text-muted"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      isSelected ? "bg-cm-accent text-cm-text-onAccent" : "bg-cm-accent-soft text-cm-accent"
                    }`}>
                      <Coins className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-bold text-cm-text">
                          {pack.amount.toLocaleString("fr-FR")} F
                        </span>
                        {pack.bonus > 0 && (
                          <span className="inline-flex items-center gap-0.5 h-5 px-1.5 bg-green-50 text-green-600 text-[9px] font-bold rounded-full">
                            <Gift className="w-2.5 h-2.5" />
                            +{pack.bonus.toLocaleString("fr-FR")}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-cm-text-soft">
                        {pack.price.toLocaleString("fr-FR")} F CFA · {pricePerUnit} F/unité
                      </p>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-cm-accent shrink-0" />
                    )}
                  </button>
                  {isSelected && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="overflow-hidden"
                    >
                      <button
                        onClick={() => handlePurchase(pack.amount)}
                        disabled={purchasing}
                        className="w-full mt-2 h-11 bg-cm-accent text-cm-text-onAccent text-[12px] font-bold rounded-[var(--radius-cm)] hover:bg-cm-accent-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer active:scale-[0.97]"
                      >
                        {purchasing ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            Acheter {pack.amount.toLocaleString("fr-FR")} F
                            {pack.bonus > 0 && ` (+${pack.bonus.toLocaleString("fr-FR")} bonus)`}
                          </>
                        )}
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {purchaseSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-[10px]"
          >
            <Check className="w-4 h-4 text-green-600 shrink-0" />
            <span className="text-[11px] text-green-700">Crédits achetés avec succès !</span>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-3"
        >
          <h2 className="text-[13px] font-bold text-cm-text">Historique des transactions</h2>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-cm-elevated border border-cm-border rounded-[12px] p-4 animate-pulse">
                  <div className="h-4 w-24 bg-cm-border rounded mb-2" />
                  <div className="h-3 w-32 bg-cm-border rounded" />
                </div>
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center py-10 bg-cm-elevated border border-cm-border rounded-[14px]">
              <Coins className="w-8 h-8 text-cm-text-soft mb-2" />
              <p className="text-[12px] text-cm-text-soft">Aucune transaction</p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx, i) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-cm-elevated border border-cm-border rounded-[12px] p-3 flex items-center gap-3"
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${tx.type === "purchase" || tx.type === "bonus" ? "bg-green-50" : "bg-red-50"}`}>
                    {tx.type === "purchase" || tx.type === "bonus" ? (
                      <ArrowUpRight className="w-4 h-4 text-green-600" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4 text-red-500 rotate-90" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-cm-text">
                      {tx.description || TX_TYPE_LABELS[tx.type] || tx.type}
                    </p>
                    <p className="text-[10px] text-cm-text-soft">
                      {format(new Date(tx.created_at), "d MMM yyyy", { locale: fr })}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-[13px] font-bold font-mono ${tx.type === "purchase" || tx.type === "bonus" ? "text-green-600" : "text-red-500"}`}>
                      {tx.type === "purchase" || tx.type === "bonus" ? "+" : "-"}{tx.amount.toLocaleString("fr-FR")}
                    </span>
                    <p className="text-[9px] text-cm-text-soft">
                      Solde: {tx.balance_after.toLocaleString("fr-FR")}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
