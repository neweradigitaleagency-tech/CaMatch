import type { TransactionStatus, UnifiedPaymentMethod } from './payment'

export type PlanType = "CLIENT" | "PRO" | "BUSINESS"
export type BillingCycle = "monthly" | "yearly"
export type SubscriptionStatus = "TRIAL" | "ACTIVE" | "PAST_DUE" | "CANCELLED" | "EXPIRED" | "FAILED"
/** @deprecated Import { UnifiedPaymentMethod } from '@/types/payment' */
export type PaymentProvider = UnifiedPaymentMethod
export type CouponType = "percentage" | "fixed" | "free_month"
export type BoostType = "search_top" | "category_top" | "featured"
export type CreditTransactionType = "purchase" | "spend" | "refund" | "bonus" | "expired"
/** @deprecated Import { TransactionStatus } from '@/types/payment' */
export type PaymentStatus = TransactionStatus

export interface Plan {
  id: string
  name: string
  type: PlanType
  description: string | null
  price_monthly: number
  price_yearly: number
  currency: string
  active: boolean
  display_order: number
  badge: string | null
  recommended: boolean
  trial_days: number
  features?: PlanFeature[]
  created_at: string
}

export interface Feature {
  id: string
  name: string
  description: string | null
  code: string
}

export interface PlanFeature {
  id: string
  plan_id: string
  feature_id: string
  enabled: boolean
  limit_value: number | null
  feature?: Feature
}

export interface Subscription {
  id: string
  user_id: string
  plan_id: string | null
  tier: string
  status: SubscriptionStatus
  billing_cycle: BillingCycle
  current_period_start: string
  current_period_end: string
  price_monthly: number
  trial_end: string | null
  canceled_at: string | null
  auto_renew: boolean
  payment_method: string | null
  provider_subscription_id: string | null
  provider_customer_id: string | null
  coupon_id: string | null
  plan?: Plan
  created_at: string
}

export interface Payment {
  id: string
  user_id: string
  subscription_id: string | null
  provider: PaymentProvider
  provider_transaction_id: string | null
  amount: number
  currency: string
  status: PaymentStatus
  provider_response: Record<string, unknown> | null
  metadata: Record<string, unknown> | null
  invoice?: Invoice
  created_at: string
}

export interface Invoice {
  id: string
  payment_id: string
  user_id: string
  invoice_number: string
  pdf_url: string | null
  amount: number
  tax: number
  total: number
  status: "pending" | "paid" | "overdue" | "cancelled" | "refunded"
  due_date: string | null
  paid_at: string | null
  created_at: string
}

export interface Coupon {
  id: string
  code: string
  type: CouponType
  value: number
  max_usage: number | null
  current_usage: number
  min_plan_type: PlanType | null
  expires_at: string | null
  is_active: boolean
  created_at: string
}

export interface UsageRecord {
  id: string
  user_id: string
  feature_code: string
  usage: number
  limit_value: number | null
  reset_date: string
  created_at: string
}

export interface Boost {
  id: string
  user_id: string
  boost_type: BoostType
  duration_days: number
  amount_paid: number
  starts_at: string
  ends_at: string
  is_active: boolean
  payment_id: string | null
  created_at: string
}

export interface Credit {
  id: string
  user_id: string
  balance: number
  lifetime_earned: number
  lifetime_spent: number
}

export interface CreditTransaction {
  id: string
  user_id: string
  type: CreditTransactionType
  amount: number
  balance_after: number
  reference_type: string | null
  reference_id: string | null
  description: string | null
  created_at: string
}

export interface CreateSubscriptionInput {
  plan_id: string
  billing_cycle: BillingCycle
  coupon_code?: string
  provider: PaymentProvider
}

export interface ChangePlanInput {
  subscription_id: string
  new_plan_id: string
  billing_cycle?: BillingCycle
}

export interface PaymentInput {
  subscription_id: string
  provider: PaymentProvider
  amount: number
  coupon_code?: string
}

export interface CouponValidation {
  valid: boolean
  coupon?: Coupon
  discount_amount?: number
  message?: string
}
