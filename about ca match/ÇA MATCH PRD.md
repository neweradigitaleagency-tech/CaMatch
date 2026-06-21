# ÇA MATCH : MASTER PRODUCT REQUIREMENTS DOCUMENT (PRD)
**Version:** 1.0.0 | **Date:** June 17, 2026 | **Status:** Approved for Engineering
**Target Market:** Abidjan, Côte d'Ivoire (Initial) | **Pan-African (Scale)**

## 1. EXECUTIVE SUMMARY

**Ça Match** is the digital infrastructure powering the informal and semi-formal service economy in Africa. Starting in Abidjan, Côte d'Ivoire, we are building more than a directory; we are building the Operating System for local professionals. By transitioning from a simple marketplace to a comprehensive AI-driven Service OS and eventually a financial infrastructure network, we will unlock the economic potential of millions of independent workers and SMEs.

**The Problem:** The service sector in Abidjan (plumbers, electricians, cleaners, AC techs) is highly fragmented, trust-deficient, and operationally inefficient. Clients struggle to find reliable, vetted professionals. Professionals struggle with inconsistent lead flow, cash flow management, and lack of business tools.

**The Solution:** A mobile-first, offline-resilient platform that connects clients with vetted pros (Marketplace), provides pros with CRM/invoicing tools (Service OS), automates dispatch and pricing via AI (AI OS), and eventually provides embedded finance and insurance (Infrastructure Network).

**Key Metrics (Year 1 Target - Abidjan):**
*   **Liquidity:** 5,000 active professionals, 50,000 monthly active clients.
*   **GMV:** $2.5M USD annualized run rate.
*   **Take Rate:** 12% blended (Marketplace) transitioning to 18% (SaaS + AI).
*   **Retention:** 65% D30 professional retention, 40% D30 client retention.

**Differentiation:** Unlike generic directories (Expat.com) or hyper-local gig apps that ignore the B2B/SME reality, Ça Match is built for the African context: mobile money native (Wave/Orange), USSD/WhatsApp fallbacks, low-bandwidth optimized, and deeply integrated into the daily operational workflow of the professional, not just the transactional moment.

---

## 2. VISION & STRATEGY

### Mission Statement
To empower every local service professional in Africa with the technology, trust, and capital to build a thriving business, while providing clients with seamless, reliable, and transparent access to quality services.

### 4-Phase Strategic Evolution

| Phase | Name | Focus | Key Features | Revenue Model | Success Metric |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **Marketplace (0→1)** | Liquidity & Trust | Search, Profiles, Chat, Reviews, Bookings, Mobile Money Escrow | 10-15% Commission on GMV | 5,000 Pros, 50k Clients, $2.5M GMV |
| **2** | **Service Management (1→10)** | Professional Stickiness | CRM, Scheduling, Invoicing, Expense Tracking, Inventory | $10-$30/mo SaaS Subscriptions | 30% of Pros on paid SaaS, 40% MoM retention |
| **3** | **AI Service OS (10→100)** | Automation & Scale | AI Dispatcher, AI Quotes, AI Scheduling, AI Quality Scoring | SaaS + AI Usage Fees ($0.50/interaction) | 60% of jobs auto-dispatched, 20% margin expansion |
| **4** | **Infrastructure (100→1000)** | Ecosystem Lock-in | Embedded Financing, Micro-insurance, Payroll, Procurement | Financial Products (Interest, Premiums, Float) | $10M loan book, 50% of pros using payroll |

### Why Abidjan First?
1.  **Market Size & Density:** Abidjan has ~5.5 million people. The informal sector employs over 80% of the workforce. High density in communes like Cocody, Plateau, and Yopougon creates perfect conditions for hyper-local matching.
2.  **Mobile Money Penetration:** Côte d'Ivoire has one of the highest mobile money penetration rates in Africa (>100% account penetration). Wave's zero-fee model has revolutionized P2P and merchant payments, making digital escrow viable for micro-transactions.
3.  **Competitive Landscape:** Existing solutions are either high-end B2B (Procurement software) or low-end classifieds (Jumia Deals, Facebook Marketplace). There is no dominant, tech-enabled service OS.
4.  **Tech Infrastructure:** 4G coverage is robust in urban areas, and smartphone penetration is crossing the 60% threshold, with a massive tail of feature-phone users requiring USSD/WhatsApp bridges.

### Expansion Roadmap
*   **Months 1-12:** Abidjan (All 4 communes initially, then expand to all 13).
*   **Months 13-18:** Dakar, Senegal & Accra, Ghana (Similar market dynamics, high mobile money).
*   **Months 19-24:** Lagos, Nigeria & Nairobi, Kenya (Larger markets, requires localization for different payment rails like M-Pesa/Paystack).

---

## 3. USER PERSONAS

### Client Personas

**1. Amina, the Urban Professional (B2C Core)**
*   **Demographics:** 28, Marketing Manager, lives in Cocody. Income: 800,000 XOF/mo.
*   **Tech/Device:** iPhone 13, high-speed 4G/Wi-Fi. Tech-comfortable.
*   **Pain Points:** No time to vet plumbers. Gets ghosted. Hates negotiating prices.
*   **Goals:** Find a reliable AC technician quickly, pay securely via Wave, get a receipt for her records.
*   **Language:** French (primary), some English.

**2. Jean-Baptiste, the Small Business Owner (B2B Micro)**
*   **Demographics:** 45, owns a Maquis (restaurant) in Yopougon. Income: Variable, ~1.5M XOF/mo.
*   **Tech/Device:** Samsung Galaxy A-series, 3G/4G. Moderate tech comfort.
*   **Pain Points:** Equipment breaks down constantly. Needs regular cleaning but can't manage a payroll for it.
*   **Goals:** Set up a recurring cleaning schedule. Get fast repairs for his freezers.
*   **Language:** French, Nouchi (local slang).

**3. Marc, the Property Manager (B2B SME)**
*   **Demographics:** 38, manages 5 residential buildings in Plateau.
*   **Tech/Device:** Laptop for admin, Android for field. High tech comfort.
*   **Pain Points:** Tracking expenses across 5 buildings. Verifying that jobs were actually done.
*   **Goals:** Centralized dashboard for all maintenance requests. Automated invoicing for landlords.
*   **Language:** Professional French.

### Professional Personas

**4. Kouassi, the Independent Worker (Pro Core)**
*   **Demographics:** 34, Electrician. Lives in Abobo. Income: 150,000 - 300,000 XOF/mo.
*   **Tech/Device:** Tecno Spark (entry-level Android), limited data plan. Low tech comfort.
*   **Pain Points:** Inconsistent income. Spends 2,000 XOF/day on transport just looking for jobs. Clients don't pay on time.
*   **Goals:** Get more jobs closer to home. Get paid instantly via Wave. Build a reputation.
*   **Language:** French (basic reading/writing), Baoulé.

**5. Fatou, the Small Business Owner (Pro SME)**
*   **Demographics:** 40, runs a cleaning company with 5 staff.
*   **Tech/Device:** Mid-range Android + Laptop. Moderate tech comfort.
*   **Pain Points:** Managing her team's schedules. Tracking who has which supplies. Chasing client payments.
*   **Goals:** Scale her business. Automate scheduling. Access micro-loans to buy industrial vacuums.
*   **Language:** French, Dioula.

### Enterprise Persona

**6. Sylvie, the Hotel Operations Manager (Enterprise)**
*   **Demographics:** 42, Director of Operations at a 4-star hotel in Plateau.
*   **Tech/Device:** MacBook Pro, iPhone. High tech comfort.
*   **Pain Points:** Managing 50+ external contractors. SLA breaches cost the hotel money. Compliance and insurance tracking is a nightmare.
*   **Goals:** Single pane of glass for all facility maintenance. Guaranteed SLAs. Automated compliance tracking.
*   **Language:** Business French, English.

---

## 4. COMPLETE FEATURE INVENTORY

### Module 1: Marketplace (Client Side)
| ID | Feature | Priority | Phase | Description |
| :--- | :--- | :--- | :--- | :--- |
| M-01 | Smart Search & Filter | P0 | 1 | Geolocation-based search with filters (category, rating, price, availability). |
| M-02 | AI Request Categorization | P0 | 1 | NLP/Vision to parse text/voice/image into structured service requests. |
| M-03 | Pro Profiles & Portfolios | P0 | 1 | Rich profiles with photos, verified badges, reviews, and past job gallery. |
| M-04 | In-App Chat & Translation | P0 | 1 | Real-time chat with auto-translation (French <-> local languages/Nouchi). |
| M-05 | Voice Note Transcription | P1 | 1 | Convert voice notes to text for searchability and AI context. |
| M-06 | Instant Quote / AI Pricing | P0 | 1 | AI-generated estimated price range based on historical data. |
| M-07 | Custom Quote Requests | P0 | 1 | Pros can send itemized quotes (labor + materials) for client approval. |
| M-08 | Secure Booking & Scheduling | P0 | 1 | Calendar integration, buffer times, and recurring job setup. |
| M-09 | Mobile Money Escrow | P0 | 1 | Hold funds via Wave/Orange Money until job completion. |
| M-10 | Cash Payment Verification | P1 | 1 | OTP or Pro-generated PIN to confirm cash jobs were completed. |
| M-11 | Dual-Blind Reviews | P0 | 1 | Reviews revealed only after both parties submit, or after 7 days. |
| M-12 | Dispute Resolution Center | P1 | 1 | In-app flow to raise issues, upload evidence, and request refunds. |
| M-13 | SOS / Emergency Dispatch | P2 | 1 | Premium feature for urgent jobs (e.g., burst pipe) with 30-min SLA. |
| M-14 | Favorites & Pro History | P2 | 1 | Save preferred pros, view past jobs, and rebook with one tap. |
| M-15 | Referral & Loyalty Program | P2 | 2 | "Give 1000 XOF, Get 1000 XOF" via mobile money. |

