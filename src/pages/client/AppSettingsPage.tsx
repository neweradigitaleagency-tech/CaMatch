import { useNavigate, useLocation } from "react-router-dom";
import { useBackNavigation } from "../../hooks/useBackNavigation";
import AppSettingsScreen from "../../components/AppSettingsScreen";

export default function AppSettingsPage() {
  const nav = useNavigate();
  const goBack = useBackNavigation("/orders");
  const loc = useLocation();
  const fromHamburger = !!loc.state?.fromHamburger;

  const handleBack = () => {
    if (fromHamburger) {
      nav("/", { state: { reopenMenu: true } });
    } else {
      goBack();
    }
  };

  const handleNavigate = (path: string) => {
    if (loc.pathname === path) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    nav(path, { state: { fromHamburger: true } });
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
