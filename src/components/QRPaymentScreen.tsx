import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Check, Shield, DollarSign, Smartphone, Building, CreditCard } from "lucide-react";
import { Mission, PaymentMethod, PAYMENT_METHOD_LABELS } from "../types";

interface QRPaymentScreenProps {
  mission: Mission;
  onBack: () => void;
  onPay: (missionId: string, method: PaymentMethod) => void;
}

const METHOD_ICONS: Record<PaymentMethod, typeof Smartphone> = {
  orange_money: Smartphone,
  mtn_momo: Smartphone,
  wave: CreditCard,
};

export default function QRPaymentScreen({ mission, onBack, onPay }: QRPaymentScreenProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [confirming, setConfirming] = useState(false);

  const commissionRate = 15;
  const commissionXOF = Math.round(mission.budgetXOF * commissionRate / 100);
  const proAmount = mission.budgetXOF - commissionXOF;

  const methods: PaymentMethod[] = ["orange_money", "mtn_momo", "wave"];

  const handleConfirm = () => {
    if (!selectedMethod) return;
    if (!confirming) {
      setConfirming(true);
      return;
    }
    onPay(mission.id, selectedMethod);
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-cm-bg pb-32">
      <header className="flex items-center justify-between px-4 py-3 bg-cm-elevated border-b border-cm-border sticky top-0 z-10">
        <button onClick={onBack} className="w-12 h-12 flex items-center justify-center rounded-full bg-cm-elevated text-cm-text hover:bg-cm-accent-soft transition-colors border border-cm-border cursor-pointer active:scale-95">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display text-sm font-bold text-cm-text">Paiement</h1>
        <div className="w-9 h-9" />
      </header>

      <div className="px-4 pt-4 space-y-4">
        <div className="bg-cm-elevated rounded-2xl p-6 border border-cm-border flex flex-col items-center">
          <div className="w-44 h-44 bg-cm-accent-soft rounded-2xl flex items-center justify-center mb-3 border-2 border-dashed border-cm-accent/40">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto bg-cm-bg rounded-xl flex items-center justify-center border border-cm-border mb-2">
                <div className="grid grid-cols-5 gap-0.5">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div key={i} className={`w-3 h-3 ${Math.random() > 0.5 ? "bg-cm-text" : "bg-transparent"}`} />
                  ))}
                </div>
              </div>
              <p className="text-[11px] text-cm-text-soft">Scannez le QR Code</p>
            </div>
          </div>
          <p className="text-xs font-bold text-cm-text">Paiement à {mission.proName}</p>
          <p className="text-2xl font-display font-bold text-cm-text mt-1 font-mono">{mission.budgetXOF.toLocaleString()} F</p>
        </div>

        <div className="bg-cm-elevated rounded-2xl p-4 border border-cm-border space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-cm-text-soft">Montant</span>
            <span className="font-bold text-cm-text font-mono">{mission.budgetXOF.toLocaleString()} F</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-cm-text-soft">Commission ({commissionRate}%)</span>
            <span className="font-bold text-cm-text-soft font-mono">-{commissionXOF.toLocaleString()} F</span>
          </div>
          <div className="border-t border-cm-border pt-2 flex justify-between text-xs">
            <span className="font-display font-bold text-cm-text">Reçu par le pro</span>
            <span className="font-display font-bold text-cm-accent font-mono">{proAmount.toLocaleString()} F</span>
          </div>
        </div>

        {!confirming ? (
          <div className="space-y-2">
            <p className="text-[11px] font-medium text-cm-text-soft uppercase tracking-wider">Choisissez votre moyen de paiement</p>
            {methods.map((m) => {
              const Icon = METHOD_ICONS[m];
              const selected = selectedMethod === m;
              return (
                <button key={m} onClick={() => setSelectedMethod(m)}
                  className={`w-full p-4 rounded-2xl border flex items-center gap-3 transition-all active:scale-[0.98] cursor-pointer ${
                    selected
                      ? "border-cm-text bg-cm-accent-soft"
                      : "border-cm-border bg-cm-elevated hover:border-cm-text/20"
                  }`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selected ? "bg-cm-text text-cm-bg" : "bg-cm-accent-soft text-cm-accent"}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`text-sm font-bold ${selected ? "text-cm-text" : "text-cm-text"}`}>{PAYMENT_METHOD_LABELS[m]}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    selected ? "border-cm-text bg-cm-text" : "border-cm-border"
                  }`}>
                    {selected && <Check className="w-3 h-3 text-cm-bg" />}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-cm-accent-soft border border-cm-accent/20 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-cm-accent" />
              <p className="text-xs font-bold text-cm-text">Confirmer le paiement</p>
            </div>
            <p className="text-[12px] text-cm-text-soft">
              Vous allez payer <strong className="text-cm-text">{mission.budgetXOF.toLocaleString()} F</strong> via <strong className="text-cm-text">{PAYMENT_METHOD_LABELS[selectedMethod!]}</strong>.
            </p>
          </motion.div>
        )}
      </div>

      <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto">
        <button onClick={handleConfirm} disabled={!selectedMethod}
          className={`w-full h-13 rounded-2xl text-xs font-display font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 ${
            selectedMethod
              ? confirming
                ? "bg-cm-accent text-white shadow-cm-sm"
                : "bg-cm-text text-cm-bg shadow-cm-sm"
              : "bg-cm-border text-cm-text-soft/50 cursor-not-allowed"
          }`}>
          {confirming ? (
            <>Confirmer le paiement de {mission.budgetXOF.toLocaleString()} F</>
          ) : (
            <><DollarSign className="w-4 h-4" /> Payer avec {selectedMethod ? PAYMENT_METHOD_LABELS[selectedMethod] : "..."}</>
          )}
        </button>
      </div>
    </div>
  );
}
