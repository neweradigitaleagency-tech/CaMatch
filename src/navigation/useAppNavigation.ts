import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { NavigateOptions, To } from "react-router-dom";
import { useNavigationStore } from "./navigationStore";
import { resolveBackAction, resolveCompleteDestination } from "./navigationService";

/**
 * Hook d'accès unique à l'engine de navigation.
 *
 * - `navigate(to, opts)` — enregistre la page courante dans la pile puis
 *   navigue. C'est la SEULE façon de peupler la pile (les `<Link>`/`<NavLink>`
 *   déclaratifs ne la peuplent pas → leur retour = fallback du graph).
 * - `replace(to, opts)` — remplace l'entrée courante (completions).
 * - `goBack(overrideFallback?)` — retour arrière intelligent :
 *   `navigate(-1)` si la pile in-app est non vide, sinon fallback du graph
 *   en `replace` (l'override prime sur le fallback du graph).
 * - `complete({ flow?, to? })` — clôt un flux transactionnel : vide la pile,
 *   termine le flow (si `flow`), puis `replace` vers la destination de fin
 *   du graph (`completion`), sinon le fallback du graph. `to` force une
 *   destination dynamique (ex. `/marketplace/order/confirm/:orderId`).
 * - `startFlow/getFlow/endFlow` — données critiques d'un flux transactionnel.
 * - `setFlag/getFlag/clearFlag` — marqueurs de navigation (ex. hamburger).
 */

export function useAppNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const stack = useNavigationStore((s) => s.stack);
  const push = useNavigationStore((s) => s.push);
  const pop = useNavigationStore((s) => s.pop);
  const clearStack = useNavigationStore((s) => s.clearStack);
  const setFlow = useNavigationStore((s) => s.setFlow);
  const getFlow = useNavigationStore((s) => s.getFlow);
  const clearFlow = useNavigationStore((s) => s.clearFlow);
  const setFlag = useNavigationStore((s) => s.setFlag);
  const getFlag = useNavigationStore((s) => s.getFlag);
  const clearFlag = useNavigationStore((s) => s.clearFlag);

  const record = useCallback(
    (path: string, search?: string) => {
      push({ path, search });
    },
    [push]
  );

  const nav = useCallback(
    (to: To, opts?: NavigateOptions) => {
      record(location.pathname, location.search);
      navigate(to, opts);
    },
    [location.pathname, location.search, record, navigate]
  );

  const replace = useCallback(
    (to: string, opts?: NavigateOptions) => {
      navigate(to, { ...opts, replace: true });
    },
    [navigate]
  );

  const goBack = useCallback((overrideFallback?: string) => {
    const action = resolveBackAction(
      location.pathname,
      stack,
      window.history.length,
      overrideFallback
    );
    if (action.kind === "back") {
      pop();
      navigate(-1);
    } else {
      clearStack();
      navigate(action.to, { replace: true });
    }
  }, [location.pathname, stack, pop, clearStack, navigate]);

  /** Retour forcé vers une destination (override du fallback du graph). */
  const goBackTo = useCallback(
    (to: string) => {
      clearStack();
      navigate(to, { replace: true });
    },
    [clearStack, navigate]
  );

  const startFlow = useCallback(
    (key: string, data?: unknown) => setFlow(key, data),
    [setFlow]
  );
  const flowData = useCallback(
    <T,>(key: string): T | undefined => getFlow<T>(key),
    [getFlow]
  );
  const endFlow = useCallback((key: string) => clearFlow(key), [clearFlow]);

  /** Clôt un flux transactionnel (destination du graph ou `to` forcée). */
  const complete = useCallback(
    (opts?: { flow?: string; to?: string }) => {
      if (opts?.flow) clearFlow(opts.flow);
      clearStack();
      const destination = resolveCompleteDestination(location.pathname, opts?.to);
      navigate(destination, { replace: true });
    },
    [location.pathname, navigate, clearStack, clearFlow]
  );

  return {
    navigate: nav,
    replace,
    goBack,
    goBackTo,
    complete,
    startFlow,
    getFlow: flowData,
    endFlow,
    setFlag,
    getFlag,
    clearFlag,
  };
}
