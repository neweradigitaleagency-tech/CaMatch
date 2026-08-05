import { useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Check, Shield, Coins, Smartphone, CreditCard } from "lucide-react";
import { useAppNavigation } from "../../navigation/useAppNavigation";
import { useRequestStore } from "../../stores/requestStore";
import { useEscrowStore } from "../../stores/escrowStore";
import type { UnifiedPaymentMethod } from "../../types/payment";
import { PAYMENT_METHOD_LABELS } from "../../types/payment";

const METHOD_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  orange_money: Smartphone,
  mtn_momo: Smartphone,
  wave: CreditCard,
  moov_money: Smartphone,
};

const METHODS: UnifiedPaymentMethod[] = ["orange_money", "mtn_momo", "wave"];

export default function EscrowPaymentPage() {
  const { requestId } = useParams();
  const { goBack, navigate, complete } = useAppNavigation();
  const missions = useRequestStore((s) => s.missions);
  const updateMissionStatus = useRequestStore((s) => s.updateMissionStatus);
  const holdPayment = useEscrowStore((s) => s.holdPayment);

  const mission = missions.find((m) => m.id === requestId || m.requestId === requestId);

  const [selectedMethod, setSelectedMethod] = useState<UnifiedPaymentMethod | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);

  if (!mission) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dynamic bg-cm-surface p-4">
        <p className="text-[14px] text-cm-text-muted">Mission introuvable</p>
        <button onClick={() => navigate("/orders")} className="mt-4 text-cm-text text-[13px] font-bold">Retour aux missions</button>
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
      <div className="flex flex-col items-center justify-center min-h-dynamic bg-cm-surface p-6">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-[18px] font-bold text-cm-text mb-2">Paiement confirmé</h1>
        <p className="text-[13px] text-cm-text-muted text-center mb-6">
          {mission.budgetXOF.toLocaleString()} F sont sécurisés sur la plateforme.
          <br />Le professionnel recevra {proAmount.toLocaleString()} F après validation.
        </p>
        <button onClick={() => complete()}
          className="w-full py-4 rounded-[14px] bg-cm-text text-white font-bold text-[13px] cursor-pointer active:scale-[0.97]">
          Retour aux missions
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-dynamic bg-cm-surface pb-32">
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-cm-border sticky top-0 z-10">
        <button             onClick={() => goBack()} className="w-11 h-11 rounded-full bg-[rgba(43,43,43,0.08)] backdrop-blur-sm border border-[rgba(43,43,43,0.10)] flex items-center justify-center cursor-pointer active:scale-95">
          <ArrowLeft className="w-5 h-5 text-[#2B2B2B]" />
        </button>
        <h1 className="font-bold text-sm text-cm-text">Paiement sécurisé</h1>
        <div className="w-9 h-9" />
      </header>

      <div className="px-4 pt-4 space-y-4">
        <div className="bg-white rounded-2xl p-4 border border-cm-border space-y-2 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-cm-text" />
            <p className="text-[12px] font-bold text-cm-text">Paiement séquestre ÇaMatch</p>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-cm-text-muted">Montant de la mission</span>
            <span className="font-bold text-cm-text font-mono">{mission.budgetXOF.toLocaleString()} F</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-cm-text-muted">Commission plateforme ({commissionRate}%)</span>
            <span className="font-bold text-cm-text-muted font-mono">-{commissionXOF.toLocaleString()} F</span>
          </div>
          <div className="border-t border-cm-border pt-2 flex justify-between text-xs">
            <span className="font-bold text-cm-text">Reçu par le professionnel</span>
            <span className="font-bold text-cm-text font-mono">{proAmount.toLocaleString()} F</span>
          </div>
        </div>

        <div className="bg-cm-surface/50 rounded-2xl p-4 border border-cm-border/50 space-y-2">
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-cm-text-soft mt-0.5 shrink-0" />
            <p className="text-[11px] text-cm-text-muted">Votre paiement est sécurisé : les fonds sont bloqués et ne seront débloqués qu'après votre validation finale.</p>
          </div>
        </div>

        {!confirming ? (
          <div className="space-y-2">
            <p className="text-[11px] font-medium text-cm-text-muted uppercase tracking-wider">Moyen de paiement</p>
            {METHODS.map((m) => {
              const Icon = METHOD_ICONS[m]!;
              const selected = selectedMethod === m;
              return (
                <button key={m} onClick={() => { setSelectedMethod(m); setConfirming(false); }}
                  className={`w-full p-4 rounded-2xl border flex items-center gap-3 transition-all active:scale-[0.98] cursor-pointer ${
                    selected
                      ? "border-cm-text bg-cm-surface"
                      : "border-cm-border bg-white hover:border-cm-border-soft"
                  }`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selected ? "bg-cm-text text-white" : "bg-cm-surface text-cm-text-soft"}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-bold text-cm-text">{PAYMENT_METHOD_LABELS[m]}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    selected ? "border-cm-text bg-cm-text" : "border-cm-border-soft"
                  }`}>
                    {selected && <Check className="w-3 h-3 text-white" />}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-cm-border rounded-2xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-cm-text" />
              <p className="text-xs font-bold text-cm-text">Confirmer le paiement sécurisé</p>
            </div>
            <p className="text-[12px] text-cm-text-muted">
              Vous allez payer <strong className="text-cm-text">{mission.budgetXOF.toLocaleString()} F</strong> via <strong className="text-cm-text">{PAYMENT_METHOD_LABELS[selectedMethod!]}</strong>.
            </p>
            <p className="text-[11px] text-cm-text-muted">
              Le professionnel recevra <strong className="text-cm-text">{proAmount.toLocaleString()} F</strong> après votre validation.
            </p>
          </motion.div>
        )}
      </div>

      <div className="fixed bottom-20 inset-x-0 px-4 pb-[env(safe-area-inset-bottom,0px)]">
        <div className="max-w-[448px] mx-auto">
        <button onClick={handlePay} disabled={!selectedMethod}
          className={`w-full h-13 rounded-2xl text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 ${
            !selectedMethod
              ? "bg-cm-border-soft text-cm-text-muted cursor-not-allowed"
              : confirming
                ? "bg-cm-text text-white shadow-sm"
                : "bg-cm-text text-white shadow-sm"
          }`}>
          {confirming ? (
            <><Shield className="w-4 h-4" /> Confirmer le paiement sécurisé</>
          ) : (
            <><Coins className="w-4 h-4" /> Payer avec {selectedMethod ? PAYMENT_METHOD_LABELS[selectedMethod] : "..."}</>
          )}
        </button>
        </div>
      </div>
    </div>
  );
}
