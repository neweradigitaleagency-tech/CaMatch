import { useNavigate, useLocation } from "react-router-dom";
import ClientPaymentsScreen from "../../components/ClientPaymentsScreen";

export default function ClientPaymentsPage() {
  const nav = useNavigate();
  const loc = useLocation();
  const fromHamburger = !!loc.state?.fromHamburger;
  return <ClientPaymentsScreen onBack={() => fromHamburger ? nav("/", { state: { reopenMenu: true } }) : nav(-1)} />;
}
