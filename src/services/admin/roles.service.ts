import { supabase, isSupabaseReady } from "../supabase"

export interface AdminRow {
  id: string
  firstname: string
  lastname: string
  email: string
  status: string
  last_login: string | null
  created_at: string
  roles: { id: string; name: string; description: string | null }[]
}

export interface RoleRow {
  id: string
  name: string
  description: string | null
  permissions: Record<string, boolean>
  is_system: boolean
  admin_count: number
  created_at: string
}

export async function getAdmins(): Promise<AdminRow[]> {
  if (!isSupabaseReady()) return []
  try {
    const { data: admins } = await (supabase as any)
      .from("admins")
      .select("*")
      .order("created_at", { ascending: false })

    if (!admins) return []

    const { data: adminRoles } = await (supabase as any)
      .from("admin_roles")
      .select("admin_id, role:role_id(id, name, description)")

    const roleMap: Record<string, { id: string; name: string; description: string | null }[]> = {}
    if (adminRoles) {
      for (const ar of adminRoles as any[]) {
        if (!roleMap[ar.admin_id]) roleMap[ar.admin_id] = []
        roleMap[ar.admin_id]!.push({
          id: ar.role.id,
          name: ar.role.name,
          description: ar.role.description ?? null,
        })
      }
    }

    return (admins as any[]).map((a: any) => ({
      id: a.id,
      firstname: a.firstname ?? "",
      lastname: a.lastname ?? "",
      email: a.email,
      status: a.status ?? "active",
      last_login: a.last_login ?? null,
      created_at: a.created_at ?? "",
      roles: roleMap[a.id] ?? [],
    }))
  } catch {
    return []
  }
}

export async function getRoles(): Promise<RoleRow[]> {
  if (!isSupabaseReady()) return []
  try {
    const { data } = await (supabase as any)
      .from("roles")
      .select("*, admin_roles!left(admin_id)")
      .order("name")

    return ((data as any[]) ?? []).map((r: any) => ({
      id: r.id,
      name: r.name,
      description: r.description ?? null,
      permissions: (typeof r.permissions === "object" ? r.permissions : {}) as Record<string, boolean>,
      is_system: r.is_system ?? false,
      admin_count: (r.admin_roles as any[])?.length ?? 0,
      created_at: r.created_at ?? "",
    }))
  } catch {
    return []
  }
}

export async function createRole(data: { name: string; description?: string; permissions?: Record<string, boolean> }): Promise<boolean> {
  if (!isSupabaseReady()) return false
  const { error } = await supabase.from("roles").insert({
    name: data.name,
    description: data.description ?? null,
    permissions: data.permissions ?? {},
    is_system: false,
  })
  return !error
}

export async function updateRole(id: string, data: { name?: string; description?: string; permissions?: Record<string, boolean> }): Promise<boolean> {
  if (!isSupabaseReady()) return false
  const { error } = await supabase.from("roles").update(data).eq("id", id)
  return !error
}

export async function deleteRole(id: string): Promise<boolean> {
  if (!isSupabaseReady()) return false
  const { error } = await supabase.from("roles").delete().eq("id", id)
  return !error
}

export async function assignRole(adminId: string, roleId: string): Promise<boolean> {
  if (!isSupabaseReady()) return false
  const { error } = await (supabase as any).from("admin_roles").insert({ admin_id: adminId, role_id: roleId })
  return !error
}

export async function removeRole(adminId: string, roleId: string): Promise<boolean> {
  if (!isSupabaseReady()) return false
  const { error } = await (supabase as any)
    .from("admin_roles")
    .delete()
    .eq("admin_id", adminId)
    .eq("role_id", roleId)
  return !error
}
