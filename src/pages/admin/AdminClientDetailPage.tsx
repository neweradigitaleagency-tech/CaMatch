import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getUserById, updateUserStatus } from "../../services/admin/users.service"
import { getTrustScores } from "../../services/admin/trust.service"
import type { UnifiedTrustScore } from "../../services/admin/trust.service"
import { usePermissions } from "../../hooks/usePermissions"
import StatusBadge from "../../components/admin/ui/StatusBadge"
import ErrorState from "../../components/admin/ui/ErrorState"
import TrustScoreCard from "../../components/admin/TrustScoreCard"
import { formatXOF } from "../../utils/admin/formatCurrency"
import { getCategoryLabel } from "../../constants/admin/categoryLabels"
import {
  ArrowLeft, Mail, Phone, Calendar, Shield, Briefcase, Star, Clock,
  AlertTriangle, Ban, CheckCircle, XCircle, MapPin, CreditCard,
  Smartphone, Globe, Award, Wallet, Circle,
} from "lucide-react"
import type { UserProfile } from "../../types/admin"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

function getUserName(user: UserProfile): string {
  if (user.client_profile?.first_name) return `${user.client_profile.first_name} ${user.client_profile.last_name}`
  if (user.professional_profile?.first_name) return `${user.professional_profile.first_name} ${user.professional_profile.last_name}`
  return user.email.split("@")[0] ?? ""
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n.charAt(0)).join("").toUpperCase().slice(0, 2)
}

