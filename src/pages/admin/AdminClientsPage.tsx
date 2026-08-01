import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { getUsers } from "../../services/admin/users.service"
import { usePermissions } from "../../hooks/usePermissions"
import AdminTable from "../../components/admin/ui/AdminTable"
import StatusBadge from "../../components/admin/ui/StatusBadge"
import ErrorState from "../../components/admin/ui/ErrorState"
import { formatCompactNumber, formatXOF } from "../../utils/admin/formatCurrency"
import { Users, UserCheck, UserX, Search, MapPin, Briefcase, Coins, Circle } from "lucide-react"
import type { Column } from "../../components/admin/ui/AdminTable"
import type { UserProfile } from "../../types/admin"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

type FilterType = "all" | "client" | "professional" | "active" | "inactive"

const MOCK_USERS: UserProfile[] = [
  { id: "1", email: "aicha.diallo@example.com", phone_number: "+225 05 1234 567", role: "client", is_active: true, is_verified: true, phone_verified: true, email_verified: true, created_at: "2026-06-15T08:00:00Z", last_login_at: "2026-07-06T09:12:00Z", client_profile: { first_name: "Aïcha", last_name: "Diallo", city: "Abidjan", commune: "Cocody", total_jobs: 12, total_spent: 485000, loyalty_points: 240, preferred_payment_method: "wave" } },
  { id: "2", email: "mamadou.sylla@example.com", phone_number: "+225 07 2345 678", role: "professional", is_active: true, is_verified: true, phone_verified: true, email_verified: true, created_at: "2026-05-20T10:30:00Z", last_login_at: "2026-07-06T08:45:00Z", professional_profile: { first_name: "Mamadou", last_name: "Sylla", business_name: "Sylla Électricité", category: "maison-reparations", city: "Abidjan", commune: "Yopougon", verification_level: "verified", rating: 4.8, total_jobs: 45, total_earned: 2450000, wallet_balance: 85000, is_verified: true, is_available: true, is_online: true, hourly_rate: 7500, acceptance_rate: 95, response_time_avg: 12, cancellation_rate: 2 } },
  { id: "3", email: "fatou.sissoko@example.com", phone_number: "+225 07 3456 789", role: "client", is_active: true, is_verified: false, phone_verified: false, email_verified: true, created_at: "2026-06-28T14:00:00Z", client_profile: { first_name: "Fatou", last_name: "Sissoko", city: "Abidjan", commune: "Plateau", total_jobs: 3, total_spent: 75000, loyalty_points: 35 } },
  { id: "4", email: "drissa.tounkara@example.com", phone_number: "+225 05 4567 890", role: "professional", is_active: false, is_verified: true, phone_verified: true, email_verified: true, created_at: "2026-04-10T09:00:00Z", professional_profile: { first_name: "Drissa", last_name: "Tounkara", business_name: "Tounkara Maçonnerie", category: "maison-reparations", city: "Abidjan", commune: "Abobo", verification_level: "verified", rating: 4.5, total_jobs: 28, total_earned: 1800000, wallet_balance: 42000, is_verified: true, is_available: false, is_online: false, hourly_rate: 6000 } },
  { id: "5", email: "kadiatou.doumbia@example.com", phone_number: "+225 07 5678 901", role: "client", is_active: true, is_verified: true, phone_verified: true, email_verified: true, created_at: "2026-06-01T11:00:00Z", client_profile: { first_name: "Kadiatou", last_name: "Doumbia", city: "Abidjan", commune: "Marcory", total_jobs: 8, total_spent: 320000, loyalty_points: 160 } },
  { id: "6", email: "yao.cisse@example.com", phone_number: "+225 05 6789 012", role: "professional", is_active: true, is_verified: false, phone_verified: true, email_verified: false, created_at: "2026-06-25T16:00:00Z", professional_profile: { first_name: "Yao", last_name: "Cissé", business_name: "Cissé Services", category: "maison-reparations", city: "Abidjan", commune: "Treichville", verification_level: "pending", rating: 3.9, total_jobs: 7, total_earned: 420000, wallet_balance: 12000, is_verified: false, is_available: true, is_online: true, hourly_rate: 5000 } },
  { id: "7", email: "mariam.kone@example.com", phone_number: "+225 07 7890 123", role: "client", is_active: false, is_verified: false, phone_verified: false, email_verified: false, created_at: "2026-03-15T07:00:00Z", client_profile: { first_name: "Mariam", last_name: "Koné", city: "Abidjan", commune: "Koumassi", total_jobs: 1, total_spent: 15000, loyalty_points: 5 } },
  { id: "8", email: "ibrahim.sangare@example.com", phone_number: "+225 05 8901 234", role: "professional", is_active: true, is_verified: true, phone_verified: true, email_verified: true, created_at: "2026-02-01T13:00:00Z", professional_profile: { first_name: "Ibrahim", last_name: "Sangaré", business_name: "Sangaré Jardinage", category: "maison-reparations", city: "Abidjan", commune: "Cocody", verification_level: "verified", rating: 4.9, total_jobs: 62, total_earned: 3100000, wallet_balance: 150000, is_verified: true, is_available: true, is_online: true, hourly_rate: 10000 } },
]

