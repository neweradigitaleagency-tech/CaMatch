import { motion } from "motion/react"
import { Check, Info } from "lucide-react"
import { usePublishListingStore, getConditionOptions, getConditionLabel } from "../../../stores/publishListingStore"

export default function PublishStepCondition() {
  const { draft, setField } = usePublishListingStore()
  const options = getConditionOptions(draft.vertical)
  const needsDefects = draft.vertical === "second_hand" || draft.vertical === "automobile"

  if (draft.vertical === "real_estate") {
    return (
      <div className="flex flex-col gap-6">
        <h2 className="text-xl font-bold text-cm-text">État du bien</h2>
        <div className="flex items-start gap-3 p-4 rounded-xl bg-cm-surface border border-cm-border">
          <Info className="w-5 h-5 text-cm-amber shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-cm-text">Pas d'état requis pour l'immobilier</p>
            <p className="text-xs text-cm-text-muted mt-1">
              Vous détaillerez la surface, le nombre de pièces et les équipements lors de la suite.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (draft.vertical === "shopping") {
    return (
      <div className="flex flex-col gap-6">
        <h2 className="text-xl font-bold text-cm-text">État du produit</h2>
        <div className="flex items-start gap-3 p-4 rounded-xl bg-cm-surface border border-cm-border">
          <Check className="w-5 h-5 text-cm-green shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-cm-text">Produit neuf</p>
            <p className="text-xs text-cm-text-muted mt-1">
              Les produits de l'univers Shopping sont considérés comme neufs.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-cm-text">Dans quel état est l'article ?</h2>
        <p className="text-sm text-cm-text-muted mt-1">Soyez honnête : cela évite les litiges après la vente</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {options.map((opt) => {
          const selected = draft.condition === opt
          return (
            <motion.button
              key={opt}
              onClick={() => setField("condition", opt)}
              whileTap={{ scale: 0.97 }}
              className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                selected ? "border-cm-text bg-cm-elevated" : "border-cm-border bg-cm-elevated hover:border-cm-border-soft"
              }`}
            >
              <span className={`text-sm font-semibold ${selected ? "text-cm-text" : "text-cm-text"}`}>
                {getConditionLabel(opt)}
              </span>
              {selected && (
                <span className="block mt-1 text-[10px] font-bold text-cm-forest">✓ Sélectionné</span>
              )}
            </motion.button>
          )
        })}
      </div>

      {needsDefects && draft.condition && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-cm-text-muted uppercase tracking-wider">
            Défauts à signaler (facultatif)
          </label>
          <textarea
            value={draft.defects}
            onChange={(e) => setField("defects", e.target.value)}
            rows={3}
            maxLength={300}
            className="w-full px-4 py-3 rounded-xl bg-cm-elevated border border-cm-border-soft text-sm text-cm-text outline-none focus:border-cm-text transition-colors placeholder:text-cm-border-soft resize-none"
            placeholder="Ex: Rayures sur le côté, angle légèrement ébréché..."
          />
        </motion.div>
      )}
    </div>
  )
}
