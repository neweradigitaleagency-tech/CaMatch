import { motion } from "motion/react"
import { Truck, MapPin, CheckCircle2, Circle, Lightbulb, Package } from "lucide-react"
import {
  usePublishListingStore,
  computeQualityScore,
  getScoreTier,
  getConditionLabel,
  getUnitLabel,
  formatPrice,
} from "../../../stores/publishListingStore"
import { VERTICAL_LABELS } from "../../../types/marketplace"

export default function PublishStepReview() {
  const { draft, setField } = usePublishListingStore()
  const { score, criteria } = computeQualityScore(draft)
  const tier = getScoreTier(score)
  const failed = criteria.filter((c) => !c.earned)

  const handleNumeric = (field: "deliveryFee", value: string) => {
    setField(field, value.replace(/[^0-9]/g, ""))
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-cm-text">Livraison et récapitulatif</h2>
        <p className="text-sm text-cm-text-muted mt-1">Vérifiez vos informations avant de publier</p>
      </div>

      <div className="flex flex-col gap-3 rounded-xl bg-cm-elevated border border-cm-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${draft.deliveryAvailable ? "bg-cm-forest text-cm-accent" : "bg-cm-surface text-cm-text-muted"}`}>
              <Truck className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-cm-text">Livraison proposée</p>
              <p className="text-[11px] text-cm-text-muted">
                {draft.deliveryAvailable ? "Les acheteurs pourront se faire livrer" : "Retrait uniquement sur rendez-vous"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setField("deliveryAvailable", !draft.deliveryAvailable)}
            className={`w-12 h-7 rounded-full transition-colors cursor-pointer shrink-0 ${
              draft.deliveryAvailable ? "bg-cm-forest" : "bg-cm-border-soft"
            }`}
            aria-pressed={draft.deliveryAvailable}
          >
            <span
              className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${
                draft.deliveryAvailable ? "translate-x-[26px]" : "translate-x-[4px]"
              }`}
            />
          </button>
        </div>

        {draft.deliveryAvailable && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden">
            <div>
              <label className="text-xs font-semibold text-cm-text-muted uppercase tracking-wider mb-1.5 block">
                Frais de livraison (FCFA)
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={draft.deliveryFee === "" ? "" : Number(draft.deliveryFee).toLocaleString("fr-FR")}
                onChange={(e) => handleNumeric("deliveryFee", e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-cm-surface border border-cm-border-soft text-sm text-cm-text outline-none focus:border-cm-text transition-colors placeholder:text-cm-border-soft"
                placeholder="Ex: 3500"
              />
              <p className="text-[10px] text-cm-text-muted mt-1">
                Laissez vide pour offrir la livraison.
              </p>
            </div>
          </motion.div>
        )}

        <div className="border-t border-cm-border pt-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-cm-surface text-cm-text-muted flex items-center justify-center">
              <MapPin className="w-4.5 h-4.5" />
            </div>
            <div className="flex-1">
              <label className="text-[11px] font-semibold text-cm-text-muted uppercase tracking-wider block mb-1">
                Localisation du vendeur
              </label>
              <input
                type="text"
                value={draft.location}
                onChange={(e) => setField("location", e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-cm-surface border border-cm-border-soft text-sm text-cm-text outline-none focus:border-cm-text transition-colors placeholder:text-cm-border-soft"
                placeholder="Quartier ou ville"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold text-cm-text-muted uppercase tracking-wider">Votre annonce</p>

        <div className="flex gap-3 rounded-xl bg-cm-elevated border border-cm-border p-3.5">
          {draft.images[0] ? (
            <img src={draft.images[0]} alt="" className="w-20 h-20 rounded-lg object-cover border border-cm-border-soft shrink-0" />
          ) : (
            <div className="w-20 h-20 rounded-lg bg-cm-surface flex items-center justify-center shrink-0">
              <Package className="w-6 h-6 text-cm-text-muted" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-cm-text line-clamp-2">{draft.title || "Sans titre"}</p>
            <p className="text-[11px] text-cm-text-muted mt-0.5">
              {draft.vertical ? VERTICAL_LABELS[draft.vertical] : "—"}
              {draft.condition ? ` · ${getConditionLabel(draft.condition)}` : ""}
              {draft.unit && draft.unit !== "piece" ? ` · ${getUnitLabel(draft.unit)}` : ""}
            </p>
            <p className="text-[11px] text-cm-text-muted">
              {draft.stock ? `${Number(draft.stock).toLocaleString("fr-FR")} dispo` : "—"}
              {draft.rental ? " · louable" : ""}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-extrabold text-cm-forest">
                {draft.price ? `${formatPrice(draft.price)} FCFA` : "Prix non défini"}
              </span>
              {draft.originalPrice && Number(draft.originalPrice.replace(/\s/g, "")) > Number(draft.price.replace(/\s/g, "")) && (
                <span className="text-[11px] text-cm-text-muted line-through">
                  {formatPrice(draft.originalPrice)} F
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="rounded-xl bg-cm-elevated border border-cm-border p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-bold text-cm-text">Score de qualité</p>
              <p className="text-[11px] text-cm-text-muted">Basé sur le remplissage de votre annonce</p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-2xl font-black leading-none" style={{ color: tier.color }}>{score}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider mt-1" style={{ color: tier.color }}>
                {tier.label}
              </span>
            </div>
          </div>

          <div className="h-2 rounded-full bg-cm-surface overflow-hidden mb-4">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: tier.color }}
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>

          <p className="text-xs text-cm-text-muted">{tier.description}</p>
        </div>

        <div className="flex flex-col gap-1.5 rounded-xl bg-cm-elevated border border-cm-border p-4">
          <p className="text-xs font-semibold text-cm-text-muted uppercase tracking-wider mb-1">
            {failed.length === 0 ? "Tous les critères sont remplis" : "Pour gagner plus de visibilité"}
          </p>
          {failed.length === 0 ? (
            <div className="flex items-center gap-2 text-sm font-semibold text-cm-green">
              <CheckCircle2 className="w-4 h-4" />
              Annonce complète — prête à publier
            </div>
          ) : (
            failed.map((c) => (
              <div key={c.key} className="flex items-center justify-between gap-2 text-[12px]">
                <span className="flex items-center gap-1.5 text-cm-text">
                  <Circle className="w-3 h-3 text-cm-border-soft" />
                  {c.label}
                </span>
                <span className="text-cm-text-muted font-semibold whitespace-nowrap">+{c.points} pts</span>
              </div>
            ))
          )}
        </div>

        {score < 80 && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-cm-amber/10 border border-cm-amber/30">
            <Lightbulb className="w-4 h-4 text-cm-amber shrink-0 mt-0.5" />
            <p className="text-[12px] text-cm-text">
              Astuce : un score de 80+ augmente votre visibilité dans les recherches du marché.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
