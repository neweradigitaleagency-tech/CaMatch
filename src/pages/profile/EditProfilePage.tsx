import { useNavigate } from "react-router-dom";
import EditProfileScreen from "../../components/EditProfileScreen";

export default function EditProfilePage() {
  const nav = useNavigate();
  return <EditProfileScreen onBack={() => nav(-1)} />;
}
