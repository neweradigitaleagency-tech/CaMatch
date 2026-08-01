import type { StackEntry } from "./navigationStore";
import {
  getCompletion,
  getFallback,
  getRouteInfo,
  resolveSpace,
  SPACE_FALLBACK,
} from "./navigationGraph";
import type { RouteRole } from "./navigationGraph";

/**
 * Navigation service — résout l'action de retour.
 *
 * Décision (validée) :
 * 1. Pile in-app non vide ET `window.history.length > 1` → `navigate(-1)`.
 *    (la pile explicite juge « il y a une page précédente » ; history.length
 *    est une garde contre un saut hors de l'app ou une ouverture directe)
 * 2. Sinon → fallback du graph en `replace` (jamais de retour sauvage vers "/").
 */

export type BackAction =
  | { kind: "back"; target?: string }
  | { kind: "fallback"; to: string; replace: boolean };

export { resolveSpace };

/**
 * Résout l'action de retour pour un pathname donné.
 *
 * @param pathname  chemin courant (route du graph)
 * @param stack     pile in-app (navigationStore)
 * @param historyLength `window.history.length`
 */
export function resolveBackAction(
  pathname: string,
  stack: StackEntry[],
  historyLength: number
): BackAction {
  const hasInAppHistory = stack.length > 0;
  const canGoBack = hasInAppHistory && historyLength > 1;

  if (canGoBack) {
    return { kind: "back" };
  }

  const info = getRouteInfo(pathname);
  const to = info?.fallback ?? SPACE_FALLBACK[resolveSpace(pathname)];
  return { kind: "fallback", to, replace: true };
}

/**
 * Résout la destination de clôture d'un flux transactionnel (`complete`).
 *
 * 1. `to` forcée (destination dynamique) si fournie.
 * 2. Sinon `completion` du graph (fin de flux transactionnel).
 * 3. Sinon `fallback` du graph (jamais de retour sauvage vers "/").
 */
export function resolveCompleteDestination(pathname: string, to?: string): string {
  if (to) return to;
  return getCompletion(pathname) ?? getFallback(pathname);
}

/**
 * Dit si la navigation courante doit être enregistrée dans la pile.
 * On enregistre tout sauf les départs directs (le premier hit d'une
 * session de pile) — la pile est alimentée par le composant qui affiche
 * la page, qui appelle `recordNavigation` avant de rendre le contenu.
 */
export function shouldRecordNavigation(pathname: string): boolean {
  return !pathname.startsWith("/admin/login");
}
