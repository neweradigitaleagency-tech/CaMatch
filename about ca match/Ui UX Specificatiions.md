Document ID: CM-UX-001
Version: 1.0
Date: June 17, 2026
4.1 DESIGN SYSTEM
1.1 Design Principles
P1: Clarity Over Cleverness
Every screen has one primary action
Use familiar patterns (bottom tabs, cards, lists)
Avoid ambiguous icons—always pair with labels
P2: Trust Through Transparency
Show verification badges prominently
Display pricing upfront, no hidden fees
Real-time status updates for jobs and payments
P3: Performance as a Feature
Skeleton screens instead of spinners
Progressive image loading (blur → sharp)
Offline indicators always visible
P4: Cultural Resonance
Warm, vibrant color palette reflecting West African aesthetics
Photography featuring real Ivorian professionals and clients
Support for Nouchi (local slang) in key UI copy
P5: Accessibility First
Minimum 48x48dp touch targets
4.5:1 contrast ratio for text
Voice input/output for low-literacy users
Screen reader support (VoiceOver, TalkBack)
1.2 Color Palette
PRIMARY
├── Ça Match Green     #00A86B  (Primary actions, success states)
├── Deep Green         #007A4D  (Hover states, emphasis)
└── Light Green        #E6F7F0  (Backgrounds, badges)

SECONDARY
├── Sunset Orange      #FF6B35  (Urgent actions, CTAs)
├── Warm Yellow        #FFC93C  (Warnings, highlights)
└── Sky Blue           #4A90E2  (Information, links)

NEUTRALS
├── Charcoal           #1A1A1A  (Primary text)
├── Slate              #4A4A4A  (Secondary text)
├── Silver             #9CA3AF  (Placeholders, borders)
├── Cloud              #F3F4F6  (Backgrounds)
└── White              #FFFFFF  (Cards, surfaces)

SEMANTIC
├── Success            #10B981
├── Warning            #F59E0B
├── Error              #EF4444
└── Info               #3B82F6

VERIFICATION BADGES
├── Level 2 (ID)       #3B82F6  (Blue shield)
├── Level 3 (Trust)    #8B5CF6  (Purple shield+)
├── Level 4 (Expert)   #F59E0B  (Gold star)
└── Level 5 (Elite)    #EF4444  (Red crown)

1.3 Typography
FONT FAMILY: Inter (Latin) + Noto Sans (African scripts)

SCALE (Mobile)
├── Display Large      32px / 40px line-height / Bold
├── Display Medium     24px / 32px line-height / Bold
├── Heading 1          20px / 28px line-height / SemiBold
├── Heading 2          18px / 24px line-height / SemiBold
├── Body Large         16px / 24px line-height / Regular
├── Body               14px / 20px line-height / Regular
├── Body Small         12px / 16px line-height / Regular
└── Caption            10px / 14px line-height / Medium

SCALE (Desktop)
├── Display Large      48px / 56px line-height / Bold
├── Display Medium     36px / 44px line-height / Bold
├── Heading 1          28px / 36px line-height / SemiBold
├── Heading 2          24px / 32px line-height / SemiBold
├── Body Large         18px / 28px line-height / Regular
├── Body               16px / 24px line-height / Regular
├── Body Small         14px / 20px line-height / Regular
└── Caption            12px / 16px line-height / Medium

1.4 Spacing System

BASE UNIT: 4px

SCALE
├── xs      4px   (tight spacing, icon padding)
├── sm      8px   (element gaps, card padding small)
├── md      16px  (standard padding, section gaps)
├── lg      24px  (card padding, large gaps)
├── xl      32px  (section separation)
├── 2xl     48px  (page sections)
└── 3xl     64px  (major sections)

GRID (Mobile)
├── Columns: 4
├── Gutter: 16px
├── Margin: 16px

GRID (Desktop)
├── Columns: 12
├── Gutter: 24px
├── Margin: 32px (min), auto (max-width 1440px)

1.5 Component Library
Buttons
PRIMARY BUTTON
├── Height: 48px (mobile), 44px (desktop)
├── Padding: 16px horizontal
├── Border radius: 12px
├── Background: Ça Match Green
├── Text: White, 16px SemiBold
├── States:
│   ├── Default: #00A86B
│   ├── Hover: #007A4D
│   ├── Pressed: #005C3A
│   ├── Disabled: #9CA3AF (opacity 0.5)
│   └── Loading: Spinner + "Chargement..."

SECONDARY BUTTON
├── Background: Transparent
├── Border: 2px solid Ça Match Green
├── Text: Ça Match Green

GHOST BUTTON
├── Background: Transparent
├── Text: Ça Match Green
├── Hover: Light Green background

DANGER BUTTON
├── Background: Error Red
├── Text: White

Cards

STANDARD CARD
├── Background: White
├── Border radius: 16px
├── Padding: 16px
├── Shadow: 0 1px 3px rgba(0,0,0,0.1)
├── Border: 1px solid #E5E7EB

INTERACTIVE CARD
├── Same as standard
├── Hover: Shadow increases, slight scale (1.02)
├── Pressed: Scale (0.98)

Inputs

TEXT INPUT
├── Height: 48px
├── Border: 1px solid Silver
├── Border radius: 8px
├── Padding: 12px 16px
├── Focus: 2px solid Ça Match Green border
├── Error: 2px solid Error Red border + error message below

SEARCH INPUT
├── Height: 56px
├── Left icon: Search (24px)
├── Right icon: Clear (X) when has value
├── Background: Cloud
├── Border radius: 28px (pill shape)

Badges

VERIFICATION BADGE
├── Size: 24x24px icon
├── Position: Bottom-right of avatar (overlap)
├── Colors: Per verification level (see palette)

STATUS BADGE
├── Height: 24px
├── Padding: 4px 12px
├── Border radius: 12px
├── Background: Semantic color at 10% opacity
├── Text: Semantic color at 100%, 12px Medium