### Module 2: Professional OS (Worker Side)
| ID | Feature | Priority | Phase | Description |
| :--- | :--- | :--- | :--- | :--- |
| P-01 | Lead Dashboard & Triage | P0 | 1 | Kanban-style view of incoming requests, quotes, and active jobs. |
| P-02 | Smart Routing / Auto-Accept | P1 | 2 | AI automatically accepts jobs matching pro's criteria (radius, price). |
| P-03 | In-App Navigation | P0 | 1 | Deep links to Google Maps/Waze with optimized routing for multiple stops. |
| P-04 | Job Execution Checklist | P1 | 1 | Standardized checklists (e.g., AC cleaning steps) to ensure quality. |
| P-05 | Photo/Video Proof of Work | P0 | 1 | Mandatory before/after photo uploads to release escrow funds. |
| P-06 | Digital Invoicing | P0 | 1 | Generate PDF invoices with company logo, tax ID, and breakdown. |
| P-07 | Expense & Inventory Tracking | P2 | 2 | Log material purchases, track spare parts inventory. |
| P-08 | Earnings & Payout Dashboard | P0 | 1 | Real-time view of pending, cleared, and withdrawn funds. |
| P-09 | Instant Payout to MoMo | P0 | 1 | One-tap withdrawal to Wave/Orange Money (subject to hold period). |
| P-10 | Availability & Calendar Mgmt | P0 | 1 | Set working hours, block out time, manage vacation. |
| P-11 | Team Management (Lite) | P1 | 2 | Add assistants, assign jobs to them, track their performance. |
| P-12 | Offline Mode & Sync | P0 | 1 | Queue actions (check-in, photos) when offline, sync when 3G/4G returns. |
| P-13 | USSD / WhatsApp Bridge | P1 | 2 | Receive job alerts and accept via WhatsApp bot or USSD for low-end phones. |
| P-14 | Micro-Learning & Certs | P2 | 3 | In-app video training. Earn badges for completing safety/tech modules. |
| P-15 | Performance Analytics | P2 | 2 | Insights on conversion rate, average ticket size, and peer benchmarking. |

### Module 3: Business OS (SME)
| ID | Feature | Priority | Phase | Description |
| :--- | :--- | :--- | :--- | :--- |
| B-01 | Multi-User Access & Roles | P0 | 2 | Admin, Manager, Dispatcher, Technician roles with specific permissions. |
| B-02 | Advanced Dispatch Board | P0 | 2 | Drag-and-drop Gantt chart for assigning jobs to specific team members. |
| B-03 | Fleet & Asset Tracking | P1 | 2 | Track company vehicles and expensive tools (GPS integration). |
| B-04 | Procurement & Supplier Mgmt | P2 | 2 | Order parts from verified suppliers directly through the app. |
| B-05 | Payroll & Commission Calc | P1 | 2 | Auto-calculate technician pay based on hours/jobs + commission splits. |
| B-06 | Cash Flow & Accounting | P1 | 2 | P&L statements, expense categorization, export to Excel/PDF. |
| B-07 | White-label Client Portal | P2 | 3 | Custom URL for the SME's clients to book and track jobs. |

### Module 4: Enterprise
| ID | Feature | Priority | Phase | Description |
| :--- | :--- | :--- | :--- | :--- |
| E-01 | Multi-Site Management | P0 | 2 | Hierarchy view: Enterprise -> Sites (e.g., Hotels) -> Rooms/Units. |
| E-02 | Approval Workflows | P0 | 2 | Configurable routing (e.g., >100k XOF requires Finance Manager approval). |
| E-03 | SLA Tracking & Penalties | P1 | 2 | Auto-track response/resolution times. Auto-apply penalties for breaches. |
| E-04 | Budgeting & Forecasting | P1 | 2 | Set monthly maintenance budgets per site. Alert at 80% utilization. |
| E-05 | Vendor Compliance Vault | P1 | 2 | Auto-expire and block vendors whose insurance or certifications lapse. |
| E-06 | Consolidated Billing | P0 | 2 | Single monthly invoice for all sites, with detailed cost-center breakdown. |
| E-07 | API & ERP Integration | P2 | 3 | Webhooks and REST API to push data to SAP, Oracle, or local ERPs. |

### Module 5: AI Layer
| ID | Feature | Priority | Phase | Description |
| :--- | :--- | :--- | :--- | :--- |
| A-01 | Intent Classification (NLP) | P0 | 1 | GPT-4o-mini to categorize unstructured text/voice into service types. |
| A-02 | Vision Damage Assessment | P1 | 2 | Analyze uploaded photos to estimate repair complexity and parts needed. |
| A-03 | Dynamic Pricing Engine | P0 | 1 | Predict fair market price based on job type, time, location, and demand. |
| A-04 | Smart Matching Algorithm | P0 | 1 | 7-factor scoring to rank and route jobs to the optimal professional. |
| A-05 | AI Auto-Dispatcher | P1 | 3 | Automatically assign and notify pros without human intervention. |
| A-06 | AI Quote Generator | P1 | 2 | Draft itemized quotes for pros to review and send, saving typing time. |
| A-07 | Quality Scoring (CV) | P2 | 3 | Analyze before/after photos to verify job completion and quality. |
| A-08 | Fraud & Anomaly Detection | P1 | 2 | Flag fake reviews, collusive pricing, or GPS spoofing. |
| A-09 | Predictive Churn Model | P2 | 3 | Identify pros/clients likely to leave and trigger retention campaigns. |
| A-10 | Conversational AI Support | P2 | 3 | LLM-powered chatbot handling 80% of Tier 1 support queries in French/Nouchi. |

---

## 5. DESKTOP UX

### Design Principles for Desktop
1.  **Information Density:** Utilize the wide canvas. Use data tables with sortable columns, collapsible sidebars, and multi-pane layouts (e.g., list on left, details on right).
2.  **Keyboard First:** Full keyboard navigation for power users (Enterprise/Admin). Shortcuts for dispatching, approving, and navigating.
3.  **Contextual Actions:** Right-click menus and hover-states for bulk actions (e.g., approve 10 verifications at once).
4.  **Real-Time Updates:** WebSockets for live dashboard updates (new job alerts, status changes) without manual refreshing.

### ASCII Wireframes

**Professional Dashboard (SME Admin View)**
```text
+-----------------------------------------------------------------------------+
|  ÇA MATCH PRO   [Search...]      🔔 (3)   👤 Fatou Cleaning (Admin)  [⚙️]  |
+-----------------------------------------------------------------------------+
| 📊 Dashboard | 📅 Schedule | 👥 Team | 💰 Finance | 📦 Inventory | ⚙️ Settings|
+-----------------------------------------------------------------------------+
| OVERVIEW (Semaine en cours)                               [Export PDF] [➕ New Job]|
| +----------------+ +----------------+ +----------------+ +----------------+  |
| | 12             | | 450,000 XOF    | | 92%            | | 4.8 ⭐         |  |
| | Jobs Active    | | Revenus (7j)   | | Taux Accept.   | | Note Moyenne   |  |
| +----------------+ +----------------+ +----------------+ +----------------+  |
|                                                                             |
| DISPATCH BOARD (Drag & Drop)                                                |
| +-------------------------+-------------------------+---------------------+ |
| | 📥 À PLANIFIER (5)      | | 🚧 EN COURS (3)       | | ✅ TERMINÉ (Aujourd'hui)|
| |-------------------------| |-------------------------| |---------------------| |
| | [Job #1042]             | | [Job #1039]             | | [Job #1035]         | |
| | Net. Bureau Plateau     | | Net. Villa Cocody       | | Net. Maquis Yop.    | |
| | 📅 Demain 09:00         | | 👤 Assigné: Marie       | | 👤 Assigné: Awa     | |
| | 💰 25,000 XOF           | | 📍 En route             | | 💰 40,000 XOF       | |
| | [Assigner] [Refuser]    | | [Voir Détails]          | | [Voir Facture]      | |
| |                         | |                         | |                     | |
| | [Job #1043]             | | [Job #1040]             | | [Job #1036]         | |
| | ...                     | | ...                     | | ...                 | |
| +-------------------------+-------------------------+---------------------+ |
+-----------------------------------------------------------------------------+
```

