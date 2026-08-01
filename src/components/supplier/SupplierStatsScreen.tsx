import { BarChart3, TrendingUp, Package, ClipboardList, Star, ArrowUp, ArrowDown } from "lucide-react"
import { useSupplierDashboardStats } from "../../hooks/supplier/useSupplierProfile"
import { useSupplierProducts } from "../../hooks/supplier/useSupplierProducts"
import { useSupplierOrders } from "../../hooks/supplier/useSupplierOrders"
import { formatXOF } from "../../utils/format"

export default function SupplierStatsScreen() {
  const { data: stats } = useSupplierDashboardStats()
  const { data: products } = useSupplierProducts()
  const { data: orders } = useSupplierOrders()

  const completedOrders = orders?.filter((o) => o.status === "DELIVERED") ?? []
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0)
  const totalCommission = completedOrders.reduce((sum, o) => sum + o.commission, 0)
  const netRevenue = totalRevenue - totalCommission

  const categoryStats = products?.reduce<Record<string, { count: number; totalValue: number }>>((acc, p) => {
    const cat = p.categoryName ?? "Autre"
    if (!acc[cat]) acc[cat] = { count: 0, totalValue: 0 }
    acc[cat].count++
    acc[cat].totalValue += p.stock * p.supplierPrice
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[20px] font-bold text-cm-text">Statistiques</h1>
        <p className="text-[12px] text-cm-text-muted">Vue d'ensemble de votre activité</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-cm-elevated rounded-xl border border-cm-border p-4">
          <div className="flex items-center justify-between mb-2">
            <ClipboardList className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-[24px] font-bold text-cm-text">{orders?.length ?? 0}</p>
          <p className="text-[11px] text-cm-text-muted">Commandes totales</p>
        </div>
        <div className="bg-cm-elevated rounded-xl border border-cm-border p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-[24px] font-bold text-cm-text">{formatXOF(totalRevenue)}</p>
          <p className="text-[11px] text-cm-text-muted">Revenu brut</p>
        </div>
        <div className="bg-cm-elevated rounded-xl border border-cm-border p-4">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-5 h-5 text-indigo-500" />
          </div>
          <p className="text-[24px] font-bold text-cm-text">{formatXOF(netRevenue)}</p>
          <p className="text-[11px] text-cm-text-muted">Revenu net</p>
        </div>
        <div className="bg-cm-elevated rounded-xl border border-cm-border p-4">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-[24px] font-bold text-cm-text">{formatXOF(totalCommission)}</p>
          <p className="text-[11px] text-cm-text-muted">Commission Ça Match</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-cm-elevated rounded-xl border border-cm-border p-4">
          <h2 className="text-[15px] font-bold text-cm-text mb-3">Produits par catégorie</h2>
          {categoryStats && Object.keys(categoryStats).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(categoryStats)
                .sort(([, a], [, b]) => b.count - a.count)
                .map(([cat, data]) => {
                  const maxCount = Math.max(...Object.values(categoryStats).map((d) => d.count))
                  const pct = (data.count / maxCount) * 100
                  return (
                    <div key={cat}>
                      <div className="flex justify-between text-[12px] mb-1">
                        <span className="text-cm-text-soft">{cat}</span>
                        <span className="text-cm-text-muted font-medium">{data.count}</span>
                      </div>
                      <div className="h-2 bg-cm-surface rounded-full overflow-hidden">
                        <div className="h-full bg-cm-green rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
            </div>
          ) : (
            <p className="text-[12px] text-cm-text-muted py-4 text-center">Aucun produit</p>
          )}
        </div>

        <div className="bg-cm-elevated rounded-xl border border-cm-border p-4">
          <h2 className="text-[15px] font-bold text-cm-text mb-3">Commandes par statut</h2>
          <div className="space-y-3">
            {[
              { label: "En attente", key: "PENDING_SUPPLIER", color: "bg-yellow-500" },
              { label: "En préparation", key: "PREPARING", color: "bg-indigo-500" },
              { label: "Livrées", key: "DELIVERED", color: "bg-cm-green" },
              { label: "Annulées", key: "CANCELLED", color: "bg-red-500" },
            ].map((s) => {
              const count = orders?.filter((o) => o.status === s.key).length ?? 0
              const maxCount = orders?.length ?? 1
              const pct = (count / maxCount) * 100
              return (
                <div key={s.key}>
                  <div className="flex justify-between text-[12px] mb-1">
                    <span className="text-cm-text-soft">{s.label}</span>
                    <span className="text-cm-text-muted font-medium">{count}</span>
                  </div>
                  <div className="h-2 bg-cm-surface rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${s.color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="bg-cm-elevated rounded-xl border border-cm-border p-4">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          <span className="text-[15px] font-bold text-cm-text">Note fournisseur : {stats?.rating ?? 0}</span>
        </div>
        <p className="text-[12px] text-cm-text-muted mt-1">Basée sur {completedOrders.length} commandes complétées</p>
      </div>
    </div>
  )
}
