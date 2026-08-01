import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getMissionById, getMissionTimeline, getMissionConversation, MISSION_STATUS_LABELS } from "../../services/admin/missions.service"
import { usePermissions } from "../../hooks/usePermissions"
import StatusBadge from "../../components/admin/ui/StatusBadge"
import ErrorState from "../../components/admin/ui/ErrorState"
import { formatXOF } from "../../utils/admin/formatCurrency"
import { getCategoryLabel } from "../../constants/admin/categoryLabels"
import {
  ArrowLeft, MapPin, Calendar, Clock, User, Briefcase, CreditCard, MessageSquare,
  AlertTriangle, Image, FileText, Phone, Mail, ChevronDown, ChevronUp,
} from "lucide-react"
import type { MissionDetail, MissionTimelineEvent, MissionMessage } from "../../services/admin/missions.service"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

const URGENCY_LABELS: Record<string, string> = { low: "Basse", medium: "Moyenne", high: "Haute", emergency: "Urgence" }
const URGENCY_STYLES: Record<string, string> = { low: "text-cm-text-muted bg-cm-surface border-cm-border", medium: "text-amber-700 bg-amber-50 border-amber-200", high: "text-orange-700 bg-orange-50 border-orange-200", emergency: "text-red-700 bg-red-50 border-red-200 font-semibold" }

