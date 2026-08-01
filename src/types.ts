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
  categories: string[];
  subCategory: string;
  subCategories: string[];
  title: string;
  bio: string;
  coverUrl?: string;
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
  price?: number;
  originalPrice?: number;
}

export interface Service {
  id: string;
  proId: string;
  name: string;
  description: string;
  priceEstimateXOF: number;
}

// ─── Mission Status (unified) ───

export type MissionStatus =
  | "pending"
  | "accepted"
  | "quote_requested"
  | "quote_sent"
  | "quote_accepted"
  | "paid"
  | "in_progress"
  | "completed"
  | "client_validation"
  | "client_validated"
  | "closed"
  | "cancelled"
  | "refunded"
  | "disputed"
  | "refused"
  // Pro-side GPS tracking (use ProJobStatus instead for new code)
  | "en_route"
  | "arrived"
  // Legacy statuses
  | "created"
  | "published"
  | "reviewed"
  | "draft";

export const MISSION_STATUS_FLOW: MissionStatus[] = [
  "pending", "accepted", "paid", "in_progress",
  "completed", "client_validation", "closed",
];

export const MISSION_STATUS_LABELS: Record<MissionStatus, string> = {
  pending: "En attente",
  accepted: "Acceptée",
  quote_requested: "En attente de devis",
  quote_sent: "Devis envoyé",
  quote_accepted: "Devis accepté",
  paid: "Payée",
  in_progress: "En cours",
  completed: "Terminée",
  client_validation: "Validation client",
  client_validated: "Validée",
  closed: "Clôturée",
  cancelled: "Annulée",
  refunded: "Remboursée",
  disputed: "En litige",
  refused: "Refusée",
  // Pro-side GPS tracking
  en_route: "En route",
  arrived: "Arrivé",
  // Legacy
  created: "Créée",
  published: "Publiée",
  reviewed: "Avis donné",
  draft: "Brouillon",
};

// ─── (Legacy statuses kept in ClientRequest) ───

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
// ⚠️  Nouveaux types unifiés dans src/types/payment/

/** @deprecated Import { EscrowStatus } from '@/types/payment' */
export type EscrowStatus =
  | "held"
  | "released"
  | "refunded"
  | "partially_refunded";

/** @deprecated Import { EscrowEntry } from '@/types/payment' */
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
  pricingModel?: "fixed" | "quote";
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
  pricingModel?: "fixed" | "quote";
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
  enRouteAt?: string;
  arrivedAt?: string;
  inProgressAt?: string;
  completedAt?: string;
  clientValidatedAt?: string;
  paidAt?: string;
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

// ─── Messaging: Mission-Centric Chat ───

// ── Conversation lifecycle ──

export type ConversationState =
  | "waiting"
  | "active"
  | "locked"
  | "read_only"
  | "archived";

export type MissionPhase =
  | "accepted"
  | "on_site"
  | "working"
  | "completed";

export interface ConversationMetadata {
  mission_phase?: MissionPhase;
  flags: {
    dispute: boolean;
    support_joined: boolean;
    pinned: boolean;
  };
  job_snapshot: {
    category: string;
    location: string;
    price_estimate: number;
    currency: string;
    service_type: "on_demand" | "scheduled";
  };
  created_from: "job_accept" | "manual";
  productId?: string;
  productName?: string;
  sellerId?: string;
}

// ── Message taxonomy ──

export type MessageType =
  | "text" | "image" | "video" | "voice" | "pdf" | "location"
  | "quote" | "invoice" | "payment" | "system" | "event";

export type MessageStatus = "sent" | "delivered" | "read";

export type ModerationAction =
  | "none" | "warned" | "blocked" | "reported" | "auto_escalated";

export interface MediaAttachment {
  type: MessageType;
  url: string;
  thumbnailUrl?: string;
  duration?: number;
  fileName?: string;
  fileSize?: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string | null;
  type: MessageType;
  text: string;
  photos: string[];
  media?: MediaAttachment[];
  location?: { lat: number; lng: number; label: string };
  metadata?: Record<string, unknown>;
  riskScore: number;
  moderationAction: ModerationAction;
  createdAt: string;
  status: MessageStatus;
}

