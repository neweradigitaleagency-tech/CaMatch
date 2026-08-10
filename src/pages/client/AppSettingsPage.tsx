import { useLocation } from "react-router-dom";
import AppSettingsScreen from "../../components/AppSettingsScreen";
import { useAppNavigation } from "../../navigation/useAppNavigation";

export default function AppSettingsPage() {
  const loc = useLocation();
  const { goBack, navigate, getFlag, setFlag } = useAppNavigation();
  const fromHamburger = getFlag("from-hamburger");

  const handleBack = () => {
    if (fromHamburger) {
      setFlag("reopen-menu", true);
      navigate("/");
    } else {
      goBack();
    }
  };

  const handleNavigate = (path: string) => {
    if (loc.pathname === path) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setFlag("from-hamburger", true);
    navigate(path);
  };

  return (
    <AppSettingsScreen
      onBack={handleBack}
      onNavigate={handleNavigate}
      onSignOutAllDevices={async () => {
        // stub
      }}
      onClearCache={async () => {
        localStorage.clear();
        if ("caches" in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
        }
      }}
    />
  );
}
