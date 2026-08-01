import { useCallback } from "react";
import { useAppNavigation } from "./useAppNavigation";

/**
 * Wrapper rétro-compatible pour `useBackNavigation`.
 *
 * Les ~66 sites existants continuent de fonctionner sans modification :
 * le fallback passé en argument reste un OVERRIDE — sinon c'est le graph
 * qui décide. Aucun `navigate(-1)` direct : tout passe par `goBack()`.
 *
 * @param overrideFallback destination forcée (optionnel — préférer le graph).
 */
export function useBackNavigation(overrideFallback?: string) {
  const { goBack, goBackTo } = useAppNavigation();

  return useCallback(() => {
    if (overrideFallback) {
      goBackTo(overrideFallback);
    } else {
      goBack();
    }
  }, [goBack, goBackTo, overrideFallback]);
}
