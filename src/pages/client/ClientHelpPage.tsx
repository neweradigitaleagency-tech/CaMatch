import { useNavigate, useLocation } from "react-router-dom";
import ClientHelpScreen from "../../components/ClientHelpScreen";

export default function ClientHelpPage() {
  const nav = useNavigate();
  const loc = useLocation();
  const fromHamburger = !!loc.state?.fromHamburger;
  return <ClientHelpScreen onBack={() => fromHamburger ? nav("/", { state: { reopenMenu: true } }) : nav(-1)} />;
}
