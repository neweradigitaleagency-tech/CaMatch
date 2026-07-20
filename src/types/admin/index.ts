export interface AdminUser {
  id: string
  email: string
  firstname: string
  lastname: string
  avatar_url?: string
  department?: string
  job_title?: string
  phone?: string
  status: "active" | "suspended" | "disabled"
  is_active: boolean
  last_login?: string
  created_at: string
  roles: AdminRole[]
  permissions: string[]
}

export interface AdminRole {
  id: string
  name: string
  description?: string
  permissions: Record<string, boolean>
  is_system: boolean
}

export interface AdminLogEntry {
  id: string
  admin_id: string
  action: string
  entity?: string
  entity_id?: string
  target_type?: string
  target_id?: string
  details?: Record<string, unknown>
  old_value?: Record<string, unknown>
  new_value?: Record<string, unknown>
  ip_address?: string
  user_agent?: string
  created_at: string
  admin?: { firstname: string; lastname: string }
}

export interface DashboardStats {
  today: {
    total_clients: number
    total_pros: number
    verified_pros: number
    missions_today: number
    missions_in_progress: number
    missions_completed: number
    revenue_today: number
    platform_revenue: number
    success_rate: number
    avg_response_time: number
  }
  trends: {
    users: { value: number; change: number }
    pros: { value: number; change: number }
    revenue: { value: number; change: number }
    missions: { value: number; change: number }
  }
  charts: {
    registrations: { date: string; clients: number; pros: number }[]
    revenue: { date: string; amount: number }[]
    missions_by_category: { category: string; count: number }[]
    cities: { city: string; count: number }[]
  }
  activity: {
    id: string
    time: string
    type: "new_pro" | "new_client" | "new_mission" | "new_payment" | "new_report"
    description: string
    user_name?: string
  }[]
  alerts: {
    type: "verification" | "payment" | "ticket" | "report"
    count: number
    label: string
    severity: "high" | "medium" | "low"
    link: string
  }[]
}

export interface UserProfile {
  id: string
  email: string
  phone_number: string
  role: string
  is_active: boolean
  is_verified: boolean
  phone_verified: boolean
  email_verified: boolean
  verified_at?: string
  created_at: string
  last_login_at?: string
  deleted_at?: string
  client_profile?: {
    first_name: string
    last_name: string
    avatar_url?: string
    city?: string
    commune?: string
    default_address?: string
    total_jobs: number
    total_spent: number
    loyalty_points: number
    preferred_payment_method?: string
  }
  professional_profile?: {
    business_name?: string
    first_name: string
    last_name: string
    category: string
    category_id?: string
    city?: string
    commune?: string
    verification_level: string
    rating: number
    total_jobs: number
    total_earned: number
    wallet_balance: number
    is_verified: boolean
    is_available: boolean
    is_online: boolean
    acceptance_rate?: number
    response_time_avg?: number
    cancellation_rate?: number
    hourly_rate: number
    badges?: ProfessionalBadge[]
  }
}

export interface ProfessionalBadge {
  id: string
  badge_id: string
  name: string
  slug: string
  icon?: string
  color?: string
  granted_at: string
}

export interface SupportTicket {
  id: string
  ticket_number: string
  client_id: string
  client_name: string
  client_email: string
  subject: string
  description: string
  category: "bug" | "account" | "payment" | "premium" | "verification" | "other"
  priority: "low" | "normal" | "high" | "urgent"
  status: string
  assigned_to?: string
  assigned_name?: string
  first_response_at?: string
  resolved_at?: string
  message_count: number
  created_at: string
  updated_at: string
}

export interface TicketMessage {
  id: string
  ticket_id: string
  sender_id: string
  sender_name: string
  sender_avatar?: string
  content: string
  file_urls?: string[]
  is_internal_note: boolean
  created_at: string
}

export interface Transaction {
  id: string
  type: "payment" | "payout" | "refund" | "fee"
  status: string
  amount: number
  fee: number
  net_amount: number
  description: string
  mission_id?: string
  client_id?: string
  client_name?: string
  professional_id?: string
  pro_name?: string
  payment_method: string
  created_at: string
  completed_at?: string
}

export interface Payout {
  id: string
  payee_id: string
  payee_name: string
  amount: number
  method: string
  status: string
  provider_reference?: string
  hold_until?: string
  created_at: string
}

