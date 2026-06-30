import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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
    <div className="min-h-screen bg-cm-bg">
      <div className="sticky top-0 z-10 bg-cm-bg/80 backdrop-blur-xl px-4 pt-3 pb-2">
        <button onClick={() => nav(-1)}
          className="cm-scale-btn w-8 h-8 flex items-center justify-center rounded-[12px] bg-cm-elevated hover:bg-cm-border/50 cursor-pointer shrink-0">
          <ArrowLeft className="w-4 h-4 text-cm-text" />
        </button>
      </div>
      <UnifiedOnboardingScreen
        onComplete={handleComplete}
        onSkip={() => {
          setUser("demo", "client");
          nav("/", { replace: true });
        }}
      />
    </div>
  );
}
