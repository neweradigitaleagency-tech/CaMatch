# Marketplace UI Kit

Référence design pour toutes les pages du marketplace Ça Match.

---

## 1. Couleurs

### Palette principale

| Token | Valeur | Usage |
|-------|--------|-------|
| `cm-bg` | `#EDE8DC` | Fond de page (blanc cassé chaud) |
| `cm-elevated` | `#FFFFFF` | Cartes, surfaces surélevées |
| `cm-surface` | `#F5F2EB` | Inputs, fond subtil |
| `cm-border` | `#D8D2C4` | Bordures standards |
| `cm-border-soft` | `#F0ECE4` | Bordures légères |

### Texte

| Token | Valeur | Usage |
|-------|--------|-------|
| `cm-text` | `#1A1A1A` | Texte principal |
| `cm-text-soft` | `#6B7280` | Texte secondaire |
| `cm-text-muted` | `#9CA3AF` | Texte subtil, placeholders |

### Accent

| Token | Valeur | Usage |
|-------|--------|-------|
| `cm-accent` | `#AECB2A` | Vert lime (CTA, badges actifs) |
| `cm-forest` | `#243318` | Vert forêt (texte sur accent) |
| `cm-amber` | `#F59E0B` | Étoiles, warnings |
| `cm-error` | `#EF4444` | Erreurs, badges rouge |
| `cm-green` | `#7FD356` | Vérification, succès |

---

## 2. Typographie

| Classe | Taille | Poids | Line-height | Usage |
|--------|--------|-------|-------------|-------|
| `h1-cm` | 24px | 700 | 32px | Titre de page |
| `h2-cm` | 18px | 600 | 24px | Titre de page (alternatif) |
| `h3-cm` | 16px | 600 | 22px | Titres de cartes |
| `body-cm` | 14px | 400 | 20px | Texte corps |
| `label-cm` | 12px | 500 | 16px | Labels, prix |
| `caption-cm` | 12px | 400 | 16px | Captions |
| `meta-cm` | 11px | 500 | 14px | Métadonnées, badges |

### Sections

- **Titre de section** : `text-sm font-bold text-cm-text` (Tailwind direct, 14px/700)
- **Sous-titre** : `text-[11px] font-semibold text-cm-text-soft`
- **Titre de carte** : `h3-cm` (16px/600)
- **Prix** : `label-cm font-bold text-cm-text` (12px/500)

---

## 3. Espacements

### Padding page

| Contexte | Classe |
|----------|--------|
| Padding horizontal standard | `px-5` (20px) |
| Padding section verticale | `mb-6` (24px) |
| Padding entre sections | `pt-6` ou `mb-6` (24px) |

### Gaps

| Contexte | Classe |
|----------|--------|
| Grille de cartes | `gap-3` (12px) |
| Scroll horizontal cartes | `gap-3` (12px) |
| Chips/filtres | `gap-2` (8px) |
| Inline items | `gap-1.5` ou `gap-2` |
| Badge + texte | `gap-1` (4px) |

### Marges

| Élément | Marge |
|---------|-------|
| Titre de section → contenu | `mb-3` (12px) |
| Après un bloc complet | `mb-6` (24px) |
| Search bar → chips | `mt-3` (12px) |
| Chips → filtres | `mt-3` (12px) |

---

## 4. Coins arrondis

| Token | Valeur | Usage |
|-------|--------|-------|
| `--radius-cm` | 14px | Boutons, inputs |
| `--radius-cm-lg` | 16px | Cartes simples |
| `--radius-cm-xl` | 20px | Cartes principales |
| `--radius-cm-2xl` | 24px | Cartes grandes, bento |
| `--radius-cm-card` | 20px | Standard cartes |
| `--radius-cm-full` | 9999px | Chips, badges, pills |

---

## 5. Ombres

| Token | Valeur | Usage |
|-------|--------|-------|
| `shadow-cm-card` | `0 2px 16px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.02)` | Cartes au repos |
| `shadow-cm-card-hov` | `0 6px 24px rgba(0,0,0,0.08)` | Cartes au survol |
| `shadow-cm-sm` | `0 1px 3px rgba(0,0,0,0.04)` | Éléments subtils |
| `shadow-cm-md` | `0 4px 16px rgba(0,0,0,0.06)` | Dropdowns, modals |
| `shadow-cm-btn` | `0 4px 16px rgba(174,203,42,0.30)` | Bouton CTA primaire |

---

## 6. Images

### Ratios

