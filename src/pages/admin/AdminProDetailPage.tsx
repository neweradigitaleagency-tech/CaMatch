import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getProById, verifyPro } from "../../services/admin/pros.service"
import { getTrustScores } from "../../services/admin/trust.service"
import type { UnifiedTrustScore } from "../../services/admin/trust.service"
import { usePermissions } from "../../hooks/usePermissions"
import StatusBadge from "../../components/admin/ui/StatusBadge"
import ErrorState from "../../components/admin/ui/ErrorState"
import TrustScoreCard from "../../components/admin/TrustScoreCard"
import { formatXOF } from "../../utils/admin/formatCurrency"
import {
  ArrowLeft, Mail, Phone, Calendar, Shield, Briefcase, Star, Clock,
  MapPin, Award, CheckCircle, XCircle, FileText, MessageSquare,
  Circle, Wallet, Coins, User,
} from "lucide-react"
import { getCategoryLabel } from "../../constants/admin/categoryLabels"
import type { ProProfile } from "../../services/admin/pros.service"

import { format } from "date-fns"
import { fr } from "date-fns/locale"

function getInitials(first: string, last: string): string {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
}

const fallbackScores: UnifiedTrustScore = {
  overall: 0,
  kyc: 0,
  activity: 0,
  payment_reliability: 0,
  fraud_score: 0,
  fraud_flags: 0,
  last_assessed: new Date().toISOString(),
};

