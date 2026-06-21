import { useNavigate } from "react-router-dom";
import ClientAddressesScreen from "../../components/ClientAddressesScreen";

export default function ClientAddressesPage() {
  const nav = useNavigate();
  return <ClientAddressesScreen onBack={() => nav(-1)} />;
}
