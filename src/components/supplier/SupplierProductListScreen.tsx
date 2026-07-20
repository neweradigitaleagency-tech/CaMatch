import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, Search, Package, AlertTriangle, ToggleLeft, ToggleRight, Filter } from "lucide-react"
import { useSupplierProducts, useToggleProductActive } from "../../hooks/supplier/useSupplierProducts"
import { formatXOF } from "../../utils/format"

export default function SupplierProductListScreen() {
  const navigate = useNavigate()
  const { data: products, isLoading } = useSupplierProducts()
  const toggleActive = useToggleProductActive()
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "active" | "inactive" | "low_stock">("all")

  const filtered = (products ?? []).filter((p) => {
    if (search) {
      const q = search.toLowerCase()
      if (!p.name.toLowerCase().includes(q) && !(p.brand && p.brand.toLowerCase().includes(q))) return false
    }
    if (filter === "active") return p.isActive
    if (filter === "inactive") return !p.isActive
    if (filter === "low_stock") return !p.unlimitedStock && p.availableStock <= p.lowStockThreshold
    return true
  })

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="h-4 bg-gray-200/50 animate-pulse rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-200/50 animate-pulse rounded w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-gray-900">Produits</h1>
          <p className="text-[12px] text-gray-500">{products?.length ?? 0} produits</p>
        </div>
        <button onClick={() => navigate("/supplier/products/new")}
          className="h-9 px-4 bg-cm-green text-white text-[12px] font-bold rounded-xl hover:opacity-90 cursor-pointer transition-all flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>

      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 bg-white border border-gray-200 rounded-xl text-[12px] focus:outline-none focus:ring-2 focus:ring-cm-green/20 focus:border-cm-green"
            placeholder="Rechercher un produit..." />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}
          className="h-9 px-3 bg-white border border-gray-200 rounded-xl text-[12px] focus:outline-none cursor-pointer">
          <option value="all">Tous</option>
          <option value="active">Actifs</option>
          <option value="inactive">Inactifs</option>
          <option value="low_stock">Stock faible</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-[14px] font-medium text-gray-500 mb-1">Aucun produit trouvé</p>
          <p className="text-[12px] text-gray-400 mb-4">{search ? "Essayez un autre terme de recherche" : "Commencez par ajouter votre premier produit"}</p>
          {!search && (
            <button onClick={() => navigate("/supplier/products/new")}
              className="h-9 px-4 bg-gray-900 text-white text-[12px] font-bold rounded-xl cursor-pointer">
              Ajouter un produit
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((product) => {
            const isOnSale = product.salePrice && product.salePrice > 0 && product.salePrice < product.supplierPrice
            const discountPct = isOnSale ? Math.round((1 - (product.salePrice! / product.supplierPrice)) * 100) : 0
            return (
            <div key={product.id}
              onClick={() => navigate(`/supplier/products/${product.id}/edit`)}
              className="bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 cursor-pointer transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3 flex-1 min-w-0">
                  {product.images?.[0] && (
                    <div className="shrink-0 w-14 h-14 rounded-lg overflow-hidden border border-gray-100">
                      <img src={product.images[0]} alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[14px] font-semibold text-gray-900">{product.name}</p>
                      {isOnSale && (
                        <span className="px-1.5 py-0.5 bg-red-100 text-red-600 rounded text-[10px] font-bold">-{discountPct}%</span>
                      )}
                      {!product.isActive && (
                        <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] text-gray-500">Inactif</span>
                      )}
                      {!product.unlimitedStock && product.availableStock <= product.lowStockThreshold && (
                        <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {product.brand && `${product.brand} · `}{product.manufacturerReference && `${product.manufacturerReference} · `}
                      {product.categoryName}
                    </p>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      {isOnSale ? (
                        <>
                          <span className="text-[12px] font-bold text-red-600">{formatXOF(product.salePrice!)}</span>
                          <span className="text-[11px] text-gray-400 line-through">{formatXOF(product.supplierPrice)}</span>
                        </>
                      ) : (
                        <span className="text-[12px] font-medium text-gray-700">{formatXOF(product.supplierPrice)}</span>
                      )}
                      <span className="text-[11px] text-gray-400">→ {formatXOF(product.cmPrice)}</span>
                      {product.unlimitedStock ? (
                        <span className="text-[11px] text-green-600">Stock illimité</span>
                      ) : (
                        <span className={`text-[11px] ${product.availableStock <= product.lowStockThreshold ? "text-orange-600 font-medium" : "text-gray-500"}`}>
                          Stock: {product.availableStock}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); toggleActive.mutate({ productId: product.id, isActive: !product.isActive }) }}
                  className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-colors ${
                    product.isActive ? "text-green-600 hover:bg-green-50" : "text-gray-300 hover:bg-gray-100"
                  }`}>
                  {product.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )})}
        </div>
      )}
    </div>
  )
}
