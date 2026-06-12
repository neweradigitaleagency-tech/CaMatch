
# PROMPT: BUILD "ÇA MATCH" — TRUST-BASED SERVICE MARKETPLACE
## Mobile-First Progressive Web App (PWA)

---

## 1. PROJECT OVERVIEW

Build **"Ça Match"**, a trust-first service marketplace PWA for the Ivorian market (Abidjan-first, West Africa expansion-ready). The app connects clients with verified independent professionals (artisans, service providers) through a reputation-based matching system.

**Core Philosophy**: *Trust is the product. Every pixel must communicate reliability, speed, and professionalism.*

---

## 2. TARGET SPECIFICATIONS

| Attribute | Requirement |
|-----------|-------------|
| **Platform** | Progressive Web App (PWA) — mobile-first, installable |
| **Primary Language** | French (UI, content, microcopy) |
| **Architecture** | Offline-first, responsive, thumb-friendly |
| **Performance** | <3 seconds to first meaningful paint on 3G |
| **Security** | OWASP Mobile Top 10 compliant, end-to-end encryption for sensitive data |
| **Accessibility** | WCAG 2.1 AA minimum |

---

## 3. CORE FEATURES (MVP SCOPE)

### 3.1 Authentication & Identity
- [ ] Phone number OTP authentication (primary — no email/password)
- [ ] User role selection: **Client** or **Professional**
- [ ] Profile creation with photo upload
- [ ] Identity verification badge system

### 3.2 Client Experience
- [ ] **Home Screen**: Search bar ("Quel service recherchez-vous ?"), category grid, "Urgent 1-clic" quick actions
- [ ] **Search Results**: Pro cards with photo, name, rating (⭐), mission count, "Vérifié" badge, response time estimate
- [ ] **Pro Profile**: Rich vertical layout — identity, trust score (0-1000), portfolio carousel, client reviews, pricing, availability, action buttons
- [ ] **Contact Flow**: WhatsApp deep-link + in-app messaging fallback
- [ ] **Mission Validation**: Post-service rating + photo proof upload

### 3.3 Professional Experience
- [ ] **Dashboard**: Stats (views, contacts, missions), trust score progression
- [ ] **Portfolio Management**: Upload before/after photos, auto-generate mission cards
- [ ] **Availability Calendar**: Set working hours, mark real-time availability
- [ ] **Mission History**: Completed jobs with client ratings
- [ ] **Badge Progression**: Bronze → Silver → Gold → Elite (based on trust score)

### 3.4 Trust & Reputation System (CRITICAL)
- [ ] **Dynamic Trust Score (0-1000)**:
  - Mission Quality (client ratings, completion rate): 30%
  - Responsiveness (reply speed, acceptance rate): 25%
  - Portfolio Proof (verified submissions): 20%
  - Platform Engagement (training, consistency): 15%
  - Community Standing (endorsements): 10%
- [ ] **Verification Badges**: Identity verified, On-site verified, Premium member
- [ ] **Review System**: 1-5 stars + text + optional photo proof
- [ ] **Mission Cards**: Auto-generated portfolio entries (before/after, date, client rating)

---

## 4. SCREEN-BY-SCREEN SPECIFICATIONS

### 4.1 Écran d'Accueil (Home)

```
┌─────────────────────────────────┐
│  📍 Cocody, Abidjan        🔔   │
│                                 │
│  "Quel service                  │
│   recherchez-vous ?"            │
│  ┌─────────────────────────┐    │
│  │ 🔍 Plombier, élec...   │ 🎤 │
│  └─────────────────────────┘    │
│                                 │
│  ⚡ Urgent ? 1-clic :           │
│  ┌────────┐ ┌────────┐ ┌────┐ │
│  │Plombier│ │Électric│ │Mén │ │
│  └────────┘ └────────┘ └────┘ │
│                                 │
│  🏷️ Catégories populaires      │
│  ┌────┐┌────┐┌────┐┌────┐     │
│  │🚿  ││💡  ││🪑  ││📱  │     │
│  │Plom││Élec││Menu││Rép │     │
│  └────┘└────┘└────┘└────┘     │
│  ┌────┐┌────┐┌────┐┌────┐     │
│  │🧹  ││📚  ││❄️  ││💇  │     │
│  │Mén ││Prof││Clim││Coif│     │
│  └────┘└────┘└────┘└────┘     │
│                                 │
│  ⭐ Pros recommandés            │
│  [Horizontal scroll cards]      │
│                                 │
│  [📍 Voir sur la carte]         │
└─────────────────────────────────┘
```

