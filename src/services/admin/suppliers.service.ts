import { supabase, isSupabaseReady } from "../supabase"
import type { SupplierProfile, SupplierApplication } from "../../types/supplier"
import { MOCK_SUPPLIERS, MOCK_APPLICATIONS, getMockSupplier } from "../../data/supplier-mocks"

function delay(ms = 300): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

export interface AdminSupplierRow {
  id: string
  companyName: string
  ownerName: string
  city: string
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  commissionRate: number
  status: string
  createdAt: string
}

export const SUPPLIER_STATUS_LABELS: Record<string, string> = {
  ACTIF: "Actif",
  BLOQUE: "Bloqué",
  REJETE: "Rejeté",
  EN_ATTENTE: "En attente",
  VERIFIE: "Vérifié",
}

export const SUPPLIER_STATUS_COLORS: Record<string, string> = {
  ACTIF: "bg-emerald-100 text-emerald-800",
  BLOQUE: "bg-red-100 text-red-800",
  REJETE: "bg-red-100 text-red-800",
  EN_ATTENTE: "bg-amber-100 text-amber-800",
  VERIFIE: "bg-blue-100 text-blue-800",
}

export function getSupplierStatusBadge(status: string): { label: string; status: string } {
  const label = SUPPLIER_STATUS_LABELS[status] ?? status
  const s = status === "ACTIF" || status === "VERIFIE" ? "active" : status === "EN_ATTENTE" ? "pending" : "in_progress"
  return { label, status: s }
}

