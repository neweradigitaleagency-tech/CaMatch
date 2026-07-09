import { supabase, isSupabaseReady } from "../supabase"
import { SERVICE_CATEGORIES } from "../../data/serviceCategories"

export interface CategoryRow {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  color: string | null
  parent_id: string | null
  sort_order: number
  is_active: boolean
  pro_count: number
  parent_name: string | null
  created_at: string
}

function slugToId(slug: string): string {
  let hash = 0
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) - hash) + slug.charCodeAt(i)
    hash |= 0
  }
  const hex = Math.abs(hash).toString(16).padStart(8, "0")
  return `00000000-0000-4000-a000-${hex.padStart(12, "0")}`
}

function generateMockCategories(): CategoryRow[] {
  const rows: CategoryRow[] = []
  SERVICE_CATEGORIES.forEach((cat, idx) => {
    const parentId = slugToId(cat.id)
    rows.push({
      id: parentId,
      name: cat.name,
      slug: cat.id,
      description: null,
      icon: cat.icon,
      color: (["#2d6a4f", "#f4a261", "#457b9d", "#52b788", "#457b9d", "#f4a261"][idx % 6]) ?? null,
      parent_id: null,
      sort_order: idx,
      is_active: true,
      pro_count: 0,
      parent_name: null,
      created_at: "2026-01-01T00:00:00Z",
    })
    cat.subcategories.forEach((sub, subIdx) => {
      const subSlug = sub.name.toLowerCase().replace(/[&\s-]+/g, "_")
      rows.push({
        id: slugToId(subSlug),
        name: sub.name,
        slug: subSlug,
        description: null,
        icon: null,
        color: null,
        parent_id: parentId,
        sort_order: subIdx,
        is_active: true,
        pro_count: 0,
        parent_name: cat.name,
        created_at: "2026-01-01T00:00:00Z",
      })
    })
  })
  return rows
}

export const MOCK_CATEGORIES = generateMockCategories()

export function findParentName(categories: CategoryRow[], parentId: string | null): string | null {
  if (!parentId) return null
  return categories.find((c) => c.id === parentId)?.name ?? null
}

export async function getCategories(): Promise<CategoryRow[]> {
  if (!isSupabaseReady()) return MOCK_CATEGORIES
  try {
    const { data } = await (supabase as any)
      .from("categories")
      .select("*")
      .order("sort_order")
      .order("name")

    if (!data) return MOCK_CATEGORIES

    const parentIds = [...new Set((data as any[]).map((c: any) => c.parent_id).filter(Boolean))] as string[]
    let parentMap: Record<string, string> = {}
    if (parentIds.length > 0) {
      const { data: parents } = await (supabase as any)
        .from("categories")
        .select("id, name")
        .in("id", parentIds)
      if (parents) {
        for (const p of parents as any[]) parentMap[p.id] = p.name
      }
    }

    const { data: proCounts } = await (supabase as any)
      .from("professional_profiles")
      .select("category_id")
      .not("category_id", "is", null)
      .is("deleted_at", null)

    const countMap: Record<string, number> = {}
    if (proCounts) {
      for (const p of proCounts as any[]) {
        if (p.category_id) countMap[p.category_id] = (countMap[p.category_id] ?? 0) + 1
      }
    }

    const dbRows = (data as any[]).map((c: any) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description ?? null,
      icon: c.icon ?? null,
      color: c.color ?? null,
      parent_id: c.parent_id ?? null,
      sort_order: c.sort_order ?? 0,
      is_active: c.is_active ?? true,
      pro_count: countMap[c.id] ?? 0,
      parent_name: parentMap[c.parent_id] ?? null,
      created_at: c.created_at ?? "",
    }))

    const dbBySlug = new Map(dbRows.map((r) => [r.slug, r]))

    const result = MOCK_CATEGORIES.map((mock) => {
      const db = dbBySlug.get(mock.slug)
      if (db) {
        return {
          ...mock,
          is_active: db.is_active ?? mock.is_active,
          pro_count: db.pro_count ?? mock.pro_count,
        }
      }
      return mock
    })

    return result
  } catch {
    return MOCK_CATEGORIES
  }
}

export async function createCategory(data: {
  name: string
  slug: string
  description?: string
  icon?: string
  color?: string
  parent_id?: string
  sort_order?: number
}): Promise<boolean> {
  if (!isSupabaseReady()) return true
  const { error } = await (supabase as any).from("categories").insert({
    name: data.name,
    slug: data.slug,
    description: data.description ?? null,
    icon: data.icon ?? null,
    color: data.color ?? null,
    parent_id: data.parent_id ?? null,
    sort_order: data.sort_order ?? 0,
    is_active: true,
  })
  return !error
}

export async function updateCategory(
  id: string,
  data: { name?: string; slug?: string; description?: string; icon?: string; color?: string; parent_id?: string | null; sort_order?: number },
): Promise<boolean> {
  if (!isSupabaseReady()) return true
  const { error } = await (supabase as any).from("categories").update(data).eq("id", id)
  return !error
}

export async function toggleCategoryActive(id: string, isActive: boolean): Promise<boolean> {
  if (!isSupabaseReady()) return true
  const { error } = await (supabase as any).from("categories").update({ is_active: isActive }).eq("id", id)
  return !error
}

export async function deleteCategory(id: string): Promise<boolean> {
  if (!isSupabaseReady()) return true
  const { error } = await (supabase as any).from("categories").delete().eq("id", id)
  return !error
}
