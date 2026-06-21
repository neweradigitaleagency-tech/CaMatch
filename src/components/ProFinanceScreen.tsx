import { useState, type ComponentType } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Wallet,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Send,
  Check,
  X,
  ChevronLeft,
  CreditCard,
  Smartphone,
  Building,
  Clock,
  CheckCircle,
  XCircle,
  QrCode,
  Download,
  Eye,
  FileText,
} from "lucide-react";
import { ProEarning, ProDashboardStats } from "../types";

interface Props {
  balanceXOF: number;
  earnings: ProEarning[];
  stats: ProDashboardStats;
  onWithdraw: (amount: number, method: "wave" | "orange_money" | "mtn_momo") => void;
  onBack?: () => void;
}

const WITHDRAW_METHODS = [
  { id: "wave" as const, label: "Wave", icon: Smartphone, color: "bg-blue-500" },
  { id: "orange_money" as const, label: "Orange Money", icon: CreditCard, color: "bg-orange-500" },
  { id: "mtn_momo" as const, label: "MTN MoMo", icon: Building, color: "bg-yellow-500" },
];

export default function ProFinanceScreen({
  balanceXOF,
  earnings,
  stats,
  onWithdraw,
  onBack,
}: Props) {
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showInvoice, setShowInvoice] = useState<ProEarning | null>(null);
  const [amount, setAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<"wave" | "orange_money" | "mtn_momo">("wave");
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  const handleWithdraw = () => {
    const numAmount = parseInt(amount.replace(/\s/g, ""), 10);
    if (isNaN(numAmount) || numAmount <= 0 || numAmount > balanceXOF) return;
    onWithdraw(numAmount, selectedMethod);
    setWithdrawSuccess(true);
    setTimeout(() => {
      setShowWithdraw(false);
      setWithdrawSuccess(false);
      setAmount("");
    }, 2500);
  };

  const formatAmount = (val: string) => {
    const num = val.replace(/\D/g, "");
    if (!num) return "";
    return Number(num).toLocaleString();
  };

  return (
    <div className="px-5 py-5 pb-32 space-y-5">
      {/* Header */}
      {onBack ? (
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 text-brand-forest" />
          </button>
          <h2 className="font-sans text-lg font-extrabold">Finance</h2>
        </div>
      ) : (
        <h2 className="font-sans text-lg font-extrabold">Finance</h2>
      )}

      {/* Balance Card */}
      <div className="bg-brand-forest text-white p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-brand-lime" />
            <span className="text-caption font-medium uppercase tracking-wider text-white/60">
              Solde disponible
            </span>
          </div>
          <span className="text-caption font-medium text-brand-lime bg-brand-lime/20 px-2.5 py-1 rounded-full">
            {stats.totalJobsCompleted} missions
          </span>
        </div>

        <p className="text-4xl font-extrabold tracking-tight">
          {balanceXOF.toLocaleString()}{" "}
          <span className="text-lg text-white/60">F CFA</span>
        </p>

        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10">
          <div className="text-center">
            <p className="text-caption text-white/50 uppercase tracking-wider">Aujourd'hui</p>
            <p className="text-sm font-bold text-brand-lime">+{stats.todayEarningsXOF.toLocaleString()}</p>
          </div>
          <div className="text-center border-x border-white/10">
            <p className="text-caption text-white/50 uppercase tracking-wider">Semaine</p>
            <p className="text-sm font-bold text-brand-lime">+{stats.weekEarningsXOF.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-caption text-white/50 uppercase tracking-wider">Mois</p>
            <p className="text-sm font-bold text-brand-lime">+{stats.monthEarningsXOF.toLocaleString()}</p>
          </div>
        </div>

        <button
          onClick={() => setShowWithdraw(true)}
          className="w-full bg-brand-lime text-brand-forest font-extrabold text-xs py-3.5 rounded-xl uppercase tracking-wider hover:brightness-110 transition-all active:scale-95 cursor-pointer"
        >
          <Send className="w-4 h-4 inline mr-1.5" />
          Retirer mon argent
        </button>
      </div>

      {/* QR Code Card */}
      <div
        onClick={() => setShowQR(true)}
        className="bg-white p-4 rounded-2xl shadow-premium border border-pale-mint/15 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-transform"
      >
        <div className="w-14 h-14 rounded-2xl bg-brand-forest flex items-center justify-center">
          <QrCode className="w-7 h-7 text-brand-lime" />
        </div>
        <div className="flex-1">
          <h4 className="text-xs font-bold">Mon QR Code</h4>
          <p className="text-caption text-secondary mt-0.5">Affichez votre code pour recevoir les paiements</p>
        </div>
        <Eye className="w-4 h-4 text-secondary shrink-0" />
      </div>

      {/* Recent Transactions */}
      <div>
        <h4 className="font-sans text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <DollarSign className="w-4 h-4" /> Transactions récentes
        </h4>

        {earnings.length === 0 ? (
          <div className="bg-white p-6 rounded-3xl shadow-premium border border-pale-mint/15 text-center">
            <TrendingUp className="w-10 h-10 text-secondary/60 mx-auto mb-2" />
            <p className="text-xs text-secondary font-medium">
              Aucune transaction pour le moment
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {earnings.map((e) => (
              <div
                key={e.id}
                onClick={() => e.type !== "withdrawal" && setShowInvoice(e)}
                className={`bg-white p-4 rounded-2xl shadow-premium border border-pale-mint/15 flex items-center justify-between ${e.type !== "withdrawal" ? "cursor-pointer active:scale-[0.98]" : ""} transition-transform`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                      e.type === "withdrawal"
                        ? "bg-red-50"
                        : e.type === "bonus"
                        ? "bg-amber-50"
                        : "bg-green-50"
                    }`}
                  >
                    {e.type === "withdrawal" ? (
                      <ArrowUpRight className="w-5 h-5 text-red-500" />
                    ) : (
                      <ArrowDownLeft className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold">{e.label}</h5>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-caption text-secondary">
                        {new Date(e.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                      <EarningStatusBadge status={e.status} />
                    </div>
                  </div>
                </div>
                <span
                  className={`font-extrabold text-sm ${
                    e.type === "withdrawal" ? "text-red-500" : "text-green-600"
                  }`}
                >
                  {e.type === "withdrawal" ? "-" : "+"}
                  {e.amountXOF.toLocaleString()} F
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6"
            onClick={() => setShowQR(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 w-full max-w-xs text-center space-y-4"
            >
              <div className="w-48 h-48 mx-auto bg-brand-forest rounded-2xl flex items-center justify-center p-4">
                <div className="w-full h-full border-2 border-dashed border-brand-lime/40 rounded-xl flex flex-col items-center justify-center text-white">
                  <QrCode className="w-16 h-16 text-brand-lime mb-2" />
                  <span className="text-caption text-white/60 uppercase tracking-wider font-bold">PRO-12345</span>
                </div>
              </div>
              <h3 className="text-sm font-extrabold">Scannez pour payer</h3>
              <p className="text-caption text-secondary">Wave · Orange Money · MTN MoMo</p>
              <button
                onClick={() => { setShowQR(false); setShowWithdraw(true); }}
                className="w-full bg-brand-forest text-white text-xs font-bold py-3 rounded-xl hover:bg-brand-lime hover:text-brand-forest transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 inline mr-1.5" />
                Télécharger le QR
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invoice Modal */}
      <AnimatePresence>
        {showInvoice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center"
            onClick={() => setShowInvoice(null)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-brand-cream rounded-t-4xl sm:rounded-3xl p-6 pb-10 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Facture
                </h3>
                <button onClick={() => setShowInvoice(null)} className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm cursor-pointer">
                  <X className="w-5 h-5 text-secondary" />
                </button>
              </div>

              <div className="bg-white rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-pale-mint/10">
                  <span className="text-caption font-medium text-secondary uppercase tracking-wider">Service</span>
                  <span className="text-xs font-bold">{showInvoice.label}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-pale-mint/10">
                  <span className="text-caption font-medium text-secondary uppercase tracking-wider">Montant</span>
                  <span className="text-sm font-extrabold">{showInvoice.amountXOF.toLocaleString()} F</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-pale-mint/10">
                  <span className="text-caption font-medium text-secondary uppercase tracking-wider">Commission (15%)</span>
                  <span className="text-xs font-bold text-red-500">-{Math.round(showInvoice.amountXOF * 0.15).toLocaleString()} F</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-pale-mint/10">
                  <span className="text-caption font-medium text-secondary uppercase tracking-wider">Net perçu</span>
                  <span className="text-sm font-extrabold text-green-600">{(showInvoice.amountXOF - Math.round(showInvoice.amountXOF * 0.15)).toLocaleString()} F</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-caption font-medium text-secondary uppercase tracking-wider">Date</span>
                  <span className="text-xs font-medium">{new Date(showInvoice.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</span>
                </div>
                {showInvoice.clientName && (
                  <div className="flex items-center justify-between pt-2 border-t border-pale-mint/10">
                    <span className="text-caption font-medium text-secondary uppercase tracking-wider">Client</span>
                    <span className="text-xs font-medium">{showInvoice.clientName}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center gap-2 text-caption text-secondary">
                <CheckCircle className="w-3 h-3 text-green-600" />
                Paiement sécurisé via Ça Match
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Withdraw Modal */}
      <AnimatePresence>
        {showWithdraw && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-brand-cream rounded-t-4xl sm:rounded-3xl p-6 pb-10 space-y-5"
            >
              {withdrawSuccess ? (
                <div className="py-10 flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-brand-lime flex items-center justify-center">
                    <Check className="w-8 h-8 text-brand-forest" />
                  </div>
                  <h3 className="font-sans text-lg font-extrabold">Retrait envoyé !</h3>
                  <p className="text-sm text-secondary max-w-xs">
                    {Number(amount.replace(/\D/g, "")).toLocaleString()} F CFA vers{" "}
                    {WITHDRAW_METHODS.find((m) => m.id === selectedMethod)?.label}
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="font-sans text-lg font-extrabold">Retrait d'argent</h3>
                    <button
                      onClick={() => setShowWithdraw(false)}
                      className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm cursor-pointer"
                    >
                      <X className="w-5 h-5 text-secondary" />
                    </button>
                  </div>

                  {/* Amount Input */}
                  <div className="bg-white p-5 rounded-2xl space-y-2">
                    <p className="text-caption font-medium text-secondary uppercase tracking-wider">
                      Montant à retirer
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0"
                        className="text-3xl font-extrabold bg-transparent outline-none w-full placeholder-secondary/40"
                      />
                      <span className="text-xs font-bold text-secondary shrink-0">F CFA</span>
                    </div>
                    <p className="text-caption text-secondary">
                      Solde disponible :{" "}
                      <span className="font-bold">{balanceXOF.toLocaleString()} F</span>
                    </p>
                  </div>

                  {/* Quick Amounts */}
                  <div className="flex gap-2">
                    {[5000, 10000, 25000, 50000, 100000].map((q) => (
                      <button
                        key={q}
                        onClick={() => setAmount(q.toString())}
                        className={`flex-1 py-2 rounded-xl text-caption font-medium border transition-all cursor-pointer ${
                          parseInt(amount.replace(/\D/g, ""), 10) === q
                            ? "bg-brand-lime border-brand-lime text-brand-forest"
                            : "bg-white border-pale-mint/40 text-secondary hover:border-brand-lime"
                        }`}
                      >
                        {q.toLocaleString()}
                      </button>
                    ))}
                  </div>

                  {/* Method Selection */}
                  <div className="space-y-2">
                    <p className="text-caption font-medium text-secondary uppercase tracking-wider">
                      Mode de retrait
                    </p>
                    {WITHDRAW_METHODS.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setSelectedMethod(method.id)}
                        className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                          selectedMethod === method.id
                            ? "bg-brand-lime/20 border-brand-lime"
                            : "bg-white border-pale-mint/40 hover:border-brand-lime"
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center ${method.color}`}
                        >
                          <method.icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-sm font-bold">{method.label}</span>
                        {selectedMethod === method.id && (
                          <Check className="w-4 h-4 text-brand-forest ml-auto" />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Submit */}
                  <button
                    onClick={handleWithdraw}
                    disabled={
                      !amount ||
                      parseInt(amount.replace(/\D/g, ""), 10) <= 0 ||
                      parseInt(amount.replace(/\D/g, ""), 10) > balanceXOF
                    }
                    className="w-full bg-brand-forest text-white font-extrabold text-xs py-4 rounded-xl uppercase tracking-wider hover:bg-brand-lime hover:text-brand-forest transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Send className="w-4 h-4 inline mr-1.5" />
                    Envoyer le retrait
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EarningStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; icon: ComponentType<{ className?: string }>; classes: string }> = {
    completed: { label: "Validé", icon: CheckCircle, classes: "bg-green-100 text-green-700" },
    pending: { label: "En attente", icon: Clock, classes: "bg-amber-100 text-amber-700" },
    failed: { label: "Échoué", icon: XCircle, classes: "bg-red-100 text-red-600" },
  };

  const c = config[status] || config.pending;
  return (
    <span className={`text-caption font-medium px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${c.classes}`}>
      <c.icon className="w-3 h-3" />
      {c.label}
    </span>
  );
}
