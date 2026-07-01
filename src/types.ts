/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ─── Roles ───

export type UserRole =
  | "client"
  | "professional"
  | "pro"
  | "company"
  | "business_admin"
  | "enterprise_admin"
  | "platform_admin";

export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
}

// ─── Pro ───

export type ProCategory =
  | "maison-reparations" | "transport-livraison" | "evenements"
  | "education-formation" | "social-media-informatique" | "assistance-services";

export type SubscriptionTier = "standard" | "verified" | "pro" | "pro_plus";

export interface ProfessionalDetails extends User {
  category: ProCategory;
  subCategory: string;
  title: string;
  bio: string;
  experienceYears: number;
  rating: number;
  reviewCount: number;
  hourlyRateXOF: number;
  locationNeighborhood: string;
  isVerified: boolean;
  subscriptionTier?: SubscriptionTier;
  completedInterventions: number;
  availabilityStatus: "available" | "busy" | "offline";
  lat?: number;
  lng?: number;
  trustScore?: number;
  trustScoreComponents?: TrustScoreComponents;
  reputationIndicator?: ReputationIndicator;
  verificationLevel?: number;
  avgResponseTimeMinutes?: number;
  completionRate?: number;
  totalCancellations?: number;
  recommendationRate?: number;
  memberSince?: string;
  totalOffers?: number;
  acceptedOffers?: number;
  jobAcceptanceRate?: number;
  languages?: string[];
  paymentMethods?: PaymentMethod[];
  clientCount?: number;
  offers?: ProOffer[];
  workingHours?: string;
  responseTime?: string;
}

export interface ProOffer {
  id: string;
  title: string;
  description: string;
  badge: string;
  badgeColor: string;
}

export interface Service {
  id: string;
  proId: string;
  name: string;
  description: string;
  priceEstimateXOF: number;
}

// ─── Mission 13 états (PRD) ───

export type MissionStatus =
  | "draft"
  | "published"
  | "pending"
  | "accepted"
  | "refused"
  | "paid"
  | "in_progress"
  | "completed"
  | "client_validation"
  | "disputed"
  | "closed"
  | "cancelled"
  | "refunded"
  // Legacy (deprecated, kept for backward compat)
  | "created"
  | "en_route"
  | "reviewed";

export const MISSION_STATUS_LABELS: Record<MissionStatus, string> = {
  draft: "Brouillon",
  published: "Publiée",
  pending: "En attente",
  accepted: "Acceptée",
  refused: "Refusée",
  paid: "Payée",
  in_progress: "En cours",
  completed: "Terminée",
  client_validation: "Validation client",
  disputed: "En litige",
  closed: "Clôturée",
  cancelled: "Annulée",
  refunded: "Remboursée",
  // Legacy
  created: "Créée",
  en_route: "En route",
  reviewed: "Évaluée",
};

export const MISSION_STATUS_ORDER: MissionStatus[] = [
  "draft", "published", "pending", "accepted", "paid", "in_progress",
  "completed", "client_validation", "closed",
];

// ─── Devis / Quote states (W20) ───

export type QuoteStatus =
  | "pending"
  | "sent"
  | "modified"
  | "accepted"
  | "refused"
  | "expired";

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  pending: "En attente de devis",
  sent: "Devis envoyé",
  modified: "Devis modifié",
  accepted: "Devis accepté",
  refused: "Devis refusé",
  expired: "Devis expiré",
};

export interface QuoteLineItem {
  id: string;
  label: string;
  quantity: number;
  unitPriceXOF: number;
  totalXOF: number;
  type: "labor" | "material" | "travel" | "other";
}

export interface QuoteVersion {
  id: string;
  version: number;
  lineItems: QuoteLineItem[];
  totalXOF: number;
  estimatedDurationMins: number;
  startDate: string;
  endDate: string;
  materialsIncluded: string;
  materialsNotIncluded: string;
  materialsByClient: string;
  warranty: string;
  conditions: string;
  validUntil: string;
  notes: string;
  attachments: string[];
  createdAt: string;
}

