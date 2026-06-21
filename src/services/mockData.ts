import type {
  ProfessionalDetails,
  Service,
  ClientRequest,
  Mission,
  Conversation,
  Message,
  ProDashboardStats,
  ProJob,
  ProAlert,
  ProEarning,
  PortfolioItem,
  ProVerification,
  NotificationPreference,
  PaymentTransaction,
  ProFinanceSummary,
  ProPricingConfig,
  ProAvailability,
} from "../types";
import { UserRole } from "../types";

const proCleaningAvatar = new URL("../../assets/pro_cleaning_avatar.png", import.meta.url).href;

export const MOCK_PROS: ProfessionalDetails[] = [
  {
    id: "pro1", name: "Koffi Kouamé", email: "koffi.electricien@gmail.com",
    phoneNumber: "+225 07 45 88 12",     role: UserRole.PRO,
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    category: "electricity", title: "Maître Électricien",
    bio: "Installations triphasées, dépannages haute et basse tension dans tout Cocody et Plateau. Diplômé de l'INP-HB.",
    experienceYears: 10, rating: 49, reviewCount: 88, hourlyRateXOF: 12000,
    locationNeighborhood: "Cocody, Abidjan", isVerified: true, completedInterventions: 140,
    availabilityStatus: "available", createdAt: "2026-06-18T05:25:00Z",
  },
  {
    id: "pro2", name: "Ismaël Koné", email: "konis.plomberie@gmail.com",
    phoneNumber: "+225 05 32 99 44", role: UserRole.PRO,
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    category: "plumbing", title: "Plombier Sanitaire",
    bio: "Spécialisé en réparation de fuites, débouchages urgents, robinetteries suspendues et raccordements sanitaires.",
    experienceYears: 6, rating: 48, reviewCount: 74, hourlyRateXOF: 10000,
    locationNeighborhood: "Marcory, Abidjan", isVerified: true, completedInterventions: 95,
    availabilityStatus: "available", createdAt: "2026-06-18T05:25:00Z",
  },
  {
    id: "pro3", name: "Mamadou K.", email: "mamadou.clima@climexpert.ci",
    phoneNumber: "+225 07 89 45 12", role: UserRole.PRO,
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    category: "ac", title: "Expert Climatisation & Froid",
    bio: "Expert certifié et équipé avec plus de 8 ans d'expérience. Spécialiste grandes marques (Samsung, LG, Sharp, Carrier).",
    experienceYears: 8, rating: 49, reviewCount: 112, hourlyRateXOF: 15000,
    locationNeighborhood: "Cocody / Marcory, Abidjan", isVerified: true, completedInterventions: 120,
    availabilityStatus: "available", createdAt: "2026-06-18T05:25:00Z",
  },
  {
    id: "pro4", name: "Fatou Touré", email: "fatou.cleaning@gmail.com",
    phoneNumber: "+225 05 44 11 22", role: UserRole.PRO,
    avatarUrl: proCleaningAvatar, category: "cleaning", title: "Experte Propreté & Nettoyage",
    bio: "Nettoyage résidentiel et de bureaux. Spécialisée en désinfection et remises au propre complètes dans tout Cocody et Angré.",
    experienceYears: 5, rating: 47, reviewCount: 52, hourlyRateXOF: 8000,
    locationNeighborhood: "Cocody, Abidjan", isVerified: true, completedInterventions: 80,
    availabilityStatus: "available", createdAt: "2026-06-18T05:25:00Z",
  },
];

