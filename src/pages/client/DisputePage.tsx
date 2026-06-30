import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, AlertTriangle, Shield, Send } from "lucide-react";
import { useRequestStore } from "../../stores/requestStore";
import { useNotificationStore } from "../../stores/notificationStore";

const DISPUTE_REASONS = [
  "Travail non conforme à la description",
  "Qualité insuffisante",
  "Matériaux non conformes",
  "Abandon du chantier",
  "Retard important",
  "Comportement inapproprié",
  "Autre",
];

export default function DisputePage() {
  const { id: missionId } = useParams();
  const nav = useNavigate();
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const updateMissionStatus = useRequestStore((s) => s.updateMissionStatus);
  const addNotification = useNotificationStore((s) => s.addNotification);

  const handleSubmit = () => {
    if (!reason.trim()) return;
    updateMissionStatus(missionId!, "disputed");
    addNotification({
      type: "mission",
      title: "Litige ouvert",
      body: "Votre litige a été soumis. L'équipe ÇaMatch va le traiter sous 24h.",
      actionUrl: `/orders/tracker/${missionId}`,
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-cm-bg p-6">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <Shield className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-[18px] font-display font-bold text-cm-text mb-2">Litige soumis</h1>
        <p className="text-[13px] text-cm-text-soft text-center mb-6">Notre équipe va analyser la situation et vous contacter sous 24h.</p>
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
        <h1 className="text-[15px] font-bold text-cm-text">Signaler un problème</h1>
        <div className="w-11 h-11" />
      </header>

      <div className="px-4 pt-4 space-y-4">
        <div className="bg-red-50 rounded-2xl p-4 border border-red-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <p className="text-[12px] text-red-700">Un litige est un signalement sérieux. Notre équipe analysera la situation avant de prendre une décision.</p>
        </div>

        <div>
          <label className="text-[11px] font-bold text-cm-text-soft uppercase tracking-wider mb-2 block">Motif du litige</label>
          <div className="space-y-2">
            {DISPUTE_REASONS.map((r) => (
              <button key={r} onClick={() => setReason(r)}
                className={`w-full p-3 rounded-[12px] border text-left text-[13px] cursor-pointer transition-all active:scale-[0.98] ${
                  reason === r ? "border-cm-text bg-cm-accent-soft font-bold text-cm-text" : "border-cm-border bg-cm-elevated text-cm-text"
                }`}>
                {r}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[11px] font-bold text-cm-text-soft uppercase tracking-wider mb-2 block">Description détaillée</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="Expliquez ce qui s'est passé..."
            className="w-full h-32 text-[14px] bg-cm-elevated border border-cm-border rounded-[16px] p-4 outline-none resize-none text-cm-text placeholder-cm-text-soft focus:border-cm-text" />
        </div>
      </div>

      <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto">
        <button onClick={handleSubmit} disabled={!reason}
          className={`w-full py-4 rounded-[14px] text-[13px] font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            reason ? "bg-red-500 text-white active:scale-[0.97]" : "bg-cm-border text-cm-text-soft cursor-not-allowed"
          }`}>
          <Send className="w-4 h-4" /> Soumettre le litige
        </button>
      </div>
    </div>
  );
}
