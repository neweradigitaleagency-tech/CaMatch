import { useNavigate } from "react-router-dom";
import { useBackNavigation } from "../../hooks/useBackNavigation";
import TermsScreen from "../../components/TermsScreen";

export default function TermsPage() {
  const nav = useNavigate();
  const goBack = useBackNavigation("/profile");
  return <TermsScreen onBack={goBack} />;
}
