import type { SupplierProfile, SupplierDashboardStats, SupplierApplication } from "../../types/supplier"
import { MOCK_SUPPLIERS, MOCK_APPLICATIONS, getMockSupplier, getMockSupplierStats } from "../../data/supplier-mocks"

function delay(ms = 300): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

export async function getSupplierProfile(userId: string): Promise<SupplierProfile | null> {
  await delay()
  return getMockSupplier(userId) ?? null
}

export async function getSupplierProfileByUserId(userId: string): Promise<SupplierProfile | null> {
  return getSupplierProfile(userId)
}

export async function updateSupplierProfile(userId: string, updates: Partial<SupplierProfile>): Promise<boolean> {
  await delay()
  return true
}

export async function getSupplierDashboardStats(userId: string): Promise<SupplierDashboardStats> {
  await delay()
  return getMockSupplierStats(userId)
}

export async function getSupplierApplication(userId: string): Promise<SupplierApplication | null> {
  await delay()
  return MOCK_APPLICATIONS.find((a) => a.userId === userId) ?? null
}

export async function createSupplierApplication(app: Omit<SupplierApplication, "id" | "status" | "createdAt" | "updatedAt">): Promise<string | null> {
  await delay()
  return "mock-id"
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