const FILTERS: { key: FilterType; label: string }[] = [
  { key: "all", label: "Tous" },
  { key: "active", label: "Actifs" },
  { key: "inactive", label: "Inactifs" },
  { key: "client", label: "Clients" },
  { key: "professional", label: "Professionnels" },
]

function getUserName(user: UserProfile): string {
  if (user.client_profile?.first_name) return `${user.client_profile.first_name} ${user.client_profile.last_name}`
  if (user.professional_profile?.first_name) return `${user.professional_profile.first_name} ${user.professional_profile.last_name}`
  return user.email.split("@")[0] ?? ""
}

function getUserCity(user: UserProfile): string | null {
  return user.client_profile?.city ?? user.professional_profile?.city ?? null
}

function getUserCommune(user: UserProfile): string | null {
  return user.client_profile?.commune ?? user.professional_profile?.commune ?? null
}

function getUserJobs(user: UserProfile): number {
  return user.client_profile?.total_jobs ?? user.professional_profile?.total_jobs ?? 0
}

function getUserRevenue(user: UserProfile): number {
  return user.client_profile?.total_spent ?? user.professional_profile?.total_earned ?? 0
}

function getStatusLabel(user: UserProfile): { status: string; label: string } {
  if (!user.is_active) return { status: "inactive", label: "Inactif" }
  if (user.role === "professional" && user.professional_profile?.is_verified) return { status: "active", label: "Actif" }
  if (user.role === "professional" && !user.professional_profile?.is_verified) return { status: "pending", label: "Non vérifié" }
  return { status: "active", label: "Actif" }
}

