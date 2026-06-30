import { useNavigate, useLocation } from "react-router-dom";
import ClientAddressesScreen from "../../components/ClientAddressesScreen";

export default function ClientAddressesPage() {
  const nav = useNavigate();
  const loc = useLocation();
  const fromHamburger = !!loc.state?.fromHamburger;
  return <ClientAddressesScreen onBack={() => fromHamburger ? nav("/", { state: { reopenMenu: true } }) : nav(-1)} />;
}
