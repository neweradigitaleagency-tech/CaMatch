import { useAppNavigation } from "../../navigation/useAppNavigation";
import ProfileSecurityScreen from "../../components/ProfileSecurityScreen";

export default function SecurityPage() {
  const { navigate, setFlag } = useAppNavigation();
  return <ProfileSecurityScreen onBack={() => { setFlag("reopen-menu", true); navigate("/") }} />;
}
