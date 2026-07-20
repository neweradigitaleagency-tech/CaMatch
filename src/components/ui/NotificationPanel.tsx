import { motion, AnimatePresence } from "motion/react";
import { X, Bell, MessageSquare, CheckCircle, Coins, Star, AlertTriangle, ShoppingCart, Wallet, Package, Scale, Truck, FileText, Ban, ArrowUpRight, CheckCheck, Trash2 } from "lucide-react";
import { useNotificationStore, type AppNotification } from "../../stores/notificationStore";
import { timeAgo } from "../../utils/timeAgo";

type NotificationVariant = "sheet" | "dropdown";

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
  variant?: NotificationVariant;
  notifications?: AppNotification[];
  unreadCount?: number;
  onMarkRead?: (id: string) => void;
  onMarkAllRead?: () => void;
  onClear?: (id: string) => void;
  onClearAll?: () => void;
  onNotificationClick?: (notification: AppNotification) => void;
}

const CLIENT_TYPE_ICONS: Record<string, typeof Bell> = {
  mission: CheckCircle,
  message: MessageSquare,
  payment: Coins,
  review: Star,
  promo: Bell,
  info: AlertTriangle,
  quote: MessageSquare,
};

const CLIENT_TYPE_COLORS: Record<string, string> = {
  mission: "bg-cm-accent-soft text-cm-accent",
  message: "bg-blue-50 text-blue-600",
  payment: "bg-emerald-50 text-emerald-600",
  review: "bg-amber-50 text-amber-600",
  promo: "bg-purple-50 text-purple-600",
  info: "bg-orange-50 text-orange-600",
  quote: "bg-blue-50 text-blue-600",
};

export default function NotificationPanel({
  open, onClose, variant = "sheet",
  notifications: externalNotifications,
  unreadCount: externalUnreadCount,
  onMarkRead: externalMarkRead,
  onMarkAllRead: externalMarkAllRead,
  onClear: externalClear,
  onClearAll: externalClearAll,
  onNotificationClick: externalClick,
}: NotificationPanelProps) {
  const storeNotifications = useNotificationStore((s) => s.notifications);
  const storeMarkAllRead = useNotificationStore((s) => s.markAllRead);
  const storeMarkRead = useNotificationStore((s) => s.markRead);
  const storeClear = useNotificationStore((s) => s.clearNotification);

  const notifications = externalNotifications ?? storeNotifications;
  const handleMarkRead = externalMarkRead ?? storeMarkRead;
  const handleMarkAllRead = externalMarkAllRead ?? storeMarkAllRead;
  const handleClear = externalClear ?? storeClear;

  const itemCount = notifications.length;
  const hasUnread = externalUnreadCount !== undefined
    ? externalUnreadCount > 0
    : notifications.some((n) => !n.read);

  return (
    <AnimatePresence>
      {open && variant === "sheet" && (
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
            className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-[448px] bg-cm-elevated rounded-t-[20px] flex flex-col shadow-2xl pb-[env(safe-area-inset-bottom,0px)]"
            style={{ maxHeight: "85dvh" }}
          >
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-cm-border shrink-0">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-cm-accent" />
                <h2 className="text-[16px] font-bold text-cm-text">Notifications</h2>
              </div>
              <div className="flex items-center gap-2">
                {hasUnread && (
                  <button onClick={handleMarkAllRead}
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
                  const Icon = CLIENT_TYPE_ICONS[n.type] || Bell;
                  return (
                    <div key={n.id}
                      onClick={() => { if (!n.read) handleMarkRead(n.id); externalClick?.(n); }}
                      className={`flex items-start gap-3 p-3 rounded-[14px] border cursor-pointer transition-all active:scale-[0.98] ${
                        n.read
                          ? "border-cm-border bg-transparent"
                          : "border-cm-accent/20 bg-cm-accent-soft/30"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${CLIENT_TYPE_COLORS[n.type] ?? CLIENT_TYPE_COLORS.info!}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[13px] ${n.read ? "text-cm-text" : "font-semibold text-cm-text"}`}>
                          {n.title}
                        </p>
                        <p className="text-[12px] text-cm-text-soft mt-0.5 leading-snug">{n.body}</p>
                        <p className="text-[10px] text-cm-text-muted mt-1">{timeAgo(n.createdAt)}</p>
                      </div>
                      {!n.read && (
                        <div className="w-2 h-2 rounded-full bg-cm-accent shrink-0 mt-1.5" />
                      )}
                      <button onClick={(e) => { e.stopPropagation(); handleClear(n.id); }}
                        className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-cm-border-soft cursor-pointer shrink-0">
                        <X className="w-3 h-3 text-cm-text-muted" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </>
      )}

      {open && variant === "dropdown" && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} />
          <div className="absolute top-full right-0 mt-2 z-50 w-[380px] max-w-[calc(100vw-32px)] bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-gray-500" />
                <h3 className="text-[13px] font-bold text-gray-900">Notifications</h3>
                {hasUnread && (
                  <span className="text-[10px] font-semibold text-white bg-red-500 px-1.5 py-0.5 rounded-full">
                    {itemCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {hasUnread && (
                  <button onClick={handleMarkAllRead}
                    className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                    <CheckCheck className="w-3 h-3" /> Tout lu
                  </button>
                )}
                {notifications.length > 0 && (
                  <button onClick={externalClearAll ?? (() => {})}
                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button onClick={onClose}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="max-h-[420px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-[12px] text-gray-500">Aucune notification</p>
                  <p className="text-[11px] text-gray-400 mt-1">Les événements en temps réel apparaîtront ici</p>
                </div>
              ) : notifications.slice(0, 30).map((n) => (
                <div key={n.id}
                  onClick={() => { if (!n.read) handleMarkRead(n.id); externalClick?.(n); }}
                  className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors ${
                    n.read ? "hover:bg-gray-50" : "bg-cm-green/5 hover:bg-cm-green/10"
                  }`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${CLIENT_TYPE_COLORS[n.type] ?? "text-gray-500 bg-gray-50"}`}>
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-[12px] ${n.read ? "text-gray-600" : "text-gray-900 font-semibold"}`}>{n.title}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.read && (
                    <div className="w-2 h-2 rounded-full bg-cm-green shrink-0 mt-1.5" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
