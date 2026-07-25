import { useMemo } from "react"
import { XCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"
import type { Seller } from "../../types/marketplace"
import { getProductsBySeller } from "../../data/marketplaceProducts"
import ShopHero from "./ShopHero"
import ShopAbout from "./ShopAbout"
import ShopFeaturedProducts from "./ShopFeaturedProducts"
import ShopCatalog from "./ShopCatalog"
import ShopReviews from "./ShopReviews"

interface ShopScreenProps {
  seller: Seller
}

export default function ShopScreen({ seller }: ShopScreenProps) {
  const products = useMemo(() => getProductsBySeller(seller.id), [seller.id])
  const hasProducts = products.length > 0

  return (
    <div className="flex flex-col w-full min-h-dynamic bg-cm-bg">
      <ShopHero seller={seller} productCount={products.length} />
      <ShopAbout seller={seller} />
      {hasProducts && <ShopFeaturedProducts products={products.slice(0, 8)} />}
      {hasProducts && <ShopCatalog products={products} />}
      <ShopReviews sellerId={seller.id} reviewCount={seller.reviewCount} rating={seller.rating} />
      <div className="h-6" />
    </div>
  )
}

export function ShopNotFound() {
  const nav = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center min-h-dynamic bg-cm-bg px-5">
      <XCircle className="w-12 h-12 text-cm-text-muted mb-3" />
      <h2 className="text-lg font-bold text-cm-text">Boutique introuvable</h2>
      <p className="text-sm text-cm-text-soft mt-1 text-center">Cette boutique n'existe pas ou a été supprimée.</p>
      <button
        onClick={() => nav("/marketplace")}
        className="mt-4 h-12 px-6 rounded-xl bg-cm-text text-white text-sm font-bold cursor-pointer active:scale-[0.98] transition-transform"
      >
        Retour au marketplace
      </button>
    </div>
  )
}
