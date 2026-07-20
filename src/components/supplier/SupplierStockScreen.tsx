import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Search, Plus, Package, AlertTriangle, X, ArrowUpFromLine, ArrowDownToLine, RotateCcw, SlidersHorizontal, ClipboardCheck, Filter } from "lucide-react"
import { useSupplierStockMovements, useSupplierStockAlerts, useSupplierProductsStock, useCreateStockMovement } from "../../hooks/supplier/useSupplierStock"
import { MOVEMENT_TYPE_LABELS, MOVEMENT_TYPE_COLORS } from "../../services/supplier/stock.service"
import { formatXOF } from "../../utils/format"
import type { StockMovementType } from "../../types/supplier"

type Tab = "stock" | "movements" | "alerts"
type StockFilter = "all" | "out" | "low" | "available"
type MovementFilter = StockMovementType | "all"

const STOCK_FILTERS: { value: StockFilter; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "out", label: "Rupture" },
  { value: "low", label: "Stock faible" },
  { value: "available", label: "Disponible" },
]

const MOVEMENT_FILTERS: { value: MovementFilter; label: string; icon: typeof ArrowDownToLine }[] = [
  { value: "all", label: "Tous", icon: Filter },
  { value: "entry", label: "Entrée", icon: ArrowDownToLine },
  { value: "exit", label: "Sortie", icon: ArrowUpFromLine },
  { value: "return", label: "Retour", icon: RotateCcw },
  { value: "adjustment", label: "Ajustement", icon: SlidersHorizontal },
  { value: "inventory", label: "Inventaire", icon: ClipboardCheck },
]

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`bg-gray-200/50 animate-pulse rounded-xl ${className}`} />
}

