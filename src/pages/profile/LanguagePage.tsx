import { useNavigate, useLocation } from "react-router-dom";
import ProfileLanguageScreen from "../../components/ProfileLanguageScreen";

export default function LanguagePage() {
  const nav = useNavigate();
  const loc = useLocation();
  const fromHamburger = !!loc.state?.fromHamburger;
  return <ProfileLanguageScreen onBack={() => fromHamburger ? nav("/", { state: { reopenMenu: true } }) : nav(-1)} />;
}
