import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Shield, Smartphone, Monitor, KeyRound, Lock, CheckCircle } from "lucide-react";
import { useState } from "react";

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
        enabled ? "bg-cm-accent" : "bg-cm-border"
      }`}
    >
      <div
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
          enabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

const MOCK_DEVICES = [
  { id: "d1", name: "iPhone 15 Pro", type: "smartphone", lastAccess: "2026-06-30T14:00:00Z", current: true },
  { id: "d2", name: "MacBook Air", type: "computer", lastAccess: "2026-06-28T10:00:00Z", current: false },
  { id: "d3", name: "OnePlus 12", type: "smartphone", lastAccess: "2026-06-25T08:00:00Z", current: false },
];

export default function ProSecurityPage() {
  const nav = useNavigate();
  const [twoFactor, setTwoFactor] = useState(false);

  return (
    <div className="min-h-dynamic bg-cm-bg">
      <div className="sticky top-0 z-10 bg-cm-elevated/80 backdrop-blur-lg border-b border-cm-border">
        <div className="flex items-center h-14 px-5 gap-3">
          <button type="button" onClick={() => nav(-1)} className="p-1 -ml-1 cursor-pointer active:scale-[0.97]">
            <ArrowLeft className="w-5 h-5 text-cm-text" />
          </button>
          <h1 className="text-[18px] font-bold text-cm-text">Sécurité</h1>
        </div>
      </div>

      <div className="w-full max-w-[448px] mx-auto px-5 pt-4 pb-24 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-cm-elevated border border-cm-border rounded-[14px] p-5"
        >
          <h2 className="text-[13px] font-bold text-cm-text mb-3">Mot de passe</h2>
          <button className="w-full flex items-center justify-between py-2.5 cursor-pointer active:scale-[0.97]">
            <div className="flex items-center gap-3">
              <KeyRound className="w-4 h-4 text-cm-accent" />
              <span className="text-[13px] text-cm-text">Changer le mot de passe</span>
            </div>
            <span className="text-[11px] text-cm-accent">Modifier</span>
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-cm-elevated border border-cm-border rounded-[14px] p-5"
        >
          <h2 className="text-[13px] font-bold text-cm-text mb-3">Authentification à deux facteurs</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-cm-accent" />
              <div>
                <p className="text-[13px] text-cm-text">2FA</p>
                <p className="text-[10px] text-cm-text-muted">Protection supplémentaire</p>
              </div>
            </div>
            <Toggle enabled={twoFactor} onChange={() => setTwoFactor(!twoFactor)} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-cm-elevated border border-cm-border rounded-[14px] p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <Lock className="w-4 h-4 text-cm-accent" />
            <h2 className="text-[13px] font-bold text-cm-text">Vérification</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[12px] text-cm-text">Identité vérifiée</p>
              <p className="text-[10px] text-cm-text-muted">CNI approuvée</p>
            </div>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-cm-elevated border border-cm-border rounded-[14px] p-5"
        >
          <h2 className="text-[13px] font-bold text-cm-text mb-3">Appareils connectés</h2>
          <div className="space-y-3">
            {MOCK_DEVICES.map((device) => (
              <div key={device.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {device.type === "smartphone" ? (
                    <Smartphone className="w-4 h-4 text-cm-text-muted" />
                  ) : (
                    <Monitor className="w-4 h-4 text-cm-text-muted" />
                  )}
                  <div>
                    <p className="text-[12px] text-cm-text">{device.name}</p>
                    <p className="text-[10px] text-cm-text-muted">
                      {new Date(device.lastAccess).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>
                {device.current && (
                  <span className="text-[10px] text-green-500 font-medium">Actuel</span>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
