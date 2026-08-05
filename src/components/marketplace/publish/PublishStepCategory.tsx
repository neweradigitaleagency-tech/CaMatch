import { motion } from "motion/react"
import { Check, ChevronRight } from "lucide-react"
import { usePublishListingStore } from "../../../stores/publishListingStore"
import { MARKETPLACE_CATEGORIES } from "../../../data/marketplaceCategories"

export default function PublishStepCategory() {
  const { draft, setCategory } = usePublishListingStore()
  const parent = MARKETPLACE_CATEGORIES.find((c) => c.id === draft.vertical)

  if (!parent) {
    return (
      <div className="flex flex-col gap-6">
        <h2 className="text-xl font-bold text-cm-text">Choisissez d'abord un univers</h2>
        <p className="text-sm text-cm-text-muted">Revenez à l'étape précédente pour sélectionner un univers.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-cm-text">{parent.name}</h2>
        <p className="text-sm text-cm-text-muted mt-1">Sélectionnez la sous-catégorie la plus précise</p>
      </div>

      <div className="flex flex-col gap-2">
        {parent.children.map((sub) => {
          const selected = draft.categoryId === sub.id
          return (
            <motion.button
              key={sub.id}
              onClick={() => setCategory(sub.id)}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                selected ? "border-cm-text bg-cm-elevated" : "border-cm-border bg-cm-elevated hover:border-cm-border-soft"
              }`}
            >
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-sm text-cm-text">{sub.name}</span>
                <p className="text-xs text-cm-text-muted mt-0.5">{sub.description}</p>
              </div>
              {selected ? (
                <span className="w-6 h-6 rounded-full bg-cm-text text-white flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </span>
              ) : (
                <ChevronRight className="w-4 h-4 text-cm-border-soft shrink-0" />
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