RATING BADGE
├── Background: Warm Yellow at 20% opacity
├── Text: Charcoal, 14px SemiBold
├── Icon: Star (filled, Warm Yellow)

Navigation

BOTTOM TAB BAR (Mobile)
├── Height: 64px + safe area
├── Background: White
├── Border top: 1px solid Cloud
├── Icons: 24x24px
├── Labels: 10px Medium
├── Active: Ça Match Green
├── Inactive: Slate
├── Items: 4-5 max

SIDEBAR (Desktop)
├── Width: 240px (collapsed: 72px)
├── Background: White
├── Border right: 1px solid Cloud
├── Items: 48px height
├── Active: Light Green background + Ça Match Green text
├── Inactive: Slate text

4.2 CLIENT APP UX
2.1 Information Architecture

CLIENT APP
├── 🏠 Home
│   ├── Search Bar
│   ├── Categories Grid
│   ├── Nearby Pros Carousel
│   └── Recent Requests
├── 🔍 Search
│   ├── Category Selection
│   ├── Filters (Price, Rating, Distance, Availability)
│   ├── Results List
│   └── Map View Toggle
├── ➕ Request (FAB)
│   ├── AI Input (Text/Voice/Photo)
│   ├── Category Confirmation
│   ├── Location Pin
│   └── Submit
├── 💬 Messages
│   ├── Conversation List
│   └── Chat View
└── 👤 Profile
    ├── Personal Info
    ├── My Jobs (Active/Completed)
    ├── Payment Methods
    ├── Addresses
    ├── Notifications
    ├── Settings
    └── Help & Support
2.2 Key User Flows
Flow 1: First-Time User Onboarding

1. Splash Screen (Ça Match logo, 2s)
2. Welcome Screens (3 slides, swipeable)
   ├── "Trouvez des pros de confiance"
   ├── "Paiement sécurisé via Mobile Money"
   └── "Suivez vos interventions en temps réel"
3. Language Selection (Français / English / Nouchi)
4. Phone Number Entry
5. OTP Verification (6-digit code, auto-fill)
6. Basic Profile (First name, Last name)
7. Location Permission Request
8. Home Screen (with tutorial overlay on first visit)

Target: <60 seconds from launch to home screen

Flow 2: Request a Service
1. Tap "➕" FAB on Home
2. Choose Input Method:
   ├── 📝 Text: "Décrivez votre besoin..."
   ├── 🎤 Voice: Hold to record, release to transcribe
   └── 📷 Photo: Take/upload photo
3. AI Processing (skeleton loader, 1-2s)
4. Confirmation Screen:
   ├── ✅ Catégorie: Plomberie
   ├── ✅ Urgence: Moyenne
   ├── ✅ Estimation: 10 000 - 20 000 XOF
   └── 📍 Adresse: [Auto-filled from GPS]
5. Edit if needed, tap "Continuer"
6. Matching Screen:
   ├── "Recherche des meilleurs pros..."
   ├── Animated radar/pulse effect
   └── Auto-advances after 5-10s
7. Professional Selection:
   ├── List of 3-5 pros (cards)
   ├── Each card shows: Photo, Name, Rating, Price, ETA
   ├── Map view toggle
   └── "Laisser l'IA choisir" option
8. Select Pro → Quote/Booking Screen
9. Confirm Booking → Payment Screen
10. Payment Method Selection:
    ├── Wave (recommended, 0 fees)
    ├── Orange Money
    ├── MTN MoMo
    └── Espèces (cash)
11. Payment Confirmation
12. Job Tracking Screen (real-time updates)

Target: <3 minutes from start to booking confirmation

Flow 3: Track Active Job

Job Tracking Screen:
├── Status Banner (color-coded)
│   ├── "En attente" (Gray)
│   ├── "Pro en route" (Blue, with ETA)
│   ├── "Intervention en cours" (Green)
│   └── "Terminé" (Checkmark)
├── Pro Card:
│   ├── Photo, Name, Rating
│   ├── Call button
│   ├── Chat button
│   └── Live location (if en route)
├── Job Details:
│   ├── Address
│   ├── Scheduled time
│   ├── Estimated price
│   └── Special instructions
├── Timeline:
│   ├── ✅ Demande envoyée (14:30)
│   ├── ✅ Pro accepté (14:32)
│   ├── 🔄 En route (14:45)
│   └── ⏳ Intervention (15:00)
└── Action Buttons:
    ├── "Contacter le pro"
    ├── "Modifier l'adresse"
    └── "Annuler" (with reason selection)

Real-time updates via Supabase Realtime

Flow 4: Payment & Review

1. Job completed → Notification
2. Review Job Screen:
   ├── Before/After photos (from pro)
   ├── Final price breakdown
   ├── Payment method selection
   └── "Payer maintenant" button
3. Payment Processing:
   ├── Loading state
   ├── Success animation (confetti)
   └── Receipt generation
4. Review Prompt (2 hours later):
   ├── "Comment s'est passée votre intervention?"
   ├── 5-star rating
   ├── Optional comment
   ├── Quick tags: "Ponctuel", "Propre", "Professionnel"
   └── Submit button
5. Thank You Screen:
   ├── "Merci pour votre avis!"
   ├── "Recommander à un ami" button
   └── "Retour à l'accueil"

2.3 Screen Specifications
Home Screen

