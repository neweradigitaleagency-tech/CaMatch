import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Save, Package, ImagePlus, X, Link } from "lucide-react"
import { useSupplierProduct, useCreateProduct, useUpdateProduct } from "../../hooks/supplier/useSupplierProducts"
import { useSupplierProfile } from "../../hooks/supplier/useSupplierProfile"
import { getAllProductCategories } from "../../services/supplier/categories.service"
import { calculateCmPrice } from "../../types/supplier"
import type { ProductCategory, SupplierProductFormData, UnitType } from "../../types/supplier"
import { formatXOF } from "../../utils/format"

const UNIT_TYPES: { value: UnitType; label: string }[] = [
  { value: "piece", label: "Pièce" },
  { value: "meter", label: "Mètre" },
  { value: "kg", label: "Kilogramme" },
  { value: "liter", label: "Litre" },
  { value: "bag", label: "Sac" },
  { value: "box", label: "Boîte" },
  { value: "set", label: "Kit" },
]

export default function SupplierProductFormScreen() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const navigate = useNavigate()
  const { data: profile } = useSupplierProfile()
  const { data: existingProduct } = useSupplierProduct(id)
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()

  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [name, setName] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [description, setDescription] = useState("")
  const [brand, setBrand] = useState("")
  const [manufacturerReference, setManufacturerReference] = useState("")
  const [unitType, setUnitType] = useState<UnitType>("piece")
  const [supplierPrice, setSupplierPrice] = useState<number>(0)
  const [recommendedPrice, setRecommendedPrice] = useState<number>(0)
  const [stock, setStock] = useState<number>(0)
  const [lowStockThreshold, setLowStockThreshold] = useState(5)
  const [unlimitedStock, setUnlimitedStock] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [error, setError] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [imageUrl, setImageUrl] = useState("")
  const [saleEnabled, setSaleEnabled] = useState(false)
  const [salePrice, setSalePrice] = useState<number>(0)
  const [saleEndsAt, setSaleEndsAt] = useState("")

  const commissionRate = profile?.commissionRate ?? 10
  const cmPrice = calculateCmPrice(supplierPrice, commissionRate)

  useEffect(() => {
    getAllProductCategories().then(setCategories)
  }, [])

  useEffect(() => {
    if (isEdit && existingProduct) {
      setName(existingProduct.name)
      setCategoryId(existingProduct.categoryId)
      setDescription(existingProduct.description ?? "")
      setBrand(existingProduct.brand ?? "")
      setManufacturerReference(existingProduct.manufacturerReference ?? "")
      setUnitType(existingProduct.unitType)
      setSupplierPrice(existingProduct.supplierPrice)
      setRecommendedPrice(existingProduct.recommendedPrice ?? 0)
      setStock(existingProduct.stock)
      setLowStockThreshold(existingProduct.lowStockThreshold)
      setUnlimitedStock(existingProduct.unlimitedStock)
      setIsVisible(existingProduct.isVisible)
      setImages(existingProduct.images ?? [])
      if (existingProduct.salePrice && existingProduct.salePrice > 0) {
        setSaleEnabled(true)
        setSalePrice(existingProduct.salePrice)
        setSaleEndsAt(existingProduct.saleEndsAt ?? "")
      }
    }
  }, [isEdit, existingProduct])

  const handleSubmit = async () => {
    if (!name || !categoryId || supplierPrice <= 0) {
      setError("Nom, catégorie et prix fournisseur sont obligatoires.")
      return
    }
    setError("")

    const form: SupplierProductFormData = {
      name, categoryId,
      description: description || undefined,
      images,
      brand: brand || undefined,
      manufacturerReference: manufacturerReference || undefined,
      technicalSpecs: {},
      unitType, supplierPrice,
      recommendedPrice: recommendedPrice > 0 ? recommendedPrice : undefined,
      salePrice: saleEnabled && salePrice > 0 ? salePrice : undefined,
      saleEndsAt: saleEnabled && saleEndsAt ? saleEndsAt : undefined,
      stock, lowStockThreshold, unlimitedStock, isVisible,
    }

    if (isEdit && id) {
      await updateProduct.mutateAsync({ productId: id, form, commissionRate })
    } else {
      await createProduct.mutateAsync({ form, commissionRate })
    }
    navigate("/supplier/products")
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/supplier/products")}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer">
          <ArrowLeft className="w-4 h-4 text-gray-700" />
        </button>
        <div>
          <h1 className="text-[18px] font-bold text-gray-900">{isEdit ? "Modifier le produit" : "Nouveau produit"}</h1>
          <p className="text-[12px] text-gray-500">{isEdit ? existingProduct?.name : "Ajoutez un produit à votre catalogue"}</p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-[12px] text-red-600">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
        <h2 className="text-[13px] font-semibold text-gray-900 flex items-center gap-2">
          <Package className="w-4 h-4" /> Informations générales
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="text-[11px] font-medium text-gray-600 block mb-1">Nom du produit *</label>
            <input value={name} onChange={(e) => setName(e.target.value)}
              className="w-full h-9 px-3 border border-gray-300 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-cm-green/20 focus:border-cm-green" />
          </div>
          <div>
            <label className="text-[11px] font-medium text-gray-600 block mb-1">Catégorie *</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
              className="w-full h-9 px-3 border border-gray-300 rounded-lg text-[13px] focus:outline-none bg-white">
              <option value="">Sélectionner</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-medium text-gray-600 block mb-1">Unité</label>
            <select value={unitType} onChange={(e) => setUnitType(e.target.value as UnitType)}
              className="w-full h-9 px-3 border border-gray-300 rounded-lg text-[13px] focus:outline-none bg-white">
              {UNIT_TYPES.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-medium text-gray-600 block mb-1">Marque</label>
            <input value={brand} onChange={(e) => setBrand(e.target.value)}
              className="w-full h-9 px-3 border border-gray-300 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-cm-green/20 focus:border-cm-green" />
          </div>
          <div>
            <label className="text-[11px] font-medium text-gray-600 block mb-1">Référence fabricant</label>
            <input value={manufacturerReference} onChange={(e) => setManufacturerReference(e.target.value)}
              className="w-full h-9 px-3 border border-gray-300 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-cm-green/20 focus:border-cm-green" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-[11px] font-medium text-gray-600 block mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-cm-green/20 focus:border-cm-green resize-none" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <h2 className="text-[13px] font-semibold text-gray-900 flex items-center gap-2">
          <ImagePlus className="w-4 h-4" /> Photos
        </h2>
        <div className="flex gap-2">
          <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Coller une URL d'image..."
            className="flex-1 h-9 px-3 border border-gray-300 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-cm-green/20 focus:border-cm-green" />
          <button onClick={() => { if (imageUrl.trim()) { setImages([...images, imageUrl.trim()]); setImageUrl("") } }}
            disabled={!imageUrl.trim()}
            className="h-9 px-4 bg-cm-green text-white text-[12px] font-bold rounded-lg disabled:opacity-50 cursor-pointer flex items-center gap-1.5">
            <Link className="w-3.5 h-3.5" /> Ajouter
          </button>
        </div>
        {images.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {images.map((url, i) => (
              <div key={i} className="relative group">
                <img src={url} alt={`Photo ${i + 1}`}
                  className="w-20 h-20 rounded-lg object-cover border border-gray-200"
                  onError={(e) => { (e.target as HTMLImageElement).src = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ddd'><rect width='24' height='24' rx='4'/></svg>" }} />
                <button onClick={() => setImages(images.filter((_, j) => j !== i))}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <p className="text-[10px] text-gray-400">{images.length} photo{images.length > 1 ? "s" : ""} ajoutée{images.length > 1 ? "s" : ""}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
        <h2 className="text-[13px] font-semibold text-gray-900">💰 Prix</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-medium text-gray-600 block mb-1">Prix fournisseur *</label>
            <input value={supplierPrice || ""} onChange={(e) => setSupplierPrice(Number(e.target.value) || 0)} type="number" min={0}
              className="w-full h-9 px-3 border border-gray-300 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-cm-green/20 focus:border-cm-green" />
          </div>
          <div>
            <label className="text-[11px] font-medium text-gray-600 block mb-1">Prix conseillé</label>
            <input value={recommendedPrice || ""} onChange={(e) => setRecommendedPrice(Number(e.target.value) || 0)} type="number" min={0}
              className="w-full h-9 px-3 border border-gray-300 rounded-lg text-[13px] focus:outline-none" />
          </div>
          <div>
            <label className="text-[11px] font-medium text-gray-600 block mb-1">Commission</label>
            <div className="h-9 px-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center text-[13px] text-gray-700">
              {commissionRate}%
            </div>
          </div>
        </div>
        <div className="p-3 bg-cm-green/5 rounded-xl border border-cm-green/10">
          <p className="text-[12px] text-gray-600">
            Prix Ça Match : <span className="font-bold text-cm-green">{formatXOF(cmPrice)}</span>
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            Calculé : {formatXOF(supplierPrice)} / (1 - {commissionRate}%) = {formatXOF(cmPrice)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
        <h2 className="text-[13px] font-semibold text-gray-900">🏷️ Promo / Solde</h2>
        <label className="flex items-center gap-2 cursor-pointer">
          <input checked={saleEnabled} onChange={(e) => setSaleEnabled(e.target.checked)} type="checkbox"
            className="w-4 h-4 rounded border-gray-300 text-cm-green focus:ring-cm-green/20" />
          <span className="text-[12px] text-gray-700">Mettre en solde</span>
        </label>
        {saleEnabled && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-6">
            <div>
              <label className="text-[11px] font-medium text-gray-600 block mb-1">Prix soldé (FCFA)</label>
              <input value={salePrice || ""} onChange={(e) => setSalePrice(Number(e.target.value) || 0)} type="number" min={0}
                className="w-full h-9 px-3 border border-gray-300 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-cm-green/20 focus:border-cm-green" />
            </div>
            <div>
              <label className="text-[11px] font-medium text-gray-600 block mb-1">Date de fin</label>
              <input value={saleEndsAt} onChange={(e) => setSaleEndsAt(e.target.value)} type="date"
                className="w-full h-9 px-3 border border-gray-300 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-cm-green/20 focus:border-cm-green" />
            </div>
            {salePrice > 0 && supplierPrice > 0 && (
              <div className="sm:col-span-2">
                <p className="text-[11px] text-red-500 font-medium">
                  Remise : {Math.round((1 - salePrice / supplierPrice) * 100)}%
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
        <h2 className="text-[13px] font-semibold text-gray-900">📦 Stock</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-medium text-gray-600 block mb-1">Quantité</label>
            <input value={stock} onChange={(e) => setStock(Number(e.target.value) || 0)} type="number" min={0}
              disabled={unlimitedStock}
              className="w-full h-9 px-3 border border-gray-300 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-cm-green/20 focus:border-cm-green disabled:bg-gray-100 disabled:text-gray-400" />
          </div>
          <div>
            <label className="text-[11px] font-medium text-gray-600 block mb-1">Stock minimum d'alerte</label>
            <input value={lowStockThreshold} onChange={(e) => setLowStockThreshold(Number(e.target.value) || 0)} type="number" min={0}
              disabled={unlimitedStock}
              className="w-full h-9 px-3 border border-gray-300 rounded-lg text-[13px] focus:outline-none disabled:bg-gray-100 disabled:text-gray-400" />
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input checked={unlimitedStock} onChange={(e) => setUnlimitedStock(e.target.checked)} type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-cm-green focus:ring-cm-green/20" />
              <span className="text-[12px] text-gray-700">Stock illimité</span>
            </label>
          </div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input checked={isVisible} onChange={(e) => setIsVisible(e.target.checked)} type="checkbox"
            className="w-4 h-4 rounded border-gray-300 text-cm-green focus:ring-cm-green/20" />
          <span className="text-[12px] text-gray-700">Visible dans le catalogue</span>
        </label>
      </div>

      <button onClick={handleSubmit} disabled={createProduct.isPending || updateProduct.isPending}
        className="flex items-center justify-center gap-2 w-full h-11 bg-cm-green text-white text-[13px] font-bold rounded-xl hover:opacity-90 disabled:opacity-50 cursor-pointer transition-all">
        <Save className="w-4 h-4" />
        {createProduct.isPending || updateProduct.isPending ? "Enregistrement..." : isEdit ? "Enregistrer les modifications" : "Ajouter le produit"}
      </button>
    </div>
  )
}
