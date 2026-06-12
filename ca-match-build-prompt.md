
ÇA MATCH
Agent Master Prompt — Full Product Rebuild
Version 2.0 · NEDA Digital Agency · Abidjan, Côte d'Ivoire
Give this document to your coding agent as the primary brief. It contains every screen, every component, every data model, and every rule needed to build the complete Ça Match MVP.

 

1. Project Context & Rules
Ça Match is a trust-first service marketplace for Abidjan, Côte d'Ivoire. It connects clients who need a professional with independent workers (artisans, technicians, tutors, etc.) who want more clients and a verifiable digital reputation.
 
Tech Stack (do not deviate)
Framework
Next.js 14 (App Router) — already deployed on Vercel
Styling
Tailwind CSS — already in project
Backend / DB
Supabase (Postgres + Auth + Storage)
Auth
Supabase Auth — phone number (OTP via SMS) as primary
Realtime
Supabase Realtime for messages and notifications
Storage
Supabase Storage for portfolio photos
Messaging
In-app first. WhatsApp deep link as secondary CTA
Deployment
Vercel — do not change vercel.json or env structure
 
Non-Negotiable Rules for the Agent
• Mobile-first always. Every screen must work perfectly at 375px width before desktop.
• No page should have duplicate navigation. One top bar OR one bottom bar, never both.
• No page should have the same search bar appearing twice (home hero vs. search page).
• The profile page must show completely different UI depending on user role (Client vs. Prestataire).
• All user-facing text is in French. Code, comments, and variable names in English.
• Never hard-code user data. All content must come from Supabase queries.
• Keep all existing routes that work. Only add or fix, do not delete existing pages without explicit instruction.
 

2. Immediate Bug Fixes (Priority 1)
These must be fixed before building any new feature. They break the core UX.
 
BUG 01 — Double Navigation
Problem: There is a desktop top navbar AND a mobile bottom navbar both visible on mobile, wasting screen space and creating confusion.
Fix:
• The top navbar (with Accueil / Trouver un pro / Messages / Dashboard links) should be hidden on mobile (hidden md:flex in Tailwind).
• The bottom navbar (Accueil / Recherche / Messages / Profil) is the mobile nav. Keep it.
• On desktop (md+), show the top navbar and hide the bottom bar.
 
BUG 02 — Duplicate Search on Home
Problem: The home page has (1) a hero search bar, (2) 'Services populaires' pills, and (3) 'Toutes nos catégories' grid. Items 2 and 3 serve the same purpose.
Fix:
• Keep: the hero search bar (primary entry point).
• Keep: 'Toutes nos catégories' grid (8–10 categories, 4-column on mobile).
• Remove: the 'Services populaires' pill row entirely. It is redundant with the category grid.
• The category grid items should navigate to /search?category=CATEGORY_NAME when clicked.
 
BUG 03 — Empty Search Page (/search)
Problem: The /search page renders no results because there is no data seeded and no fallback UI.
Fix:
• Seed at least 6 mock professionals in Supabase for development.
• If no results, show an empty state: icon + 'Aucun professionnel trouvé pour cette recherche' + 'Modifier la recherche' button.
• The search bar on /search should be compact (not a full hero), pre-filled with the query param from the URL.
 
BUG 04 — Profile Page Has No Real Content
Problem: /profile shows only a settings list. It does not reflect user role (Client vs. Prestataire) and provides no useful information.
Fix: See Section 4 (Client Profile) and Section 5 (Pro Profile) for the full spec.
 

3. App Architecture & Routing
 
Routes
Route
Purpose
Auth Required
/
Home — search hero + categories + top pros
No (public)
/search
Results list with filters. Params: ?q=, ?category=, ?zone=
No (public)
/pro/[id]
Public professional profile page
No (public)
/messages
Inbox list — conversations thread list
Yes
/messages/[id]
Single conversation thread
Yes
/profile
Role-aware profile. Renders ClientDashboard or ProDashboard
Yes
/profile/edit
Edit profile info, skills, zone, availability
Yes
/onboarding
3-step onboarding after first login
Yes (new users only)
/login
Phone OTP login / register
No
 
 