LAYOUT:
┌─────────────────────────────┐
│ ☰  Ça Match      🔔  👤    │  <- Top bar (56px)
├─────────────────────────────┤
│ Bonjour [Name] 👋           │  <- Greeting (24px Bold)
│                             │
│ ┌─────────────────────────┐ │
│ │ 🔍 Que cherchez-vous?   │ │  <- Search (56px, pill)
│ └─────────────────────────┘ │
│                             │
│ Catégories populaires       │  <- Section header (16px SemiBold)
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐│
│ │ ⚡ │ │ 🚿 │ │ ❄️ │ │ 🧹 ││  <- 2x2 grid, scrollable
│ │Élec│ │Plomb│ │Clim│ │Mén.││
│ └────┘ └────┘ └────┘ └────┘│
│                             │
│ Pros près de chez vous      │
│ ┌─────────────────────────┐ │
│ │ 👤 [Photo]  ⭐ 4.9      │ │  <- Pro card (88px height)
│ │ Kouassi Électricien     │ │
│ │ 📍 Cocody • 1.2km       │ │
│ │ 💰 2 500 XOF/h          │ │
│ │ [Voir] [Appeler]        │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ 👤 [Photo]  ⭐ 4.8      │ │
│ │ ...                     │ │
│ └─────────────────────────┘ │
│                             │
├─────────────────────────────┤
│ 🏠    🔍    ➕    💬    👤  │  <- Bottom tab (64px)
│Accueil Rech. Dem.  Msg.  Moi│
└─────────────────────────────┘

INTERACTIONS:
- Pull to refresh
- Search bar: tap to expand to full search screen
- Category: tap to filter search
- Pro card: tap to view profile
- FAB (+): opens request flow
- Bottom tabs: standard navigation

Professional Profile Screen
LAYOUT:
┌─────────────────────────────┐
│ ←  Profil    ❤️  ⋮         │  <- Top bar
├─────────────────────────────┤
│        [Profile Photo]      │  <- 120x120px circular
│        🛡️ [Badge]           │  <- Verification badge
│                             │
│      Kouassi Électricien    │  <- Name (20px Bold)
│      ⭐ 4.9 (127 avis)      │  <- Rating (14px)
│      🛡️ Identité vérifiée   │  <- Verification text
│                             │
│ ┌─────────────────────────┐ │
│ │ À propos                │ │
│ │ Électricien depuis 8    │ │
│ │ ans. Spécialisé en      │ │
│ │ installations et        │ │
│ │ dépannages...           │ │
│ │ [Voir plus]             │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ 💰 Tarifs               │ │
│ │ • 2 500 XOF/heure       │ │
│ │ • Devis gratuit         │ │
│ │ • Déplacement: 1 000 F  │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ 📅 Disponibilité        │ │
│ │ ✅ Disponible maintenant│ │
│ │ ⏰ Répond en <5 min     │ │
│ │ 📍 Cocody (1.2km)       │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ 🖼️ Portfolio            │ │
│ │ [IMG] [IMG] [IMG] [+]  │ │  <- Horizontal scroll
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ ⭐ Avis récents         │ │
│ │ ⭐⭐⭐⭐⭐ Amina K.       │ │
│ │ "Très professionnel,    │ │
│ │  travail soigné..."     │ │
│ │ [Voir tous (127)]       │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ 📊 Statistiques         │ │
│ │ 127 jobs • 3 ans        │ │
│ │ 98% ponctualité         │ │
│ └─────────────────────────┘ │
│                             │
├─────────────────────────────┤
│ [💬 Contacter] [📅 Réserver]│  <- Sticky bottom (104px)
└─────────────────────────────┘
4.3 PROFESSIONAL APP UX
3.1 Information Architecture

PROFESSIONAL APP
├── 🏠 Dashboard
│   ├── Earnings Summary
│   ├── Today's Jobs
│   ├── New Requests (with countdown)
│   └── Availability Toggle
├── 📅 Schedule
│   ├── Calendar View
│   ├── Job List (Today/Upcoming)
│   └── Availability Settings
├── 💰 Finance
│   ├── Balance (Available/Pending)
│   ├── Transaction History
│   ├── Payout to Mobile Money
│   └── Invoices
├── 👥 Team (Business accounts only)
│   ├── Team Members
│   ├── Dispatch Board
│   └── Performance
└── 👤 Profile
    ├── Business Info
    ├── Verification Status
    ├── Services & Pricing
    ├── Portfolio
    ├── Settings
    ├── Training & Certifications
    └── Help & Support

3.2 Key User Flows
Flow 1: Professional Onboarding

1. Splash Screen
2. Welcome (value proposition for pros)
3. Phone Number + OTP
4. Basic Info (Name, Category)
5. Service Area (Map pin + radius slider)
6. Pricing (Hourly rate or fixed prices)
7. Photo Upload (Profile + Portfolio)
8. Verification Start:
   ├── CNI upload (front/back)
   ├── Selfie verification
   └── "Vérification en cours (24-48h)"
9. Dashboard (limited until verified)

Target: <5 minutes to complete

Flow 2: Receive & Accept Job

1. Push Notification: "🚨 Nouveau job à Cocody"
2. Job Alert Screen (full-screen modal):
   ┌─────────────────────────────┐
   │ 🚨 NOUVELLE DEMANDE         │
   │                             │
   │ ⚡ Dépannage électrique     │
   │                             │
   │ 📍 Cocody Angré (2.1 km)    │
   │ 💰 15 000 XOF               │
   │ ⏱️ ~1h30 de travail         │
   │                             │
   │ ━━━━━━━━━━━━━━━━ 02:14      │  <- Countdown bar
   │                             │
   │ [❌ Refuser]  [✅ Accepter]  │
   └─────────────────────────────┘
3. Accept → Job Details Screen
4. Decline → Select reason → Return to dashboard
5. Timeout → Job routed to next pro

Countdown: 2 minutes (configurable)

Flow 3: Execute Job

1. Job Details Screen:
   ├── Client info (name, phone, address)
   ├── Job description + photos
   ├── Quote details
   ├── "🗺️ Itinéraire" button (opens Maps)
   └── "▶️ Démarrer" button

2. Navigate to Client:
   ├── Deep link to Google Maps/Waze
   ├── Live ETA updates to client
   └── "Je suis arrivé" button

3. Check-in:
   ├── GPS verification
   ├── Before photos (mandatory, 2-5)
   └── Start timer

4. During Job:
   ├── Checklist (customizable per job type)
   ├── Notes field
   ├── Additional materials (add to quote)
   └── Pause/Resume timer

