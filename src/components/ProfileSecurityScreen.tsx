import { ArrowLeft, Shield, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface ProfileSecurityScreenProps { onBack: () => void; }

export default function ProfileSecurityScreen({ onBack }: ProfileSecurityScreenProps) {
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="flex flex-col w-full min-h-screen bg-cm-bg pb-32">
      <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-10 bg-cm-elevated border-b border-cm-border">
        <button onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-[12px] border border-cm-border bg-cm-elevated cursor-pointer active:scale-90 transition-all">
          <ArrowLeft className="w-4 h-4 text-cm-text" />
        </button>
        <h1 className="text-[15px] font-bold text-cm-text">Sécurité</h1>
        <div className="w-9 h-9" />
      </header>

      <div className="mx-4 pt-4">
        <div className="bg-cm-elevated border border-cm-border rounded-[20px] p-5 mb-4 shadow-cm-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-[12px] bg-cm-accent-soft flex items-center justify-center">
              <Lock className="w-5 h-5 text-cm-accent" />
            </div>
            <div>
              <h2 className="text-[14px] font-bold text-cm-text">Mot de passe</h2>
              <p className="text-[11px] text-cm-text-muted">Modifiez votre mot de passe</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-[11px] font-medium text-cm-text-muted mb-1.5">Mot de passe actuel</p>
              <div className="relative">
                <input type={showOld ? "text" : "password"} className="w-full h-11 pl-4 pr-10 text-[14px] bg-cm-bg border border-cm-border rounded-[12px] outline-none text-cm-text focus:border-cm-accent" placeholder="••••••••" />
                <button onClick={() => setShowOld((p) => !p)} className="absolute inset-y-0 right-3 flex items-center cursor-pointer">
                  {showOld ? <EyeOff className="w-4 h-4 text-cm-text-muted" /> : <Eye className="w-4 h-4 text-cm-text-muted" />}
                </button>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-medium text-cm-text-muted mb-1.5">Nouveau mot de passe</p>
              <div className="relative">
                <input type={showNew ? "text" : "password"} className="w-full h-11 pl-4 pr-10 text-[14px] bg-cm-bg border border-cm-border rounded-[12px] outline-none text-cm-text focus:border-cm-accent" placeholder="••••••••" />
                <button onClick={() => setShowNew((p) => !p)} className="absolute inset-y-0 right-3 flex items-center cursor-pointer">
                  {showNew ? <EyeOff className="w-4 h-4 text-cm-text-muted" /> : <Eye className="w-4 h-4 text-cm-text-muted" />}
                </button>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-medium text-cm-text-muted mb-1.5">Confirmer le mot de passe</p>
              <div className="relative">
                <input type={showConfirm ? "text" : "password"} className="w-full h-11 pl-4 pr-10 text-[14px] bg-cm-bg border border-cm-border rounded-[12px] outline-none text-cm-text focus:border-cm-accent" placeholder="••••••••" />
                <button onClick={() => setShowConfirm((p) => !p)} className="absolute inset-y-0 right-3 flex items-center cursor-pointer">
                  {showConfirm ? <EyeOff className="w-4 h-4 text-cm-text-muted" /> : <Eye className="w-4 h-4 text-cm-text-muted" />}
                </button>
              </div>
            </div>
          </div>

          <button className="w-full mt-4 h-11 bg-cm-text rounded-[12px] text-[13px] font-bold text-white cursor-pointer active:scale-[0.97] transition-all hover:opacity-90">
            Modifier le mot de passe
          </button>
        </div>

        <div className="bg-cm-elevated border border-cm-border rounded-[20px] p-5 shadow-cm-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-cm-accent-soft flex items-center justify-center">
              <Shield className="w-5 h-5 text-cm-accent" />
            </div>
            <div>
              <h2 className="text-[14px] font-bold text-cm-text">Authentification à deux facteurs</h2>
              <p className="text-[11px] text-cm-text-muted">Ajoutez une couche de sécurité supplémentaire</p>
            </div>
          </div>
          <p className="text-[12px] text-cm-text-soft mt-3 leading-relaxed">
            Activez la vérification en deux étapes pour protéger votre compte contre les accès non autorisés.
          </p>
          <button className="w-full mt-3 h-10 border border-cm-border rounded-[12px] text-[12px] font-semibold text-cm-accent cursor-pointer active:scale-[0.97] transition-all hover:bg-cm-accent-soft">
            Activer
          </button>
        </div>
      </div>
    </div>
  );
}
