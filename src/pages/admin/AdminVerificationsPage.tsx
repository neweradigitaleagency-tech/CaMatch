import { useState, useEffect, useCallback } from "react"
import { getVerifications, updateVerificationStatus, REJECTION_REASONS, DOC_LABELS } from "../../services/admin/verifications.service"
import type { VerificationRequest, RejectionReason } from "../../services/admin/verifications.service"
import { usePermissions } from "../../hooks/usePermissions"
import AdminTable from "../../components/admin/ui/AdminTable"
import StatusBadge from "../../components/admin/ui/StatusBadge"
import Modal from "../../components/admin/ui/Modal"
import ConfirmDialog from "../../components/admin/ui/ConfirmDialog"
import ErrorState from "../../components/admin/ui/ErrorState"
import { getCategoryLabel } from "../../constants/admin/categoryLabels"
import {
  ShieldCheck, ShieldX, RotateCcw, Eye, FileText, CheckCircle, XCircle,
  Phone, Mail, Star, Clock, Search, UserX, Ban, Lock, AlertTriangle,
  Scan, Camera, Video,
} from "lucide-react"
import type { Column } from "../../components/admin/ui/AdminTable"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

type DocType = "all" | "cni" | "cni_recto" | "cni_verso" | "passport" | "permis" | "casier_judiciaire" | "diplome" | "selfie" | "selfie_normal" | "selfie_cni_main" | "selfie_cni_visage" | "video_liveness"
type StatusFilter = "all" | "pending" | "approved" | "rejected" | "needs_resubmission"

const DOC_TABS: { key: DocType; label: string }[] = [
  { key: "all", label: "Tous" },
  { key: "cni", label: "CNI" },
  { key: "passport", label: "Passeport" },
  { key: "permis", label: "Permis" },
  { key: "casier_judiciaire", label: "Casier" },
  { key: "diplome", label: "Diplôme" },
  { key: "selfie", label: "Selfie" },
]

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "Toutes" },
  { key: "pending", label: "En attente" },
  { key: "approved", label: "Approuvées" },
  { key: "rejected", label: "Rejetées" },
  { key: "needs_resubmission", label: "À revoir" },
]

const STATUS_CONFIG: Record<string, { status: string; label: string }> = {
  pending: { status: "pending", label: "En attente" },
  approved: { status: "approved", label: "Approuvée" },
  rejected: { status: "rejected", label: "Rejetée" },
  needs_resubmission: { status: "under_review", label: "À re-soumettre" },
}