**Requirements**:
- Search bar with voice input capability (French speech-to-text)
- "Urgent 1-clic" dynamically shows top 3 services by neighborhood demand
- Category icons: intuitive, culturally relevant (use emojis or custom SVG)
- Pro recommendation cards: horizontal scroll, compact trust indicators
- Bottom navigation: Accueil | Recherche | Messages | Profil

### 4.2 Page Résultats (Search Results)

```
┌─────────────────────────────────┐
│  ← Plombier · Cocody       ⚙️   │
│  [Filtres: Prix ▼|Note ▼|Dispo▼]│
│                                 │
│  ┌─────────────────────────┐   │
│  │ 👤 Koffi A.             │   │
│  │ ⭐ 4.9 · 47 missions    │   │
│  │ 🏅 Or · ✅ Vérifié      │   │
│  │ 📸 [📷][📷][📷] portfolio│   │
│  │ 💬 Réponse: ~5 min      │   │
│  │ 💰 À partir de 5 000 FCFA│  │
│  │ ┌────────┐ ┌────────┐   │   │
│  │ │Contacter│ │ Appeler │   │   │
│  │ └────────┘ └────────┘   │   │
│  └─────────────────────────┘   │
│                                 │
│  [Card 2...]                    │
│  [Card 3...]                    │
└─────────────────────────────────┘
```

**Requirements**:
- Sort/filter: proximity (default), rating, price, availability
- Pro card elements:
  - Profile photo (circular, 64x64px)
  - Full name
  - Star rating + mission count
  - Badge row (metal level + verification status)
  - Portfolio preview strip (3 thumbnails, 80x80px)
  - Estimated response time (based on historical data)
  - Starting price indicator
  - Dual CTA: "Contacter" (WhatsApp) + "Appeler" (tel: link)
- Skeleton loading states during fetch
- Empty state: "Aucun pro trouvé. Essayez d'élargir votre zone."

### 4.3 Profil Professionnel (Pro Profile — THE TRUST PAGE)

```
┌─────────────────────────────────┐
│  [←]                    [📤]    │
│                                 │
│  ┌─────────────────────────┐   │
│  │    [Cover photo]        │   │
│  │  ┌────┐                 │   │
│  │  │👤  │ Koffi A.        │   │
│  │  └────┘                 │   │
│  └─────────────────────────┘   │
│                                 │
│  🏅 Or · ⭐ 4.9 · 47 jobs      │
│  [███████░░░] 847/1000         │
│  "Plombier · 8 ans d'exp"      │
│                                 │
│  ─── CONFIANCE ───             │
│  ✅ Identité vérifiée           │
│  ✅ Visite terrain validée      │
│  📸 23 preuves de travail       │
│  💬 38 avis vérifiés            │
│  🎓 3 formations complétées     │
│                                 │
│  ─── PORTFOLIO ───             │
│  [Before/After carousel]       │
│  [Mission 1: 12/05/2026 ⭐5]   │
│  [Mission 2: 08/05/2026 ⭐5]   │
│  [Voir tout (23)]              │
│                                 │
│  ─── TARIFS ───                │
│  💰 Diagnostic: 5 000 FCFA     │
│  💰 Réparation standard: 15k   │
│  💰 Installation: 25 000 FCFA  │
│  [Voir grille complète]        │
│                                 │
│  ─── DISPONIBILITÉ ───         │
│  🟢 Aujourd'hui: 14h-18h       │
│  🟡 Demain: Sur demande        │
│  🔴 Mercredi: Indisponible     │
│                                 │
│  ─── AVIS CLIENTS ───          │
│  ⭐ 4.9/5 · 38 avis            │
│  "Travail impeccable, ponctuel"│
│  — Amadou K., 10/06/2026       │
│  [Voir les 38 avis]            │
│                                 │
│  ─── ZONE D'ACTION ───         │
│  🗺️ Cocody, Riviera, Angré     │
│                                 │
│  ┌─────────────────────────┐   │
│  │    💬 Contacter         │   │
│  │    (WhatsApp)           │   │
│  └─────────────────────────┘   │
│  ┌────────┐ ┌────────┐        │
│  │ 📞 App │ │📋 Devis│        │
│  └────────┘ └────────┘        │
└─────────────────────────────────┘
```

