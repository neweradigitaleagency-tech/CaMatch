import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, CheckCircle, Clock, XCircle } from "lucide-react";
import { MOCK_VERIFICATION } from "../../services/mockData";

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle; color: string; label: string }> = {
  approved: { icon: CheckCircle, color: "text-green-600", label: "Approuvé" },
  pending: { icon: Clock, color: "text-orange-500", label: "En cours" },
  rejected: { icon: XCircle, color: "text-cm-error", label: "Rejeté" },
  not_submitted: { icon: Clock, color: "text-cm-text-muted", label: "Non soumis" },
};

export default function ProVerificationPage() {
  const nav = useNavigate();
  const v = MOCK_VERIFICATION;

  return (
    <div className="min-h-screen bg-cm-bg">
      <div className="sticky top-0 z-10 bg-cm-elevated/80 backdrop-blur-lg border-b border-cm-border">
        <div className="flex items-center h-14 px-5 gap-3">
          <button type="button" onClick={() => nav("/profile")} className="p-1 -ml-1">
            <ArrowLeft className="w-5 h-5 text-cm-text" />
          </button>
          <h1 className="text-[18px] font-bold text-cm-text">Vérification</h1>
        </div>
      </div>
      <div className="px-5 pt-4 pb-24 space-y-4">
        <div className="bg-cm-elevated border border-cm-border rounded-[14px] p-5 text-center">
          <Shield className="w-10 h-10 text-cm-accent mx-auto mb-2" />
          <p className="text-[14px] font-bold text-cm-text">Niveau {v.level}</p>
          <p className="text-[11px] text-cm-text-soft">{v.level === "none" ? "Commencez votre vérification" : `Niveau actuel : ${v.level}`}</p>
        </div>

        {[
          { label: "CNI (Recto)", status: v.cniStatus },
          { label: "CNI (Verso)", status: v.cniStatus },
          { label: "Selfie", status: v.selfieUrl ? "approved" : "not_submitted" },
          { label: "Casier judiciaire", status: v.backgroundStatus },
          { label: "Certificat", status: v.certStatus },
        ].map((item) => {
          const cfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.not_submitted!;
          const Icon = cfg.icon;
          return (
            <div key={item.label} className="bg-cm-elevated border border-cm-border rounded-[12px] p-4 flex items-center justify-between">
              <p className="text-[13px] font-medium text-cm-text">{item.label}</p>
              <div className={`flex items-center gap-1.5 ${cfg.color}`}>
                <Icon className="w-4 h-4" />
                <span className="text-[11px] font-medium">{cfg.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
