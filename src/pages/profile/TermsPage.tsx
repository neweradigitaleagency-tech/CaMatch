import { useNavigate } from "react-router-dom";
import TermsScreen from "../../components/TermsScreen";

export default function TermsPage() {
  const nav = useNavigate();
  return <TermsScreen onBack={() => nav(-1)} />;
}