5. Complete Job:
   ├── After photos (mandatory, 2-5)
   ├── Final checklist review
   ├── Final price confirmation
   ├── "✅ Terminer & Facturer" button
   └── Payment prompt (cash or mobile money)

6. Payment:
   ├── Cash: Generate PIN for client
   ├── Mobile Money: Send payment link
   └── Receipt generation
Flow 4: Request Payout

1. Finance Screen:
   ┌─────────────────────────────┐
   │ 💰 Mes revenus              │
   │                             │
   │ ┌─────────────────────────┐ │
   │ │ Disponible              │ │
   │ │ 45 000 XOF              │ │  <- Large, prominent
   │ │ [Retirer]               │ │
   │ └─────────────────────────┘ │
   │                             │
   │ ┌─────────────────────────┐ │
   │ │ En attente              │ │
   │ │ 12 000 XOF              │ │
   │ │ (dispo dans 1j 4h)      │ │
   │ └─────────────────────────┘ │
   │                             │
   │ Cette semaine               │
   │ 125 000 XOF  📈 +15%       │
   │                             │
   │ Historique                  │
   │ [List of recent transactions]│
   └─────────────────────────────┘

2. Tap "Retirer":
   ├── Amount selection (full or custom)
   ├── Method selection (Wave/Orange/MTN)
   ├── Confirm phone number
   └── "Confirmer le retrait"

3. Processing:
   ├── Wave: Instant (0 fee)
   ├── Orange: 1-24h (1.5% fee)
   └── MTN: 1-24h (2% fee)

4. Confirmation:
   ├── "Retrait en cours..."
   ├── Success: "45 000 XOF envoyés à Wave"
   └── Transaction receipt

3.3 Offline Mode
Offline Capabilities:
View assigned jobs (cached)
Navigate to job locations (offline maps)
Capture photos (queued for upload)
Complete checklists (saved locally)
Record notes
Sync Behavior:
Auto-sync when connection returns
Conflict resolution (server wins for status, merge for notes)
Visual indicator: "🔄 Synchronisation..." or "⚠️ Hors ligne"
Queue display: "3 actions en attente"
Data Strategy:
WatermelonDB for local storage
Sync only critical data (jobs, checklists, photos)
Aggressive compression for images
Background sync when app foregrounded
4.4 ADMIN DASHBOARD UX
4.1 Information Architecture

ADMIN DASHBOARD
├── 📊 Overview
│   ├── Real-time Metrics
│   ├── Alerts & Notifications
│   └── Quick Actions
├── 👥 Users
│   ├── Clients (list, filters, details)
│   ├── Professionals (list, filters, details)
│   └── Enterprises (list, details)
├── 🛠️ Jobs
│   ├── Active Jobs (map view)
│   ├── Job History
│   └── Disputes Queue
├── 💰 Finance
│   ├── Transactions
│   ├── Payouts
│   ├── Platform Revenue
│   └── Reconciliation
├── 🛡️ Verification
│   ├── Pending Verifications
│   ├── Verification History
│   └── Trust & Safety Reports
├── 📝 Content
│   ├── Reviews Moderation
│   ├── Reported Content
│   └── Categories Management
├── 📈 Analytics
│   ├── Business Metrics
│   ├── User Analytics
│   └── AI Performance
└── ⚙️ Settings
    ├── Platform Config
    ├── Fees & Pricing
    ├── Notifications Templates
    └── Team Management

4.2 Key Screens
Overview Dashboard