**Requirements**:
- **Cover photo**: 16:9, pro's best work or professional shot
- **Avatar**: 120x120px, circular, with verification ring (green = verified)
- **Trust Score bar**: Visual progress, color-coded (red <400, yellow 400-700, green 700-900, gold 900+)
- **Confidence breakdown**: Checklist with icons, expandable details
- **Portfolio carousel**: Swipeable, before/after comparison slider
- **Pricing**: Indicative only, "À partir de" prefix
- **Availability**: Color-coded status, 7-day view
- **Reviews**: Top 2 shown, expandable list, client photo + name + date
- **Sticky bottom CTA**: "Contacter" primary (green), "Appeler" + "Devis" secondary

### 4.4 Tableau de Bord Pro (Pro Dashboard)

```
┌─────────────────────────────────┐
│  Tableau de bord           ⚙️   │
│                                 │
│  ┌─────────────────────────┐   │
│  │  Votre score de confiance│   │
│  │  [███████░░░] 847/1000  │   │
│  │  🏅 Niveau: Or           │   │
│  │  [Détail du score →]     │   │
│  └─────────────────────────┘   │
│                                 │
│  📊 Cette semaine              │
│  ┌────┐ ┌────┐ ┌────┐        │
│  │ 12 │ │ 8  │ │ 3  │        │
│  │Vues│ │Conta│ │Missions│    │
│  └────┘ └────┘ └────┘        │
│                                 │
│  🔔 Notifications              │
│  • Nouvelle demande: Ménage    │
│  • Avis reçu: ⭐ 5             │
│                                 │
│  📸 Portfolio (23 missions)    │
│  [Grid: 3x2 thumbnails]        │
│  [+ Ajouter une preuve]        │
│                                 │
│  📅 Disponibilité              │
│  [Mini calendar widget]        │
│  [Modifier]                    │
│                                 │
│  [🏅 Objectifs: 3 missions    │
│   pour passer Platine]         │
└─────────────────────────────────┘
```

---

## 5. SECURITY REQUIREMENTS (MANDATORY)

### 5.1 Authentication & Authorization
- [ ] **Phone OTP only** — Firebase Auth or Twilio Verify
- [ ] **Rate limiting**: Max 3 OTP requests per 15 minutes per number
- [ ] **JWT tokens** with 24h expiry, refresh token rotation
- [ ] **Role-based access control** (RBAC): Client vs Pro permissions
- [ ] **Device fingerprinting** for suspicious login detection

### 5.2 Data Protection
- [ ] **End-to-end encryption** for in-app messages (Signal Protocol or similar)
- [ ] **AES-256 encryption** for sensitive data at rest (phone numbers, location history)
- [ ] **PII minimization**: Only collect necessary data; explicit consent for location
- [ ] **GDPR/CCPA-ready** privacy controls (data export, deletion)
- [ ] **Secure file upload**: Scan images for malware, validate MIME types, size limits

