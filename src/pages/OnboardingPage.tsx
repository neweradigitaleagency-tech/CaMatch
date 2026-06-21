import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import UnifiedOnboardingScreen from "../components/onboarding/UnifiedOnboardingScreen";

export default function OnboardingPage() {
  const nav = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  const handleComplete = () => {
    setUser("demo", "client");
    nav("/", { replace: true });
  };

  return (
    <UnifiedOnboardingScreen
      onComplete={handleComplete}
      onSkip={() => {
        setUser("demo", "client");
        nav("/", { replace: true });
      }}
    />
  );
}
