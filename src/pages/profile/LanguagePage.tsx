import { useAppNavigation } from "../../navigation/useAppNavigation";
import ProfileLanguageScreen from "../../components/ProfileLanguageScreen";

export default function LanguagePage() {
  const { navigate, setFlag } = useAppNavigation();
  return <ProfileLanguageScreen onBack={() => { setFlag("reopen-menu", true); navigate("/") }} />;
}