### 5.3 API Security
- [ ] **HTTPS only** (HSTS enabled)
- [ ] **API rate limiting**: 100 requests/minute per user
- [ ] **Input validation**: Strict schema validation (Zod or Joi)
- [ ] **SQL injection prevention**: Parameterized queries exclusively
- [ ] **CORS**: Whitelist-only, strict origin validation

### 5.4 Infrastructure
- [ ] **Environment separation**: Dev/staging/prod with distinct credentials
- [ ] **Secrets management**: No hardcoded keys; use environment variables + secret manager
- [ ] **Automated dependency scanning** (Snyk, Dependabot)
- [ ] **Content Security Policy** (CSP) headers
- [ ] **Regular penetration testing** schedule

---

## 6. TECHNICAL STACK

| Layer | Technology | Justification |
|-------|-----------|---------------|
| **Frontend** | **React** (Next.js 14+ App Router) + **PWA** | SEO-friendly, fast SSR, installable, large ecosystem |
| **State Management** | Zustand + React Query | Lightweight, excellent caching, offline support |
| **Styling** | Tailwind CSS + shadcn/ui | Rapid development, consistent design system |
| **Backend** | **Node.js** + **Express** or **Next.js API Routes** | Unified stack, fast iteration |
| **Database** | **PostgreSQL** (Neon or Supabase) | Relational data, ACID compliance, geospatial queries |
| **ORM** | Prisma | Type-safe, migration management |
| **Real-time** | Supabase Realtime or Socket.io | Live availability, messaging |
| **File Storage** | Cloudinary | Auto-compression, CDN delivery, video optimization |
| **Maps** | Mapbox GL JS | Custom styling, offline tile caching |
| **Auth** | Supabase Auth or Clerk | Phone OTP, JWT, RBAC built-in |
| **Search** | Algolia or PostgreSQL full-text | Fast, typo-tolerant search |
| **Monitoring** | Sentry + LogRocket | Error tracking, session replay |
| **Hosting** | Vercel (frontend) + Railway/Render (backend) | Edge deployment, automatic scaling |

**Why React/Next.js over Flutter?** 
- PWA reaches 100% of users (no app store gatekeeping)
- Faster iteration and deployment
- Better SEO for pro profiles (discoverable via Google)
- Single codebase for web + mobile web
- Easier to integrate with WhatsApp Web and payment APIs

---

## 7. DATABASE SCHEMA (Prisma)