export interface Quote {
  id: string;
  requestId: string;
  professionalId: string;
  professionalName: string;
  professionalAvatar: string;
  status: QuoteStatus;
  versions: QuoteVersion[];
  currentVersion: number;
  clientComment?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Escrow / Payment (W8) ───

export type EscrowStatus =
  | "held"
  | "released"
  | "refunded"
  | "partially_refunded";

export interface EscrowEntry {
  id: string;
  missionId: string;
  clientId: string;
  proId: string;
  amountXOF: number;
  commissionPercent: number;
  commissionXOF: number;
  proAmountXOF: number;
  platformAmountXOF: number;
  status: EscrowStatus;
  paidAt: string;
  releasedAt?: string;
  createdAt: string;
}

// ─── Cancellation (W16) ───

export type CancellationPhase = "before_payment" | "after_payment" | "during_mission";

export interface CancellationRequest {
  id: string;
  missionId: string;
  requestedBy: string;
  reason: string;
  phase: CancellationPhase;
  refundPercent: number;
  status: "pending" | "approved" | "rejected";
  adminNote?: string;
  createdAt: string;
  resolvedAt?: string;
}

// ─── Report / Signalement (W17) ───

export type ReportTargetType = "user" | "message" | "photo" | "review";

export interface Report {
  id: string;
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  description: string;
  status: "open" | "investigating" | "resolved" | "dismissed";
  resolution?: string;
  createdAt: string;
  resolvedAt?: string;
}

// ─── Urgence ───

export type Urgency = "immediate" | "today" | "this_week" | "flexible";

export const URGENCY_LABELS: Record<Urgency, string> = {
  immediate: "Immédiat",
  today: "Aujourd'hui",
  this_week: "Cette semaine",
  flexible: "Flexible",
};

// ─── Client Request (multi-demandes) ───

export interface ClientRequest {
  id: string;
  clientId: string;
  title: string;
  description: string;
  photos: string[];
  videos?: string[];
  category: string;
  subCategory?: string;
  address: string;
  addressDetails?: string;
  budgetXOF: number;
  materialsProvided?: boolean;
  materialsCost?: number;
  urgency: Urgency;
  status: MissionStatus;
  proId?: string;
  quoteIds?: string[];
  scheduledAt?: string;
  lat?: number;
  lng?: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Mission (liée à une demande acceptée) ───

export interface Mission {
  id: string;
  requestId: string;
  clientId: string;
  proId: string;
  status: MissionStatus;
  title: string;
  description: string;
  category: string;
  subCategory?: string;
  address: string;
  budgetXOF: number;
  photos: string[];
  // Pro details
  proName: string;
  proAvatar: string;
  proPhone: string;
  // Client details
  clientName: string;
  clientPhone: string;
  // Quote
  quoteId?: string;
  // Timestamps
  createdAt: string;
  acceptedAt?: string;
  paidAt?: string;
  inProgressAt?: string;
  completedAt?: string;
  clientValidatedAt?: string;
  closedAt?: string;
  cancelledAt?: string;
  refundedAt?: string;
  // Before/After photos (W9, W11, W12)
  beforePhotos?: string[];
  afterPhotos?: string[];
  // GPS check-in/out (W9)
  gpsCheckIn?: { lat: number; lng: number };
  gpsCheckOut?: { lat: number; lng: number };
  // Escrow
  escrowId?: string;
  // Cancellation
  cancellationId?: string;
  // Dispute
  disputeId?: string;
  // Progression
  estimatedArrivalMinutes?: number;
  durationMins?: number;
  proNotes?: string;
  clientNotes?: string;
}

// ─── Review ───

export interface Review {
  id: string;
  missionId: string;
  clientId: string;
  proId: string;
  rating: number; // 1-5
  comment: string;
  proName: string;
  proAvatar: string;
  category: string;
  createdAt: string;
}

// ─── Message & Conversation ───

export type MediaType = "image" | "video" | "voice" | "document" | "none";

export interface MediaAttachment {
  type: MediaType;
  url: string;
  thumbnailUrl?: string;
  duration?: number; // seconds (for video/voice)
  fileName?: string;
  fileSize?: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  photos: string[];
  media?: MediaAttachment[];
  location?: { lat: number; lng: number; label: string };
  createdAt: string;
  status?: "sent" | "delivered" | "read";
}

export interface Conversation {
  id: string;
  participants: string[];
  missionId?: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  otherUserName: string;
  otherUserAvatar: string;
}

// ─── Pricing & Availability (Pro) ───

export interface ProPricingConfig {
  pricingType: "per_intervention" | "fixed" | "hourly" | "custom";
  perInterventionXOF?: number;
  fixedPriceXOF?: number;
  hourlyRateXOF?: number;
  customLabel?: string;
  customPriceXOF?: number;
  travelFeeXOF: number;
  travelFree: boolean;
}

export interface ProAvailability {
  monday: { start: string; end: string } | null;
  tuesday: { start: string; end: string } | null;
  wednesday: { start: string; end: string } | null;
  thursday: { start: string; end: string } | null;
  friday: { start: string; end: string } | null;
  saturday: { start: string; end: string } | null;
  sunday: { start: string; end: string } | null;
  holidays: string[];
}

// ─── QR Payment ───

export type PaymentMethod = "orange_money" | "mtn_momo" | "wave" | "moov_money";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  orange_money: "Orange Money",
  mtn_momo: "MTN MoMo",
  wave: "Wave",
  moov_money: "Moov Money",
};

export const PAYMENT_METHOD_COLORS: Record<PaymentMethod, string> = {
  orange_money: "#FF7900",
  mtn_momo: "#FFCC00",
  wave: "#1E90FF",
  moov_money: "#00A3FF",
};

export interface QRPaymentInfo {
  proId: string;
  proName: string;
  qrData: string;
  amountXOF?: number;
}

export interface PaymentTransaction {
  id: string;
  missionId: string;
  clientId: string;
  proId: string;
  amountXOF: number;
  method: PaymentMethod;
  commissionPercent: number;
  commissionXOF: number;
  proAmountXOF: number;
  platformAmountXOF: number;
  status: "pending" | "completed" | "failed";
  createdAt: string;
}

// ─── Commission ───

export interface CommissionConfig {
  defaultPercent: number;
  tiers: { minMissions: number; maxMissions: number; percent: number }[];
}

// ─── Dashboard ───

export interface DashboardChartData {
  labels: string[];
  values: number[];
}

export interface ProFinanceSummary {
  availableBalanceXOF: number;
  pendingBalanceXOF: number;
  todayEarningsXOF: number;
  weekEarningsXOF: number;
  monthEarningsXOF: number;
  totalEarningsXOF: number;
  totalWithdrawnXOF: number;
  transactions: PaymentTransaction[];
}

// ─── Existing types kept for backward compatibility ───

export enum RequestStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  EN_ROUTE = "en_route",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed"
}