**Enterprise Dashboard (Multi-Site View)**
```text
+-----------------------------------------------------------------------------+
| ÇA MATCH ENTERPRISE   Hôtel Ivoire Group   👤 Sylvie (Dir. Ops)   [🔔] [⚙️] |
+-----------------------------------------------------------------------------+
| 📊 Vue Globale | 🏢 Sites | 📋 Demandes | 💰 Budgets | 📈 Rapports | 🛡️ Conformité|
+-----------------------------------------------------------------------------+
| PERFORMANCE GLOBALE (Mois en cours)                                         |
| +----------------+ +----------------+ +----------------+ +----------------+  |
| | 142            | | 12,500,000 XOF | | 98%            | | 2.1h           |  |
| | Interventions  | | Dépensé / 15M  | | Respect SLA    | | Temps Résol.   |  |
| +----------------+ +----------------+ +----------------+ +----------------+  |
|                                                                             |
| SITES & ALERTES                                                             |
| +---------------------------------------------------+---------------------+ |
| | Site                                              | Statut & Alertes    | |
| |---------------------------------------------------|---------------------| |
| | 🏨 Hôtel Ivoire Plateau                           | 🟢 Normal           | |
| | 🏨 Hôtel Ivoire Marcory                           | 🟡 Budget à 85%     | |
| | 🏨 Hôtel Ivoire Aéroport (FHB)                    | 🔴 SLA Breach: Clim | |
| +---------------------------------------------------+---------------------+ |
|                                                                             |
| DEMANDES RÉCENTES EN ATTENTE D'APPROBATION                                  |
| +-------------------------------------------------------------------------+ |
| | ID      | Site       | Type      | Montant   | Demandé par | Action    | |
| |---------|------------|-----------|-----------|-------------|-----------| |
| | REQ-992 | Plateau    | Plomberie | 150,000   | Jean (Mgr)  | [✅] [❌] | |
| | REQ-993 | Marcory    | Électric. | 45,000    | Paul (Mgr)  | [✅] [❌] | |
| +-------------------------------------------------------------------------+ |
+-----------------------------------------------------------------------------+
```

### Navigation Structure
*   **Client (Desktop - Web):** Home (Search) -> Categories -> Pro Profile -> Booking -> My Jobs -> Messages -> Settings.
*   **Professional (Desktop - Web):** Dashboard -> Schedule -> Jobs -> Finance -> Team -> Settings.
*   **Admin (Desktop - Web):** Overview -> Users (Clients/Pros) -> Jobs -> Payments -> Verifications -> Content -> Settings.
*   **Enterprise (Desktop - Web):** Overview -> Sites -> Requests -> Budgets -> Reports -> Compliance.

---

## 6. MOBILE UX

### Design Principles for Mobile
1.  **Thumb Zone Optimization:** Primary actions (Accept, Call, Pay) in the bottom 30% of the screen. Navigation at the bottom.
2.  **Touch Targets:** Minimum 48x48dp for all interactive elements.
3.  **3G/Low-Bandwidth Performance:** Aggressive image compression (WebP), lazy loading, skeleton screens instead of spinners. Text-first UI.
4.  **Offline Resilience:** Local SQLite/WatermelonDB for critical data. Queue mutations (job check-ins, photo uploads) and sync when connection returns. Visual indicators for offline state.
5.  **Literacy & Accessibility:** High contrast. Use universally understood icons. Support for voice inputs. Option to switch to "Nouchi" or simplified French. Large typography.

### ASCII Wireframes

**Client Home (Mobile)**
```text
+-------------------------+
| ☰  Ça Match    🔔  👤   |
| Bonjour Amina 👋        |
| +---------------------+ |
| | 🔍 Que cherchez-vous? | |
| | (Ex: Plombier, Clim)  | |
| +---------------------+ |
|                         |
| Catégories Populaires   |
| ⚡ Élec  🚿 Plomb       |
| ❄️ Clim  🧹 Ménage      |
|                         |
| Pros près de chez vous  |
| +---------------------+ |
| | 👤 Kouassi E. ⭐ 4.9  | |
| | 📍 Cocody (1.2km)     | |
| | 💰 2,500 XOF/h        | |
| | [Voir Profil] [Appeler]| |
| +---------------------+ |
| +---------------------+ |
| | 👤 Fatou C. ⭐ 4.8    | |
| | 📍 Plateau (3km)      | |
| | 💰 Forfait: 15,000    | |
| | [Voir Profil] [Appeler]| |
| +---------------------+ |
|                         |
+-------------------------+
| 🏠      🔍      ➕      💬      👤 |
| Home   Search  Request  Chat   Profile|
+-------------------------+
```

**AI Request Categorization (Mobile)**
```text
+-------------------------+
| ← Décrire votre besoin  |
|                         |
| Comment pouvons-nous    |
| vous aider ?            |
|                         |
| +---------------------+ |
| | 🎤 Appuyez pour     | |
| |    parler           | |
| | (ou tapez ici...)   | |
| +---------------------+ |
|                         |
| 📷 Ou ajoutez une photo |
| [ + Ajouter Photo ]     |
|                         |
| [ Image: Photo of a   ] |
| [ leaking AC unit     ] |
|                         |
| IA analyse...           |
| ✅ Catégorie: Climatisation |
| ✅ Urgence: Moyenne     |
| ✅ Estimation: 15k-25k  |
|                         |
| [ Continuer ➔ ]         |
|                         |
+-------------------------+
```

**Professional Selection (Mobile)**
```text
+-------------------------+
| ← Choisir un Pro        |
| Climatisation - Cocody  |
|                         |
| 3 Pros disponibles      |
|                         |
| +---------------------+ |
| | 👤 Kouassi E. ⭐ 4.9  | |
| | 🛡️ Vérifié | ⚡ Répond <5m| |
| | 💰 18,000 XOF (Fixe)  | |
| | 📅 Dispo: Aujourd'hui | |
| | [Voir Détails] [Choisir]| |
| +---------------------+ |
| +---------------------+ |
| | 👤 Yannick T. ⭐ 4.7  | |
| | 🛡️ Vérifié | ⚡ Répond <15m| |
| | 💰 15,000 XOF (Fixe)  | |
| | 📅 Dispo: Demain 09h  | |
| | [Voir Détails] [Choisir]| |
| +---------------------+ |
|                         |
| [ 🤖 Laisser l'IA choisir ]|
| (Le mieux noté et dispo)|
+-------------------------+
```

**Professional Dashboard (Mobile)**
```text
+-------------------------+
| ☰  Ça Match Pro  🔔  👤 |
| Bonjour Kouassi         |
| +---------------------+ |
| | Aujourd'hui: 3 Jobs   | |
| | Gagné (7j): 45,000 F  | |
| +---------------------+ |
|                         |
| 🚨 NOUVELLE DEMANDE     |
| +---------------------+ |
| | ⚡ Dépannage Électrique | |
| | 📍 Abobo (2km)        | |
| | 💰 10,000 XOF         | |
| | ⏳ Expire dans 02:14  | |
| | [ ❌ Refuser ] [ ✅ Accepter ] | |
| +---------------------+ |
|                         |
| 📅 Prochain Job         |
| +---------------------+ |
| | 🏠 Installation Prises  | |
| | 📍 Cocody Angré       | |
| | ⏰ 14:00              | |
| | [ 🗺️ Itinéraire ] [ Démarrer ]| |
| +---------------------+ |
|                         |
+-------------------------+
| 🏠      📅      💰      👤 |
| Home   Jobs    Finance  Profil|
+-------------------------+
```

**Job Completion (Mobile - Pro)**
```text
+-------------------------+
| ← Terminer le Job #1042 |
|                         |
| Net. Bureau Plateau     |
| Client: Marc (Property) |
|                         |
| 1. Checklist            |
| ✅ Aspiré sols          |
| ✅ Nettoyé vitres       |
| ✅ Vide poubelles       |
|                         |
| 2. Preuve (Obligatoire) |
| +-------+ +-------+     |
| | 📷    | | 📷    |     |
| | Avant | | Après |     |
| +-------+ +-------+     |
|                         |
| 3. Montant Final        |
| Main d'oeuvre: 20,000   |
| Produits:    5,000      |
| Total:       25,000 XOF |
|                         |
| [ ✅ Terminer & Facturer ]|
| (Envoie facture au client)|
+-------------------------+
```

---

## 7. DATABASE SCHEMA (Supabase/PostgreSQL)

*Note: Requires `uuid-ossp`, `pgcrypto`, `postgis`, and `pgvector` extensions.*

