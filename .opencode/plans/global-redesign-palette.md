# Plan: Appliquer la palette lime/forest à toute l'appli

## Problème
- Les 3 nouvelles screens utilisent des couleurs en dur (`#EDE8DC`, `#AECB2A`) au lieu des classes Tailwind existantes
- Le reste de l'app (55+ fichiers) utilise encore l'ancienne palette purple (`bg-cm-bg: #f6f3fa`, `bg-cm-accent: #661ddb`, etc.)
- `tokens.ts` existe mais n'est pas utilisé

## Solution
Modifier UN SEUL fichier (`src/index.css`) pour changer les variables CSS et les tokens `@theme` → toutes les classes `bg-cm-*`, `text-cm-*`, `border-cm-*` se mettent à jour automatiquement dans les 55+ fichiers.

---

## Étape 1 — `src/index.css` : remplacer la palette

### `:root` (CSS variables) et `@theme` (Tailwind v4)

| Variable | Ancienne valeur | Nouvelle valeur |
|---|---|---|
| `--cm-bg` | `#f6f3fa` | `#EDE8DC` |
| `--cm-elevated` | `#FFFFFF` | `#FFFFFF` |
| `--cm-border` | `#e5def0` | `#D4CFC4` |
| `--cm-border-soft` | `#efe9f7` | `#E2DDD2` |
| `--cm-text` | `#1f1926` | `#1A1A1A` |
| `--cm-text-soft` | `#382b47` | `#6B7280` |
| `--cm-text-muted` | `#baa1d5` | `#9CA3AF` |
| `--cm-accent` | `#661ddb` | `#AECB2A` |
| `--cm-accent-hover` | `#5518c4` | `#92A822` |
| `--cm-accent-soft` | `#f0ebf7` | `#E4EDD0` |
| `--cm-error` | `#D62828` | `#EF4444` |
| `--cm-overlay` | `rgba(31,25,38,0.35)` | `rgba(26,26,26,0.35)` |

### Dark mode (`@media prefers-color-scheme: dark`)

| Variable | Ancienne valeur | Nouvelle valeur |
|---|---|---|
| `--cm-bg` | `#121212` | `#1A1A1A` |
| `--cm-elevated` | `#1e1e1e` | `#2A2A2A` |
| `--cm-text` | `#e8e6e3` | `#EDE8DC` |
| `--cm-text-soft` | `#c4c0bb` | `#A3A3A3` |
| `--cm-accent` | `#8b5cf6` | `#AECB2A` |
| `--cm-accent-hover` | `#7c3aed` | `#92A822` |
| `--cm-accent-soft` | `#2d2a3e` | `#2A3A1A` |
| `--cm-text-muted`, `--cm-border`, `--cm-error`, `--cm-overlay` | inchangés | inchangés |

### Nouveaux tokens à ajouter dans `@theme`

```css
--radius-cm-sm: 12px;
--radius-cm-lg: 16px;
--radius-cm-xl: 20px;
--radius-cm-2xl: 24px;

--shadow-cm-card: 0 2px 12px rgba(0,0,0,0.06);
--shadow-cm-btn: 0 4px 16px rgba(174,203,42,0.35);
```

---

## Étape 2 — `src/screens/CategorySelectScreen.tsx`

Remplacer toutes les couleurs en dur :
- `background: "#EDE8DC"` → `bg-cm-bg` (sur le div parent)
- `color: "#1A1A1A"` → `text-cm-text`
- `color: "#243318"` → `text-cm-accent` (hmm, pas exact... plutôt `text-[--cm-accent]`)
- `color: "#6B7280"` → `text-cm-text-soft`
- `color: "#9CA3AF"` → `text-cm-text-muted`
- `background: "#F5F2EB"` → `bg-cm-elevated` ou `bg-cm-bg`
- `background: "#E4EDD0"` → `bg-cm-accent-soft`
- `background: "#AECB2A"` → `bg-cm-accent`
- `shadow-[0_2px_8px_rgba(0,0,0,0.10)]` → `shadow-cm-md`
- `border: 3px solid white` → `border-3 border-cm-elevated`

---

## Étape 3 — `src/screens/SearchScreen.tsx`

Mêmes remplacements que CategorySelectScreen + :
- `ringColor: "#AECB2A"` → `ring-cm-accent`
- Star fill `#F59E0B` → garder (couleur fonctionnelle, pas de marque)
- `background: linear-gradient(...)` → garder

---

## Étape 4 — `src/screens/ProviderProfileScreen.tsx`

Mêmes remplacements + :
- Gradient overlay → garder
- `text-white` → garder (sur fond sombre)

---

## Étape 5 — `src/components/ui/*.tsx` (6 composants)

Remplacer les couleurs en dur par les classes Tailwind dans :
- `TopBarIconButton.tsx`
- `PillToggle.tsx`
- `CTAButton.tsx`
- `AmenityChip.tsx`
- `InfoChip.tsx`
- `CategoryTag.tsx`

---

## Étape 6 — `src/components/map/ServiceMapCard.tsx`

Remplacer les couleurs en dur + utiliser les nouvelles classes shadow/radius.

---

## Fichiers modifiés (total : 11 fichiers)

1. `src/index.css` — palette + nouveaux tokens
2. `src/screens/CategorySelectScreen.tsx` — classes Tailwind
3. `src/screens/SearchScreen.tsx` — classes Tailwind
4. `src/screens/ProviderProfileScreen.tsx` — classes Tailwind
5. `src/components/ui/TopBarIconButton.tsx` — classes Tailwind
6. `src/components/ui/PillToggle.tsx` — classes Tailwind
7. `src/components/ui/CTAButton.tsx` — classes Tailwind
8. `src/components/ui/AmenityChip.tsx` — classes Tailwind
9. `src/components/ui/InfoChip.tsx` — classes Tailwind
10. `src/components/ui/CategoryTag.tsx` — classes Tailwind
11. `src/components/map/ServiceMapCard.tsx` — classes Tailwind

---

## Vérification

- `npx tsc --noEmit` — pas d'erreurs
- `npx vite build` — build réussi
- Navigation visuelle : `/explorer/categories`, `/explorer/search`, `/explorer/design-provider/p1`
- Vérifier que les pages existantes (HomePage, OrdersPage, etc.) utilisent bien les nouvelles couleurs
