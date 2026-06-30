import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Check, Shield, DollarSign, Smartphone, CreditCard } from "lucide-react";
import { useRequestStore } from "../../stores/requestStore";
import { useEscrowStore } from "../../stores/escrowStore";
import type { PaymentMethod } from "../../types";
import { PAYMENT_METHOD_LABELS } from "../../types";

const METHOD_ICONS: Record<PaymentMethod, typeof Smartphone> = {
  orange_money: Smartphone,
  mtn_momo: Smartphone,
  wave: CreditCard,
  moov_money: Smartphone,
};

const METHODS: PaymentMethod[] = ["orange_money", "mtn_momo", "wave"];

export default function EscrowPaymentPage() {
  const { requestId } = useParams();
  const nav = useNavigate();
  const missions = useRequestStore((s) => s.missions);
  const updateMissionStatus = useRequestStore((s) => s.updateMissionStatus);
  const holdPayment = useEscrowStore((s) => s.holdPayment);

  const mission = missions.find((m) => m.id === requestId || m.requestId === requestId);

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);

  if (!mission) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <p className="text-[14px] text-gray-500">Mission introuvable</p>
        <button onClick={() => nav("/orders")} className="mt-4 text-gray-900 text-[13px] font-bold">Retour aux missions</button>
      </div>
    );
  }

  const commissionRate = 15;
  const commissionXOF = Math.round(mission.budgetXOF * commissionRate / 100);
  const proAmount = mission.budgetXOF - commissionXOF;

  const handlePay = () => {
    if (!selectedMethod) return;
    if (!confirming) { setConfirming(true); return; }
    holdPayment(mission.id, mission.clientId, mission.proId, mission.budgetXOF, selectedMethod);
    updateMissionStatus(mission.id, "paid");
    setDone(true);
  };

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-[18px] font-bold text-gray-900 mb-2">Paiement confirmé</h1>
        <p className="text-[13px] text-gray-500 text-center mb-6">
          {mission.budgetXOF.toLocaleString()} F sont sécurisés sur la plateforme.
          <br />Le professionnel recevra {proAmount.toLocaleString()} F après validation.
        </p>
        <button onClick={() => nav(`/`)}
          className="w-full py-4 rounded-[14px] bg-gray-900 text-white font-bold text-[13px] cursor-pointer active:scale-[0.97]">
          Retour à l'accueil
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-50 pb-32">
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-10">
        <button onClick={() => nav(-1)} className="w-12 h-12 flex items-center justify-center rounded-full bg-white text-gray-700 hover:bg-gray-100 transition-colors border border-gray-200 cursor-pointer active:scale-95">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-sm text-gray-900">Paiement sécurisé</h1>
        <div className="w-9 h-9" />
      </header>

      <div className="px-4 pt-4 space-y-4">
        <div className="bg-white rounded-2xl p-4 border border-gray-200 space-y-2 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-gray-900" />
            <p className="text-[12px] font-bold text-gray-900">Paiement séquestre ÇaMatch</p>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Montant de la mission</span>
            <span className="font-bold text-gray-900 font-mono">{mission.budgetXOF.toLocaleString()} F</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Commission plateforme ({commissionRate}%)</span>
            <span className="font-bold text-gray-500 font-mono">-{commissionXOF.toLocaleString()} F</span>
          </div>
          <div className="border-t border-gray-200 pt-2 flex justify-between text-xs">
            <span className="font-bold text-gray-900">Reçu par le professionnel</span>
            <span className="font-bold text-gray-900 font-mono">{proAmount.toLocaleString()} F</span>
          </div>
        </div>

        <div className="bg-gray-100/50 rounded-2xl p-4 border border-gray-200/50 space-y-2">
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-gray-700 mt-0.5 shrink-0" />
            <p className="text-[11px] text-gray-500">Votre paiement est sécurisé : les fonds sont bloqués et ne seront débloqués qu'après votre validation finale.</p>
          </div>
        </div>

        {!confirming ? (
          <div className="space-y-2">
            <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Moyen de paiement</p>
            {METHODS.map((m) => {
              const Icon = METHOD_ICONS[m];
              const selected = selectedMethod === m;
              return (
                <button key={m} onClick={() => { setSelectedMethod(m); setConfirming(false); }}
                  className={`w-full p-4 rounded-2xl border flex items-center gap-3 transition-all active:scale-[0.98] cursor-pointer ${
                    selected
                      ? "border-gray-900 bg-gray-100"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selected ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700"}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-bold text-gray-900">{PAYMENT_METHOD_LABELS[m]}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    selected ? "border-gray-900 bg-gray-900" : "border-gray-300"
                  }`}>
                    {selected && <Check className="w-3 h-3 text-white" />}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-gray-900" />
              <p className="text-xs font-bold text-gray-900">Confirmer le paiement sécurisé</p>
            </div>
            <p className="text-[12px] text-gray-500">
              Vous allez payer <strong className="text-gray-900">{mission.budgetXOF.toLocaleString()} F</strong> via <strong className="text-gray-900">{PAYMENT_METHOD_LABELS[selectedMethod!]}</strong>.
            </p>
            <p className="text-[11px] text-gray-500">
              Le professionnel recevra <strong className="text-gray-900">{proAmount.toLocaleString()} F</strong> après votre validation.
            </p>
          </motion.div>
        )}
      </div>

      <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto">
        <button onClick={handlePay} disabled={!selectedMethod}
          className={`w-full h-13 rounded-2xl text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 ${
            !selectedMethod
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : confirming
                ? "bg-gray-900 text-white shadow-sm"
                : "bg-gray-900 text-white shadow-sm"
          }`}>
          {confirming ? (
            <><Shield className="w-4 h-4" /> Confirmer le paiement sécurisé</>
          ) : (
            <><DollarSign className="w-4 h-4" /> Payer avec {selectedMethod ? PAYMENT_METHOD_LABELS[selectedMethod] : "..."}</>
          )}
        </button>
      </div>
    </div>
  );
}