```sql
-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ENUM Types
CREATE TYPE user_role AS ENUM ('client', 'professional', 'business_admin', 'enterprise_admin', 'platform_admin');
CREATE TYPE request_status AS ENUM ('draft', 'pending', 'quoted', 'accepted', 'in_progress', 'completed', 'cancelled', 'disputed');
CREATE TYPE verification_level AS ENUM ('none', 'phone', 'id', 'background', 'certified', 'elite');
CREATE TYPE payment_status AS ENUM ('pending', 'authorized', 'captured', 'failed', 'refunded', 'partially_refunded');
CREATE TYPE payout_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- USERS (Core Auth)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE,
    phone_number TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    role user_role NOT NULL DEFAULT 'client',
    language TEXT DEFAULT 'fr',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CLIENT PROFILES
CREATE TABLE client_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    default_address TEXT,
    location GEOGRAPHY(POINT, 4326),
    avatar_url TEXT,
    loyalty_points INT DEFAULT 0
);

-- PROFESSIONAL PROFILES
CREATE TABLE professional_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    business_name TEXT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    category TEXT NOT NULL, -- e.g., 'electrician', 'plumber'
    sub_categories TEXT[],
    bio TEXT,
    hourly_rate INT, -- in XOF
    verification_level verification_level DEFAULT 'none',
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_jobs INT DEFAULT 0,
    location GEOGRAPHY(POINT, 4326),
    service_radius_km INT DEFAULT 10,
    is_available BOOLEAN DEFAULT TRUE,
    id_document_url TEXT,
    cert_document_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SERVICE REQUESTS
CREATE TABLE service_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES users(id),
    professional_id UUID REFERENCES users(id),
    enterprise_site_id UUID REFERENCES enterprise_sites(id),
    category TEXT NOT NULL,
    description TEXT,
    media_urls TEXT[],
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    address TEXT NOT NULL,
    status request_status DEFAULT 'pending',
    estimated_price_min INT,
    estimated_price_max INT,
    final_price INT,
    scheduled_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- QUOTES
CREATE TABLE quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES users(id),
    labor_cost INT NOT NULL,
    material_cost INT DEFAULT 0,
    total_cost INT NOT NULL,
    notes TEXT,
    status TEXT DEFAULT 'pending', -- pending, accepted, rejected
    valid_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- JOBS (Execution details linked to accepted quotes)
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES service_requests(id),
    quote_id UUID REFERENCES quotes(id),
    checklist_data JSONB, -- e.g., [{"item": "Aspiré", "done": true}]
    before_photos TEXT[],
    after_photos TEXT[],
    ai_quality_score DECIMAL(3,2),
    client_notes TEXT,
    pro_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- REVIEWS
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id),
    reviewer_id UUID NOT NULL REFERENCES users(id),
    reviewee_id UUID NOT NULL REFERENCES users(id),
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_visible BOOLEAN DEFAULT FALSE, -- For dual-blind
    ai_sentiment_score DECIMAL(3,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(job_id, reviewer_id)
);

-- TRANSACTIONS (Ledger)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id),
    payer_id UUID NOT NULL REFERENCES users(id),
    payee_id UUID NOT NULL REFERENCES users(id),
    amount INT NOT NULL,
    platform_fee INT NOT NULL,
    currency TEXT DEFAULT 'XOF',
    payment_method TEXT, -- 'wave', 'orange_money', 'mtn', 'cash'
    status payment_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CONVERSATIONS & MESSAGES
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id),
    participant_1 UUID NOT NULL REFERENCES users(id),
    participant_2 UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(participant_1, participant_2, job_id)
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    media_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTIFICATIONS
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    type TEXT NOT NULL, -- 'job_alert', 'payment', 'system'
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    channel TEXT DEFAULT 'push', -- 'push', 'sms', 'whatsapp', 'email'
    is_read BOOLEAN DEFAULT FALSE,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BUSINESS & ENTERPRISE PROFILES
CREATE TABLE business_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    tax_id TEXT,
    team_size INT,
    subscription_tier TEXT DEFAULT 'free'
);

CREATE TABLE enterprise_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    industry TEXT,
    billing_address TEXT,
    account_manager_id UUID REFERENCES users(id)
);

CREATE TABLE enterprise_sites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enterprise_id UUID NOT NULL REFERENCES users(id),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    location GEOGRAPHY(POINT, 4326),
    site_manager_id UUID REFERENCES users(id),
    monthly_budget INT
);

-- AI TABLES
CREATE TABLE ai_request_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
    embedding vector(1536), -- OpenAI ada-002 or similar
    extracted_features JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_pricing_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category TEXT NOT NULL,
    city TEXT NOT NULL,
    model_version TEXT NOT NULL,
    model_weights JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_professional_rankings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professional_id UUID NOT NULL REFERENCES users(id),
    request_id UUID NOT NULL REFERENCES service_requests(id),
    match_score DECIMAL(5,2) NOT NULL,
    rank INT,
    factors JSONB, -- breakdown of the 7 factors
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AUDIT LOGS
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_pro_category ON professional_profiles(category);
CREATE INDEX idx_pro_location ON professional_profiles USING GIST(location);
CREATE INDEX idx_pro_verification ON professional_profiles(verification_level);
CREATE INDEX idx_req_status ON service_requests(status);
CREATE INDEX idx_req_location ON service_requests USING GIST(location);
CREATE INDEX idx_req_created ON service_requests(created_at DESC);
CREATE INDEX idx_txn_payer ON transactions(payer_id);
CREATE INDEX idx_txn_payee ON transactions(payee_id);
CREATE INDEX idx_msg_conv ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_notif_user ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_ai_emb ON ai_request_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- FULL TEXT SEARCH (French)
ALTER TABLE professional_profiles ADD COLUMN fts tsvector GENERATED ALWAYS AS (
    to_tsvector('french', coalesce(business_name, '') || ' ' || coalesce(first_name, '') || ' ' || coalesce(last_name, '') || ' ' || coalesce(bio, ''))
) STORED;
CREATE INDEX idx_pro_fts ON professional_profiles USING GIN(fts);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Examples)
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Pros can view all clients for matched jobs" ON client_profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM service_requests sr WHERE sr.client_id = client_profiles.user_id AND sr.professional_id = auth.uid())
);
CREATE POLICY "Anyone can view public pro profiles" ON professional_profiles FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Clients can view own requests" ON service_requests FOR SELECT USING (client_id = auth.uid());
CREATE POLICY "Pros can view assigned requests" ON service_requests FOR SELECT USING (professional_id = auth.uid());
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (payer_id = auth.uid() OR payee_id = auth.uid());

-- POSTGIS FUNCTIONS
CREATE OR REPLACE FUNCTION get_nearby_pros(
    user_location GEOGRAPHY,
    radius_km INT,
    target_category TEXT,
    limit_count INT DEFAULT 10
) RETURNS TABLE (
    user_id UUID,
    business_name TEXT,
    rating DECIMAL,
    distance_meters FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.user_id, 
        p.business_name, 
        p.rating, 
        ST_Distance(p.location, user_location) as distance_meters
    FROM professional_profiles p
    WHERE 
        p.category = target_category
        AND p.is_available = TRUE
        AND ST_DWithin(p.location, user_location, radius_km * 1000)
    ORDER BY distance_meters ASC, p.rating DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 8. AI ARCHITECTURE

### Component Diagram
```text
[ Client App ] / [ Pro App ] / [ WhatsApp Bot ]
       │               │               │
       └───────────────┼───────────────┘
                       ▼
              [ API Gateway / Edge ]
                       │
       ┌───────────────┼───────────────┐
       ▼               ▼               ▼
[ Request Ingestion ] [ Matching Engine ] [ Support Bot ]
       │               │               │
       ▼               ▼               ▼
[ NLP + Vision ]  [ PostGIS + Rules ] [ LLM (GPT-4o) ]
[ GPT-4o-mini ]   [ Scoring Algo ]    [ RAG (Supabase) ]
       │               │               │
       └───────────────┼───────────────┘
                       ▼
              [ Vector DB (pgvector) ] & [ Relational DB (Postgres) ]
```

### Request Categorization Pipeline
1.  **Input:** Text description, Voice note (transcribed via Whisper), and/or Images.
2.  **Processing:**
    *   *Text:* Sent to GPT-4o-mini with a structured prompt.
    *   *Images:* Sent to GPT-4o Vision to identify damaged parts, estimate severity.
3.  **Output:** Structured JSON.
    ```json
    {
      "category": "ac_refrigeration",
      "sub_category": "repair",
      "urgency": "high",
      "estimated_complexity": "medium",
      "detected_parts": ["compressor", "refrigerant"],
      "confidence_score": 0.94
    }
    ```
4.  **Fallback:** If confidence < 0.7, route to human triage or ask client clarifying questions via chat.

### Professional Matching Algorithm (7-Factor Scoring)
Score = $(W_1 \times F_{geo}) + (W_2 \times F_{skill}) + (W_3 \times F_{price}) + (W_4 \times F_{quality}) + (W_5 \times F_{availability}) + (W_6 \times F_{speed}) + (W_7 \times F_{capacity})$

*   $F_{geo}$ (25%): Distance from job site. Closer = higher score.
*   $F_{skill}$ (20%): Match between job sub-category and pro's certified skills.
*   $F_{price}$ (15%): Pro's historical average vs. estimated job price.
*   $F_{quality}$ (20%): Weighted rating (recent reviews count more) + AI quality score of past jobs.
*   $F_{availability}$ (10%): Currently online and not busy.
*   $F_{speed}$ (5%): Historical average response and acceptance time.
*   $F_{capacity}$ (5%): Current workload (prevent overloading top pros).

### Pricing Prediction Model
*   **Features:** Category, sub-category, estimated complexity, location (commune), time of day, day of week, historical prices for similar jobs.
*   **Model:** XGBoost Regressor (fast, interpretable, handles non-linearities well).
*   **Retraining:** Weekly automated pipeline using dbt and Airflow.

### Quality Scoring (Computer Vision)
*   **Input:** Before and After photos uploaded by the Pro.
*   **Pipeline:** GPT-4o Vision compares the two images. Prompt: "Compare the before and after images. Is the cleaning/repair visibly complete? Score from 0.0 to 1.0. Note any missed spots."
*   **Output:** Score integrated into the Pro's long-term quality metric.

### AI Infrastructure Table
| Component | Technology | Purpose | Est. Monthly Cost (Scale) |
| :--- | :--- | :--- | :--- |
| LLM (Text/Vision) | OpenAI GPT-4o-mini | Categorization, Support, Quality | $1,500 |
| Speech-to-Text | OpenAI Whisper / Deepgram | Voice note transcription | $300 |
| Vector DB | Supabase pgvector | Semantic search, RAG context | Included in DB |
| ML Hosting | AWS SageMaker / Modal | XGBoost pricing model hosting | $200 |
| Orchestration | LangChain / LlamaIndex | Prompt management, chaining | $0 (OSS) |

---

## 9. MATCHING ALGORITHM

### 3 Modes of Matching
1.  **Pull (MVP):** Client posts request -> Broadcast to nearby pros -> Pros bid/accept -> Client chooses.
2.  **Push (Phase 2):** Client posts request -> AI selects Top 3 pros -> Pros get exclusive 5-min window to accept -> If none, expand radius.
3.  **Auto-Assign (Phase 3):** Client posts request -> AI instantly assigns to the #1 ranked available pro -> Pro has 2 mins to accept or it routes to #2.

### ASCII Flow Diagram (Push Mode)
```text
[ Client Submits Request ]
          │
          ▼
