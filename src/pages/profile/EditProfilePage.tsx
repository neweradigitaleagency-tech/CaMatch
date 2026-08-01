import { useAppNavigation } from "../../navigation/useAppNavigation";
import EditProfileScreen from "../../components/EditProfileScreen";

export default function EditProfilePage() {
  const { navigate, setFlag } = useAppNavigation();
  return <EditProfileScreen onBack={() => { setFlag("reopen-menu", true); navigate("/") }} />;
}
