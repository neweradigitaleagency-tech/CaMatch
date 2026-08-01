# Architecture de Navigation — Ça Match

> Document de référence de la navigation de l'application **Ça Match**.
> SPA React 19 + Vite + react-router v7 (`BrowserRouter`), Tailwind 4, mobile-first.
> Dernière mise à jour : juillet 2026 (lots 1 à 8 de la refonte unifiée).

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Architecture générale](#2-architecture-générale)
3. [Table des routes](#3-table-des-routes)
4. [Hiérarchie des écrans](#4-hiérarchie-des-écrans)
5. [Flux par rôle](#5-flux-par-rôle)
6. [Composants de navigation](#6-composants-de-navigation)
7. [Guards & authentification](#7-guards--authentification)
8. [Deep links & état](#8-deep-links--état)
9. [Bouton retour](#9-bouton-retour)
10. [Cas particuliers & problèmes détectés](#10-cas-particuliers--problèmes-détectés)
11. [Recommandations](#11-recommandations)

---

## 1. Vue d'ensemble

L'application est une **SPA mono-routeur** : toutes les routes sont déclarées dans `src/main.tsx` via `<BrowserRouter>`, chaque page est chargée en **`lazy()`** avec un `<Suspense fallback={<PageLoader/>}>`.

Quatre espaces coexistent, chacun avec son layout et son mode d'authentification :

| Espace | Préfixe | Layout | Navigation principale |
|---|---|---|---|
| **Client** | `/` (racine) | `AppLayout` (`Layout variant="client"`) | Hamburger drawer (pas de tab bar) |
| **Professionnel** | `/pro/*` | `ProLayout` (`Layout variant="pro"`) | Menu pro (haut du dashboard) |
| **Fournisseur** | `/supplier/*` | `SupplierLayout` | Sidebar fixe 260px (18 entrées) |
| **Admin** | `/admin/*` | `AdminLayout` | Sidebar collapsible (28 entrées, permissionnées) |

Points structurants :

- **Pas de barre de navigation basse** côté client : la home s'appuie sur un **hamburger drawer** (menu configurable via `src/data/menuConfig.ts`). La barre d'onglets n'existe qu'en admin/fournisseur (sidebar).
- La **home** (`/` → `HomePage` → `ModernHomeScreen`) est le hub : search bar héro → `/search`, chips des 9 branches → `/search?branch=`, CTA « Créer une demande » → `/orders/new`, sections → `/professionals`, `/freelance`, `/marketplace`, `/marketplace/boutiques`.
- Le **catalogue marketplace** (`/catalog`) est la nouvelle porte d'entrée marchande, filtre par paramètres d'URL (`vert`, `sub`, `rental`, `q`, prix…).
- Chaque transition de page applique un **scroll to top** + une **animation** (fade/y via `motion`), sauf sur les routes chat (`/messages/:id`) qui sont rendues en pleine hauteur.

---

## 2. Architecture générale

### 2.1 Pile de rendu (`src/main.tsx`)

```
createRoot
└─ <StrictMode>
   └─ <ErrorFallback>                    // erreurs globales (crash screen + recharger)
      └─ <QueryClientProvider>           // TanStack Query
         └─ <BrowserRouter>
            └─ <App>                     // boot : initialize() auth, SW /sw.js
               └─ <Routes>
```

- `App` boote `useAuthStore.initialize()` une seule fois (ref `initRef`) avant d'afficher les routes.
- `navigator.serviceWorker.register("/sw.js")` est enregistré au boot (push uniquement, pas d'offline).

### 2.2 Layout commun (`src/layouts/Layout.tsx`)

`Layout variant="client" | "pro" | "supplier" | "admin"` fournit :

- La **barre gradient** de 4px en haut (`from-cm-accent to-cm-forest`).
- Le **`RoleSwitcher`** si `availableModes.length > 1` (multi-mode client/pro/supplier).
- Le **scroll-to-top** à chaque changement de `location.pathname`.
- Les **transitions de page** : `AnimatePresence mode="wait"` + `motion.div key={pathname}` (fade y).
- L'**`ErrorBoundary`** (composant `src/components/ui/ErrorBoundary.tsx`) par page.
- La géolocalisation auto du client au premier rendu (`locationStore.refreshLocation()`).
- Le padding bas sécurisé `pb-safe` (home indicator) en variant client.
- **Exception chat** : `isChatRoute = pathname.startsWith("/messages/")` → rend `<Outlet/>` en `flex flex-col` pleine hauteur (composer fixe en bas), sans transition.

`AppLayout` = `Layout variant="client"`, `ProLayout` = `Layout variant="pro"`.

### 2.3 Patterns de navigation utilisés

| Pattern | Fichiers | Usage |
|---|---|---|
| `useNavigate` + path template | partout | navigation programmatique |
| `navigate(..., { state: { from } })` | marketplace | pile retour explicite |
| `navigate(..., { state: { mission/booking/details } })` | ordres | passage d'objets entre écrans (perdu au refresh) |
| `useBackNavigation(fallback)` | `src/hooks/useBackNavigation.ts` | bouton retour uniformisé (~60 écrans) |
| `navigate(-1)` | `InvoicePage`, `ReviewPage`, `QRPaymentPage`, `MessagingListPage`, `RequestDetailPage`, `MissionTrackerPage` | retour historique simple |
| `<Navigate to replace />` | `main.tsx` | redirects legacy et re-maps |
| `NavLink` (`isActive`) | `SupplierLayout`, `AdminSidebar` | états actifs de sidebar |
| `Link` | fiches produit, catégories | navigation déclarative simple |

---

## 3. Table des routes

Source unique : `src/main.tsx` (lazy imports en tête de fichier).

### 3.1 Hors auth (publique)

| Route | Composant | Notes |
|---|---|---|
| `/onboarding` | `OnboardingPage` → `UnifiedOnboardingScreen` | machine d'états interne (OTP phone/email, découverte, upsell premium) ; boutons mode démo |

### 3.2 Espace client — `AuthGate` → `AppLayout` (`Layout variant="client"`)

**Home & recherche**

| Route | Composant |
|---|---|
| `/` | `HomePage` → `ModernHomeScreen` |
| `/search` | `SearchPage` (machine 3 niveaux ; params `q`, `branch`) |
| `/catalog` | `CatalogPage` (filtres URL `q`, `vert`, `sub`, `rental`, `sort`, `min`, `max`, `cond`, `loc`) |
| `/professionals` | `ProfessionalListingScreen` (7 catégories locales ; param `category`) |
| `/freelance` | `FreelanceListingScreen` (11 catégories freelance ; param `category`) |
| `/favorites` | `FavoritesPage` |

**Messagerie**

| Route | Composant |
|---|---|
| `/messages` | `MessagingListPage` → `MessagingScreen` |
| `/messages/new` | `NewConversationPage` (param `seller` → redirige vers `/messages/:id`) |
| `/messages/:conversationId` | `ChatPage` → `ChatScreen` (pleine hauteur, composer fixe) |

**Demandes, matching, missions, paiements**

| Route | Composant | Rôle dans le flux |
|---|---|---|
| `/orders` | `OrdersPage` | liste des demandes |
| `/orders/new` | `RequestWizardPage` → `RequestWizardScreen` | wizard 7 étapes (`Step1Service`→`Step7Review`) |
| `/orders/matching/:requestId` | `MatchingSearchPage` → `MatchingSearchScreen` | matching après création |
| `/orders/proposals/:requestId` | `ProposalsListPage` → `ProposalsListScreen` | propositions reçues |
| `/orders/proposals/:requestId/:proposalId` | `ProposalDetailPage` → `ProposalDetailScreen` | détail d'une proposition |
| `/orders/:id` | `RequestDetailPage` | détail de la demande |
| `/orders/tracker/:id` | `MissionTrackerPage` → `MissionTrackerScreen` | suivi mission + statuts |
| `/orders/review` | `ReviewPage` (consomme `state.mission`) | avis post-mission |
| `/orders/dispute/:id` | `DisputePage` | litige |
| `/orders/cancel/:id` | `CancellationPage` | annulation |
| `/orders/report` | `ReportPage` | signalement |
| `/orders/qr-payment` | `QRPaymentPage` | paiement QR |
| `/orders/invoice` | `InvoicePage` | facture (consomme `state.mission`) |
| `/orders/quote/create/:requestId` | `QuoteCreatePage` | création de devis |
| `/orders/quote/:requestId` | `QuoteReviewPage` | validation de devis |
| `/orders/payment/:requestId` | `EscrowPaymentPage` | paiement séquestre |

**Profil client**

| Route | Composant |
|---|---|
| `/profile` | `ProfilePage` (redirige vers `/profile/edit`) |
| `/my-profile` | `UnifiedProfilePage` (tabs rôles client/pro/supplier + trust score) |
| `/profile/settings` | `AppSettingsPage` → `AppSettingsScreen` |
| `/profile/payments` | `ClientPaymentsPage` |
| `/profile/addresses` | `ClientAddressesPage` |
| `/profile/notifications` | `ClientNotificationsPage` |
| `/profile/help` | `ClientHelpPage` |
| `/profile/edit` | `EditProfilePage` |
| `/profile/security` | `SecurityPage` |
| `/profile/language` | `LanguagePage` |
| `/profile/terms` | `TermsPage` |

**Profil pro (client) — garde `RequireMode mode="pro"` inline**

| Route | Composant |
|---|---|
| `/profile/pro-edit` | `ProEditPage` |
| `/profile/pro-verification` | `ProVerificationPage` |
| `/profile/pro-finances` | `ProFinancesPage` |
| `/profile/pro-subscription` | `ProSubscriptionPage` |
| `/profile/pro-planning` | `ProPlanningPage` |
| `/profile/pro-notifications` | `ProNotificationsPage` |
| `/profile/pro-help` | `ProHelpPage` |
| `/profile/pro-missions` | `ProMissionListPage` |
| `/profile/pro-preview` | `ProPreviewPage` (hors RequireMode) |

**Vérification**

| Route | Composant |
|---|---|
| `/verify/phone` | `VerifyPhonePage` |
| `/verify/email` | `VerifyEmailPage` |
| `/verify/identity` | `VerifyIdentityPage` |

**Abonnement client**

| Route | Composant |
|---|---|
| `/settings/subscription` | `SubscriptionDashboardPage` |
| `/settings/subscription/plans` | `SubscriptionPlansPage` |
| `/settings/subscription/payment` | `SubscriptionPaymentPage` |
| `/settings/subscription/history` | `SubscriptionHistoryPage` |
| `/settings/subscription/invoices` | `SubscriptionInvoicesPage` |

**Marketplace**

| Route | Composant |
|---|---|
| `/marketplace` | `MarketplaceHome` (redirige `/catalog`) |
| `/marketplace/boutiques` | `BoutiquesPage` (params `vertical`, `online`, `surplace`) |
| `/marketplace/register` | `SellerRegistrationPage` (wizard 3 étapes) |
| `/marketplace/shop/:sellerId` | `ShopPage` (param `v=2` → `ShopScreenV2`) |
| `/marketplace/supplier/:sellerId` | `ShopPage` (variante pro) |
| `/marketplace/browse/:vertical` | `CategoryExplore` (params `q`, `sub`, `sort`, prix…) |
| `/marketplace/item/:productId` | `ProductDetail` |
| `/marketplace/:categoryId` | `BrowseProducts` (params filtres) |
| `/marketplace/cart` | `CartPage` |
| `/marketplace/checkout` | `CheckoutPage` |
| `/marketplace/order/confirm/:orderId` | `OrderConfirmationPage` |
| `/marketplace/orders` | `MyOrdersPage` |

**Routes encore actives de l'ex-plateforme explorer**

| Route | Composant |
|---|---|
| `/explorer/pro/:id` | `ProProfilePage` |
| `/explorer/design-provider/:id` | `ProviderProfileScreen` |

### 3.3 Espace professionnel — `AuthGate` → `RequireMode mode="pro"` → `ProLayout`

| Route | Composant |
|---|---|
| `/pro/onboarding` | `ProOnboardingPage` (menu 13 étapes, voir §5.2) |
| `/pro/onboarding/:step` | `ProOnboardingPage` (étape pilotée par URL) |
| `/pro/dashboard` | `ProDashboardScreen` (pilotage mission + statuts) |
| `/pro/services` | `ProServicesPage` |
| `/pro/revenues` | `ProRevenusPage` |
| `/pro/wallet` | `ProWalletPage` |
| `/pro/messages` | `ProMessagesPage` |
| `/pro/messages/:conversationId` | `ProMessagesPage` |
| `/pro/mission/:id` | `ProMissionDetailPage` |
| `/pro/missions` | `ProMissionsPage` |
| `/pro/gallery` | `ProGalleryPage` |
| `/pro/stats` | `ProStatsPage` |
| `/pro/badges` | `ProBadgesPage` |
| `/pro/security` | `ProSecurityPage` |
| `/pro/settings` | `ProSettingsPage` |
| `/pro/support` | `ProSupportPage` |
| `/pro/about` | `ProAboutPage` |
| `/pro/professional-identity` | `ProProfessionalIdentityPage` |
| `/pro/payment-methods` | `ProPaymentMethodsPage` |
| `/pro/withdraw` | `ProWithdrawPage` |
| `/pro/withdrawals` | `ProWithdrawalsPage` |
| `/pro/bank-accounts` | `ProBankAccountsPage` |
| `/pro/currency` | `ProCurrencyPage` |
| `/pro/timezone` | `ProTimezonePage` |
| `/pro/appearance` | `ProAppearancePage` |
| `/pro/privacy` | `ProPrivacyPage` |
| `/pro/phone` | `ProPhonePage` |
| `/pro/email` | `ProEmailPage` |
| `/pro/subscription` | `ProSubscriptionDashboardPage` |
| `/pro/subscription/plans` | `ProSubscriptionPlansPage` |
| `/pro/boost` | `ProBoostPage` |
| `/pro/credits` | `ProCreditsPage` (alias `ProCreditsPage2`) |

**Redirects pro → profil (`<Navigate replace />`)**

| Route | Redirige vers |
|---|---|
| `/pro/preview` | `/profile/pro-preview` |
| `/pro/edit` | `/profile/pro-edit` |
| `/pro/planning` | `/profile/pro-planning` |
| `/pro/notifications` | `/profile/pro-notifications` |

### 3.4 Portail fournisseur — `AuthGate` → `SupplierLayout`

| Route | Composant |
|---|---|
| `/supplier/register` | `SupplierRegisterPage` (hors `SupplierLayout`) |
| `/supplier/dashboard` | `SupplierDashboardPage` |
| `/supplier/products` | `SupplierProductsPage` |
| `/supplier/products/new` | `SupplierProductNewPage` |
| `/supplier/products/:id/edit` | `SupplierProductEditPage` |
| `/supplier/stock` | `SupplierStockPage` |
| `/supplier/orders` | `SupplierOrdersPage` |
| `/supplier/orders/:id` | `SupplierOrderDetailPage` |
| `/supplier/picking` | `SupplierPickingPage` |
| `/supplier/clients` | `SupplierClientsPage` |
| `/supplier/clients/:id` | `SupplierClientDetailPage` |
| `/supplier/promotions` | `SupplierPromotionsPage` |
| `/supplier/payments` | `SupplierPaymentsPage` |
| `/supplier/payments/:id` | `SupplierPaymentDetailPage` |
| `/supplier/invoices` | `SupplierInvoicesPage` |
| `/supplier/invoices/:id` | `SupplierInvoiceDetailPage` |
| `/supplier/documents` | `SupplierDocumentsPage` |
| `/supplier/disputes` | `SupplierDisputesPage` |
| `/supplier/disputes/:id` | `SupplierDisputeDetailPage` |
| `/supplier/deliveries` | `SupplierDeliveriesPage` |
| `/supplier/deliveries/:id` | `SupplierDeliveryDetailPage` |
| `/supplier/delivery-zones` | `SupplierDeliveryZonesPage` |
| `/supplier/balance` | `SupplierBalancePage` |
| `/supplier/import` | `SupplierImportPage` |
| `/supplier/stats` | `SupplierStatsPage` |
| `/supplier/profile` | `SupplierProfilePage` |
| `/supplier/settings` | `SupplierSettingsPage` |

### 3.5 Espace admin — `AdminInitGate` → `AdminAuthGate` → `AdminLayout`

| Route | Composant |
|---|---|
| `/admin/login` | `AdminLoginPage` (hors `AdminLayout`) |
| `/admin/dashboard` | `AdminDashboardPage` |
| `/admin/clients` / `/admin/clients/:id` | `AdminClientsPage` / `AdminClientDetailPage` |
| `/admin/pros` / `/admin/pros/:id` | `AdminProsPage` / `AdminProDetailPage` |
| `/admin/verifications` | `AdminVerificationsPage` |
| `/admin/applications` / `:id` | `AdminApplicationsPage` / `AdminApplicationDetail` |
| `/admin/missions` / `:id` | `AdminMissionsPage` / `AdminMissionDetailPage` |
| `/admin/payments` | `AdminPaymentsPage` |
| `/admin/support` / `:id` | `AdminSupportPage` / `AdminSupportTicketDetail` |
| `/admin/reports` | `AdminReportsPage` |
| `/admin/subscriptions` | `AdminSubscriptionsPage` |
| `/admin/plans` | `AdminPlansPage` |
| `/admin/features` | `AdminFeaturesPage` |
| `/admin/feature-flags` | `AdminFeatureFlagsPage` |
| `/admin/invoices` | `AdminInvoicesPage` |
| `/admin/coupons` | `AdminCouponsPage` |
| `/admin/notifications` / `create` | `AdminNotificationsPage` / `AdminNotificationCreatePage` |
| `/admin/categories` | `AdminCategoriesPage` |
| `/admin/promotions` | `AdminPromotionsPage` |
| `/admin/cms` | `AdminCMSPage` |
| `/admin/roles` | `AdminRolesPage` |
| `/admin/fraud` | `AdminFraudPage` |
| `/admin/analytics` | `AdminAnalyticsPage` |
| `/admin/analytics/revenue` | `AdminRevenueAnalyticsPage` |
| `/admin/settings` | `AdminSettingsPage` |
| `/admin/logs` | `AdminLogsPage` |
| `/admin/suppliers` / `:id` / `applications` | `AdminSuppliersPage` / `AdminSupplierDetailPage` / `AdminSupplierApplicationsPage` |
| `/admin/disputes` / `:id` | `AdminDisputesPage` / `AdminDisputeDetailPage` |
| `/admin/deliveries` / `:id` | `AdminDeliveriesPage` / `AdminDeliveryDetailPage` |

### 3.6 Redirects legacy (espace client)

| Route source | Cible |
|---|---|
| `/explorer` | `/` |
| `/requests`, `/requests/*` | `/orders` |
| `/explorer/request-creation` | `/orders/new` |
| `/explorer/pro-selection`, `/explorer/categories`, `/explorer/search`, `/explorer/category/:id`, `/explorer/matching`, `/explorer/matching/success` | `/search` |
| `/subscription/plans`, `/subscription/compare` | `/settings/subscription/plans` |
| `/subscription/success`, `/client/subscription` | `/settings/subscription` |
| `/client/subscription/plans` | `/settings/subscription/plans` |
| `/client/subscription/payment` | `/settings/subscription/payment` |
| `/client/subscription/history` | `/settings/subscription/history` |
| `/client/subscription/invoices` | `/settings/subscription/invoices` |

---

## 4. Hiérarchie des écrans

### 4.1 Home (hub) — `/`
`HomePage` → `ModernHomeScreen` (`src/components/ModernHomeScreen.tsx`)
- Header : cloche de notifications + bouton hamburger → `HamburgerDrawer`
- **Location picker** (inline sheet avec détection GPS)
- Search bar héro → `/search`
- Chips **9 branches** (`SEARCH_BRANCHES`) → `/search?branch=<id>`
- CTA **« Créer une demande »** → `/orders/new`
- Hero 2 colonnes Freelance (`/freelance`) / Marketplace (`/marketplace`)
- Sections : Services à domicile (`/professionals?category=`), Freelances en vedette (`/freelance`), Boutiques d'Abidjan (`/marketplace/boutiques` + cartes → `/marketplace/shop/:id`), Produits populaires (→ `/marketplace`, cartes → `/marketplace/item/:id`)

### 4.2 Recherche — `/search`
`SearchPage` → machine 3 niveaux :
1. écran d'accueil recherche (tendances, suggestions)
2. saisie `q` / filtre `branch`
3. résultats → `/professionals?category=`, `/catalog?product=`, `/catalog?supplier=`, `/explorer/pro/:id`

### 4.3 Catalogue — `/catalog`
`CatalogPage`
- `parseSearchParams` lit `q, vert, sort, min, max, cond, loc, sub, rental`
- `updateParam` (change de `vert` ⇒ purge `sub`)
- chips supprimables (Location `KeyRound`, sous-catégorie), `activeFilterCount`, titre de section dynamique (`subLabel` ou « Location »)
- cartes : `CatalogProductCard` (badge « Location » si `rental`), `CatalogSupplierCard`
- actions : panier `/marketplace/cart`, fiche `/marketplace/item/:id`, boutique `/marketplace/shop/:id`

### 4.4 Demande → Mission (client)
`RequestWizardPage` → `RequestWizardScreen` (wizard 7 étapes, `StepIndicator`) → soumission (`addRequest` + alertes + `rankProfessionals` + propositions mock) → **`/orders/matching/:requestId`**
`MatchingSearchPage` → `MatchingSearchScreen` (spinner, statuts de matching)
`ProposalsListPage` → `ProposalsListScreen` (liste des propositions)
`ProposalDetailPage` → `ProposalDetailScreen` (accepte → mission)
`RequestDetailPage` → détail demande
`MissionTrackerPage` → `MissionTrackerScreen`
- pipeline : `["accepted","paid","in_progress","completed","client_validation","closed"]`
- actions : `onReview` → `/orders/review` (state.mission), `onDispute` → `/orders/dispute/:id`, `onCancel` → `/orders/cancel/:id`, chat → `/messages/:convId`, devis → `/orders/quote/:requestId`
`ReviewPage` / `DisputePage` / `CancellationPage` / `ReportPage` → retours vers `/orders`

### 4.5 Pro (dashboard) — `/pro/dashboard`
`ProDashboardScreen` (`src/components/ProDashboardScreen.tsx`)
- `STATUS_FLOW = ["accepted","en_route","arrived","photos_taken","in_progress","completed","client_validation"]`
- étapes pilotées par `ProControlPanel` (accept → en_route → arrived → photo avant → in_progress → photo après → completed)
- sous-composants : `MissionDetailSheet`, `PricingChooser`, carte Leaflet, capture photo, chrono, chat, upsell premium, graphique revenus
- lien devis : `/orders/quote/create/<jobId>`

### 4.6 Marketplace
- `/marketplace/boutiques` : `BoutiquesPage` (filtres `vertical`, `online`, `surplace` ; `BoutiqueView` ; cartes → `/marketplace/shop/:id`)
- `/marketplace/shop/:sellerId` : `ShopPage` → `ShopScreen` (v1) ou `ShopScreenV2` (`?v=2`) ; composes `ShopHero`, `ShopHeader`, `ShopInfo`, `ShopFeaturedProducts`, `ShopProducts`, `ShopReviews`, `ShopAbout`, `ShopCatalog` ; CTA → `/messages/new?seller=`
- `/marketplace/item/:productId` : `ProductDetail` (gallery, specs, vendeur, matériel, devis, panier, partage)
- `/marketplace/register` : `SellerRegistrationPage` → wizard 3 étapes (`Step1SellerType` → `Step2ShopInfo` → `Step3Verification`), `sellerRegistrationStore` persisté, POST `/api/sellers`
- `/marketplace/cart` → `/marketplace/checkout` → `/marketplace/order/confirm/:orderId`

### 4.7 Onboarding pro
`ProOnboardingPage` → route `/pro/onboarding/:step` (URL-driven). Étapes (définies dans `src/types.ts`, `ONBOARDING_STEPS`) :
`welcome → eligibility → categories → location → info → documents → portfolio → otp-phone → otp-email → payment → cgu → review → pending`
- `OnboardingLayout` + 11 composants d'étape, `proOnboardingStore` (localStorage `cm_pro_onboarding`)
- submit → `setPro()` → `/pro/dashboard`

### 4.8 Onboarding client
`OnboardingPage` → `UnifiedOnboardingScreen` : machine d'états interne (`step` state), auth par OTP (phone/email) → découverte → upsell premium ; 3 boutons de mode démo.

---

## 5. Flux par rôle

### 5.1 Client

```
/onboarding (si non connecté → AuthGate redirige)
  ↓
/  (home) → /search → /professionals | /freelance | /marketplace* | /catalog
  ↓ CTA « Créer une demande »
/orders/new (wizard 7 étapes, draft persisté cm_request_draft)
  ↓ soumission
/orders/matching/:requestId
  ↓ propositions
/orders/proposals/:requestId  →  /orders/proposals/:requestId/:proposalId
  ↓ acceptation
/orders/tracker/:id
  ↓ mission terminée
/orders/review (avis) → /orders
  ├─ litige   → /orders/dispute/:id
  ├─ annulation → /orders/cancel/:id
  ├─ paiement → /orders/payment/:requestId | /orders/qr-payment
  └─ facture  → /orders/invoice
  ├─ devis    → /orders/quote/create/:requestId → /orders/quote/:requestId
  └─ chat     → /messages/:conversationId

Marketplace client :
/marketplace/boutiques → /marketplace/shop/:sellerId → /marketplace/item/:productId
→ /marketplace/cart → /marketplace/checkout → /marketplace/order/confirm/:orderId
→ /marketplace/orders
→ contact vendeur : /messages/new?seller=<id>
```

### 5.2 Professionnel

```
/pro/onboarding/:step (13 étapes URL-driven, store persisté)
  ↓ submit
/pro/dashboard
  ↓ mission acceptée
ProControlPanel : accepted → en_route → arrived → photos_taken → in_progress → completed
  ↓
client_validation (attente client) → terminé
Espaces annexes : /pro/missions · /pro/mission/:id · /pro/revenues · /pro/wallet
· /pro/messages · /pro/services · /pro/gallery · /pro/stats · /pro/badges
· /pro/settings (+ sécurité, support, préférences)
· /pro/subscription · /pro/boost · /pro/credits
Paramètres pro legacy → /profile/pro-* (redirects /pro/*)
```

### 5.3 Fournisseur

```
/supplier/register (hors layout)
  ↓
/supplier/dashboard
├─ /supplier/products (+ new, :id/edit)
├─ /supplier/stock
├─ /supplier/orders → /supplier/orders/:id → /supplier/picking
├─ /supplier/clients → :id (contact wa.me / tel)
├─ /supplier/deliveries → :id
├─ /supplier/payments → :id
├─ /supplier/invoices → :id
├─ /supplier/documents · /supplier/import
├─ /supplier/disputes → :id
├─ /supplier/delivery-zones
├─ /supplier/balance
├─ /supplier/promotions
├─ /supplier/stats
└─ /supplier/profile · /supplier/settings
Notifications → navigation par type (NOTIFICATION_ACTIONS) : /supplier/orders|payments|stock|disputes|deliveries|documents|balance|promotions
```

### 5.4 Admin

```
/admin/login (AdminAuthGate)
  ↓
/admin/dashboard (sidebar 28 entrées filtrées par permissions usePermissions)
├─ gestion entités : clients, pros, verifications, applications, missions, suppliers
├─ paiements & factures : payments, invoices, coupons
├─ contenus : categories, promotions, cms, notifications(+ create)
├─ qualité : support, reports, fraud, disputes
├─ ops : feature-flags, subscriptions, plans, features, deliveries
└─ pilotage : analytics, analytics/revenue, settings, logs
Détails : /admin/<entité>/:id (breadcrumb + actions)
```

---

## 6. Composants de navigation

### 6.1 En-tête & retour

| Composant | Fichier | Rôle |
|---|---|---|
| `PageHeader` | `src/components/ui/PageHeader.tsx` | header sticky (blur, bordure) : titre, sous-titre, `rightAction`, bouton retour via `useBackNavigation(fallbackRoute)` (défaut `/`) |
| `BackButton` | `src/components/ui/BackButton.tsx` | bouton retour simple, même mécanique |
| `useBackNavigation(fallbackRoute)` | `src/hooks/useBackNavigation.ts` | `location.state.from` sinon `fallbackRoute`, `navigate(from, { replace: true })` — ~60 écrans |

### 6.2 Menus & bascule de mode

| Composant | Fichier | Détails |
|---|---|---|
| `RoleSwitcher` | `src/components/ui/RoleSwitcher.tsx` | menu déroulant, `MODE_CONFIG` (client→`/`, pro→`/pro`, supplier→`/supplier`) ; `setActiveMode` + navigate ; rendu si `availableModes.length > 1` |
| `HamburgerDrawer` | `src/components/HamburgerDrawer.tsx` | `Drawer` gauche animé (spring, Escape, scroll lock) ; sections `menuConfig.ts` ; **scroll-to-top si lien actif** ; logout via `ConfirmModal` ; navigate avec `state: { fromHamburger: true }` |
| `DrawerHeader/Section/Item` | `src/components/drawer/*` | sous-composants du drawer |
| `menuConfig.ts` | `src/data/menuConfig.ts` | `PRO_SECTION` (Devenir prestataire), `ACCOUNT_SECTION` (Mes favoris `/favorites`, Paramètres `/profile/settings`, Changer de mode disabled), `SUPPORT`, `PREFERENCES`, `LEGAL`, `LOGOUT_ITEM` |

### 6.3 Sidebars

| Composant | Fichier | Détails |
|---|---|---|
| `SupplierLayout` | `src/components/supplier/SupplierLayout.tsx` | sidebar fixe 260px (18 `NAV_ITEMS`, `NavLink` isActive, scroll-to-top si lien actif), drawer mobile, topbar + `NotificationBell`/`NotificationPanel` + `RealtimeNotificationsProvider` |
| `AdminLayout` | `src/components/admin/AdminLayout.tsx` | sidebar collapsible 64/260px filtrée par permissions, `AdminSidebar`/`AdminTopbar`/`AdminBreadcrumb`, footer ; redirige `/admin/login` si non auth |

### 6.4 Wizards / piles d'étapes

| Wizard | Fichiers | Étapes |
|---|---|---|
| Demande | `RequestWizardScreen` + `Step1..7` (`src/components/wizard/`) | 7 étapes, `StepIndicator`, store persisté `cm_request_draft` |
| Onboarding pro | `ProOnboardingPage` + `ONBOARDING_STEPS` (`src/types.ts`) | 13 étapes URL-driven |
| Inscription vendeur | `SellerRegistrationPage` + `Step1SellerType/2ShopInfo/3Verification` | 3 étapes, segments animés, store persisté |
| Matching | `MatchingSearchScreen` | écran de matching animé |

### 6.5 Overlays & modales

| Composant | Fichier | Type | Usage |
|---|---|---|---|
| `BottomSheet` | `src/components/BottomSheet.tsx` | sheet bas (spring, backdrop, 85dvh, Escape) | settings (photo, nom, téléphone…), `CatalogPage`, `BrowseProducts`, `CategoryExplore` |
| `Modal` | `src/components/admin/ui/Modal.tsx` | modale centrée (pas d'animation) | ~15 pages admin |
| `PhotoCaptureModal` | `src/components/PhotoCaptureModal.tsx` | bottom sheet + caméra/galerie + aperçu | capture photo mission/profil |
| `RouteMapModal` | `src/components/RouteMapModal.tsx` | modale centrée spring + Leaflet | itinéraire, lien Google Maps |
| `ImageViewer` | `src/components/ImageViewer.tsx` | plein écran `bg-black/95`, prev/next | `InvoiceScreen` |
| `FilterSheet` | `src/components/FilterSheet.tsx` | sheet (CSS `animate-slide-up`) | `ExplorerScreen` |
| Location picker | inline dans `ModernHomeScreen` | sheet + GPS | home |
| `MissionDetailSheet`, `PricingChooser` | inline dans `ProDashboardScreen` | sheets | dashboard pro |
| `ConfirmModal` | inline dans `HamburgerDrawer` | modale `z-[60]` | confirmation logout |
| `NotificationPanel` | `src/components/ui/NotificationPanel.tsx` | variantes `sheet`/`dropdown` | notifications client (mark-read uniquement) ; panel fournisseur navigate |

### 6.6 Infrastructure

| Composant | Rôle |
|---|---|
| `ErrorBoundary` (`src/components/ui/ErrorBoundary.tsx`) | par page (dans `Layout`) |
| `ErrorFallback` (`src/main.tsx`) | crash global : message + bouton « Recharger la page » |
| `PageLoader` (`src/main.tsx`) | fallback `Suspense` + gardes (`PageLoader` spinner) |

---

## 7. Guards & authentification

Définis dans `src/main.tsx` et `src/components/auth/RequireMode.tsx` :

| Garde | Fichier | Comportement |
|---|---|---|
| `AuthGate` | `src/main.tsx` | attend `initialized`/`isLoading` (timeout 10s), sinon `<Navigate to="/onboarding" replace />` si non connecté |
| `AdminInitGate` | `src/main.tsx` | lance `initialize()` du store admin, affiche `PageLoader` |
| `AdminAuthGate` | `src/main.tsx` | si admin non authentifié → `/admin/login` |
| `RequireMode` | `src/components/auth/RequireMode.tsx` | `mode: "client"\|"pro"\|"supplier"`, `fallback` (défaut `/`) : non auth → `/onboarding` ; `mode="pro"` sans pro → fallback ; `mode="client"` en mode pro → fallback (`/pro/dashboard` si défaut) |
| `FeatureGuard` | `src/pages/subscription/FeatureGuard.tsx` | paywall : redirige `window.location.href = "/settings/subscription/plans"` |

Chaînage dans le routeur :

- Client : `AuthGate` → `AppLayout` (avec `RequireMode mode="pro"` inline pour `/profile/pro-*`)
- Pro : `AuthGate` → `RequireMode mode="pro"` → `ProLayout`
- Fournisseur : `AuthGate` → `SupplierLayout` (hors register)
- Admin : `AdminInitGate` → `AdminAuthGate` → `AdminLayout`

Stores :

- `src/stores/authStore.ts` (zustand + supabase) : `user`, `admin`, `permissions`, `activeMode`, `availableModes`, `initialize()`, `signInWithPhone/Email`, `verifyOtp`, `adminLogin`, `adminDemoLogin`, `hasPermission`, `logout`
- `src/stores/adminAuthStore.ts` : façade lecture seule (`isAuthenticated = admin !== null`, `login`, `demoLogin`, `logout`, `hasPermission`)
- `src/stores/locationStore.ts` : géolocalisation (déclenchée au premier rendu client)

---

## 8. Deep links & état

### 8.1 Deep links par query/path params (de-facto)

| URL | Paramètres | Fichier |
|---|---|---|
| `/catalog` | `q, vert, sort, min, max, cond, loc, sub, rental=1` | `src/pages/CatalogPage.tsx` (`parseSearchParams`/`updateParam`) |
| `/search` | `q, branch` (via `getSearchBranchById`) | `src/pages/SearchPage.tsx` |
| `/professionals` | `category` | `src/components/ProfessionalListingScreen.tsx` |
| `/freelance` | `category` | `src/components/FreelanceListingScreen.tsx` |
| `/marketplace/boutiques` | `vertical, online=1, surplace=1` | `src/pages/marketplace/BoutiquesPage.tsx` |
| `/marketplace/shop/:sellerId` | `v=2` (variante ShopScreenV2) | `src/pages/marketplace/ShopPage.tsx` |
| `/marketplace/browse/:vertical` | `q, sub, sort, min, max, cond, loc` | `src/components/marketplace/CategoryExplore.tsx` |
| `/marketplace/:categoryId` | `q, sort, min, max, cond, loc` | `src/components/marketplace/BrowseProducts.tsx` |
| `/messages/new` | `seller` (crée/ouvre la conversation) | `src/pages/client/NewConversationPage.tsx` |
| `/marketplace/item/:productId` | — | `src/components/marketplace/ProductDetail.tsx` |

### 8.2 Navigation par état : flags & flow

`location.state` n'est plus utilisé pour la navigation. Deux mécanismes du store `cm_navigation` le remplacent :

| Mécanisme | Usage | Exemple |
|---|---|---|
| `flow` | données critiques d'un flux transactionnel (mission → review/invoice) | `MissionTrackerPage` → `startFlow("mission", mission)` ; `ReviewPage`/`InvoicePage` → `getFlow<Mission>("mission")` |
| `flags` | marqueurs de navigation (provenance hamburger, rouvrir le menu) | `HamburgerDrawer` → `setFlag("from-hamburger", true)` ; pages abonnement/profil → `getFlag("from-hamburger")` ; retour → `setFlag("reopen-menu", true)` + `navigate("/")` ; `ExplorerScreen` lit le flag de façon réactive puis le clear |

Règles :
- `state.from` est supprimé : le retour passe par `goBack()` / `complete()`, jamais par `location.state.from`.
- Un flag est toujours consommé **et effacé** (`clearFlag`) dans le composant qui le lit.
- `ExplorerScreen` lit `flags["reopen-menu"]` via `useNavigationStore((s) => s.flags["reopen-menu"] === true)`, rouvre le drawer, puis `clearFlag("reopen-menu")`.

### 8.3 Partage / liens externes

- **Web Share API** : `ShopHero.tsx:26`, `ShopScreenV2.tsx:52` (`navigator.share` + fallback clipboard). `ProductDetail` importe `Share2` sans l'utiliser.
- **WhatsApp** : `wa.me/<téléphone>` dans `ShopHero`, `ShopScreenV2`, `ShopInfo`, `SupplierClientDetailScreen`.
- **Téléphone** : `tel:` dans `ProControlPanel`, `ProDashboardScreen`, `PracticalInfoSection`, `SupplierClientDetailScreen`, et `window.location.href = tel:` dans `SupplierOrderDetailScreen`.
- **Google Maps** : `RouteMapModal.tsx:93`.
- **PDF facture** : `window.open(invoice.pdf_url)` (`SubscriptionInvoicesPage`).

### 8.4 PWA & service worker

- **Pas de manifest** (`public/` sans `manifest.*`), pas de `vite-plugin-pwa` → **l'app n'est pas installable en PWA**.
- `public/sw.js` : ne sert que les **push notifications** (`install`/`activate`/`push`/`notificationclick`). `CACHE_NAME` déclaré mais **jamais utilisé** (aucun handler `fetch`, pas d'offline).
- `notificationclick` : cible = `data.url \|\| "/orders"` ; si un onglet existe → `postMessage({type:"NAVIGATE"})` sinon `openWindow`. **Aucun listener `NAVIGATE` dans `src/`** → seul le cas `openWindow` fonctionne.
- Icônes SW : `sw.js` référence `/vite.svg`, inexistant (seuls `favicon.svg`, `logo.svg` existent).

---

## 9. Bouton retour

### 9.1 Mécanique standard

`goBack()` (`src/navigation/useAppNavigation.ts`) est le retour standard. Il remplace `useBackNavigation` + `state.from` et délègue à `resolveBackAction` (`src/navigation/navigationService.ts`) :

1. Pile in-app non vide **ET** `window.history.length > 1` → `navigate(-1)` (retour historique).
2. Sinon → fallback du graph en `replace` (`navigationGraph.ts`) — jamais de retour sauvage vers `/`.

```ts
const { goBack } = useAppNavigation();
// retour précis s'il existe une page précédente, sinon fallback du graph
goBack();
```

Consommé par `PageHeader`, `BackButton`, et tous les boutons retour (marketplace, abonnement, profil, pro, admin). `useBackNavigation` ne survit que dans `ProductDetail.tsx`.

### 9.2 Retour historique & clôture de flux

- `goBack()` encapsule tout `navigate(-1)` : **aucun composant n'appelle `navigate(-1)` directement** (seul `useAppNavigation` le fait).
- Les écrans transactionnels se ferment avec `complete({ flow? })` : vide la pile, termine le flow (si fourni), puis `replace` vers le `completion` (sinon le fallback) du graph. `to` force une destination dynamique (ex. `/marketplace/order/confirm/:orderId`).

Consommateurs : `ReviewPage`, `InvoicePage`, `QRPaymentPage`, `ProWithdrawPage`, `AdminNotificationCreatePage`, `SubscriptionPaymentPage`, `CheckoutPage`, `QuoteCreatePage`, `EscrowPaymentPage`, etc. → impossibilité de revenir en arrière après la clôture.

### 9.3 Cas particuliers

| Cas | Comportement |
|---|---|
| **Pile marketplace** | boutons retour → `goBack()` (pile in-app) |
| **Deux variantes boutique** | `goBack()` quel que soit `v=2` |
| **Post-paiement / avis** | `complete()` → `replace` vers la completion du graph (flux fermé, pile vidée) |
| **Chat** | retour forcé `/messages` (`ChatPage`) |
| **Depuis le hamburger** | `setFlag("from-hamburger", true)` avant `navigate` ; pages abonnement/profil → `getFlag("from-hamburger")` → retour = `setFlag("reopen-menu", true)` + `navigate("/")` |
| **Réouverture du menu** | `ExplorerScreen` lit `flags["reopen-menu"]` de façon réactive, rouvre le drawer, puis `clearFlag("reopen-menu")` |
| **Redirects pro** | `/pro/edit` etc. → `<Navigate replace>` vers `/profile/pro-*` (retour par `goBack()`) |
| **Legacy** | `/explorer/*`, `/requests/*`, `/subscription/*`, `/client/subscription/*` → `<Navigate replace>` (retour géré par le graph) |

---

## 10. Cas particuliers & problèmes détectés

### 10.1 Deep links incomplets (écrits, jamais lus)

- `SearchPage.tsx:184,187` et `ModernHomeScreen.tsx:388` produisent `/catalog?product=<id>` et `/catalog?supplier=<id>` ; **`CatalogPage` ne lit jamais `product`/`supplier`**. Clic = catalogue vide à la place de la fiche/boutique ciblée.

### 10.2 Code mort / non routé

- `SubscriptionSuccessPage` : **supprimée** (fichier + lazy import). La route `/subscription/success` reste un `<Navigate to="/settings/subscription">` pour préserver les liens legacy.
- `actionUrl` (`notificationStore.ts`) : renseigné par plusieurs stores (escrow, matching, project, quote, report, cancellation, dispute) mais **jamais lu** → pas de navigation notification→destination.
- SW `NAVIGATE` : `sw.js:44` poste `{type:"NAVIGATE", url}` mais aucun `onmessage` dans `src/` → les clics de push sur un onglet ouvert ne naviguent pas.
- Orphelins : `screens/ExplorerScreen.tsx` (aucun import), `screens/SearchScreen.tsx` + `screens/CategorySelectScreen.tsx` (lazy-importés dans `main.tsx` mais **jamais routés**), `MarketplaceHome` (redirige `/catalog`).
- `ExplorerScreen` lui-même n'est plus monté par aucune route (les redirections legacy le rendent inaccessible).

### 10.3 PWA

- Pas de manifest → **pas installable** ; pas de handler `fetch` → **pas d'offline** ; icône `/vite.svg` manquante dans `sw.js`.

### 10.4 Navigation mobile

- **Absence de tab bar** côté client : tout passe par le hamburger. Les zones hautes en frequence (Messages, Ordres, Profil) demandent 2 taps.
- Éléments de menu sans route/action : « Changer de mode » (`disabled`), « Signaler un problème », « Inviter un ami » (`menuConfig.ts:84`), « Noter l'application », « À propos » → clics silencieux.

### 10.5 État perdu au refresh

`location.state` n'est plus utilisé : les données critiques passent par `flow` (persisté en sessionStorage `cm_navigation_flow`) et les marqueurs par `flags`. Un `F5` conserve donc mission/booking, mais les écrans qui ne trouvent pas leur `flow` se protègent : `ReviewPage`/`InvoicePage`/`QRPaymentPage` font `complete({ flow: "mission" })` si `getFlow` est vide (redirection propre au lieu d'un écran vide).

### 10.6 Scroll & navigation

- Scroll-to-top sur changement de pathname : `Layout.tsx:37` (instant) ; **scroll-to-top sur lien actif** : `HamburgerDrawer.handleNav` (`HamburgerDrawer.tsx:71`), `AppSettingsPage.handleNavigate`, `SupplierLayout.handleNavClick` (conforme à la règle UX Navigation).
- Pas de confirmation « modifications non sauvegardées » à la sortie des formulaires/wizard.

### 10.7 Géolocalisation

`Layout` déclenche `refreshLocation()` une seule fois au premier rendu client (ref). Le `RoleSwitcher` utilise `availableModes` qui dépend de l'auth (désynchronisation possible au logout).

---

## 11. Recommandations

Priorisées par impact.

### P1 — Corriger les deep links produits

**Problème** : `/catalog?product=<id>` et `/catalog?supplier=<id>` sont produits mais ignorés.

**Action** : dans `CatalogPage`, étendre `parseSearchParams` pour lire `product`/`supplier` et, si présents, afficher directement la fiche (`<ProductDetail>` en overlay ou redirect `/marketplace/item/:id`) ou la boutique (`/marketplace/shop/:id`). Lier les cartes de résultats de `SearchPage` et les produits populaires de la home à ces URLs.

### P2 — Rendre l'app installable (PWA)

**Action** : ajouter un manifest (`public/manifest.webmanifest` : `start_url: "/"`, `scope: "/"`, icônes 192/512 PNG à partir de `logo.svg`, `display: standalone`) + `<link rel="manifest">` et meta `theme-color`/`apple-touch-icon` dans `index.html`. Optionnel : `vite-plugin-pwa` avec pré-cache des assets critiques (offline).
**Corollaire** : corriger les références `/vite.svg` dans `public/sw.js`.

### P3 — Compléter la navigation des notifications

**Problème** : `actionUrl` jamais lu ; SW `NAVIGATE` sans listener ; panneau client sans click-to-navigate.

**Action** :
1. Consommer `actionUrl` dans `notificationStore` (click → `navigate(actionUrl)`).
2. Ajouter un listener `message` dans `main.tsx` : `event.data?.type === "NAVIGATE"` → `window.location.href = event.data.url` (ou navigate router).
3. Alimenter `data.url` dans les payloads de push.

### P4 — Tab bar basse côté client (évolution)

L'app client repose uniquement sur le drawer. **Proposition de pattern** (`/` accueil, explorer, messages, compte) :

```
┌─────────────────────────────┐
│  Accueil   Explorer  Messages  Compte   │  ← tab bar fixe
└─────────────────────────────┘
```

**Implémentation suggérée** :

```tsx
// src/components/ui/BottomTabBar.tsx
const TABS = [
  { to: "/", label: "Accueil", icon: Home },
  { to: "/search", label: "Explorer", icon: Compass },
  { to: "/messages", label: "Messages", icon: MessageCircle },
  { to: "/my-profile", label: "Compte", icon: User },
];

export default function BottomTabBar() {
  const location = useLocation();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-cm-border bg-cm-elevated/95 backdrop-blur-lg pb-safe">
      <div className="max-w-[448px] mx-auto grid grid-cols-4">
        {TABS.map((tab) => {
          const active = location.pathname === tab.to ||
            (tab.to !== "/" && location.pathname.startsWith(tab.to));
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              onClick={() => {
                if (location.pathname === tab.to) {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2 text-[10px] font-semibold ${
                  isActive ? "text-cm-accent" : "text-cm-text-muted"
                }`
              }
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
```

Points d'intégration :
- Montée dans `Layout.tsx` (variant client) juste après `<main>`, avec `pb-[64px]` sur le conteneur principal pour le masquage.
- **Masquage contextuel** : cachée sur les routes « immergées » — chat (`/messages/:id`), wizard (`/orders/new`, `/marketplace/register`), écrans de mission (`/orders/tracker/:id`), onboarding. Règle : `hideTabBar(pathname)` avec une liste d'exceptions explicite.
- Le drawer devient le menu « secondaire » (réglages, support, légal) via un icône avatar dans la tab Compte.
- Conserver `useBackNavigation` : les tab switches restent en `replace` (pas d'empilement d'historique) — sinon le bouton retour recréerait du scroll dans l'historique.
- Penser au badge de messages non lus (store existant `notificationStore`).

### P5 — Nettoyage du routeur

- Supprimer les lazy-imports orphelins (`SearchScreen`, `CategorySelectScreen`, `ExplorerScreen`) ou les router explicitement.
- Déplacer `SubscriptionSuccessPage` sur une vraie route (`/settings/subscription/success?type=&plan=`) et faire pointer les pages de paiement vers elle.
- Migrer les 2 routes `/explorer/pro/:id` et `/explorer/design-provider/:id` vers `/search`/`/professionals` puis supprimer tout le bloc legacy.

### P6 — Robustesse des flux à état

Persister les payloads critiques (`state.mission`, `state.booking`) dans un store (ex. `sessionStorage`) pour survivre au refresh, ou rediriger proprement vers `/orders` si le state est absent (au lieu d'un écran vide).

---

## Annexe — Fichiers de référence

| Sujet | Fichier |
|---|---|
| Routeur racine (toutes les routes, guards, lazy) | `src/main.tsx` |
| Layout commun (scroll, transitions, RoleSwitcher, chat route, geoloc) | `src/layouts/Layout.tsx` |
| Layouts dérivés | `src/layouts/AppLayout.tsx`, `src/layouts/ProLayout.tsx` |
| Sidebar fournisseur / admin | `src/components/supplier/SupplierLayout.tsx`, `src/components/admin/AdminLayout.tsx` |
| Garde de mode | `src/components/auth/RequireMode.tsx` |
| Auth | `src/stores/authStore.ts`, `src/stores/adminAuthStore.ts`, `src/stores/locationStore.ts` |
| Retour | `src/hooks/useBackNavigation.ts`, `src/components/ui/PageHeader.tsx`, `src/components/ui/BackButton.tsx` |
| Bascule de mode | `src/components/ui/RoleSwitcher.tsx` |
| Menu hamburger | `src/components/HamburgerDrawer.tsx`, `src/data/menuConfig.ts`, `src/components/drawer/*` |
| Menus de nav | `src/constants/admin/routes.ts` (`ADMIN_ROUTES`, `ADMIN_NAV_ITEMS`), `SupplierLayout` (`NAV_ITEMS`) |
| Wizard demande | `src/components/wizard/*` (`RequestWizardScreen`, `Step1`–`Step7`, `StepIndicator`) |
| Matching | `src/components/wizard/MatchingSearchScreen.tsx`, `src/pages/client/MatchingSearchPage.tsx` |
| Mission tracker / pilotage pro | `src/components/MissionTrackerScreen.tsx`, `src/components/ProControlPanel.tsx`, `src/components/ProDashboardScreen.tsx` |
| Catalogue & location | `src/pages/CatalogPage.tsx`, `src/components/marketplace/CatalogProductCard.tsx`, `src/components/marketplace/ProductDetail.tsx` |
| Recherche & listings | `src/pages/SearchPage.tsx`, `src/components/ProfessionalListingScreen.tsx`, `src/components/FreelanceListingScreen.tsx` |
| Boutiques & favoris | `src/pages/marketplace/BoutiquesPage.tsx`, `src/pages/FavoritesPage.tsx`, `src/stores/favoritesStore.ts` |
| Marketplace | `src/pages/marketplace/*`, `src/components/marketplace/*` |
| Notifications | `src/components/ui/NotificationPanel.tsx`, `src/contexts/RealtimeNotificationsContext.tsx`, `src/types/notifications.ts` |
| PWA / SW | `public/sw.js`, `index.html`, `vite.config.*` |
