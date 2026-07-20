import { motion } from "motion/react"
import { useSellerRegistrationStore } from "../../stores/sellerRegistrationStore"
import type { SellerType, MarketplaceVertical } from "../../types/marketplace"

const SELLER_TYPES: { value: SellerType; label: string; desc: string; icon: string }[] = [
  { value: "professional", label: "Fournisseur professionnel", desc: "Boutique, quincaillerie, magasin avec documents légaux", icon: "store" },
  { value: "individual", label: "Particulier", desc: "Vente entre particuliers, occasion, meubles", icon: "user" },
  { value: "ca_match_pro", label: "Professionnel Ça Match", desc: "Vous êtes déjà un pro sur Ça Match Services", icon: "briefcase" },
]

const VERTICALS: { value: MarketplaceVertical; label: string; desc: string }[] = [
  { value: "pro_supply", label: "Pro Supply", desc: "Matériaux & fournitures BTP" },
  { value: "shopping", label: "Shopping", desc: "Produits neufs" },
  { value: "second_hand", label: "Seconde main", desc: "Articles d'occasion" },
  { value: "real_estate", label: "Immobilier", desc: "Location, vente, Airbnb" },
]

export default function Step1SellerType() {
  const { draft, setSellerType, setVertical } = useSellerRegistrationStore()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-[#1A1A1A]">Quel type de vendeur êtes-vous ?</h2>
        <p className="text-sm text-[#6B7280] mt-1">Nous adapterons votre expérience en fonction de votre profil</p>
      </div>

      <div className="flex flex-col gap-2.5">
        {SELLER_TYPES.map((t) => {
          const selected = draft.sellerType === t.value
          return (
            <motion.button
              key={t.value}
              onClick={() => setSellerType(t.value)}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                selected ? "border-[#243318] bg-[#243318]/5" : "border-gray-100 bg-white hover:border-gray-200"
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                selected ? "bg-[#243318] text-white" : "bg-gray-100 text-gray-600"
              }`}>
                <span className="text-lg">{t.icon === "store" ? "🏪" : t.icon === "user" ? "👤" : "💼"}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-[#1A1A1A]">{t.label}</span>
                  {selected && <span className="text-[10px] font-bold text-[#243318]">✓</span>}
                </div>
                <p className="text-xs text-[#6B7280] mt-0.5">{t.desc}</p>
              </div>
            </motion.button>
          )
        })}
      </div>

      {draft.sellerType && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-2.5"
        >
          <h3 className="text-sm font-semibold text-[#1A1A1A]">Vous vendez dans quelle catégorie ?</h3>
          <div className="grid grid-cols-2 gap-2">
            {VERTICALS.map((v) => {
              const selected = draft.vertical === v.value
              return (
                <motion.button
                  key={v.value}
                  onClick={() => setVertical(v.value)}
                  whileTap={{ scale: 0.97 }}
                  className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                    selected ? "border-[#243318] bg-[#243318]/5" : "border-gray-100 bg-white hover:border-gray-200"
                  }`}
                >
                  <span className={`text-xs font-semibold ${selected ? "text-[#243318]" : "text-[#1A1A1A]"}`}>
                    {v.label}
                  </span>
                  <p className="text-[10px] text-[#6B7280] mt-0.5">{v.desc}</p>
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}
