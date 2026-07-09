import { supabase, isSupabaseReady } from "../supabase"
import type { ProApplicationStatus } from "../../types"

export interface ProApplication {
  id: string
  name: string
  phone: string
  email: string
  categories: string[]
  status: ProApplicationStatus
  submitted_at: string
  documents_count: number
  location: string
  title: string
  bio: string
  hourly_rate: number
  experience_years: number
  reviewer_name: string | null
  notes: string | null
}

const MOCK_APPLICATIONS: ProApplication[] = [
  { id: "app1", name: "Yao Cissé", phone: "+225 07 5966 509", email: "yao.cisse@email.com", categories: ["plombier", "électricien"], status: "SUBMITTED", submitted_at: "2026-06-28T10:00:00Z", documents_count: 3, location: "Cocody, Abidjan", title: "Plombier professionnel", bio: "Je suis plombier avec 5 ans d'expérience.", hourly_rate: 15000, experience_years: 5, reviewer_name: null, notes: null },
  { id: "app2", name: "Fatou Sissoko", phone: "+225 07 2846 510", email: "fatou.s@email.com", categories: ["jardinage"], status: "UNDER_REVIEW", submitted_at: "2026-06-27T14:30:00Z", documents_count: 4, location: "Yopougon, Abidjan", title: "Jardinière paysagiste", bio: "Spécialiste en jardinage et aménagement extérieur.", hourly_rate: 10000, experience_years: 3, reviewer_name: "Admin", notes: null },
  { id: "app3", name: "Mamadou Sylla", phone: "+225 07 4359 973", email: "m.sylla@email.com", categories: ["électricien"], status: "APPROVED", submitted_at: "2026-06-25T09:15:00Z", documents_count: 3, location: "Plateau, Abidjan", title: "Électricien agréé", bio: "Électricien avec spécialisation en bâtiment.", hourly_rate: 12000, experience_years: 8, reviewer_name: "Admin", notes: "Documents valides, expérience confirmée" },
  { id: "app4", name: "Kadiatou Doumbia", phone: "+225 07 7160 528", email: "k.doumbia@email.com", categories: ["peintre", "décoration"], status: "REJECTED", submitted_at: "2026-06-24T11:00:00Z", documents_count: 2, location: "Treichville, Abidjan", title: "Peintre en bâtiment", bio: "Peintre depuis 10 ans.", hourly_rate: 8000, experience_years: 10, reviewer_name: "Admin", notes: "Documents incomplets" },
  { id: "app5", name: "Drissa Tounkara", phone: "+225 07 6508 900", email: "d.tounkara@email.com", categories: ["maçon"], status: "SUBMITTED", submitted_at: "2026-06-29T08:45:00Z", documents_count: 3, location: "Adjamé, Abidjan", title: "Maçon", bio: "Maçon avec référence.", hourly_rate: 18000, experience_years: 12, reviewer_name: null, notes: null },
]

function getMockApplications(): ProApplication[] {
  return [...MOCK_APPLICATIONS]
}

export async function getApplications(params: {
  status?: string
  search?: string
} = {}): Promise<ProApplication[]> {
  if (!isSupabaseReady()) {
    let result = getMockApplications()
    if (params.status && params.status !== "all") {
      result = result.filter((a) => a.status === params.status)
    }
    if (params.search) {
      const q = params.search.toLowerCase()
      result = result.filter((a) => a.name.toLowerCase().includes(q) || a.phone.includes(q) || a.email.toLowerCase().includes(q))
    }
    return result.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
  }

  let query = supabase
    .from("pro_applications" as never)
    .select("*, reviewer:reviewed_by(firstname, lastname)") as any

  if (params.status && params.status !== "all") query = query.eq("status", params.status)
  if (params.search) query = query.or(`name.ilike.%${params.search}%,email.ilike.%${params.search}%`)

  const { data } = await query.order("submitted_at", { ascending: false }) as any
  if (!data) return []

  return (data as any[]).map((a: any) => ({
    id: a.id,
    name: a.name,
    phone: a.phone,
    email: a.email,
    categories: a.categories ?? [],
    status: a.status,
    submitted_at: a.submitted_at,
    documents_count: a.documents_count ?? 0,
    location: a.location ?? "",
    title: a.title ?? "",
    bio: a.bio ?? "",
    hourly_rate: a.hourly_rate ?? 0,
    experience_years: a.experience_years ?? 0,
    reviewer_name: a.reviewer ? `${a.reviewer.firstname} ${a.reviewer.lastname}` : null,
    notes: a.notes ?? null,
  })) as ProApplication[]
}

export async function getApplicationById(id: string): Promise<ProApplication | null> {
  if (!isSupabaseReady()) {
    return getMockApplications().find((a) => a.id === id) ?? null
  }

  const { data } = await supabase
    .from("pro_applications" as never)
    .select("*, reviewer:reviewed_by(firstname, lastname)")
    .eq("id", id)
    .single() as any

  if (!data) return null

  return {
    id: data.id,
    name: data.name,
    phone: data.phone,
    email: data.email,
    categories: data.categories ?? [],
    status: data.status,
    submitted_at: data.submitted_at,
    documents_count: data.documents_count ?? 0,
    location: data.location ?? "",
    title: data.title ?? "",
    bio: data.bio ?? "",
    hourly_rate: data.hourly_rate ?? 0,
    experience_years: data.experience_years ?? 0,
    reviewer_name: data.reviewer ? `${data.reviewer.firstname} ${data.reviewer.lastname}` : null,
    notes: data.notes ?? null,
  } as ProApplication
}

export async function updateApplicationStatus(
  id: string,
  status: ProApplicationStatus,
  reviewedBy: string,
  notes?: string,
): Promise<boolean> {
  if (!isSupabaseReady()) return true

  const update: any = { status, reviewed_by: reviewedBy }
  if (notes !== undefined) update.notes = notes
  if (status === "APPROVED" || status === "REJECTED") update.resolved_at = new Date().toISOString()

  const { error } = await supabase.from("pro_applications" as never).update(update as never).eq("id" as never, id) as any
  return !error
}