┌─────────────────────────────────────────────────────────────────────┐
│ ÇA MATCH ADMIN   [🔍 Global Search...]        🔔 (12)  👤 Admin ⚙️ │
├─────────────────────────────────────────────────────────────────────┤
│ 📊 Overview  👥 Users  🛠️ Jobs  💰 Finance  🛡️ Verify  ⚙️ Settings│
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ REAL-TIME METRICS (Abidjan - Aujourd'hui)                          │
│ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐       │
│ │ 342        │ │ 4.5M XOF   │ │ 85         │ │ 12         │       │
│ │ Jobs actifs│ │ GMV (24h)  │ │ Pros en    │ │ Litiges    │       │
│ │ 📈 +12%    │ │ 📈 +8%     │ │ ligne      │ │ ouverts    │       │
│ └────────────┘ └────────────┘ └────────────┘ └────────────┘       │
│                                                                     │
│ ┌─────────────────────────────┐  ┌─────────────────────────────┐  │
│ │ 🚨 ALERTES                  │  │ 📈 TENDANCES (7 jours)      │  │
│ │                             │  │                             │  │
│ │ 🔴 3 pros signalés          │  │   GMV & Jobs              │  │
│ │ 🟡 Wave webhook latency     │  │   5M |    *--*            │  │
│ │ 🟢 15 vérifications         │  │      |  *      *   *      │  │
│ │    en attente               │  │   2M | *         *   *--*  │  │
│ │                             │  │      |*                 *  │  │
│ │ [Voir tout]                 │  │   0  +---+---+---+---+---  │  │
│ └─────────────────────────────┘  │      Lun Mar Mer Jeu Ven   │  │
│                                  └─────────────────────────────┘  │
│                                                                     │
│ ┌───────────────────────────────────────────────────────────────┐  │
│ │ 🗺️ CARTE DES JOBS ACTIFS                                      │  │
│ │                                                               │  │
│ │    [Map of Abidjan with job pins]                             │  │
│ │    🔴 Urgent  🟡 En cours  🟢 Terminé                         │  │
│ │                                                               │  │
│ │    [Filters: Category, Status, Commune]                       │  │
│ └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

Verification Queue
┌─────────────────────────────────────────────────────────────────────┐
│ 🛡️ VÉRIFICATION (15 en attente)        [Filtres ▼] [Auto-review]   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌───────────────────────────────────────────────────────────────┐  │
│ │ ID       │ Nom          │ Catégorie   │ Niveau   │ IA   │ Act.│  │
│ ├──────────┼──────────────┼─────────────┼──────────┼──────┼─────┤  │
│ │ V-1042   │ Kouassi E.   │ Électricien │ Niveau 2 │ 92%  │ 👁️ │  │
│ │ V-1043   │ Marie K.     │ Nettoyeuse  │ Niveau 2 │ 88%  │ 👁️ │  │
│ │ V-1044   │ Yannick T.   │ Plombier    │ Niveau 3 │ 95%  │ 👁️ │  │
│ └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│ ┌───────────────────────────────────────────────────────────────┐  │
│ │ DÉTAILS: V-1042 (Kouassi Éléphant)                            │  │
│ │                                                               │  │
│ │ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │  │
│ │ │ [CNI Recto]  │  │ [CNI Verso]  │  │ [Selfie]     │         │  │
│ │ │              │  │              │  │              │         │  │
│ │ └──────────────┘  └──────────────┘  └──────────────┘         │  │
│ │                                                               │  │
│ │ 📋 Informations                                               │  │
│ │ • Nom: Kouassi Éléphant                                       │  │
│ │ • Téléphone: +225 07 08 09 10                                 │  │
│ │ • Adresse: Abobo, Zone 4                                      │  │
│ │ • Catégorie: Électricien                                      │  │
│ │ • Expérience déclarée: 8 ans                                  │  │
│ │                                                               │  │
│ │ 🤖 Analyse IA                                                 │  │
│ │ • Score de validation: 92%                                    │  │
│ │ • Documents: ✅ Cohérents                                      │  │
│ │ • Visage: ✅ Correspond au selfie                              │  │
│ │ • Casier: ✅ Vierge                                            │  │
│ │                                                               │  │
│ │ 📝 Notes admin: [_______________________________]             │  │
│ │                                                               │  │
│ │ [✅ Approuver]  [❌ Rejeter]  [📞 Contacter]  [⏸️ Suspendre]   │  │
│ └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
4.5 ENTERPRISE DASHBOARD UX
5.1 Multi-Site Management

┌─────────────────────────────────────────────────────────────────────┐
│ GROUPE HÔTEL IVOIRE   [Site: ▼ Hôtel Plateau]   👤 Sylvie  🔔  ⚙️ │
├─────────────────────────────────────────────────────────────────────┤
│ 📊 Vue Globale  🏢 Sites  📋 Demandes  💰 Budgets  📈 Rapports    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ PERFORMANCE GLOBALE (Mois en cours)                                │
│ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐       │
│ │ 142        │ │ 12.5M XOF  │ │ 98%        │ │ 2.1h       │       │
│ │ Interven-  │ │ Dépensé    │ │ Respect    │ │ Temps      │       │
│ │ tions      │ │ / 15M      │ │ SLA        │ │ résolution │       │
│ └────────────┘ └────────────┘ └────────────┘ └────────────┘       │
│                                                                     │
│ SITES & STATUT                                                     │
│ ┌───────────────────────────────────────────────────────────────┐  │
│ │ Site                          │ Budget │ SLA  │ Alertes       │  │
│ ├───────────────────────────────┼────────┼──────┼───────────────┤  │
│ │ 🏨 Hôtel Plateau (Siège)      │ 65%    │ 99%  │ 🟢 Normal     │  │
│ │ 🏨 Hôtel Marcory              │ 85%    │ 96%  │ 🟡 Budget     │  │
│ │ 🏨 Hôtel Aéroport (FHB)       │ 45%    │ 88%  │ 🔴 SLA Breach │  │
│ └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│ DEMANDES RÉCENTES                                                   │
│ ┌───────────────────────────────────────────────────────────────┐  │
│ │ ID      │ Site     │ Type      │ Montant │ Statut   │ Action │  │
│ ├─────────┼──────────┼───────────┼─────────┼──────────┼────────┤  │
│ │ REQ-992 │ Plateau  │ Plomberie │ 150 000 │ En att.  │ [✅][❌]│  │
│ │ REQ-993 │ Marcory  │ Électric. │ 45 000  │ Approuv. │ 👁️     │  │
│ │ REQ-994 │ Aéroport │ Clim      │ 280 000 │ En att.  │ [✅][❌]│  │
│ └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
5.2 Approval Workflow Configuration
WORKFLOW D'APPROBATION (Configuration)

┌─────────────────────────────────────────────────────────────────────┐
│ Flux: Maintenance Standard                                          │
│                                                                     │
│ ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐      │
│ │ Demande  │───▶│ Manager  │───▶│ Finance  │───▶│ Exécuté  │      │
│ │ (Auto)   │    │ de Site  │    │ (si>200k)│    │          │      │
│ └──────────┘    └──────────┘    └──────────┘    └──────────┘      │
│       │               │               │                            │
│       │ <50k: ✅ Auto │ >200k: ⏸️     │                            │
│       │               │               │                            │
│       ▼               ▼               ▼                            │
│  [Délai: 0h]    [Délai: 4h]     [Délai: 24h]                      │
│                                                                     │
│ [+ Ajouter une étape]  [Dupliquer]  [Archiver]                      │
└─────────────────────────────────────────────────────────────────────┘

4.6 ACCESSIBILITY & LOCALIZATION
6.1 Accessibility Requirements
Visual
Minimum contrast ratio: 4.5:1 (text), 3:1 (large text/UI components)
Color-blind safe palette (test with deuteranopia, protanopia)
Never use color alone to convey information
Focus indicators: 2px solid outline, high contrast
Motor
Minimum touch target: 48x48dp
Spacing between targets: 8dp minimum
Swipe gestures have button alternatives
Keyboard navigation for all desktop features
Cognitive
Clear, simple language (Flesch-Kincaid grade 6)
Consistent navigation patterns
Error messages with specific guidance
Undo/redo for destructive actions
Low Literacy Support
Icon-heavy design with labels
Voice input for all text fields
Video tutorials for key flows
"Mode simplifié" option (reduced text, larger icons)
6.2 Localization
Languages
French (Primary): Professional, clear, West African French conventions
Nouchi (Secondary): Local slang for pro app, friendly tone
English (Future): For expat market and expansion
Cultural Considerations
Names: Support for long names, compound names
Dates: DD/MM/YYYY format
Numbers: Space as thousands separator (15 000, not 15,000)
Currency: XOF displayed as "XOF" or "F" (not "FCFA" in UI)
Time: 24-hour format (14:30, not 2:30 PM)
Phone: E.164 format with +225 prefix
Tone of Voice
Client app: Professional, reassuring, clear
Pro app: Friendly, encouraging, respectful
Admin: Efficient, data-focused
Error messages: Empathetic, solution-oriented
Example Translations
English           French              Nouchi
─────────────────────────────────────────────────
Welcome           Bienvenue           Oué, bienvenue
Find a pro        Trouver un pro      Chercher gars-là
Book now          Réserver maintenant Gbé, on réserve
Payment           Paiement            L'argent-là
Success           Succès              Ça marché!
Error             Erreur              Y a problème
Loading           Chargement...       Ça vient...

5. API SPECIFICATION
Document ID: CM-API-001Version: 1.0Date: June 17, 2026

5.1 API ARCHITECTURE
1.1 Overview
Ça Match exposes a RESTful API via Supabase PostgREST, supplemented by Edge Functions for custom business logic. The API follows these principles:
Resource-oriented: URLs represent resources, not actions
Stateless: Each request contains all necessary context
Consistent: Uniform error responses, pagination, filtering
Secure: JWT authentication, RLS enforcement, rate limiting
1.2 Base URLs

Production:  https://api.camatch.ci
Staging:     https://api.staging.camatch.ci
Development: http://localhost:54321

Supabase Project: https://[project-ref].supabase.co

1.3 Authentication
All API requests require authentication via JWT Bearer token:

Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
apikey: [anon-key]
Token Lifecycle:
Access token: 1 hour expiration
Refresh token: 7 days expiration
Auto-refresh via Supabase client library
1.4 Common Headers
Content-Type: application/json
Accept: application/json
Accept-Language: fr, en
X-Client-Version: 1.2.3
X-Platform: ios | android | web
X-Request-ID: uuid (for tracing)
1.5 Common Response Format
Success:
{
  "data": { ... },
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 142
  }
}
Error:
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid phone number format",
    "details": {
      "field": "phone_number",
      "expected": "E.164 format (+225XXXXXXXX)",
      "received": "07080910"
    }
  }
}
1.6 HTTP Status Codes
Code
Meaning
Usage
200
OK
Successful GET, PUT, PATCH
201
Created
Successful POST
204
No Content
Successful DELETE
400
Bad Request
Validation error
401
Unauthorized
Missing/invalid token
403
Forbidden
Insufficient permissions
404
Not Found
Resource doesn't exist
409
Conflict
Duplicate resource
422
Unprocessable
Business logic error
429
Too Many Requests
Rate limit exceeded
500
Internal Error
Server error
5.2 REST ENDPOINTS (PostgREST)
2.1 Users & Authentication
POST /auth/v1/otp
Request OTP for phone number.
POST /auth/v1/otp
Content-Type: application/json