export default function AdminClientsPage() {
  const navigate = useNavigate()
  const { hasPermission } = usePermissions()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterType>("all")

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { users: data, total: count } = await getUsers({ perPage: 100 })
      if (data.length > 0) {
        setUsers(data)
        setTotal(count)
      } else {
        setUsers(MOCK_USERS)
        setTotal(MOCK_USERS.length)
      }
    } catch {
      setUsers(MOCK_USERS)
      setTotal(MOCK_USERS.length)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const filtered = users.filter((u) => {
    if (filter === "client") return u.role === "client"
    if (filter === "professional") return u.role === "professional"
    if (filter === "active") return u.is_active
    if (filter === "inactive") return !u.is_active
    return true
  })

  const counts = {
    total: users.length,
    clients: users.filter((u) => u.role === "client").length,
    pros: users.filter((u) => u.role === "professional").length,
    active: users.filter((u) => u.is_active).length,
    verified: users.filter((u) => u.is_verified).length,
    online: users.filter((u) => u.professional_profile?.is_online).length,
  }

  const columns: Column<UserProfile>[] = [
    {
      key: "name",
      label: "Nom",
      sortable: true,
      width: "200px",
      render: (u) => (
        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 rounded-full bg-cm-surface flex items-center justify-center text-[12px] font-semibold text-cm-text-soft shrink-0">
            {getUserName(u).charAt(0)}
            {u.role === "professional" && (
              <span className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 border-2 border-white rounded-full ${u.professional_profile?.is_online ? "bg-green-500" : "bg-cm-border-soft"}`} />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-cm-text truncate">{getUserName(u)}</p>
            <p className="text-[11px] text-cm-text-muted truncate">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Rôle",
      sortable: true,
      width: "90px",
      render: (u) => (
        <span className={`text-[12px] capitalize font-medium ${u.role === "professional" ? "text-blue-600" : "text-cm-text-soft"}`}>
          {u.role === "professional" ? "Pro" : "Client"}
        </span>
      ),
    },
    {
      key: "phone_number",
      label: "Téléphone",
      sortable: true,
      width: "130px",
      render: (u) => <span className="text-[12px] text-cm-text-soft">{u.phone_number || "—"}</span>,
    },
    {
      key: "city",
      label: "Ville",
      sortable: true,
      width: "90px",
      render: (u) => {
        const city = getUserCity(u)
        return city ? (
          <span className="flex items-center gap-1 text-[12px] text-cm-text-soft">
            <MapPin className="w-3 h-3 text-cm-text-muted" /> {city}
          </span>
        ) : <span className="text-[12px] text-cm-text-muted">—</span>
      },
    },
    {
      key: "commune",
      label: "Commune",
      sortable: true,
      width: "110px",
      render: (u) => {
        const commune = getUserCommune(u)
        return commune ? (
          <span className="text-[12px] text-cm-text-soft">{commune}</span>
        ) : <span className="text-[12px] text-cm-text-muted">—</span>
      },
    },
    {
      key: "created_at",
      label: "Inscrit le",
      sortable: true,
      width: "110px",
      render: (u) => (
        <span className="text-[12px] text-cm-text-muted">
          {format(new Date(u.created_at), "d MMM yyyy", { locale: fr })}
        </span>
      ),
    },
    {
      key: "missions",
      label: "Missions",
      sortable: true,
      width: "80px",
      render: (u) => <span className="text-[12px] font-medium text-cm-text-soft">{getUserJobs(u)}</span>,
    },
    {
      key: "depenses",
      label: "CA / Dépenses",
      sortable: true,
      width: "110px",
      render: (u) => <span className="text-[12px] font-medium text-cm-text-soft">{formatXOF(getUserRevenue(u))}</span>,
    },
    {
      key: "status",
      label: "Statut",
      sortable: true,
      width: "120px",
      render: (u) => {
        const s = getStatusLabel(u)
        return <StatusBadge status={s.status} label={s.label} />
      },
    },
    {
      key: "actions",
      label: "",
      width: "60px",
      render: (u) => (
        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/admin/clients/${u.id}`) }}
          className="text-[11px] font-medium text-[var(--admin-accent)] hover:underline cursor-pointer"
        >
          Voir
        </button>
      ),
    },
  ]

  if (error) return <ErrorState message={error} onRetry={fetchUsers} />

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-cm-text">Utilisateurs</h1>
          <p className="text-[13px] text-cm-text-muted mt-0.5">
            {total} utilisateur{total !== 1 ? "s" : ""} sur la plateforme
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        <MiniStat icon={<Users className="w-3.5 h-3.5" />} label="Total" value={counts.total} />
        <MiniStat icon={<Users className="w-3.5 h-3.5" />} label="Clients" value={counts.clients} />
        <MiniStat icon={<Briefcase className="w-3.5 h-3.5" />} label="Pros" value={counts.pros} />
        <MiniStat icon={<UserCheck className="w-3.5 h-3.5" />} label="Actifs" value={counts.active} />
        <MiniStat icon={<ShieldCheckIcon />} label="Vérifiés" value={counts.verified} />
        <MiniStat icon={<Circle className="w-3.5 h-3.5 fill-green-500 text-green-500" />} label="En ligne" value={counts.online} />
      </div>

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3.5 py-1.5 rounded-lg text-[12px] font-medium whitespace-nowrap cursor-pointer transition-colors ${
              filter === f.key
                ? "bg-cm-text text-white"
                : "bg-cm-elevated border border-cm-border text-cm-text-soft hover:bg-cm-surface"
            }`}
          >
            {f.label}
            {f.key !== "all" && (
              <span className="ml-1.5 text-[11px] opacity-60">
                ({users.filter((u) => {
                  if (f.key === "client") return u.role === "client"
                  if (f.key === "professional") return u.role === "professional"
                  if (f.key === "active") return u.is_active
                  if (f.key === "inactive") return !u.is_active
                  return true
                }).length})
              </span>
            )}
          </button>
        ))}
      </div>

      <AdminTable
        columns={columns}
        data={filtered}
        keyExtractor={(u) => u.id}
        onRowClick={(u) => navigate(`/admin/clients/${u.id}`)}
        searchable
        searchKeys={["email", "phone_number"]}
        exportable
        loading={loading}
        emptyMessage="Aucun utilisateur trouvé"
      />
    </div>
  )
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-cm-elevated border border-cm-border rounded-xl px-3 py-2.5 flex items-center gap-2.5">
      <span className="text-cm-text-muted shrink-0">{icon}</span>
      <div>
        <p className="text-[15px] font-bold text-cm-text leading-tight">{value}</p>
        <p className="text-[10px] text-cm-text-muted leading-tight">{label}</p>
      </div>
    </div>
  )
}

function ShieldCheckIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