export interface SystemEvent {
  id: string;
  conversationId: string;
  event: string;
  content: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// ── Conversation ──

export interface Conversation {
  id: string;
  participants: string[];
  missionId: string;
  state: ConversationState;
  metadata: ConversationMetadata;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  otherUserName: string;
  otherUserAvatar: string;
  otherUserRating?: number;
  otherUserVerified?: boolean;
  otherUserOnline?: boolean;
}

// ── Message content helpers ──

export function isSystemMessage(msg: Message): boolean {
  return msg.type === "system" || msg.type === "event";
}

export function isMediaMessage(msg: Message): boolean {
  return ["image", "video", "voice", "pdf"].includes(msg.type);
}

export function getMessageLabel(msg: Message): string {
  const labels: Record<string, string> = {
    image: "📷 Photo",
    video: "🎬 Vidéo",
    voice: "🎤 Message vocal",
    pdf: "📄 Document",
    location: "📍 Localisation",
    quote: "📋 Devis",
    invoice: "🧾 Facture",
    payment: "💳 Paiement",
    system: "🔔 Notification",
    event: "",
  };
  return labels[msg.type] || msg.text;
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
// ⚠️  Nouveaux types unifiés dans src/types/payment/

/** @deprecated Import { UnifiedPaymentMethod } from '@/types/payment' */
export type PaymentMethod = "orange_money" | "mtn_momo" | "wave" | "moov_money";

/** @deprecated Import { PAYMENT_METHOD_LABELS } from '@/types/payment' */
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  orange_money: "Orange Money",
  mtn_momo: "MTN MoMo",
  wave: "Wave",
  moov_money: "Moov Money",
};

/** @deprecated Import { PAYMENT_METHOD_COLORS } from '@/types/payment' */
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

/** @deprecated Import { TransactionLedgerEntry } from '@/types/payment' */
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

// ─── CEA Unified Financial Types ───
// ⚠️  Remplacé par src/types/payment/

/** @deprecated Import { UnifiedPaymentMethod } from '@/types/payment' */
export type UnifiedPaymentMethod =
  | "wave" | "orange_money" | "mtn_momo" | "moov_money"
  | "stripe" | "flutterwave" | "cinetpay"
  | "cash" | "bank_transfer" | "card" | "credit";

/** @deprecated Import { TransactionType } from '@/types/payment' */
export type UnifiedTransactionType =
  | "payment" | "payout" | "refund" | "commission"
  | "withdrawal" | "fee" | "bonus" | "cashback";

/** @deprecated Import { TransactionStatus } from '@/types/payment' */
export type UnifiedTransactionStatus =
  | "pending" | "authorized" | "captured" | "completed"
  | "failed" | "refunded" | "partially_refunded";

/** @deprecated Import { TransactionLedgerEntry } from '@/types/payment' */
export interface FinancialTransaction {
  id: string;
  projectId?: string;
  type: UnifiedTransactionType;
  fromUserId: string;
  toUserId: string;
  grossAmount: number;
  feeAmount: number;
  netAmount: number;
  method: UnifiedPaymentMethod;
  status: UnifiedTransactionStatus;
  reference?: string;
  linkedEntityType?: "mission" | "subscription" | "material_order" | "boost";
  linkedEntityId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt?: string;
}

export type ProjectStatus = MissionStatus | ProJobStatus;

// ─── CEA Unified Invoice ───
// ⚠️  Remplacé par src/types/payment/

/** @deprecated Import { InvoiceDomain } from '@/types/payment' */
export type InvoiceDomain = "mission" | "subscription" | "supplier";

/** @deprecated Import { BaseInvoice } from '@/types/payment' */
export interface BaseInvoice {
  id: string;
  domain: InvoiceDomain;
  number: string;
  amount: number;
  tax?: number;
  total: number;
  status: string;
  createdAt: string;
  paidAt?: string;
  pdfUrl?: string;
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

/** @deprecated Use MissionStatus instead */
export enum RequestStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  EN_ROUTE = "en_route",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed"
}

/** @deprecated Use Mission or Project instead */
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

/** @deprecated Use FinancialTransaction instead */
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

export type ProJobStatus =
  | "pending"
  | "accepted"
  | "quote_required"
  | "en_route"
  | "arrived"
  | "photos_taken"
  | "in_progress"
  | "completed"
  | "client_validation"
  | "closed"
  | "cancelled";

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
  pricingModel?: "fixed" | "quote";
  beforePhoto?: string;
  afterPhoto?: string;
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

export type ProLevel = "débutant" | "apprenti" | "professionnel" | "expert" | "élite" | "master" | "légende";

export interface ProLevelConfig {
  level: ProLevel;
  minXP: number;
  maxXP: number;
  label: string;
  emoji: string;
  color: string;
  commissionPercent: number;
  benefits: string[];
}

export const PRO_LEVELS: ProLevelConfig[] = [
  { level: "débutant", minXP: 0, maxXP: 499, label: "Débutant", emoji: "🌱", color: "text-gray-500", commissionPercent: 15, benefits: ["Accès aux missions", "Support standard"] },
  { level: "apprenti", minXP: 500, maxXP: 1499, label: "Apprenti", emoji: "🔨", color: "text-yellow-600", commissionPercent: 13, benefits: ["Commission réduite (13%)", "Visibilité de base"] },
  { level: "professionnel", minXP: 1500, maxXP: 3999, label: "Professionnel", emoji: "🛠", color: "text-cm-accent", commissionPercent: 11, benefits: ["Commission réduite (11%)", "Visibilité accrue", "Support prioritaire"] },
  { level: "expert", minXP: 4000, maxXP: 8999, label: "Expert", emoji: "⭐", color: "text-blue-500", commissionPercent: 9, benefits: ["Commission réduite (9%)", "Badge Expert", "Mise en avant", "Support dédié"] },
  { level: "élite", minXP: 9000, maxXP: 18999, label: "Élite", emoji: "💎", color: "text-purple-500", commissionPercent: 7, benefits: ["Commission réduite (7%)", "Badge Élite", "Missions prioritaires", "Support premium"] },
  { level: "master", minXP: 19000, maxXP: 34999, label: "Master", emoji: "👑", color: "text-amber-500", commissionPercent: 5, benefits: ["Commission réduite (5%)", "Badge Master", "Avantage prioritaire", "Accès missions premium", "Conciergerie"] },
  { level: "légende", minXP: 35000, maxXP: Infinity, label: "Légende", emoji: "🏆", color: "text-yellow-400", commissionPercent: 3, benefits: ["Commission réduite (3%)", "Badge Légende", "Top classement", "Missions exclusives", "Conciergerie VIP", "Invitation événements"] },
];

export function getProLevel(xp: number): ProLevelConfig {
  return (PRO_LEVELS.find(l => xp >= l.minXP && xp <= l.maxXP) ?? PRO_LEVELS[0])!;
}

export function getProLevelFromJobs(jobs: number): ProLevelConfig {
  return getProLevel(jobs * 50);
}

export type XPEventType =
  | "mission_completed"
  | "review_5star"
  | "quick_response"
  | "on_time"
  | "returning_client"
  | "urgent_mission"
  | "profile_100"
  | "identity_verified"
  | "portfolio_uploaded"
  | "streak_10_no_cancellation"
  | "badge_earned"
  | "late_cancellation"
  | "significant_delay"
  | "bad_review"
  | "reported";

export interface XPEvent {
  type: XPEventType;
  xp: number;
  label: string;
  description: string;
}

export const XP_EVENTS: Record<XPEventType, { xp: number; label: string; description: string }> = {
  mission_completed: { xp: 100, label: "Mission terminée", description: "+100 XP" },
  review_5star: { xp: 30, label: "Avis 5★", description: "+30 XP" },
  quick_response: { xp: 10, label: "Réponse rapide", description: "+10 XP" },
  on_time: { xp: 15, label: "Arrivé à l'heure", description: "+15 XP" },
  returning_client: { xp: 20, label: "Client récurrent", description: "+20 XP" },
  urgent_mission: { xp: 25, label: "Mission urgente acceptée", description: "+25 XP" },
  profile_100: { xp: 150, label: "Profil complété", description: "+150 XP (unique)" },
  identity_verified: { xp: 200, label: "Identité vérifiée", description: "+200 XP (unique)" },
  portfolio_uploaded: { xp: 80, label: "Portfolio uploadé", description: "+80 XP (unique)" },
  streak_10_no_cancellation: { xp: 100, label: "10 missions sans annulation", description: "+100 XP" },
  badge_earned: { xp: 50, label: "Badge obtenu", description: "+50 XP" },
  late_cancellation: { xp: -50, label: "Annulation tardive", description: "-50 XP" },
  significant_delay: { xp: -20, label: "Retard important", description: "-20 XP" },
  bad_review: { xp: -30, label: "Mauvaise note", description: "-30 XP" },
  reported: { xp: -100, label: "Signalement confirmé", description: "-100 XP" },
};

export interface XPTransaction {
  id: string;
  proId: string;
  eventType: XPEventType;
  xp: number;
  label: string;
  missionId?: string;
  createdAt: string;
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
// ⚠️  Remplacé par src/types/payment/

/** @deprecated Import { MissionInvoice } from '@/types/payment' */
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

export type CallType = "audio" | "video";

export type CallStatus =
  | "dialing" | "ringing" | "connecting" | "connected"
  | "ended" | "missed" | "declined" | "failed";

export type CallEventType =
  | "ringing_started" | "call_accepted" | "media_established"
  | "network_switched" | "call_ended" | "reconnecting" | "dropped";

export interface Call {
  id: string;
  conversationId: string;
  callerId: string;
  receiverId: string;
  type: CallType;
  status: CallStatus;
  startedAt: string | null;
  endedAt: string | null;
  durationSecs: number | null;
  createdAt: string;
}

export interface CallParticipant {
  id: string;
  callId: string;
  userId: string;
  joinedAt: string | null;
  leftAt: string | null;
  isMuted: boolean;
  isVideoEnabled: boolean;
}

export interface CallEvent {
  id: string;
  callId: string;
  userId: string | null;
  eventType: CallEventType;
  payload: Record<string, unknown> | null;
  createdAt: string;
}

export interface CallSession {
  id: string;
  callerId: string;
  calleeId: string;
  callerName: string;
  callerAvatar: string;
  calleeName: string;
  calleeAvatar: string;
  type: CallType;
  status: CallStatus;
  durationSecs: number;
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

