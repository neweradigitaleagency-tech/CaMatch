import { useNavigate } from "react-router-dom";
import ProEditProfileScreen from "../../components/ProEditProfileScreen";
import { MOCK_PROS } from "../../services/mockData";

export default function ProEditPage() {
  const nav = useNavigate();
  return (
    <ProEditProfileScreen
      pro={MOCK_PROS[0]}
      onSave={() => nav("/profile")}
      onBack={() => nav("/profile")}
    />
  );
}
