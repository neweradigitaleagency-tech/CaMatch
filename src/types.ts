/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ─── Roles ───

export enum UserRole {
  CLIENT = "client",
  PRO = "pro",
  COMPANY = "company"
}

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

export interface ProfessionalDetails extends User {
  category: "electricity" | "plumbing" | "ac" | "carpenter";
  title: string;
  bio: string;
  experienceYears: number;
  rating: number;
  reviewCount: number;
  hourlyRateXOF: number;
  locationNeighborhood: string;
  isVerified: boolean;
  completedInterventions: number;
  availabilityStatus: "available" | "busy" | "offline";
  lat?: number;
  lng?: number;
}

export interface Service {
  id: string;
  proId: string;
  name: string;
  description: string;
  priceEstimateXOF: number;
}

// ─── Mission 7 états ───

export type MissionStatus =
  | "created"
  | "accepted"
  | "en_route"
  | "in_progress"
  | "completed"
  | "paid"
  | "reviewed";

export const MISSION_STATUS_LABELS: Record<MissionStatus, string> = {
  created: "Demande créée",
  accepted: "Acceptée",
  en_route: "En route",
  in_progress: "Intervention en cours",
  completed: "Terminée",
  paid: "Paiement confirmé",
  reviewed: "Évaluée",
};

export const MISSION_STATUS_ORDER: MissionStatus[] = [
  "created", "accepted", "en_route", "in_progress", "completed", "paid", "reviewed",
];

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
  category: string;
  address: string;
  budgetXOF: number;
  urgency: Urgency;
  status: MissionStatus;
  proId?: string;
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
  address: string;
  budgetXOF: number;
  photos: string[];
  proName: string;
  proAvatar: string;
  proPhone: string;
  clientName: string;
  clientPhone: string;
  createdAt: string;
  acceptedAt?: string;
  enRouteAt?: string;
  inProgressAt?: string;
  completedAt?: string;
  paidAt?: string;
  reviewedAt?: string;
  estimatedArrivalMinutes?: number;
  beforePhotos?: string[];
  afterPhotos?: string[];
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

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  photos: string[];
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

export type PaymentMethod = "orange_money" | "mtn_momo" | "wave";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  orange_money: "Orange Money",
  mtn_momo: "MTN MoMo",
  wave: "Wave",
};

export const PAYMENT_METHOD_COLORS: Record<PaymentMethod, string> = {
  orange_money: "#FF7900",
  mtn_momo: "#FFCC00",
  wave: "#1E90FF",
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

export interface ProDashboardData {
  todayEarningsXOF: number;
  weekEarningsXOF: number;
  monthEarningsXOF: number;
  totalMissions: number;
  activeMissions: number;
  satisfactionRate: number;
  rating: number;
  earningsChart: DashboardChartData;
  missionsChart: DashboardChartData;
  reviewsChart: DashboardChartData;
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
