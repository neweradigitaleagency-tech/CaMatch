import { useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export function useBackNavigation(fallbackRoute: string) {
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(() => {
    const from = (location.state as { from?: string })?.from;
    navigate(from || fallbackRoute, { replace: true });
  }, [navigate, location.state, fallbackRoute]);
}

