import { supabase, isSupabaseReady } from "../supabase"
import type { SupplierProfile, SupplierDashboardStats, SupplierApplication } from "../../types/supplier"
import { MOCK_SUPPLIERS, MOCK_APPLICATIONS, getMockSupplier, getMockSupplierStats } from "../../data/supplier-mocks"

function delay(ms = 300): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

export async function getSupplierProfile(userId: string): Promise<SupplierProfile | null> {
  await delay()
  if (!isSupabaseReady()) return getMockSupplier(userId) ?? null
  const { data } = await supabase.from("supplier_profiles" as never).select("*" as never).eq("user_id" as never, userId).single()
  if (!data) return null
  return mapProfile(data as any)
}

export async function getSupplierProfileByUserId(userId: string): Promise<SupplierProfile | null> {
  return getSupplierProfile(userId)
}

export async function updateSupplierProfile(userId: string, updates: Partial<SupplierProfile>): Promise<boolean> {
  await delay()
  if (!isSupabaseReady()) return true
  const db: Record<string, unknown> = {}
  if (updates.companyName !== undefined) db.company_name = updates.companyName
  if (updates.ownerName !== undefined) db.owner_name = updates.ownerName
  if (updates.phone !== undefined) db.phone = updates.phone
  if (updates.email !== undefined) db.email = updates.email
  if (updates.address !== undefined) db.address = updates.address
  if (updates.city !== undefined) db.city = updates.city
  if (updates.logoUrl !== undefined) db.logo_url = updates.logoUrl
  if (updates.photoUrl !== undefined) db.photo_url = updates.photoUrl
  const { error } = await supabase.from("supplier_profiles" as never).update(db as never).eq("user_id" as never, userId)
  return !error
}

export async function getSupplierDashboardStats(userId: string): Promise<SupplierDashboardStats> {
  await delay()
  if (!isSupabaseReady()) return getMockSupplierStats(userId)
  return { todayOrders: 0, todayRevenue: 0, activeProducts: 0, lowStockCount: 0, rating: 0, pendingOrders: 0, preparingOrders: 0, revenueChange: 0, ordersChange: 0 }
}

export async function getSupplierApplication(userId: string): Promise<SupplierApplication | null> {
  await delay()
  if (!isSupabaseReady()) return MOCK_APPLICATIONS.find((a) => a.userId === userId) ?? null
  const { data } = await supabase.from("supplier_applications" as never).select("*" as never).eq("user_id" as never, userId).single()
  if (!data) return null
  return mapApplication(data as any)
}

export async function createSupplierApplication(app: Omit<SupplierApplication, "id" | "status" | "createdAt" | "updatedAt">): Promise<string | null> {
  await delay()
  if (!isSupabaseReady()) return "mock-id"
  const db = {
    user_id: app.userId,
    company_name: app.companyName,
    owner_name: app.ownerName,
    phone: app.phone,
    email: app.email,
    address: app.address,
    city: app.city,
    legal_docs_urls: app.legalDocsUrls,
    photo_url: app.photoUrl,
    logo_url: app.logoUrl,
    delivery_cities: app.deliveryCities,
  }
  const { data, error } = await supabase.from("supplier_applications" as never).insert(db as never).select("id" as never).single()
  if (error) return null
  return (data as any)?.id ?? null
}

export async function getSupplierByUserId(userId: string): Promise<SupplierProfile | null> {
  return getSupplierProfile(userId)
}

function mapProfile(data: any): SupplierProfile {
  return {
    userId: data.user_id,
    companyName: data.company_name,
    ownerName: data.owner_name,
    phone: data.phone,
    email: data.email ?? undefined,
    address: data.address ?? undefined,
    city: data.city,
    logoUrl: data.logo_url ?? undefined,
    photoUrl: data.photo_url ?? undefined,
    legalDocsUrls: data.legal_docs_urls ?? [],
    status: data.status,
    commissionRate: data.commission_rate ?? 10,
    rating: data.rating ?? 0,
    totalProducts: data.total_products ?? 0,
    totalOrders: data.total_orders ?? 0,
    totalRevenue: data.total_revenue ?? 0,
    reviewedBy: data.reviewed_by ?? undefined,
    reviewedAt: data.reviewed_at ?? undefined,
    rejectionReason: data.rejection_reason ?? undefined,
    isActive: data.is_active ?? false,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

function mapApplication(data: any): SupplierApplication {
  return {
    id: data.id,
    userId: data.user_id,
    companyName: data.company_name,
    ownerName: data.owner_name,
    phone: data.phone,
    email: data.email ?? undefined,
    address: data.address ?? undefined,
    city: data.city,
    legalDocsUrls: data.legal_docs_urls ?? [],
    photoUrl: data.photo_url ?? undefined,
    logoUrl: data.logo_url ?? undefined,
    deliveryCities: data.delivery_cities ?? [],
    status: data.status,
    reviewedBy: data.reviewed_by ?? undefined,
    reviewNotes: data.review_notes ?? undefined,
    reviewedAt: data.reviewed_at ?? undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}
