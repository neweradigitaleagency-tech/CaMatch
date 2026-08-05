import { useRef, useState } from "react"
import { useParams } from "react-router-dom"
import { motion } from "motion/react"
import {
  ArrowLeft, Truck, PackageX, ShieldAlert, CreditCard, HelpCircle,
  ImagePlus, X, CheckCircle2, Clock, ScrollText, AlertTriangle,
} from "lucide-react"
import { useAppNavigation } from "../../navigation/useAppNavigation"
import { useMarketplaceCartStore } from "../../stores/marketplaceCartStore"

const REASONS: { value: string; label: string; desc: string; icon: typeof Truck }[] = [
  { value: "non_recue", label: "Commande non reçue", desc: "Le délai estimé est dépassé", icon: Truck },
  { value: "non_conforme", label: "Article non conforme", desc: "Différent de la description", icon: PackageX },
  { value: "endommage", label: "Article endommagé ou manquant", desc: "Colis abîmé ou pièce manquante", icon: ShieldAlert },
  { value: "montant", label: "Montant incorrect", desc: "Problème de facturation", icon: CreditCard },
  { value: "autre", label: "Autre problème", desc: "Situation particulière", icon: HelpCircle },
]

export default function DisputePage() {
  const { orderId } = useParams<{ orderId: string }>()
  const { goBackTo } = useAppNavigation()
  const order = useMarketplaceCartStore((s) => s.getOrder(orderId || ""))
  const openDispute = useMarketplaceCartStore((s) => s.openDispute)

  const [reason, setReason] = useState("")
  const [description, setDescription] = useState("")
  const [evidence, setEvidence] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!order) {
    return (
      <div className="flex flex-col w-full min-h-dynamic bg-cm-bg">
        <header className="flex items-center gap-3 px-5 h-12">
          <button onClick={() => goBackTo("/marketplace/orders")}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-cm-elevated border border-cm-border cursor-pointer active:scale-95 shrink-0">
            <ArrowLeft className="w-4 h-4 text-cm-text" />
          </button>
          <span className="text-[10px] font-bold text-cm-text-soft uppercase tracking-widest">Litige</span>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center px-5 text-center">
          <AlertTriangle className="w-10 h-10 text-cm-border-soft mb-3" />
          <p className="text-[14px] font-bold text-cm-text mb-1">Commande introuvable</p>
          <button onClick={() => goBackTo("/marketplace/orders")}
            className="mt-4 h-11 px-6 rounded-xl bg-cm-text text-cm-elevated text-[12px] font-bold cursor-pointer active:scale-[0.97] transition-transform">
            Mes commandes
          </button>
        </div>
      </div>
    )
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader()
        reader.onload = (ev) => {
          const result = ev.target?.result
          if (typeof result === "string" && evidence.length < 3) {
            setEvidence((prev) => [...prev, result].slice(0, 3))
          }
        }
        reader.readAsDataURL(file)
      })
    }
    e.target.value = ""
  }

  const valid = reason !== "" && description.trim().length >= 20

  const handleSubmit = () => {
    if (!valid || submitting) return
    setSubmitting(true)
    setTimeout(() => {
      openDispute(order.id, reason, description.trim(), evidence)
      setSubmitting(false)
      setSubmitted(true)
    }, 800)
  }

  // ── Litige déjà ouvert ──
  if (order.status === "disputed" && order.dispute) {
    const d = order.dispute
    return (
      <div className="flex flex-col w-full min-h-dynamic bg-cm-bg">
        <header className="flex items-center gap-3 px-5 h-12">
          <button onClick={() => goBackTo(`/marketplace/orders/${order.id}`)}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-cm-elevated border border-cm-border cursor-pointer active:scale-95 shrink-0">
            <ArrowLeft className="w-4 h-4 text-cm-text" />
          </button>
          <span className="text-[10px] font-bold text-cm-text-soft uppercase tracking-widest">Mon litige</span>
        </header>
        <div className="flex-1 px-5 py-5 space-y-3">
          <div className="rounded-xl bg-red-50 border border-red-100 p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-cm-text">Litige en cours</p>
              <p className="text-[11px] text-cm-text-soft mt-0.5">
                Référence <strong className="text-cm-text">{d.reference}</strong> — Ça Match vous contactera sous 48 h.
              </p>
            </div>
          </div>

          <div className="bg-cm-elevated rounded-xl border border-cm-border p-4 space-y-3">
            <div className="flex items-start gap-2.5">
              <ScrollText className="w-4 h-4 text-cm-text-soft mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-semibold text-cm-text-soft uppercase tracking-wider">Motif</p>
                <p className="text-[12px] font-semibold text-cm-text mt-0.5">{d.reason}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-cm-text-soft mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-semibold text-cm-text-soft uppercase tracking-wider">Ouvert le</p>
                <p className="text-[12px] text-cm-text mt-0.5 capitalize">
                  {new Date(d.openedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <HelpCircle className="w-4 h-4 text-cm-text-soft mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-semibold text-cm-text-soft uppercase tracking-wider">Description</p>
                <p className="text-[12px] text-cm-text mt-0.5">{d.description}</p>
              </div>
            </div>
            {d.evidence.length > 0 && (
              <div className="flex gap-2">
                {d.evidence.map((img, i) => (
                  <img key={i} src={img} alt="" className="w-16 h-16 rounded-lg object-cover border border-cm-border-soft" />
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl bg-cm-forest text-white p-4">
            <p className="text-[12px] font-bold text-cm-accent mb-1">Prochaine étape</p>
            <p className="text-[11px] leading-relaxed text-white/90">
              Notre équipe examine votre litige. En attendant, votre paiement reste bloqué en toute sécurité.
              Si besoin, vous pouvez ajouter des éléments via le support.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── Succès ──
  if (submitted && order.dispute) {
    return (
      <div className="flex flex-col w-full min-h-dynamic bg-cm-bg">
        <div className="flex-1 flex items-center justify-center px-5">
          <div className="bg-cm-elevated rounded-2xl border border-cm-border p-8 max-w-md w-full text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7 text-red-600" />
            </div>
            <h2 className="text-[18px] font-bold text-cm-text mb-1">Litige ouvert</h2>
            <p className="text-[13px] text-cm-text-soft mb-3">
              Votre dossier <strong>{order.dispute.reference}</strong> a été transmis à l'équipe Ça Match.
            </p>
            <p className="text-[11px] text-cm-text-muted mb-6">
              Votre paiement reste bloqué pendant l'examen. Réponse sous 48 h.
            </p>
            <button onClick={() => goBackTo(`/marketplace/orders/${order.id}`)}
              className="h-10 px-6 bg-cm-text text-cm-elevated text-[12px] font-bold rounded-xl cursor-pointer transition-all hover:opacity-90">
              Voir le suivi
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full min-h-dynamic bg-cm-bg">
      <header className="sticky top-0 z-30 bg-cm-bg">
        <div className="flex items-center gap-3 px-5 h-12">
          <button onClick={() => goBackTo(`/marketplace/orders/${order.id}`)}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-cm-elevated border border-cm-border cursor-pointer active:scale-95 shrink-0">
            <ArrowLeft className="w-4 h-4 text-cm-text" />
          </button>
          <span className="text-[10px] font-bold text-cm-text-soft uppercase tracking-widest">Ouvrir un litige</span>
        </div>
      </header>

      <div className="flex-1 px-5 pt-3 pb-32 space-y-5">
        <div className="flex items-start gap-3 rounded-xl bg-cm-elevated border border-cm-border p-4">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-cm-surface flex items-center justify-center shrink-0">
            {order.items[0]?.productImage ? (
              <img src={order.items[0].productImage} alt="" className="w-full h-full object-cover" />
            ) : (
              <PackageX className="w-4 h-4 text-cm-text-muted" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-bold text-cm-text">Commande #{order.id.slice(-8)}</p>
            <p className="text-[10px] text-cm-text-soft mt-0.5">
              {order.items.length} article{order.items.length > 1 ? "s" : ""} · {order.total.toLocaleString("fr-FR")} F
            </p>
          </div>
        </div>

        <div>
          <p className="text-[15px] font-bold text-cm-text mb-3">Quel est le problème ?</p>
          <div className="space-y-2">
            {REASONS.map((r) => {
              const Icon = r.icon
              const selected = reason === r.value
              return (
                <motion.button
                  key={r.value}
                  onClick={() => setReason(r.value)}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                    selected ? "border-cm-text bg-cm-elevated" : "border-cm-border bg-cm-elevated hover:border-cm-border-soft"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    selected ? "bg-cm-text text-white" : "bg-cm-surface text-cm-text-soft"
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold text-cm-text">{r.label}</p>
                    <p className="text-[10px] text-cm-text-muted mt-0.5">{r.desc}</p>
                  </div>
                  {selected && <span className="text-cm-forest text-[10px] font-bold">✓</span>}
                </motion.button>
              )
            })}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-cm-text-muted uppercase tracking-wider">Décrivez le problème</label>
            <span className={`text-[10px] font-semibold ${description.trim().length >= 20 ? "text-cm-green" : "text-cm-text-muted"}`}>
              {description.trim().length}/20 min
            </span>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            maxLength={500}
            className="w-full px-4 py-3 rounded-xl bg-cm-elevated border border-cm-border-soft text-sm text-cm-text outline-none focus:border-cm-text transition-colors placeholder:text-cm-border-soft resize-none"
            placeholder="Décrivez ce qui s'est passé : date de réception, état du colis, échanges avec le vendeur..."
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-cm-text-muted uppercase tracking-wider mb-1.5 block">
            Preuves (photos, optionnel — 3 max)
          </label>
          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
          <div className="flex gap-2 flex-wrap">
            {evidence.map((img, i) => (
              <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-cm-border-soft">
                <img src={img} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => setEvidence((prev) => prev.filter((_, idx) => idx !== i))}
                  className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center cursor-pointer"
                  aria-label="Retirer la preuve"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
            {evidence.length < 3 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-xl border-2 border-dashed border-cm-border-soft flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-cm-text transition-colors bg-cm-elevated"
              >
                <ImagePlus className="w-5 h-5 text-cm-text-muted" />
                <span className="text-[9px] text-cm-text-muted font-medium">Ajouter</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 z-30 bg-cm-elevated border-t border-cm-border px-5 py-3 pb-[max(12px,env(safe-area-inset-bottom,12px))]">
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleSubmit}
            disabled={!valid || submitting}
            className="w-full h-12 rounded-xl bg-cm-text text-white text-sm font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
          >
            {submitting ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Soumettre le litige"
            )}
          </button>
          <p className="text-center text-[10px] text-cm-text-muted mt-2">
            Votre paiement reste bloqué par Ça Match pendant l'examen du litige.
          </p>
        </div>
      </footer>
    </div>
  )
}