{
  "phone": "+2250708091010",
  "channel": "sms"
}
Response:
{
  "message_id": "msg_abc123",
  "expires_in": 600
}
POST /auth/v1/verify Verify OTP and get tokens.
POST /auth/v1/verify
Content-Type: application/json

{
  "phone": "+2250708091010",
  "token": "123456"
}

Response:
{
  "access_token": "eyJ...",
  "refresh_token": "def...",
  "expires_in": 3600,
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "phone": "+2250708091010",
    "role": "client"
  }
}

2.2 Client Profiles
GET /rest/v1/client_profiles
Get current user's profile.

GET /rest/v1/client_profiles?select=*,users(*)
Authorization: Bearer <token>
Response:
{
  "user_id": "uuid",
  "first_name": "Amina",
  "last_name": "Koné",
  "default_address": "Cocody, Angré 8ème tranche",
  "location": { "type": "Point", "coordinates": [-3.98, 5.35] },
  "avatar_url": "https://...",
  "loyalty_points": 250,
  "users": {
    "id": "uuid",
    "phone": "+2250708091010",
    "role": "client",
    "language": "fr"
  }
}

PATCH /rest/v1/client_profiles Update profile.
PATCH /rest/v1/client_profiles?user_id=eq.{user_id}
Content-Type: application/json

{
  "first_name": "Amina",
  "default_address": "Cocody, Riviera Palmeraie"
}

Response:
[
  {
    "user_id": "uuid",
    "business_name": "Kouassi Électricité",
    "first_name": "Kouassi",
    "last_name": "Éléphant",
    "category": "electrician",
    "sub_categories": ["installation", "dépannage", "mise_aux_normes"],
    "bio": "Électricien depuis 8 ans...",
    "hourly_rate": 2500,
    "verification_level": "certified",
    "rating": 4.9,
    "total_jobs": 127,
    "location": { "type": "Point", "coordinates": [-3.97, 5.36] },
    "service_radius_km": 10,
    "is_available": true,
    "distance_meters": 1200
  }
]
Full-text search:
GET /rest/v1/professional_profiles?fts=plombier.cocody&select=*
2.4 Service Requests
POST /rest/v1/service_requests
Create a new service request.

POST /rest/v1/service_requests
Content-Type: application/json

{
  "client_id": "uuid",
  "category": "plumber",
  "description": "Fuite d'eau sous l'évier de la cuisine",
  "location": { "type": "Point", "coordinates": [-3.98, 5.35] },
  "address": "Cocody, Rue des Jardins, Villa 42",
  "urgency": "medium",
  "media_urls": ["https://storage.../photo1.jpg"]
}
Response:
{
  "id": "req_uuid",
  "status": "pending",
  "estimated_price_min": 10000,
  "estimated_price_max": 20000,
  "created_at": "2026-06-17T14:30:00Z"
}
GET /rest/v1/service_requests
Get requests with filters.
GET /rest/v1/service_requests?
  client_id=eq.{user_id}&
  status=in.(pending,quoted,accepted,in_progress)&
  select=*,quotes(*),professional_profiles(*),jobs(*)&
  order=created_at.desc