const MOCK_VERIFICATIONS: VerificationRequest[] = [
  { id: "v1", user_id: "p2", level: "verified", document_type: "cni_recto", document_url: "/docs/cni_p2.jpg", status: "pending", created_at: "2026-07-03T10:00:00Z", user_name: "Yao Cissé", user_email: "yao.cisse@example.com", user_phone: "+225 05 6789 012", category: "plombier", phone_verified: true, email_verified: false,
    ai_score: 0.91, ocr_data: { first_name: "Yao", last_name: "Cissé", birth_date: "1992-04-15", document_number: "CN-123456", expiration_date: "2029-04-15", nationality: "CIV", gender: "M" },
    liveness: { status: "passed", score: 0.94, method: "selfie_sequence", attempted_at: "2026-07-03T10:02:00Z" },
  },
  { id: "v2", user_id: "p6", level: "verified", document_type: "passport", document_url: "/docs/passport_p6.jpg", status: "pending", created_at: "2026-07-02T14:30:00Z", user_name: "Adama Traoré", user_email: "adama.traore@example.com", user_phone: "+225 07 5678 901", category: "électricien", phone_verified: true, email_verified: true,
    ai_score: 0.78, ocr_data: { first_name: "Adama", last_name: "Traoré", birth_date: "1988-11-02", document_number: "PA-789012", expiration_date: "2028-11-02", nationality: "CIV", gender: "M" },
    liveness: { status: "passed", score: 0.82, method: "selfie_sequence", attempted_at: "2026-07-02T14:32:00Z" },
  },
  { id: "v3", user_id: "p5", level: "verified", document_type: "permis", document_url: "/docs/permis_p5.jpg", status: "pending", created_at: "2026-07-01T09:00:00Z", user_name: "Fatoumata Kéita", user_email: "fatoumata.keita@example.com", user_phone: "+225 07 1234 567", category: "peintre", phone_verified: false, email_verified: false },
  { id: "v4", user_id: "p7", level: "premium", document_type: "casier_judiciaire", document_url: "/docs/casier_p7.pdf", status: "pending", created_at: "2026-06-30T08:00:00Z", user_name: "Kadidiatou Diallo", user_email: "kadidiatou.diallo@example.com", user_phone: "+225 05 3456 789", category: "nettoyage", phone_verified: true, email_verified: true },
  { id: "v5", user_id: "p8", level: "premium", document_type: "diplome", document_url: "/docs/diplome_p8.pdf", status: "pending", created_at: "2026-06-29T16:00:00Z", ai_score: 0.87, user_name: "Souleymane Bamba", user_email: "souleymane.bamba@example.com", user_phone: "+225 07 7890 123", category: "menuisier", phone_verified: true, email_verified: true },
  { id: "v6", user_id: "p2", level: "verified", document_type: "selfie_normal", document_url: "/docs/selfie_p2.jpg", status: "pending", created_at: "2026-07-03T10:05:00Z", ai_score: 0.92, face_match_score: 0.88, face_verified: true, user_name: "Yao Cissé", user_email: "yao.cisse@example.com", user_phone: "+225 05 6789 012", category: "plombier", phone_verified: true, email_verified: false,
    liveness: { status: "passed", score: 0.91, method: "selfie_sequence", attempted_at: "2026-07-03T10:05:00Z" },
  },
  { id: "v11", user_id: "p9", level: "premium", document_type: "selfie_cni_visage", document_url: "/docs/selfie_cni_p9.jpg", status: "pending", created_at: "2026-07-04T08:00:00Z", ai_score: 0.65, face_match_score: 0.55, face_verified: false, user_name: "Moussa Koné", user_email: "moussa.kone@example.com", user_phone: "+225 05 1111 222", category: "plombier", phone_verified: true, email_verified: true,
    liveness: { status: "failed", score: 0.45, method: "selfie_sequence", attempted_at: "2026-07-04T08:02:00Z" },
  },
  { id: "v12", user_id: "p10", level: "premium", document_type: "video_liveness", document_url: "/docs/video_p10.mp4", status: "pending", created_at: "2026-07-04T09:00:00Z", user_name: "Aminata Diallo", user_email: "aminata.diallo@example.com", user_phone: "+225 07 3333 444", category: "femme_de_ménage", phone_verified: true, email_verified: true,
    liveness: { status: "passed", score: 0.97, method: "video", attempted_at: "2026-07-04T09:01:00Z" },
  },
  { id: "v7", user_id: "p1", level: "premium", document_type: "cni_recto", document_url: "/docs/cni_p1.jpg", document_back_url: "/docs/cni_p1_back.jpg", status: "approved", created_at: "2026-06-20T08:00:00Z", reviewed_at: "2026-06-21T10:00:00Z", reviewed_by_name: "Admin", ai_score: 0.95, user_name: "Mamadou Sylla", user_email: "mamadou.sylla@example.com", user_phone: "+225 07 2345 678", category: "électricien", phone_verified: true, email_verified: true,
    ocr_data: { first_name: "Mamadou", last_name: "Sylla", birth_date: "1990-03-22", document_number: "CN-789012", expiration_date: "2029-03-22", nationality: "CIV", gender: "M" },
    liveness: { status: "passed", score: 0.96, method: "selfie_sequence", attempted_at: "2026-06-20T08:05:00Z" },
  },
  { id: "v8", user_id: "p4", level: "premium", document_type: "selfie_cni_main", document_url: "/docs/selfie_p4.jpg", status: "approved", created_at: "2026-06-15T11:00:00Z", reviewed_at: "2026-06-16T09:00:00Z", reviewed_by_name: "Admin", ai_score: 0.98, face_match_score: 0.95, face_verified: true, user_name: "Ibrahim Sangaré", user_email: "ibrahim.sangare@example.com", user_phone: "+225 05 8901 234", category: "jardinage", phone_verified: true, email_verified: true,
    liveness: { status: "passed", score: 0.98, method: "selfie_sequence", attempted_at: "2026-06-15T11:03:00Z" },
  },
  { id: "v9", user_id: "p3", level: "basic", document_type: "cni_recto", document_url: "/docs/cni_p3.jpg", status: "rejected", created_at: "2026-06-10T13:00:00Z", reviewed_at: "2026-06-11T15:00:00Z", review_notes: "Document illisible, veuillez re-soumettre", rejection_reason: "photo_floue", reviewed_by_name: "Admin", user_name: "Drissa Tounkara", user_email: "drissa.tounkara@example.com", user_phone: "+225 05 4567 890", category: "maçon", phone_verified: true, email_verified: true,
    ocr_data: { first_name: "Drissa", last_name: "Tounkara", birth_date: "1985-07-10", document_number: "CN-345678" },
  },
  { id: "v10", user_id: "p6", level: "basic", document_type: "permis", document_url: "/docs/permis_p6.jpg", status: "needs_resubmission", created_at: "2026-06-28T11:00:00Z", reviewed_at: "2026-06-29T08:00:00Z", review_notes: "La photo est trop sombre, veuillez prendre une nouvelle photo bien éclairée", rejection_reason: "luminosite_insuffisante", reviewed_by_name: "Admin", user_name: "Adama Traoré", user_email: "adama.traore@example.com", user_phone: "+225 07 5678 901", category: "électricien", phone_verified: true, email_verified: true },
]