[ AI Categorizes & Prices ]
          │
          ▼
[ PostGIS: Find Pros in Radius ]
          │
          ▼
[ 7-Factor Scoring Algorithm ]
          │
          ▼
[ Select Top 3 Pros ]
          │
    +-----+-----+
    │           │
[ Pro 1 ]   [ Pro 2 ]   [ Pro 3 ]
    │           │           │
    ▼           ▼           ▼
[ Push Notif ] [ Push Notif ] [ Push Notif ]
(5 min timer)  (5 min timer)  (5 min timer)
    │           │           │
    ▼           ▼           ▼
[ Accept? ]   [ Accept? ]   [ Accept? ]
    │           │           │
    └─────┬─────┘           │
          │                 │
    [ First to Accept ]     │
          │                 │
          ▼                 ▼
    [ Assign Job ]    [ Timer Expires ]
          │                 │
          ▼                 ▼
    [ Notify Client ] [ Route to Pro 2/3 ]
```

### Constraints
*   **Hard Constraints:** Pro must have the exact category skill. Pro must be within max service radius. Pro must be verified to at least Level 2 (ID verified). Pro account must be in good standing (no active suspensions).
*   **Soft Constraints:** Pro's preferred working hours. Pro's historical preference for certain communes. Pro's current fatigue level (hours worked today).

### Real-Time Update Strategy
*   Use Supabase Realtime (WebSockets).
*   When a job is created, publish to a channel `job_requests:{commune}`.
*   Pros' apps subscribe to their relevant channels.
*   When a pro accepts, publish to `job_updates:{job_id}` to instantly remove the job from other pros' feeds and notify the client.

---

## 10. TRUST & SAFETY SYSTEM

### 6-Level Verification System
1.  **Level 0 (Unverified):** Phone number verified via OTP. Can browse, cannot book/work.
2.  **Level 1 (Phone & Email):** Basic contact verified.
3.  **Level 2 (ID Verified):** CNI (Carte Nationale d'Identité) or Passport uploaded and verified via OCR + manual spot check. *Badge: 🛡️ Identité Vérifiée.*
4.  **Level 3 (Background Check):** Criminal record check (Extrait de Casier Judiciaire) and local neighborhood chief reference. *Badge: 🛡️+ Confiance.*
5.  **Level 4 (Certified):** Technical certification verified (e.g., CAP/BEP in plumbing, or Ça Match internal practical test). *Badge: ⭐ Expert.*
6.  **Level 5 (Elite):** Top 5% of pros. 100+ jobs, 4.9+ rating, zero disputes. Gets priority routing and lower platform fees. *Badge: 👑 Élite.*

### Review Integrity (6 Anti-Gaming Measures)
1.  **Verified Only:** Only clients who paid for and completed a job can review.
2.  **Dual-Blind:** Neither party sees the other's review until both submit, or 7 days pass.
3.  **Velocity Checks:** Flag accounts that leave >5 reviews in an hour.
4.  **Sentiment Analysis:** AI flags reviews that are overly generic or contain copied text.
5.  **Recency Weighting:** Reviews from the last 3 months count 2x towards the overall rating compared to older reviews.
6.  **Appeals Process:** Pros can flag reviews for extortion (e.g., "He demanded a discount and threatened a bad review").

### Review Moderation AI
*   **Input:** Review text, rating, job context.
*   **Checks:** Profanity filter, PII detection, relevance check (is it about the service?), sentiment consistency (does a 1-star review have positive text?).
*   **Output:** `approve`, `reject`, `flag_for_human_review`.

### Dispute Resolution Flow
```text
[ Client/Pro raises dispute in-app ]
                │
                ▼
[ Tier 1: Automated Mediation ]
- AI analyzes chat logs, photos, GPS data.
- Suggests resolution (e.g., 50% refund).
- If both accept -> Resolved.
                │ (If rejected)
                ▼
[ Tier 2: Platform Support Agent ]
- Human reviews evidence.
- Makes binding decision within 24h.
                │ (If appealed)
                ▼
[ Tier 3: Trust & Safety Manager ]
- Senior staff review.
- Final binding decision. Can result in account bans.
```

### Insurance Framework (Phase 3)
*   Partner with local insurer (e.g., NSIA or AXA Côte d'Ivoire).
*   **Micro-insurance:** $0.50 per job covers up to 200,000 XOF for property damage or minor injuries.
*   Premium deducted automatically from the platform fee.

### Emergency Features
*   **SOS Button:** In-app button connects directly to local police/ambulance and shares live location with Ça Match security team.
*   **Live Location Sharing:** During a job, client and pro can share live GPS.
*   **Check-in System:** For high-value or remote jobs, pro must check in every 30 mins. If missed, automated call to pro, then client.

---

## 11. PAYMENT FLOWS

### Architecture Diagram
```text
[ Client App ] ──(Select Payment)──> [ Ça Match API ]
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    ▼                     ▼                     ▼
            [ Wave API ]          [ Orange Money API ]    [ MTN MoMo API ]
                    │                     │                     │
                    └─────────────────────┼─────────────────────┘
                                          ▼
                                [ Payment Gateway / Aggregator ]
                                (e.g., CinetPay or Direct Integrations)
                                          │
                                          ▼
                                [ Ça Match Ledger (Postgres) ]
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    ▼                     ▼                     ▼
            [ Pro Wallet ]        [ Platform Revenue ]    [ Cash Reconciliation ]
```

### Hybrid Integration Strategy
1.  **Direct Merchant (Wave/Orange):** Best for lowest fees and best UX. Requires business registration and KYC with each telco.
2.  **Aggregator (CinetPay/Hub2):** Fallback for MTN and international cards. Higher fees (~2-3%), but single integration.
3.  **Manual/Cash:** For unbanked clients. Pro collects cash, enters OTP provided by client to close the job. Platform fee billed to Pro's wallet later.

### Step-by-Step: Orange Money Flow
1.  Client selects "Orange Money" at checkout.
2.  API calls OM to initiate USSD push to client's phone.
3.  Client enters OM PIN on their phone.
4.  OM Webhook hits Ça Match Edge Function: `payment_authorized`.
5.  Funds held in Ça Match Merchant Escrow Account.
6.  Job completed. Client approves.
7.  API calls OM to disburse funds to Pro's OM number (minus platform fee).

### Wave Flow (Zero-Fee Advantage)
1.  Wave charges 0% for receiving payments.
2.  Client clicks "Payer avec Wave".
3.  Deep link opens Wave app with pre-filled amount and merchant ID.
4.  Client confirms.
5.  Wave Webhook confirms receipt.
6.  Payout to Pro is also 0% fee. *This is a massive competitive advantage in CI.*

### Cash Payment Handling
1.  Client selects "Payer en Espèces".
2.  Pro completes job.
3.  Pro app generates a 6-digit PIN.
4.  Client pays cash, then gives the PIN to the Pro.
5.  Pro enters PIN in app. Job marked complete.
6.  Platform fee (e.g., 12%) is added to Pro's negative wallet balance. Pro must top up via Mobile Money to accept new jobs.

### Fee Structure Table
| Transaction Type | Client Fee | Pro Fee | Platform Revenue | Notes |
| :--- | :--- | :--- | :--- | :--- |
| Wave Payment | 0% | 0% | 12% of GMV | Deducted from Pro payout |
| Orange Money | 0% | 1.5% (OM fee) | 12% of GMV | OM fee passed to Pro or absorbed |
| Cash Payment | 0% | 0% | 12% of GMV | Billed to Pro wallet post-job |
| Credit Card (Agg)| 0% | 3.5% | 12% of GMV | Rare, for enterprise/intl |
| SaaS Subscription| 0% | 0% | 100% of sub | $10-$30/mo flat |

### Payment Security
*   **Escrow:** All digital funds held in a segregated trust account.
*   **Hold Periods:** New pros have a 48-hour hold on payouts. Elite pros get instant payouts.
*   **Dispute Freeze:** If a dispute is raised, funds are frozen in escrow until resolution.
*   **Refund Policy:** Full refund if pro no-shows. Partial refund if quality is disputed and validated by AI/Support.

### SQL Schema for Payments
```sql
CREATE TABLE payment_intents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id),
    payer_id UUID NOT NULL REFERENCES users(id),
    amount INT NOT NULL,
    currency TEXT DEFAULT 'XOF',
    method TEXT NOT NULL, -- 'wave', 'orange', 'mtn', 'cash'
    status payment_status DEFAULT 'pending',
    provider_reference TEXT, -- External ID from Wave/OM
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payee_id UUID NOT NULL REFERENCES users(id),
    amount INT NOT NULL,
    method TEXT NOT NULL,
    status payout_status DEFAULT 'pending',
    provider_reference TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE platform_fees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id),
    amount INT NOT NULL,
    collected BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 12. ADMIN DASHBOARD