export async function getAdminSuppliers(params: { status?: string; search?: string } = {}): Promise<AdminSupplierRow[]> {
  await delay()
  if (!isSupabaseReady()) {
    let result: AdminSupplierRow[] = MOCK_SUPPLIERS.map((s) => ({
      id: s.userId,
      companyName: s.companyName,
      ownerName: s.ownerName,
      city: s.city,
      totalProducts: s.totalProducts,
      totalOrders: s.totalOrders,
      totalRevenue: s.totalRevenue,
      commissionRate: s.commissionRate,
      status: s.status,
      createdAt: s.createdAt,
    }))
    if (params.status && params.status !== "all") result = result.filter((s) => s.status === params.status)
    if (params.search) {
      const q = params.search.toLowerCase()
      result = result.filter((s) => s.companyName.toLowerCase().includes(q) || s.ownerName.toLowerCase().includes(q))
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  let query = supabase.from("supplier_profiles" as never).select("*" as never)
  if (params.status && params.status !== "all") query = query.eq("status" as never, params.status)
  if (params.search) query = query.or(`company_name.ilike.%${params.search}%,owner_name.ilike.%${params.search}%` as never)
  const { data } = await query.order("created_at" as never, { ascending: false })
  if (!data) return []
  return (data as any[]).map((s: any) => ({
    id: s.user_id,
    companyName: s.company_name,
    ownerName: s.owner_name,
    city: s.city,
    totalProducts: s.total_products ?? 0,
    totalOrders: s.total_orders ?? 0,
    totalRevenue: s.total_revenue ?? 0,
    commissionRate: s.commission_rate ?? 10,
    status: s.status,
    createdAt: s.created_at,
  }))
}

export async function getAdminSupplierDetail(userId: string): Promise<SupplierProfile | null> {
  if (!isSupabaseReady()) return getMockSupplier(userId) ?? null

  const { data } = await supabase.from("supplier_profiles" as never).select("*" as never).eq("user_id" as never, userId).single()
  if (!data) return null
  const s = data as any
  return {
    userId: s.user_id,
    companyName: s.company_name,
    ownerName: s.owner_name,
    phone: s.phone,
    email: s.email ?? undefined,
    address: s.address ?? undefined,
    city: s.city,
    logoUrl: s.logo_url ?? undefined,
    photoUrl: s.photo_url ?? undefined,
    legalDocsUrls: s.legal_docs_urls ?? [],
    status: s.status,
    commissionRate: s.commission_rate ?? 10,
    rating: s.rating ?? 0,
    totalProducts: s.total_products ?? 0,
    totalOrders: s.total_orders ?? 0,
    totalRevenue: s.total_revenue ?? 0,
    reviewedBy: s.reviewed_by ?? undefined,
    reviewedAt: s.reviewed_at ?? undefined,
    rejectionReason: s.rejection_reason ?? undefined,
    isActive: s.is_active ?? false,
    createdAt: s.created_at,
    updatedAt: s.updated_at,
  }
}

export async function updateSupplierStatus(userId: string, status: string, reviewedBy: string, rejectionReason?: string): Promise<boolean> {
  if (!isSupabaseReady()) return true

  const update: Record<string, unknown> = { status, reviewed_by: reviewedBy, reviewed_at: new Date().toISOString() }
  if (rejectionReason !== undefined) update.rejection_reason = rejectionReason
  if (status === "ACTIF") update.is_active = true
  if (status === "BLOQUE" || status === "REJETE") update.is_active = false
  if (status === "VERIFIE") update.is_active = true

  const { error } = await supabase.from("supplier_profiles" as never).update(update as never).eq("user_id" as never, userId)
  return !error
}

export async function getAdminSupplierApplications(params: { status?: string; search?: string } = {}): Promise<SupplierApplication[]> {
  if (!isSupabaseReady()) {
    let result = [...MOCK_APPLICATIONS]
    if (params.status && params.status !== "all") result = result.filter((a) => a.status === params.status)
    if (params.search) {
      const q = params.search.toLowerCase()
      result = result.filter((a) => a.companyName.toLowerCase().includes(q) || a.ownerName.toLowerCase().includes(q))
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  let query = supabase.from("supplier_applications" as never).select("*" as never)
  if (params.status && params.status !== "all") query = query.eq("status" as never, params.status)
  if (params.search) query = query.or(`company_name.ilike.%${params.search}%,owner_name.ilike.%${params.search}%` as never)
  const { data } = await query.order("created_at" as never, { ascending: false })
  if (!data) return []
  return (data as any[]).map((a: any) => ({
    id: a.id,
    userId: a.user_id,
    companyName: a.company_name,
    ownerName: a.owner_name,
    phone: a.phone,
    email: a.email ?? undefined,
    address: a.address ?? undefined,
    city: a.city,
    legalDocsUrls: a.legal_docs_urls ?? [],
    photoUrl: a.photo_url ?? undefined,
    logoUrl: a.logo_url ?? undefined,
    deliveryCities: a.delivery_cities ?? [],
    status: a.status,
    reviewedBy: a.reviewed_by ?? undefined,
    reviewNotes: a.review_notes ?? undefined,
    reviewedAt: a.reviewed_at ?? undefined,
    createdAt: a.created_at,
    updatedAt: a.updated_at,
  }))
}

export async function approveSupplierApplication(applicationId: string, reviewedBy: string, reviewNotes?: string): Promise<boolean> {
  if (!isSupabaseReady()) return true

  const { data: app } = await supabase.from("supplier_applications" as never).select("*" as never).eq("id" as never, applicationId).single()
  if (!app) return false

  const { error: appError } = await supabase
    .from("supplier_applications" as never)
    .update({ status: "APPROVED", reviewed_by: reviewedBy, review_notes: reviewNotes, reviewed_at: new Date().toISOString() } as never)
    .eq("id" as never, applicationId)
  if (appError) return false

  const appData = app as any
  const profile = {
    user_id: appData.user_id,
    company_name: appData.company_name,
    owner_name: appData.owner_name,
    phone: appData.phone,
    email: appData.email,
    address: appData.address,
    city: appData.city,
    legal_docs_urls: appData.legal_docs_urls,
    photo_url: appData.photo_url,
    logo_url: appData.logo_url,
    status: "ACTIF",
    is_active: true,
    reviewed_by: reviewedBy,
    reviewed_at: new Date().toISOString(),
  } as never

  const { error: profileError } = await supabase.from("supplier_profiles" as never).insert(profile as never)
  if (profileError) return false

  return true
}

export async function rejectSupplierApplication(applicationId: string, reviewedBy: string, reason: string): Promise<boolean> {
  if (!isSupabaseReady()) return true

  const { error } = await supabase
    .from("supplier_applications" as never)
    .update({ status: "REJECTED", reviewed_by: reviewedBy, review_notes: reason, reviewed_at: new Date().toISOString() } as never)
    .eq("id" as never, applicationId)
  return !error
}
