import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { isClientOnboardingCompleted, useClientOnboardingStore } from "../stores/clientOnboardingStore";
import UnifiedOnboardingScreen from "../components/onboarding/UnifiedOnboardingScreen";

export default function OnboardingPage() {
  const nav = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const skipRedirect = useRef(false);

  const completed = isClientOnboardingCompleted();

  useEffect(() => {
    if (!skipRedirect.current && isAuthenticated && completed && location.pathname === "/onboarding") {
      nav("/", { replace: true });
    }
  }, [isAuthenticated, completed, location.pathname, nav]);

  const goToClient = () => {
    skipRedirect.current = true;
    useClientOnboardingStore.getState().markComplete();
    nav("/", { replace: true });
  };

  return <UnifiedOnboardingScreen onComplete={goToClient} />;
}
