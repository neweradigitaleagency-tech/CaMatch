import { supabase, isSupabaseReady } from "../supabase"
import type { ProductCategory } from "../../types/supplier"
import { MOCK_CATEGORIES } from "../../data/supplier-mocks"

function delay(ms = 300): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

export async function getAllProductCategories(): Promise<ProductCategory[]> {
  await delay()
  if (!isSupabaseReady()) return MOCK_CATEGORIES
  const { data } = await supabase
    .from("product_categories" as never)
    .select("*" as never)
    .order("sort_order" as never, { ascending: true })
  if (!data) return []
  return (data as any[]).map((c: any) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description ?? undefined,
    icon: c.icon ?? undefined,
    color: c.color ?? undefined,
    parentId: c.parent_id ?? undefined,
    sortOrder: c.sort_order,
    isActive: c.is_active,
  }))
}
