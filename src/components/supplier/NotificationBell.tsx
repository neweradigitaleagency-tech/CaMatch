import { useRealtimeNotifications } from "../../contexts/RealtimeNotificationsContext";
import SharedNotificationBell from "../ui/NotificationBell";

export default function SupplierNotificationBell() {
  const { unreadCount, setPanelOpen, panelOpen } = useRealtimeNotifications();

  return (
    <SharedNotificationBell
      unreadCount={unreadCount}
      onClick={() => setPanelOpen(!panelOpen)}
      variant="supplier"
    />
  );
}
