import { supabase, isSupabaseReady } from "./supabase"
import type {
  Plan, Feature, PlanFeature, Subscription, Payment, Invoice,
  Coupon, UsageRecord, CreateSubscriptionInput, ChangePlanInput, CouponValidation,
} from "../types/subscription"
import { format, addMonths, addDays, isBefore } from "date-fns"

const MOCK_PLANS: Plan[] = [
  { id: "plan_client_free", name: "Free", type: "CLIENT", description: "Accès de base à la plateforme", price_monthly: 0, price_yearly: 0, currency: "XOF", active: true, display_order: 1, badge: null, recommended: false, trial_days: 0, created_at: new Date().toISOString() },
  { id: "plan_client_plus", name: "Plus", type: "CLIENT", description: "Pour les clients réguliers", price_monthly: 4900, price_yearly: 49000, currency: "XOF", active: true, display_order: 2, badge: "POPULAIRE", recommended: true, trial_days: 7, created_at: new Date().toISOString() },
  { id: "plan_client_premium", name: "Premium", type: "CLIENT", description: "Expérience VIP complète", price_monthly: 14900, price_yearly: 149000, currency: "XOF", active: true, display_order: 3, badge: "PREMIUM", recommended: false, trial_days: 7, created_at: new Date().toISOString() },
  { id: "plan_pro_free", name: "Free", type: "PRO", description: "Pour démarrer", price_monthly: 0, price_yearly: 0, currency: "XOF", active: true, display_order: 1, badge: null, recommended: false, trial_days: 0, created_at: new Date().toISOString() },
  { id: "plan_pro_starter", name: "Starter", type: "PRO", description: "Pour les pros en croissance", price_monthly: 9900, price_yearly: 99000, currency: "XOF", active: true, display_order: 2, badge: "POPULAIRE", recommended: true, trial_days: 14, created_at: new Date().toISOString() },
  { id: "plan_pro_business", name: "Business", type: "PRO", description: "Pour les pros établis", price_monthly: 24900, price_yearly: 249000, currency: "XOF", active: true, display_order: 3, badge: "RECOMMANDÉ", recommended: false, trial_days: 14, created_at: new Date().toISOString() },
  { id: "plan_pro_premium", name: "Premium", type: "PRO", description: "Pour les pros au top", price_monthly: 49900, price_yearly: 499000, currency: "XOF", active: true, display_order: 4, badge: "PREMIUM", recommended: false, trial_days: 14, created_at: new Date().toISOString() },
]

