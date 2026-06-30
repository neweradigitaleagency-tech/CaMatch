import { useNavigate, useLocation } from "react-router-dom";
import EditProfileScreen from "../../components/EditProfileScreen";

export default function EditProfilePage() {
  const nav = useNavigate();
  const loc = useLocation();
  const fromHamburger = !!loc.state?.fromHamburger;
  return <EditProfileScreen onBack={() => fromHamburger ? nav("/", { state: { reopenMenu: true } }) : nav(-1)} />;
}