```prisma
// User & Authentication
model User {
  id            String   @id @default(uuid())
  phone         String   @unique
  role          UserRole // CLIENT | PROFESSIONAL
  status        UserStatus @default(PENDING)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  profile       Profile?
  sessions      Session[]
  messages      Message[]
  reviews       Review[]
  missions      Mission[]
}

model Profile {
  id            String   @id @default(uuid())
  userId        String   @unique
  user          User     @relation(fields: [userId], references: [id])
  
  // Identity
  firstName     String
  lastName      String
  avatarUrl     String?
  coverUrl      String?
  bio           String?  @db.Text
  
  // Pro-specific
  profession    String?
  experience    Int?     // years
  zone          String[] // Array of neighborhoods
  
  // Trust
  trustScore    Int      @default(0)
  badge         Badge    @default(NONE)
  isVerified    Boolean  @default(false)
  isOnsiteVerified Boolean @default(false)
  
  // Stats
  missionCount  Int      @default(0)
  responseTime  Int?     // average minutes
  acceptanceRate Float   @default(0)
  
  // Availability
  availability  Json?    // { monday: { start: "09:00", end: "18:00" } }
  
  // Relations
  portfolio     PortfolioItem[]
  services      Service[]
  pricing       Pricing[]
}

// Portfolio & Proof of Work
model PortfolioItem {
  id            String   @id @default(uuid())
  profileId     String
  profile       Profile  @relation(fields: [profileId], references: [id])
  
  type          MediaType // IMAGE | VIDEO
  beforeUrl     String?
  afterUrl      String
  description   String?
  
  missionId     String?
  mission       Mission? @relation(fields: [missionId], references: [id])
  
  createdAt     DateTime @default(now())
}

// Mission Lifecycle
model Mission {
  id            String   @id @default(uuid())
  clientId      String
  client        User     @relation("ClientMissions", fields: [clientId], references: [id])
  proId         String
  pro           User     @relation("ProMissions", fields: [proId], references: [id])
  
  status        MissionStatus @default(PENDING)
  service       String
  description   String?  @db.Text
  address       String
  scheduledAt   DateTime?
  completedAt   DateTime?
  
  // Pricing
  agreedPrice   Int?
  finalPrice    Int?
  
  // Validation
  clientRating  Int?
  clientReview  String?  @db.Text
  clientProof   String?  // Photo URL
  
  portfolioItem PortfolioItem?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

// Reviews
model Review {
  id            String   @id @default(uuid())
  missionId     String   @unique
  mission       Mission  @relation(fields: [missionId], references: [id])
  
  reviewerId    String
  reviewer      User     @relation(fields: [reviewerId], references: [id])
  
  rating        Int      // 1-5
  comment       String?  @db.Text
  proofUrl      String?
  isVerified    Boolean  @default(false)
  
  createdAt     DateTime @default(now())
}

// Pricing
model Pricing {
  id            String   @id @default(uuid())
  profileId     String
  profile       Profile  @relation(fields: [profileId], references: [id])
  
  service       String
  label         String   // "Diagnostic", "Réparation standard"
  price         Int      // FCFA
  isStartingAt  Boolean  @default(false)
}

// Enums
enum UserRole { CLIENT PROFESSIONAL ADMIN }
enum UserStatus { PENDING ACTIVE SUSPENDED BANNED }
enum Badge { NONE BRONZE SILVER GOLD ELITE }
enum MediaType { IMAGE VIDEO }
enum MissionStatus { PENDING ACCEPTED IN_PROGRESS COMPLETED CANCELLED DISPUTED }
```

---

## 8. API ENDPOINTS (RESTful)

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/otp/send` | Request OTP |
| POST | `/api/auth/otp/verify` | Verify OTP, return JWT |
| POST | `/api/auth/refresh` | Refresh access token |
| DELETE | `/api/auth/logout` | Invalidate session |

### Search & Discovery
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/pros` | List pros (query: lat, lng, radius, service, sort) |
| GET | `/api/pros/:id` | Get pro profile |
| GET | `/api/pros/:id/portfolio` | Get pro portfolio |
| GET | `/api/pros/:id/reviews` | Get pro reviews |

### Mission Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/missions` | Create mission request |
| GET | `/api/missions` | List user's missions |
| GET | `/api/missions/:id` | Get mission details |
| PATCH | `/api/missions/:id/status` | Update mission status |
| POST | `/api/missions/:id/validate` | Client validates completion + rating |

### Profile Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile` | Get current user profile |
| PATCH | `/api/profile` | Update profile |
| POST | `/api/profile/portfolio` | Upload portfolio item |
| PATCH | `/api/profile/availability` | Update availability |

---

## 9. PWA REQUIREMENTS