2.5 Quotes
POST /rest/v1/quotes Professional submits a quote.

POST /rest/v1/quotes
Content-Type: application/json

{
  "request_id": "req_uuid",
  "professional_id": "pro_uuid",
  "labor_cost": 15000,
  "material_cost": 5000,
  "total_cost": 20000,
  "materials_description": "Joint + tuyau PVC",
  "notes": "Intervention prévue en 1h30",
  "estimated_duration_mins": 90,
  "valid_until": "2026-06-18T14:30:00Z"
}
PATCH /rest/v1/quotes Client accepts/rejects quote.
PATCH /rest/v1/quotes?id=eq.{quote_id}
Content-Type: application/json

{
  "status": "accepted"
}
2.6 Jobs
GET /rest/v1/jobs Get job details with related data.
GET /rest/v1/jobs?
  id=eq.{job_id}&
  select=*,service_requests(*),quotes(*),reviews(*)
PATCH /rest/v1/jobs Update job (check-in, photos, completion).
PATCH /rest/v1/jobs?id=eq.{job_id}
Content-Type: application/json

{
  "checklist_data": [
    { "item": "Réparation fuite", "done": true },
    { "item": "Nettoyage zone", "done": true }
  ],
  "after_photos": ["https://.../after1.jpg", "https://.../after2.jpg"],
  "pro_notes": "Fuite réparée. Joint remplacé."
}

2.7 Transactions & Payments
POST /rest/v1/payment_intents Create payment intent.

POST /rest/v1/payment_intents
Content-Type: application/json

{
  "job_id": "job_uuid",
  "payer_id": "client_uuid",
  "amount": 20000,
  "currency": "XOF",
  "method": "wave"
}
Response:
{
  "id": "pi_uuid",
  "status": "pending",
  "payment_url": "https://pay.wave.com/...",
  "expires_at": "2026-06-17T14:45:00Z"
}
POST /rest/v1/payouts Professional requests payout.
POST /rest/v1/payouts
Content-Type: application/json

{
  "payee_id": "pro_uuid",
  "amount": 45000,
  "method": "wave"
}
2.8 Conversations & Messages
GET /rest/v1/conversations
Get user's conversations.
http
GET /rest/v1/conversations?
  or=(participant_1.eq.{user_id},participant_2.eq.{user_id})&
  select=*,messages(content,created_at,sender_id,is_read),users!participant_2(first_name,last_name,avatar_url)&
  order=last_message_at.desc POST /rest/v1/messages
Send a message.
http
POST /rest/v1/messages
Content-Type: application/json

{
  "conversation_id": "conv_uuid",
  "sender_id": "user_uuid",
  "content": "Bonjour, je suis en route"
} 
2.9 Reviews
POST /rest/v1/reviews
Submit a review.
http
POST /rest/v1/reviews
Content-Type: application/json

{
  "job_id": "job_uuid",
  "reviewer_id": "user_uuid",
  "reviewee_id": "pro_uuid",
  "rating": 5,
  "comment": "Excellent travail, très professionnel!"
} 
2.10 Disputes
POST /rest/v1/disputes
Raise a dispute.
http
POST /rest/v1/disputes
Content-Type: application/json

{
  "job_id": "job_uuid",
  "raiser_id": "user_uuid",
  "reason": "poor_quality",
  "description": "La fuite n'est pas complètement réparée",
  "evidence_urls": ["https://.../evidence1.jpg"]
} 
5.3 EDGE FUNCTIONS
3.1 AI Categorization
POST /functions/v1/ai-categorize
Categorize service request using AI.
http
POST /functions/v1/ai-categorize
Authorization: Bearer <token>
Content-Type: application/json

{
  "text_input": "Mon climatiseur ne fait plus de froid et fait un bruit bizarre",
  "image_urls": ["https://.../ac_photo.jpg"],
  "voice_url": null
} 
Response:
json
{
  "category": "ac_refrigeration",
  "sub_category": "repair",
  "urgency": "medium",
  "estimated_complexity": "medium",
  "detected_parts": ["compressor", "refrigerant"],
  "estimated_price_min": 15000,
  "estimated_price_max": 35000,
  "confidence_score": 0.94,
  "suggested_description": "Réparation climatiseur - Problème de refroidissement avec bruit anormal"
} 
3.2 Professional Matching
POST /functions/v1/match-professionals
Find and rank professionals for a request.
http
POST /functions/v1/match-professionals
Authorization: Bearer <token>
Content-Type: application/json

{
  "request_id": "req_uuid",
  "mode": "push",
  "limit": 3
} 
Response:
json
{
  "matches": [
    {
      "professional_id": "pro_uuid",
      "match_score": 92.5,
      "rank": 1,
      "factors": {
        "geographic": 95,
        "skill": 100,
        "price": 85,
        "quality": 98,
        "availability": 100,
        "speed": 90,
        "capacity": 70
      },
      "estimated_arrival_mins": 15,
      "quoted_price": 20000
    },
    {
      "professional_id": "pro_uuid_2",
      "match_score": 87.3,
      "rank": 2,
      "factors": { ... }
    }
  ]
} 3.3 Payment Webhooks
POST /functions/v1/webhook-wave
Handle Wave payment callbacks.
http
POST /functions/v1/webhook-wave
X-Wave-Signature: sha256=abc123...
Content-Type: application/json