### ASCII Overview Screen
```text
+-----------------------------------------------------------------------------+
| ÇA MATCH ADMIN   [🔍 Global Search]      🔔 (12)   👤 Admin   [🚪 Logout]  |
+-----------------------------------------------------------------------------+
| 📊 Dashboard | 👥 Users | 🛠️ Jobs | 💰 Finance | 🛡️ Verify | ⚙️ Settings    |
+-----------------------------------------------------------------------------+
| REAL-TIME METRICS (Abidjan - Aujourd'hui)                                   |
| +----------------+ +----------------+ +----------------+ +----------------+  |
| | 342            | | 4,500,000 XOF  | | 85             | | 12             |  |
| | Jobs Actifs    | | GMV (24h)      | | Pros En Ligne  | | Litiges Ouverts|  |
| +----------------+ +----------------+ +----------------+ +----------------+  |
|                                                                             |
| ALERTES SYSTÈME                                                             |
| 🔴 3 Pros signalés pour comportement abusif                                 |
| 🟡 Wave Webhook latency > 2s                                                |
| 🟢 15 Nouvelles inscriptions pros à vérifier                                |
|                                                                             |
| GRAPHIQUE: GMV & JOBS (7 JOURS)                                             |
| 5M |       *--*                                                            |
|    |     *      *   *                                                      |
| 2M |   *          *     *--*                                               |
|    | *                  *     *                                             |
|  0 +---+---+---+---+---+---+---                                            |
|    Lun Mar Mer Jeu Ven Sam Dim                                              |
+-----------------------------------------------------------------------------+
```

### Verification Queue Screen
```text
+-----------------------------------------------------------------------------+
| FILE D'ATTENTE VÉRIFICATION (15 en attente)      [Filtres: ▼ Tous] [Auto]  |
+-----------------------------------------------------------------------------+
| ID       | Nom          | Catégorie   | Docs Soumis      | Action          |
|----------|--------------|-------------|------------------|-----------------|
| V-1042   | Kouassi E.   | Électricien | CNI, Casier      | [👁️ Voir] [✅] [❌]|
| V-1043   | Marie K.     | Nettoyeuse  | CNI              | [👁️ Voir] [✅] [❌]|
| V-1044   | Yannick T.   | Plombier    | CNI, CAP         | [👁️ Voir] [✅] [❌]|
+-----------------------------------------------------------------------------+
| DÉTAILS: V-1042 (Kouassi E.)                                                |
| +-------------------------+-------------------------------------------------+|
| | [Image CNI Recto]       | | Nom: Kouassi Éléphant                       ||
| | [Image CNI Verso]       | | Tél: +225 07 08 09 10                       ||
| | [Image Casier]          | | Adresse: Abobo, Zone 4                      ||
| |                         | | Score IA: 92% (Docs valides)                ||
| +-------------------------+-------------------------------------------------+|
| Notes Admin: [___________________________________________________________]  |
| [ ✅ Approuver (Niveau 2) ]  [ ❌ Rejeter (Demander nouveau CNI) ]         |
+-----------------------------------------------------------------------------+
```

### Capabilities
*   **Job Oversight:** View live map of all active jobs. Intervene in stuck jobs.
*   **Financial Oversight:** Daily reconciliation of Wave/OM settlements. Approve large manual payouts.
*   **Content Moderation:** Queue for flagged reviews, inappropriate profile photos, or chat messages.
*   **System Settings:** Adjust platform fees, tweak matching algorithm weights, manage categories and base prices.

---

## 13. ENTERPRISE DASHBOARD

### ASCII Multi-Site Management
```text
+-----------------------------------------------------------------------------+
| GROUPE HÔTEL IVOIRE   |  Site: 🏨 Hôtel Plateau  |  👤 Sylvie  [⚙️]        |
+-----------------------------------------------------------------------------+
| 📊 Vue Globale | 🏢 Sites | 📋 Demandes | 💰 Budgets | 📈 Rapports         |
+-----------------------------------------------------------------------------+
| SITES ACTIFS                                                                |
| +---------------------------------------------------+---------------------+ |
| | Site                                              | Statut & Alertes    | |
| |---------------------------------------------------|---------------------| |
| | 🏨 Hôtel Ivoire Plateau (Siège)                   | 🟢 Normal           | |
| | 🏨 Hôtel Ivoire Marcory                           | 🟡 Budget à 85%     | |
| | 🏨 Hôtel Ivoire Aéroport (FHB)                    | 🔴 SLA Breach: Clim | |
| +---------------------------------------------------+---------------------+ |
|                                                                             |
| WORKFLOW D'APPROBATION (Configuration)                                      |
| +-------------------------------------------------------------------------+ |
| | Montant < 50,000 XOF  ➔  Auto-Approuvé (Si budget OK)                   | |
| | Montant 50k - 200k    ➔  Manager de Site (Jean/Paul)                    | |
| | Montant > 200,000 XOF ➔  Dir. Ops (Sylvie) ➔  Finance (Marc)            | |
| +-------------------------------------------------------------------------+ |
+-----------------------------------------------------------------------------+
```

### SLA Tracking Table
| Metric | Target | Current (Plateau) | Current (Marcory) | Penalty Trigger |
| :--- | :--- | :--- | :--- | :--- |
| Response Time (Urgent) | < 30 mins | 22 mins | 45 mins | > 45 mins (-5% fee) |
| Resolution Time (Std) | < 24 hours | 18 hours | 20 hours | > 24 hours (-10% fee) |
| First-Time Fix Rate | > 85% | 88% | 82% | < 80% (Review vendor) |
| Pro Arrival On-Time | > 95% | 96% | 91% | < 90% (Warning) |

### Budget Management
*   Set monthly caps per site and per category (e.g., 500,000 XOF for Plumbing at Plateau).
*   Visual progress bars. Alerts at 70%, 90%, 100%.
*   Rollover options for unused budget.

---

## 14. ANALYTICS

### 20+ Tracked Events
| Event Name | Properties | Trigger |
| :--- | :--- | :--- |
| `app_opened` | `source`, `user_type` | App launch |
| `search_performed` | `query`, `category`, `location` | User hits search |
| `pro_profile_viewed` | `pro_id`, `category`, `source` | Click on pro card |
| `request_created` | `category`, `method` (text/voice/photo), `estimated_price` | Submit request |
| `quote_received` | `quote_id`, `amount`, `time_to_quote` | Pro sends quote |
| `quote_accepted` | `quote_id`, `amount` | Client accepts quote |
| `job_started` | `job_id`, `pro_id` | Pro clicks "Start Job" |
| `job_completed` | `job_id`, `final_price`, `duration_mins` | Pro completes job |
| `payment_initiated` | `method`, `amount` | Click pay |
| `payment_success` | `method`, `amount`, `provider_ref` | Webhook success |
| `review_submitted` | `rating`, `has_text`, `role` (client/pro) | Submit review |
| `chat_message_sent` | `has_media`, `is_voice_note` | Send message |
| `payout_requested` | `amount`, `method` | Pro requests withdrawal |
| `verification_submitted` | `level`, `doc_type` | Pro uploads ID |
| `error_occurred` | `screen`, `error_code`, `message` | Catch block |
| `onboarding_step_completed`| `step_name`, `step_number` | Finish onboarding |
| `notification_clicked` | `notification_type`, `channel` | Tap push/SMS |
| `pro_status_toggled` | `new_status` (online/offline) | Toggle availability |
| `filter_applied` | `filter_name`, `filter_value` | Use search filter |
| `support_ticket_created`| `category`, `priority` | Contact support |

### North Star Metrics
1.  **Weekly Active Transacting Users (WATU):** Clients + Pros who complete a job.
2.  **Gross Merchandise Value (GMV):** Total value of services paid through the platform.
3.  **Match Rate:** % of requests that result in a completed job.
4.  **Pro Retention (D30):** % of pros who complete a job in week 1 and week 4.
5.  **Net Promoter Score (NPS):** For both clients and pros.

### Funnel Metrics (Target)
*   App Open -> Search: 60%
*   Search -> Request Created: 25%
*   Request -> Quote Received: 80%
*   Quote -> Accepted: 60%
*   Accepted -> Completed: 90%
*   Completed -> Paid: 95%
*   Paid -> Reviewed: 30%

---

## 15. NOTIFICATION SYSTEM

