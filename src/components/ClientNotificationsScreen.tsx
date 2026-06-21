import { ArrowLeft, Bell, MessageSquare, Star, CheckCircle, AlertTriangle, Clock } from "lucide-react";

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
    <div className="flex flex-col w-full min-h-screen bg-brand-cream pb-32">
      <header className="flex items-center justify-between px-4 py-3 bg-brand-cream/90 backdrop-blur-md sticky top-0 z-10">
        <button onClick={onBack} className="w-12 h-12 flex items-center justify-center rounded-full bg-white text-brand-forest hover:bg-pale-mint transition-colors shadow-sm cursor-pointer active:scale-95"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-sans text-sm font-bold">Notifications</h1>
        <button className="text-caption font-medium text-brand-forest cursor-pointer">Tout lu</button>
      </header>
      <div className="px-4 pt-4 space-y-1">
        {notifs.map(n => (
          <div key={n.id} className={`bg-white rounded-2xl p-4 border ${n.unread ? "border-brand-lime/30" : "border-pale-mint/20"} shadow-sm flex items-center gap-3`}>
            <div className={`w-9 h-9 rounded-xl ${n.unread ? "bg-brand-lime/20" : "bg-pale-mint"} flex items-center justify-center`}>
              <n.icon className={`w-4 h-4 ${n.unread ? "text-brand-lime" : "text-secondary/60"}`} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-brand-forest">{n.text}</p>
              <p className="text-caption text-secondary/60 mt-0.5">{n.time}</p>
            </div>
            {n.unread && <div className="w-2 h-2 rounded-full bg-brand-lime" />}
          </div>
        ))}
      </div>
    </div>
  );
}
