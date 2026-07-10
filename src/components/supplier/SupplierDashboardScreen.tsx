import { Package, ClipboardList, TrendingUp, AlertTriangle, Star, ArrowUp, ArrowDown } from "lucide-react"
import { useSupplierDashboardStats } from "../../hooks/supplier/useSupplierProfile"
import { useSupplierProducts } from "../../hooks/supplier/useSupplierProducts"
import { useSupplierOrders } from "../../hooks/supplier/useSupplierOrders"
import { getStatusLabel } from "../../services/supplier/orders.service"
import type { MaterialOrderStatus } from "../../types/supplier"

function formatXOF(amount: number): string {
  return amount.toLocaleString("fr-FR") + " FCFA"
}

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`bg-gray-200/50 animate-pulse rounded-[14px] ${className}`} />
}

export default function SupplierDashboardScreen() {
  const { data: stats, isLoading: statsLoading } = useSupplierDashboardStats()
  const { data: products } = useSupplierProducts()
  const { data: orders } = useSupplierOrders()

  const lowStockProducts = products?.filter((p) => !p.unlimitedStock && p.availableStock <= p.lowStockThreshold && p.availableStock > 0) ?? []
  const outOfStockProducts = products?.filter((p) => !p.unlimitedStock && p.availableStock <= 0) ?? []
  const recentOrders = orders?.slice(0, 5) ?? []

  if (statsLoading) {
    return (
      <div className="space-y-4">
        <SkeletonBlock className="h-8 w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => <SkeletonBlock key={i} className="h-28" />)}
        </div>
        <SkeletonBlock className="h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-bold text-gray-900">
          Bonjour {stats ? "Quincaillerie ABC" : ""} 👋
        </h1>
        <p className="text-[13px] text-gray-500 mt-1">Aujourd'hui — {new Date().toLocaleDateString("fr-FR")}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <ClipboardList className="w-5 h-5 text-blue-500" />
            <span className={`flex items-center gap-1 text-[11px] font-medium ${(stats?.ordersChange ?? 0) >= 0 ? "text-green-600" : "text-red-500"}`}>
              {(stats?.ordersChange ?? 0) >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
              {Math.abs(stats?.ordersChange ?? 0)}%
            </span>
          </div>
          <p className="text-[24px] font-bold text-gray-900">{stats?.todayOrders ?? 0}</p>
          <p className="text-[11px] text-gray-500 mt-1">Commandes reçues</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <span className={`flex items-center gap-1 text-[11px] font-medium ${(stats?.revenueChange ?? 0) >= 0 ? "text-green-600" : "text-red-500"}`}>
              {(stats?.revenueChange ?? 0) >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
              {Math.abs(stats?.revenueChange ?? 0)}%
            </span>
          </div>
          <p className="text-[24px] font-bold text-gray-900">{formatXOF(stats?.todayRevenue ?? 0)}</p>
          <p className="text-[11px] text-gray-500 mt-1">Ventes</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <Package className="w-5 h-5 text-indigo-500" />
          </div>
          <p className="text-[24px] font-bold text-gray-900">{stats?.activeProducts ?? 0}</p>
          <p className="text-[11px] text-gray-500 mt-1">Produits actifs</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <AlertTriangle className={`w-5 h-5 ${(stats?.lowStockCount ?? 0) > 0 ? "text-orange-500" : "text-gray-300"}`} />
          </div>
          <p className="text-[24px] font-bold text-gray-900">{stats?.lowStockCount ?? 0}</p>
          <p className="text-[11px] text-gray-500 mt-1">Produits stock faible</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 lg:col-span-2">
          <h2 className="text-[15px] font-bold text-gray-900 mb-3">Dernières commandes</h2>
          {recentOrders.length === 0 ? (
            <p className="text-[12px] text-gray-400 py-6 text-center">Aucune commande récente</p>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((order) => (
                <a key={order.id} href={`/supplier/orders/${order.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-gray-900">{order.id.toUpperCase()}</p>
                    <p className="text-[11px] text-gray-500 truncate">{order.clientName ?? "Client"} · {formatXOF(order.total)}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    order.status === "PENDING_SUPPLIER" ? "bg-yellow-50 text-yellow-700" :
                    order.status === "PREPARING" ? "bg-indigo-50 text-indigo-600" :
                    order.status === "DELIVERED" ? "bg-green-50 text-green-700" :
                    "bg-gray-50 text-gray-600"
                  }`}>{getStatusLabel(order.status)}</span>
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="text-[15px] font-bold text-gray-900 mb-3">Stock faible ⚠️</h2>
          {lowStockProducts.length === 0 && outOfStockProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <Package className="w-8 h-8 text-gray-300 mb-2" />
              <p className="text-[12px] text-gray-400">Tout est en stock</p>
            </div>
          ) : (
            <div className="space-y-2">
              {outOfStockProducts.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-red-50">
                  <p className="text-[12px] font-medium text-red-700 truncate min-w-0 flex-1">{p.name}</p>
                  <span className="text-[11px] font-bold text-red-600 shrink-0 ml-2">Rupture</span>
                </div>
              ))}
              {lowStockProducts.slice(0, 8).map((p) => (
                <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-orange-50">
                  <p className="text-[12px] font-medium text-orange-700 truncate min-w-0 flex-1">{p.name}</p>
                  <span className="text-[11px] text-orange-600 shrink-0 ml-2">{p.availableStock} restants</span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-[13px] font-semibold text-gray-900">{stats?.rating ?? 0}</span>
            <span className="text-[11px] text-gray-500">Note fournisseur</span>
          </div>
        </div>
      </div>
    </div>
  )
}
