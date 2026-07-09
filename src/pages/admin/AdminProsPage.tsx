import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { getPros, verifyPro } from "../../services/admin/pros.service"
import { usePermissions } from "../../hooks/usePermissions"
import AdminTable from "../../components/admin/ui/AdminTable"
import StatusBadge from "../../components/admin/ui/StatusBadge"
import ErrorState from "../../components/admin/ui/ErrorState"
import { formatXOF } from "../../utils/admin/formatCurrency"
import { Star, ShieldCheck, MapPin, Briefcase, DollarSign, Circle, Clock, Users, UserCheck } from "lucide-react"
import { getCategoryLabel } from "../../constants/admin/categoryLabels"
import type { Column } from "../../components/admin/ui/AdminTable"
import type { ProProfile } from "../../services/admin/pros.service"

type FilterType = "all" | "verified" | "pending" | "available" | "busy"

const MOCK_PROS: ProProfile[] = [
  { user_id: "p1", first_name: "Mamadou", last_name: "Sylla", business_name: "Sylla Électricité", categories: ["électricien"], city: "Abidjan", commune: "Yopougon", verification_level: "verified", rating: 4.8, total_jobs: 45, total_earned: 2450000, wallet_balance: 85000, hourly_rate: 7500, acceptance_rate: 95, response_time_avg: 12, cancellation_rate: 2, is_verified: true, is_available: true, is_online: true, created_at: "2026-05-20T10:30:00Z", email: "mamadou.sylla@example.com", phone_number: "+225 07 2345 678", trust_score: { overall: 92, kyc: 95, activity: 88, payment_reliability: 96, fraud_flags: 0, fraud_score: 2, last_assessed: "2026-07-06T08:00:00Z" } },
  { user_id: "p2", first_name: "Yao", last_name: "Cissé", business_name: "Cissé Services", categories: ["plombier", "électricien"], city: "Abidjan", commune: "Treichville", verification_level: "pending", rating: 3.9, total_jobs: 7, total_earned: 420000, wallet_balance: 12000, hourly_rate: 5000, acceptance_rate: 88, response_time_avg: 25, cancellation_rate: 5, is_verified: false, is_available: true, is_online: false, created_at: "2026-06-25T16:00:00Z", email: "yao.cisse@example.com", phone_number: "+225 05 6789 012", trust_score: { overall: 42, kyc: 30, activity: 45, payment_reliability: 60, fraud_flags: 0, fraud_score: 5, last_assessed: "2026-07-06T08:00:00Z" } },
  { user_id: "p3", first_name: "Drissa", last_name: "Tounkara", business_name: "Tounkara Maçonnerie", categories: ["maçon"], city: "Abidjan", commune: "Abobo", verification_level: "verified", rating: 4.5, total_jobs: 28, total_earned: 1800000, wallet_balance: 42000, hourly_rate: 6000, acceptance_rate: 92, response_time_avg: 18, cancellation_rate: 1, is_verified: true, is_available: false, is_online: false, created_at: "2026-04-10T09:00:00Z", email: "drissa.tounkara@example.com", phone_number: "+225 05 4567 890", trust_score: { overall: 88, kyc: 90, activity: 82, payment_reliability: 94, fraud_flags: 0, fraud_score: 3, last_assessed: "2026-07-05T10:00:00Z" } },
  { user_id: "p4", first_name: "Ibrahim", last_name: "Sangaré", business_name: "Sangaré Jardinage", categories: ["jardinage"], city: "Abidjan", commune: "Cocody", verification_level: "verified", rating: 4.9, total_jobs: 62, total_earned: 3100000, wallet_balance: 150000, hourly_rate: 10000, acceptance_rate: 98, response_time_avg: 8, cancellation_rate: 0, is_verified: true, is_available: true, is_online: true, created_at: "2026-02-01T13:00:00Z", email: "ibrahim.sangare@example.com", phone_number: "+225 05 8901 234", trust_score: { overall: 97, kyc: 98, activity: 95, payment_reliability: 100, fraud_flags: 0, fraud_score: 1, last_assessed: "2026-07-06T08:00:00Z" } },
  { user_id: "p5", first_name: "Fatoumata", last_name: "Kéita", business_name: "Kéita Peinture", categories: ["peintre"], city: "Abidjan", commune: "Plateau", verification_level: "rejected", rating: 3.2, total_jobs: 4, total_earned: 185000, wallet_balance: 5000, hourly_rate: 4000, acceptance_rate: 75, response_time_avg: 45, cancellation_rate: 10, is_verified: false, is_available: true, is_online: false, created_at: "2026-07-01T09:00:00Z", email: "fatoumata.keita@example.com", phone_number: "+225 07 1234 567", trust_score: { overall: 28, kyc: 15, activity: 35, payment_reliability: 40, fraud_flags: 1, fraud_score: 65, last_assessed: "2026-07-06T08:00:00Z" } },
  { user_id: "p6", first_name: "Adama", last_name: "Traoré", business_name: "Traoré Dépannage", categories: ["climatisation", "électricien"], city: "Abidjan", commune: "Marcory", verification_level: "pending", rating: 4.1, total_jobs: 12, total_earned: 720000, wallet_balance: 25000, hourly_rate: 5500, acceptance_rate: 85, response_time_avg: 30, cancellation_rate: 3, is_verified: false, is_available: true, is_online: true, created_at: "2026-06-28T14:00:00Z", email: "adama.traore@example.com", phone_number: "+225 07 5678 901", trust_score: { overall: 55, kyc: 40, activity: 60, payment_reliability: 70, fraud_flags: 0, fraud_score: 8, last_assessed: "2026-07-06T08:00:00Z" } },
  { user_id: "p7", first_name: "Kadidiatou", last_name: "Diallo", business_name: "Diallo Nettoyage", categories: ["nettoyage", "femme_de_ménage"], city: "Abidjan", commune: "Koumassi", verification_level: "verified", rating: 4.6, total_jobs: 34, total_earned: 1150000, wallet_balance: 38000, hourly_rate: 3500, acceptance_rate: 90, response_time_avg: 15, cancellation_rate: 1, is_verified: true, is_available: false, is_online: false, created_at: "2026-03-15T11:00:00Z", email: "kadidiatou.diallo@example.com", phone_number: "+225 05 3456 789", trust_score: { overall: 85, kyc: 88, activity: 80, payment_reliability: 90, fraud_flags: 0, fraud_score: 4, last_assessed: "2026-07-04T09:00:00Z" } },
  { user_id: "p8", first_name: "Souleymane", last_name: "Bamba", business_name: "Bamba Réparation", categories: ["menuisier", "serrurier"], city: "Abidjan", commune: "Cocody", verification_level: "verified", rating: 4.7, total_jobs: 51, total_earned: 2650000, wallet_balance: 95000, hourly_rate: 8000, acceptance_rate: 96, response_time_avg: 10, cancellation_rate: 1, is_verified: true, is_available: true, is_online: true, created_at: "2026-01-20T08:00:00Z", email: "souleymane.bamba@example.com", phone_number: "+225 07 7890 123", trust_score: { overall: 90, kyc: 92, activity: 87, payment_reliability: 93, fraud_flags: 0, fraud_score: 3, last_assessed: "2026-07-06T08:00:00Z" } },
]

