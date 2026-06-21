import { useNavigate } from "react-router-dom";
import ClientHelpScreen from "../../components/ClientHelpScreen";

export default function ClientHelpPage() {
  const nav = useNavigate();
  return <ClientHelpScreen onBack={() => nav(-1)} />;
}