export interface ServiceRequest {
  id: string;
  clientId: string;
  proId: string;
  serviceId: string;
  serviceName: string;
  status: RequestStatus;
  travelFeeXOF: number;
  laborFeeXOF: number;
  totalFeeXOF: number;
  locationDetails: string;
  createdAt: string;
  estimatedArrivalMinutes?: number;
  cancellationReason?: string;
}

export interface Transaction {
  id: string;
  requestId: string;
  clientId: string;
  proId: string;
  amountXOF: number;
  paymentMethod: "wave" | "orange_money" | "mtn_momo" | "cash";
  status: "pending" | "successful" | "failed";
  createdAt: string;
}

export type ProJobStatus = "pending" | "accepted" | "en_route" | "in_progress" | "completed" | "cancelled";

export interface ProAlert {
  id: string;
  requestId: string;
  clientName: string;
  clientPhone: string;
  clientAvatarUrl?: string;
  category: string;
  description: string;
  urgency: "low" | "medium" | "high" | "emergency";
  estimatedPriceMinXOF: number;
  estimatedPriceMaxXOF: number;
  location: string;
  sentAt: string;
  expiresAt: string;
}

export interface ProJob {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientAvatarUrl?: string;
  clientLocation: string;
  category: string;
  serviceName: string;
  description: string;
  status: ProJobStatus;
  travelFeeXOF: number;
  laborFeeXOF: number;
  totalFeeXOF: number;
  createdAt: string;
  scheduledDate?: string;
  scheduledTime?: string;
  completedAt?: string;
}

export interface ProEarning {
  id: string;
  amountXOF: number;
  type: "job_payment" | "withdrawal" | "bonus";
  label: string;
  status: "completed" | "pending" | "failed";
  clientName?: string;
  createdAt: string;
}