const MOCK_FEATURES: Record<string, Feature> = {
  search_pros: { id: "f1", name: "Recherche professionnels", description: "Accéder à l'annuaire des professionnels", code: "search_pros" },
  create_requests: { id: "f2", name: "Création demandes", description: "Publier des demandes de service", code: "create_requests" },
  booking: { id: "f3", name: "Réservation", description: "Réserver un professionnel", code: "booking" },
  unlimited_messages: { id: "f4", name: "Messagerie illimitée", description: "Messagerie sans limite", code: "unlimited_messages" },
  reviews: { id: "f5", name: "Avis et notation", description: "Noter les professionnels", code: "reviews" },
  priority_matching: { id: "f6", name: "Matching prioritaire", description: "Être matché en priorité avec les meilleurs pros", code: "priority_matching" },
  concurrent_requests: { id: "f7", name: "Demandes simultanées", description: "Nombre de demandes actives simultanément", code: "concurrent_requests" },
  unlimited_favorites: { id: "f8", name: "Favoris illimités", description: "Sauvegarder des pros en favoris sans limite", code: "unlimited_favorites" },
  full_history: { id: "f9", name: "Historique complet", description: "Accès à tout l'historique des missions", code: "full_history" },
  priority_support: { id: "f10", name: "Support prioritaire", description: "Support client prioritaire", code: "priority_support" },
  verified_badge: { id: "f11", name: "Badge client vérifié", description: "Badge de confiance sur le profil", code: "verified_badge" },
  ai_matching: { id: "f12", name: "Matching IA avancé", description: "Algorithme IA pour trouver le meilleur pro", code: "ai_matching" },
  concierge: { id: "f13", name: "Concierge", description: "Assistance personnelle pour vos demandes", code: "concierge" },
  exclusive_offers: { id: "f14", name: "Offres exclusives", description: "Accès à des offres et promotions exclusives", code: "exclusive_offers" },
  vip_support: { id: "f15", name: "Support VIP", description: "Support dédié 24/7", code: "vip_support" },
  pro_profile: { id: "f16", name: "Création profil pro", description: "Créer et gérer son profil professionnel", code: "pro_profile" },
  manage_services: { id: "f17", name: "Ajout services", description: "Configurer ses services et tarifs", code: "manage_services" },
  portfolio: { id: "f18", name: "Portfolio", description: "Galerie de réalisations", code: "portfolio" },
  job_applications: { id: "f19", name: "Candidatures missions", description: "Postuler aux demandes des clients", code: "job_applications" },
  pro_badge: { id: "f20", name: "Badge professionnel", description: "Badge vérifié sur le profil", code: "pro_badge" },
  basic_stats: { id: "f21", name: "Statistiques basiques", description: "Voir les stats de base", code: "basic_stats" },
  advanced_analytics: { id: "f22", name: "Analytics avancées", description: "Statistiques détaillées et rapports", code: "advanced_analytics" },
  auto_boost: { id: "f23", name: "Boost automatique", description: "Visibilité boostée automatiquement", code: "auto_boost" },
  calendar_management: { id: "f24", name: "Gestion calendrier", description: "Planning et disponibilités", code: "calendar_management" },
  client_management: { id: "f25", name: "Gestion clients", description: "CRM clients intégré", code: "client_management" },
  auto_reply: { id: "f26", name: "Réponses automatiques", description: "Messages automatiques personnalisables", code: "auto_reply" },
  top_ranking: { id: "f27", name: "Top classement", description: "Première position dans les recherches", code: "top_ranking" },
  premium_badge: { id: "f28", name: "Badge Premium", description: "Badge exclusif Premium", code: "premium_badge" },
  exclusive_leads: { id: "f29", name: "Leads exclusifs", description: "Accès aux leads clients premium", code: "exclusive_leads" },
  featured_profile: { id: "f30", name: "Page recommandée", description: "Profil mis en avant par la plateforme", code: "featured_profile" },
  ai_profile_optimization: { id: "f31", name: "IA optimisation profil", description: "Suggestions IA pour optimiser le profil", code: "ai_profile_optimization" },
  internal_ads: { id: "f32", name: "Publicité interne", description: "Campagnes pub sur la plateforme", code: "internal_ads" },
  enhanced_profile: { id: "f33", name: "Profil amélioré", description: "Profil enrichi avec plus d'infos", code: "enhanced_profile" },
}

const CLIENT_FREE_FEATURES = ["search_pros", "create_requests", "booking", "reviews", "concurrent_requests"]
const CLIENT_PLUS_FEATURES = ["search_pros", "create_requests", "booking", "reviews", "priority_matching", "unlimited_messages", "unlimited_favorites", "full_history", "priority_support", "verified_badge", "concurrent_requests"]
const CLIENT_PREMIUM_FEATURES = ["search_pros", "create_requests", "booking", "reviews", "priority_matching", "unlimited_messages", "unlimited_favorites", "full_history", "priority_support", "verified_badge", "ai_matching", "concierge", "exclusive_offers", "vip_support", "concurrent_requests"]

const PRO_FREE_FEATURES = ["pro_profile", "manage_services", "basic_stats", "portfolio", "job_applications"]
const PRO_STARTER_FEATURES = ["pro_profile", "manage_services", "portfolio", "pro_badge", "basic_stats", "enhanced_profile", "job_applications"]
const PRO_BUSINESS_FEATURES = ["pro_profile", "manage_services", "portfolio", "pro_badge", "basic_stats", "advanced_analytics", "auto_boost", "calendar_management", "client_management", "auto_reply", "enhanced_profile", "job_applications"]
const PRO_PREMIUM_FEATURES = [
  "pro_profile", "manage_services", "portfolio", "pro_badge", "basic_stats",
  "advanced_analytics", "auto_boost", "calendar_management", "client_management",
  "auto_reply", "top_ranking", "premium_badge", "exclusive_leads", "featured_profile",
  "ai_profile_optimization", "internal_ads", "unlimited_messages", "enhanced_profile", "job_applications",
]

