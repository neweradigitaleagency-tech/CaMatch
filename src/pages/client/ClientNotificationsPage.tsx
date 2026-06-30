import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NotificationsScreen from "../../components/NotificationsScreen";
import { useNotificationStore } from "../../stores/notificationStore";

export default function ClientNotificationsPage() {
  const nav = useNavigate();
  const loc = useLocation();
  const fromHamburger = !!loc.state?.fromHamburger;
  const notifications = useNotificationStore((s) => s.notifications);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const clearNotification = useNotificationStore((s) => s.clearNotification);
  const [activeFilter, setActiveFilter] = useState("all");
  return (
    <NotificationsScreen
      onBack={() => fromHamburger ? nav("/", { state: { reopenMenu: true } }) : nav(-1)}
      notifications={notifications.map((n) => ({ id: n.id, type: n.type, title: n.title, message: n.body, read: n.read, createdAt: n.createdAt }))}
      markAllRead={markAllRead}
      setActiveFilter={setActiveFilter}
      activeFilter={activeFilter}
      clearNotification={clearNotification}
    />
  );
}