function MovementModal({ onClose }: { onClose: () => void }) {
  const { data: products } = useSupplierProductsStock()
  const createMovement = useCreateStockMovement()
  const [type, setType] = useState<StockMovementType>("entry")
  const [productId, setProductId] = useState("")
  const [quantity, setQuantity] = useState<number>(1)
  const [notes, setNotes] = useState("")

  const selectedProduct = products?.find((p) => p.id === productId)
  const maxExit = selectedProduct ? selectedProduct.availableStock : 0
  const canSubmit = productId && quantity > 0 && (type !== "exit" || quantity <= maxExit) && !createMovement.isPending

  const handleSubmit = () => {
    if (!canSubmit) return
    createMovement.mutate({ productId, type, quantity, notes, supplierId: "supplier-1" }, { onSuccess: () => onClose() })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-t-[20px] sm:rounded-[20px] p-5 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[16px] font-bold">Nouveau mouvement</h3>
          <button onClick={onClose} className="p-1 cursor-pointer"><X className="w-5 h-5 text-cm-text-muted" /></button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-[12px] font-medium text-gray-700 mb-2">Type de mouvement</p>
            <div className="flex flex-wrap gap-1.5">
              {MOVEMENT_FILTERS.slice(1).map((f) => {
                const Icon = f.icon
                return (
                  <button key={f.value} onClick={() => setType(f.value as StockMovementType)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold cursor-pointer transition-all ${
                      type === f.value ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}>
                    <Icon className="w-3.5 h-3.5" /> {f.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <p className="text-[12px] font-medium text-gray-700 mb-2">Produit</p>
            <select value={productId} onChange={(e) => setProductId(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-gray-200 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-cm-green/20 focus:border-cm-green">
              <option value="">Sélectionner un produit</option>
              {products?.map((p) => (
                <option key={p.id} value={p.id} disabled={type === "exit" && p.availableStock <= 0}>
                  {p.name} ({p.availableStock} dispo)
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="text-[12px] font-medium text-gray-700 mb-2">Quantité</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 font-bold cursor-pointer hover:bg-gray-200">−</button>
              <input type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                min={1} max={type === "exit" ? maxExit : undefined}
                className="flex-1 h-10 text-center rounded-xl border border-gray-200 text-[14px] font-bold focus:outline-none focus:ring-2 focus:ring-cm-green/20" />
              <button onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 font-bold cursor-pointer hover:bg-gray-200">+</button>
            </div>
            {selectedProduct && (
              <p className="text-[11px] text-gray-500 mt-1">
                Stock actuel: {selectedProduct.stock} {type === "exit" ? `· Max sortie: ${maxExit}` : `· Après: ${type === "entry" || type === "return" ? selectedProduct.stock + quantity : Math.max(0, selectedProduct.stock - quantity)}`}
              </p>
            )}
          </div>

          <div>
            <p className="text-[12px] font-medium text-gray-700 mb-2">Notes (optionnel)</p>
            <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Raison du mouvement..."
              className="w-full h-10 px-3 rounded-xl border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-cm-green/20" />
          </div>

          <button onClick={handleSubmit} disabled={!canSubmit}
            className="w-full h-11 rounded-xl bg-gray-900 text-white text-[13px] font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-all active:scale-[0.98]">
            {createMovement.isPending ? "Création..." : "Créer le mouvement"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function ProductStockCard({ product, onAdjust }: { product: NonNullable<ReturnType<typeof useSupplierProductsStock>["data"]>[number]; onAdjust: (id: string) => void }) {
  const isOutOfStock = !product.unlimitedStock && product.availableStock <= 0
  const isLowStock = !product.unlimitedStock && product.availableStock > 0 && product.availableStock <= product.lowStockThreshold
  const stockBarPercent = product.unlimitedStock ? 100 : Math.min(100, (product.availableStock / Math.max(product.lowStockThreshold * 3, 1)) * 100)
  return (
    <div className={`bg-white rounded-xl border p-4 ${isOutOfStock ? "border-red-200" : isLowStock ? "border-orange-200" : "border-gray-200"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[13px] font-semibold text-gray-900 truncate">{product.name}</p>
            {isOutOfStock && <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />}
          </div>
          <p className="text-[11px] text-gray-500 mt-0.5">{product.brand ?? "—"} · {product.categoryName}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {isOutOfStock ? "En rupture de stock" : `${product.availableStock} disponibles`}
            {!product.unlimitedStock && ` · Seuil: ${product.lowStockThreshold}`}
          </p>
        </div>
        <button onClick={() => onAdjust(product.id)}
          className="shrink-0 h-8 px-3 rounded-lg bg-gray-100 text-gray-700 text-[11px] font-semibold hover:bg-gray-200 cursor-pointer transition-colors">
          Ajuster
        </button>
      </div>
      {!product.unlimitedStock && (
        <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${isOutOfStock ? "bg-red-500" : isLowStock ? "bg-orange-400" : "bg-cm-green"}`} style={{ width: `${stockBarPercent}%` }} />
        </div>
      )}
      <div className="flex items-center gap-4 mt-2 text-[11px]">
        <span className="text-gray-500">Stock: <strong className="text-gray-800">{product.stock}</strong></span>
        <span className="text-gray-500">Réservé: <strong className="text-gray-800">{product.reservedStock}</strong></span>
        <span className="text-gray-500">Dispo: <strong className={`${isOutOfStock ? "text-red-600" : isLowStock ? "text-orange-600" : "text-green-600"}`}>{product.availableStock}</strong></span>
      </div>
    </div>
  )
}

function MovementRow({ movement }: { movement: NonNullable<ReturnType<typeof useSupplierStockMovements>["data"]>[number] }) {
  const typeInfo = MOVEMENT_TYPE_LABELS[movement.type]
  const colorClass = MOVEMENT_TYPE_COLORS[movement.type]
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
        {movement.type === "entry" ? <ArrowDownToLine className="w-4 h-4" /> :
         movement.type === "exit" ? <ArrowUpFromLine className="w-4 h-4" /> :
         movement.type === "return" ? <RotateCcw className="w-4 h-4" /> :
         movement.type === "adjustment" ? <SlidersHorizontal className="w-4 h-4" /> :
         <ClipboardCheck className="w-4 h-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${colorClass}`}>{typeInfo}</span>
          <span className="text-[12px] font-semibold text-gray-900">{movement.productName}</span>
        </div>
        <p className="text-[11px] text-gray-500 mt-0.5">
          Qté: <strong className="text-gray-700">{movement.quantity}</strong>
          {movement.type !== "inventory" && (
            <> · Stock: {movement.stockBefore} → <strong className="text-gray-700">{movement.stockAfter}</strong></>
          )}
        </p>
        {movement.notes && <p className="text-[10px] text-gray-400 mt-0.5 truncate">{movement.notes}</p>}
      </div>
      <span className="text-[10px] text-gray-400 shrink-0">{new Date(movement.createdAt).toLocaleDateString("fr-FR")}</span>
    </div>
  )
}

export default function SupplierStockScreen() {
  const [activeTab, setActiveTab] = useState<Tab>("stock")
  const [stockFilter, setStockFilter] = useState<StockFilter>("all")
  const [movementFilter, setMovementFilter] = useState<MovementFilter>("all")
  const [search, setSearch] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [adjustProductId, setAdjustProductId] = useState<string | null>(null)

  const { data: products, isLoading: productsLoading } = useSupplierProductsStock()
  const { data: movements, isLoading: movementsLoading } = useSupplierStockMovements(movementFilter !== "all" ? { type: movementFilter } : undefined)
  const { data: alerts } = useSupplierStockAlerts()

  const filteredProducts = useMemo(() => {
    if (!products) return []
    let result = [...products]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((p) => p.name.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q))
    }
    if (stockFilter === "out") result = result.filter((p) => !p.unlimitedStock && p.availableStock <= 0)
    else if (stockFilter === "low") result = result.filter((p) => !p.unlimitedStock && p.availableStock > 0 && p.availableStock <= p.lowStockThreshold)
    else if (stockFilter === "available") result = result.filter((p) => p.unlimitedStock || p.availableStock > p.lowStockThreshold)
    return result
  }, [products, search, stockFilter])

  const openAdjust = (productId: string) => {
    setAdjustProductId(productId)
    setShowModal(true)
  }

  const tabs: { value: Tab; label: string; count?: number }[] = [
    { value: "stock", label: "Stock", count: products?.length },
    { value: "movements", label: "Mouvements", count: movements?.length },
    { value: "alerts", label: "Alertes", count: (alerts ? alerts.outOfStock.length + alerts.lowStock.length : 0) },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900">Gestion des stocks</h1>
          <p className="text-[13px] text-gray-500 mt-1">Suivez et gérez votre inventaire</p>
        </div>
        <button onClick={() => { setAdjustProductId(null); setShowModal(true) }}
          className="h-9 px-4 bg-gray-900 text-white text-[12px] font-bold rounded-xl hover:opacity-90 cursor-pointer transition-all flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Mouvement
        </button>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {tabs.map((tab) => (
          <button key={tab.value} onClick={() => setActiveTab(tab.value)}
            className={`flex-1 h-9 rounded-lg text-[12px] font-semibold cursor-pointer transition-all ${
              activeTab === tab.value ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}>
            {tab.label}{tab.count !== undefined ? ` (${tab.count})` : ""}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "stock" && (
          <motion.div key="stock" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un produit..."
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-cm-green/20" />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {STOCK_FILTERS.map((f) => (
                <button key={f.value} onClick={() => setStockFilter(f.value)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-semibold cursor-pointer transition-all ${
                    stockFilter === f.value ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}>{f.label}</button>
              ))}
            </div>
            {productsLoading ? (
              <div className="space-y-3">{[1,2,3,4].map((i) => <SkeletonBlock key={i} className="h-28" />)}</div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-[13px] font-medium text-gray-500">Aucun produit trouvé</p>
                <p className="text-[11px] text-gray-400 mt-1">Ajoutez des produits dans votre catalogue</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredProducts.map((p) => <ProductStockCard key={p.id} product={p} onAdjust={openAdjust} />)}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "movements" && (
          <motion.div key="movements" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un produit..."
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-cm-green/20" />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {MOVEMENT_FILTERS.map((f) => (
                <button key={f.value} onClick={() => setMovementFilter(f.value)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-semibold cursor-pointer transition-all ${
                    movementFilter === f.value ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}>{f.label}</button>
              ))}
            </div>
            {movementsLoading ? (
              <div className="space-y-3">{[1,2,3,4].map((i) => <SkeletonBlock key={i} className="h-16" />)}</div>
            ) : movements && movements.length > 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                {movements.filter((m) => !search || m.productName?.toLowerCase().includes(search.toLowerCase())).map((m) => (
                  <MovementRow key={m.id} movement={m} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-[13px] font-medium text-gray-500">Aucun mouvement</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "alerts" && (
          <motion.div key="alerts" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-6">
            <div>
              <h2 className="text-[15px] font-bold text-gray-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                En rupture ({alerts?.outOfStock.length ?? 0})
              </h2>
              {!alerts || alerts.outOfStock.length === 0 ? (
                <p className="text-[12px] text-gray-400 py-4 text-center bg-white rounded-xl border border-gray-200">Aucun produit en rupture</p>
              ) : (
                <div className="space-y-2">
                  {alerts.outOfStock.map((p) => (
                    <div key={p.id} className="bg-white rounded-xl border border-red-200 p-4 flex items-center justify-between">
                      <div>
                        <p className="text-[13px] font-semibold text-gray-900">{p.name}</p>
                        <p className="text-[11px] text-red-600 mt-0.5">Stock: 0 · Seuil: {p.lowStockThreshold}</p>
                      </div>
                      <button onClick={() => openAdjust(p.id)}
                        className="h-8 px-3 rounded-lg bg-red-50 text-red-600 text-[11px] font-semibold hover:bg-red-100 cursor-pointer transition-colors">
                        Réapprovisionner
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-[15px] font-bold text-gray-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                Stock faible ({alerts?.lowStock.length ?? 0})
              </h2>
              {!alerts || alerts.lowStock.length === 0 ? (
                <p className="text-[12px] text-gray-400 py-4 text-center bg-white rounded-xl border border-gray-200">Aucun stock faible</p>
              ) : (
                <div className="space-y-2">
                  {alerts.lowStock.map((p) => (
                    <div key={p.id} className="bg-white rounded-xl border border-orange-200 p-4 flex items-center justify-between">
                      <div>
                        <p className="text-[13px] font-semibold text-gray-900">{p.name}</p>
                        <p className="text-[11px] text-orange-600 mt-0.5">Stock: {p.availableStock} · Seuil: {p.lowStockThreshold}</p>
                      </div>
                      <button onClick={() => openAdjust(p.id)}
                        className="h-8 px-3 rounded-lg bg-orange-50 text-orange-600 text-[11px] font-semibold hover:bg-orange-100 cursor-pointer transition-colors">
                        Réapprovisionner
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showModal && <MovementModal onClose={() => { setShowModal(false); setAdjustProductId(null) }} />}
      </AnimatePresence>
    </div>
  )
}