export const MOCK_SERVICES: Service[] = [
  { id: "s1", proId: "pro3", name: "Recharge Fréon", description: "Gaz R410A inclus avec vérification complète", priceEstimateXOF: 25000 },
  { id: "s2", proId: "pro3", name: "Dépannage Fuite", description: "Diagnostic sous pression d'azote et réparation de soudures", priceEstimateXOF: 15000 },
  { id: "s3", proId: "pro3", name: "Entretien Complet", description: "Nettoyage haute pression à l'eau des turbines, filtres et évaporateurs", priceEstimateXOF: 40000 },
  { id: "s4", proId: "pro1", name: "Dépannage Disjoncteur", description: "Remplacement de fusibles et équilibrage", priceEstimateXOF: 12000 },
  { id: "s5", proId: "pro1", name: "Installation Lustre", description: "Fixation au plafond et raccordement électrique propre", priceEstimateXOF: 18000 },
  { id: "s6", proId: "pro2", name: "Débouchage Canalisation", description: "Furet mécanique et traitement chimique d'ouverture", priceEstimateXOF: 15000 },
  { id: "s7", proId: "pro2", name: "Remplacement Robinetterie", description: "Mitigeur de qualité posé avec nouveaux raccordements", priceEstimateXOF: 20000 },
  { id: "s8", proId: "pro4", name: "Nettoyage Standard", description: "Lavage des sols, poussière et rangement classique d'appartement 2 pièces", priceEstimateXOF: 15000 },
  { id: "s9", proId: "pro4", name: "Nettoyage en Profondeur", description: "Désinfection complète, nettoyage des vitres et récurage de la cuisine", priceEstimateXOF: 35000 },
  { id: "s10", proId: "pro4", name: "Nettoyage Fin de Chantier", description: "Enlèvement des résidus de plâtre et de peinture, dépoussiérage industriel", priceEstimateXOF: 60000 },
];

export const MOCK_REQUESTS: ClientRequest[] = [
  { id: "cr1", clientId: "client_marie", title: "Climatisation ne refroidit plus", description: "Le split ne souffle que de l'air chaud, besoin d'un diagnostic et recharge fréon si nécessaire.", photos: [], category: "ac", address: "Cocody Riviera 3, Abidjan", budgetXOF: 35000, urgency: "today", status: "accepted", proId: "pro3", createdAt: "2026-06-17T08:00:00Z", updatedAt: "2026-06-17T09:00:00Z" },
  { id: "cr2", clientId: "client_marie", title: "Prise électrique grillée", description: "Prise dans la chambre principale ne fonctionne plus et fait des étincelles.", photos: [], category: "electricity", address: "Cocody Riviera 3, Abidjan", budgetXOF: 12000, urgency: "immediate", status: "created", createdAt: "2026-06-18T06:00:00Z", updatedAt: "2026-06-18T06:00:00Z" },
  { id: "cr3", clientId: "client_marie", title: "Nettoyage appartement 3 pièces", description: "Ménage complet pour appartement 3 pièces à Cocody. Produits inclus.", photos: [], category: "cleaning", address: "Cocody Angré, Abidjan", budgetXOF: 25000, urgency: "this_week", status: "created", createdAt: "2026-06-18T07:00:00Z", updatedAt: "2026-06-18T07:00:00Z" },
];

export const MOCK_MISSIONS: Mission[] = [
  {
    id: "m1", requestId: "cr1", clientId: "client_marie", proId: "pro3",
    status: "in_progress", title: "Climatisation ne refroidit plus",
    description: "Le split ne souffle que de l'air chaud, besoin d'un diagnostic et recharge fréon si nécessaire.",
    category: "ac", address: "Cocody Riviera 3, Abidjan", budgetXOF: 35000,
    photos: [], proName: "Mamadou K.",
    proAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    proPhone: "+225 07 89 45 12", clientName: "Marie Kouadio", clientPhone: "+225 01 23 45 67",
    createdAt: "2026-06-17T08:00:00Z", acceptedAt: "2026-06-17T08:30:00Z", enRouteAt: "2026-06-17T09:00:00Z", inProgressAt: "2026-06-17T10:00:00Z",
    estimatedArrivalMinutes: 22,
    beforePhotos: [
      "https://images.unsplash.com/photo-1585774923346-0ac6d18c29b0?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400&h=300&fit=crop",
    ],
    afterPhotos: [
      "https://images.unsplash.com/photo-1585774923346-0ac6d18c29b0?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=300&fit=crop",
    ],
  },
];

