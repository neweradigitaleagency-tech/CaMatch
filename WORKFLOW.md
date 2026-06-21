# Workflow Ça Match

## 1. Parcours CLIENT → Trouve un Pro

### A) Recherche directe (Explorer)

```
[ExplorerScreen]
    │
    ├── Filtre par catégorie (Nettoyage, Plomberie, Climatisation, Électricité)
    ├── Filtre par urgence (Urgent / Aujourd'hui / Planifié / Devis)
    ├── Barre de recherche (voix + texte)
    └── Carte géographique (toggle)
            │
            ▼
    [ProfilProScreen] ← clic sur une carte pro
            │
            ├── Hero image + infos pro (nom, titre, note, missions, zone)
            ├── Tarifs (taux horaire, déplacement, forfait 2h)
            ├── Portfolio (photos des réalisations)
            ├── Services (sélectionnables avec prix)
            ├── Bio / À propos
            │
            ▼
    [Bouton "Ça Match"] ← tout en bas du profil
            │
            ▼
    [ProSelectionScreen / SuiviDemandeScreen]
            │
            ▼   (Workflow commun ci-dessous)
```

### B) Création de demande

```
[NewRequestScreen] / [RequestCreationScreen]
    │
    ├── Description du besoin
    ├── Photos du problème
    ├── Catégorie + localisation
    └── Publication
            │
            ▼
    ← La demande est envoyée aux pros dans la zone (10 km max)
    ← Algorithme de proximité : d'abord les pros les plus proches (300m-2km), puis élargit
    ← Les pros ont 2 min pour accepter
            │
            ▼
    [RequestsListScreen] ← le client voit sa demande en "attente"
            │
            ▼   (Workflow commun ci-dessous)
```

---

## Workflow commun : Suivi de mission (7 états)

```
 ┌──────────┐
 │ CREATED  │ ← Pro accepte la mission
 └────┬─────┘
      │
      ▼
 ┌──────────┐
 │ ACCEPTED │ ← Client notifié, chat débloqué entre client & pro
 └────┬─────┘
      │
      ▼
 ┌──────────┐
 │ EN_ROUTE │ ← Pro clique "En route" (départ vers le client)
 └────┬─────┘
      │
      ▼
 ┌───────────┐
 │ IN_PROGRESS│ ← Pro clique "Arrivé" + photo AVANT obligatoire
 └────┬──────┘
      │
      ▼
 ┌───────────┐
 │ COMPLETED │ ← Pro clique "Terminé" + photo APRÈS obligatoire
 └────┬──────┘
      │
      ▼
 ┌──────────┐
 │   PAID   │ ← Paiement via QR (Mobile Money)
 └────┬─────┘    Wave / Orange Money / MTN MoMo
      │
      ▼
 ┌───────────┐
 │  REVIEWED │ ← Client note le pro + photo avant/après affichée
 └───────────┘
```

### Notifications automatiques côté CLIENT à chaque étape :
| État pro | Client voit |
|----------|-------------|
| ACCEPTED | "✅ Le pro a accepté votre demande" + chat activé |
| EN_ROUTE | "🚗 Le pro est en route" |
| IN_PROGRESS | "🔧 Le pro a commencé" + photo avant |
| COMPLETED | "✅ Mission terminée" + photo après |
| PAID | "💳 Paiement reçu" |
| REVIEWED | "⭐ Notez votre expérience" |

---

## 2. Parcours PRO

```
[ProDashboardScreen]
    │
    ├── Dashboard (KPIs : missions du jour, gains, alertes)
    │   ├── Interventions du jour (appel / message client)
    │   └── Alertes de demande (2 min pour accepter)
    │
    ├── Planning
    │   ├── Calendrier mensuel
    │   ├── Créneaux récurrents
    │   └── Jours bloqués
    │
    ├── Messages
    │   └── Conversations avec les clients
    │
    ├── Finance
    │   ├── Solde disponible
    │   ├── Transactions récentes
    │   ├── QR Code (pour recevoir paiements)
    │   ├── Retrait (Wave / Orange Money / MTN MoMo)
    │   └── Factures (commission 15%)
    │
    └── Profil
        ├── Bio éditée
        ├── Services & Tarifs (CRUD)
        ├── Portfolio (photos avant/après)
        ├── Vérification (6 niveaux)
        ├── Paramètres (langue, notifications, déconnexion)
        └── Mode Client / Pro
```

### Job Execution (suivi des étapes par le pro) :

```
[ProJobExecutionScreen]
    │
    ├── Statut actuel + bouton pour passer à l'étape suivante
    ├── Infos client (nom, adresse, téléphone)
    ├── Prix détaillé
    │
    ├── ACCEPTED  → [Accepter]  → EN_ROUTE
    ├── EN_ROUTE  → [En route]  → IN_PROGRESS (géolocalisation)
    ├── IN_PROGRESS → [Commencer] → photo AVANT obligatoire → COMPLETED
    ├── COMPLETED → [Terminer]  → photo APRÈS obligatoire → paiement
    └── PAID      → terminé
```

---

## 3. Paiement & Commission

```
[Pro génère son QR] → [Client scanne]
                              │
                              ▼
              Choix Mobile Money
           ┌──────┬──────┬──────┐
           │ Wave │Orange│ MTN  │
           │      │Money │ MoMo │
           └──────┴──────┴──────┘
                              │
                              ▼
          Paiement → Compte plateforme (commission 15%)
                              │
                              ▼
          Pro retire via l'app → Son compte Mobile Money
```

---

## Architecture technique

```
App.tsx
  │
  ├── Mode CLIENT ──────────────────────
  │   ├── ExplorerScreen
  │   │   ├── ProfilProScreen (vue pro)
  │   │   └── ProSelectionScreen
  │   ├── RequestsListScreen
  │   │   ├── RequestCreationScreen
  │   │   └── RequestDetailScreen
  │   ├── NewRequestScreen
  │   ├── MessagingScreen
  │   │   └── ChatScreen
  │   └── ClientProfileScreen
  │       ├── ClientPaymentsScreen
  │       ├── ClientAddressesScreen
  │       ├── ClientNotificationsScreen
  │       └── ClientHelpScreen
  │
  └── Mode PRO ─────────────────────────
      ├── ProDashboardScreen
      ├── ProScheduleScreen
      ├── MessagingScreen (pro version)
      ├── ProFinanceScreen
      ├── ProProfileScreen
      │   ├── ProProfileMiniSiteScreen
      │   ├── ProVerificationScreen
      │   └── ProHelpScreen
      └── ProJobExecutionScreen
```
