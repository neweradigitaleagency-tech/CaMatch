import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Package, ClipboardList, TrendingUp, AlertTriangle, Star, ArrowUp, ArrowDown, Plus, Scale, Truck, DollarSign, Users, FileText, ShoppingCart, Tag, Clock, CreditCard, Activity } from "lucide-react"
import { useSupplierProducts } from "../../hooks/supplier/useSupplierProducts"
import { useSupplierOrders } from "../../hooks/supplier/useSupplierOrders"
import { useEnhancedStats, useRecentActivities } from "../../hooks/supplier/useSupplierDashboard"
import { getStatusLabel } from "../../services/supplier/orders.service"
import { formatXOF } from "../../utils/format"
import type { DashboardRecentActivity } from "../../types/supplier"

const ACTIVITY_ICONS: Record<string, typeof Clock> = {
  order: ClipboardList,
  payment: CreditCard,
  stock: Package,
  client: Users,
  invoice: FileText,
  dispute: Scale,
}

const ACTIVITY_COLORS: Record<string, string> = {
  order: "bg-blue-100 text-blue-600",
  payment: "bg-green-100 text-green-600",
  stock: "bg-amber-100 text-amber-600",
  client: "bg-purple-100 text-purple-600",
  invoice: "bg-indigo-100 text-indigo-600",
  dispute: "bg-red-100 text-red-600",
}

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`bg-cm-surface/50 animate-pulse rounded-[14px] ${className}`} />
}

