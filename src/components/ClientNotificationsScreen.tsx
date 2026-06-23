import { ArrowLeft, MessageSquare, Star, CheckCircle, AlertTriangle, Clock } from "lucide-react";

interface ClientNotificationsScreenProps { onBack: () => void; }

const notifs = [
  { id: "n1", type: "message", icon: MessageSquare, text: "Kouamé vous a envoyé un message", time: "Il y a 5 min", unread: true },
  { id: "n2", type: "progress", icon: CheckCircle, text: "Mission #CM-003 est terminée", time: "Il y a 2h", unread: true },
  { id: "n3", type: "review", icon: Star, text: "Laissez un avis à Kouamé", time: "Il y a 3h", unread: false },
  { id: "n4", type: "alert", icon: AlertTriangle, text: "Un pro a accepté votre demande", time: "Hier", unread: false },
  { id: "n5", type: "reminder", icon: Clock, text: "Rappel: mission demain 14h", time: "Hier", unread: false },
];

export default function ClientNotificationsScreen({ onBack }: ClientNotificationsScreenProps) {
  return (
    <div className="flex flex-col w-full min-h-screen bg-cm-bg pb-32">
      <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-10 bg-cm-elevated border-b border-cm-border">
        <button onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-[12px] border border-cm-border bg-cm-elevated cursor-pointer active:scale-90 transition-all">
          <ArrowLeft className="w-4 h-4 text-cm-text" />
        </button>
        <h1 className="text-[15px] font-bold text-cm-text">Notifications</h1>
        <button className="text-[11px] font-semibold text-cm-accent cursor-pointer">Tout lu</button>
      </header>
      <div className="px-4 pt-4 space-y-1">
        {notifs.map(n => (
          <div key={n.id} className={`bg-cm-elevated border rounded-[16px] p-4 flex items-center gap-3 shadow-cm-sm ${n.unread ? "border-cm-accent" : "border-cm-border"}`}>
            <div className={`w-9 h-9 rounded-[10px] ${n.unread ? "bg-cm-accent-soft" : "bg-cm-border-soft"} flex items-center justify-center`}>
              <n.icon className={`w-4 h-4 ${n.unread ? "text-cm-accent" : "text-cm-text-muted"}`} />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-bold text-cm-text">{n.text}</p>
              <p className="text-[11px] text-cm-text-muted mt-0.5">{n.time}</p>
            </div>
            {n.unread && <div className="w-2 h-2 rounded-full bg-cm-accent shrink-0" />}
          </div>
        ))}
      </div>
    </div>
  );
}