function getPlanFeatures(planId: string): PlanFeature[] {
  const featureCodes: Record<string, { codes: string[]; limits?: Record<string, number> }> = {
    plan_client_free: { codes: CLIENT_FREE_FEATURES, limits: { concurrent_requests: 5 } },
    plan_client_plus: { codes: CLIENT_PLUS_FEATURES, limits: { concurrent_requests: 20 } },
    plan_client_premium: { codes: CLIENT_PREMIUM_FEATURES, limits: { concurrent_requests: 50 } },
    plan_pro_free: { codes: PRO_FREE_FEATURES, limits: { portfolio: 5, job_applications: 5 } },
    plan_pro_starter: { codes: PRO_STARTER_FEATURES, limits: { portfolio: 50, job_applications: 30 } },
    plan_pro_business: { codes: PRO_BUSINESS_FEATURES, limits: { job_applications: 100 } },
    plan_pro_premium: { codes: PRO_PREMIUM_FEATURES, limits: { job_applications: -1 } },
  }
  const config = featureCodes[planId]
  if (!config) return []
  return config.codes.map((code) => ({
    id: `${planId}_${code}`,
    plan_id: planId,
    feature_id: MOCK_FEATURES[code]?.id ?? code,
    enabled: true,
    limit_value: config.limits?.[code] ?? null,
    feature: MOCK_FEATURES[code],
  }))
}

function enrichPlans(plans: Plan[]): Plan[] {
  return plans.map((p) => ({ ...p, features: getPlanFeatures(p.id) }))
}

function getPlanByNameType(name: string, type: string): Plan | undefined {
  return MOCK_PLANS.find((p) => p.name === name && p.type === type)
}

export function getPlans(type?: string): Plan[] {
  const plans = type ? MOCK_PLANS.filter((p) => p.type === type && p.active) : MOCK_PLANS.filter((p) => p.active)
  return enrichPlans(plans)
}

export async function fetchPlans(type?: string): Promise<Plan[]> {
  if (!isSupabaseReady()) return getPlans(type)
  try {
    const { data, error } = await (supabase!
      .from("plans" as never)
      .select("*, plan_features(feature:features(*), enabled, limit_value)")
      .eq("active" as never, true)
      .order("display_order" as never) as any)
    if (error) throw error
    return (data ?? []).map((p: any) => ({
      ...p,
      features: (p.plan_features ?? []).map((pf: any) => ({
        id: pf.id,
        plan_id: p.id,
        feature_id: pf.feature?.id ?? "",
        enabled: pf.enabled,
        limit_value: pf.limit_value,
        feature: pf.feature,
      })),
    }))
  } catch {
    return getPlans(type)
  }
}

function getFreeSubscription(userId: string): Subscription | null {
  const plan = getPlanByNameType("Free", "CLIENT")
  if (!plan) return null
  return {
    id: "sub_mock",
    user_id: userId,
    plan_id: plan.id,
    tier: "free",
    status: "ACTIVE",
    billing_cycle: "monthly",
    current_period_start: new Date().toISOString(),
    current_period_end: addMonths(new Date(), 1).toISOString(),
    price_monthly: 0,
    trial_end: null,
    canceled_at: null,
    auto_renew: true,
    payment_method: null,
    provider_subscription_id: null,
    provider_customer_id: null,
    coupon_id: null,
    plan: { ...plan, features: getPlanFeatures(plan.id) },
    created_at: new Date().toISOString(),
  }
}

export async function fetchCurrentSubscription(userId: string): Promise<Subscription | null> {
  if (!isSupabaseReady()) return getFreeSubscription(userId)
  try {
    const { data, error } = await (supabase!
      .from("subscriptions" as never)
      .select("*, plan:plans(*)")
      .eq("user_id" as never, userId)
      .in("status" as never, ["TRIAL", "ACTIVE", "PAST_DUE"])
      .order("created_at" as never, { ascending: false })
      .limit(1)
      .single() as any)
    if (error && error.code !== "PGRST116") throw error
    return data as Subscription | null
  } catch {
    return getFreeSubscription(userId)
  }
}

