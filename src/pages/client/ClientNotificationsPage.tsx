import { useState } from "react";
import { useAppNavigation } from "../../navigation/useAppNavigation";
import NotificationsScreen from "../../components/NotificationsScreen";
import { useNotificationStore } from "../../stores/notificationStore";

export default function ClientNotificationsPage() {
  const { navigate, setFlag } = useAppNavigation();
  const notifications = useNotificationStore((s) => s.notifications);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const clearNotification = useNotificationStore((s) => s.clearNotification);
  const [activeFilter, setActiveFilter] = useState("all");
  return (
    <NotificationsScreen
      onBack={() => { setFlag("reopen-menu", true); navigate("/") }}
      notifications={notifications.map((n) => ({ id: n.id, type: n.type, title: n.title, message: n.body, read: n.read, createdAt: n.createdAt }))}
      markAllRead={markAllRead}
      setActiveFilter={setActiveFilter}
      activeFilter={activeFilter}
      clearNotification={clearNotification}
    />
  );
}