export default function AdminMissionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { hasPermission } = usePermissions()
  const [mission, setMission] = useState<MissionDetail | null>(null)
  const [timeline, setTimeline] = useState<MissionTimelineEvent[]>([])
  const [conversation, setConversation] = useState<MissionMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAllPhotos, setShowAllPhotos] = useState(false)

  const fetchData = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const m = await getMissionById(id)
      if (!m) { setError("Mission introuvable"); return }
      setMission(m)

      if (m.job_id) {
        const [tl, conv] = await Promise.all([
          getMissionTimeline(m.job_id),
          getMissionConversation(m.job_id),
        ])
        setTimeline(tl)
        setConversation(conv)
      }
    } catch {
      setError("Impossible de charger les détails de la mission")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchData() }, [fetchData])

  if (error) return <ErrorState message={error} onRetry={fetchData} />
  if (loading) return <DetailSkeleton />
  if (!mission) return <ErrorState message="Mission introuvable" onRetry={() => navigate("/admin/missions")} />

  const photos = [...(mission.before_photos ?? []), ...(mission.after_photos ?? [])]
  const displayPhotos = showAllPhotos ? photos : photos.slice(0, 4)

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/admin/missions")} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-cm-surface cursor-pointer">
          <ArrowLeft className="w-4 h-4 text-cm-text-soft" />
        </button>
        <div>
          <h1 className="text-[20px] font-bold text-cm-text">Mission {mission.id.slice(0, 8)}</h1>
          <p className="text-[13px] text-cm-text-muted mt-0.5">Détails, suivi et gestion de la mission</p>
        </div>
      </div>

      <div className="bg-cm-elevated border border-cm-border rounded-xl p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-[16px] font-bold text-cm-text">{getCategoryLabel(mission.category)}</h2>
            <p className="text-[12px] text-cm-text-muted mt-0.5">Créée le {format(new Date(mission.created_at), "d MMMM yyyy HH:mm", { locale: fr })}</p>
          </div>
          <StatusBadge status={STATUS_STYLES[mission.status] ?? "inactive"} label={MISSION_STATUS_LABELS[mission.status] ?? mission.status} size="md" />
        </div>

        {mission.description && (
          <p className="text-[13px] text-cm-text-soft leading-relaxed mb-4">{mission.description}</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-[12px] text-cm-text-muted">
            <MapPin className="w-3.5 h-3.5 shrink-0" /> {mission.address}
          </div>
          <div className="flex items-center gap-2 text-[12px] text-cm-text-muted">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            {mission.scheduled_at ? format(new Date(mission.scheduled_at), "d MMMM yyyy HH:mm", { locale: fr }) : "Non planifiée"}
          </div>
          <div className="flex items-center gap-2 text-[12px] text-cm-text-muted">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span className={`px-2 py-0.5 text-[11px] rounded-md border ${URGENCY_STYLES[mission.urgency]}`}>{URGENCY_LABELS[mission.urgency]}</span>
          </div>
          <div className="flex items-center gap-2 text-[12px] text-cm-text-muted">
            <CreditCard className="w-3.5 h-3.5 shrink-0" />
            {mission.final_price ? `${mission.final_price.toLocaleString()} F` : mission.estimated_price_min ? `${mission.estimated_price_min.toLocaleString()} - ${mission.estimated_price_max?.toLocaleString()} F` : "Prix non défini"}
          </div>
        </div>

        {mission.duration_mins && (
          <div className="flex items-center gap-2 text-[12px] text-cm-text-muted mt-2">
            <Clock className="w-3.5 h-3.5 shrink-0" /> Durée : {mission.duration_mins} min
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section title={<><User className="w-4 h-4" /> Client</>}>
          <DetailRow label="Nom" value={mission.client_name || "—"} />
          <DetailRow label="Téléphone" value={mission.client_phone || "—"} />
          <DetailRow label="Email" value={mission.client_email || "—"} />
        </Section>
        <Section title={<><Briefcase className="w-4 h-4" /> Professionnel</>}>
          <DetailRow label="Nom" value={mission.pro_name || "—"} />
          <DetailRow label="Téléphone" value={mission.pro_phone || "—"} />
          <DetailRow label="Email" value={mission.pro_email || "—"} />
        </Section>
      </div>

      {timeline.length > 0 && (
        <div className="bg-cm-elevated border border-cm-border rounded-xl p-4">
          <h3 className="text-[13px] font-semibold text-cm-text mb-4 flex items-center gap-2"><Clock className="w-4 h-4" /> Chronologie</h3>
          <div className="relative pl-6 space-y-4">
            <div className="absolute left-[7px] top-1 bottom-1 w-0.5 bg-cm-border-soft" />
            {timeline.map((t, i) => (
              <div key={t.id} className="relative">
                <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 ${i === timeline.length - 1 ? "bg-[var(--admin-accent)] border-[var(--admin-accent)]" : "bg-cm-elevated border-cm-border"}`} />
                <p className="text-[12px] font-medium text-cm-text">{t.event}</p>
                <p className="text-[11px] text-cm-text-muted">
                  {format(new Date(t.created_at), "d MMM HH:mm", { locale: fr })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {conversation.length > 0 && (
        <div className="bg-cm-elevated border border-cm-border rounded-xl">
          <div className="px-4 py-3 border-b border-cm-border/40 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-[13px] font-semibold text-cm-text"><MessageSquare className="w-4 h-4" /> Conversation</h3>
            <span className="text-[11px] text-cm-text-muted">{conversation.length} message{conversation.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="divide-y divide-cm-border/40 max-h-[400px] overflow-y-auto">
            {conversation.map((msg) => (
              <div key={msg.id} className="px-4 py-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] font-medium text-cm-text">{msg.sender_name || "Système"}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${msg.sender_role === "pro" ? "text-[var(--admin-accent)] bg-[var(--admin-accent-soft)] border-[var(--admin-accent)]" : "text-blue-600 bg-blue-50 border-blue-200"}`}>
                    {msg.sender_role === "pro" ? "Pro" : msg.sender_role === "client" ? "Client" : "Système"}
                  </span>
                </div>
                <p className="text-[12px] text-cm-text-soft">{msg.content}</p>
                {msg.media_url && (
                  <div className="mt-1.5">
                    <span className="text-[11px] text-blue-600 underline">{msg.media_url}</span>
                  </div>
                )}
                <p className="text-[11px] text-cm-text-muted mt-1">{format(new Date(msg.created_at), "d MMM HH:mm", { locale: fr })}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section title={<><CreditCard className="w-4 h-4" /> Paiement</>}>
          <DetailRow label="Statut" value={mission.payment_status ? getPaymentStatusLabel(mission.payment_status) : "Non initié"} />
          <DetailRow label="Méthode" value={mission.payment_method ? getPaymentLabel(mission.payment_method) : "—"} />
          <DetailRow label="Montant" value={mission.final_price ? formatXOF(mission.final_price) : "—"} />
          {mission.platform_fee !== undefined && <DetailRow label="Frais plateforme" value={formatXOF(mission.platform_fee)} />}
          {mission.net_amount !== undefined && <DetailRow label="Net professionnel" value={formatXOF(mission.net_amount)} />}
        </Section>

        <Section title={<><FileText className="w-4 h-4" /> Notes</>}>
          {mission.client_notes ? (
            <div className="mb-3">
              <p className="text-[11px] text-cm-text-muted font-medium mb-1">Notes du client</p>
              <p className="text-[12px] text-cm-text-soft bg-cm-surface rounded-lg p-2.5">{mission.client_notes}</p>
            </div>
          ) : null}
          {mission.pro_notes ? (
            <div>
              <p className="text-[11px] text-cm-text-muted font-medium mb-1">Notes du professionnel</p>
              <p className="text-[12px] text-cm-text-soft bg-cm-surface rounded-lg p-2.5">{mission.pro_notes}</p>
            </div>
          ) : null}
          {!mission.client_notes && !mission.pro_notes && (
            <p className="text-[12px] text-cm-text-muted py-4 text-center">Aucune note</p>
          )}
        </Section>
      </div>

      {photos.length > 0 && (
        <div className="bg-cm-elevated border border-cm-border rounded-xl p-4">
          <h3 className="text-[13px] font-semibold text-cm-text mb-4 flex items-center gap-2"><Image className="w-4 h-4" /> Photos {mission.before_photos?.length ? `(${displayPhotos.length}/${photos.length})` : ""}</h3>
          {mission.before_photos && mission.before_photos.length > 0 && (
            <div className="mb-3">
              <p className="text-[11px] text-cm-text-muted font-medium mb-2">Avant</p>
              <div className="flex gap-2 overflow-x-auto">
                {mission.before_photos.map((url, i) => (
                  <div key={i} className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-cm-surface border border-cm-border">
                    <img src={url} alt={`Avant ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
          {mission.after_photos && mission.after_photos.length > 0 && (
            <div>
              <p className="text-[11px] text-cm-text-muted font-medium mb-2">Après</p>
              <div className="flex gap-2 overflow-x-auto">
                {mission.after_photos.map((url, i) => (
                  <div key={i} className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-cm-surface border border-cm-border">
                    <img src={url} alt={`Après ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function getPaymentStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: "En attente", processing: "En cours", completed: "Effectué", failed: "Échoué", refunded: "Remboursé", cancelled: "Annulé",
  }
  return labels[status] ?? status
}

function getPaymentLabel(method: string): string {
  const labels: Record<string, string> = {
    wave: "Wave", orange_money: "Orange Money", mtn: "MTN Mobile Money",
    bank_transfer: "Virement bancaire", visa: "Visa", mastercard: "Mastercard",
    paypal: "PayPal", bitcoin: "Bitcoin", usdt: "USDT", cash: "Espèces",
  }
  return labels[method] ?? method
}

const STATUS_STYLES: Record<string, string> = {
  draft: "inactive", pending: "pending", quoted: "info", accepted: "info",
  in_progress: "info", completed: "active", cancelled: "rejected", disputed: "suspended",
}

function Section({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-cm-elevated border border-cm-border rounded-xl p-4">
      <h3 className="text-[13px] font-semibold text-cm-text mb-3 flex items-center gap-2">{title}</h3>
      <dl className="space-y-2.5">{children}</dl>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-[12px] text-cm-text-muted">{label}</dt>
      <dd className="text-[12px] font-medium text-cm-text text-right truncate ml-4">{value}</dd>
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse max-w-4xl">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-cm-border-soft rounded-lg" />
        <div className="space-y-1">
          <div className="h-5 bg-cm-border-soft rounded w-48" />
          <div className="h-3 bg-cm-border-soft rounded w-32" />
        </div>
      </div>
      <div className="bg-cm-elevated border border-cm-border rounded-xl p-5 space-y-3">
        <div className="h-5 bg-cm-border-soft rounded w-56" />
        <div className="h-3 bg-cm-border-soft rounded w-full" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-3 bg-cm-border-soft rounded w-40" />
          <div className="h-3 bg-cm-border-soft rounded w-40" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-cm-elevated border border-cm-border rounded-xl p-4 space-y-2">
            <div className="h-4 bg-cm-border-soft rounded w-24" />
            <div className="h-3 bg-cm-border-soft rounded w-32" />
            <div className="h-3 bg-cm-border-soft rounded w-28" />
          </div>
        ))}
      </div>
    </div>
  )
}
