import { supabase, isSupabaseReady } from "../supabase"

export interface CMSPageRow {
  id: string
  slug: string
  title: string
  content: string
  meta_title: string | null
  meta_description: string | null
  status: string
  published_at: string | null
  created_at: string
  updated_at: string
  author_name: string | null
}

export async function getCMSPages(): Promise<CMSPageRow[]> {
  if (!isSupabaseReady()) return []
  try {
    const { data } = await (supabase as any)
      .from("cms_pages")
      .select("*, created_by_admin:created_by(firstname, lastname), updated_by_admin:updated_by(firstname, lastname)")
      .order("created_at", { ascending: false })

    return ((data as any[]) ?? []).map((p: any) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      content: p.content,
      meta_title: p.meta_title ?? null,
      meta_description: p.meta_description ?? null,
      status: p.status ?? "draft",
      published_at: p.published_at ?? null,
      created_at: p.created_at ?? "",
      updated_at: p.updated_at ?? "",
      author_name: p.created_by_admin
        ? `${p.created_by_admin.firstname ?? ""} ${p.created_by_admin.lastname ?? ""}`.trim()
        : p.updated_by_admin
          ? `${p.updated_by_admin.firstname ?? ""} ${p.updated_by_admin.lastname ?? ""}`.trim()
          : null,
    }))
  } catch {
    return []
  }
}

export async function createCMSPage(data: {
  slug: string
  title: string
  content?: string
  meta_title?: string
  meta_description?: string
}): Promise<boolean> {
  if (!isSupabaseReady()) return false
  const { error } = await (supabase as any).from("cms_pages").insert({
    slug: data.slug,
    title: data.title,
    content: data.content ?? "",
    meta_title: data.meta_title ?? null,
    meta_description: data.meta_description ?? null,
    status: "draft",
  })
  return !error
}

export async function updateCMSPage(
  id: string,
  data: { slug?: string; title?: string; content?: string; meta_title?: string; meta_description?: string; status?: string },
): Promise<boolean> {
  if (!isSupabaseReady()) return false
  const updateData: any = { ...data, updated_at: new Date().toISOString() }
  if (data.status === "published") updateData.published_at = new Date().toISOString()
  const { error } = await (supabase as any).from("cms_pages").update(updateData).eq("id", id)
  return !error
}

export async function deleteCMSPage(id: string): Promise<boolean> {
  if (!isSupabaseReady()) return false
  const { error } = await (supabase as any).from("cms_pages").delete().eq("id", id)
  return !error
}
