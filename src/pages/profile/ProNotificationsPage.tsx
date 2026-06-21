import { useNavigate } from "react-router-dom";
import ProNotificationSettingsScreen from "../../components/ProNotificationSettingsScreen";
import { MOCK_NOTIFICATION_PREFS } from "../../services/mockData";

export default function ProNotificationsPage() {
  const nav = useNavigate();
  return (
    <ProNotificationSettingsScreen
      preferences={MOCK_NOTIFICATION_PREFS}
      onUpdate={() => {}}
      onBack={() => nav("/profile")}
    />
  );
}