### 5 Channels
1.  **Push (Firebase/OneSignal):** Primary for active app users. High priority.
2.  **SMS (Twilio/Africa's Talking):** Fallback for offline users or high-priority alerts (payment, OTP).
3.  **WhatsApp Business API:** High engagement in CI. Used for job alerts, receipts, and support.
4.  **Email (SendGrid):** Invoices, monthly statements, marketing. Low priority.
5.  **In-App:** Toasts and inbox for non-urgent updates.

### Client Notification Triggers
| Trigger | Message (French) | Channel | Timing |
| :--- | :--- | :--- | :--- |
| Pro Assigned | "Kouassi a accepté votre demande. Il arrive !" | Push, WhatsApp | Instant |
| Pro Arriving | "Votre pro est à 5 min. Préparez-vous." | Push | 5 min before |
| Quote Received | "Vous avez reçu un devis de 15 000 F. Voir." | Push, SMS | Instant |
| Job Completed | "Job terminé ! Vérifiez et payez en toute sécurité." | Push, SMS | Instant |
| Payment Success | "Paiement de 15 000 F confirmé. Merci !" | Push, Email | Instant |
| Review Request | "Comment s'est passé votre job avec Kouassi ?" | Push, WhatsApp | +2 hours |
| Dispute Update | "Mise à jour sur votre litige #1042." | Push, SMS | Instant |
| Promo/Offer | "Besoin d'un nettoyage ? -20% ce week-end." | Push, Email | Scheduled |

### Professional Notification Triggers
| Trigger | Message (French) | Channel | Timing |
| :--- | :--- | :--- | :--- |
| New Lead (Push) | "🚨 Nouveau job Électricité à Cocody (1.2km). 10 000 F." | Push, SMS | Instant |
| Quote Accepted | "Le client a accepté votre devis. C'est parti !" | Push, SMS | Instant |
| Payment Received | "💰 15 000 F reçu. Disponible pour retrait." | Push, WhatsApp | Instant |
| Review Received | "⭐⭐⭐⭐⭐ Amina vous a laissé 5 étoiles !" | Push | Instant |
| Payout Processed | "Votre virement Wave de 50 000 F est en cours." | Push, SMS | Instant |
| Verification Approved| "✅ Votre identité est vérifiée. Badge obtenu !" | Push, Email | Instant |
| Low Balance | "Attention: Solde insuffisant pour accepter des jobs." | Push, SMS | Instant |
| Weekly Summary | "📊 Bilan de la semaine: 12 jobs, 120 000 F gagnés." | Email, WhatsApp| Sunday 18:00 |

### Architecture
```text
[ App / Backend ] -> [ Event Bus (Supabase Edge / Redis) ]
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
    [ Push Provider ]   [ SMS/WhatsApp ]    [ Email Provider ]
    (Firebase/OneSignal) (Twilio/360dialog)  (SendGrid)
            │                 │                 │
            └─────────────────┼─────────────────┘
                              ▼
                    [ User Preference DB ]
                    (Checks opt-ins before sending)
```

---

## 16. PERMISSIONS & ROLES

### 8-Role Hierarchy
```text
[ Platform Super Admin ]
       │
       ├── [ Platform Support ]
       ├── [ Platform Finance ]
       │
[ Enterprise Super Admin ]
       │
       ├── [ Enterprise Site Manager ]
       ├── [ Enterprise Finance ]
       │
[ Business Admin (SME Pro) ]
       │
       ├── [ Business Dispatcher ]
       └── [ Business Technician ]
```

### Permission Matrix
| Action | Super Admin | Support | Finance | Ent. Admin | Site Mgr | Biz Admin | Dispatcher | Technician |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| Manage Platform Settings | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View All Financials | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Approve Verifications | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage Enterprise Sites | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Approve High-Value Quotes | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Dispatch Jobs to Team | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Execute / Complete Jobs | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| View Own Earnings | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |

### SQL Implementation
```sql
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB NOT NULL, -- e.g., {"manage_settings": true, "view_financials": false}
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    scope_id UUID, -- e.g., enterprise_id or business_id
    PRIMARY KEY (user_id, role_id, scope_id)
);

-- RLS Policy Example for Role-Based Access
CREATE POLICY "Admins can view all audit logs" ON audit_logs FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid() AND r.name = 'platform_super_admin'
    )
);
```

---

## 17. API DESIGN

### Architecture
*   **PostgREST:** Auto-generates REST API from PostgreSQL schema. Handles CRUD, filtering, pagination natively.
*   **Edge Functions (Deno):** Custom business logic (AI processing, payment webhooks, complex matching).
*   **Realtime:** WebSockets for live updates (chat, job status).
*   **Storage:** S3-compatible for images/documents.

### REST Endpoint Examples (PostgREST)
```http
# Get nearby electricians with full text search and pagination
GET /rest/v1/professional_profiles?category=eq.electrician&fts=plombier&location=near.43.65,-5.34,10000&select=*,client_profiles(rating)&limit=20&offset=0

# Get active jobs for a specific enterprise site with nested data
GET /rest/v1/service_requests?enterprise_site_id=eq.{site_id}&status=in.('accepted','in_progress')&select=*,quotes(*),jobs(*),client_profiles(first_name,last_name,phone)

# Create a new service request
POST /rest/v1/service_requests
Body: { "client_id": "...", "category": "plumber", "location": "..." }
```

### Edge Function Examples (TypeScript/Deno)

**1. Create Service Request (AI Categorization)**
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const { text_input, image_url, client_id } = await req.json();
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  // 1. Call OpenAI for categorization
  const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: `Categorize this service request in Abidjan: ${text_input}. Return JSON: {category, urgency, estimated_price_min, estimated_price_max}` }],
      response_format: { type: "json_object" }
    })
  });
  const aiData = await aiResponse.json();
  const parsed = JSON.parse(aiData.choices[0].message.content);

  // 2. Insert into DB
  const { data, error } = await supabase.from('service_requests').insert({
    client_id,
    category: parsed.category,
    description: text_input,
    estimated_price_min: parsed.estimated_price_min,
    estimated_price_max: parsed.estimated_price_max,
    // location and address would be added from client context
  }).select().single();

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  // 3. Trigger Matching Algorithm (Async via another function or queue)
  // await supabase.functions.invoke('match-professionals', { body: { request_id: data.id } });

  return new Response(JSON.stringify(data), { status: 200 });
});
```

**2. Process Payment (Webhook Handler for Wave/Orange)**
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const signature = req.headers.get('x-webhook-signature');
  const payload = await req.json();

  // 1. Verify signature (pseudo-code)
  // if (!verifySignature(payload, signature, Deno.env.get('WAVE_WEBHOOK_SECRET'))) {
  //   return new Response('Invalid signature', { status: 401 });
  // }

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  // 2. Update Payment Intent
  const { data: intent, error } = await supabase
    .from('payment_intents')
    .update({ status: 'captured', provider_reference: payload.transaction_id, updated_at: new Date() })
    .eq('id', payload.metadata.intent_id)
    .select()
    .single();

  if (error || !intent) return new Response('Intent not found', { status: 404 });

  // 3. Update Job Status if fully paid
  await supabase.from('jobs').update({ status: 'paid' }).eq('id', intent.job_id);

  // 4. Record Platform Fee
  const platformFee = Math.round(intent.amount * 0.12);
  await supabase.from('platform_fees').insert({ job_id: intent.job_id, amount: platformFee });

  return new Response(JSON.stringify({ success: true }), { status: 200 });
});
```

**3. Webhook Payment (Disbursement to Pro)**
```typescript
// Triggered when a job is completed and client approves
export async function disburseToPro(jobId: string, supabase: any) {
  const { data: job } = await supabase.from('jobs').select('*, service_requests(professional_id, final_price)').eq('id', jobId).single();
  const proId = job.service_requests.professional_id;
  const amount = job.service_requests.final_price;
  const fee = Math.round(amount * 0.12);
  const payoutAmount = amount - fee;

  // Call Wave/Orange API to push funds
  const payoutResponse = await fetch('https://api.wave.com/v1/payouts', { ... });

  await supabase.from('payouts').insert({
    payee_id: proId,
    amount: payoutAmount,
    method: 'wave',
    status: 'processing',
    provider_reference: payoutResponse.id
  });
}
```

### Real-Time Subscription (Client App)
```javascript
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(URL, ANON_KEY);

// Listen to job status changes for a specific job
const subscription = supabase
  .channel('job-updates')
  .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'service_requests', filter: `id=eq.${jobId}` }, (payload) => {
    console.log('Job status changed:', payload.new.status);
    if (payload.new.status === 'in_progress') {
      showProOnMap();
    }
  })
  .subscribe();
```

### Rate Limiting
| Endpoint Type | Limit | Window | Action on Limit |
| :--- | :--- | :--- | :--- |
| Auth / OTP | 5 | 1 min | 429 Too Many Requests |
| Search / Read | 100 | 1 min | 429 |
| Create Request | 10 | 1 hour | 429 |
| Chat Messages | 30 | 1 min | 429 |
| Edge Functions (AI)| 20 | 1 min | 429 |

---

## 18. TECHNICAL STACK

### Full-Stack Architecture
```text
[ React Native (Mobile) ]  [ Next.js (Web/Desktop) ]  [ WhatsApp Bot (Node.js) ]
          │                        │                           │
          └────────────────────────┼───────────────────────────┘
                                   ▼
                          [ Cloudflare CDN / WAF ]
                                   ▼
                          [ Supabase Platform ]
          ┌────────────────────────┼────────────────────────┐
          ▼                        ▼                        ▼
[ PostgREST (API) ]      [ Edge Functions (Deno) ]  [ Realtime (WebSockets) ]
          │                        │                        │
          ▼                        ▼                        ▼
[ PostgreSQL + PostGIS ]   [ OpenAI / AWS ]         [ Firebase (Push) ]
[ pgvector ]               [ Twilio / Wave API ]    [ S3 (Storage) ]
```

### Technology Choices
| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| Mobile App | React Native (Expo) | Single codebase for iOS/Android. Fast iteration. |
| Web/Desktop | Next.js (React) | SSR for SEO (marketplace), fast dashboard rendering. |
| Backend / DB | Supabase (PostgreSQL) | BaaS reduces boilerplate. PostGIS for geo, pgvector for AI. |
| Auth | Supabase Auth | Phone OTP native, secure, integrates with RLS. |
| Edge Logic | Deno / TypeScript | Secure, fast, native TS support for Edge Functions. |
| State Mgmt | React Query / Zustand | Robust caching, offline support, minimal boilerplate. |
| Maps | Mapbox GL JS / React Native | Better customization and offline capabilities than Google. |
| Payments | Wave API / Orange Money | Local dominance. Wave for zero-fee, OM for reach. |
| AI/LLM | OpenAI (GPT-4o-mini) | Best price/performance for structured extraction. |
| Vector DB | pgvector (Supabase) | Keeps data in the same DB as relational data. |
| Analytics | PostHog (Self-hosted) | Product analytics, session replay, feature flags. Open source. |
| Monitoring | Sentry | Error tracking and performance monitoring. |
| CI/CD | GitHub Actions | Standard, robust, integrates with Supabase CLI. |
| Chat | Supabase Realtime | Built-in, scales well, no extra vendor. |
| SMS/WhatsApp | Twilio / 360dialog | Reliable delivery in Africa. |
| Design System | Tailwind CSS + shadcn/ui | Fast development, consistent UI, accessible. |