export interface ProTransaction {
  id: string;
  type: "payment" | "withdrawal";
  amountXOF: number;
  method?: "wave" | "orange_money" | "mtn_momo" | "cash";
  reference: string;
  status: "completed" | "pending" | "failed";
  createdAt: string;
}

export interface ProDashboardStats {
  todayEarningsXOF: number;
  weekEarningsXOF: number;
  monthEarningsXOF: number;
  totalJobsCompleted: number;
  todayJobsCount: number;
  rating: number;
  reviewCount: number;
}

// ─── Verification ───

export type VerificationLevel = "none" | "phone" | "id" | "background" | "certified" | "elite";

export interface VerificationBadgeConfig {
  level: VerificationLevel;
  label: string;
  color: string;
  icon: string;
  description: string;
}

export interface ProVerification {
  level: VerificationLevel;
  cniFrontUrl?: string;
  cniBackUrl?: string;
  selfieUrl?: string;
  cniStatus: "not_submitted" | "pending" | "approved" | "rejected";
  backgroundCheckUrl?: string;
  backgroundStatus: "not_submitted" | "pending" | "approved" | "rejected";
  certDocumentUrl?: string;
  certStatus: "not_submitted" | "pending" | "approved" | "rejected";
  submittedAt: string;
  verifiedAt?: string;
}

// ─── Gamification & Progression ───

export type ProLevel = "débutant" | "avancé" | "expert" | "élite";

export interface ProLevelConfig {
  level: ProLevel;
  minXP: number;
  maxXP: number;
  label: string;
  color: string;
  commissionPercent: number;
  benefits: string[];
}

export const PRO_LEVELS: ProLevelConfig[] = [
  { level: "débutant", minXP: 0, maxXP: 599, label: "Débutant", color: "text-cm-text-muted", commissionPercent: 15, benefits: ["Accès aux missions", "Support standard"] },
  { level: "avancé", minXP: 600, maxXP: 1199, label: "Avancé", color: "text-cm-text-soft", commissionPercent: 12, benefits: ["Commission réduite (12%)", "Visibilité accrue", "Support prioritaire"] },
  { level: "expert", minXP: 1200, maxXP: 2499, label: "Expert", color: "text-cm-accent", commissionPercent: 8, benefits: ["Commission réduite (8%)", "Badge Expert", "Mise en avant", "Support dédié"] },
  { level: "élite", minXP: 2500, maxXP: Infinity, label: "Élite", color: "text-yellow-500", commissionPercent: 5, benefits: ["Commission réduite (5%)", "Badge Élite", "Avantage prioritaire", "Accès aux missions premium", "Conciergerie"] },
];

export function getProLevel(xp: number): ProLevelConfig {
  return (PRO_LEVELS.find(l => xp >= l.minXP && xp <= l.maxXP) ?? PRO_LEVELS[0])!;
}

export function getProLevelFromJobs(jobs: number): ProLevelConfig {
  return getProLevel(jobs * 50);
}

export interface PlanConfig {
  tier: SubscriptionTier | "verified";
  label: string;
  priceMonthly: number;
  priceOneTime: number;
  commissionRate: number;
  features: string[];
  badge: string | null;
  requiresVerification: boolean;
}

export interface UserSubscription {
  id: string;
  tier: SubscriptionTier;
  status: "active" | "past_due" | "cancelled" | "trialing";
  currentPeriodStart: string;
  currentPeriodEnd: string;
  priceMonthly: number;
  commissionRate: number;
  paymentMethod: PaymentMethod | null;
}

export interface UserVerification {
  status: "none" | "pending" | "approved" | "rejected";
  level: string | null;
  selfieUrl: string | null;
  documentType: string | null;
  documentUrl: string | null;
  documentBackUrl: string | null;
  submittedAt: string | null;
  verifiedAt: string | null;
  reviewNotes: string | null;
}

// ─── Admin ───

export interface AdminPayment {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  plan: string;
  amount: number;
  paymentMethod: PaymentMethod;
  phoneNumber: string;
  status: "pending" | "approved" | "rejected";
  validatedBy: string | null;
  validatedAt: string | null;
  rejectedReason: string | null;
  createdAt: string;
}

