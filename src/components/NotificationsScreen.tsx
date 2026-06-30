import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Check, X, Bell, AlertCircle, MessageSquare, Star, DollarSign } from "lucide-react";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const FILTERS = [
  { key: "all", label: "Tout" },
  { key: "unread", label: "Non lues" },
  { key: "missions", label: "Missions" },
  { key: "messages", label: "Messages" },
  { key: "reviews", label: "Avis" },
  { key: "payments", label: "Paiements" },
];

interface Props {
  onBack: () => void;
  notifications: Notification[];
  markAllRead: () => void;
  setActiveFilter: (f: string) => void;
  activeFilter: string;
  clearNotification: (id: string) => void;
}

export default function NotificationsScreen({ onBack, notifications, markAllRead, setActiveFilter, activeFilter, clearNotification }: Props) {
  const filtered = activeFilter === "all"
    ? notifications
    : activeFilter === "unread"
      ? notifications.filter(n => !n.read)
      : notifications.filter(n => n.type === activeFilter);

  return (
    <div className="flex flex-col w-full min-h-screen bg-cm-bg pb-32">
      <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-10 bg-cm-elevated border-b border-cm-border">
        <button type="button" onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-[12px] border border-cm-border bg-cm-elevated cursor-pointer active:scale-90 transition-all">
          <ArrowLeft className="w-4 h-4 text-cm-text" />
        </button>
        <h1 className="text-[15px] font-bold text-cm-text">Notifications</h1>
        <button type="button" onClick={markAllRead}
          className="text-[11px] font-semibold text-cm-accent px-3 py-1.5 rounded-full border border-cm-accent/30 cursor-pointer active:scale-95 transition-all">
          Tout marquer comme lu
        </button>
      </header>

      <div className="px-4 pt-3 overflow-x-auto scrollbar-none">
        <div className="flex gap-2">
          {FILTERS.map(f => {
            const isActive = activeFilter === f.key;
            return (
              <button type="button" key={f.key} onClick={() => setActiveFilter(f.key)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all cursor-pointer active:scale-95 ${
                  isActive
                    ? "bg-cm-accent text-white shadow-sm"
                    : "bg-cm-elevated border border-cm-border text-cm-text-muted"
                }`}>
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 pt-4 space-y-2">
        <AnimatePresence>
          {filtered.map(n => (
            <motion.div key={n.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className={`bg-cm-elevated border rounded-[14px] p-4 flex items-start gap-3 ${
                n.read ? "border-cm-border" : "border-cm-accent/30"
              }`}>
              <div className="w-8 h-8 rounded-[10px] bg-cm-accent-soft flex items-center justify-center shrink-0">
                {n.type === "message" ? <MessageSquare className="w-4 h-4 text-cm-accent" />
                  : n.type === "review" ? <Star className="w-4 h-4 text-cm-accent" />
                  : n.type === "payment" ? <DollarSign className="w-4 h-4 text-cm-accent" />
                  : <Bell className="w-4 h-4 text-cm-accent" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-cm-text">{n.title}</p>
                <p className="text-[12px] text-cm-text-soft mt-0.5">{n.message}</p>
              </div>
              <button type="button" onClick={(e) => { e.stopPropagation(); clearNotification(n.id); }}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-cm-border-soft cursor-pointer">
                <X className="w-3 h-3 text-cm-text-muted" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="pt-8 text-center">
            <Bell className="w-10 h-10 text-cm-text-muted mx-auto mb-2" />
            <p className="text-[13px] text-cm-text-muted">Aucune notification</p>
          </div>
        )}
      </div>
    </div>
  );
}
