import { motion } from "motion/react"
import { usePublishListingStore } from "../../../stores/publishListingStore"

export default function PublishStepDetails() {
  const { draft, setField } = usePublishListingStore()

  const needsBrand = draft.vertical !== null && draft.vertical !== "real_estate"
  const charCount = draft.title.trim().length
  const descCount = draft.description.trim().length

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-bold text-cm-text">Décrivez votre annonce</h2>
        <p className="text-sm text-cm-text-muted mt-1">
          Un titre et une description clairs attirent plus d'acheteurs
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-cm-text-muted uppercase tracking-wider">
            Titre de l'annonce
          </label>
          <span className={`text-[10px] font-semibold ${charCount >= 10 ? "text-cm-green" : "text-cm-text-muted"}`}>
            {charCount}/10 min
          </span>
        </div>
        <input
          type="text"
          value={draft.title}
          onChange={(e) => setField("title", e.target.value)}
          maxLength={80}
          className="w-full h-12 px-4 rounded-xl bg-cm-elevated border border-cm-border-soft text-sm text-cm-text outline-none focus:border-cm-text transition-colors placeholder:text-cm-border-soft"
          placeholder="Ex: Ciment CIMAF 42.5 — 50 kg, palettes neuves"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-cm-text-muted uppercase tracking-wider">
            Description
          </label>
          <span className={`text-[10px] font-semibold ${descCount >= 60 ? "text-cm-green" : "text-cm-text-muted"}`}>
            {descCount}/60 min
          </span>
        </div>
        <textarea
          value={draft.description}
          onChange={(e) => setField("description", e.target.value)}
          rows={5}
          maxLength={600}
          className="w-full px-4 py-3 rounded-xl bg-cm-elevated border border-cm-border-soft text-sm text-cm-text outline-none focus:border-cm-text transition-colors placeholder:text-cm-border-soft resize-none"
          placeholder="Décrivez le produit : marque, caractéristiques, contenu du lot, état, raisons de la vente..."
        />
        <p className="text-[10px] text-cm-text-muted mt-1">
          Conseils : précisez les dimensions, le conditionnement et la disponibilité.
        </p>
      </div>

      {needsBrand && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-cm-text-muted uppercase tracking-wider mb-1.5 block">
              Marque
            </label>
            <input
              type="text"
              value={draft.brand}
              onChange={(e) => setField("brand", e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-cm-elevated border border-cm-border-soft text-sm text-cm-text outline-none focus:border-cm-text transition-colors placeholder:text-cm-border-soft"
              placeholder="Ex: CIMAF"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-cm-text-muted uppercase tracking-wider mb-1.5 block">
              Modèle / Référence
            </label>
            <input
              type="text"
              value={draft.model}
              onChange={(e) => setField("model", e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-cm-elevated border border-cm-border-soft text-sm text-cm-text outline-none focus:border-cm-text transition-colors placeholder:text-cm-border-soft"
              placeholder="Ex: 42.5 R"
            />
          </div>
        </div>
      )}

      <motion.p
        initial={false}
        animate={{ opacity: charCount >= 10 && descCount >= 60 ? 1 : 0, height: charCount >= 10 && descCount >= 60 ? "auto" : 0 }}
        className="text-[12px] text-cm-green font-semibold"
      >
        Parfait, votre annonce a de quoi convaincre.
      </motion.p>
    </div>
  )
}
