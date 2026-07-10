import { supabase, isSupabaseReady } from "../supabase"
import type { SupplierProduct } from "../../types/supplier"
import { MOCK_PRODUCTS, MOCK_SUPPLIERS } from "../../data/supplier-mocks"

function delay(ms = 300): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

export async function searchCatalog(params: { query?: string; categoryId?: string; city?: string }): Promise<SupplierProduct[]> {
  await delay()
  if (!isSupabaseReady()) {
    let result = [...MOCK_PRODUCTS.filter((p) => p.isActive && p.isVisible)]
    if (params.query) {
      const q = params.query.toLowerCase()
      result = result.filter((p) => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q))
    }
    if (params.categoryId) result = result.filter((p) => p.categoryId === params.categoryId)
    if (params.city) {
      const supplierIds = MOCK_SUPPLIERS.filter((s) => s.city === params.city).map((s) => s.userId)
      result = result.filter((p) => supplierIds.includes(p.supplierId))
    }
    return result
  }

  let query = supabase
    .from("supplier_products" as never)
    .select("*, product_categories!inner(name), supplier_profiles!inner(city)" as never)
    .eq("is_active" as never, true)
    .eq("is_visible" as never, true)
    .eq("supplier_profiles.is_active" as never, true)

  if (params.query) query = query.or(`name.ilike.%${params.query}%,description.ilike.%${params.query}%` as never)
  if (params.categoryId) query = query.eq("category_id" as never, params.categoryId)
  if (params.city) query = query.eq("supplier_profiles.city" as never, params.city)

  const { data } = await query.order("name" as never, { ascending: true })
  if (!data) return []
  return (data as any[]).map(mapCatalogProduct)
}

export async function getSupplierByProductId(productId: string): Promise<{ supplierId: string; companyName: string; city: string } | null> {
  await delay()
  if (!isSupabaseReady()) {
    const product = MOCK_PRODUCTS.find((p) => p.id === productId)
    if (!product) return null
    const supplier = MOCK_SUPPLIERS.find((s) => s.userId === product.supplierId)
    return { supplierId: product.supplierId, companyName: supplier?.companyName ?? "", city: supplier?.city ?? "" }
  }
  const { data } = await supabase
    .from("supplier_products" as never)
    .select("user_id, supplier_profiles!inner(company_name, city)" as never)
    .eq("id" as never, productId)
    .single()
  if (!data) return null
  const d = data as any
  return {
    supplierId: d.user_id,
    companyName: d.supplier_profiles?.company_name ?? "",
    city: d.supplier_profiles?.city ?? "",
  }
}

function mapCatalogProduct(data: any): SupplierProduct {
  return {
    id: data.id,
    supplierId: data.user_id,
    categoryId: data.category_id,
    categoryName: data.product_categories?.name ?? data.category_id,
    name: data.name,
    description: data.description ?? undefined,
    images: data.images ?? [],
    brand: data.brand ?? undefined,
    manufacturerReference: data.manufacturer_reference ?? undefined,
    barcode: data.barcode ?? undefined,
    technicalSpecs: data.technical_specs ?? {},
    unitType: data.unit_type,
    supplierPrice: data.supplier_price,
    recommendedPrice: data.recommended_price ?? undefined,
    cmPrice: data.cm_price,
    stock: data.stock,
    reservedStock: data.reserved_stock ?? 0,
    availableStock: Math.max(0, (data.stock ?? 0) - (data.reserved_stock ?? 0)),
    lowStockThreshold: data.low_stock_threshold ?? 5,
    unlimitedStock: data.unlimited_stock ?? false,
    isActive: data.is_active,
    isVisible: data.is_visible ?? true,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}
