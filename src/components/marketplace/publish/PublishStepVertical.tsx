import { motion } from "motion/react"
import { Building2, ShoppingBag, RefreshCw, Home, Car, Check } from "lucide-react"
import { usePublishListingStore } from "../../../stores/publishListingStore"
import type { MarketplaceVertical } from "../../../types/marketplace"

const VERTICALS: { value: MarketplaceVertical; label: string; desc: string; icon: typeof Building2; color: string }[] = [
  { value: "pro_supply", label: "Quincailleries", desc: "Matériaux & fournitures BTP", icon: Building2, color: "#243318" },
  { value: "shopping", label: "Shopping", desc: "Produits neufs", icon: ShoppingBag, color: "#AECB2A" },
  { value: "second_hand", label: "Seconde main", desc: "Articles d'occasion", icon: RefreshCw, color: "#F59E0B" },
  { value: "real_estate", label: "Immobilier", desc: "Location, vente, Airbnb", icon: Home, color: "#EF4444" },
  { value: "automobile", label: "Automobile", desc: "Voitures, motos, pièces", icon: Car, color: "#3B82F6" },
]

export default function PublishStepVertical() {
  const { draft, setVertical } = usePublishListingStore()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-cm-text">Dans quel univers vendez-vous ?</h2>
        <p className="text-sm text-cm-text-muted mt-1">
          Votre annonce sera présentée aux acheteurs de ce marché
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {VERTICALS.map((v) => {
          const selected = draft.vertical === v.value
          const Icon = v.icon
          return (
            <motion.button
              key={v.value}
              onClick={() => setVertical(v.value)}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                selected ? "border-cm-text bg-cm-elevated" : "border-cm-border bg-cm-elevated hover:border-cm-border-soft"
              }`}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors"
                style={{ backgroundColor: selected ? v.color : "#F5F2EB" }}
              >
                <Icon className="w-5 h-5" style={{ color: selected ? "#FFFFFF" : "#8A8577" }} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-sm text-cm-text">{v.label}</span>
                <p className="text-xs text-cm-text-muted mt-0.5">{v.desc}</p>
              </div>
              {selected && (
                <span className="w-6 h-6 rounded-full bg-cm-text text-white flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </span>
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
