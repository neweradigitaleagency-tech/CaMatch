import { useAppNavigation } from "../../navigation/useAppNavigation";
import ClientPaymentsScreen from "../../components/ClientPaymentsScreen";

export default function ClientPaymentsPage() {
  const { navigate, setFlag } = useAppNavigation();
  return <ClientPaymentsScreen onBack={() => { setFlag("reopen-menu", true); navigate("/") }} />;
}