export interface AdminVerification {
  id: string;
  userId: string;
  userName: string;
  level: string;
  documentType: string;
  documentUrl: string;
  selfieUrl: string | null;
  status: "pending" | "approved" | "rejected";
  reviewNotes: string | null;
  submittedAt: string;
}

export interface AdminDispute {
  id: string;
  jobId: string;
  raiserId: string;
  raiserName: string;
  reason: string;
  description: string;
  evidenceUrls: string[];
  status: string;
  resolution: string | null;
  refundAmount: number | null;
  resolvedBy: string | null;
  createdAt: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface ProgressionState {
  xp: number;
  level: ProLevel;
  badges: Badge[];
  completedJobs: number;
  totalEarningsXOF: number;
  currentCommissionPercent: number;
}

// ─── Trust System ───

export interface TrustScoreComponents {
  reviewsScore: number;
  completionRateScore: number;
  verificationScore: number;
  responseTimeScore: number;
  accountAgeScore: number;
  openDisputes: number;
  recentCancellations: number;
  acceptanceRate: number;
  // Raw data from backend JSONB (optional, for transparency)
  rawAvgRating?: number;
  rawCompletedJobs?: number;
  rawTotalJobs?: number;
  rawVerificationLevel?: number;
  rawAvgResponseMinutes?: number;
  rawDaysMember?: number;
}

export type ReputationIndicator = "safe" | "recent" | "risky";

export function getReputationIndicator(score: number): ReputationIndicator {
  if (score >= 70) return "safe";
  if (score >= 40) return "recent";
  return "risky";
}

export const REPUTATION_LABELS: Record<ReputationIndicator, string> = {
  safe: "Prestataire fiable",
  recent: "Prestataire récent",
  risky: "Prestataire à risque",
};

// ─── User Verification (with attempt tracking) ───

export interface UserVerificationAttempt {
  id: string;
  userId: string;
  level: number;
  attempt: number;
  status: "pending" | "approved" | "rejected";
  metadata: Record<string, unknown>;
  reviewNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VerificationLevelInfo {
  level: number;
  label: string;
  description: string;
  icon: string;
}

export const VERIFICATION_LEVELS: VerificationLevelInfo[] = [
  { level: 0, label: "Compte créé", description: "Compte créé", icon: "user" },
  { level: 1, label: "Téléphone vérifié", description: "Numéro de téléphone confirmé", icon: "phone" },
  { level: 2, label: "Email vérifié", description: "Adresse email confirmée", icon: "mail" },
  { level: 3, label: "Identité vérifiée", description: "CNI ou passeport vérifié", icon: "file-text" },
  { level: 4, label: "Bio-vérification", description: "Selfie + comparaison biométrique", icon: "camera" },
  { level: 5, label: "Profession vérifiée", description: "Diplôme ou certification validé", icon: "award" },
];

// ─── Gallery ───

export type GalleryCategory = "realisation" | "before_after" | "certificate" | "equipment" | "other";

export interface GalleryItem {
  id: string;
  url: string;
  thumbnailUrl?: string;
  category: GalleryCategory;
  caption?: string;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: string;
}

// ─── Pro Dashboard (private) ───

export interface ProDashboardData {
  monthlyRevenueXOF: number;
  totalRevenueXOF: number;
  totalMissions: number;
  completedMissions: number;
  cancelledMissions: number;
  averageRating: number;
  trustScore: number;
  trustScoreComponents: TrustScoreComponents;
  reputationIndicator: ReputationIndicator;
  verificationLevel: number;
  nextVerificationLevel: number | null;
  availabilityStatus: "available" | "busy" | "offline";
  avgResponseTimeMinutes: number;
  completionRate: number;
  recommendationRate: number;
  jobAcceptanceRate: number;
  memberSince: string;
}

// ─── Portfolio ───

export interface PortfolioItem {
  id: string;
  imageUrl: string;
  caption: string;
  category: string;
  createdAt: string;
}

// ─── Services & Pricing (legacy) ───

export interface ProServicePricing {
  id: string;
  name: string;
  description: string;
  fixedPriceXOF?: number;
  hourlyRateXOF?: number;
  travelFeeXOF: number;
  estimatedDurationMinutes: number;
  isActive: boolean;
}

// ─── Availability (legacy) ───

export interface RecurringSlot {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  startTime: string;
  endTime: string;
}

export interface BlockedDay {
  date: string;
  reason: string;
}

// ─── Notification Preferences ───

export interface NotificationPreference {
  channel: "push" | "sms" | "whatsapp" | "email";
  enabled: boolean;
  events: {
    newLead: boolean;
    quoteAccepted: boolean;
    paymentReceived: boolean;
    reviewReceived: boolean;
    payoutProcessed: boolean;
    verificationApproved: boolean;
    lowBalance: boolean;
    weeklySummary: boolean;
  };
}

// ─── Help ───

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

// ─── Pipeline Tracking ───

export type ServiceStatus = 'EN_ROUTE' | 'SUR_PLACE' | 'TERMINE';

export interface TrackingData {
  status: ServiceStatus;
  proName: string;
  proPhoto: string;
  proPhone: string;
  estimatedArrival: string;
  proCoordinates: { lat: number; lng: number };
}

// ─── Invoice ───

export interface Invoice {
  id: string;
  missionId: string;
  clientId: string;
  proId: string;
  clientName: string;
  proName: string;
  category: string;
  address: string;
  reason: string;
  laborCostXOF: number;
  materialsCostXOF: number;
  travelCostXOF: number;
  totalXOF: number;
  commissionPercent: number;
  commissionXOF: number;
  proAmountXOF: number;
  beforePhotos: string[];
  afterPhotos: string[];
  clientRating?: number;
  clientComment?: string;
  createdAt: string;
  paidAt?: string;
}

// ─── In-App Call ───

export type CallStatus = "ringing" | "connecting" | "connected" | "ended";

export interface CallSession {
  id: string;
  callerId: string;
  calleeId: string;
  callerName: string;
  callerAvatar: string;
  calleeName: string;
  calleeAvatar: string;
  status: CallStatus;
  durationMs: number;
  startedAt: string;
  endedAt?: string;
  isIncoming: boolean;
}

// ─── Onboarding ───

export type OnboardingStep =
  | "welcome"
  | "phone"
  | "basic-info"
  | "service-area"
  | "pricing"
  | "photo"
  | "verification"
  | "done";

export interface OnboardingData {
  firstName: string;
  lastName: string;
  category: string;
  phone: string;
  serviceRadiusKm: number;
  locationLat: number;
  locationLng: number;
  hourlyRateXOF: number;
  travelFeeXOF: number;
  avatarLocalUrl?: string;
}

// ─── Pro Onboarding ───

export type ProApplicationStatus = "NOT_STARTED" | "IN_PROGRESS" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";

export type OnboardingStepId =
  | "welcome"
  | "eligibility"
  | "categories"
  | "location"
  | "info"
  | "documents"
  | "portfolio"
  | "otp-phone"
  | "otp-email"
  | "payment"
  | "cgu"
  | "review"
  | "pending";

export interface ProOnboardingData {
  currentStep: number;
  maxCompletedStep: number;
  status: ProApplicationStatus;

