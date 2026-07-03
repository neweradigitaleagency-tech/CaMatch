import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { useProOnboardingStore } from "../stores/proOnboardingStore";

export default function ProOnboardingPage() {
  const setPro = useAuthStore((s) => s.setPro);
  const submit = useProOnboardingStore((s) => s.submit);
  const initialized = useProOnboardingStore((s) => s.initialized);
  const initialize = useProOnboardingStore((s) => s.initialize);

  useEffect(() => {
    if (!initialized) initialize();
    submit();
    setPro();
  }, [initialized, initialize, submit, setPro]);

  return <Navigate to="/pro/dashboard" replace />;
}
