# AGENTS.md — Règles du projet

## NAVIGATION RULES

Toute navigation interactive passe par `useAppNavigation()` (`src/navigation/useAppNavigation.ts`).

### API

```ts
const { navigate, replace, goBack, goBackTo, complete, startFlow, getFlow, endFlow, setFlag, getFlag, clearFlag } = useAppNavigation();
```

- `navigate(to, opts?)` — enregistre la page courante dans la pile puis navigue. C'est la **seule** façon de peupler la pile.
- `replace(to, opts?)` — remplace l'entrée courante (completions, redirects).
- `goBack(overrideFallback?)` — retour arrière intelligent : `navigate(-1)` si pile in-app non vide ET `history.length > 1`, sinon fallback du graph en `replace`.
- `goBackTo(to)` — retour forcé vers une destination (vide la pile + replace).
- `complete({ flow?, to? })` — clôt un flux transactionnel : vide la pile, termine le flow (si fourni), `replace` vers `completion` (sinon `fallback`) du graph. `to` force une destination dynamique.
- `startFlow(key, data)` / `getFlow<T>(key)` / `endFlow(key)` — données critiques d'un flux transactionnel (remplace `location.state`).
- `setFlag(key, value)` / `getFlag(key)` / `clearFlag(key)` — marqueurs de navigation (ex. hamburger).

### Interdits

- **Interdit** `navigate(-1)` en dehors du wrapper `goBack()` (seul `useAppNavigation` l'appelle).
- **Interdit** `location.state` pour transporter des données (mission, booking, from…). Utiliser `flow` (données) ou `flags` (marqueurs). `location.search` reste autorisé pour l'état partageable.
- **Interdit** le retour par `location.state.from` : retour = `goBack()` / `complete()` / `goBackTo()`.
- **Interdit** `<Navigate>` ou `navigate` directs vers la home pour "fermer" un flux : utiliser `complete()`.
- **Interdit** d'utiliser le hook `useNavigate`/`NavigateFunction` directement dans les composants (sauf `useAppNavigation`).

### Flags standard

| Flag | Producteur | Consommateur |
|---|---|---|
| `from-hamburger` | `setFlag("from-hamburger", true)` avant `navigate` (`HamburgerDrawer`, `AppSettingsPage`) | pages abonnement/profil → `getFlag("from-hamburger")` |
| `reopen-menu` | `setFlag("reopen-menu", true)` avant `navigate("/")` (retour depuis hamburger) | `ExplorerScreen` le lit réactivement via `useNavigationStore((s) => s.flags["reopen-menu"] === true)`, rouvre le drawer, puis `clearFlag("reopen-menu")` |

Un flag est toujours consommé **et effacé** (`clearFlag`) dans le composant qui le lit.

### Graph de navigation

- `navigationGraph.ts` possède `SPACE_FALLBACK`, `resolveSpace`, `getRouteInfo`, `getFallback`, `getCompletion`, `isImmersiveRoute`.
- Chaque route du graph définit `fallback` (retour sûr) et `completion` (fin de flux transactionnel).
- Ne jamais naviguer « sauvagement » vers `/` : toujours passer par le fallback du graph.
- La pile est bornée à 30 entrées (`navigationStore.ts`), persistée en sessionStorage.

### Navigation UX

- Scroll-to-top sur clic du lien actif (lien = pathname courant → `preventDefault` + `window.scrollTo({ top: 0, behavior: "smooth" })`).

## Autres règles

- Préserver l'encodage UTF-8 des textes français (accentués), jamais de caractères `�`.
- `npm run lint` = `tsc --noEmit` ; `npm test` = `vitest run`.