export const MOCK_CONVERSATIONS: Conversation[] = [
  { id: "conv1", participants: ["client_marie", "pro3"], missionId: "m1", lastMessage: "J'arrive dans 15 minutes", lastMessageAt: "2026-06-17T09:45:00Z", unreadCount: 2, otherUserName: "Mamadou K.", otherUserAvatar: MOCK_PROS[2].avatarUrl },
  { id: "conv2", participants: ["client_marie", "pro1"], lastMessage: "Le disjoncteur est changé", lastMessageAt: "2026-06-16T14:00:00Z", unreadCount: 0, otherUserName: "Koffi Kouamé", otherUserAvatar: MOCK_PROS[0].avatarUrl },
];

export const MOCK_MESSAGES: Record<string, Message[]> = {
  conv1: [
    { id: "msg1", conversationId: "conv1", senderId: "pro3", text: "Bonjour Marie, je suis en route pour votre intervention.", photos: [], createdAt: "2026-06-17T09:30:00Z", status: "read" },
    { id: "msg2", conversationId: "conv1", senderId: "client_marie", text: "Parfait, je vous attends !", photos: [], createdAt: "2026-06-17T09:35:00Z", status: "read" },
    { id: "msg3", conversationId: "conv1", senderId: "pro3", text: "J'arrive dans 15 minutes. Le trafic est un peu dense sur le boulevard.", photos: [], createdAt: "2026-06-17T09:45:00Z", status: "read" },
  ],
  conv2: [
    { id: "msg4", conversationId: "conv2", senderId: "pro1", text: "Bonjour Madame, je viens de finir de vérifier le disjoncteur général.", photos: [], createdAt: "2026-06-16T13:30:00Z", status: "read" },
    { id: "msg5", conversationId: "conv2", senderId: "client_marie", text: "Merci Koffi ! Tout va bien maintenant ?", photos: [], createdAt: "2026-06-16T13:40:00Z", status: "read" },
    { id: "msg6", conversationId: "conv2", senderId: "pro1", text: "Le disjoncteur est changé", photos: [], createdAt: "2026-06-16T14:00:00Z", status: "read" },
  ],
};

export const MOCK_PRO_STATS: ProDashboardStats = {
  todayEarningsXOF: 45000, weekEarningsXOF: 185000, monthEarningsXOF: 620000,
  totalJobsCompleted: 140, todayJobsCount: 3, rating: 49, reviewCount: 88,
};

export const MOCK_PRO_JOBS: ProJob[] = [
  { id: "job1", clientName: "Aminata Diallo", clientPhone: "+225 07 12 34 56", clientLocation: "Cocody Riviera 2, Abidjan", category: "electricity", serviceName: "Dépannage Disjoncteur", description: "Le disjoncteur général saute régulièrement. Vérification et remplacement nécessaire.", status: "pending", travelFeeXOF: 5000, laborFeeXOF: 12000, totalFeeXOF: 17000, createdAt: "2026-06-18T07:00:00Z", scheduledDate: "2026-06-18", scheduledTime: "10:00" },
  { id: "job2", clientName: "Jean-Pascal Bédié", clientPhone: "+225 05 98 76 54", clientLocation: "Plateau, Abidjan", category: "electricity", serviceName: "Installation Lustre", description: "Installation d'un lustre design au plafond du salon avec raccordement.", status: "accepted", travelFeeXOF: 5000, laborFeeXOF: 18000, totalFeeXOF: 23000, createdAt: "2026-06-17T14:00:00Z", scheduledDate: "2026-06-18", scheduledTime: "14:30" },
  { id: "job3", clientName: "Fatoumata Koné", clientPhone: "+225 01 23 45 67", clientLocation: "Angré 8ème Tranche, Abidjan", category: "electricity", serviceName: "Changement Prise", description: "Remplacement de 3 prises électriques murales qui ne fonctionnent plus.", status: "en_route", travelFeeXOF: 5000, laborFeeXOF: 10000, totalFeeXOF: 15000, createdAt: "2026-06-17T09:00:00Z", scheduledDate: "2026-06-18", scheduledTime: "08:00" },
];

