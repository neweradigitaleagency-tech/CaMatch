import { motion, AnimatePresence } from "motion/react";
import { X, Bell, MessageSquare, CheckCircle, DollarSign, Star, AlertTriangle } from "lucide-react";
import { useNotificationStore, type AppNotification } from "../stores/notificationStore";

const TYPE_ICONS: Record<string, typeof Bell> = {
  mission: CheckCircle,
  message: MessageSquare,
  payment: DollarSign,
  review: Star,
  promo: Bell,
  info: AlertTriangle,
};

const TYPE_COLORS: Record<string, string> = {
  mission: "bg-cm-accent-soft text-cm-accent",
  message: "bg-blue-50 text-blue-600",
  payment: "bg-emerald-50 text-emerald-600",
  review: "bg-amber-50 text-amber-600",
  promo: "bg-purple-50 text-purple-600",
  info: "bg-orange-50 text-orange-600",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `il y a ${days}j`;
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
}

export default function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  const notifications = useNotificationStore((s) => s.notifications);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const markRead = useNotificationStore((s) => s.markRead);
  const clearNotification = useNotificationStore((s) => s.clearNotification);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-md bg-cm-elevated rounded-t-[20px] flex flex-col shadow-2xl"
            style={{ maxHeight: "85vh" }}
          >
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-cm-border shrink-0">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-cm-accent" />
                <h2 className="text-[16px] font-bold text-cm-text">Notifications</h2>
              </div>
              <div className="flex items-center gap-2">
                {notifications.some((n) => !n.read) && (
                  <button onClick={markAllRead}
                    className="text-[11px] font-medium text-cm-accent px-2.5 py-1 rounded-full border border-cm-accent/30 cursor-pointer active:scale-95 transition-all">
                    Tout lire
                  </button>
                )}
                <button onClick={onClose}
                  className="w-8 h-8 rounded-full bg-cm-border-soft flex items-center justify-center cursor-pointer active:scale-90 transition-all">
                  <X className="w-4 h-4 text-cm-text" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
              {notifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="w-10 h-10 text-cm-text-muted mx-auto mb-3" />
                  <p className="text-[14px] font-semibold text-cm-text">Aucune notification</p>
                  <p className="text-[12px] text-cm-text-soft mt-1">Vous serez informé des mises à jour ici</p>
                </div>
              ) : (
                notifications.map((n) => {
                  const Icon = TYPE_ICONS[n.type] || Bell;
                  return (
                    <NotificationItem
                      key={n.id}
                      notification={n}
                      icon={<Icon className="w-3.5 h-3.5" />}
                      colorClass={TYPE_COLORS[n.type] ?? TYPE_COLORS.info!}
                      onMarkRead={() => markRead(n.id)}
                      onClear={() => clearNotification(n.id)}
                    />
                  );
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function NotificationItem({
  notification, icon, colorClass, onMarkRead, onClear,
}: {
  notification: AppNotification;
  icon: React.ReactNode;
  colorClass: string;
  onMarkRead: () => void;
  onClear: () => void;
}) {
  return (
    <div
      onClick={() => { if (!notification.read) onMarkRead(); }}
      className={`flex items-start gap-3 p-3 rounded-[14px] border cursor-pointer transition-all active:scale-[0.98] ${
        notification.read
          ? "border-cm-border bg-transparent"
          : "border-cm-accent/20 bg-cm-accent-soft/30"
      }`}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-[13px] ${notification.read ? "text-cm-text" : "font-semibold text-cm-text"}`}>
          {notification.title}
        </p>
        <p className="text-[12px] text-cm-text-soft mt-0.5 leading-snug">{notification.body}</p>
        <p className="text-[10px] text-cm-text-muted mt-1">{timeAgo(notification.createdAt)}</p>
      </div>
      {!notification.read && (
        <div className="w-2 h-2 rounded-full bg-cm-accent shrink-0 mt-1.5" />
      )}
      <button onClick={(e) => { e.stopPropagation(); onClear(); }}
        className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-cm-border-soft cursor-pointer shrink-0">
        <X className="w-3 h-3 text-cm-text-muted" />
      </button>
    </div>
  );
}
