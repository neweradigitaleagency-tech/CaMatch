# Ça Match

> **Marché de services de confiance** — Côte d'Ivoire (Abidjan)

Plateforme PWA connectant clients et professionnels vérifiés.

## Stack

| Couche | Technologie |
|--------|------------|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Styles | Tailwind CSS v3 + Design System |
| État | Zustand + React Query |
| Animations | Framer Motion |
| Base de données | PostgreSQL + Prisma 5 |
| Auth | Supabase (OTP téléphone) |
| PWA | next-pwa (installable, offline) |
| UI/UX | High-End Visual Design + Impeccable |

## Pages

| Route | Page |
|-------|------|
| `/` | Accueil — recherche, catégories, pros recommandés |
| `/search` | Résultats avec filtres |
| `/pro/[id]` | Profil pro (score, portfolio, avis) |
| `/dashboard` | Tableau de bord pro (stats, missions) |
| `/login` | Connexion par OTP téléphone |

## Démarrer

```bash
npm install
npm run dev        # → http://localhost:3000
npm run build      # Build production
npx prisma db push # Sync schéma DB
```

## Design

- **Couleur**: Émeraude `#10B981` (confiance, action)
- **Police**: Inter (système)
- **Philosophie**: *Trust is the product.* Mobile-first, offline-ready.
- **Micro-interactions**: Transitions fluides, scale sur press, staggered reveals

## Architecture hors-ligne

- Service Worker PWA avec cache stratégique
- Pages offline pour home, recherche, profil
- Background sync pour actions différées

## Licence

MVP — Version 1.0
