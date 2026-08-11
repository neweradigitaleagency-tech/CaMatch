import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { isSupabaseReady } from "../services/supabase";
import UnifiedOnboardingScreen from "../components/onboarding/UnifiedOnboardingScreen";

export default function OnboardingPage() {
  const nav = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const skipRedirect = useRef(false);

  useEffect(() => {
    if (!skipRedirect.current && isAuthenticated && location.pathname === "/onboarding") {
      nav("/", { replace: true });
    }
  }, [isAuthenticated, location.pathname, nav]);

  const goToClient = () => {
    skipRedirect.current = true;
    if (!isSupabaseReady() && !useAuthStore.getState().isAuthenticated) {
      useAuthStore.getState().setUser("demo", "client");
    }
    nav("/", { replace: true });
  };

  const goToPro = () => {
    skipRedirect.current = true;
    useAuthStore.getState().setUser("demo", "client");
    useAuthStore.getState().setPro();
    nav("/pro/dashboard", { replace: true });
  };

  const goToSupplier = () => {
    skipRedirect.current = true;
    useAuthStore.getState().setUser("supplier-1", "client");
    nav("/supplier/dashboard", { replace: true });
  };

  return (
    <UnifiedOnboardingScreen
      onComplete={goToClient}
      onDemoClient={goToClient}
      onDemoPro={goToPro}
      onDemoSupplier={goToSupplier}
    />
  );
}
