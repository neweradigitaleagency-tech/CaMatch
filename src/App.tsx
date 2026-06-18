import React, { useState } from "react";
import {
  Compass, ClipboardList, MessageSquare, User as UserIcon,
  Shield, Laptop, Layers, Database, ChevronRight, HelpCircle,
  Sun, Moon, Sparkles, LayoutDashboard, Calendar, DollarSign,
  ArrowLeftRight, Settings, Star,
} from "lucide-react";
import {
  UserRole, ProfessionalDetails, Service, ServiceRequest, RequestStatus,
  ProJob, ProAlert, ProDashboardStats, ProEarning, ProTransaction,
  PortfolioItem, ProVerification, VerificationLevel, NotificationPreference,
  OnboardingData, ClientRequest, Mission, MissionStatus, MISSION_STATUS_ORDER,
  Conversation, Message, Urgency, ProPricingConfig, ProAvailability,
  ProDashboardData, ProFinanceSummary, PaymentTransaction, PaymentMethod,
} from "./types";
import ExplorerScreen from "./components/ExplorerScreen";
import ProfilProScreen from "./components/ProfilProScreen";
import AiMatchAndPricingScreen from "./components/AiMatchAndPricingScreen";
import SuiviDemandeScreen from "./components/SuiviDemandeScreen";
import RequestCreationScreen, { AiRequestDetails } from "./components/RequestCreationScreen";
import ProSelectionScreen from "./components/ProSelectionScreen";
import ProDashboardScreen from "./components/ProDashboardScreen";
import ProJobAlertScreen from "./components/ProJobAlertScreen";
import ProJobExecutionScreen from "./components/ProJobExecutionScreen";
import ProFinanceScreen from "./components/ProFinanceScreen";
import ProScheduleScreen from "./components/ProScheduleScreen";
import ProProfileScreen from "./components/ProProfileScreen";
import ProVerificationScreen from "./components/ProVerificationScreen";
import ProNotificationSettingsScreen from "./components/ProNotificationSettingsScreen";
import ProHelpScreen from "./components/ProHelpScreen";
import ProOnboardingScreen from "./components/ProOnboardingScreen";
import ProEditProfileScreen from "./components/ProEditProfileScreen";
import AppSettingsScreen from "./components/AppSettingsScreen";
import BottomNav from "./components/BottomNav";
import NewRequestScreen from "./components/NewRequestScreen";
import RequestsListScreen from "./components/RequestsListScreen";
import MessagingScreen, { ChatScreen } from "./components/MessagingScreen";
import MissionTrackerScreen from "./components/MissionTrackerScreen";
import ReviewScreen from "./components/ReviewScreen";
import QRPaymentScreen from "./components/QRPaymentScreen";
import ProProfileMiniSiteScreen from "./components/ProProfileMiniSiteScreen";
import ProDashboardRefonteScreen from "./components/ProDashboardRefonteScreen";
import ProFinanceRefonteScreen from "./components/ProFinanceRefonteScreen";
import { GoogleGenAI } from "@google/genai";

const proCleaningAvatar = new URL('../assets/pro_cleaning_avatar.png', import.meta.url).href;

