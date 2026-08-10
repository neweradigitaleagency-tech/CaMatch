import { useAppNavigation } from "../../navigation/useAppNavigation";
import TermsScreen from "../../components/TermsScreen";

export default function TermsPage() {
  const { goBack, navigate, getFlag, setFlag } = useAppNavigation();
  const handleBack = () => {
    if (getFlag("from-hamburger")) {
      setFlag("reopen-menu", true);
      navigate("/");
    } else {
      goBack();
    }
  };
  return <TermsScreen onBack={handleBack} />;
}