4. Onboarding Flow (/onboarding)
Triggered automatically after first login (check if profile.onboarding_completed = false). 3 steps, one per page, progress bar at top. No skip option on steps 1 and 2.
 
Step 1 — Role Selection
Full-screen choice. Two large cards:
• Card A: icon 🔍, title 'Je cherche un professionnel', subtitle 'Trouvez rapidement un artisan ou prestataire fiable près de vous.'
• Card B: icon 🛠️, title 'Je suis professionnel', subtitle 'Développez votre clientèle et construisez votre réputation numérique.'
Note: A user can have both roles. After MVP, add a 'Les deux' option. For now, allow switching later in /profile settings.
On select: save role to profiles.role ('client' | 'pro') in Supabase. Advance to step 2.
 
Step 2 — Basic Info
Fields (required):
• Full name (text input)
• Profile photo (optional — camera or gallery, stored in Supabase Storage)
• Neighbourhood / Zone (dropdown or text — Cocody, Yopougon, Marcory, Abobo, Plateau, Treichville, Adjamé, Port-Bouët, Other)
If role = 'pro', add these fields:
• Main service category (dropdown from categories list)
• Short bio (textarea, max 160 chars, placeholder: 'Ex: Électricien avec 8 ans d'expérience à Abidjan. Intervention rapide, devis gratuit.')
• Indicative price range (two number inputs: min – max, in FCFA)
 
Step 3 — Confirmation
Summary screen showing what was entered.
If role = 'client': CTA button 'Trouver mon premier pro →' → redirect to /search
If role = 'pro': CTA button 'Voir mon profil public →' → redirect to /pro/[id]
Set profiles.onboarding_completed = true in Supabase on confirm.
 

5. Supabase Database Schema
Create these tables if they do not exist. Use Supabase migrations.
 
Table: profiles
Column
Type
Notes
id
uuid
FK → auth.users.id, primary key
full_name
text
Required
phone
text
From Supabase Auth
avatar_url
text
URL from Supabase Storage
role
text
'client' | 'pro' — set during onboarding
zone
text
Neighbourhood in Abidjan
bio
text
Pro only. Max 160 chars
category
text
Pro only. Main service category
price_min
integer
Pro only. FCFA
price_max
integer
Pro only. FCFA
is_available
boolean
Pro only. Default true
trust_score
integer
0-100. Computed field or updated by trigger
tier
text
'Bronze' | 'Argent' | 'Or' | 'Elite'. Derived from trust_score
missions_count
integer
Total completed missions. Incremented by trigger
avg_rating
numeric(3,2)
Average of all reviews. Recomputed on new review
verified
boolean
Identity verified. Default false
response_time_avg
integer
Average response time in minutes
onboarding_completed
boolean
Default false. Set true after onboarding step 3
created_at
timestamptz
Default now()
 
Table: portfolio_items
• id uuid PK, pro_id (FK profiles.id), title text, description text, photo_url text, category text, mission_id uuid nullable, created_at timestamptz
 
Table: reviews
• id uuid PK, reviewer_id (FK profiles.id), pro_id (FK profiles.id), rating integer (1-5), comment text, mission_id uuid nullable, created_at timestamptz
Note: After insert, trigger updates profiles.avg_rating and profiles.missions_count.
 
Table: missions
• id uuid PK, client_id FK, pro_id FK, status text ('pending' | 'active' | 'completed' | 'cancelled'), service_description text, zone text, budget_estimate integer, created_at, completed_at
 
Table: messages
• id uuid PK, conversation_id uuid, sender_id FK profiles.id, content text, read boolean default false, created_at timestamptz
 
Table: conversations
• id uuid PK, client_id FK, pro_id FK, last_message_at timestamptz, mission_id uuid nullable
 

6. Home Page (/) — Full Spec
 
Layout structure (top to bottom)
 
Block 1 — Header / Hero
Background: navy (#1A1A2E). Rounded bottom corners (border-radius 28px).
• Top row: left = location pill ('📍 Cocody, Abidjan' — pulled from profiles.zone if logged in, else 'Abidjan'), right = avatar circle (initials or photo, links to /profile)
• Greeting: if logged in → 'Bonjour, [first_name] 👋', else → 'Bienvenue 👋'
• Subtitle: 'Trouvez un professionnel fiable près de chez vous.'
• Search bar: white card, 🔍 icon, placeholder 'Quel service recherchez-vous ?', CTA button 'Chercher' in orange. On submit → /search?q=QUERY
 
Block 2 — Stats Strip
3 equal cards side by side. Pull real numbers from Supabase count queries. Fallback to 0 if empty.
• Card 1: count(profiles where role='pro') + label 'Professionnels'
• Card 2: avg(profiles.avg_rating where role='pro') formatted to 1 decimal + '★' + label 'Note moyenne'
• Card 3: Static text '< 3 min' + label 'Mise en relation' (keep static for now)
 
Block 3 — Categories Grid
Section title 'Catégories' + 'Voir tout →' link. 4-column grid, 2 rows (8 categories). Tapping navigates to /search?category=NAME.
Categories: Électricien ⚡, Plombier 🔧, Menuisier 🪵, Ménage 🧹, Réparation téléphone 📱, Prof à domicile 📚, Climatisation ❄️, Coiffure ✂️, Photographie 📷, Informatique 💻
 
Block 4 — Top Professionals
Section title '⭐ Top Professionnels' + 'Voir tout →' → /search. Query: SELECT * FROM profiles WHERE role='pro' ORDER BY avg_rating DESC LIMIT 4.
Each card: ProCard component (see Section 8). Clicking the card → /pro/[id].
Empty state: 'Aucun professionnel disponible pour le moment. Revenez bientôt !'
 
Block 5 — Pro Recruitment Banner
Orange gradient card. Left: 'Vous êtes professionnel ?' + 'Rejoignez nos artisans vérifiés'. Right: 'S'inscrire →' button → /login?mode=pro
Only show if user is not logged in OR user.role = 'client'.
 

7. Search Page (/search) — Full Spec
 
Header
Navy background, compact search bar pre-filled with ?q param, back arrow, filter icon. Below: result count + zone info.
 
Filter Bar
Horizontal scroll pills: 'Proximité' (default) | 'Meilleure note' | 'Disponible' | 'Prix ↑' | 'Prix ↓'. Active pill: orange background. Selecting a filter re-sorts the result list.
 
Devis Rapide Banner
Dark navy card at top of results: 'Demander plusieurs devis en 1 clic'. Button 'Devis Rapide →'. Tapping opens a modal: user types their need (textarea), selects a category, clicks submit. Creates a mission row in Supabase with status='pending'. Shows confirmation toast 'Votre demande a été envoyée aux pros disponibles.'
 
Results List
Render ProCard components for each result. Query logic:
• If ?q param: fulltext search on profiles.bio, profiles.category, profiles.full_name WHERE role='pro'
• If ?category param: filter by profiles.category = value
• Filter by is_available = true if 'Disponible' filter is active
• Always sort by selected filter. Default: order by (distance score * 0.3 + avg_rating * 0.7)
 
Empty State
If no results: illustration (emoji or SVG), 'Aucun professionnel trouvé', suggestion chips for related categories.
 

8. Shared Components
 
ProCard Component
Used on /search and /. Props: profile object. Layout:
• Row 1: Avatar (with availability dot) + Name + Verified badge + TrustRing (right side)
• Row 2: Job title + Stars rating + review count + Tier badge
• Row 3: Pills — 📍 distance, ⚡ response time, 🎯 missions count
• Row 4: Price range (left) + 'WhatsApp' button (green) + 'Voir profil →' button (orange)
The entire card is clickable → /pro/[id]. The WhatsApp button opens wa.me/[phone]?text=Bonjour, j'ai trouvé votre profil sur Ça Match. Est-ce que vous êtes disponible ?
 
TrustRing Component
SVG circular progress ring. Props: score (0-100), tier (string), size (px).
Ring fill color by tier: Bronze #CD7F32, Argent #A8A9AD, Or #FFB830, Élite #FF6B35.
Center text: score number (bold) + 'SCORE' label (tiny).
The ring stroke goes from 0 to (score/100 * circumference). Animate on mount with a 0.6s ease-out transition.
 
TierBadge Component
Props: tier string. Renders colored pill: 🥉 BRONZE | 🥈 ARGENT | 🥇 OR | ⭐ ÉLITE. Background is tier color at 15% opacity, text is tier color.
 
AvailabilityToggle Component (Pro only)
A large toggle switch at the top of the Pro profile. State stored in profiles.is_available. When ON: green background, '🟢 Disponible maintenant'. When OFF: gray, '⛔ Indisponible'. Updates Supabase in real time on toggle.
 
BottomNav Component
Fixed bottom bar, white background, top border. 4 items: Accueil (house icon) | Recherche (search icon) | Messages (chat icon, shows red dot badge if unread) | Profil (person icon). Active item: orange icon + orange dot indicator below. Hidden on md+ screens.
 

9. Public Pro Profile Page (/pro/[id])
Visible to anyone. This is the 'shop window' of the professional. Fetched from profiles + portfolio_items + reviews WHERE pro_id = [id].
 
Hero Section
• Navy gradient background
• Avatar (large, 72px) + availability dot
• Name + Tier badge
• Job title + Stars + review count
• Pills: response time, missions count
• TrustRing (68px, right side)
• Stats strip: Missions | Note | Avis (3 equal boxes, white at 12% opacity)
 
About Section
• 'À propos' card with bio text
• Skills pills (tags from profiles.skills column — store as text array)
 
Tabs: Portfolio | Avis | Infos
Portfolio tab: grid or list of portfolio_items. Each item shows emoji/thumbnail, title, date, 'Mission validée' green badge if mission_id is set. 'Ajouter' button only visible to the profile owner.
Avis tab: Rating summary (big number + star distribution bars) + list of review cards (author name, stars, comment text). At the bottom, if the viewer is a client who has a completed mission with this pro, show 'Laisser un avis' button.
Infos tab: Zone d'intervention, tarif indicatif, disponibilité, temps de réponse — in a clean labeled list.
 
Fixed Bottom CTA Bar
Always visible at screen bottom. 3 buttons:
• WhatsApp (green, icon only): opens wa.me link
• Appel (ivory border, phone icon): opens tel: link
• Envoyer un message (orange, full width flex-1): opens conversation in /messages or creates one if it doesn't exist
 

10. Client Profile Dashboard (/profile when role='client')
This replaces the current settings-only view for clients. Show this when profiles.role = 'client'.
 
Top Section — Identity Card
• Avatar + full name + phone number
• Zone pill + Member since date
• 'Modifier mon profil' link
 
Section: Mes Missions
List of missions WHERE client_id = user.id ORDER BY created_at DESC.
Each mission row: service description (truncated), pro name + avatar (small), status badge.
Status badges: 🟡 En attente | 🔵 En cours | 🟢 Terminée | ⛔ Annulée
Empty state: 'Vous n'avez pas encore fait de demande. Trouvez votre premier pro →'
 
Section: Mes Pros Favoris
Saved professionals (implement with a saved_pros table: client_id, pro_id). Show as compact horizontal scroll cards. Each card: avatar + name + rating + 'Contacter' button.
Save button on ProCard and /pro/[id] page: heart icon. Toggle saved state.
 
Section: Mes Avis
List of reviews WHERE reviewer_id = user.id. Each shows: pro name, stars given, comment, date.
 
Section: Paramètres (collapsed by default)
Accordion item at bottom. Contains: Notifications toggle | Langue (French only for now) | Vérification d'identité | Changer de rôle ('Devenir prestataire' → triggers onboarding step for pro) | Supprimer mon compte | Se déconnecter.
 

11. Pro Dashboard (/profile when role='pro')
This is the most important screen for professionals. It must make them feel that Ça Match is working for them. Show this when profiles.role = 'pro'.
 
Top Section — Pro Identity
• Avatar + name + job category
• Verified badge + Tier badge
• AvailabilityToggle — prominent, first interactive element
 
Section: Mon Score de Confiance
Large TrustRing (96px) centered. Below the ring:
• Current tier badge + next tier label
• Progress bar: 'Il te manque X missions pour passer [NextTier]'
• Tier thresholds: Bronze = 0-24 score | Argent = 25-49 | Or = 50-79 | Élite = 80-100
• Score formula (for backend trigger): (avg_rating/5 * 40) + min(missions_count/100 * 30, 30) + (verified ? 20 : 0) + (response_time_avg < 15 ? 10 : 5)
 
Section: Mes Stats (this week)
4 stat cards in a 2x2 grid:
• 👁️ Vues du profil — count of profile views (implement a profile_views table: pro_id, viewer_session, date)
• 📋 Demandes reçues — count of missions WHERE pro_id AND created_at >= 7 days ago
• ✅ Missions terminées — missions_count total
• ⭐ Note moyenne — avg_rating formatted to 1 decimal
 
Section: Demandes en attente
List of missions WHERE pro_id = user.id AND status = 'pending'. Each card: client name, service description, zone, budget, date received. Two action buttons: '✓ Accepter' (green, sets status='active') | '✗ Refuser' (gray, sets status='cancelled').
Empty state: 'Aucune demande pour le moment. Assurez-vous d'être disponible !'
 
Section: Mon Portfolio
Grid of portfolio_items (2 columns). Each item: thumbnail emoji/image, title, 'Mission validée' badge. Last cell: large '+' button 'Ajouter une réalisation'.
Add portfolio item flow: modal with fields — title (text), description (textarea), category (select), photo upload (Supabase Storage), link to a completed mission (optional dropdown).
 
Section: Mes Avis
Same as public profile Avis tab. Pro can see all reviews but cannot delete them.
 
Section: Mon Profil Public
Card with preview of how the profile appears to clients. CTA: 'Voir comme un client →' → opens /pro/[id] in a new tab. Second CTA: 'Modifier mon profil →' → /profile/edit.
 
Section: Paramètres
Same structure as client. Additionally includes: 'Partager mon profil' button (copies ca-match.vercel.app/pro/[id] to clipboard) | 'Vérifier mon identité' (upload CNI/passeport).
 

12. Messages (/messages and /messages/[id])
 
/messages — Inbox
List of conversations WHERE client_id = user.id OR pro_id = user.id, ordered by last_message_at DESC.
Each conversation row: other party's avatar + name + last message preview (truncated 40 chars) + time. Unread conversations: bold text + orange dot.
 
/messages/[id] — Thread
Standard chat UI. Messages aligned right (mine, orange bubble) and left (theirs, gray bubble). Input bar at bottom fixed. Send on Enter or tap 'Envoyer'.
Use Supabase Realtime subscription on messages WHERE conversation_id = [id] for live updates.
At top of thread: a mini ProCard (if viewer is client) or mini ClientCard (if viewer is pro) with quick access to 'Voir le profil' and the relevant mission status.
 

13. Design Tokens (Tailwind Config)
Add these to tailwind.config.js:
colors: {
 brand: {
   orange: '#FF6B35',  // Primary CTA, active states
   navy:   '#1A1A2E',  // Headers, trust elements
   ivory:  '#F7F4EE',  // Page background
   green:  '#2ED573',  // Verified, available, success
   gold:   '#FFB830',  // Stars, badges, Or tier
   card:   '#EDEAE3',  // Card backgrounds
   muted:  '#8A8580',  // Secondary text
 }
}
 
Font: Add Space Grotesk via Google Fonts. Use for headings, names, numbers. Inter or system-ui for body text.
 
Spacing & Radius
• Default card border-radius: 16px (rounded-2xl)
• Buttons: border-radius 20px (rounded-full) for CTAs, 12px (rounded-xl) for secondary
• Bottom nav height: 60px + safe area inset
• Page horizontal padding: 16px (px-4) on mobile, 24px on tablet
 
Shadows
• Card shadow: 0 2px 12px rgba(26,26,46,0.08)
• CTA button shadow: 0 4px 16px rgba(255,107,53,0.45)
• Bottom nav shadow: 0 -4px 20px rgba(26,26,46,0.10)
 

14. Seed Data for Development
Insert this data into Supabase for local testing. Create a seed.sql file.
 
6 Professional Profiles to Insert
• Konan Thierry — Électricien, Cocody, score 96, tier Élite, 134 missions, rating 4.9, available true, response_time_avg 5
• Diomandé Safi — Coiffeuse à domicile, Yopougon, score 93, tier Or, 418 missions, rating 4.8, available true, response_time_avg 8
• Bamba Yacouba — Réparateur téléphone/PC, Plateau, score 88, tier Or, 289 missions, rating 4.7, available false, response_time_avg 20
• Coulibaly Mariam — Ménage professionnel, Cocody, score 79, tier Argent, 98 missions, rating 4.6, available true, response_time_avg 12
• Touré Ibrahim — Plombier, Marcory, score 72, tier Argent, 67 missions, rating 4.5, available true, response_time_avg 18
• Aka Bénédicte — Photographe événementiel, Plateau, score 85, tier Or, 112 missions, rating 4.8, available true, response_time_avg 30
 
Test Client Account
• Name: Hiram Test, zone: Cocody, role: client, onboarding_completed: true
 

15. Implementation Order for the Agent
Work in this exact order. Do not jump ahead. Each phase is independently deployable.
 
Phase
Name
Tasks
1
Bugfixes
Fix double nav · Remove duplicate search · Seed DB · Fix /search to show real results
2
Supabase Schema
Create all tables from Section 5 · Run seed.sql · Test RLS policies
3
Onboarding
Build /onboarding with 3 steps · Role selection → profile setup → confirm · Redirect new users
4
Home Page
Rebuild home with real Supabase data · Stats strip live · Categories grid · Top pros from DB
5
Search Page
Real search query · Filter pills · Devis Rapide modal · ProCard with real data
6
Public Pro Profile
Build /pro/[id] · All tabs · Fixed CTA bar · Portfolio from DB · Reviews from DB
7
Client Dashboard
Build /profile for role=client · Missions history · Favorites · Reviews given
8
Pro Dashboard
Build /profile for role=pro · Stats · Score + tier progression · Pending requests · Portfolio management
9
Messages
Build /messages inbox · /messages/[id] thread · Supabase Realtime subscription
10
Polish
Animate TrustRing · Empty states · Error states · Loading skeletons · Toast notifications
 
 

Final Note to Agent
This is an MVP for a real market (Abidjan, Côte d'Ivoire). Users have limited data budgets — keep API calls lean, use loading skeletons, and never block UI on a slow network. The trust system (TrustRing, tier badges, verified check) is the product's core differentiator — build it to be visually prominent and always accurate. When in doubt about what to build, ask: does this make a client feel safe choosing this professional, or does it make a pro feel proud to have this profile?
 
Built by NEDA Digital Agency · Abidjan, Côte d'Ivoire · ca-match.vercel.app