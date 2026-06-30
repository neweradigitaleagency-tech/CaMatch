import { useNavigate, useLocation } from "react-router-dom";
import ProfileSecurityScreen from "../../components/ProfileSecurityScreen";

export default function SecurityPage() {
  const nav = useNavigate();
  const loc = useLocation();
  const fromHamburger = !!loc.state?.fromHamburger;
  return <ProfileSecurityScreen onBack={() => fromHamburger ? nav("/", { state: { reopenMenu: true } }) : nav(-1)} />;
}