  selectedCategoryIds: string[];
  selectedSubCategories: string[];

  location: { lat: number; lng: number };
  serviceRadiusKm: number;

  title: string;
  bio: string;
  experienceYears: number;
  hourlyRateXOF: number;
  travelFeeXOF: number;

  documents: { type: string; url: string; name: string; status: "pending" | "uploaded" | "error" }[];

  portfolioItems: { url: string; caption: string }[];

  phone: string;
  phoneVerified: boolean;
  email: string;
  emailVerified: boolean;

  paymentMethod: PaymentMethod | null;
  paymentPhone: string;

  cguAccepted: boolean;
  signature: string | null;

  submittedAt: string | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
}

export const ONBOARDING_STEP_LABELS: Record<OnboardingStepId, string> = {
  welcome: "Bienvenue",
  eligibility: "Éligibilité",
  categories: "Métiers",
  location: "Localisation",
  info: "Informations",
  documents: "Documents",
  portfolio: "Galerie",
  "otp-phone": "Téléphone",
  "otp-email": "Email",
  payment: "Paiement",
  cgu: "CGU",
  review: "Récapitulatif",
  pending: "En cours",
};

export const ONBOARDING_STEPS: OnboardingStepId[] = [
  "welcome", "eligibility", "categories", "location", "info",
  "documents", "portfolio", "otp-phone", "otp-email",
  "payment", "cgu", "review", "pending",
];
