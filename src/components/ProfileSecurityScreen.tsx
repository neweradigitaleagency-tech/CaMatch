import { ArrowLeft, Shield, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface ProfileSecurityScreenProps { onBack: () => void; }

export default function ProfileSecurityScreen({ onBack }: ProfileSecurityScreenProps) {
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="flex flex-col w-full min-h-screen pb-32" style={{ background: "linear-gradient(180deg, #D8F3DC 0%, #F5F0E8 100%)" }}>
      <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-10" style={{ background: "linear-gradient(180deg, #D8F3DC 0%, rgba(216,243,220,0.90) 100%)" }}>
        <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-[12px] bg-[rgba(255,255,255,0.60)] backdrop-blur-[8px] border border-[rgba(255,255,255,0.35)] cursor-pointer active:scale-90 transition-all">
          <ArrowLeft className="w-4 h-4 text-ca-text-primary" />
        </button>
        <h1 className="text-[15px] font-bold text-ca-text-primary">Sécurité</h1>
        <div className="w-9 h-9" />
      </header>

      <div className="mx-4 pt-4">
        <div className="bg-[rgba(255,255,255,0.60)] backdrop-blur-[16px] rounded-[20px] border border-[rgba(255,255,255,0.50)] p-5 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-[12px] bg-[rgba(45,106,79,0.12)] flex items-center justify-center">
              <Lock className="w-5 h-5 text-ca-green-primary" />
            </div>
            <div>
              <h2 className="text-[14px] font-bold text-ca-text-primary">Mot de passe</h2>
              <p className="text-[11px] text-ca-text-muted">Modifiez votre mot de passe</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-[11px] font-medium text-ca-text-muted mb-1.5">Mot de passe actuel</p>
              <div className="relative">
                <input type={showOld ? "text" : "password"} className="w-full h-11 pl-4 pr-10 text-[14px] bg-[rgba(255,255,255,0.55)] backdrop-blur-[8px] border border-[rgba(255,255,255,0.35)] rounded-[12px] outline-none text-ca-text-primary focus:border-[rgba(82,183,136,0.40)]" placeholder="••••••••" />
                <button onClick={() => setShowOld((p) => !p)} className="absolute inset-y-0 right-3 flex items-center cursor-pointer">
                  {showOld ? <EyeOff className="w-4 h-4 text-ca-text-muted" /> : <Eye className="w-4 h-4 text-ca-text-muted" />}
                </button>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-medium text-ca-text-muted mb-1.5">Nouveau mot de passe</p>
              <div className="relative">
                <input type={showNew ? "text" : "password"} className="w-full h-11 pl-4 pr-10 text-[14px] bg-[rgba(255,255,255,0.55)] backdrop-blur-[8px] border border-[rgba(255,255,255,0.35)] rounded-[12px] outline-none text-ca-text-primary focus:border-[rgba(82,183,136,0.40)]" placeholder="••••••••" />
                <button onClick={() => setShowNew((p) => !p)} className="absolute inset-y-0 right-3 flex items-center cursor-pointer">
                  {showNew ? <EyeOff className="w-4 h-4 text-ca-text-muted" /> : <Eye className="w-4 h-4 text-ca-text-muted" />}
                </button>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-medium text-ca-text-muted mb-1.5">Confirmer le mot de passe</p>
              <div className="relative">
                <input type={showConfirm ? "text" : "password"} className="w-full h-11 pl-4 pr-10 text-[14px] bg-[rgba(255,255,255,0.55)] backdrop-blur-[8px] border border-[rgba(255,255,255,0.35)] rounded-[12px] outline-none text-ca-text-primary focus:border-[rgba(82,183,136,0.40)]" placeholder="••••••••" />
                <button onClick={() => setShowConfirm((p) => !p)} className="absolute inset-y-0 right-3 flex items-center cursor-pointer">
                  {showConfirm ? <EyeOff className="w-4 h-4 text-ca-text-muted" /> : <Eye className="w-4 h-4 text-ca-text-muted" />}
                </button>
              </div>
            </div>
          </div>

          <button className="w-full mt-4 h-11 bg-[rgba(45,106,79,0.85)] rounded-[12px] text-[13px] font-bold text-white cursor-pointer active:scale-[0.97] transition-all hover:bg-[rgba(45,106,79,0.95)]">
            Modifier le mot de passe
          </button>
        </div>

        <div className="bg-[rgba(255,255,255,0.60)] backdrop-blur-[16px] rounded-[20px] border border-[rgba(255,255,255,0.50)] p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-[rgba(69,123,157,0.12)] flex items-center justify-center">
              <Shield className="w-5 h-5 text-ca-info" />
            </div>
            <div>
              <h2 className="text-[14px] font-bold text-ca-text-primary">Authentification à deux facteurs</h2>
              <p className="text-[11px] text-ca-text-muted">Ajoutez une couche de sécurité supplémentaire</p>
            </div>
          </div>
          <p className="text-[12px] text-ca-text-secondary mt-3 leading-relaxed">
            Activez la vérification en deux étapes pour protéger votre compte contre les accès non autorisés.
          </p>
          <button className="w-full mt-3 h-10 bg-[rgba(45,106,79,0.10)] rounded-[12px] text-[12px] font-semibold text-ca-green-primary cursor-pointer active:scale-[0.97] transition-all hover:bg-[rgba(45,106,79,0.15)]">
            Activer
          </button>
        </div>
      </div>
    </div>
  );
}
