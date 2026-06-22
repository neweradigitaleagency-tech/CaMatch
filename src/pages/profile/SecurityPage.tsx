import { useNavigate } from "react-router-dom";
import ProfileSecurityScreen from "../../components/ProfileSecurityScreen";

export default function SecurityPage() {
  const nav = useNavigate();
  return <ProfileSecurityScreen onBack={() => nav(-1)} />;
}
