import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Flag, Shield, Send } from "lucide-react";
import { useNotificationStore } from "../../stores/notificationStore";

const REPORT_REASONS = [
  "Comportement abusif",
  "Contenu inapproprié",
  "Arnaque ou fraude",
  "Fausse identité",
  "Harcèlement",
  "Spam",
  "Autre",
];

export default function ReportPage() {
  const nav = useNavigate();
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const addNotification = useNotificationStore((s) => s.addNotification);

  const handleSubmit = () => {
    if (!reason.trim()) return;
    addNotification({
      type: "mission",
      title: "Signalement envoyé",
      body: "Merci d'avoir signalé. Notre équipe va examiner la situation.",
      actionUrl: "/orders",
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-cm-bg p-6">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <Shield className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-[18px] font-display font-bold text-cm-text mb-2">Signalement envoyé</h1>
        <p className="text-[13px] text-cm-text-soft text-center mb-6">Notre équipe de modération va examiner votre signalement.</p>
        <button onClick={() => nav(-1)} className="w-full py-4 rounded-[14px] bg-cm-text text-cm-bg font-bold text-[13px] cursor-pointer active:scale-[0.97]">Retour</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-cm-bg pb-32">
      <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-10 bg-cm-elevated border-b border-cm-border">
        <button onClick={() => nav(-1)} className="w-11 h-11 flex items-center justify-center rounded-full bg-cm-elevated border border-cm-border cursor-pointer active:scale-95">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[15px] font-bold text-cm-text">Signaler</h1>
        <div className="w-11 h-11" />
      </header>

      <div className="px-4 pt-4 space-y-4">
        <div className="bg-red-50 rounded-2xl p-4 border border-red-200 flex items-start gap-3">
          <Flag className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <p className="text-[12px] text-red-700">Votre signalement est anonyme et sera traité par notre équipe de modération.</p>
        </div>

        <div>
          <label className="text-[11px] font-bold text-cm-text-soft uppercase tracking-wider mb-2 block">Motif du signalement</label>
          <div className="space-y-2">
            {REPORT_REASONS.map((r) => (
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
          <label className="text-[11px] font-bold text-cm-text-soft uppercase tracking-wider mb-2 block">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="Décrivez ce qui s'est passé..."
            className="w-full h-32 text-[14px] bg-cm-elevated border border-cm-border rounded-[16px] p-4 outline-none resize-none text-cm-text placeholder-cm-text-soft focus:border-cm-text" />
        </div>
      </div>

      <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto">
        <button onClick={handleSubmit} disabled={!reason}
          className={`w-full py-4 rounded-[14px] text-[13px] font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            reason ? "bg-red-500 text-white active:scale-[0.97]" : "bg-cm-border text-cm-text-soft cursor-not-allowed"
          }`}>
          <Send className="w-4 h-4" /> Envoyer le signalement
        </button>
      </div>
    </div>
  );
}