- [ ] **Web App Manifest**: `name: "Ça Match"`, `short_name: "ÇaMatch"`, icons, theme color (#10B981)
- [ ] **Service Worker**: Cache static assets, network-first for API calls, background sync for offline actions
- [ ] **Push Notifications**: Mission requests, message alerts, badge upgrades
- [ ] **Add to Home Screen**: Custom install prompt
- [ ] **Offline Pages**: Cached home, search results (last viewed), profile
- [ ] **Background Sync**: Queue messages, reviews, portfolio uploads when offline

---

## 10. PERFORMANCE BUDGET

| Metric | Target | Max |
|--------|--------|-----|
| First Contentful Paint | <1.5s | 2.0s |
| Time to Interactive | <3.5s | 5.0s |
| Cumulative Layout Shift | <0.1 | 0.25 |
| Largest Contentful Paint | <2.5s | 4.0s |
| Total Page Weight (home) | <500KB | 1MB |
| Image size (portfolio) | <200KB | 500KB |

---

## 11. DESIGN TOKENS

```css
/* Colors */
--primary: #10B981;        /* Emerald 500 - trust, action */
--primary-dark: #059669;   /* Emerald 600 - hover */
--accent: #F59E0B;         /* Amber 500 - badges, urgency */
--danger: #EF4444;         /* Red 500 - errors, unavailable */
--background: #F9FAFB;     /* Gray 50 - page bg */
--surface: #FFFFFF;        /* White - cards */
--text-primary: #111827;   /* Gray 900 */
--text-secondary: #6B7280; /* Gray 500 */

/* Typography */
--font-sans: 'Inter', system-ui, sans-serif;
--text-xs: 0.75rem;   /* 12px - captions */
--text-sm: 0.875rem;  /* 14px - secondary */
--text-base: 1rem;    /* 16px - body */
--text-lg: 1.125rem;  /* 18px - headings */
--text-xl: 1.25rem;   /* 20px - titles */
--text-2xl: 1.5rem;   /* 24px - hero */

/* Spacing */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */

/* Radius */
--radius-sm: 0.375rem;  /* 6px - buttons */
--radius-md: 0.5rem;    /* 8px - inputs */
--radius-lg: 0.75rem;   /* 12px - cards */
--radius-xl: 1rem;      /* 16px - modals */
--radius-full: 9999px;  /* Pills, avatars */

/* Shadows */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
```

---

## 12. TESTING REQUIREMENTS

- [ ] **Unit tests**: Jest, 80%+ coverage on utilities, hooks
- [ ] **Integration tests**: React Testing Library, critical user flows
- [ ] **E2E tests**: Playwright — search → profile → contact flow
- [ ] **Accessibility tests**: axe-core, keyboard navigation
- [ ] **Performance tests**: Lighthouse CI, budget enforcement
- [ ] **Security tests**: OWASP ZAP scan, dependency audit

---

## 13. DEPLOYMENT CHECKLIST

- [ ] Environment variables configured (no secrets in repo)
- [ ] Database migrations automated
- [ ] SSL certificate (Let's Encrypt)
- [ ] CDN configured (Cloudflare)
- [ ] Error tracking active (Sentry)
- [ ] Analytics configured (Plausible or Mixpanel)
- [ ] Backup strategy (daily DB snapshots)
- [ ] Monitoring alerts (Uptime, error rate)

---

## 14. DELIVERABLES

1. **Source code**: Git repository with clean commit history
2. **Documentation**: README with setup, architecture decisions, API docs
3. **Design system**: Storybook with all components
4. **Database**: Migrated schema with seed data
5. **Tests**: Passing test suite
6. **Deployment**: Live staging environment
7. **Security audit**: Basic scan report

---

## 15. SUCCESS CRITERIA

- [ ] Search → contact flow completes in <60 seconds
- [ ] Pro profile loads in <2 seconds on 3G
- [ ] Offline browsing works for cached content
- [ ] 0 critical security vulnerabilities
- [ ] Lighthouse score: 90+ on all metrics
- [ ] Screen reader navigable

---

## 16. FINAL NOTES

- **Language**: All user-facing text in French. Code comments in English.
- **Icons**: Use Lucide React (consistent, lightweight)
- **Images**: WebP format, lazy loading, blur placeholder
- **Animations**: Subtle, purposeful — never decorative. Use Framer Motion.
- **Error states**: Friendly, actionable French copy. Never raw error codes.
- **Empty states**: Illustrative, with clear next steps.

**Remember**: Every interaction must build trust. The app should feel like a reliable neighbor, not a corporate platform.

---

*Build date: 2026-06-10*
*Version: 1.0 — MVP*
*Market: Côte d'Ivoire (Abidjan-first)*
```

