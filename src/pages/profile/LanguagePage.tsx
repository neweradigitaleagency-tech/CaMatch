import { useNavigate } from "react-router-dom";
import ProfileLanguageScreen from "../../components/ProfileLanguageScreen";

export default function LanguagePage() {
  const nav = useNavigate();
  return <ProfileLanguageScreen onBack={() => nav(-1)} />;
}