### Infrastructure & Cost Estimates (Monthly at Scale)
| Environment | Specs | Est. Cost |
| :--- | :--- | :--- |
| **Dev/Staging** | Supabase Pro, 8GB DB, 2 Edge GB | $50 |
| **Prod (Initial)**| Supabase Team, 100GB DB, 10 Edge GB | $600 |
| **Prod (Scale)** | Supabase Enterprise / Custom, Read Replicas | $2,500 |
| **External APIs**| OpenAI, Twilio, Mapbox, Sentry | $1,500 |
| **Total** | | **~$4,650/mo** |

### Security Checklist
- [ ] All PII encrypted at rest (Supabase handles via AWS KMS).
- [ ] Row Level Security (RLS) enabled on all tables.
- [ ] API keys stored in environment variables, never in code.
- [ ] Webhook signatures verified for all payment providers.
- [ ] Rate limiting applied at Cloudflare and Edge levels.
- [ ] Regular automated backups (Supabase PITR).
- [ ] Dependency scanning (Dependabot/Snyk) in CI/CD.

---

## 19. 12-MONTH PRODUCT ROADMAP

### Timeline Overview
```text
M1   M2   M3   M4   M5   M6   M7   M8   M9   M10  M11  M12
|====|====|====|====|====|====|====|====|====|====|====|====|
 Phase 1: Marketplace MVP (0->1)
 [Core App] [Pro App] [Payments] [Launch Abidjan]
                     Phase 2: Service OS (1->10)
                     [SME Tools] [Enterprise] [B2B Sales]
                                      Phase 3: AI OS (10->100)
                                      [AI Dispatch] [Auto-Pricing] [Scale]
```

### Sprint Breakdown (22 Sprints)

**Phase 1: Marketplace MVP (Months 1-4)**
*   **Sprint 1-2:** DB Schema, Auth, Basic Profiles, RLS setup.
*   **Sprint 3-4:** Client App (Search, Categories, Pro Profiles).
*   **Sprint 5-6:** Pro App (Dashboard, Accept/Reject, Basic Navigation).
*   **Sprint 7-8:** Chat, Notifications (Push/SMS), In-app messaging.
*   **Sprint 9-10:** Wave & Orange Money Integration, Escrow logic.
*   **Sprint 11-12:** Reviews, Dispute flow, Cash payment verification.
*   **Sprint 13-14:** Beta testing in Cocody, bug fixes, onboarding 50 pros.
*   **Sprint 15-16:** **PUBLIC LAUNCH ABIJAN.** Marketing push.

**Phase 2: Service OS & Enterprise (Months 5-8)**
*   **Sprint 17:** Business Profiles, Team management, Multi-user roles.
*   **Sprint 18:** Advanced Dispatch Board, Scheduling, Invoicing (PDF).
*   **Sprint 19:** Enterprise Profiles, Multi-site hierarchy.
*   **Sprint 20:** Approval workflows, SLA tracking, Budget management.
*   **Sprint 21:** Offline mode for Pros, USSD/WhatsApp bridge prototype.
*   **Sprint 22:** B2B Sales push, onboard 3 Enterprise clients (Hotels).

**Phase 3: AI OS & Scale (Months 9-12)**
*   **Sprint 23-24:** AI Request Categorization (NLP/Vision), Smart Matching v1.
*   **Sprint 25-26:** Dynamic Pricing Engine (XGBoost), AI Quote Generator.
*   **Sprint 27-28:** Auto-Dispatcher (Push mode), Quality Scoring (CV).
*   **Sprint 29-30:** Expansion prep (Dakar/Accra), Localization, Multi-currency.
*   **Sprint 31-32:** Performance optimization, Scale infrastructure, Phase 4 planning.

### Key Milestones
| Milestone | Target Date | Success Criteria |
| :--- | :--- | :--- |
| Alpha Internal | Month 2 | Core flows working, 10 internal testers. |
| Closed Beta | Month 3 | 50 pros, 200 clients, 100 completed jobs. |
| **Public Launch** | **Month 4** | **Press release, 500 pros, 5k clients.** |
| First Enterprise | Month 6 | 1 Hotel group signed, $10k MRR B2B. |
| AI Auto-Dispatch | Month 9 | 30% of jobs routed without human intervention. |
| Break-Even | Month 12 | Monthly revenue > Monthly burn rate. |

### Quarterly Metrics Targets
| Quarter | GMV Target | Active Pros | Active Clients | Take Rate |
| :--- | :--- | :--- | :--- | :--- |
| Q1 (Launch) | $150k | 500 | 5,000 | 10% |
| Q2 | $400k | 1,500 | 15,000 | 11% |
| Q3 | $800k | 3,000 | 30,000 | 12% |
| Q4 | $1.5M | 5,000 | 50,000 | 13% |

---

## 20. APPENDICES

### Glossary
*   **GMV (Gross Merchandise Value):** Total value of services transacted.
*   **Take Rate:** Platform revenue as a percentage of GMV.
*   **MoMo:** Mobile Money.
*   **XOF:** West African CFA franc.
*   **Nouchi:** Ivorian French slang/creole.
*   **CNI:** Carte Nationale d'Identité (National ID).
*   **SLA:** Service Level Agreement.
*   **Escrow:** Funds held by a third party until conditions are met.
*   **Pull vs Push Matching:** Client chooses vs System assigns.
*   **Liquidity:** Having enough pros to fulfill client requests quickly.
*   **D30 Retention:** % of users active 30 days after first action.
*   **WATU:** Weekly Active Transacting Users.
*   **BaaS:** Backend as a Service (Supabase).
*   **RLS:** Row Level Security.
*   **PostGIS:** PostgreSQL spatial database extender.

### Risk Assessment
| Risk | Probability | Impact | Mitigation |
| :--- | :--- | :--- | :--- |
| Telcos change API/fees | Medium | High | Use aggregators as fallback; negotiate long-term contracts. |
| Pros bypass platform (disintermediation) | High | High | Build OS tools (invoicing, CRM) they need daily; penalize off-platform behavior. |
| Low smartphone/data penetration | Medium | Medium | Build robust USSD/WhatsApp/Offline modes; optimize for low bandwidth. |
| Trust/Safety incidents (theft, fraud) | Medium | High | Strict 6-level verification; SOS button; insurance; rapid support. |
| Competitor copies model | Low | Medium | Move fast; build deep B2B/Enterprise lock-in; superior AI/UX. |
| Regulatory changes (gig economy laws)| Low | High | Engage local government early; classify pros as independent partners carefully. |
| Payment gateway downtime | Medium | High | Multi-provider strategy (Wave + OM + Cash fallback). |
| AI hallucinations/bad pricing | Medium | Medium | Human-in-the-loop for edge cases; strict confidence thresholds. |

### Competitive Landscape
| Competitor | Strengths | Weaknesses | Ça Match Differentiation |
| :--- | :--- | :--- | :--- |
| **Facebook Marketplace / Groups** | Massive user base, free. | No trust, no escrow, chaotic, no OS tools. | Verified pros, secure payments, professional OS. |
| **Expat.com / Annuaire** | Established directory. | Static, no transactions, no mobile money. | Transactional marketplace, dynamic matching. |
| **Local Agencies (Plumbing/Elec)** | High trust, managed quality. | Expensive, slow, exclusive to rich areas. | Democratized access, AI pricing, broader coverage. |
| **Gozem (West Africa)** | Good mobile UX, multi-service. | Focuses on transport/delivery, less on home services OS. | Deep focus on home services, B2B/Enterprise features. |
| **Jumia Services (Defunct/Pivoted)**| Brand recognition. | Failed to solve trust and liquidity. | Asset-light, pro-first OS approach, mobile money native. |

### Localization Notes (Côte d'Ivoire)
*   **Language:** Primary UI in French. Include a toggle for "Nouchi" (simplified, friendly local slang) for the Pro app to increase comfort.
*   **Addresses:** Formal addresses (street names) are often unreliable. Rely heavily on GPS pins, landmarks ("À côté de la pharmacie"), and phone call coordination.
*   **Culture:** Greetings are important. The app should encourage polite interactions. "Bonjour" before business.
*   **Time:** "African time" is real. Build buffer times into the scheduling algorithm. Pro arrival times should be estimates, not strict promises.
*   **Currency:** All displays in XOF (FCFA). Avoid decimals (e.g., 15 000 F, not 15 000.00 F). Use the space as a thousands separator.

### Data Retention & Privacy Policy
*   **Compliance:** Adhere to Côte d'Ivoire's ARTCI regulations and general GDPR principles (as a best practice).
*   **Retention:**
    *   Transaction data: 5 years (legal/tax requirement).
    *   Chat logs: 1 year, then anonymized/deleted.
    *   GPS/Location data: 30 days for dispute resolution, then deleted.
    *   ID Documents: Deleted immediately after verification is complete; only a hash/verification status is kept.
*   **User Rights:** Users can request data export (JSON) and account deletion via the app settings or support.

### Support & Operations Structure
*   **Tier 1 (In-App Chatbot & FAQ):** AI handles 60% of queries (password reset, how to pay, status check).
*   **Tier 2 (Local Support Team):** Based in Abidjan. Handles disputes, verification queues, and complex issues via WhatsApp Business and phone. Target response < 2 hours.
*   **Tier 3 (Trust & Safety / Tech):** Escalations involving fraud, legal threats, or platform bugs.
*   **Pro Success Team:** Dedicated account managers for Top 20% of pros and all Enterprise clients to ensure retention and upsell SaaS features.

---
*End of Document. Prepared by the Product & Engineering Team for Ça Match.*