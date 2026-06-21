import { useNavigate } from "react-router-dom";
import AppSettingsScreen from "../../components/AppSettingsScreen";
import { useThemeStore } from "../../stores/themeStore";

export default function AppSettingsPage() {
  const nav = useNavigate();
  const { isDark, toggle } = useThemeStore();

  const geminiApiKey = localStorage.getItem("geminiApiKey") || "";

  const handleUpdateApiKey = (key: string) => {
    localStorage.setItem("geminiApiKey", key);
  };

  return (
    <AppSettingsScreen
      isDark={isDark}
      geminiApiKey={geminiApiKey}
      onToggleDarkMode={toggle}
      onUpdateApiKey={handleUpdateApiKey}
      onBack={() => nav(-1)}
      onNavigateToHelp={() => nav("/profile/help")}
    />
  );
}
