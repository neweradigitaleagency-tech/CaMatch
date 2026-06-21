import { useNavigate } from "react-router-dom";
import ClientNotificationsScreen from "../../components/ClientNotificationsScreen";

export default function ClientNotificationsPage() {
  const nav = useNavigate();
  return <ClientNotificationsScreen onBack={() => nav(-1)} />;
}