function mockCreateSubscription(input: CreateSubscriptionInput & { user_id: string }): Subscription {
  const plan = MOCK_PLANS.find((p) => p.id === input.plan_id)
  if (!plan) throw new Error("Plan not found")
  const now = new Date()
  const isTrial = plan.trial_days > 0
  return {
    id: `sub_${Date.now()}`,
    user_id: input.user_id,
    plan_id: plan.id,
    tier: plan.name.toLowerCase(),
    status: isTrial ? "TRIAL" : "ACTIVE",
    billing_cycle: input.billing_cycle,
    current_period_start: now.toISOString(),
    current_period_end: (isTrial ? addDays(now, plan.trial_days) : addMonths(now, 1)).toISOString(),
    price_monthly: input.billing_cycle === "yearly" ? plan.price_yearly : plan.price_monthly,
    trial_end: isTrial ? addDays(now, plan.trial_days).toISOString() : null,
    canceled_at: null,
    auto_renew: true,
    payment_method: input.provider,
    provider_subscription_id: null,
    provider_customer_id: null,
    coupon_id: null,
    plan: { ...plan, features: getPlanFeatures(plan.id) },
    created_at: now.toISOString(),
  }
}

export async function createSubscription(input: CreateSubscriptionInput & { user_id: string }): Promise<Subscription> {
  if (!isSupabaseReady()) return mockCreateSubscription(input)
  try {
    const { data, error } = await supabase!
      .from("subscriptions")
      .insert({
        user_id: input.user_id,
        plan_id: input.plan_id,
        tier: "active",
        status: "ACTIVE",
        current_period_start: new Date().toISOString(),
        current_period_end: addMonths(new Date(), 1).toISOString(),
        price_monthly: 0,
      } as never)
      .select("*, plan:plans(*)")
      .single() as any
    if (error) throw error
    return data as unknown as Subscription
  } catch {
    return mockCreateSubscription(input)
  }
}

function mockChangePlan(input: ChangePlanInput): Subscription {
  const plan = MOCK_PLANS.find((p) => p.id === input.new_plan_id)
  if (!plan) throw new Error("Plan not found")
  return {
    id: input.subscription_id,
    user_id: "mock_user",
    plan_id: plan.id,
    tier: plan.name.toLowerCase(),
    status: "ACTIVE",
    billing_cycle: input.billing_cycle ?? "monthly",
    current_period_start: new Date().toISOString(),
    current_period_end: addMonths(new Date(), 1).toISOString(),
    price_monthly: input.billing_cycle === "yearly" ? plan.price_yearly : plan.price_monthly,
    trial_end: null,
    canceled_at: null,
    auto_renew: true,
    payment_method: null,
    provider_subscription_id: null,
    provider_customer_id: null,
    coupon_id: null,
    plan: { ...plan, features: getPlanFeatures(plan.id) },
    created_at: new Date().toISOString(),
  }
}

export async function changePlan(input: ChangePlanInput): Promise<Subscription> {
  if (!isSupabaseReady()) return mockChangePlan(input)
  try {
    const { data, error } = await (supabase!
      .from("subscriptions" as never)
      .update({
        plan_id: input.new_plan_id,
        tier: "active",
        updated_at: new Date().toISOString(),
      } as never)
      .eq("id" as never, input.subscription_id)
      .select("*, plan:plans(*)")
      .single() as any)
    if (error) throw error
    return data as unknown as Subscription
  } catch {
    return mockChangePlan(input)
  }
}

export async function cancelSubscription(subscriptionId: string): Promise<void> {
  if (!isSupabaseReady()) return
  try {
    const { error } = await (supabase!
      .from("subscriptions" as never)
      .update({
        status: "CANCELLED",
        canceled_at: new Date().toISOString(),
        auto_renew: false,
        updated_at: new Date().toISOString(),
      } as never)
      .eq("id" as never, subscriptionId) as any)
    if (error) throw error
  } catch {}
}

export async function reactivateSubscription(subscriptionId: string): Promise<void> {
  if (!isSupabaseReady()) return
  try {
    const { error } = await (supabase!
      .from("subscriptions" as never)
      .update({
        status: "ACTIVE",
        canceled_at: null,
        auto_renew: true,
        updated_at: new Date().toISOString(),
      } as never)
      .eq("id" as never, subscriptionId) as any)
    if (error) throw error
  } catch {}
}

export async function fetchSubscriptionHistory(userId: string): Promise<Subscription[]> {
  if (!isSupabaseReady()) return []
  try {
    const { data, error } = await (supabase!
      .from("subscriptions" as never)
      .select("*, plan:plans(*)")
      .eq("user_id" as never, userId)
      .order("created_at" as never, { ascending: false }) as any)
    if (error) throw error
    return (data ?? []) as unknown as Subscription[]
  } catch {
    return []
  }
}

