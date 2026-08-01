import { useAppNavigation } from "../../navigation/useAppNavigation";
import ClientHelpScreen from "../../components/ClientHelpScreen";

export default function ClientHelpPage() {
  const { navigate, setFlag } = useAppNavigation();
  return <ClientHelpScreen onBack={() => { setFlag("reopen-menu", true); navigate("/") }} />;
}