  paymentMethod: UnifiedPaymentMethod | null;
  paymentPhone: string;

  cguAccepted: boolean;

  signature: string | null;

  submittedAt: string | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
}

// ─── Request Wizard (7-step) ───

export interface DiagnosticAnswer {
  questionId: string;
  question: string;
  answer: string;
}

export type MaterialsPreference = "pro_provides" | "client_buys" | "via_ca_match" | "none";

export type BudgetMode = "receive_proposals" | "precise" | "range";

export type AvailabilityMode = "asap" | "today" | "this_week" | "custom";

export interface RequestDraft {
  step: number;
  category: string | null;
  subCategory: string | null;
  diagnostic: DiagnosticAnswer[];
  description: string;
  photos: string[];
  videos: string[];
  address: string;
  addressComplement: string;
  accessInstructions: string;
  lat: number;
  lng: number;
  availability: AvailabilityMode | null;
  scheduledDate: string;
  timeSlot: string;
  budgetMode: BudgetMode | null;
  budgetMin: number;
  budgetMax: number;
  materialsPreference: MaterialsPreference | null;
  savedAt: string;
}

export const DEFAULT_DRAFT: RequestDraft = {
  step: 1,
  category: null,
  subCategory: null,
  diagnostic: [],
  description: "",
  photos: [],
  videos: [],
  address: "",
  addressComplement: "",
  accessInstructions: "",
  lat: 5.35,
  lng: -4.0,
  availability: null,
  scheduledDate: "",
  timeSlot: "",
  budgetMode: null,
  budgetMin: 0,
  budgetMax: 0,
  materialsPreference: null,
  savedAt: new Date().toISOString(),
};

// ─── Proposal ───

export interface ProposalMaterial {
  id: string;
  name: string;
  quantity: number;
  unitPriceXOF: number;
  totalXOF: number;
  supplierId?: string;
  supplierName?: string;
  supplierPrice?: number;
  supplierAvailable?: boolean;
  supplierDelivery?: "delivery" | "pickup";
}

export type ProposalStatus = "pending" | "accepted" | "refused" | "expired";

export interface Proposal {
  id: string;
  requestId: string;
  professionalId: string;
  professionalName: string;
  professionalAvatar: string;
  professionalRating: number;
  trustScore: number;
  distanceKm: number;
  estimatedArrivalMinutes: number;
  laborPriceXOF: number;
  materialsCostXOF: number;
  materialsDeliveryXOF: number;
  totalXOF: number;
  materials: ProposalMaterial[];
  estimatedDurationMins: number;
  status: ProposalStatus;
  message: string;
  experienceYears: number;
  reviewCount: number;
  completedInterventions: number;
  isVerified: boolean;
  verificationLevel: number;
  avgResponseTimeMinutes: number;
  completionRate: number;
  createdAt: string;
  expiresAt: string;
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