const VERIF_HISTORY = [
  { id: "h1", action: "Approbation", target: "Mamadou Sylla", doc: "CNI", date: "2026-06-21T10:00:00Z", by: "Admin" },
  { id: "h2", action: "Approbation", target: "Ibrahim Sangaré", doc: "Selfie avec CNI", date: "2026-06-16T09:00:00Z", by: "Admin" },
  { id: "h3", action: "Rejet", target: "Drissa Tounkara", doc: "CNI", date: "2026-06-11T15:00:00Z", by: "Admin", note: "Photo floue", reason: "photo_floue" },
  { id: "h4", action: "Modifications demandées", target: "Adama Traoré", doc: "Permis", date: "2026-06-29T08:00:00Z", by: "Admin", note: "Luminosité insuffisante", reason: "luminosite_insuffisante" },
]

const REJECTION_REASON_LABEL = Object.fromEntries(REJECTION_REASONS.map((r) => [r.value, r.label]))

function getDocumentIcon(type: string) {
  if (type.startsWith("selfie") || type === "selfie") return Camera
  if (type === "video_liveness") return Video
  return FileText
}

export default function AdminVerificationsPage() {
  const { hasPermission } = usePermissions()
  const [verifications, setVerifications] = useState<VerificationRequest[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [docType, setDocType] = useState<DocType>("all")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [selected, setSelected] = useState<VerificationRequest | null>(null)
  const [reviewNotes, setReviewNotes] = useState("")
  const [rejectionReason, setRejectionReason] = useState<RejectionReason | "">("")
  const [privateNotes, setPrivateNotes] = useState("")
  const [suspendConfirm, setSuspendConfirm] = useState<VerificationRequest | null>(null)
  const [banConfirm, setBanConfirm] = useState<VerificationRequest | null>(null)

  const fetchVerifications = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { verifications: data, total: count } = await getVerifications({ perPage: 100 })
      if (data.length > 0) {
        setVerifications(data)
        setTotal(count)
      } else {
        setVerifications(MOCK_VERIFICATIONS)
        setTotal(MOCK_VERIFICATIONS.length)
      }
    } catch {
      setVerifications(MOCK_VERIFICATIONS)
      setTotal(MOCK_VERIFICATIONS.length)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchVerifications() }, [fetchVerifications])

  const handleAction = async (id: string, status: "approved" | "rejected" | "needs_resubmission") => {
    setActionLoading(id)
    try {
      await updateVerificationStatus(id, status, {
        reviewNotes: reviewNotes || undefined,
        rejectionReason: rejectionReason || undefined,
        privateNotes: privateNotes || undefined,
      })
      setVerifications((prev) =>
        prev.map((v) =>
          v.id === id
            ? { ...v, status, review_notes: reviewNotes || v.review_notes, rejection_reason: (rejectionReason || v.rejection_reason) as RejectionReason | undefined, private_notes: privateNotes || v.private_notes }
            : v
        )
      )
      setSelected(null)
      setReviewNotes("")
      setRejectionReason("")
      setPrivateNotes("")
    } catch {
      /* silent */
    } finally {
      setActionLoading(null)
    }
  }

  const openDetail = (v: VerificationRequest) => {
    setSelected(v)
    setReviewNotes("")
    setRejectionReason("")
    setPrivateNotes("")
  }

  const filtered = verifications.filter((v) => {
    if (docType !== "all" && v.document_type !== docType) return false
    if (statusFilter !== "all" && v.status !== statusFilter) return false
    return true
  })

  const counts = {
    pending: verifications.filter((v) => v.status === "pending").length,
    approvedToday: verifications.filter((v) => v.status === "approved" && new Date(v.reviewed_at ?? "").toDateString() === new Date().toDateString()).length,
    totalVerified: verifications.filter((v) => v.status === "approved").length,
  }

  const columns: Column<VerificationRequest>[] = [
    {
      key: "user_name",
      label: "Demandeur",
      sortable: true,
      width: "200px",
      render: (v) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[12px] font-semibold text-gray-600 shrink-0">
            {(v.user_name || "?").charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-gray-900 truncate">{v.user_name || "Utilisateur"}</p>
            <p className="text-[11px] text-gray-400 truncate">{v.user_email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "document_type",
      label: "Document",
      sortable: true,
      width: "140px",
      render: (v) => {
        const DocIcon = getDocumentIcon(v.document_type)
        return (
          <span className="inline-flex items-center gap-1.5 text-[12px] text-gray-600">
            <DocIcon className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{DOC_LABELS[v.document_type] ?? v.document_type}</span>
            {v.document_back_url && <span className="text-[10px] text-gray-400 shrink-0">(R+V)</span>}
          </span>
        )
      },
    },
    {
      key: "liveness",
      label: "Liveness",
      sortable: true,
      width: "80px",
      render: (v) => {
        if (!v.liveness) return <span className="text-[11px] text-gray-400">—</span>
        return (
          <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${
            v.liveness.status === "passed" ? "text-emerald-600" :
            v.liveness.status === "failed" ? "text-red-600" : "text-gray-400"
          }`}>
            {v.liveness.status === "passed" ? <CheckCircle className="w-3 h-3" /> :
             v.liveness.status === "failed" ? <XCircle className="w-3 h-3" /> :
             <Clock className="w-3 h-3" />}
            {v.liveness.status === "passed" ? "OK" : v.liveness.status === "failed" ? "Échec" : "—"}
          </span>
        )
      },
    },
    {
      key: "ai_score",
      label: "Score IA",
      sortable: true,
      width: "80px",
      render: (v) => v.ai_score ? (
        <span className={`inline-flex items-center gap-1 text-[12px] font-medium ${v.ai_score >= 0.8 ? "text-emerald-600" : v.ai_score >= 0.5 ? "text-amber-600" : "text-red-600"}`}>
          <Star className="w-3 h-3" />{(v.ai_score * 100).toFixed(0)}%
        </span>
      ) : <span className="text-[11px] text-gray-400">—</span>,
    },
    {
      key: "status",
      label: "Statut",
      sortable: true,
      width: "120px",
      render: (v) => {
        const cfg = STATUS_CONFIG[v.status] ?? { status: "pending", label: v.status }
        return (
          <div className="flex items-center gap-1.5">
            <StatusBadge status={cfg.status} label={cfg.label} />
            {v.rejection_reason && (v.status === "rejected" || v.status === "needs_resubmission") && (
              <span className="text-[10px] text-gray-400 truncate max-w-[80px]" title={REJECTION_REASON_LABEL[v.rejection_reason] ?? v.rejection_reason}>
                ({REJECTION_REASON_LABEL[v.rejection_reason] ?? v.rejection_reason})
              </span>
            )}
          </div>
        )
      },
    },
    {
      key: "created_at",
      label: "Reçu le",
      sortable: true,
      width: "100px",
      render: (v) => (
        <span className="text-[12px] text-gray-500">
          {format(new Date(v.created_at), "d MMM", { locale: fr })}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      width: "60px",
      render: (v) => (
        <button
          onClick={(e) => { e.stopPropagation(); openDetail(v) }}
          className="flex items-center gap-1 text-[11px] font-medium text-[var(--admin-accent)] hover:underline cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" /> Voir
        </button>
      ),
    },
  ]

  if (error) return <ErrorState message={error} onRetry={fetchVerifications} />

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-gray-900">Vérifications KYC</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">{total} demande{total !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <MiniStat icon={<Clock className="w-3.5 h-3.5" />} label="En attente" value={counts.pending} />
        <MiniStat icon={<CheckCircle className="w-3.5 h-3.5" />} label="Approuvées aujourd'hui" value={counts.approvedToday} />
        <MiniStat icon={<ShieldCheck className="w-3.5 h-3.5" />} label="Total vérifiés" value={counts.totalVerified} />
        <MiniStat icon={<AlertTriangle className="w-3.5 h-3.5" />} label="Liveness échoué" value={verifications.filter((v) => v.liveness?.status === "failed").length} />
      </div>

      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar bg-white border border-gray-200 rounded-xl p-1">
        {DOC_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setDocType(t.key)}
            className={`px-3.5 py-1.5 rounded-lg text-[12px] font-medium whitespace-nowrap cursor-pointer transition-colors ${
              docType === t.key ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap cursor-pointer transition-colors ${
              statusFilter === f.key
                ? "bg-gray-200 text-gray-900"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            {f.label}
            <span className="ml-1 opacity-60">
              ({f.key === "all" ? verifications.length : verifications.filter((v) => v.status === f.key).length})
            </span>
          </button>
        ))}
      </div>

      <AdminTable
        columns={columns}
        data={filtered}
        keyExtractor={(v) => v.id}
        onRowClick={(v) => openDetail(v)}
        searchable
        searchKeys={["user_name", "user_email", "category"]}
        exportable
        loading={loading}
        emptyMessage="Aucune demande de vérification"
      />

      <div className="bg-white border border-gray-200 rounded-xl">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="text-[13px] font-semibold text-gray-900">Historique des vérifications</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {VERIF_HISTORY.map((h) => (
            <div key={h.id} className="flex items-start gap-3 px-4 py-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                h.action === "Approbation" ? "bg-emerald-100 text-emerald-600" :
                h.action === "Rejet" ? "bg-red-100 text-red-600" :
                "bg-amber-100 text-amber-600"
              }`}>
                {h.action === "Approbation" ? <CheckCircle className="w-3.5 h-3.5" /> :
                 h.action === "Rejet" ? <XCircle className="w-3.5 h-3.5" /> :
                 <RotateCcw className="w-3.5 h-3.5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[12px] font-medium text-gray-900">{h.action}</span>
                  <span className="text-[12px] text-gray-500">— {h.target}</span>
                  <span className="text-[11px] text-gray-400">({h.doc})</span>
                </div>
                {h.reason && (
                  <span className="inline-block mt-0.5 text-[10px] font-medium text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
                    {REJECTION_REASON_LABEL[h.reason as RejectionReason] ?? h.reason}
                  </span>
                )}
                {h.note && <p className="text-[11px] text-gray-400 mt-0.5">{h.note}</p>}
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Par {h.by} — {format(new Date(h.date), "d MMM HH:mm", { locale: fr })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={!!selected} onClose={() => { setSelected(null); setReviewNotes(""); setRejectionReason(""); setPrivateNotes("") }} title="Détail de la vérification" size="xl">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[14px] font-semibold text-gray-900">{selected.user_name}</p>
                <p className="text-[12px] text-gray-500">{DOC_LABELS[selected.document_type] ?? selected.document_type} — {getCategoryLabel(selected.category ?? "") || "—"}</p>
              </div>
              <StatusBadge
                status={STATUS_CONFIG[selected.status]?.status ?? "pending"}
                label={STATUS_CONFIG[selected.status]?.label ?? selected.status}
                size="md"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-center text-gray-400 min-h-[160px] border-2 border-dashed border-gray-200">
                <div className="text-center">
                  <FileText className="w-10 h-10 mx-auto mb-2" />
                  <p className="text-[13px] font-medium">Document principal</p>
                  <p className="text-[11px] break-all">{selected.document_url}</p>
                </div>
              </div>
              <div className="space-y-3">
                {selected.document_back_url && (
                  <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-center text-gray-400 min-h-[70px] border-2 border-dashed border-gray-200">
                    <div className="text-center">
                      <p className="text-[11px] font-medium">Verso du document</p>
                      <p className="text-[10px] break-all">{selected.document_back_url}</p>
                    </div>
                  </div>
                )}
                {selected.ocr_data && (
                  <div className="bg-white border border-gray-200 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Scan className="w-3.5 h-3.5 text-gray-400" />
                      <p className="text-[11px] font-medium text-gray-600">Données OCR</p>
                    </div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                      {selected.ocr_data.first_name && (
                        <>
                          <span className="text-[10px] text-gray-400">Prénom</span>
                          <span className="text-[11px] text-gray-900 text-right">{selected.ocr_data.first_name}</span>
                        </>
                      )}
                      {selected.ocr_data.last_name && (
                        <>
                          <span className="text-[10px] text-gray-400">Nom</span>
                          <span className="text-[11px] text-gray-900 text-right">{selected.ocr_data.last_name}</span>
                        </>
                      )}
                      {selected.ocr_data.birth_date && (
                        <>
                          <span className="text-[10px] text-gray-400">Date naissance</span>
                          <span className="text-[11px] text-gray-900 text-right">{format(new Date(selected.ocr_data.birth_date), "dd/MM/yyyy")}</span>
                        </>
                      )}
                      {selected.ocr_data.document_number && (
                        <>
                          <span className="text-[10px] text-gray-400">N° document</span>
                          <span className="text-[11px] text-gray-900 text-right font-mono">{selected.ocr_data.document_number}</span>
                        </>
                      )}
                      {selected.ocr_data.expiration_date && (
                        <>
                          <span className="text-[10px] text-gray-400">Expiration</span>
                          <span className={`text-[11px] text-right ${new Date(selected.ocr_data.expiration_date) < new Date() ? "text-red-500 font-medium" : "text-gray-900"}`}>
                            {format(new Date(selected.ocr_data.expiration_date), "dd/MM/yyyy")}
                            {new Date(selected.ocr_data.expiration_date) < new Date() && " (expiré)"}
                          </span>
                        </>
                      )}
                      {selected.ocr_data.nationality && (
                        <>
                          <span className="text-[10px] text-gray-400">Nationalité</span>
                          <span className="text-[11px] text-gray-900 text-right">{selected.ocr_data.nationality}</span>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white border border-gray-200 rounded-xl p-3">
                <p className="text-[11px] text-gray-500 font-medium mb-2">Scores IA</p>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-gray-500">Document</span>
                    <span className={`text-[12px] font-medium ${(selected.ai_score ?? 0) >= 0.8 ? "text-emerald-600" : (selected.ai_score ?? 0) >= 0.5 ? "text-amber-600" : "text-red-600"}`}>
                      {selected.ai_score ? `${(selected.ai_score * 100).toFixed(0)}%` : "—"}
                    </span>
                  </div>
                  {(selected.document_type.includes("selfie") || selected.face_match_score) && (
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-gray-500">Correspondance faciale</span>
                      <span className={`text-[12px] font-medium ${(selected.face_match_score ?? 0) >= 0.8 ? "text-emerald-600" : (selected.face_match_score ?? 0) >= 0.5 ? "text-amber-600" : "text-red-600"}`}>
                        {selected.face_match_score ? `${(selected.face_match_score * 100).toFixed(0)}%` : "—"}
                      </span>
                    </div>
                  )}
                  {selected.face_verified !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-gray-500">Visage vérifié</span>
                      <span className={`text-[11px] font-medium ${selected.face_verified ? "text-emerald-600" : "text-red-500"}`}>
                        {selected.face_verified ? "Oui" : "Non"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Video className="w-3.5 h-3.5 text-gray-400" />
                  <p className="text-[11px] text-gray-500 font-medium">Liveness</p>
                </div>
                {selected.liveness ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-gray-500">Statut</span>
                      <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                        selected.liveness.status === "passed" ? "text-emerald-600" :
                        selected.liveness.status === "failed" ? "text-red-600" : "text-gray-400"
                      }`}>
                        {selected.liveness.status === "passed" ? <CheckCircle className="w-3 h-3" /> :
                         selected.liveness.status === "failed" ? <XCircle className="w-3 h-3" /> :
                         <Clock className="w-3 h-3" />}
                        {selected.liveness.status === "passed" ? "Réussi" :
                         selected.liveness.status === "failed" ? "Échoué" : "Non tenté"}
                      </span>
                    </div>
                    {selected.liveness.score && (
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-gray-500">Score</span>
                        <span className={`text-[12px] font-medium ${selected.liveness.score >= 0.8 ? "text-emerald-600" : "text-red-600"}`}>
                          {(selected.liveness.score * 100).toFixed(0)}%
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-gray-500">Méthode</span>
                      <span className="text-[11px] text-gray-700 capitalize">
                        {selected.liveness.method === "video" ? "Vidéo 5s" :
                         selected.liveness.method === "selfie_sequence" ? "Selfies multiples" : "—"}
                      </span>
                    </div>
                    {selected.liveness.attempted_at && (
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-gray-500">Tenté le</span>
                        <span className="text-[11px] text-gray-700">
                          {format(new Date(selected.liveness.attempted_at), "HH:mm", { locale: fr })}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-[11px] text-gray-400">Aucune vérification liveness</p>
                )}
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-3">
                <p className="text-[11px] text-gray-500 font-medium mb-2">Vérifications compte</p>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-[11px] text-gray-500"><Mail className="w-3 h-3" /> Email</span>
                    <span className={`text-[11px] font-medium ${selected.email_verified ? "text-emerald-600" : "text-red-500"}`}>
                      {selected.email_verified ? "Vérifié" : "Non vérifié"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-[11px] text-gray-500"><Phone className="w-3 h-3" /> Téléphone</span>
                    <span className={`text-[11px] font-medium ${selected.phone_verified ? "text-emerald-600" : "text-red-500"}`}>
                      {selected.phone_verified ? "Vérifié" : "Non vérifié"}
                    </span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
                  {hasPermission("users.suspend") && (
                    <button onClick={() => setSuspendConfirm(selected)}
                      className="flex items-center gap-1 h-7 px-2.5 rounded-lg text-[10px] font-medium text-amber-600 bg-amber-50 border border-amber-200 hover:bg-amber-100 cursor-pointer">
                      <Ban className="w-3 h-3" /> Suspendre
                    </button>
                  )}
                  {hasPermission("users.ban") && (
                    <button onClick={() => setBanConfirm(selected)}
                      className="flex items-center gap-1 h-7 px-2.5 rounded-lg text-[10px] font-medium text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 cursor-pointer">
                      <UserX className="w-3 h-3" /> Bannir
                    </button>
                  )}
                </div>
              </div>
            </div>

            {selected.review_notes && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[11px] text-gray-500 font-medium mb-1">Notes de review précédentes</p>
                {selected.rejection_reason && (
                  <span className="inline-block mb-1.5 text-[10px] font-medium text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
                    Motif : {REJECTION_REASON_LABEL[selected.rejection_reason] ?? selected.rejection_reason}
                  </span>
                )}
                <p className="text-[12px] text-gray-700">{selected.review_notes}</p>
              </div>
            )}

            {selected.private_notes && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Lock className="w-3 h-3 text-amber-500" />
                  <p className="text-[11px] font-medium text-amber-700">Notes internes (privées)</p>
                </div>
                <p className="text-[12px] text-amber-800">{selected.private_notes}</p>
              </div>
            )}

            {selected.status === "pending" && (hasPermission("verifications.approve") || hasPermission("verifications.reject")) && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-gray-500 font-medium block mb-1">Notes pour le pro</label>
                    <textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Ajouter une note optionnelle..."
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)] resize-none"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-500 font-medium block mb-1">Motif de refus</label>
                    <select
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value as RejectionReason | "")}
                      className="w-full h-9 px-3 text-[12px] bg-gray-50 border border-gray-200 rounded-lg outline-none text-gray-900 focus:border-gray-300 cursor-pointer"
                    >
                      <option value="">Sélectionner un motif (optionnel)</option>
                      {REJECTION_REASONS.map((r) => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-gray-500 font-medium block mb-1">
                    <span className="flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Note interne (privée, non visible par le pro)
                    </span>
                  </label>
                  <textarea
                    value={privateNotes}
                    onChange={(e) => setPrivateNotes(e.target.value)}
                    placeholder="Ajouter une note interne..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)] resize-none"
                    rows={1}
                  />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  {hasPermission("verifications.approve") && (
                    <button
                      onClick={() => handleAction(selected.id, "approved")}
                      disabled={actionLoading === selected.id}
                      className="flex items-center gap-1.5 h-9 px-4 rounded-lg text-[12px] font-medium cursor-pointer disabled:opacity-50 transition-colors bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                    >
                      {actionLoading === selected.id ? (
                        <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : <CheckCircle className="w-3.5 h-3.5" />}
                      Approuver
                    </button>
                  )}
                  {hasPermission("verifications.reject") && (
                    <button
                      onClick={() => handleAction(selected.id, "needs_resubmission")}
                      disabled={actionLoading === selected.id}
                      className="flex items-center gap-1.5 h-9 px-4 rounded-lg text-[12px] font-medium cursor-pointer disabled:opacity-50 transition-colors bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Demander modification
                    </button>
                  )}
                  {hasPermission("verifications.reject") && (
                    <button
                      onClick={() => handleAction(selected.id, "rejected")}
                      disabled={actionLoading === selected.id}
                      className="flex items-center gap-1.5 h-9 px-4 rounded-lg text-[12px] font-medium cursor-pointer disabled:opacity-50 transition-colors bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Rejeter
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!suspendConfirm}
        onCancel={() => setSuspendConfirm(null)}
        onConfirm={() => { setSuspendConfirm(null); setSelected(null) }}
        title="Suspendre le compte"
        message={`Êtes-vous sûr de vouloir suspendre le compte de "${suspendConfirm?.user_name}" ? Le pro ne pourra plus recevoir de missions pendant la suspension.`}
        confirmLabel="Suspendre"
        variant="warning"
      />

      <ConfirmDialog
        isOpen={!!banConfirm}
        onCancel={() => setBanConfirm(null)}
        onConfirm={() => { setBanConfirm(null); setSelected(null) }}
        title="Bannir l'utilisateur"
        message={`Êtes-vous sûr de vouloir bannir définitivement "${banConfirm?.user_name}" ? Cette action est irréversible et supprimera l'accès au compte.`}
        confirmLabel="Bannir"
        variant="danger"
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