| Type | Ratio | Classe |
|------|-------|--------|
| Image produit (carte) | 1:1 | `aspect-square` |
| Bannière boutique | 16:9 | `aspect-video` |
| Avatar / logo boutique | 1:1 | `w-16 h-16 rounded-xl` |
| Image catégorie (grille) | 1:1 | `aspect-square` |

### Tailles

| Élément | Taille |
|---------|--------|
| Logo boutique dans carte | `w-16 h-16` (64px) |
| Logo boutique featured | `w-16 h-16` (64px) |
| Icône catégorie tile | `w-9 h-9` (36px) |

### Bordure

- Logo boutique : `border-[2px] border-white`
- Images : `object-cover`

---

## 7. Composants

### 7.1 Carte produit (`CatalogProductCard`)

**Mode vertical (grid) :**
- Container : `bg-cm-elevated border border-cm-border rounded-2xl overflow-hidden`
- Ombre : `shadow-cm-card hover:shadow-cm-card-hov`
- Image : `aspect-square`
- Contenu : `p-3`
- Badge catégorie : `text-[9px] font-medium px-2 py-0.5 rounded-full bg-cm-accent/20 text-cm-forest`
- Prix : `label-cm font-bold`

**Mode horizontal (liste) :**
- Container : `flex gap-3 items-center bg-cm-elevated border border-cm-border rounded-2xl p-3`
- Thumbnail : `w-16 h-16 rounded-xl shrink-0`

### 7.2 Carte boutique (`CatalogSupplierCard`)

- Container : `bg-cm-elevated border border-cm-border rounded-2xl overflow-hidden`
- Bannière : `aspect-video` avec gradient overlay
- Logo : `w-16 h-16 rounded-xl border-[2px] border-white`
- Nom : `h3-cm` (16px/600) avec `line-clamp-1`
- Badge vérification : `BadgeCheck` lucide, `w-4 h-4 text-cm-green`
- Rating : `meta-cm` avec étoile remplie `text-cm-amber`
- Catégories : `meta-cm` badges `bg-cm-accent/20 text-cm-forest`
- Bottom bar : séparateur `border-t border-cm-border/50`
- Taille parent : `shrink-0 w-[80vw] sm:w-72 md:w-80`

### 7.3 Carte catégorie (grille)

- Container : `rounded-2xl bg-cm-elevated border border-cm-border overflow-hidden`
- Background : gradient par verticale (`bg-gradient-to-br`)
- Contenu : `aspect-square p-3 flex flex-col justify-between`
- Icône : `w-9 h-9 rounded-xl bg-white/80 backdrop-blur-sm`
- Texte : `text-[11px] font-bold` + `text-[9px] text-cm-text-soft`

### 7.4 Carte promotion

- Même structure que carte produit vertical
- Affichée dans un scroll horizontal `shrink-0 w-36`

---

## 8. Boutons

### Primaire (CTA principal)

```
bg-cm-text text-white text-[11px] font-bold rounded-xl
h-9 px-4
active:scale-[0.97]
hover:bg-[#2A2A2A]
```

### Secondaire (outline)

```
bg-cm-elevated border border-cm-border text-cm-text
text-[11px] font-semibold rounded-xl
h-10 px-6
hover:border-gray-300
```

### Ghost (filtres, chips)

```
bg-cm-elevated border border-cm-border text-cm-text-soft
text-[11px] font-semibold rounded-full
px-3.5 py-1.5
```

### Chip actif

```
bg-cm-text text-white
text-[11px] font-semibold rounded-full
px-3.5 py-1.5
```

### Chip filtre actif

```
bg-cm-accent text-cm-forest
text-[11px] font-bold rounded-full
px-3 py-1
```

### "Voir tout" / "Voir toutes"

```
text-[11px] font-semibold text-cm-text-soft
hover:text-cm-text
flex items-center gap-0.5
```

**Comportement expand in-place :**
- Clic sur "Voir toutes" → le scroll horizontal se transforme en grille `grid-cols-2`
- Le bouton bascule entre "Voir toutes" et "Voir moins"
- Utilise un state `showAllBoutiques` / `showAllPopulaires`
- Le state reset au changement de verticale

### Recherches tendance (Trending chips)

```
flex gap-2 overflow-x-auto no-scrollbar mt-2 -mx-5 px-5
```

