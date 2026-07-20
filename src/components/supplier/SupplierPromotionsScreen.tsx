import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "motion/react"
import { useNavigate } from "react-router-dom"
import { Tag, Plus, Percent, X, Calendar, Package } from "lucide-react"
import { useSupplierPromotions } from "../../hooks/supplier/useSupplierPromotions"
import { PROMOTION_TYPE_LABELS, PROMOTION_TYPE_COLORS, getPromotionStatus } from "../../services/supplier/promotions.service"
import { formatXOF } from "../../utils/format"
import type { SupplierPromotion } from "../../types/supplier"

type PromoFilter = "all" | "active" | "scheduled" | "expired"

const FILTERS: { value: PromoFilter; label: string }[] = [
  { value: "all", label: "Toutes" },
  { value: "active", label: "Actives" },
  { value: "scheduled", label: "Planifiées" },
  { value: "expired", label: "Expirées" },
]

function PromoBadge({ promotion }: { promotion: SupplierPromotion }) {
  const status = getPromotionStatus(promotion)
  const colors = {
    active: "bg-green-100 text-green-800",
    scheduled: "bg-blue-100 text-blue-800",
    expired: "bg-gray-100 text-gray-600",
  }
  const labels = { active: "Active", scheduled: "Planifiée", expired: "Expirée" }
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${colors[status]}`}>{labels[status]}</span>
}

export default function SupplierPromotionsScreen() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<PromoFilter>("all")
  const { data: promotions, isLoading } = useSupplierPromotions()

  const filtered = useMemo(() => {
    if (!promotions) return []
    if (filter === "all") return promotions
    return promotions.filter((p) => getPromotionStatus(p) === filter)
  }, [promotions, filter])

  const stats = useMemo(() => {
    if (!promotions) return { active: 0, scheduled: 0, expired: 0, totalUsage: 0 }
    return {
      active: promotions.filter((p) => getPromotionStatus(p) === "active").length,
      scheduled: promotions.filter((p) => getPromotionStatus(p) === "scheduled").length,
      expired: promotions.filter((p) => getPromotionStatus(p) === "expired").length,
      totalUsage: promotions.reduce((s, p) => s + p.usageCount, 0),
    }
  }, [promotions])

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900">Promotions</h1>
          <p className="text-[13px] text-gray-500 mt-1">{stats.active} active{stats.active > 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <Tag className="w-5 h-5 text-green-500 mb-2" />
          <p className="text-[18px] font-bold text-gray-900">{stats.active}</p>
          <p className="text-[10px] text-gray-500">Actives</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <Calendar className="w-5 h-5 text-blue-500 mb-2" />
          <p className="text-[18px] font-bold text-gray-900">{stats.scheduled}</p>
          <p className="text-[10px] text-gray-500">Planifiées</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <Percent className="w-5 h-5 text-purple-500 mb-2" />
          <p className="text-[18px] font-bold text-gray-900">{stats.totalUsage}</p>
          <p className="text-[10px] text-gray-500">Utilisations</p>
        </div>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {FILTERS.map((f) => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-semibold cursor-pointer transition-all ${
              filter === f.value ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}>{f.label}</button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="bg-gray-200/50 animate-pulse rounded-xl h-28" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-[13px] font-medium text-gray-500">Aucune promotion</p>
          <p className="text-[11px] text-gray-400 mt-1">Créez des promotions depuis la fiche produit</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((promo) => {
            const typeColor = PROMOTION_TYPE_COLORS[promo.type]
            return (
              <div key={promo.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${typeColor}`}>
                        {PROMOTION_TYPE_LABELS[promo.type]}
                      </span>
                      <PromoBadge promotion={promo} />
                    </div>
                    <p className="text-[14px] font-semibold text-gray-900 mt-2">{promo.productName}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-[12px] text-gray-500">
                      <span>
                        {promo.type === "fixed" ? `${formatXOF(promo.value)} de réduction` :
                         promo.type === "percentage" ? `-${promo.value}%` :
                         promo.type === "pack" ? `${promo.value} unités offertes` :
                         `-${promo.value}% déstockage`}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-400">
                      <span>Du {new Date(promo.startDate).toLocaleDateString("fr-FR")}</span>
                      <span>au {new Date(promo.endDate).toLocaleDateString("fr-FR")}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[13px] font-bold text-gray-900">{promo.usageCount} utilisé{promo.usageCount > 1 ? "s" : ""}</p>
                    {promo.conditions && <p className="text-[10px] text-gray-400 mt-0.5 max-w-[140px] truncate">{promo.conditions}</p>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