export async function checkSubscriptionStatus(userId: string): Promise<{
  active: boolean
  subscription: Subscription | null
  daysRemaining: number
}> {
  const sub = await fetchCurrentSubscription(userId)
  if (!sub) return { active: false, subscription: null, daysRemaining: 0 }
  const end = new Date(sub.current_period_end)
  const now = new Date()
  const daysRemaining = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
  const active = sub.status === "ACTIVE" || sub.status === "TRIAL"
  return { active, subscription: sub, daysRemaining }
}

export async function fetchFeatures(): Promise<Feature[]> {
  if (!isSupabaseReady()) return Object.values(MOCK_FEATURES)
  try {
    const { data, error } = await (supabase!.from("features" as never).select("*") as any)
    if (error) throw error
    return (data ?? []) as Feature[]
  } catch {
    return Object.values(MOCK_FEATURES)
  }
}

function mockValidateCoupon(code: string): CouponValidation {
  if (code.toUpperCase() === "WELCOME20") {
    return {
      valid: true,
      coupon: { id: "c1", code: "WELCOME20", type: "percentage", value: 20, max_usage: 100, current_usage: 5, min_plan_type: null, expires_at: addMonths(new Date(), 3).toISOString(), is_active: true, created_at: new Date().toISOString() },
      discount_amount: 20,
      message: "Réduction de 20% appliquée",
    }
  }
  if (code.toUpperCase() === "FREE100") {
    return {
      valid: true,
      coupon: { id: "c2", code: "FREE100", type: "fixed", value: 10000, max_usage: 50, current_usage: 10, min_plan_type: null, expires_at: addMonths(new Date(), 1).toISOString(), is_active: true, created_at: new Date().toISOString() },
      discount_amount: 10000,
      message: "10 000 F CFA de réduction appliquée",
    }
  }
  return { valid: false, message: "Code promo invalide ou expiré" }
}

export async function validateCoupon(code: string, planType?: string): Promise<CouponValidation> {
  if (!isSupabaseReady()) return mockValidateCoupon(code)
  try {
    const { data, error } = await (supabase!
      .from("coupons" as never)
      .select("*")
      .eq("code" as never, code.toUpperCase())
      .eq("is_active" as never, true)
      .maybeSingle() as any)
    if (error) throw error
    if (!data) return { valid: false, message: "Code promo invalide" }
    const coupon = data as Coupon
    if (coupon.expires_at && isBefore(new Date(coupon.expires_at), new Date())) {
      return { valid: false, message: "Ce code promo a expiré" }
    }
    if (coupon.max_usage && coupon.current_usage >= coupon.max_usage) {
      return { valid: false, message: "Ce code promo a atteint sa limite d'utilisation" }
    }
    if (coupon.min_plan_type && planType && coupon.min_plan_type !== planType) {
      return { valid: false, message: `Ce code n'est pas valide pour ce type de plan` }
    }
    return {
      valid: true,
      coupon,
      discount_amount: coupon.type === "percentage" ? coupon.value : coupon.value,
      message: coupon.type === "percentage"
        ? `Réduction de ${coupon.value}% appliquée`
        : `${coupon.value.toLocaleString("fr-FR")} F CFA de réduction appliquée`,
    }
  } catch {
    return mockValidateCoupon(code)
  }
}

function mockFetchUsage(userId: string): UsageRecord[] {
  return [
    { id: "u1", user_id: userId, feature_code: "concurrent_requests", usage: 2, limit_value: 5, reset_date: addMonths(new Date(), 1).toISOString(), created_at: new Date().toISOString() },
    { id: "u2", user_id: userId, feature_code: "portfolio", usage: 3, limit_value: 5, reset_date: addMonths(new Date(), 1).toISOString(), created_at: new Date().toISOString() },
    { id: "u3", user_id: userId, feature_code: "job_applications", usage: 8, limit_value: 30, reset_date: addMonths(new Date(), 1).toISOString(), created_at: new Date().toISOString() },
  ]
}

export async function fetchUsage(userId: string): Promise<UsageRecord[]> {
  if (!isSupabaseReady()) return mockFetchUsage(userId)
  try {
    const { data, error } = await (supabase!
      .from("usage_tracking" as never)
      .select("*")
      .eq("user_id" as never, userId) as any)
    if (error) throw error
    return (data ?? []) as UsageRecord[]
  } catch {
    return mockFetchUsage(userId)
  }
}