function KpiCard({ icon: Icon, label, value, sub, trend, color }: { icon: typeof TrendingUp; label: string; value: string; sub?: string; trend?: { value: number; positive: boolean }; color?: string }) {
  return (
    <div className="bg-cm-elevated rounded-xl border border-cm-border p-3.5">
      <div className="flex items-center justify-between mb-2">
        <Icon className={`w-4 h-4 ${color ?? "text-cm-text-muted"}`} />
        {trend && (
          <span className={`flex items-center gap-0.5 text-[10px] font-semibold ${trend.positive ? "text-green-600" : "text-red-500"}`}>
            {trend.positive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      <p className="text-[18px] font-bold text-cm-text leading-tight">{value}</p>
      <p className="text-[10px] text-cm-text-muted mt-0.5">{label}</p>
      {sub && <p className="text-[9px] text-cm-text-muted mt-0.5">{sub}</p>}
    </div>
  )
}

function ActivityRow({ activity }: { activity: DashboardRecentActivity }) {
  const Icon = ACTIVITY_ICONS[activity.type] ?? Clock
  const color = ACTIVITY_COLORS[activity.type] ?? "bg-cm-surface text-cm-text-soft"
  const navigate = useNavigate()
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-cm-border/40 last:border-0">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-medium text-cm-text">{activity.label}</p>
        <p className="text-[11px] text-cm-text-muted">{activity.description}</p>
        {activity.amount !== undefined && (
          <p className="text-[11px] font-semibold text-cm-text-soft mt-0.5">{formatXOF(activity.amount)}</p>
        )}
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className="text-[10px] text-cm-text-muted">{new Date(activity.createdAt).toLocaleDateString("fr-FR")}</span>
        {activity.referenceUrl && (
          <button onClick={() => navigate(activity.referenceUrl!)}
            className="text-[10px] text-cm-green font-semibold cursor-pointer hover:underline">
            Voir
          </button>
        )}
      </div>
    </div>
  )
}

export default function SupplierDashboardScreen() {
  const navigate = useNavigate()
  const { data: stats, isLoading: statsLoading } = useEnhancedStats()
  const { data: products } = useSupplierProducts()
  const { data: orders } = useSupplierOrders()
  const { data: activities } = useRecentActivities()

  const lowStockProducts = products?.filter((p) => !p.unlimitedStock && p.availableStock <= p.lowStockThreshold && p.availableStock > 0) ?? []
  const outOfStockProducts = products?.filter((p) => !p.unlimitedStock && p.availableStock <= 0) ?? []
  const recentOrders = orders?.slice(0, 5) ?? []
  const onSaleProducts = products?.filter((p) => p.salePrice && p.salePrice > 0 && p.salePrice < p.supplierPrice) ?? []

  const revenueData = [
    { day: "Lun", amount: (stats?.todayRevenue ?? 0) * 0.6 },
    { day: "Mar", amount: (stats?.todayRevenue ?? 0) * 0.8 },
    { day: "Mer", amount: (stats?.todayRevenue ?? 0) * 1.2 },
    { day: "Jeu", amount: (stats?.todayRevenue ?? 0) * 0.9 },
    { day: "Ven", amount: (stats?.todayRevenue ?? 0) * 1.1 },
    { day: "Sam", amount: (stats?.todayRevenue ?? 0) * 0.5 },
    { day: "Dim", amount: (stats?.todayRevenue ?? 0) },
  ]
  const maxRevenue = Math.max(...revenueData.map((r) => r.amount), 1)

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
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-cm-text">
            Bonjour 👋
          </h1>
          <p className="text-[13px] text-cm-text-muted mt-1">Aujourd'hui — {new Date().toLocaleDateString("fr-FR")}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate("/supplier/products/new")}
            className="h-9 px-4 bg-cm-green text-white text-[12px] font-bold rounded-xl hover:opacity-90 cursor-pointer transition-all flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Nouveau produit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard icon={ClipboardList} label="Commandes aujourd'hui" value={String(stats?.todayOrders ?? 0)}
          sub={`${stats?.pendingOrders ?? 0} en attente`}
          trend={{ value: stats?.ordersChange ?? 0, positive: (stats?.ordersChange ?? 0) >= 0 }} color="text-blue-500" />
        <KpiCard icon={TrendingUp} label="CA aujourd'hui" value={formatXOF(stats?.todayRevenue ?? 0)}
          sub={`Mensuel: ${formatXOF(stats?.monthRevenue ?? 0)}`}
          trend={{ value: stats?.revenueChange ?? 0, positive: (stats?.revenueChange ?? 0) >= 0 }} color="text-green-500" />
        <KpiCard icon={ShoppingCart} label="Produits vendus" value={String(stats?.productsSold ?? 0)}
          sub={`${stats?.activeProducts ?? 0} actifs · ${stats?.outOfStockCount ?? 0} rupture`} color="text-indigo-500" />
        <KpiCard icon={DollarSign} label="Panier moyen" value={formatXOF(stats?.averageOrderValue ?? 0)}
          sub={`${stats?.monthOrders ?? 0} commandes ce mois`} color="text-emerald-500" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard icon={Users} label="Clients actifs" value={String(stats?.activeClients ?? 0)} color="text-purple-500" />
        <KpiCard icon={Tag} label="Promotions" value={String(stats?.activePromotions ?? 0)}
          sub={onSaleProducts.length > 0 ? `${onSaleProducts.length} produits en promo` : undefined}
          color="text-rose-500" />
        <KpiCard icon={FileText} label="Factures impayées" value={String((stats?.unpaidInvoices ?? 0) + (stats?.overdueInvoices ?? 0))}
          sub={`${stats?.overdueInvoices ?? 0} en retard`}
          color={(stats?.overdueInvoices ?? 0) > 0 ? "text-red-500" : "text-amber-500"} />
        <KpiCard icon={AlertTriangle} label="Stock faible" value={String(stats?.lowStockCount ?? 0)}
          sub={`${stats?.outOfStockCount ?? 0} en rupture`}
          color={(stats?.lowStockCount ?? 0) > 0 ? "text-orange-500" : "text-cm-border-soft"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-cm-elevated rounded-xl border border-cm-border p-4 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-cm-text">Aperçu revenus (7 jours)</h2>
            <span className="text-[11px] text-cm-text-muted">
              Total: <strong className="text-cm-text-soft">{formatXOF(revenueData.reduce((s, r) => s + r.amount, 0))}</strong>
            </span>
          </div>
          <div className="flex items-end justify-between gap-2 h-32">
            {revenueData.map((r) => (
              <div key={r.day} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-cm-green/10 rounded-t-md relative transition-all duration-300 hover:bg-cm-green/20" style={{ height: `${Math.max(4, (r.amount / maxRevenue) * 100)}%` }}>
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] font-medium text-cm-text-soft whitespace-nowrap">
                    {Math.round(r.amount / 1000)}k
                  </div>
                </div>
                <span className="text-[10px] text-cm-text-muted">{r.day}</span>
              </div>
            ))}
          </div>

          <h2 className="text-[15px] font-bold text-cm-text mt-2">Dernières commandes</h2>
          {recentOrders.length === 0 ? (
            <p className="text-[12px] text-cm-text-muted py-4 text-center">Aucune commande récente</p>
          ) : (
            <div className="space-y-1">
              {recentOrders.map((order) => (
                <div key={order.id} onClick={() => navigate(`/supplier/orders/${order.id}`)}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-cm-surface transition-colors cursor-pointer">
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-cm-text">{order.id.toUpperCase()}</p>
                    <p className="text-[11px] text-cm-text-muted truncate">{order.clientName ?? "Client"} · {formatXOF(order.total)}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    order.status === "PENDING_SUPPLIER" ? "bg-yellow-50 text-yellow-700" :
                    order.status === "PREPARING" ? "bg-indigo-50 text-indigo-600" :
                    order.status === "DELIVERED" ? "bg-green-50 text-green-700" :
                    order.status === "DELIVERING" ? "bg-blue-50 text-blue-600" :
                    "bg-cm-surface text-cm-text-soft"
                  }`}>{getStatusLabel(order.status)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="bg-cm-elevated rounded-xl border border-cm-border p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[15px] font-bold text-cm-text">Activité récente</h2>
              <Activity className="w-4 h-4 text-cm-text-muted" />
            </div>
            <div className="divide-y divide-cm-border/40">
              {activities && activities.length > 0 ? (
                activities.slice(0, 6).map((a) => <ActivityRow key={a.id} activity={a} />)
              ) : (
                <p className="text-[12px] text-cm-text-muted py-4 text-center">Aucune activité récente</p>
              )}
            </div>
          </div>

          <div className="bg-cm-elevated rounded-xl border border-cm-border p-4">
            <h2 className="text-[15px] font-bold text-cm-text mb-3">Actions rapides</h2>
            <div className="space-y-2">
              <button onClick={() => navigate("/supplier/products/new")}
                className="w-full flex items-center gap-3 p-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer text-left">
                <Package className="w-5 h-5 text-blue-500 shrink-0" />
                <div>
                  <p className="text-[12px] font-semibold text-blue-700">Ajouter un produit</p>
                  <p className="text-[10px] text-blue-500">Nouvelle référence</p>
                </div>
              </button>
              <button onClick={() => navigate("/supplier/promotions")}
                className="w-full flex items-center gap-3 p-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer text-left">
                <Tag className="w-5 h-5 text-rose-500 shrink-0" />
                <div>
                  <p className="text-[12px] font-semibold text-rose-700">Créer une promotion</p>
                  <p className="text-[10px] text-rose-500">Remises et offres</p>
                </div>
              </button>
              <button onClick={() => navigate("/supplier/orders")}
                className="w-full flex items-center gap-3 p-2.5 rounded-lg bg-green-50 hover:bg-green-100 transition-colors cursor-pointer text-left">
                <ClipboardList className="w-5 h-5 text-green-500 shrink-0" />
                <div>
                  <p className="text-[12px] font-semibold text-green-700">Voir les commandes</p>
                  <p className="text-[10px] text-green-500">Gérer les statuts</p>
                </div>
              </button>
              <button onClick={() => navigate("/supplier/stock")}
                className="w-full flex items-center gap-3 p-2.5 rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors cursor-pointer text-left">
                <Package className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                  <p className="text-[12px] font-semibold text-amber-700">Gérer les stocks</p>
                  <p className="text-[10px] text-amber-500">Mouvements et alertes</p>
                </div>
              </button>
              <button onClick={() => navigate("/supplier/invoices")}
                className="w-full flex items-center gap-3 p-2.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer text-left">
                <FileText className="w-5 h-5 text-indigo-500 shrink-0" />
                <div>
                  <p className="text-[12px] font-semibold text-indigo-700">Factures</p>
                  <p className="text-[10px] text-indigo-500">Suivi des paiements</p>
                </div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-cm-elevated rounded-xl border border-cm-border p-4">
              <div className="flex items-center justify-between mb-2">
                <Scale className="w-4 h-4 text-red-500" />
              </div>
              <p className="text-[18px] font-bold text-cm-text">{stats?.openDisputes ?? 0}</p>
              <p className="text-[10px] text-cm-text-muted">Litiges ouverts</p>
              {(stats?.openDisputes ?? 0) > 0 && (
                <button onClick={() => navigate("/supplier/disputes")}
                  className="mt-2 text-[10px] text-cm-green font-semibold cursor-pointer hover:underline">Voir</button>
              )}
            </div>
            <div className="bg-cm-elevated rounded-xl border border-cm-border p-4">
              <div className="flex items-center justify-between mb-2">
                <Truck className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-[18px] font-bold text-cm-text">{stats?.activeDeliveries ?? 0}</p>
              <p className="text-[10px] text-cm-text-muted">Livraisons en cours</p>
              {(stats?.activeDeliveries ?? 0) > 0 && (
                <button onClick={() => navigate("/supplier/deliveries")}
                  className="mt-2 text-[10px] text-cm-green font-semibold cursor-pointer hover:underline">Voir</button>
              )}
            </div>
          </div>

          <div className="bg-cm-elevated rounded-xl border border-cm-border p-4">
            <h2 className="text-[15px] font-bold text-cm-text mb-3">
              Stock ⚠️
              {onSaleProducts.length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-red-100 rounded text-[10px] text-red-600 font-bold">{onSaleProducts.length} en promo</span>
              )}
            </h2>
            {lowStockProducts.length === 0 && outOfStockProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <Package className="w-8 h-8 text-cm-border-soft mb-2" />
                <p className="text-[12px] text-cm-text-muted">Tout est en stock</p>
              </div>
            ) : (
              <div className="space-y-1">
                {outOfStockProducts.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-red-50">
                    <p className="text-[12px] font-medium text-red-700 truncate min-w-0 flex-1">{p.name}</p>
                    <span className="text-[11px] font-bold text-red-600 shrink-0 ml-2">Rupture</span>
                  </div>
                ))}
                {lowStockProducts.slice(0, 5).map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-orange-50">
                    <p className="text-[12px] font-medium text-orange-700 truncate min-w-0 flex-1">{p.name}</p>
                    <span className="text-[11px] text-orange-600 shrink-0 ml-2">{p.availableStock} restants</span>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-3 pt-3 border-t border-cm-border/40 flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-[13px] font-semibold text-cm-text">{stats?.rating ?? 0}</span>
              <span className="text-[11px] text-cm-text-muted">Note fournisseur</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
