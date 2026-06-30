import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, XCircle, Shield, AlertTriangle } from "lucide-react";
import { useRequestStore } from "../../stores/requestStore";
import { useEscrowStore } from "../../stores/escrowStore";
import { useNotificationStore } from "../../stores/notificationStore";

const CANCEL_REASONS = [
  "Le professionnel ne répond plus",
  "Changement de planning",
  "Problème avec le devis",
  "Service plus nécessaire",
  "Doublon de commande",
  "Autre raison",
];

export default function CancellationPage() {
  const { id: missionId } = useParams();
  const nav = useNavigate();
  const mission = useRequestStore((s) => s.missions.find((m) => m.id === missionId));
  const updateMissionStatus = useRequestStore((s) => s.updateMissionStatus);
  const refundPayment = useEscrowStore((s) => s.refundPayment);
  const addNotification = useNotificationStore((s) => s.addNotification);

  const [reason, setReason] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);

  if (!mission) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-cm-bg p-4">
        <p className="text-[14px] text-cm-text-soft">Mission introuvable</p>
        <button onClick={() => nav("/orders")} className="mt-4 text-cm-accent text-[13px] font-bold">Retour</button>
      </div>
    );
  }

  const hasPayment = mission.status === "paid" || mission.status === "in_progress" || mission.status === "completed";
  const refundPercent = mission.status === "paid" ? 100 : mission.status === "in_progress" ? 50 : 0;

  const handleCancel = () => {
    updateMissionStatus(missionId!, "cancelled");
    if (hasPayment) refundPayment(missionId!);
    addNotification({
      type: "mission",
      title: "Mission annulée",
      body: `La mission "${mission.title}" a été annulée.${hasPayment ? " Un remboursement va être traité." : ""}`,
      actionUrl: "/orders",
    });
    setDone(true);
  };

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-cm-bg p-6">
        <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mb-4">
          <XCircle className="w-8 h-8 text-orange-500" />
        </div>
        <h1 className="text-[18px] font-display font-bold text-cm-text mb-2">Mission annulée</h1>
        <p className="text-[13px] text-cm-text-soft text-center mb-6">
          {hasPayment ? "Un remboursement vous sera effectué sous 48h." : "Aucun paiement n'a été effectué."}
        </p>
        <button onClick={() => nav("/orders")} className="w-full py-4 rounded-[14px] bg-cm-text text-cm-bg font-bold text-[13px] cursor-pointer active:scale-[0.97]">Retour aux missions</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-cm-bg pb-32">
      <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-10 bg-cm-elevated border-b border-cm-border">
        <button onClick={() => nav(-1)} className="w-11 h-11 flex items-center justify-center rounded-full bg-cm-elevated border border-cm-border cursor-pointer active:scale-95">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[15px] font-bold text-cm-text">Annuler la mission</h1>
        <div className="w-11 h-11" />
      </header>

      <div className="px-4 pt-4 space-y-4">
        <div className="bg-orange-50 rounded-2xl p-4 border border-orange-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-[12px] font-bold text-orange-700">Annulation de mission</p>
            <p className="text-[11px] text-orange-600 mt-1">
              {hasPayment
                ? "Un remboursement partiel sera effectué selon l'avancement de la mission."
                : "Aucun paiement n'a encore été effectué. L'annulation est sans frais."}
            </p>
          </div>
        </div>

        {hasPayment && (
          <div className="bg-cm-elevated rounded-2xl p-4 border border-cm-border space-y-2">
            <div className="flex justify-between text-[13px]">
              <span className="text-cm-text-soft">Montant payé</span>
              <span className="font-bold text-cm-text font-mono">{mission.budgetXOF.toLocaleString()} F</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-cm-text-soft">Remboursement estimé</span>
              <span className="font-bold text-cm-accent font-mono">{Math.round(mission.budgetXOF * refundPercent / 100).toLocaleString()} F</span>
            </div>
          </div>
        )}

        <div>
          <label className="text-[11px] font-bold text-cm-text-soft uppercase tracking-wider mb-2 block">Motif d'annulation</label>
          <div className="space-y-2">
            {CANCEL_REASONS.map((r) => (
              <button key={r} onClick={() => { setReason(r); setConfirming(false); }}
                className={`w-full p-3 rounded-[12px] border text-left text-[13px] cursor-pointer transition-all active:scale-[0.98] ${
                  reason === r ? "border-cm-text bg-cm-accent-soft font-bold text-cm-text" : "border-cm-border bg-cm-elevated text-cm-text"
                }`}>
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto">
        {!confirming ? (
          <button onClick={() => setConfirming(true)} disabled={!reason}
            className={`w-full py-4 rounded-[14px] text-[13px] font-bold transition-all cursor-pointer ${
              reason ? "bg-red-500 text-white active:scale-[0.97]" : "bg-cm-border text-cm-text-soft cursor-not-allowed"
            }`}>
            <XCircle className="w-4 h-4 inline mr-2" /> Annuler la mission
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-[12px] text-cm-text-soft text-center">Êtes-vous sûr de vouloir annuler ?</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirming(false)}
                className="flex-1 py-4 rounded-[14px] border border-cm-border bg-cm-elevated text-cm-text text-[13px] font-bold cursor-pointer active:scale-[0.97]">
                Non
              </button>
              <button onClick={handleCancel}
                className="flex-1 py-4 rounded-[14px] bg-red-500 text-white text-[13px] font-bold cursor-pointer active:scale-[0.97]">
                Oui, annuler
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
