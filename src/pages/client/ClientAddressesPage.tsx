import { useAppNavigation } from "../../navigation/useAppNavigation";
import ClientAddressesScreen from "../../components/ClientAddressesScreen";

export default function ClientAddressesPage() {
  const { navigate, setFlag } = useAppNavigation();
  return <ClientAddressesScreen onBack={() => { setFlag("reopen-menu", true); navigate("/") }} />;
}