// ─── MOCK pros ───
const MOCK_PROS: ProfessionalDetails[] = [
  {
    id: "pro1", name: "Koffi Kouamé", email: "koffi.electricien@gmail.com",
    phoneNumber: "+225 07 45 88 12", role: UserRole.PRO,
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuC_24FIbZSbZUTv5bl1jnS44Jf4miiT_Zag5CCeZ2rNwwyxRBr_uVqqwPpF4gyn-Pp5iRpkBlCCyHhdO6a6peVgu-0rRopHjBF1gsTcU1a6WxjyKyGZyEFaLZKPd2WZWM0u80j5gM8j7kw0CG0McTApjliPeQvMzysojlrz5-rmNyGAig3k_PwEeqm9xXbG2a5_s4KhNbssCpkJF93XMLnTXCXt10CWwYH1WKiggbCQqpRnUhPUd2sgxI1KJeGwQuskyl4pTv55e0w",
    category: "electricity", title: "Maître Électricien",
    bio: "Installations triphasées, dépannages haute et basse tension dans tout Cocody et Plateau. Diplômé de l'INP-HB.",
    experienceYears: 10, rating: 49, reviewCount: 88, hourlyRateXOF: 12000,
    locationNeighborhood: "Cocody, Abidjan", isVerified: true, completedInterventions: 140,
    availabilityStatus: "available", createdAt: "2026-06-18T05:25:00Z",
  },
  {
    id: "pro2", name: "Ismaël Koné", email: "konis.plomberie@gmail.com",
    phoneNumber: "+225 05 32 99 44", role: UserRole.PRO,
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBaoafybvSI9IB1oq5Q17H1YUY0ZUDG06MnWz9wJuQLaWeBWNh6PL_PNNz7d8byq6UT2d7a-sk7dym9HJ1Gu7Ba1hc7MiW1Bhfa8za77czbu27BoDTmpz3iihXAv9iEw2ICmgnXHf-XWWcV-kkN9IFvbbBu6I0waNhppxHEGNZNOWj-hqXlhW9DI9gPQPH7aNUgBXgYCiliiCJlLFUxYutfuW7MbSYtlURZFhZGFdJWtWNHEPStVGLB5j09kBqYQLVqiBkjeE4ilXc",
    category: "plumbing", title: "Plombier Sanitaire",
    bio: "Spécialisé en réparation de fuites, débouchages urgents, robinetteries suspendues et raccordements sanitaires.",
    experienceYears: 6, rating: 48, reviewCount: 74, hourlyRateXOF: 10000,
    locationNeighborhood: "Marcory, Abidjan", isVerified: true, completedInterventions: 95,
    availabilityStatus: "available", createdAt: "2026-06-18T05:25:00Z",
  },
  {
    id: "pro3", name: "Mamadou K.", email: "mamadou.clima@climexpert.ci",
    phoneNumber: "+225 07 89 45 12", role: UserRole.PRO,
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDgSpuKuUBRwIbwEo5xemj2lHDeOBHOCniiirzckXzevNmw69aZbDBFbZZtKqEDDCMhtU7VrbXu5TSYulIg5w_W1C4bHBSez2EVnQV3HQ09sY8aTtj-Hq49lrJ5ZOxJKNKwO0UVL0Lkeo4lQQqtc_Zx8vjVJr3qfYAh1wZkEdk7ZbsrMAkwAKsPkb-IguTEjlqwoAS3PHrosG99cQbI22-S278wFjbpGXvApqL7aG9xN7zp4PE7e26Bh_5Y-TV15spj-Qsff_pYMiA",
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

// ─── MOCK services ───
const MOCK_SERVICES: Service[] = [
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

// ─── MOCK client requests (multi-demandes) ───
const MOCK_REQUESTS: ClientRequest[] = [
  { id: "cr1", clientId: "client_marie", title: "Climatisation ne refroidit plus", description: "Le split ne souffle que de l'air chaud, besoin d'un diagnostic et recharge fréon si nécessaire.", photos: [], category: "ac", address: "Cocody Riviera 3, Abidjan", budgetXOF: 35000, urgency: "today", status: "accepted", proId: "pro3", createdAt: "2026-06-17T08:00:00Z", updatedAt: "2026-06-17T09:00:00Z" },
  { id: "cr2", clientId: "client_marie", title: "Prise électrique grillée", description: "Prise dans la chambre principale ne fonctionne plus et fait des étincelles.", photos: [], category: "electricity", address: "Cocody Riviera 3, Abidjan", budgetXOF: 12000, urgency: "immediate", status: "created", createdAt: "2026-06-18T06:00:00Z", updatedAt: "2026-06-18T06:00:00Z" },
  { id: "cr3", clientId: "client_marie", title: "Nettoyage appartement 3 pièces", description: "Ménage complet pour appartement 3 pièces à Cocody. Produits inclus.", photos: [], category: "cleaning", address: "Cocody Angré, Abidjan", budgetXOF: 25000, urgency: "this_week", status: "created", createdAt: "2026-06-18T07:00:00Z", updatedAt: "2026-06-18T07:00:00Z" },
];

// ─── MOCK missions ───
const MOCK_MISSIONS: Mission[] = [
  {
    id: "m1", requestId: "cr1", clientId: "client_marie", proId: "pro3",
    status: "in_progress", title: "Climatisation ne refroidit plus",
    description: "Le split ne souffle que de l'air chaud, besoin d'un diagnostic et recharge fréon si nécessaire.",
    category: "ac", address: "Cocody Riviera 3, Abidjan", budgetXOF: 35000,
    photos: [], proName: "Mamadou K.",
    proAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDgSpuKuUBRwIbwEo5xemj2lHDeOBHOCniiirzckXzevNmw69aZbDBFbZZtKqEDDCMhtU7VrbXu5TSYulIg5w_W1C4bHBSez2EVnQV3HQ09sY8aTtj-Hq49lrJ5ZOxJKNKwO0UVL0Lkeo4lQQqtc_Zx8vjVJr3qfYAh1wZkEdk7ZbsrMAkwAKsPkb-IguTEjlqwoAS3PHrosG99cQbI22-S278wFjbpGXvApqL7aG9xN7zp4PE7e26Bh_5Y-TV15spj-Qsff_pYMiA",
    proPhone: "+225 07 89 45 12", clientName: "Marie Kouadio", clientPhone: "+225 01 23 45 67",
    createdAt: "2026-06-17T08:00:00Z", acceptedAt: "2026-06-17T08:30:00Z", enRouteAt: "2026-06-17T09:00:00Z", inProgressAt: "2026-06-17T10:00:00Z",
    estimatedArrivalMinutes: 22,
  },
];

// ─── MOCK conversations ───
const MOCK_CONVERSATIONS: Conversation[] = [
  { id: "conv1", participants: ["client_marie", "pro3"], missionId: "m1", lastMessage: "J'arrive dans 15 minutes", lastMessageAt: "2026-06-17T09:45:00Z", unreadCount: 2, otherUserName: "Mamadou K.", otherUserAvatar: MOCK_PROS[2].avatarUrl },
  { id: "conv2", participants: ["client_marie", "pro1"], lastMessage: "Le disjoncteur est changé", lastMessageAt: "2026-06-16T14:00:00Z", unreadCount: 0, otherUserName: "Koffi Kouamé", otherUserAvatar: MOCK_PROS[0].avatarUrl },
];

const MOCK_MESSAGES: Record<string, Message[]> = {
  conv1: [
    { id: "msg1", conversationId: "conv1", senderId: "pro3", text: "Bonjour Marie, je suis en route pour votre intervention.", photos: [], createdAt: "2026-06-17T09:30:00Z" },
    { id: "msg2", conversationId: "conv1", senderId: "client_marie", text: "Parfait, je vous attends !", photos: [], createdAt: "2026-06-17T09:35:00Z" },
    { id: "msg3", conversationId: "conv1", senderId: "pro3", text: "J'arrive dans 15 minutes. Le trafic est un peu dense sur le boulevard.", photos: [], createdAt: "2026-06-17T09:45:00Z" },
  ],
  conv2: [
    { id: "msg4", conversationId: "conv2", senderId: "pro1", text: "Bonjour Madame, je viens de finir de vérifier le disjoncteur général.", photos: [], createdAt: "2026-06-16T13:30:00Z" },
    { id: "msg5", conversationId: "conv2", senderId: "client_marie", text: "Merci Koffi ! Tout va bien maintenant ?", photos: [], createdAt: "2026-06-16T13:40:00Z" },
    { id: "msg6", conversationId: "conv2", senderId: "pro1", text: "Le disjoncteur est changé", photos: [], createdAt: "2026-06-16T14:00:00Z" },
  ],
};

// ─── Legacy mocks ───
const MOCK_PRO_STATS: ProDashboardStats = {
  todayEarningsXOF: 45000, weekEarningsXOF: 185000, monthEarningsXOF: 620000,
  totalJobsCompleted: 140, todayJobsCount: 3, rating: 49, reviewCount: 88,
};

const MOCK_PRO_JOBS: ProJob[] = [
  { id: "job1", clientName: "Aminata Diallo", clientPhone: "+225 07 12 34 56", clientLocation: "Cocody Riviera 2, Abidjan", category: "electricity", serviceName: "Dépannage Disjoncteur", description: "Le disjoncteur général saute régulièrement. Vérification et remplacement nécessaire.", status: "pending", travelFeeXOF: 5000, laborFeeXOF: 12000, totalFeeXOF: 17000, createdAt: "2026-06-18T07:00:00Z", scheduledDate: "2026-06-18", scheduledTime: "10:00" },
  { id: "job2", clientName: "Jean-Pascal Bédié", clientPhone: "+225 05 98 76 54", clientLocation: "Plateau, Abidjan", category: "electricity", serviceName: "Installation Lustre", description: "Installation d'un lustre design au plafond du salon avec raccordement.", status: "accepted", travelFeeXOF: 5000, laborFeeXOF: 18000, totalFeeXOF: 23000, createdAt: "2026-06-17T14:00:00Z", scheduledDate: "2026-06-18", scheduledTime: "14:30" },
  { id: "job3", clientName: "Fatoumata Koné", clientPhone: "+225 01 23 45 67", clientLocation: "Angré 8ème Tranche, Abidjan", category: "electricity", serviceName: "Changement Prise", description: "Remplacement de 3 prises électriques murales qui ne fonctionnent plus.", status: "en_route", travelFeeXOF: 5000, laborFeeXOF: 10000, totalFeeXOF: 15000, createdAt: "2026-06-17T09:00:00Z", scheduledDate: "2026-06-18", scheduledTime: "08:00" },
];

const MOCK_PRO_ALERTS: ProAlert[] = [
  { id: "alert1", clientName: "Kouamé N'Guessan", clientPhone: "+225 07 45 12 33", category: "electricity", description: "Court-circuit dans le tableau électrique. Odeur de brûlé et plusieurs pièces sans courant.", urgency: "high", estimatedPriceMinXOF: 15000, estimatedPriceMaxXOF: 25000, location: "Marcory Zone 4, Abidjan", sentAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 120000).toISOString() },
  { id: "alert2", clientName: "Mariam Ouattara", clientPhone: "+225 05 55 66 77", category: "electricity", description: "Installation d'un chauffe-eau électrique avec mise à la terre.", urgency: "low", estimatedPriceMinXOF: 25000, estimatedPriceMaxXOF: 35000, location: "Cocody Saint-Jean, Abidjan", sentAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 120000).toISOString() },
];

const MOCK_PRO_EARNINGS: ProEarning[] = [
  { id: "e1", amountXOF: 23000, type: "job_payment", label: "Installation Lustre - Bédié", status: "completed", createdAt: "2026-06-17T16:00:00Z" },
  { id: "e2", amountXOF: 17000, type: "job_payment", label: "Dépannage Disjoncteur - Koné", status: "completed", createdAt: "2026-06-17T12:00:00Z" },
  { id: "e3", amountXOF: 45000, type: "withdrawal", label: "Retrait Wave", status: "completed", createdAt: "2026-06-16T10:00:00Z" },
  { id: "e4", amountXOF: 25000, type: "bonus", label: "Bonus réalisation Juin", status: "pending", createdAt: "2026-06-15T00:00:00Z" },
];

const MOCK_PORTFOLIO: PortfolioItem[] = [
  { id: "pf1", imageUrl: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=400&fit=crop", caption: "Installation tableau électrique", category: "electricity", createdAt: "2026-06-01T00:00:00Z" },
  { id: "pf2", imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop", caption: "Rénovation complète salle de bain", category: "plumbing", createdAt: "2026-05-15T00:00:00Z" },
  { id: "pf3", imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop", caption: "Nettoyage bureau Plateau", category: "cleaning", createdAt: "2026-05-10T00:00:00Z" },
  { id: "pf4", imageUrl: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400&h=400&fit=crop", caption: "Installation climatisation split", category: "ac", createdAt: "2026-04-20T00:00:00Z" },
  { id: "pf5", imageUrl: "https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?w=400&h=400&fit=crop", caption: "Dépannage urgence Court-circuit", category: "electricity", createdAt: "2026-04-10T00:00:00Z" },
  { id: "pf6", imageUrl: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=400&h=400&fit=crop", caption: "Rénovation cuisine complète", category: "plumbing", createdAt: "2026-03-25T00:00:00Z" },
];

const MOCK_VERIFICATION: ProVerification = {
  level: "id", cniStatus: "approved", backgroundStatus: "not_submitted", certStatus: "not_submitted",
  submittedAt: "2026-06-10T00:00:00Z", verifiedAt: "2026-06-12T00:00:00Z",
};

const MOCK_NOTIFICATION_PREFS: NotificationPreference[] = [
  { channel: "push", enabled: true, events: { newLead: true, quoteAccepted: true, paymentReceived: true, reviewReceived: true, payoutProcessed: true, verificationApproved: true, lowBalance: true, weeklySummary: false } },
  { channel: "sms", enabled: true, events: { newLead: true, quoteAccepted: false, paymentReceived: true, reviewReceived: false, payoutProcessed: true, verificationApproved: false, lowBalance: true, weeklySummary: false } },
  { channel: "whatsapp", enabled: false, events: { newLead: false, quoteAccepted: false, paymentReceived: false, reviewReceived: false, payoutProcessed: false, verificationApproved: false, lowBalance: false, weeklySummary: true } },
  { channel: "email", enabled: true, events: { newLead: false, quoteAccepted: false, paymentReceived: true, reviewReceived: false, payoutProcessed: false, verificationApproved: true, lowBalance: false, weeklySummary: true } },
];

// ─── New mocks for refonte screens ───
const MOCK_PRICING: ProPricingConfig = {
  pricingType: "per_intervention", perInterventionXOF: 15000, travelFeeXOF: 5000, travelFree: false,
};
const MOCK_AVAILABILITY: ProAvailability = {
  monday: { start: "08:00", end: "18:00" }, tuesday: { start: "08:00", end: "18:00" },
  wednesday: { start: "08:00", end: "18:00" }, thursday: { start: "08:00", end: "18:00" },
  friday: { start: "08:00", end: "18:00" }, saturday: { start: "09:00", end: "13:00" }, sunday: null,
  holidays: ["2026-06-21", "2026-07-14"],
};
const MOCK_PORTFOLIO_PRO: { id: string; url: string; title: string }[] = [
  { id: "pp1", url: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&h=600&fit=crop", title: "Tableau électrique neuf - Villa Riviera" },
  { id: "pp2", url: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=600&fit=crop", title: "Rénovation salle de bain complète" },
  { id: "pp3", url: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600&h=600&fit=crop", title: "Installation split 12000 BTU" },
  { id: "pp4", url: "https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?w=600&h=600&fit=crop", title: "Dépannage urgence Court-circuit" },
  { id: "pp5", url: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=600&h=600&fit=crop", title: "Rénovation cuisine moderne" },
  { id: "pp6", url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=600&fit=crop", title: "Nettoyage après chantier" },
];

const MOCK_DASH_DATA = {
  totalRevenue: 245000, revenueTrend: 12, totalMissions: 140, missionsTrend: 8,
  averageRating: 4.7, ratingTrend: 2, totalClients: 45, clientsTrend: 15,
};
const MONTH_LABELS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun"];
const MOCK_REVENUE_HISTORY = [120000, 180000, 150000, 220000, 195000, 245000];
const MOCK_MISSION_HISTORY = [18, 22, 20, 25, 23, 28];
const MOCK_RATING_HISTORY = [4.2, 4.4, 4.3, 4.5, 4.6, 4.7];

const MOCK_FINANCE_SUMMARY: ProFinanceSummary = {
  availableBalanceXOF: 245000, pendingBalanceXOF: 85000,
  todayEarningsXOF: 45000, weekEarningsXOF: 185000, monthEarningsXOF: 620000,
  totalEarningsXOF: 2450000, totalWithdrawnXOF: 1980000, transactions: [],
};

const MOCK_PAYMENT_TXS: PaymentTransaction[] = [
  { id: "ptx1", missionId: "m1", clientId: "client_marie", proId: "pro3", amountXOF: 35000, method: "orange_money", commissionPercent: 15, commissionXOF: 5250, proAmountXOF: 29750, platformAmountXOF: 5250, status: "completed", createdAt: "2026-06-17T12:00:00Z" },
  { id: "ptx2", missionId: "m2", clientId: "client_marie", proId: "pro1", amountXOF: 23000, method: "mtn_momo", commissionPercent: 15, commissionXOF: 3450, proAmountXOF: 19550, platformAmountXOF: 3450, status: "completed", createdAt: "2026-06-16T16:00:00Z" },
  { id: "ptx3", missionId: "m3", clientId: "client_marie", proId: "pro2", amountXOF: 15000, method: "wave", commissionPercent: 10, commissionXOF: 1500, proAmountXOF: 13500, platformAmountXOF: 1500, status: "pending", createdAt: "2026-06-18T08:00:00Z" },
];

// ─── System prompt for AI ───
const SYSTEM_PROMPT = `
You are the AI Dispatcher for 'Ça Match', a mobile-first service marketplace in Abidjan, Côte d'Ivoire.
Analyze the user's description of their service request and categorize it, calculate an estimated price range (main d'œuvre only, in XOF/CFA Francs, strictly integer, typically starting from 5,000 XOF), determine the urgency level, and extract a clean summary.

Primary categories are strictly one of:
- 'electricity' (electrician, short circuit, breaker, wiring, sockets, etc.)
- 'plumbing' (plumber, water leaks, piping, toilet, faucet, etc.)
- 'ac' (climatisation, cooling, air conditioning, gas recharge, split units, etc.)
- 'cleaning' (household cleaning, office cleaning, post-construction cleanup, etc.)

Urgency levels are strictly one of:
- 'low'
- 'medium'
- 'high'
- 'emergency'

Respond ONLY with a valid raw JSON object. Do not include any markdown syntax or explanation. The format must match:
{
  "category": "electricity" | "plumbing" | "ac" | "cleaning",
  "subCategory": "specific service type name, e.g. Recharge de Gaz split",
  "urgency": "low" | "medium" | "high" | "emergency",
  "estimatedPriceMinXOF": number,
  "estimatedPriceMaxXOF": number,
  "summary": "Short 1-sentence description of the problem in French"
}
`;

export default function App() {
  // ─── Tab & screen navigation ───
  const [activeTab, setActiveTab] = useState<"explorer" | "requests" | "messages" | "profile">("explorer");
  const [currentScreen, setCurrentScreen] = useState<"explore" | "pro-profile" | "matching" | "tracker" | "request-creation" | "pro-selection">("explore");
  const [requestSubScreen, setRequestSubScreen] = useState<"list" | "tracker" | "review" | "qr-payment" | "new-request">("list");
  const [messageSubScreen, setMessageSubScreen] = useState<"list" | "chat">("list");
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // ─── Explorer flow state ───
  const [selectedPro, setSelectedPro] = useState<ProfessionalDetails>(MOCK_PROS[2]);
  const [selectedServices, setSelectedServices] = useState<Service[]>([MOCK_SERVICES[0]]);
  const [activeRequest, setActiveRequest] = useState<ServiceRequest | null>(null);
  const [aiRequestDetails, setAiRequestDetails] = useState<AiRequestDetails | null>(null);
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => localStorage.getItem("gemini_api_key") || "");

  // ─── Multi-request state ───
  const [requests, setRequests] = useState<ClientRequest[]>(MOCK_REQUESTS);
  const [missions, setMissions] = useState<Mission[]>(MOCK_MISSIONS);
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [messages, setMessages] = useState<Record<string, Message[]>>(MOCK_MESSAGES);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(MOCK_MISSIONS[0]);
  const [selectedRequestForTrack, setSelectedRequestForTrack] = useState<ClientRequest | null>(null);

  // ─── Pro mode state ───
  const [userRole, setUserRole] = useState<UserRole>(UserRole.CLIENT);
  const [proTab, setProTab] = useState<"dashboard" | "planning" | "finance" | "profile">("dashboard");
  const [isAvailable, setIsAvailable] = useState(true);
  const [activeAlert, setActiveAlert] = useState<ProAlert | null>(null);
  const [proJobs, setProJobs] = useState<ProJob[]>(MOCK_PRO_JOBS);
  const [proEarnings] = useState<ProEarning[]>(MOCK_PRO_EARNINGS);
  const [proAlerts, setProAlerts] = useState<ProAlert[]>(MOCK_PRO_ALERTS);
  const [proCurrentScreen, setProCurrentScreen] = useState<"dashboard" | "job-execution">("dashboard");
  const [selectedProJob, setSelectedProJob] = useState<ProJob | null>(null);
  const [proSubScreen, setProSubScreen] = useState<"none" | "verification" | "notifications" | "help">("none");
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(MOCK_PORTFOLIO);
  const [proNotifPrefs, setProNotifPrefs] = useState<NotificationPreference[]>(MOCK_NOTIFICATION_PREFS);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAppSettings, setShowAppSettings] = useState(false);
  const [showProEditProfile, setShowProEditProfile] = useState(false);
  const [showProRefonteDashboard, setShowProRefonteDashboard] = useState(false);
  const [showProRefonteFinance, setShowProRefonteFinance] = useState(false);
  const [showProMiniSite, setShowProMiniSite] = useState(false);

  // ─── Theme ───
  const [isDark, setIsDark] = useState<boolean>(() => localStorage.getItem("theme") === "dark");
  const toggleDarkMode = () => {
    setIsDark((prev) => { const n = !prev; localStorage.setItem("theme", n ? "dark" : "light"); return n; });
  };

  // ─── Derive active pro services ───
  const activeProServices = MOCK_SERVICES.filter((s) => s.proId === selectedPro.id);

  // ─── Handlers: Explorer ───
  const handleSelectPro = (pro: ProfessionalDetails) => {
    setSelectedPro(pro);
    setCurrentScreen("pro-profile");
  };

  const handleInitiateMatch = (servicesSelected: Service[]) => {
    setSelectedServices(servicesSelected);
    setCurrentScreen("matching");
  };

  const handleConfirmMatch = (travel: number, labor: number, total: number) => {
    const newRequest: ServiceRequest = {
      id: "req_" + Date.now(), clientId: "client_marie", proId: selectedPro.id,
      serviceId: selectedServices[0]?.id || "s1", serviceName: selectedServices[0]?.name || "Service",
      status: RequestStatus.ACCEPTED, travelFeeXOF: travel, laborFeeXOF: labor, totalFeeXOF: total,
      locationDetails: "Cocody Riviera 3, Abidjan", createdAt: new Date().toISOString(), estimatedArrivalMinutes: 22,
    };
    setActiveRequest(newRequest);
    setCurrentScreen("tracker");
    setActiveTab("requests");
    setRequestSubScreen("tracker");
  };

  const handleUpdateStatus = (newStatus: RequestStatus) => {
    if (activeRequest) setActiveRequest({ ...activeRequest, status: newStatus });
  };

  const resetRequestFlow = () => {
    setActiveRequest(null);
    setCurrentScreen("explore");
    setActiveTab("explorer");
  };

  // ─── AI analysis ───
  const handleAnalyzeRequest = async (desc: string): Promise<AiRequestDetails> => {
    const key = geminiApiKey || ((import.meta as any).env?.VITE_GEMINI_API_KEY as string);
    if (!key) {
      await new Promise((r) => setTimeout(r, 2000));
      const d = desc.toLowerCase();
      let category: "electricity" | "plumbing" | "ac" | "cleaning" = "ac";
      let subCategory = "Diagnostic Climatisation";
      let priceMin = 15000, priceMax = 25000;
      let summary = "Recharge de fréon split ou réparation de fuite d'air conditionné";
      if (d.includes("clim") || d.includes("climatiseur") || d.includes("froid") || d.includes("recharge")) {
        category = "ac"; subCategory = "Recharge Gaz Split"; priceMin = 20000; priceMax = 40000; summary = "Entretien ou recharge de gaz pour climatisation split.";
      } else if (d.includes("fuite") || d.includes("eau") || d.includes("plomb") || d.includes("tuyau") || d.includes("évier") || d.includes("robinet")) {
        category = "plumbing"; subCategory = "Dépannage Plomberie"; priceMin = 10000; priceMax = 20000; summary = "Réparation de fuite d'eau sous évier ou canalisation bouchée.";
      } else if (d.includes("prise") || d.includes("courant") || d.includes("grill") || d.includes("flash") || d.includes("élec") || d.includes("disjoncteur")) {
        category = "electricity"; subCategory = "Dépannage Électrique"; priceMin = 12000; priceMax = 18000; summary = "Remplacement de prise grillée ou diagnostic de panne électrique.";
      } else if (d.includes("ménage") || d.includes("nettoy") || d.includes("propreté") || d.includes("appartement")) {
        category = "cleaning"; subCategory = "Nettoyage Résidentiel"; priceMin = 15000; priceMax = 30000; summary = "Nettoyage standard et dépoussiérage d'un appartement.";
      }
      let urgency: "low" | "medium" | "high" | "emergency" = "medium";
      if (d.includes("urgent") || d.includes("inondation") || d.includes("critique") || d.includes("sauté") || d.includes("immédiat")) urgency = "high";
      if (d.includes("sos") || d.includes("danger") || d.includes("incendie")) urgency = "emergency";
      return { category, subCategory, urgency, estimatedPriceMinXOF: priceMin, estimatedPriceMaxXOF: priceMax, summary };
    }
    try {
      const ai = new GoogleGenAI({ apiKey: key });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: SYSTEM_PROMPT + `\nAnalyze request: "${desc}"` }] }],
      });
      let text = (response.text || "").replace(/```json/gi, "").replace(/```/gi, "").trim();
      const p = JSON.parse(text);
      return {
        category: ["electricity", "plumbing", "ac", "cleaning"].includes(p.category) ? p.category : "ac",
        subCategory: p.subCategory || "Diagnostic Technique",
        urgency: ["low", "medium", "high", "emergency"].includes(p.urgency) ? p.urgency : "medium",
        estimatedPriceMinXOF: Number(p.estimatedPriceMinXOF) || 10000,
        estimatedPriceMaxXOF: Number(p.estimatedPriceMaxXOF) || 25000,
        summary: p.summary || desc.slice(0, 100),
      };
    } catch {
      throw new Error("Erreur avec l'API Gemini. Veuillez vérifier votre clé API ou réessayer.");
    }
  };

  // ─── Pro mode handlers ───
  const toggleRole = () => setUserRole((p) => (p === UserRole.CLIENT ? UserRole.PRO : UserRole.CLIENT));

  const handleAcceptAlert = (alert: ProAlert) => {
    const job: ProJob = {
      id: "job_" + Date.now(), clientName: alert.clientName, clientPhone: alert.clientPhone,
      clientLocation: alert.location, category: alert.category, serviceName: "Intervention urgente",
      description: alert.description, status: "accepted", travelFeeXOF: 0,
      laborFeeXOF: alert.estimatedPriceMinXOF, totalFeeXOF: alert.estimatedPriceMinXOF,
      createdAt: new Date().toISOString(),
    };
    setProJobs((prev) => [job, ...prev]);
    setActiveAlert(null);
    setProAlerts((prev) => prev.filter((a) => a.id !== alert.id));
  };

  const handleDeclineAlert = (alert: ProAlert) => {
    setActiveAlert(null);
    setProAlerts((prev) => prev.filter((a) => a.id !== alert.id));
  };

  const handleViewJob = (job: ProJob) => {
    setSelectedProJob(job);
    setProCurrentScreen("job-execution");
  };

  const handleProUpdateStatus = (jobId: string, status: string) => {
    setProJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: status as any } : j)));
  };

  const handleProCompleteJob = (jobId: string) => {
    setProJobs((prev) => prev.map((j) => j.id === jobId ? { ...j, status: "completed", completedAt: new Date().toISOString() } : j));
    setProCurrentScreen("dashboard");
    setSelectedProJob(null);
  };

  // ─── Handlers: New screens ───
  const handleNewRequest = () => setRequestSubScreen("new-request");

  const handleSubmitRequest = (req: { title: string; description: string; category: string; address: string; budgetXOF: number; urgency: Urgency }) => {
    const cr: ClientRequest = {
      id: "cr_" + Date.now(), clientId: "client_marie", title: req.title, description: req.description,
      photos: [], category: req.category, address: req.address, budgetXOF: req.budgetXOF,
      urgency: req.urgency, status: "created", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    setRequests((prev) => [cr, ...prev]);
    setRequestSubScreen("list");
  };

  const handleSelectRequest = (req: ClientRequest) => {
    if (req.proId) {
      const relatedMission = missions.find(m => m.requestId === req.id);
      if (relatedMission) {
        setSelectedMission(relatedMission);
        setRequestSubScreen("tracker");
        return;
      }
    }
    setSelectedRequestForTrack(req);
  };

  const handleSelectMission = (m: Mission) => {
    setSelectedMission(m);
    setRequestSubScreen("tracker");
  };

  const handleUpdateMissionStatus = (status: MissionStatus) => {
    if (!selectedMission) return;
    const updated = { ...selectedMission, status };
    setSelectedMission(updated);
    setMissions((prev) => prev.map(m => m.id === updated.id ? updated : m));
  };

  const handleReviewMission = (mission: Mission) => {
    setSelectedMission(mission);
    setRequestSubScreen("review");
  };

  const handleSubmitReview = (missionId: string, rating: number, comment: string) => {
    setMissions((prev) => prev.map(m => m.id === missionId ? { ...m, status: "reviewed" as MissionStatus } : m));
    setRequestSubScreen("list");
  };

  const handlePayMission = (mission: Mission) => {
    setSelectedMission(mission);
    setRequestSubScreen("qr-payment");
  };

  const handleConfirmPayment = (missionId: string, method: PaymentMethod) => {
    setMissions((prev) => prev.map(m => m.id === missionId ? { ...m, status: "paid" as MissionStatus, paidAt: new Date().toISOString() } : m));
    setRequestSubScreen("list");
  };

  const handleSelectConversation = (convId: string) => {
    setActiveConversationId(convId);
    setConversations((prev) => prev.map(c => c.id === convId ? { ...c, unreadCount: 0 } : c));
    setMessageSubScreen("chat");
  };

  const handleSendMessage = (convId: string, text: string, photos?: string[], location?: { lat: number; lng: number; label: string }) => {
    const msg: Message = {
      id: "msg_" + Date.now(), conversationId: convId, senderId: "client_marie",
      text, photos: photos || [], location, createdAt: new Date().toISOString(),
    };
    setMessages((prev) => ({ ...prev, [convId]: [...(prev[convId] || []), msg] }));
    setConversations((prev) => prev.map(c => c.id === convId ? { ...c, lastMessage: text, lastMessageAt: msg.createdAt } : c));
  };

  // ─── Tab switch handler for BottomNav ───
  const handleTabChange = (tab: string) => {
    if (userRole === UserRole.CLIENT) {
      if (tab === "explorer" || tab === "requests" || tab === "messages" || tab === "profile") {
        setActiveTab(tab);
      }
    } else {
      if (tab === "dashboard" || tab === "planning" || tab === "finance" || tab === "profile") {
        setProTab(tab as typeof proTab);
      }
    }
  };

  // ─── Render helper for request tab content ───
  const renderRequestsContent = () => {
    if (requestSubScreen === "new-request") {
      return (
        <NewRequestScreen
          onBack={() => setRequestSubScreen("list")}
          onSubmit={handleSubmitRequest}
        />
      );
    }
    if (requestSubScreen === "tracker" && selectedMission) {
      return (
        <MissionTrackerScreen
          mission={selectedMission}
          onBack={() => setRequestSubScreen("list")}
          onOpenChat={() => {
            const conv = conversations.find(c => c.missionId === selectedMission.id);
            if (conv) {
              setActiveConversationId(conv.id);
              setActiveTab("messages");
              setMessageSubScreen("chat");
            }
          }}
          onUpdateStatus={handleUpdateMissionStatus}
          onReview={handleReviewMission}
        />
      );
    }
    if (requestSubScreen === "review" && selectedMission) {
      return (
        <ReviewScreen
          mission={selectedMission}
          onBack={() => setRequestSubScreen("tracker")}
          onSubmit={handleSubmitReview}
        />
      );
    }
    if (requestSubScreen === "qr-payment" && selectedMission) {
      return (
        <QRPaymentScreen
          mission={selectedMission}
          onBack={() => setRequestSubScreen("tracker")}
          onPay={handleConfirmPayment}
        />
      );
    }
    return (
      <RequestsListScreen
        requests={requests}
        missions={missions}
        onOpenRequest={handleSelectRequest}
        onOpenMission={handleSelectMission}
        onNewRequest={handleNewRequest}
      />
    );
  };

  // ─── Render helper for messages tab ───
  const renderMessagesContent = () => {
    if (messageSubScreen === "chat" && activeConversationId) {
      const conv = conversations.find(c => c.id === activeConversationId);
      const convMessages = messages[activeConversationId] || [];
      if (!conv) return <MessagingScreen conversations={conversations} onOpenConversation={handleSelectConversation} onBack={() => setActiveTab("explorer")} />;
      return (
        <ChatScreen
          conversation={conv}
          messages={convMessages}
          onBack={() => setMessageSubScreen("list")}
          onSendMessage={(text) => handleSendMessage(activeConversationId, text)}
          onSendPhoto={(photo) => handleSendMessage(activeConversationId, "", [photo])}
          onSendLocation={() => handleSendMessage(activeConversationId, "", [], { lat: 5.36, lng: -4.02, label: "Cocody Riviera 3, Abidjan" })}
        />
      );
    }
    return (
      <MessagingScreen
        conversations={conversations}
        onOpenConversation={handleSelectConversation}
        onBack={() => setActiveTab("explorer")}
      />
    );
  };

  // ─── Render helper for profile tab ───
  const renderProfileContent = () => {
    if (showAppSettings) {
      return (
        <AppSettingsScreen
          isDark={isDark}
          geminiApiKey={geminiApiKey}
          onToggleDarkMode={toggleDarkMode}
          onUpdateApiKey={(key) => { setGeminiApiKey(key); localStorage.setItem("gemini_api_key", key); }}
          onBack={() => setShowAppSettings(false)}
        />
      );
    }
    return (
      <div className="px-4 py-5 h-full space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-premium">
            <img alt="Client Marie" className="w-full h-full object-cover" referrerPolicy="no-referrer"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDzfxjUIiCdA0lcXKapXPppnmXf26-sNqs7UOaboQR3fIg5dQsgShz3bPFOUfsnM6NJrbqB0u33Rj_1YqI7kcTBLCI5Wf9kSEjQ_nxp0p-zr3jBvG62ghRVX1un7cKyO-7l8KcG5UraKGELB41O8JjY5fuYI0se8efn6728qA_j-B8nC7nne4qGsgeyAQ7C05lV5zqpN8rR6UCBVU_NVj9Q7_ERP2ACpZMu2C-5JC5-s_91RMEGMjvh-FSH74xZ7YVbqqXMuLs6emQ" />
          </div>
          <div>
            <h3 className="font-sans text-lg font-bold text-brand-forest">Marie Kouadio</h3>
            <p className="text-[11px] text-on-surface-variant font-medium">Membre Premium • Cocody, Abidjan</p>
          </div>
        </div>

        <div onClick={() => setShowAppSettings(true)}
          className="bg-white p-4 rounded-2xl shadow-sm border border-pale-mint/15 flex items-center justify-between cursor-pointer hover:bg-pale-mint/20 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-pale-mint flex items-center justify-center"><Settings className="w-4 h-4 text-brand-forest" /></div>
            <div><h4 className="text-xs font-extrabold text-brand-forest">Paramètres</h4><p className="text-[10px] text-on-surface-variant">Apparence, IA, notifications</p></div>
          </div>
          <ChevronRight className="w-4 h-4 text-secondary" />
        </div>

        <div onClick={toggleRole}
          className="bg-white p-4 rounded-2xl shadow-sm border border-pale-mint/15 flex items-center justify-between cursor-pointer hover:bg-pale-mint/20 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-forest flex items-center justify-center text-white"><ArrowLeftRight className="w-4 h-4" /></div>
            <div><h4 className="text-xs font-extrabold uppercase tracking-wider">Mode Prestataire</h4><p className="text-[9px] text-on-surface-variant mt-0.5">Basculer vers l'espace professionnel</p></div>
          </div>
          <ChevronRight className="w-4 h-4 text-secondary" />
        </div>

        <div className="space-y-2">
          <div className="bg-white p-3.5 rounded-2xl flex items-center justify-between shadow-sm border border-pale-mint/15 cursor-pointer hover:bg-pale-mint/20 transition-all">
            <span className="text-xs font-bold text-brand-forest">Moyens de paiement</span><ChevronRight className="w-3.5 h-3.5 text-secondary" />
          </div>
          <div className="bg-white p-3.5 rounded-2xl flex items-center justify-between shadow-sm border border-pale-mint/15 cursor-pointer hover:bg-pale-mint/20 transition-all">
            <span className="text-xs font-bold text-brand-forest">Adresses enregistrées</span><ChevronRight className="w-3.5 h-3.5 text-secondary" />
          </div>
          <div className="bg-white p-3.5 rounded-2xl flex items-center justify-between shadow-sm border border-pale-mint/15 cursor-pointer hover:bg-pale-mint/20 transition-all">
            <span className="text-xs font-bold text-brand-forest">Aide &amp; support</span><ChevronRight className="w-3.5 h-3.5 text-secondary" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${isDark ? "dark" : ""} bg-brand-cream text-brand-forest flex flex-col font-sans max-w-md mx-auto relative shadow-2xl border-x border-pale-mint/10 overflow-x-hidden`}>
      <div className="flex-grow overflow-y-auto pb-28">
        {userRole === UserRole.PRO ? (
          <>
            {showProEditProfile ? (
              <ProEditProfileScreen pro={MOCK_PROS[0]} onSave={(u) => console.log("Save pro profile:", u)} onBack={() => setShowProEditProfile(false)} />
            ) : showOnboarding ? (
              <ProOnboardingScreen onComplete={(d) => { console.log("Onboarding:", d); setShowOnboarding(false); }} onSkip={() => setShowOnboarding(false)} />
            ) : proSubScreen !== "none" ? (
              <>
                {proSubScreen === "verification" && (
                  <ProVerificationScreen verification={MOCK_VERIFICATION} onUploadCni={(s, f) => console.log("CNI", s, f)} onUploadSelfie={(f) => console.log("Selfie", f)} onRequestBackgroundCheck={() => console.log("BG check")} onUploadCert={(f) => console.log("Cert", f)} onBack={() => setProSubScreen("none")} />
                )}
                {proSubScreen === "notifications" && (
                  <ProNotificationSettingsScreen preferences={proNotifPrefs} onUpdate={(p) => setProNotifPrefs(p)} onBack={() => setProSubScreen("none")} />
                )}
                {proSubScreen === "help" && (
                  <ProHelpScreen onBack={() => setProSubScreen("none")} />
                )}
              </>
            ) : showProMiniSite ? (
              <ProProfileMiniSiteScreen
                proId={MOCK_PROS[0].id} proName={MOCK_PROS[0].name} proAvatar={MOCK_PROS[0].avatarUrl}
                proTitle={MOCK_PROS[0].title} proCategory={MOCK_PROS[0].category} proBio={MOCK_PROS[0].bio}
                proRating={4.9} proReviews={MOCK_PROS[0].reviewCount} proMissions={MOCK_PROS[0].completedInterventions}
                proCity={MOCK_PROS[0].locationNeighborhood.split(",")[0]} proPhone={MOCK_PROS[0].phoneNumber}
                proVerified={MOCK_PROS[0].isVerified} proJoined="Juin 2024"
                portfolio={MOCK_PORTFOLIO_PRO} pricing={MOCK_PRICING} availability={MOCK_AVAILABILITY}
                isOwnProfile={true} onBack={() => setShowProMiniSite(false)} onOpenChat={() => {}}
                onEdit={() => setShowProEditProfile(true)}
              />
            ) : showProRefonteDashboard ? (
              <ProDashboardRefonteScreen
                data={MOCK_DASH_DATA} onBack={() => setShowProRefonteDashboard(false)}
                monthLabels={MONTH_LABELS} revenueHistory={MOCK_REVENUE_HISTORY}
                missionHistory={MOCK_MISSION_HISTORY} ratingHistory={MOCK_RATING_HISTORY}
              />
            ) : showProRefonteFinance ? (
              <ProFinanceRefonteScreen
                summary={MOCK_FINANCE_SUMMARY} transactions={MOCK_PAYMENT_TXS} onBack={() => setShowProRefonteFinance(false)}
                onShowQR={() => {}} onWithdraw={() => {}}
              />
            ) : (
              <>
                {proCurrentScreen === "job-execution" && selectedProJob ? (
                  <ProJobExecutionScreen job={selectedProJob} onUpdateStatus={handleProUpdateStatus} onComplete={handleProCompleteJob} onBack={() => { setProCurrentScreen("dashboard"); setSelectedProJob(null); }} />
                ) : (
                  <>
                    {proTab === "dashboard" && (
                      <ProDashboardScreen pro={MOCK_PROS[0]} stats={MOCK_PRO_STATS} todayJobs={proJobs} alerts={proAlerts} available={isAvailable}
                        onToggleAvailability={() => setIsAvailable((p) => !p)} onViewJob={handleViewJob}
                        onAcceptAlert={(a) => setActiveAlert(a)} onDeclineAlert={handleDeclineAlert} />
                    )}
                    {proTab === "planning" && <ProScheduleScreen jobs={proJobs} onViewJob={handleViewJob} />}
                    {proTab === "finance" && (
                      <ProFinanceScreen balanceXOF={245000} earnings={MOCK_PRO_EARNINGS} stats={MOCK_PRO_STATS}
                        onWithdraw={(a, m) => console.log(`Withdraw ${a} via ${m}`)} />
                    )}
                    {proTab === "profile" && (
                      <ProProfileScreen pro={MOCK_PROS[0]} services={MOCK_SERVICES.filter(s => s.proId === MOCK_PROS[0].id)}
                        verification={MOCK_VERIFICATION} portfolio={portfolio}
                        onToggleRole={toggleRole} onNavigateToEdit={() => setShowProEditProfile(true)}
                        onNavigateToVerification={() => setProSubScreen("verification")}
                        onNavigateToNotifications={() => setProSubScreen("notifications")}
                        onNavigateToHelp={() => setProSubScreen("help")}
                        onAddPortfolioItem={(item) => setPortfolio(prev => [{ ...item, id: "pf_" + Date.now(), createdAt: new Date().toISOString() }, ...prev])}
                        onRemovePortfolioItem={(id) => setPortfolio(prev => prev.filter(p => p.id !== id))}
                        onAddService={() => {}} />
                    )}
                  </>
                )}
              </>
            )}
          </>
        ) : (
          <>
            {activeTab === "explorer" && (
              <>
                {currentScreen === "explore" && (
                  <ExplorerScreen onSelectPro={handleSelectPro} recommendedPros={MOCK_PROS} onInitiateAiRequest={() => setCurrentScreen("request-creation")} />
                )}
                {currentScreen === "pro-profile" && (
                  <ProfilProScreen pro={selectedPro} services={activeProServices} portfolio={MOCK_PORTFOLIO.filter(p => p.category === selectedPro.category)} verification={MOCK_VERIFICATION} onBack={() => setCurrentScreen("explore")} onInitiateMatch={handleInitiateMatch} />
                )}
                {currentScreen === "matching" && (
                  <AiMatchAndPricingScreen pro={selectedPro} selectedServices={selectedServices} onBack={() => setCurrentScreen("pro-profile")} onConfirmMatch={handleConfirmMatch} />
                )}
                {currentScreen === "request-creation" && (
                  <RequestCreationScreen onBack={() => setCurrentScreen("explore")} onAnalyze={handleAnalyzeRequest} onProceedToMatching={(details) => { setAiRequestDetails(details); setCurrentScreen("pro-selection"); }} />
                )}
                {currentScreen === "pro-selection" && (
                  <ProSelectionScreen category={aiRequestDetails?.category || "ac"} proList={MOCK_PROS.filter(p => p.category === aiRequestDetails?.category)} onBack={() => setCurrentScreen("request-creation")} onViewProfile={(pro) => { setSelectedPro(pro); setCurrentScreen("pro-profile"); }} onSelectPro={(pro) => { setSelectedPro(pro); const ms: Service = { id: "service_ai_" + Date.now(), proId: pro.id, name: aiRequestDetails?.subCategory || "Dépannage IA", description: aiRequestDetails?.summary || "Intervention diagnostiquée par intelligence artificielle", priceEstimateXOF: Math.round(((aiRequestDetails?.estimatedPriceMinXOF || 0) + (aiRequestDetails?.estimatedPriceMaxXOF || 10000)) / 2) || pro.hourlyRateXOF * 2, }; setSelectedServices([ms]); setCurrentScreen("matching"); }} />
                )}
              </>
            )}
            {activeTab === "requests" && renderRequestsContent()}
            {activeTab === "messages" && renderMessagesContent()}
            {activeTab === "profile" && renderProfileContent()}
          </>
        )}
      </div>

      {/* BottomNav */}
      <BottomNav role={userRole === UserRole.CLIENT ? "client" : "pro"} activeTab={userRole === UserRole.CLIENT ? activeTab : proTab} onTabChange={handleTabChange} />

      {/* Pro Job Alert Modal */}
      {activeAlert && (
        <ProJobAlertScreen alert={activeAlert} onAccept={handleAcceptAlert} onDecline={handleDeclineAlert} onDismiss={() => setActiveAlert(null)} />
      )}
    </div>
  );
}