export const MOCK_PRO_ALERTS: ProAlert[] = [
  { id: "alert1", clientName: "Kouamé N'Guessan", clientPhone: "+225 07 45 12 33", category: "electricity", description: "Court-circuit dans le tableau électrique. Odeur de brûlé et plusieurs pièces sans courant.", urgency: "high", estimatedPriceMinXOF: 15000, estimatedPriceMaxXOF: 25000, location: "Marcory Zone 4, Abidjan", sentAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 120000).toISOString() },
  { id: "alert2", clientName: "Mariam Ouattara", clientPhone: "+225 05 55 66 77", category: "electricity", description: "Installation d'un chauffe-eau électrique avec mise à la terre.", urgency: "low", estimatedPriceMinXOF: 25000, estimatedPriceMaxXOF: 35000, location: "Cocody Saint-Jean, Abidjan", sentAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 120000).toISOString() },
];

export const MOCK_PRO_EARNINGS: ProEarning[] = [
  { id: "e1", amountXOF: 23000, type: "job_payment", label: "Installation Lustre - Bédié", status: "completed", createdAt: "2026-06-17T16:00:00Z" },
  { id: "e2", amountXOF: 17000, type: "job_payment", label: "Dépannage Disjoncteur - Koné", status: "completed", createdAt: "2026-06-17T12:00:00Z" },
  { id: "e3", amountXOF: 45000, type: "withdrawal", label: "Retrait Wave", status: "completed", createdAt: "2026-06-16T10:00:00Z" },
  { id: "e4", amountXOF: 25000, type: "bonus", label: "Bonus réalisation Juin", status: "pending", createdAt: "2026-06-15T00:00:00Z" },
];

