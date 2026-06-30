import { useNavigate, useLocation } from "react-router-dom";
import AppSettingsScreen from "../../components/AppSettingsScreen";
import { useThemeStore } from "../../stores/themeStore";

export default function AppSettingsPage() {
  const nav = useNavigate();
  const loc = useLocation();
  const fromHamburger = !!loc.state?.fromHamburger;
  const { isDark, toggle } = useThemeStore();

  const geminiApiKey = localStorage.getItem("geminiApiKey") || "";

  const handleUpdateApiKey = (key: string) => {
    localStorage.setItem("geminiApiKey", key);
  };

  return (
    <AppSettingsScreen
      isDark={isDark}
      onToggleDarkMode={toggle}
      onBack={() => fromHamburger ? nav("/", { state: { reopenMenu: true } }) : nav(-1)}
      onNavigateToHelp={() => nav("/profile/help")}
      onNavigateToNotifications={() => nav("/profile/notifications")}
      onNavigateToLanguage={() => nav("/profile/language")}
    />
  );
}
