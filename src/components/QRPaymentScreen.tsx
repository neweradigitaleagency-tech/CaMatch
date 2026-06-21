import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Check, Shield, DollarSign } from "lucide-react";
import { Mission, PaymentMethod, PAYMENT_METHOD_LABELS, PAYMENT_METHOD_COLORS } from "../types";

interface QRPaymentScreenProps {
  mission: Mission;
  onBack: () => void;
  onPay: (missionId: string, method: PaymentMethod) => void;
}

export default function QRPaymentScreen({ mission, onBack, onPay }: QRPaymentScreenProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [confirming, setConfirming] = useState(false);

  const commissionRate = 15;
  const commissionXOF = Math.round(mission.budgetXOF * commissionRate / 100);
  const proAmount = mission.budgetXOF - commissionXOF;

  const methods: { id: PaymentMethod; icon: string }[] = [
    { id: "orange_money", icon: "📱" },
    { id: "mtn_momo", icon: "💛" },
    { id: "wave", icon: "🌊" },
  ];

  const handleConfirm = () => {
    if (!selectedMethod) return;
    if (!confirming) {
      setConfirming(true);
      return;
    }
    onPay(mission.id, selectedMethod);
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-brand-cream pb-32">
      <header className="flex items-center justify-between px-4 py-3 bg-brand-cream/90 backdrop-blur-md sticky top-0 z-10">
        <button onClick={onBack} className="w-12 h-12 flex items-center justify-center rounded-full bg-white text-brand-forest hover:bg-pale-mint transition-colors shadow-sm cursor-pointer active:scale-95">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-sans text-sm font-bold">Paiement</h1>
        <div className="w-9 h-9" />
      </header>

      <div className="px-4 pt-4 space-y-4">
        {/* QR Code */}
        <div className="bg-white rounded-2xl p-6 border border-pale-mint/20 shadow-sm flex flex-col items-center">
          <div className="w-44 h-44 bg-pale-mint rounded-2xl flex items-center justify-center mb-3 border-2 border-dashed border-brand-lime/40">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto bg-white rounded-xl flex items-center justify-center shadow-sm border border-pale-mint/30 mb-2">
                <div className="grid grid-cols-5 gap-0.5">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div key={i} className={`w-3 h-3 ${Math.random() > 0.5 ? "bg-brand-forest" : "bg-transparent"}`} />
                  ))}
                </div>
              </div>
              <p className="text-caption text-secondary">Scannez le QR Code</p>
            </div>
          </div>
          <p className="text-xs font-bold">Paiement à {mission.proName}</p>
          <p className="text-2xl font-extrabold mt-1">{mission.budgetXOF.toLocaleString()} F</p>
        </div>

        {/* Payment breakdown */}
        <div className="bg-white rounded-2xl p-4 border border-pale-mint/20 shadow-sm space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-secondary">Montant</span>
            <span className="font-bold">{mission.budgetXOF.toLocaleString()} F</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-secondary">Commission ({commissionRate}%)</span>
            <span className="font-bold text-amber-600">-{commissionXOF.toLocaleString()} F</span>
          </div>
          <div className="border-t border-pale-mint/20 pt-2 flex justify-between text-xs">
            <span className="font-bold">Reçu par le pro</span>
            <span className="font-bold text-brand-forest">{proAmount.toLocaleString()} F</span>
          </div>
        </div>

        {/* Payment methods */}
        {!confirming ? (
          <div className="space-y-2">
            <p className="text-caption font-medium text-secondary uppercase tracking-wider">Choisissez votre moyen de paiement</p>
            {methods.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMethod(m.id)}
                className={`w-full p-4 rounded-2xl border flex items-center gap-3 transition-all active:scale-[0.98] cursor-pointer ${
                  selectedMethod === m.id
                    ? "border-brand-forest bg-pale-mint/50"
                    : "border-pale-mint/20 bg-white hover:shadow-sm"
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-pale-mint flex items-center justify-center text-lg">
                  {m.icon}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-bold">{PAYMENT_METHOD_LABELS[m.id]}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  selectedMethod === m.id ? "border-brand-forest bg-brand-forest" : "border-pale-mint"
                }`}>
                  {selectedMethod === m.id && <Check className="w-3 h-3 text-white" />}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-600" />
              <p className="text-xs font-bold text-amber-800">Confirmer le paiement</p>
            </div>
            <p className="text-body-sm text-amber-700">
              Vous allez payer <strong>{mission.budgetXOF.toLocaleString()} F</strong> via <strong>{PAYMENT_METHOD_LABELS[selectedMethod!]}</strong>.
            </p>
          </motion.div>
        )}
      </div>

      <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto">
        <button
          onClick={handleConfirm}
          disabled={!selectedMethod}
          className={`w-full h-13 rounded-2xl text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 ${
            selectedMethod
              ? confirming
                ? "bg-amber-500 text-white shadow-sm"
                : "bg-brand-lime text-brand-forest shadow-sm"
              : "bg-pale-mint text-secondary/50 cursor-not-allowed"
          }`}
        >
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