{
  "event": "payment.completed",
  "transaction_id": "wave_txn_123",
  "amount": 20000,
  "currency": "XOF",
  "status": "completed",
  "metadata": {
    "intent_id": "pi_uuid"
  },
  "timestamp": "2026-06-17T14:32:00Z"
} 
Response:
json
{
  "success": true,
  "payment_intent_id": "pi_uuid",
  "status": "captured"
} POST /functions/v1/webhook-orange
Handle Orange Money callbacks (similar structure).
3.4 Disbursement
POST /functions/v1/disburse-to-pro
Transfer funds to professional.
http
POST /functions/v1/disburse-to-pro
Authorization: Bearer <service-role-key>
Content-Type: application/json

{
  "payout_id": "payout_uuid",
  "professional_id": "pro_uuid",
  "amount": 18000,
  "method": "wave",
  "phone": "+2250708091010"
} 
Response:
json
{
  "payout_id": "payout_uuid",
  "status": "processing",
  "provider_reference": "wave_payout_456",
  "estimated_arrival": "instant"
} 
3.5 AI Quality Scoring
POST /functions/v1/ai-quality-score
Analyze before/after photos.
http
POST /functions/v1/ai-quality-score
Authorization: Bearer <token>
Content-Type: application/json

{
  "job_id": "job_uuid",
  "before_photos": ["url1", "url2"],
  "after_photos": ["url3", "url4"],
  "category": "cleaner"
}
Response:
json
{
  "quality_score": 0.92,
  "analysis": {
    "completeness": 0.95,
    "cleanliness": 0.90,
    "issues_detected": []
  },
  "feedback": "Très bon travail. Toutes les surfaces semblent propres."
} 3.6 AI Support Chatbot
POST /functions/v1/ai-support
Handle support queries.
http
POST /functions/v1/ai-support
Authorization: Bearer <token>
Content-Type: application/json

{
  "user_id": "user_uuid",
  "message": "Comment je peux annuler ma réservation?",
  "context": {
    "screen": "job_details",
    "job_id": "job_uuid"
  }
} Response:
json
{
  "response": "Pour annuler votre réservation, allez dans 'Mes Jobs', sélectionnez le job, puis appuyez sur 'Annuler'. Vous serez remboursé intégralement si le pro n'a pas encore commencé.",
  "actions": [
    {
      "type": "navigate",
      "screen": "cancel_job",
      "label": "Annuler le job"
    }
  ],
  "confidence": 0.95,
  "escalate_to_human": false
} 5.4 REALTIME SUBSCRIPTIONS
4.1 Job Updates
javascript
// Subscribe to job status changes
const subscription = supabase
  .channel('job-updates')
  .on('postgres_changes', 
    { 
      event: 'UPDATE', 
      schema: 'public', 
      table: 'service_requests', 
      filter: `id=eq.${jobId}` 
    }, 
    (payload) => {
      console.log('Job status:', payload.new.status);
      // Update UI
    }
  )
  .subscribe(); 4.2 Chat Messages
javascript
// Subscribe to new messages in a conversation
const chatSubscription = supabase
  .channel('chat-messages')
  .on('postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`
    },
    (payload) => {
      console.log('New message:', payload.new);
      // Append to chat UI
    }
  )
  .subscribe(); 4.3 Job Requests (Professional)
javascript
// Subscribe to new job requests in pro's area
const jobRequestSubscription = supabase
  .channel('job-requests')
  .on('postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'service_requests',
      filter: `category=eq.${proCategory}`
    },
    (payload) => {
      // Check if job is within service radius
      const distance = calculateDistance(proLocation, payload.new.location);
      if (distance <= proRadius) {
        showJobAlert(payload.new);
      }
    }
  )
  .subscribe(); 
4.4 Professional Availability
javascript
// Subscribe to pro availability changes (for clients viewing profile)
const availabilitySubscription = supabase
  .channel('pro-availability')
  .on('postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'professional_profiles',
      filter: `user_id=eq.${proId}`
    },
    (payload) => {
      updateAvailabilityUI(payload.new.is_available, payload.new.is_online);
    }
  )
  .subscribe(); 
5.5 RATE LIMITING
Endpoint Type
Limit
Window
Response on Limit
Auth (OTP)
5 req
1 min
429 + retry-after
Auth (verify)
10 req
1 min
429 + retry-after
Search/Read
100 req
1 min
429 + retry-after
Create Request
10 req
1 hour
429 + retry-after
Submit Quote
20 req
1 hour
429 + retry-after
Chat Messages
30 req
1 min
429 + retry-after
AI Functions
20 req
1 min
429 + retry-after
Payment
10 req
1 min
429 + retry-after
Payout
5 req
1 hour
429 + retry-after
Webhooks
1000 req
1 min
503 (retry later)
Rate Limit Headers:
http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1718620800 5.6 ERROR HANDLING
6.1 Error Codes
Code
HTTP Status
Description
VALIDATION_ERROR
400
Input validation failed
AUTHENTICATION_ERROR
401
Invalid/missing token
AUTHORIZATION_ERROR
403
Insufficient permissions
NOT_FOUND
404
Resource not found
CONFLICT
409
Duplicate resource
BUSINESS_ERROR
422
Business logic violation
RATE_LIMITED
429
Too many requests
INTERNAL_ERROR
500
Server error
SERVICE_UNAVAILABLE
503
External service down
6.2 Error Response Format
json
{
  "error": {
    "code": "BUSINESS_ERROR",
    "message": "Quote has expired",
    "details": {
      "quote_id": "quote_uuid",
      "expired_at": "2026-06-17T14:30:00Z",
      "current_time": "2026-06-17T15:00:00Z"
    },
    "user_message": "Ce devis a expiré. Veuillez demander un nouveau devis.",
    "request_id": "req_uuid",
    "timestamp": "2026-06-17T15:00:00Z"
  }
} 6.3 Retry Strategy
Client-side retry:
Exponential backoff: 1s, 2s, 4s, 8s, 16s
Max 5 retries
Only retry on 5xx errors or network failures
Never retry on 4xx errors (except 429)
Server-side retry (webhooks):
Exponential backoff: 1s, 5s, 30s, 5m, 30m
Max 8 retries over 24 hours
Dead letter queue for persistent failures