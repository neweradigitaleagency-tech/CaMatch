# Ça Match — Marché de Services de Confiance

## Stack
- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** v3 avec design tokens personnalisés
- **Zustand** (état) + **React Query** (données serveur)
- **Framer Motion** (animations)
- **Supabase** (auth, DB, storage)
- **Prisma 5** (ORM PostgreSQL)
- **next-pwa** (installable, offline)

## Pages
- `/` — Accueil (recherche, catégories, pros recommandés)
- `/search` — Résultats de recherche avec filtres
- `/pro/[id]` — Profil professionnel (score, portfolio, avis)
- `/dashboard` — Tableau de bord pro (stats, notifications)
- `/login` — Authentification par téléphone (OTP)

## Composants clés
- `BottomNav` — Navigation mobile fixed bottom
- `TrustScoreBar` — Barre de score de confiance colorée
- `Avatar` — Avec anneau de vérification
- `Badge`, `BadgeLevel`, `VerificationBadge` — Badges système
- `StarRating` — Évaluation par étoiles
- `Header` — Header sticky avec options

## Design System
- Couleur primaire: Émeraude (#10B981)
- Secondaire: Ambre (#F59E0B)
- Typographie: Inter
- Bordures arrondies, ombres douces
- Animations fluides (cubic-bezier custom)

## Commandes
```bash
npm run dev     # Développement
npm run build   # Build production
npm run start   # Serveur production
npx prisma db push  # Sync DB
npx prisma studio   # Visualiser DB
```

## MCP (Supabase)
Serveur MCP Supabase configuré dans `~/.config/opencode/opencode.jsonc`
