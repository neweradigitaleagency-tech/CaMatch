import { useNavigate } from "react-router-dom";
import ProHelpScreen from "../../components/ProHelpScreen";

export default function ProHelpPage() {
  const nav = useNavigate();
  return (
    <ProHelpScreen onBack={() => nav("/profile")} />
  );
}
