import { ArrowLeft, Shield, Lock, Smartphone, Fingerprint, Clock, Monitor, Globe, ChevronRight, Check } from "lucide-react";
import { useState } from "react";

interface ProfileSecurityScreenProps { onBack: () => void; }

export default function ProfileSecurityScreen({ onBack }: ProfileSecurityScreenProps) {
  const [pinEnabled, setPinEnabled] = useState(false);
  const [pin, setPin] = useState("");
  const [showPinInput, setShowPinInput] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const sessions = [
    { id: "1", device: "iPhone 14 Pro", location: "Abidjan, Cocody", lastActive: "il y a 2 min", current: true },
    { id: "2", device: "Chrome Windows", location: "Abidjan, Plateau", lastActive: "il y a 3h", current: false },
    { id: "3", device: "Safari MacBook", location: "Abidjan, Marcory", lastActive: "il y a 2j", current: false },
  ];

  const handleTogglePin = () => {
    if (!pinEnabled) {
      setShowPinInput(true);
    } else {
      setPinEnabled(false);
      setPin("");
      setShowPinInput(false);
    }
  };

  const handleSavePin = () => {
    if (pin.length >= 4) {
      setPinEnabled(true);
      setShowPinInput(false);
      localStorage.setItem("appPin", pin);
    }
  };

  return (
    <div className="flex flex-col w-full min-h-dynamic bg-cm-surface pb-32">
      <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-10 bg-cm-elevated border-b border-cm-border/40">
        <button onClick={onBack}
          className="p-1 cursor-pointer active:scale-[0.97] transition-transform touch-min">
          <ArrowLeft className="w-4 h-4 text-cm-text-soft" />
        </button>
        <h1 className="text-[15px] font-bold text-cm-text">Sécurité</h1>
        <div className="w-9 h-9" />
      </header>

      <div className="px-4 pt-4 space-y-3">
        {/* Code PIN */}
        <div className="bg-cm-elevated border border-cm-border rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cm-surface flex items-center justify-center">
                <Lock className="w-5 h-5 text-cm-text" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-cm-text">Code PIN de l'app</p>
                <p className="text-[11px] text-cm-text-muted">{pinEnabled ? "Activé" : "Désactivé"}</p>
              </div>
            </div>
            <button onClick={handleTogglePin}
              className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${pinEnabled ? "bg-cm-text" : "bg-cm-border-soft"}`}>
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${pinEnabled ? "translate-x-5 left-0.5" : "translate-x-0.5 left-0"}`} />
            </button>
          </div>

          {showPinInput && (
            <div className="mt-4 pt-3 border-t border-cm-border/40">
              <p className="text-[11px] text-cm-text-muted mb-2">Choisissez un code à 4 chiffres</p>
              <div className="flex gap-2">
                <input type="password" maxLength={4} inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  className="flex-1 h-11 px-4 text-[16px] tracking-[8px] text-center bg-cm-surface border border-cm-border rounded-xl text-cm-text outline-none focus:border-cm-text-muted font-mono"
                  placeholder="••••" autoFocus />
                <button onClick={handleSavePin} disabled={pin.length < 4}
                  className="px-5 h-11 bg-cm-text text-white text-[12px] font-semibold rounded-xl cursor-pointer disabled:opacity-40 hover:opacity-90 transition-all active:scale-[0.97]">
                  Valider
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Biométrie */}
        <div className="bg-cm-elevated border border-cm-border rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cm-surface flex items-center justify-center">
              <Fingerprint className="w-5 h-5 text-cm-text" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-cm-text">Vérification biométrique</p>
              <p className="text-[11px] text-cm-text-muted">{biometricEnabled ? "Activée" : "Empreinte / Face ID"}</p>
            </div>
          </div>
          <button onClick={() => setBiometricEnabled(!biometricEnabled)}
            className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${biometricEnabled ? "bg-cm-text" : "bg-cm-border-soft"}`}>
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${biometricEnabled ? "translate-x-5 left-0.5" : "translate-x-0.5 left-0"}`} />
          </button>
        </div>

        {/* Changement de mot de passe */}
        <div className="bg-cm-elevated border border-cm-border rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-cm-surface flex items-center justify-center">
              <Shield className="w-5 h-5 text-cm-text" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-cm-text">Mot de passe</p>
              <p className="text-[11px] text-cm-text-muted">Dernière modification il y a 3 mois</p>
            </div>
          </div>
          <button className="w-full h-10 bg-cm-text text-white text-[12px] font-semibold rounded-xl cursor-pointer hover:opacity-90 transition-all active:scale-[0.97]">
            Modifier le mot de passe
          </button>
        </div>

        {/* Sessions actives */}
        <div className="bg-cm-elevated border border-cm-border rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-cm-surface flex items-center justify-center">
              <Monitor className="w-5 h-5 text-cm-text" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-cm-text">Sessions actives</p>
              <p className="text-[11px] text-cm-text-muted">{sessions.length} appareils connectés</p>
            </div>
          </div>

          <div className="space-y-2">
            {sessions.map((s) => (
              <div key={s.id} className="flex items-start gap-3 py-2 border-b border-cm-border/20 last:border-0">
                <div className="w-8 h-8 rounded-lg bg-cm-surface flex items-center justify-center shrink-0 mt-0.5">
                  <Smartphone className="w-4 h-4 text-cm-text-muted" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[12px] font-semibold text-cm-text">{s.device}</p>
                    {s.current && (
                      <span className="text-[9px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">Actuelle</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-cm-text-muted">
                    <Globe className="w-3 h-3" />
                    <span>{s.location}</span>
                    <span>•</span>
                    <Clock className="w-3 h-3" />
                    <span>{s.lastActive}</span>
                  </div>
                </div>
                {!s.current && (
                  <button className="text-[10px] text-red-500 font-medium cursor-pointer hover:underline shrink-0 mt-1">Déconnecter</button>
                )}
              </div>
            ))}
          </div>

          <button className="w-full mt-3 h-9 border border-cm-border rounded-xl text-[11px] font-semibold text-cm-text-muted cursor-pointer hover:bg-cm-surface transition-colors active:scale-[0.97]">
            Déconnecter tous les appareils
          </button>
        </div>

        {/* 2FA */}
        <div className="bg-cm-elevated border border-cm-border rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cm-surface flex items-center justify-center">
              <Shield className="w-5 h-5 text-cm-text" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-cm-text">Authentification à deux facteurs</p>
              <p className="text-[11px] text-cm-text-muted">Sécurité renforcée</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-cm-border-soft shrink-0" />
        </div>
      </div>
    </div>
  );
}