- Icône 🔥 en préfixe
- Chips : `shrink-0 px-3 py-1 rounded-full bg-cm-accent/10 text-cm-forest text-[11px] font-medium`
- Affichées uniquement quand pas de recherche active et pas de filtres
- Max 6 chips visibles
- Track les recherches via Supabase `search_analytics` table

### Icônes

- Taille standard : `w-4 h-4` (16px)
- Icônes petites : `w-3 h-3` (12px)
- Icônes de section : `w-4 h-4` avec couleur thématique
- Icônes de badge : `w-2.5 h-2.5` à `w-3 h-3`

---

## 9. Grille

### Scroll horizontal

```html
<div class="flex gap-3 overflow-x-auto no-scrollbar pb-1 pr-8">
  <div class="shrink-0 w-[80vw] sm:w-72 md:w-80"> <!-- cartes boutique -->
  <div class="shrink-0 w-36"> <!-- cartes promo -->
</div>
```

### Grille produits (2 colonnes)

```html
<div class="grid grid-cols-2 gap-3">
```

### Grille catégories (3 colonnes)

```html
<div class="grid grid-cols-3 gap-3">
```

### Responsive breakpoints

| Breakpoint | Taille | Comportement |
|------------|--------|--------------|
| xs | 360px | Mobile petit |
| sm | 640px | Mobile standard |
| md | 768px | Tablette |
| lg | 1024px | Desktop |

---

## 10. Badges

### Catégorie produit

```
text-[9px] font-medium px-2 py-0.5 rounded-full
bg-cm-accent/20 text-cm-forest
```

### Vérification boutique

```
BadgeCheck lucide icon
w-4 h-4 text-cm-green
```

### Badge compteur (panier, filtres)

```
min-w-[18px] h-[18px] flex items-center justify-center
bg-cm-error text-white text-[9px] font-bold rounded-full px-1
```

### Badge prix barré

```
text-[11px] text-cm-text-soft line-through
```

### Badge pourcentage réduction

```
text-[10px] font-bold text-cm-error
```

---

## 11. Structure de page Marketplace

### Ordre des sections

1. **PageHeader** — Titre "Marketplace", bouton retour, panier, vendre
2. **Barre de recherche** — Input avec icône Search
3. **Chips verticaux** — Tous, Construction, Shopping, Seconde main, Immobilier, Automobile
4. **Recherches tendance** — Chips 🔥 (si disponibles, pas de recherche active)
5. **Filtres** — Tri + Filtres + compteur
6. **Boutiques recommandées** — Scroll horizontal → expand grille, "Voir toutes / Voir moins"
7. **En promotion** — Scroll horizontal, cartes w-36
8. **Explorer par catégorie** — Grille 3 colonnes
9. **Populaires** — Grille 2 colonnes → expand complète, "Voir tout / Voir moins"
10. **Tous les produits** — Grille 2 colonnes + pagination
11. **CTA Banners** — Vendre + Fournisseur

### Règles d'affichage

- Les sections 6-9 ne s'affichent que quand `isBrowsing` (pas de recherche active)
- La section 4 ne s'affiche que quand `isBrowsing` ET pas de filtres actifs ET trending > 0
- La section 10 s'affiche toujours
- La section 11 ne s'affiche que quand `isBrowsing`
- Les filtres (section 5) s'affichent toujours
- Les states `showAllBoutiques` et `showAllPopulaires` reset au changement de verticale

---

## 12. Animations

| Animation | Usage |
|-----------|-------|
| `fade-up` | Entrée de cartes |
| `scale-in` | Apparition d'éléments |
| `active:scale-[0.97]` | Pression boutons |
| `active:scale-[0.99]` | Pression cartes |
| `transition-all` | Changements d'état |
| `animate-pulse` | Skeletons de chargement |

---

## 13. Fichiers sources

| Fichier | Rôle |
|---------|------|
| `src/index.css` | Tokens CSS, utilities, animations |
| `src/design/tokens.ts` | Tokens TypeScript |
| `src/types/marketplace.ts` | Types, labels, icônes des verticales |
| `src/data/marketplaceCategories.ts` | Arbre de catégories |
| `src/components/marketplace/CatalogProductCard.tsx` | Carte produit |
| `src/components/marketplace/CatalogSupplierCard.tsx` | Carte boutique |
| `src/pages/CatalogPage.tsx` | Page principale Marketplace |
| `src/services/searchAnalytics.ts` | Tracking recherches (Supabase) |
| `src/hooks/useTrendingSearches.ts` | Hook tendances |
| `supabase/migrations/20260728_search_analytics.sql` | Migration Supabase |
