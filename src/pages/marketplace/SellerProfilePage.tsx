import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  Package, Plus, Eye, ShieldCheck, BadgeCheck, ShoppingBag, X, Pause, Play, Trash2, ChevronRight,
} from "lucide-react"
import { useAppNavigation } from "../../navigation/useAppNavigation"
import { useAuthStore } from "../../stores/authStore"
import { usePublishListingStore, getUnitLabel, formatPrice } from "../../stores/publishListingStore"
import { VERTICAL_LABELS } from "../../types/marketplace"
import EmptyState from "../../components/ui/EmptyState"

export default function SellerProfilePage() {
  const { navigate: nav } = useAppNavigation()
  const user = useAuthStore((s) => s.user)
  const { listings, toggleListingStatus, removeListing } = usePublishListingStore()
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const activeCount = listings.filter((l) => l.status === "active").length
  const totalViews = listings.reduce((sum, l) => sum + l.views, 0)
  const potentialRevenue = listings
    .filter((l) => l.status === "active")
    .reduce((sum, l) => sum + l.price * 0.9, 0)

  const meta = user?.user_metadata as Record<string, unknown> | undefined
  const displayName =
    (typeof meta?.full_name === "string" && meta.full_name) ||
    ([meta?.firstname, meta?.lastname].filter((p): p is string => typeof p === "string").join(" ")) ||
    (typeof meta?.name === "string" && meta.name) ||
    user?.email?.split("@")[0] ||
    "Vendeur"

  const handleDelete = (id: string) => {
    removeListing(id)
    setConfirmId(null)
  }

  const stats = [
    { label: "Annonces actives", value: String(activeCount), icon: Package },
    { label: "Vues totales", value: totalViews.toLocaleString("fr-FR"), icon: Eye },
    { label: "Revenus potentiels", value: `${Math.round(potentialRevenue).toLocaleString("fr-FR")} F`, icon: ShieldCheck },
  ]

  return (
    <div className="flex flex-col w-full min-h-dynamic bg-cm-bg">
      <div className="px-4 pt-4 pb-2">
        <h1 className="h1-cm text-cm-text">Espace vendeur</h1>
      </div>

      <div className="px-4 pb-3">
        <div className="flex items-center gap-3 rounded-2xl bg-cm-forest text-white p-4">
          <div className="w-12 h-12 rounded-full bg-cm-accent text-cm-forest flex items-center justify-center text-lg font-black shrink-0">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-bold truncate">{displayName}</p>
            <p className="text-[11px] text-white/70">Vendeur sur le Marché Ça Match</p>
            <div className="flex items-center gap-1 mt-1">
              <BadgeCheck className="w-3.5 h-3.5 text-cm-accent" />
              <span className="text-[10px] font-bold text-cm-accent">Compte vérifié</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/10 text-[9px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-cm-green animate-pulse" />
              Escrow actif
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 px-4 pb-3">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="flex flex-col gap-1.5 rounded-xl bg-cm-elevated border border-cm-border p-3">
              <Icon className="w-4 h-4 text-cm-text-muted" />
              <span className="text-[16px] font-black text-cm-text leading-none">{s.value}</span>
              <span className="text-[9px] font-semibold text-cm-text-muted uppercase tracking-wide">{s.label}</span>
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-between px-4 pt-1 pb-2">
        <h2 className="text-[15px] font-bold text-cm-text">Mes annonces</h2>
        <button
          onClick={() => nav("/marketplace/publish")}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-cm-text text-cm-elevated text-[11px] font-bold cursor-pointer active:scale-[0.97] transition-transform"
        >
          <Plus className="w-3.5 h-3.5" />
          Publier
        </button>
      </div>

      <div className="flex-1 px-4 pb-4 space-y-2">
        {listings.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Aucune annonce pour l'instant"
            description="Publiez votre premier produit et touchez des milliers d'acheteurs."
            action={{ label: "Publier une annonce", onClick: () => nav("/marketplace/publish") }}
            actionVariant="forest"
            compact
          />
        ) : (
          listings.map((listing, i) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-xl bg-cm-elevated border border-cm-border p-3"
            >
              <div className="flex gap-3">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-cm-border-soft shrink-0">
                  {listing.images[0] ? (
                    <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-cm-surface flex items-center justify-center">
                      <Package className="w-5 h-5 text-cm-text-muted" />
                    </div>
                  )}
                  <span
                    className={`absolute bottom-0 inset-x-0 text-[8px] font-bold py-0.5 text-center text-white ${
                      listing.status === "active" ? "bg-cm-green" : "bg-cm-text-muted"
                    }`}
                  >
                    {listing.status === "active" ? "En ligne" : "En pause"}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-cm-text line-clamp-2 leading-snug">{listing.title}</p>
                  <p className="text-[10px] text-cm-text-muted mt-0.5 line-clamp-1">
                    {VERTICAL_LABELS[listing.vertical]} · {listing.location}
                  </p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[13px] font-extrabold text-cm-forest">
                      {formatPrice(listing.price)} F
                      {listing.unit && listing.unit !== "piece" ? `/${getUnitLabel(listing.unit)}` : ""}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-cm-text-muted">
                      <Eye className="w-3 h-3" /> {listing.views.toLocaleString("fr-FR")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2.5 pt-2.5 border-t border-cm-border">
                <button
                  onClick={() => toggleListingStatus(listing.id)}
                  className="flex-1 h-8 rounded-lg bg-cm-surface text-[11px] font-bold text-cm-text cursor-pointer active:scale-[0.97] transition-transform inline-flex items-center justify-center gap-1.5"
                >
                  {listing.status === "active" ? (
                    <>
                      <Pause className="w-3 h-3" /> Mettre en pause
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3" /> Remettre en ligne
                    </>
                  )}
                </button>
                {confirmId === listing.id ? (
                  <div className="flex-1 flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-red-600 shrink-0">Supprimer ?</span>
                    <button
                      onClick={() => handleDelete(listing.id)}
                      className="h-8 px-3 rounded-lg bg-red-600 text-white text-[11px] font-bold cursor-pointer active:scale-[0.97]"
                    >
                      Oui
                    </button>
                    <button
                      onClick={() => setConfirmId(null)}
                      className="h-8 px-3 rounded-lg bg-cm-surface text-[11px] font-bold text-cm-text cursor-pointer active:scale-[0.97]"
                    >
                      Non
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmId(listing.id)}
                    className="h-8 w-8 rounded-lg bg-cm-surface text-cm-text-muted flex items-center justify-center cursor-pointer active:scale-[0.97] transition-transform"
                    aria-label="Supprimer l'annonce"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </motion.div>
          ))
        )}

        <button
          onClick={() => nav("/marketplace/orders")}
          className="w-full flex items-center justify-between rounded-xl bg-cm-elevated border border-cm-border p-4 cursor-pointer active:scale-[0.99] transition-transform"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-cm-surface text-cm-text-soft flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-[13px] font-bold text-cm-text">Mes commandes</p>
              <p className="text-[11px] text-cm-text-muted">Suivre mes achats sécurisés</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-cm-text-muted" />
        </button>

        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-cm-accent/10 border border-cm-accent/30">
          <ShieldCheck className="w-4 h-4 text-cm-forest shrink-0 mt-0.5" />
          <p className="text-[11px] text-cm-text leading-relaxed">
            <strong className="font-bold">Paiement sécurisé :</strong> les fonds sont bloqués par Ça Match et reversés
            à la livraison. Vous encaissez votre prix moins la commission de 10 %.
          </p>
        </div>
      </div>

      <AnimatePresence>
        {confirmId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6"
            role="dialog"
            aria-modal="true"
            aria-label="Supprimer l'annonce"
            onClick={() => setConfirmId(null)}
          >
            <div className="bg-cm-elevated rounded-2xl border border-cm-border p-6 max-w-xs w-full" onClick={(e) => e.stopPropagation()}>
              <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                <X className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-[15px] font-bold text-cm-text text-center mb-1">Supprimer l'annonce ?</h3>
              <p className="text-[12px] text-cm-text-soft text-center mb-5">
                Cette action est définitive. Les acheteurs ne pourront plus la voir.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmId(null)}
                  className="flex-1 h-10 rounded-xl bg-cm-surface text-[12px] font-bold text-cm-text cursor-pointer active:scale-[0.98]"
                >
                  Annuler
                </button>
                <button
                  onClick={() => confirmId && handleDelete(confirmId)}
                  className="flex-1 h-10 rounded-xl bg-red-600 text-white text-[12px] font-bold cursor-pointer active:scale-[0.98]"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
