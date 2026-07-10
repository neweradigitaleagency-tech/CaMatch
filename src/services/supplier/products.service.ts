import { supabase, isSupabaseReady } from "../supabase"
import type { SupplierProduct, SupplierProductFormData } from "../../types/supplier"
import { MOCK_PRODUCTS, getMockSupplierProducts } from "../../data/supplier-mocks"

function delay(ms = 300): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

export async function getSupplierProducts(userId: string): Promise<SupplierProduct[]> {
  await delay()
  if (!isSupabaseReady()) return getMockSupplierProducts(userId)
  const { data } = await supabase
    .from("supplier_products" as never)
    .select("*, product_categories!inner(name)" as never)
    .eq("user_id" as never, userId)
    .order("created_at" as never, { ascending: false })
  if (!data) return []
  return (data as any[]).map(mapProduct)
}

export async function getProductById(productId: string | undefined): Promise<SupplierProduct | null> {
  await delay()
  if (!productId) return null
  if (!isSupabaseReady()) return MOCK_PRODUCTS.find((p) => p.id === productId) ?? null
  const { data } = await supabase
    .from("supplier_products" as never)
    .select("*, product_categories!inner(name)" as never)
    .eq("id" as never, productId)
    .single()
  if (!data) return null
  return mapProduct(data as any)
}

export async function createProduct(userId: string, form: SupplierProductFormData, commissionRate: number): Promise<string | null> {
  await delay()
  if (!isSupabaseReady()) return "mock-id"

  const cmPrice = Math.round(form.supplierPrice / (1 - commissionRate / 100))

  const db = {
    user_id: userId,
    name: form.name,
    description: form.description ?? null,
    category_id: form.categoryId,
    images: form.images,
    brand: form.brand ?? null,
    manufacturer_reference: form.manufacturerReference ?? null,
    barcode: form.barcode ?? null,
    technical_specs: form.technicalSpecs,
    unit_type: form.unitType,
    supplier_price: form.supplierPrice,
    recommended_price: form.recommendedPrice ?? null,
    cm_price: cmPrice,
    stock: form.stock,
    reserved_stock: 0,
    low_stock_threshold: form.lowStockThreshold,
    unlimited_stock: form.unlimitedStock,
    is_visible: form.isVisible,
    is_active: true,
  }
  const { data, error } = await supabase.from("supplier_products" as never).insert(db as never).select("id" as never).single()
  if (error) return null
  return (data as any)?.id ?? null
}

export async function updateProduct(productId: string, form: Partial<SupplierProductFormData>, commissionRate: number): Promise<boolean> {
  await delay()
  if (!isSupabaseReady()) return true

  const db: Record<string, unknown> = {}
  if (form.name !== undefined) db.name = form.name
  if (form.description !== undefined) db.description = form.description
  if (form.categoryId !== undefined) db.category_id = form.categoryId
  if (form.images !== undefined) db.images = form.images
  if (form.brand !== undefined) db.brand = form.brand
  if (form.manufacturerReference !== undefined) db.manufacturer_reference = form.manufacturerReference
  if (form.barcode !== undefined) db.barcode = form.barcode
  if (form.technicalSpecs !== undefined) db.technical_specs = form.technicalSpecs
  if (form.unitType !== undefined) db.unit_type = form.unitType
  if (form.supplierPrice !== undefined) {
    db.supplier_price = form.supplierPrice
    db.cm_price = Math.round(form.supplierPrice / (1 - commissionRate / 100))
  }
  if (form.recommendedPrice !== undefined) db.recommended_price = form.recommendedPrice
  if (form.stock !== undefined) db.stock = form.stock
  if (form.lowStockThreshold !== undefined) db.low_stock_threshold = form.lowStockThreshold
  if (form.unlimitedStock !== undefined) db.unlimited_stock = form.unlimitedStock
  if (form.isVisible !== undefined) db.is_visible = form.isVisible

  const { error } = await supabase.from("supplier_products" as never).update(db as never).eq("id" as never, productId)
  return !error
}

export async function toggleProductActive(productId: string, isActive: boolean): Promise<boolean> {
  await delay()
  if (!isSupabaseReady()) return true
  const { error } = await supabase.from("supplier_products" as never).update({ is_active: isActive } as never).eq("id" as never, productId)
  return !error
}

export async function searchSupplierProducts(params: { supplierId: string; query?: string; categoryId?: string; isActive?: boolean }): Promise<SupplierProduct[]> {
  await delay()
  if (!isSupabaseReady()) {
    let result = [...MOCK_PRODUCTS.filter((p) => p.supplierId === params.supplierId)]
    if (params.query) {
      const q = params.query.toLowerCase()
      result = result.filter((p) => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q))
    }
    if (params.categoryId) result = result.filter((p) => p.categoryId === params.categoryId)
    if (params.isActive !== undefined) result = result.filter((p) => p.isActive === params.isActive)
    return result
  }

  let query = supabase
    .from("supplier_products" as never)
    .select("*, product_categories!inner(name)" as never)
    .eq("user_id" as never, params.supplierId)

  if (params.query) query = query.or(`name.ilike.%${params.query}%,description.ilike.%${params.query}%` as never)
  if (params.categoryId) query = query.eq("category_id" as never, params.categoryId)
  if (params.isActive !== undefined) query = query.eq("is_active" as never, params.isActive)

  const { data } = await query.order("created_at" as never, { ascending: false })
  if (!data) return []
  return (data as any[]).map(mapProduct)
}

function mapProduct(data: any): SupplierProduct {
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
