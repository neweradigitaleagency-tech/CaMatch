import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import UnifiedOnboardingScreen from "../components/onboarding/UnifiedOnboardingScreen";

export default function OnboardingPage() {
  const nav = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const setPro = useAuthStore((s) => s.setPro);

  const goToClient = () => {
    setUser("demo", "client");
    nav("/", { replace: true });
  };

  const goToPro = () => {
    setUser("demo", "client");
    setPro();
    nav("/pro/dashboard", { replace: true });
  };

  const goToSupplier = () => {
    setUser("supplier-1", "client");
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