export const MOCK_PORTFOLIO: PortfolioItem[] = [
  { id: "pf1", imageUrl: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=400&fit=crop", caption: "Installation tableau électrique", category: "electricity", createdAt: "2026-06-01T00:00:00Z" },
  { id: "pf2", imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop", caption: "Rénovation complète salle de bain", category: "plumbing", createdAt: "2026-05-15T00:00:00Z" },
  { id: "pf3", imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop", caption: "Nettoyage bureau Plateau", category: "cleaning", createdAt: "2026-05-10T00:00:00Z" },
  { id: "pf4", imageUrl: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400&h=400&fit=crop", caption: "Installation climatisation split", category: "ac", createdAt: "2026-04-20T00:00:00Z" },
  { id: "pf5", imageUrl: "https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?w=400&h=400&fit=crop", caption: "Dépannage urgence Court-circuit", category: "electricity", createdAt: "2026-04-10T00:00:00Z" },
  { id: "pf6", imageUrl: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=400&h=400&fit=crop", caption: "Rénovation cuisine complète", category: "plumbing", createdAt: "2026-03-25T00:00:00Z" },
];

export const MOCK_VERIFICATION: ProVerification = {
  level: "id", cniStatus: "approved", backgroundStatus: "not_submitted", certStatus: "not_submitted",
  submittedAt: "2026-06-10T00:00:00Z", verifiedAt: "2026-06-12T00:00:00Z",
};

export const MOCK_NOTIFICATION_PREFS: NotificationPreference[] = [
  { channel: "push", enabled: true, events: { newLead: true, quoteAccepted: true, paymentReceived: true, reviewReceived: true, payoutProcessed: true, verificationApproved: true, lowBalance: true, weeklySummary: false } },
  { channel: "sms", enabled: true, events: { newLead: true, quoteAccepted: false, paymentReceived: true, reviewReceived: false, payoutProcessed: true, verificationApproved: false, lowBalance: true, weeklySummary: false } },
  { channel: "whatsapp", enabled: false, events: { newLead: false, quoteAccepted: false, paymentReceived: false, reviewReceived: false, payoutProcessed: false, verificationApproved: false, lowBalance: false, weeklySummary: true } },
  { channel: "email", enabled: true, events: { newLead: false, quoteAccepted: false, paymentReceived: true, reviewReceived: false, payoutProcessed: false, verificationApproved: true, lowBalance: false, weeklySummary: true } },
];

export const MOCK_PRICING: ProPricingConfig = {
  pricingType: "per_intervention", perInterventionXOF: 15000, travelFeeXOF: 5000, travelFree: false,
};

export const MOCK_AVAILABILITY: ProAvailability = {
  monday: { start: "08:00", end: "18:00" }, tuesday: { start: "08:00", end: "18:00" },
  wednesday: { start: "08:00", end: "18:00" }, thursday: { start: "08:00", end: "18:00" },
  friday: { start: "08:00", end: "18:00" }, saturday: { start: "09:00", end: "13:00" }, sunday: null,
  holidays: ["2026-06-21", "2026-07-14"],
};

export const MOCK_PORTFOLIO_PRO: { id: string; url: string; title: string }[] = [
  { id: "pp1", url: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&h=600&fit=crop", title: "Tableau électrique neuf - Villa Riviera" },
  { id: "pp2", url: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=600&fit=crop", title: "Rénovation salle de bain complète" },
  { id: "pp3", url: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600&h=600&fit=crop", title: "Installation split 12000 BTU" },
  { id: "pp4", url: "https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?w=600&h=600&fit=crop", title: "Dépannage urgence Court-circuit" },
  { id: "pp5", url: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=600&h=600&fit=crop", title: "Rénovation cuisine moderne" },
  { id: "pp6", url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=600&fit=crop", title: "Nettoyage après chantier" },
];

export const MOCK_DASH_DATA = {
  totalRevenue: 245000, revenueTrend: 12, totalMissions: 140, missionsTrend: 8,
  averageRating: 4.7, ratingTrend: 2, totalClients: 45, clientsTrend: 15,
};

export const MONTH_LABELS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun"];
export const MOCK_REVENUE_HISTORY = [120000, 180000, 150000, 220000, 195000, 245000];
export const MOCK_MISSION_HISTORY = [18, 22, 20, 25, 23, 28];
export const MOCK_RATING_HISTORY = [4.2, 4.4, 4.3, 4.5, 4.6, 4.7];

export const MOCK_FINANCE_SUMMARY: ProFinanceSummary = {
  availableBalanceXOF: 245000, pendingBalanceXOF: 85000,
  todayEarningsXOF: 45000, weekEarningsXOF: 185000, monthEarningsXOF: 620000,
  totalEarningsXOF: 2450000, totalWithdrawnXOF: 1980000, transactions: [],
};

export const MOCK_PAYMENT_TXS: PaymentTransaction[] = [
  { id: "ptx1", missionId: "m1", clientId: "client_marie", proId: "pro3", amountXOF: 35000, method: "orange_money", commissionPercent: 15, commissionXOF: 5250, proAmountXOF: 29750, platformAmountXOF: 5250, status: "completed", createdAt: "2026-06-17T12:00:00Z" },
  { id: "ptx2", missionId: "m2", clientId: "client_marie", proId: "pro1", amountXOF: 23000, method: "mtn_momo", commissionPercent: 15, commissionXOF: 3450, proAmountXOF: 19550, platformAmountXOF: 3450, status: "completed", createdAt: "2026-06-16T16:00:00Z" },
  { id: "ptx3", missionId: "m3", clientId: "client_marie", proId: "pro2", amountXOF: 15000, method: "wave", commissionPercent: 10, commissionXOF: 1500, proAmountXOF: 13500, platformAmountXOF: 1500, status: "pending", createdAt: "2026-06-18T08:00:00Z" },
];