const FILTERS: { key: FilterType; label: string }[] = [
  { key: "all", label: "Tous" },
  { key: "verified", label: "Vérifiés" },
  { key: "pending", label: "En attente" },
  { key: "available", label: "Disponibles" },
  { key: "busy", label: "Occupés" },
]

const VERIF_LABELS: Record<string, { status: string; label: string }> = {
  verified: { status: "active", label: "Vérifié" },
  pending: { status: "pending", label: "En attente" },
  rejected: { status: "rejected", label: "Rejeté" },
  none: { status: "inactive", label: "Non vérifié" },
}

function getProName(pro: ProProfile): string {
  return `${pro.first_name} ${pro.last_name}`
}

export default function AdminProsPage() {
  const navigate = useNavigate()
  const { hasPermission } = usePermissions()
  const [pros, setPros] = useState<ProProfile[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterType>("all")
  const [verifyingId, setVerifyingId] = useState<string | null>(null)

  const fetchPros = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { pros: data, total: count } = await getPros({ perPage: 100 })
      if (data.length > 0) {
        setPros(data)
        setTotal(count)
      } else {
        setPros(MOCK_PROS)
        setTotal(MOCK_PROS.length)
      }
    } catch {
      setPros(MOCK_PROS)
      setTotal(MOCK_PROS.length)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPros() }, [fetchPros])

  const handleVerify = async (proId: string, verified: boolean) => {
    setVerifyingId(proId)
    try {
      await verifyPro(proId, verified)
      setPros((prev) => prev.map((p) =>
        p.user_id === proId ? { ...p, is_verified: verified, verification_level: verified ? "verified" : "rejected" } : p
      ))
    } catch {
      /* silent */
    } finally {
      setVerifyingId(null)
    }
  }

  const filtered = pros.filter((p) => {
    if (filter === "verified") return p.is_verified
    if (filter === "pending") return p.verification_level === "pending" || (!p.is_verified && p.verification_level !== "rejected")
    if (filter === "available") return p.is_available
    if (filter === "busy") return !p.is_available
    return true
  })

  const counts = {
    total: pros.length,
    verified: pros.filter((p) => p.is_verified).length,
    pending: pros.filter((p) => p.verification_level === "pending" || (!p.is_verified && p.verification_level !== "rejected")).length,
    available: pros.filter((p) => p.is_available).length,
    online: pros.filter((p) => p.is_online).length,
  }

  const columns: Column<ProProfile>[] = [
    {
      key: "name",
      label: "Nom",
      sortable: true,
      width: "200px",
      render: (p) => (
        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[12px] font-semibold text-gray-600 shrink-0">
            {getProName(p).charAt(0)}
            <span className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 border-2 border-white rounded-full ${p.is_online ? "bg-green-500" : "bg-gray-300"}`} />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-gray-900 truncate">{getProName(p)}</p>
            <p className="text-[11px] text-gray-400 truncate">{p.business_name || getCategoryLabel(p.categories[0] || "")}</p>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      label: "Catégories",
      sortable: true,
      width: "140px",
      render: (p) => (
        <div className="flex flex-wrap gap-1">
          {p.categories.map((cat) => (
            <span key={cat} className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 leading-tight">
              {getCategoryLabel(cat)}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: "city",
      label: "Ville",
      sortable: true,
      width: "80px",
      render: (p) => p.city ? (
        <span className="flex items-center gap-1 text-[12px] text-gray-600"><MapPin className="w-3 h-3 text-gray-400" /> {p.city}</span>
      ) : <span className="text-[12px] text-gray-400">—</span>,
    },
    {
      key: "commune",
      label: "Commune",
      sortable: true,
      width: "100px",
      render: (p) => <span className="text-[12px] text-gray-600">{p.commune || "—"}</span>,
    },
    {
      key: "verification_level",
      label: "Vérif.",
      sortable: true,
      width: "90px",
      render: (p) => {
        const v = VERIF_LABELS[p.verification_level] ?? { status: "inactive", label: "Non vérifié" }
        return <StatusBadge status={v.status} label={v.label} />
      },
    },
    {
      key: "rating",
      label: "Note",
      sortable: true,
      width: "70px",
      render: (p) => (
        <span className="inline-flex items-center gap-1 text-[12px] font-medium text-gray-700">
          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
          {p.rating.toFixed(1)}
        </span>
      ),
    },
    {
      key: "total_jobs",
      label: "Missions",
      sortable: true,
      width: "70px",
      render: (p) => <span className="text-[12px] font-medium text-gray-700">{p.total_jobs}</span>,
    },
    {
      key: "total_earned",
      label: "CA",
      sortable: true,
      width: "100px",
      render: (p) => <span className="text-[12px] font-medium text-gray-700">{formatXOF(p.total_earned)}</span>,
    },
    {
      key: "hourly_rate",
      label: "Tarif/h",
      sortable: true,
      width: "80px",
      render: (p) => <span className="text-[12px] text-gray-600">{p.hourly_rate ? `${p.hourly_rate.toLocaleString()} F` : "—"}</span>,
    },
    {
      key: "is_available",
      label: "Dispo",
      sortable: true,
      width: "65px",
      render: (p) => (
        <span className={`inline-flex items-center gap-1.5 text-[12px] ${p.is_available ? "text-emerald-600" : "text-gray-400"}`}>
          <span className={`w-2 h-2 rounded-full ${p.is_available ? "bg-emerald-500" : "bg-gray-300"}`} />
          {p.is_available ? "Oui" : "Non"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      width: "140px",
      render: (p) => (
        <div className="flex items-center gap-1">
          {hasPermission("pros.verify") && !p.is_verified && (
            <button
              onClick={(e) => { e.stopPropagation(); handleVerify(p.user_id, true) }}
              disabled={verifyingId === p.user_id}
              className="flex items-center gap-1 px-2 h-7 rounded-md text-[11px] font-medium text-[var(--admin-accent)] bg-[var(--admin-accent-soft)] hover:opacity-80 cursor-pointer disabled:opacity-50"
              title="Approuver"
            >
              {verifyingId === p.user_id ? (
                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5" />
              )}
              Approuver
            </button>
          )}
          {hasPermission("pros.read") && (
            <button
              onClick={(e) => { e.stopPropagation(); navigate(`/admin/pros/${p.user_id}`) }}
              className="text-[11px] font-medium text-[var(--admin-accent)] hover:underline px-2 cursor-pointer"
            >
              Détails
            </button>
          )}
        </div>
      ),
    },
  ]

  if (error) return <ErrorState message={error} onRetry={fetchPros} />

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-gray-900">Professionnels</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">
            {total} pro{total !== 1 ? "s" : ""} sur la plateforme
          </p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2">
        <MiniStat icon={<Users className="w-3.5 h-3.5" />} label="Total" value={counts.total} />
        <MiniStat icon={<UserCheck className="w-3.5 h-3.5" />} label="Vérifiés" value={counts.verified} />
        <MiniStat icon={<Clock className="w-3.5 h-3.5" />} label="En attente" value={counts.pending} />
        <MiniStat icon={<Briefcase className="w-3.5 h-3.5" />} label="Disponibles" value={counts.available} />
        <MiniStat icon={<Circle className="w-3.5 h-3.5 fill-green-500 text-green-500" />} label="En ligne" value={counts.online} />
      </div>

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3.5 py-1.5 rounded-lg text-[12px] font-medium whitespace-nowrap cursor-pointer transition-colors ${
              filter === f.key
                ? "bg-gray-900 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {f.label}
            {f.key !== "all" && (
              <span className="ml-1.5 text-[11px] opacity-60">
                ({pros.filter((p) => {
                  if (f.key === "verified") return p.is_verified
                  if (f.key === "pending") return p.verification_level === "pending" || (!p.is_verified && p.verification_level !== "rejected")
                  if (f.key === "available") return p.is_available
                  if (f.key === "busy") return !p.is_available
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
        keyExtractor={(p) => p.user_id}
        onRowClick={(p) => navigate(`/admin/pros/${p.user_id}`)}
        searchable
        searchKeys={["first_name", "last_name", "business_name", "email"]}
        exportable
        loading={loading}
        emptyMessage="Aucun professionnel trouvé"
      />
    </div>
  )
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 flex items-center gap-2.5">
      <span className="text-gray-400 shrink-0">{icon}</span>
      <div>
        <p className="text-[15px] font-bold text-gray-900 leading-tight">{value}</p>
        <p className="text-[10px] text-gray-500 leading-tight">{label}</p>
      </div>
    </div>
  )
}
