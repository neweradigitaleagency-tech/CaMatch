import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertCircle } from "lucide-react";

const CHANNELS = [
  { key: "push", label: "Notifications Push", description: "Bannières et alertes sur votre téléphone" },
  { key: "sms", label: "SMS", description: "Messages texte" },
  { key: "whatsapp", label: "WhatsApp", description: "Messages via WhatsApp" },
  { key: "email", label: "Email", description: "Résumés et factures" },
];

export default function ClientNotificationSettingsScreen() {
  const nav = useNavigate();
  const [channels, setChannels] = useState(CHANNELS.map(ch => ({ ...ch, enabled: true })));

  const toggle = (key: string) => {
    setChannels(prev => prev.map(c => c.key === key ? { ...c, enabled: !c.enabled } : c));
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-cm-bg pb-32">
      <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-10 bg-cm-elevated border-b border-cm-border">
        <button type="button" onClick={() => window.history.length > 2 ? nav(-1) : nav("/")}
          className="w-9 h-9 flex items-center justify-center rounded-[12px] border border-cm-border bg-cm-elevated cursor-pointer active:scale-90 transition-all">
          <ArrowLeft className="w-4 h-4 text-cm-text" />
        </button>
        <h1 className="text-[15px] font-bold text-cm-text">Notifications</h1>
        <div className="w-9 h-9" />
      </header>
      <div className="px-4 pt-4 space-y-3">
        {channels.map(ch => {
          const enabled = ch.enabled;
          return (
            <div key={ch.key} className="bg-cm-elevated border border-cm-border rounded-[16px] p-4 flex items-center gap-3 shadow-cm-sm">
              <div className="flex-1">
                <p className="text-[13px] font-bold text-cm-text">{ch.label}</p>
                <p className="text-[12px] text-cm-text-muted mt-0.5">{ch.description}</p>
              </div>
              <button type="button"
                onClick={() => toggle(ch.key)}
                className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${enabled ? "bg-cm-accent" : "bg-cm-border-soft"}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${enabled ? "translate-x-5 left-0.5" : "translate-x-0.5 left-0"}`} />
              </button>
            </div>
          );
        })}
      </div>

      <div className="mx-4 mt-4 bg-cm-accent-soft/40 border border-cm-accent/20 rounded-[14px] p-4 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-cm-accent shrink-0 mt-0.5" />
        <p className="text-[12px] text-cm-text-soft leading-relaxed">
          Les notifications critiques (mission confirmée, rappels) sont toujours envoyées, quels que soient vos réglages.
        </p>
      </div>
    </div>
  );
}