export default function AdminProDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { hasPermission } = usePermissions()
  const [pro, setPro] = useState<ProProfile | null>(null)
  const [trustScores, setTrustScores] = useState<UnifiedTrustScore | null>(null)
  const [loading, setLoading] = useState(true)
  const [trustLoading, setTrustLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchPro = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const [data, scores] = await Promise.all([
        getProById(id),
        getTrustScores(id),
      ])
      if (data) setPro(data)
      else setError("Professionnel introuvable")
      if (scores) setTrustScores(scores)
    } catch {
      setError("Impossible de charger le profil")
    } finally {
      setLoading(false)
      setTrustLoading(false)
    }
  }, [id])

  useEffect(() => { fetchPro() }, [fetchPro])

  const handleVerify = async (verified: boolean) => {
    if (!id) return
    setActionLoading("verify")
    try {
      await verifyPro(id, verified)
      setPro((prev) => prev ? { ...prev, is_verified: verified, verification_level: verified ? "verified" : "rejected" } : prev)
    } catch {
      /* silent */
    } finally {
      setActionLoading(null)
    }
  }

  if (error) return <ErrorState message={error} onRetry={fetchPro} />
  if (loading) return <DetailSkeleton />
  if (!pro) return <ErrorState message="Professionnel introuvable" onRetry={() => navigate("/admin/pros")} />

  const name = `${pro.first_name} ${pro.last_name}`

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/admin/pros")} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-cm-surface cursor-pointer">
          <ArrowLeft className="w-4 h-4 text-cm-text-soft" />
        </button>
        <div>
          <h1 className="text-[20px] font-bold text-cm-text">Profil professionnel</h1>
          <p className="text-[13px] text-cm-text-muted mt-0.5">Détails et gestion du compte pro</p>
        </div>
      </div>

      <div className="bg-cm-elevated border border-cm-border rounded-xl p-6">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className="w-16 h-16 rounded-full bg-cm-surface flex items-center justify-center text-[20px] font-bold text-cm-text-soft shrink-0">
            {getInitials(pro.first_name, pro.last_name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-[18px] font-bold text-cm-text">{name}</h2>
              {pro.is_online && (
                <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                  <Circle className="w-2 h-2 fill-emerald-500" /> En ligne
                </span>
              )}
              <StatusBadge
                status={pro.is_verified ? "active" : pro.verification_level === "rejected" ? "rejected" : "pending"}
                label={pro.is_verified ? "Vérifié" : pro.verification_level === "rejected" ? "Rejeté" : "Non vérifié"}
                size="md"
              />
            </div>
            {pro.business_name && (
              <p className="text-[14px] font-medium text-cm-text-soft mt-0.5">{pro.business_name}</p>
            )}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3">
              <div className="flex items-center gap-1.5 text-[12px] text-cm-text-muted">
                <Mail className="w-3.5 h-3.5" /> {pro.email}
              </div>
              <div className="flex items-center gap-1.5 text-[12px] text-cm-text-muted">
                <Phone className="w-3.5 h-3.5" /> {pro.phone_number || "—"}
              </div>
              <div className="flex items-center gap-1.5 text-[12px] text-cm-text-muted">
                <Briefcase className="w-3.5 h-3.5" /> {pro.categories.map((c) => getCategoryLabel(c)).join(", ")}
              </div>
              <div className="flex items-center gap-1.5 text-[12px] text-cm-text-muted">
                <MapPin className="w-3.5 h-3.5" /> {pro.city || "—"}{pro.commune ? ` — ${pro.commune}` : ""}
              </div>
              <div className="flex items-center gap-1.5 text-[12px] text-cm-text-muted">
                <Calendar className="w-3.5 h-3.5" /> Membre depuis {format(new Date(pro.created_at), "MMMM yyyy", { locale: fr })}
              </div>
            </div>
          </div>
        </div>

        {hasPermission("pros.verify") && (
          <div className="flex flex-wrap gap-2 mt-6 pt-5 border-t border-cm-border/40">
            {!pro.is_verified && (
              <button onClick={() => handleVerify(true)} disabled={actionLoading === "verify"}
                className="flex items-center gap-1.5 h-9 px-4 rounded-lg text-[12px] font-medium cursor-pointer disabled:opacity-50 transition-colors bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100">
                {actionLoading === "verify" ? (
                  <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : <CheckCircle className="w-3.5 h-3.5" />}
                Approuver la vérification
              </button>
            )}
            {pro.is_verified && (
              <button onClick={() => handleVerify(false)} disabled={actionLoading === "verify"}
                className="flex items-center gap-1.5 h-9 px-4 rounded-lg text-[12px] font-medium cursor-pointer disabled:opacity-50 transition-colors bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100">
                <XCircle className="w-3.5 h-3.5" />
                Révoquer la vérification
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={<Star className="w-4 h-4" />} label="Note" value={`${pro.rating.toFixed(1)} / 5`} />
        <StatCard icon={<Briefcase className="w-4 h-4" />} label="Missions" value={String(pro.total_jobs)} />
        <StatCard icon={<Coins className="w-4 h-4" />} label="Revenu total" value={formatXOF(pro.total_earned)} />
        <StatCard icon={<Wallet className="w-4 h-4" />} label="Portefeuille" value={formatXOF(pro.wallet_balance ?? 0)} />
      </div>

      <TrustScoreCard scores={trustScores ?? fallbackScores} loading={trustLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section title="Informations personnelles">
          <DetailRow label="Prénom" value={pro.first_name} />
          <DetailRow label="Nom" value={pro.last_name} />
          <DetailRow label="Email" value={pro.email || "—"} />
          <DetailRow label="Téléphone" value={pro.phone_number || "—"} />
          <DetailRow label="Ville" value={pro.city || "—"} />
          <DetailRow label="Commune" value={pro.commune || "—"} />
          <DetailRow label="Disponible" value={pro.is_available ? "Oui" : "Non"} />
          <DetailRow label="Membre depuis" value={format(new Date(pro.created_at), "d MMMM yyyy", { locale: fr })} />
        </Section>

        <Section title="Profil professionnel">
          <DetailRow label="Enseigne" value={pro.business_name || "—"} />
          <DetailRow label="Catégories" value={pro.categories.map((c) => getCategoryLabel(c)).join(", ")} />
          {pro.sub_categories && <DetailRow label="Sous-catégories" value={pro.sub_categories.join(", ")} />}
          <DetailRow label="Tarif horaire" value={pro.hourly_rate ? `${pro.hourly_rate.toLocaleString()} F/h` : "—"} />
          <DetailRow label="Taux d'acceptation" value={pro.acceptance_rate ? `${pro.acceptance_rate}%` : "—"} />
          <DetailRow label="Temps réponse moyen" value={pro.response_time_avg ? `${pro.response_time_avg} min` : "—"} />
          <DetailRow label="Taux d'annulation" value={pro.cancellation_rate ? `${pro.cancellation_rate}%` : "—"} />
        </Section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section title="Vérification">
          <DetailRow label="Niveau" value={pro.verification_level} />
          <DetailRow label="Statut" value={pro.is_verified ? "Vérifié" : "Non vérifié"} />
          <DetailRow label="Note moyenne" value={`${pro.rating.toFixed(1)} / 5`} />
          <DetailRow label="Missions réalisées" value={String(pro.total_jobs)} />
          <DetailRow label="Revenu total" value={formatXOF(pro.total_earned)} />
          <DetailRow label="Portefeuille" value={formatXOF(pro.wallet_balance ?? 0)} />
          {pro.bio && (
            <div className="mt-4 pt-4 border-t border-cm-border/40 col-span-full">
              <p className="text-[11px] text-cm-text-muted font-medium mb-1.5">Bio</p>
              <p className="text-[12px] text-cm-text-soft leading-relaxed">{pro.bio}</p>
            </div>
          )}
        </Section>

        <Section title="Localisation">
          <div className="flex flex-col items-center justify-center py-6 text-cm-text-muted">
            <MapPin className="w-8 h-8 mb-2" />
            <p className="text-[13px] font-medium text-cm-text-muted">{pro.city || "Ville non renseignée"}{pro.commune ? ` — ${pro.commune}` : ""}</p>
            <p className="text-[11px] text-cm-text-muted">Cliquez pour voir sur la carte</p>
          </div>
        </Section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-cm-elevated border border-cm-border rounded-xl p-4">
          <h3 className="text-[13px] font-semibold text-cm-text mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" /> Documents de vérification
          </h3>
          <div className="space-y-2">
            {["Pièce d'identité", "Diplôme / Certificat", "Justificatif de domicile", "Assurance"].map((label) => (
              <div key={label} className="flex items-center justify-between p-3 rounded-lg bg-cm-surface">
                <span className="text-[12px] text-cm-text-soft">{label}</span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                  <CheckCircle className="w-3 h-3" /> Reçu
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-cm-elevated border border-cm-border rounded-xl p-4">
          <h3 className="text-[13px] font-semibold text-cm-text mb-3 flex items-center gap-2">
            <Award className="w-4 h-4" /> Badges
          </h3>
          <div className="flex flex-wrap gap-2">
            {["Pro vérifié", "Top Artisan", "Réponse rapide"].map((badge) => (
              <div key={badge} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-50 text-amber-700 text-[11px] font-medium">
                <Award className="w-3.5 h-3.5" /> {badge}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-cm-elevated border border-cm-border rounded-xl">
        <div className="px-4 py-3 border-b border-cm-border/40 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-[13px] font-semibold text-cm-text">
            <MessageSquare className="w-4 h-4" /> Avis récents
          </h3>
          <span className="text-[11px] text-cm-text-muted">—</span>
        </div>
        <div className="px-4 py-8 text-center text-[13px] text-cm-text-muted">
          Chargement des avis depuis la base de données en cours...
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-cm-elevated border border-cm-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-cm-text-muted">{icon}</span>
        <span className="text-[11px] text-cm-text-muted font-medium">{label}</span>
      </div>
      <p className="text-[15px] font-bold text-cm-text">{value}</p>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-cm-elevated border border-cm-border rounded-xl p-4">
      <h3 className="text-[13px] font-semibold text-cm-text mb-3">{title}</h3>
      <dl className="space-y-2.5">{children}</dl>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-[12px] text-cm-text-muted">{label}</dt>
      <dd className="text-[12px] font-medium text-cm-text text-right">{value}</dd>
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse max-w-4xl">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-cm-border-soft rounded-lg" />
        <div className="space-y-1">
          <div className="h-5 bg-cm-border-soft rounded w-56" />
          <div className="h-3 bg-cm-border-soft rounded w-32" />
        </div>
      </div>
      <div className="bg-cm-elevated border border-cm-border rounded-xl p-6">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 bg-cm-border-soft rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-cm-border-soft rounded w-56" />
            <div className="h-3 bg-cm-border-soft rounded w-48" />
            <div className="h-3 bg-cm-border-soft rounded w-72" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-cm-elevated border border-cm-border rounded-xl p-4">
            <div className="h-3 bg-cm-border-soft rounded w-16 mb-2" />
            <div className="h-5 bg-cm-border-soft rounded w-24" />
          </div>
        ))}
      </div>
    </div>
  )
}
