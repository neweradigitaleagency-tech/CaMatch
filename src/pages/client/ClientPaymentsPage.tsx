import { useNavigate } from "react-router-dom";
import ClientPaymentsScreen from "../../components/ClientPaymentsScreen";

export default function ClientPaymentsPage() {
  const nav = useNavigate();
  return <ClientPaymentsScreen onBack={() => nav(-1)} />;
}
