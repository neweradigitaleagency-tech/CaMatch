import { useCallback } from "react";
import { useAppNavigation } from "./useAppNavigation";

/**
 * Wrapper rétro-compatible pour `useBackNavigation`.
 *
 * Retour arrière intelligent : `navigate(-1)` si la pile in-app est non vide,
 * sinon fallback en `replace`. Le fallback passé en argument est un OVERRIDE
 * qui ne s'applique QUE lorsque la pile est vide — il ne détruit pas une
 * pile existante (retour pas-à-pas préservé). Aucun `navigate(-1)` direct :
 * tout passe par `goBack()`.
 *
 * @param overrideFallback destination forcée quand la pile est vide
 *   (optionnel — préférer le graph).
 */
export function useBackNavigation(overrideFallback?: string) {
  const { goBack } = useAppNavigation();

  return useCallback(() => {
    goBack(overrideFallback);
  }, [goBack, overrideFallback]);
}
