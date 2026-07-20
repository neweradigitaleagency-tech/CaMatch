import { useNavigate } from "react-router-dom";
import SharedNotificationPanel from "../ui/NotificationPanel";
import { useRealtimeNotifications } from "../../contexts/RealtimeNotificationsContext";
import { NOTIFICATION_ACTIONS } from "../../types/notifications";

export default function SupplierNotificationPanel() {
  const navigate = useNavigate();
  const { notifications, panelOpen, setPanelOpen, markAsRead, markAllAsRead, clearNotifications, unreadCount } = useRealtimeNotifications();

  const mappedNotifications = notifications.map((n) => ({
    id: n.id,
    type: n.type === "new_order" ? "info" as const
      : n.type === "payment_received" ? "payment" as const
      : n.type === "low_stock" ? "info" as const
      : n.type === "new_dispute" ? "info" as const
      : n.type === "delivery_update" ? "info" as const
      : n.type === "document_approved" ? "info" as const
      : n.type === "document_rejected" ? "info" as const
      : n.type === "payout_processed" ? "payment" as const
      : n.type === "promotion_ended" ? "info" as const
      : n.type === "order_delivered" ? "info" as const
      : "info" as const,
    title: n.title,
    body: n.description,
    icon: undefined,
    read: n.read,
    createdAt: n.createdAt,
    actionUrl: n.link,
  }));

  function handleNotificationClick(notif: typeof mappedNotifications[number]) {
    const original = notifications.find((n) => n.id === notif.id);
    if (!original) return;
    const link = original.link || NOTIFICATION_ACTIONS[original.type]?.defaultLink;
    if (link) {
      setPanelOpen(false);
      navigate(link);
    }
  }

  if (!panelOpen) return null;

  return (
    <SharedNotificationPanel
      open={panelOpen}
      onClose={() => setPanelOpen(false)}
      variant="dropdown"
      notifications={mappedNotifications}
      unreadCount={unreadCount}
      onMarkRead={markAsRead}
      onMarkAllRead={markAllAsRead}
      onClear={(id) => {
        const notif = mappedNotifications.find((n) => n.id === id);
        if (notif) markAsRead(notif.id);
      }}
      onClearAll={clearNotifications}
      onNotificationClick={handleNotificationClick}
    />
  );
}