export default function AdminClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { hasPermission } = usePermissions()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [trustScores, setTrustScores] = useState<UnifiedTrustScore | null>(null)
  const [loading, setLoading] = useState(true)
  const [trustLoading, setTrustLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchUser = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const [data, scores] = await Promise.all([
        getUserById(id),
        getTrustScores(id),
      ])
      if (data) {
        setUser(data)
      } else {
        setError("Utilisateur introuvable")
      }
      if (scores) setTrustScores(scores)
    } catch {
      setError("Impossible de charger le profil")
    } finally {
      setLoading(false)
      setTrustLoading(false)
    }
  }, [id])

  useEffect(() => { fetchUser() }, [fetchUser])

  const handleToggleStatus = async () => {
    if (!id || !user) return
    const newStatus = !user.is_active
    setActionLoading("status")
    try {
      await updateUserStatus(id, newStatus)
      setUser({ ...user, is_active: newStatus })
    } catch {
      setError("Impossible de modifier le statut")
    } finally {
      setActionLoading(null)
    }
  }

  if (error) return <ErrorState message={error} onRetry={fetchUser} />
  if (loading) return <DetailSkeleton />
  if (!user) return <ErrorState message="Utilisateur introuvable" onRetry={() => navigate("/admin/clients")} />

  const isPro = user.role === "professional"
  const pro = user.professional_profile
  const cl = user.client_profile
  const name = getUserName(user)

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/admin/clients")} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-cm-surface cursor-pointer">
          <ArrowLeft className="w-4 h-4 text-cm-text-soft" />
        </button>
        <div>
          <h1 className="text-[20px] font-bold text-cm-text">Profil utilisateur</h1>
          <p className="text-[13px] text-cm-text-muted mt-0.5">Détails et gestion du compte</p>
        </div>
      </div>

      <div className="bg-cm-elevated border border-cm-border rounded-xl p-6">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className="w-16 h-16 rounded-full bg-cm-surface flex items-center justify-center text-[20px] font-bold text-cm-text-soft shrink-0">
            {getInitials(name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-[18px] font-bold text-cm-text">{name}</h2>
              <StatusBadge
                status={user.is_active ? (isPro && !pro?.is_verified ? "pending" : "active") : "inactive"}
                label={user.is_active ? "Actif" : "Inactif"}
                size="md"
              />
              {isPro && pro?.is_verified && (
                <div className="flex items-center gap-1 px-2.5 h-5 rounded-full bg-blue-50 text-blue-600 text-[11px] font-medium">
                  <Shield className="w-3 h-3" /> Vérifié
                </div>
              )}
              {isPro && pro?.is_online && (
                <div className="flex items-center gap-1 px-2.5 h-5 rounded-full bg-green-50 text-green-600 text-[11px] font-medium">
                  <Circle className="w-3 h-3 fill-green-500" /> En ligne
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3">
              <div className="flex items-center gap-1.5 text-[12px] text-cm-text-muted">
                <Mail className="w-3.5 h-3.5" /> {user.email}
              </div>
              <div className="flex items-center gap-1.5 text-[12px] text-cm-text-muted">
                <Phone className="w-3.5 h-3.5" /> {user.phone_number || "—"}
              </div>
              <div className="flex items-center gap-1.5 text-[12px] text-cm-text-muted">
                <Calendar className="w-3.5 h-3.5" /> Inscrit le {format(new Date(user.created_at), "d MMMM yyyy", { locale: fr })}
              </div>
              <div className="flex items-center gap-1.5 text-[12px] text-cm-text-muted capitalize">
                <Briefcase className="w-3.5 h-3.5" /> {isPro ? "Professionnel" : "Client"}
              </div>
              {user.last_login_at && (
                <div className="flex items-center gap-1.5 text-[12px] text-cm-text-muted">
                  <Clock className="w-3.5 h-3.5" /> Dernière connexion {format(new Date(user.last_login_at), "d MMM HH:mm", { locale: fr })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-6 pt-5 border-t border-cm-border/40">
          {hasPermission("users.suspend") && (
            <button
              onClick={handleToggleStatus}
              disabled={actionLoading === "status"}
              className={`flex items-center gap-1.5 h-9 px-4 rounded-lg text-[12px] font-medium cursor-pointer disabled:opacity-50 transition-colors ${
                user.is_active
                  ? "bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
              }`}
            >
              {actionLoading === "status" ? (
                <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : user.is_active ? (
                <Ban className="w-3.5 h-3.5" />
              ) : (
                <CheckCircle className="w-3.5 h-3.5" />
              )}
              {user.is_active ? "Suspendre" : "Réactiver"}
            </button>
          )}
          {hasPermission("users.ban") && user.is_active && (
            <button className="flex items-center gap-1.5 h-9 px-4 rounded-lg text-[12px] font-medium text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 cursor-pointer">
              <XCircle className="w-3.5 h-3.5" /> Bannir
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={<Briefcase className="w-4 h-4" />} label="Missions" value={String(isPro ? (pro?.total_jobs ?? 0) : (cl?.total_jobs ?? 0))} />
        {isPro && pro ? (
          <>
            <StatCard icon={<Star className="w-4 h-4" />} label="Note" value={pro.rating ? `${pro.rating.toFixed(1)}` : "—"} />
            <StatCard icon={<Diamond className="w-4 h-4" />} label="Revenu total" value={formatXOF(pro.total_earned ?? 0)} />
            <StatCard icon={<Wallet className="w-4 h-4" />} label="Portefeuille" value={formatXOF(pro.wallet_balance ?? 0)} />
          </>
        ) : cl ? (
          <>
            <StatCard icon={<Diamond className="w-4 h-4" />} label="Dépensé" value={formatXOF(cl.total_spent ?? 0)} />
            <StatCard icon={<Award className="w-4 h-4" />} label="Points fidélité" value={String(cl.loyalty_points ?? 0)} />
            <StatCard icon={<Shield className="w-4 h-4" />} label="Vérifié" value={user.is_verified ? "Oui" : "Non"} />
          </>
        ) : null}
      </div>

      <TrustScoreCard scores={trustScores ?? { overall: 0, kyc: 0, activity: 0, payment_reliability: 0, fraud_score: 0, fraud_flags: 0, last_assessed: new Date().toISOString() }} loading={trustLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section title="Informations générales">
          <DetailRow label="Email" value={user.email} />
          <DetailRow label="Téléphone" value={user.phone_number || "Non renseigné"} />
          <DetailRow label="Rôle" value={isPro ? "Professionnel" : "Client"} />
          <DetailRow label="Statut" value={user.is_active ? "Actif" : "Inactif"} />
          <DetailRow label="Inscrit le" value={format(new Date(user.created_at), "d MMMM yyyy", { locale: fr })} />
          {user.last_login_at && (
            <DetailRow label="Dernière connexion" value={format(new Date(user.last_login_at), "d MMMM yyyy HH:mm", { locale: fr })} />
          )}
        </Section>

        <Section title="Vérification">
          <DetailRow label="Email vérifié" value={user.email_verified ? "Oui" : "Non"} />
          <DetailRow label="Téléphone vérifié" value={user.phone_verified ? "Oui" : "Non"} />
          {isPro && pro && (
            <>
              <DetailRow label="Niveau vérification" value={pro.verification_level === "verified" ? "Vérifié" : pro.verification_level === "pending" ? "En attente" : "Non vérifié"} />
              <DetailRow label="Disponible" value={pro.is_available ? "Oui" : "Non"} />
              <DetailRow label="Taxe d'acceptation" value={pro.acceptance_rate ? `${pro.acceptance_rate}%` : "—"} />
              <DetailRow label="Temps réponse" value={pro.response_time_avg ? `${pro.response_time_avg} min` : "—"} />
              <DetailRow label="Taux d'annulation" value={pro.cancellation_rate ? `${pro.cancellation_rate}%` : "—"} />
            </>
          )}
        </Section>
      </div>

      {isPro && pro && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Section title="Profil professionnel">
            <DetailRow label="Enseigne" value={pro.business_name || "—"} />
            <DetailRow label="Catégorie" value={getCategoryLabel(pro.category)} />
            <DetailRow label="Ville" value={pro.city || "—"} />
            <DetailRow label="Commune" value={pro.commune || "—"} />
            <DetailRow label="Tarif horaire" value={pro.hourly_rate ? `${pro.hourly_rate.toLocaleString()} F/h` : "—"} />
            <DetailRow label="Note" value={pro.rating ? `${pro.rating.toFixed(1)} / 5` : "—"} />
            <DetailRow label="Missions réalisées" value={String(pro.total_jobs)} />
            <DetailRow label="Revenu total" value={formatXOF(pro.total_earned)} />
            <DetailRow label="Portefeuille" value={formatXOF(pro.wallet_balance)} />
          </Section>

          <Section title="Badges & Récompenses">
            {pro.badges && pro.badges.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {pro.badges.map((b) => (
                  <div key={b.id || b.badge_id} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-[11px] font-medium">
                    <Award className="w-3.5 h-3.5" />
                    {b.badge_id}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[12px] text-cm-text-muted py-4 text-center">Aucun badge pour le moment</p>
            )}
          </Section>
        </div>
      )}

      {!isPro && cl && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Section title="Profil client">
            <DetailRow label="Prénom" value={cl.first_name} />
            <DetailRow label="Nom" value={cl.last_name} />
            <DetailRow label="Ville" value={cl.city || "—"} />
            <DetailRow label="Commune" value={cl.commune || "—"} />
            <DetailRow label="Adresse" value={cl.default_address || "—"} />
            <DetailRow label="Méthode paiement préférée" value={cl.preferred_payment_method ? getPaymentLabel(cl.preferred_payment_method) : "—"} />
            <DetailRow label="Points fidélité" value={String(cl.loyalty_points ?? 0)} />
            <DetailRow label="Total dépensé" value={formatXOF(cl.total_spent ?? 0)} />
          </Section>

          <Section title="Localisation">
            <div className="flex flex-col items-center justify-center py-6 text-cm-text-muted">
              <MapPin className="w-8 h-8 mb-2" />
              <p className="text-[13px] font-medium text-cm-text-muted">{cl.city || "Ville non renseignée"}{cl.commune ? ` — ${cl.commune}` : ""}</p>
              <p className="text-[11px] text-cm-text-muted">{cl.default_address ? cl.default_address : "Adresse non renseignée"}</p>
            </div>
          </Section>
        </div>
      )}
    </div>
  )
}

function getPaymentLabel(method: string): string {
  const labels: Record<string, string> = {
    wave: "Wave", orange_money: "Orange Money", mtn: "MTN Mobile Money",
    bank_transfer: "Virement bancaire", visa: "Visa", mastercard: "Mastercard",
    paypal: "PayPal", bitcoin: "Bitcoin", usdt: "USDT", cash: "Espèces",
  }
  return labels[method] ?? method
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
      <dd className="text-[12px] font-medium text-cm-text text-right truncate ml-4">{value}</dd>
    </div>
  )
}

function Diamond({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
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
      <div className="bg-cm-elevated border border-cm-border rounded-xl p-6">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 bg-cm-border-soft rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-cm-border-soft rounded w-56" />
            <div className="h-3 bg-cm-border-soft rounded w-72" />
            <div className="h-3 bg-cm-border-soft rounded w-48" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-cm-elevated border border-cm-border rounded-xl p-4">
            <div className="h-3 bg-cm-border-soft rounded w-16 mb-2" />
            <div className="h-5 bg-cm-border-soft rounded w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}