export interface Report {
  id: string
  reporter_id: string
  reporter_name: string
  reported_id: string
  reported_name: string
  reason: string
  description?: string
  evidence_urls?: string[]
  status: string
  reviewed_by?: string
  resolution?: string
  priority: "low" | "normal" | "high" | "urgent"
  created_at: string
}

export interface AdminNotification {
  id: string
  type: "info" | "warning" | "promotion" | "system"
  channel: "push" | "email" | "sms" | "whatsapp"
  title: string
  content: string
  target: "all" | "clients" | "professionals" | "premium" | "specific"
  target_users?: number
  sent_count: number
  failed_count: number
  open_rate?: number
  click_rate?: number
  status: "sent" | "pending" | "failed" | "scheduled"
  image_url?: string
  link_url?: string
  scheduled_at?: string
  sent_at?: string
  created_at: string
  created_by?: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  color?: string
  parent_id?: string
  sort_order: number
  is_active: boolean
  children?: Category[]
}

export interface MissionTimelineEvent {
  id: string
  mission_id: string
  event: string
  description?: string
  old_status?: string
  new_status?: string
  created_by?: string
  created_at: string
}

export interface PlatformSetting {
  id: string
  key: string
  value: string
  description?: string
  type: "text" | "number" | "boolean" | "json" | "email" | "url" | "image"
  category: string
  is_encrypted: boolean
}

export interface FeatureFlag {
  id: string
  key: string
  label: string
  description?: string
  enabled: boolean
  category: string
}

export interface Badge {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  color?: string
  criteria?: string
  is_active: boolean
}

export interface Promotion {
  id: string
  code: string
  type: "percentage" | "fixed" | "free_shipping" | "waiver"
  value: number
  min_order_amount: number
  max_discount?: number
  max_uses?: number
  current_uses: number
  target: string
  starts_at: string
  expires_at?: string
  is_active: boolean
  description?: string
  created_by?: string
}

export interface CMSPage {
  id: string
  slug: string
  title: string
  content: string
  meta_title?: string
  meta_description?: string
  status: string
  published_at?: string
}

export interface AnalyticsData {
  users: { total: number; active: number; new: number; growth: number }
  pros: { total: number; verified: number; available: number; growth: number }
  missions: { total: number; completed: number; in_progress: number; avg_value: number }
  revenue: { total: number; platform_fees: number; pending_payouts: number; growth: number }
  charts: {
    users_over_time: { date: string; value: number }[]
    revenue_over_time: { date: string; amount: number }[]
    missions_by_status: { status: string; count: number }[]
    top_categories: { category: string; count: number; revenue: number }[]
    pro_growth: { date: string; clients: number; pros: number }[]
  }
  retention?: { period: string; rate: number }[]
  ltv?: { cohort: string; value: number }[]
  cac?: { period: string; cost: number }[]
}

export type Permission =
  | "all"
  | "users.read" | "users.create" | "users.update" | "users.delete" | "users.suspend" | "users.ban"
  | "pros.read" | "pros.create" | "pros.update" | "pros.delete" | "pros.verify"
  | "missions.read" | "missions.update" | "missions.cancel"
  | "payments.read" | "payments.refund" | "payouts.read" | "payouts.approve"
  | "transactions.read"
  | "support.read" | "support.reply" | "support.close"
  | "reports.read" | "reports.resolve" | "reports.dismiss"
  | "verifications.read" | "verifications.approve" | "verifications.reject" | "verifications.request_change"
  | "notifications.read" | "notifications.send"
  | "analytics.read" | "analytics.export"
  | "settings.read" | "settings.update"
  | "logs.read"
  | "admins.create" | "admins.update" | "admins.delete"
  | "roles.read" | "roles.update"
  | "reviews.moderate"
  | "categories.read" | "categories.create" | "categories.update" | "categories.delete"
  | "promotions.read" | "promotions.create" | "promotions.update" | "promotions.delete"
  | "cms.read" | "cms.create" | "cms.update" | "cms.delete"
  | "fraud.read" | "fraud.resolve"
  | "applications.read" | "applications.review"
  | "subscription.read" | "subscription.manage"
  | "plan.create" | "plan.update" | "plan.delete"
  | "coupon.manage"
  | "refund.manage"
  | "feature_flags.read" | "feature_flags.manage"
  | "suppliers.read" | "suppliers.validate" | "suppliers.suspend"
  | "disputes.read" | "disputes.resolve"
  | "deliveries.read" | "deliveries.manage"
