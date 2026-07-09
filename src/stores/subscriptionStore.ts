import { create } from "zustand"
import type { Plan, Subscription, Payment, Invoice, Coupon, UsageRecord, BillingCycle, PaymentProvider } from "../types/subscription"
import { fetchPlans, fetchCurrentSubscription, createSubscription, changePlan, cancelSubscription, reactivateSubscription, fetchSubscriptionHistory, fetchUsage } from "../services/subscriptionService"
import { createPayment, fetchPaymentHistory } from "../services/paymentService"
import { fetchInvoices } from "../services/invoiceService"
import { validateCoupon } from "../services/couponService"

interface SubscriptionState {
  currentSubscription: Subscription | null
  availablePlans: Plan[]
  usage: UsageRecord[]
  paymentHistory: Payment[]
  invoices: Invoice[]
  subscriptionHistory: Subscription[]
  loading: boolean
  error: string | null

  fetchAll: (userId: string) => Promise<void>
  fetchCurrent: (userId: string) => Promise<void>
  fetchPlans: (type?: string) => Promise<void>
  createSubscription: (input: { user_id: string; plan_id: string; billing_cycle: BillingCycle; provider: PaymentProvider; coupon_code?: string }) => Promise<Subscription>
  changePlan: (input: { subscription_id: string; new_plan_id: string; billing_cycle?: BillingCycle }) => Promise<void>
  cancel: (subscriptionId: string) => Promise<void>
  reactivate: (subscriptionId: string) => Promise<void>
  fetchUsage: (userId: string) => Promise<void>
  fetchPaymentHistory: (userId: string) => Promise<void>
  fetchInvoices: (userId: string) => Promise<void>
  validateCoupon: (code: string, planType?: string) => Promise<{ valid: boolean; message?: string }>
  clearError: () => void
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  currentSubscription: null,
  availablePlans: [],
  usage: [],
  paymentHistory: [],
  invoices: [],
  subscriptionHistory: [],
  loading: false,
  error: null,

  fetchAll: async (userId: string) => {
    set({ loading: true, error: null })
    try {
      const [current, plans, usage, payments, invoices, history] = await Promise.all([
        fetchCurrentSubscription(userId),
        fetchPlans(),
        fetchUsage(userId),
        fetchPaymentHistory(userId),
        fetchInvoices(userId),
        fetchSubscriptionHistory(userId),
      ])
      set({ currentSubscription: current, availablePlans: plans, usage, paymentHistory: payments, invoices, subscriptionHistory: history })
    } catch (e) {
      set({ error: (e as Error).message })
    } finally {
      set({ loading: false })
    }
  },

  fetchCurrent: async (userId: string) => {
    set({ loading: true, error: null })
    try {
      const sub = await fetchCurrentSubscription(userId)
      set({ currentSubscription: sub })
    } catch (e) {
      set({ error: (e as Error).message })
    } finally {
      set({ loading: false })
    }
  },

  fetchPlans: async (type?: string) => {
    set({ loading: true, error: null })
    try {
      const plans = await (type ? fetchPlans(type) : fetchPlans())
      set({ availablePlans: plans })
    } catch (e) {
      set({ error: (e as Error).message })
    } finally {
      set({ loading: false })
    }
  },

  createSubscription: async (input) => {
    set({ loading: true, error: null })
    try {
      const sub = await createSubscription(input)
      set({ currentSubscription: sub })
      return sub
    } catch (e) {
      set({ error: (e as Error).message })
      throw e
    } finally {
      set({ loading: false })
    }
  },

  changePlan: async (input) => {
    set({ loading: true, error: null })
    try {
      const sub = await changePlan(input)
      set({ currentSubscription: sub })
    } catch (e) {
      set({ error: (e as Error).message })
      throw e
    } finally {
      set({ loading: false })
    }
  },

  cancel: async (subscriptionId: string) => {
    try {
      await cancelSubscription(subscriptionId)
      const sub = get().currentSubscription
      if (sub) set({ currentSubscription: { ...sub, status: "CANCELLED", auto_renew: false } })
    } catch (e) {
      set({ error: (e as Error).message })
    }
  },

  reactivate: async (subscriptionId: string) => {
    try {
      await reactivateSubscription(subscriptionId)
      const sub = get().currentSubscription
      if (sub) set({ currentSubscription: { ...sub, status: "ACTIVE", auto_renew: true } })
    } catch (e) {
      set({ error: (e as Error).message })
    }
  },

  fetchUsage: async (userId: string) => {
    try {
      const usage = await fetchUsage(userId)
      set({ usage })
    } catch (e) {
      set({ error: (e as Error).message })
    }
  },

  fetchPaymentHistory: async (userId: string) => {
    set({ loading: true, error: null })
    try {
      const payments = await fetchPaymentHistory(userId)
      set({ paymentHistory: payments })
    } catch (e) {
      set({ error: (e as Error).message })
    } finally {
      set({ loading: false })
    }
  },

  fetchInvoices: async (userId: string) => {
    set({ loading: true, error: null })
    try {
      const invoices = await fetchInvoices(userId)
      set({ invoices })
    } catch (e) {
      set({ error: (e as Error).message })
    } finally {
      set({ loading: false })
    }
  },

  validateCoupon: async (code, planType) => {
    try {
      const result = await validateCoupon(code, planType)
      return { valid: result.valid, message: result.message }
    } catch {
      return { valid: false, message: "Erreur lors de la validation du code" }
    }
  },

  clearError: () => set({ error: null }),
}))
