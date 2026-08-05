import { useEffect } from "react"
import { useParams } from "react-router-dom"
import { XCircle } from "lucide-react"
import { getSellerById, PROFESSIONAL_SELLERS, INDIVIDUAL_SELLERS, CA_MATCH_PRO_SELLERS } from "../../data/marketplaceSuppliers"
import ShopScreenV2 from "../../components/marketplace/ShopScreenV2"
import { useAppNavigation } from "../../navigation/useAppNavigation"

export default function ShopPage() {
  const { sellerId } = useParams<{ sellerId: string }>()

  let seller = sellerId ? getSellerById(sellerId) : undefined

  if (!seller && sellerId) {
    seller = [...PROFESSIONAL_SELLERS, ...INDIVIDUAL_SELLERS, ...CA_MATCH_PRO_SELLERS].find((s) => s.id === sellerId)
  }

  useEffect(() => {
    if (!seller && sellerId) {
      console.warn("[ShopPage] seller not found for id:", sellerId)
    }
  }, [sellerId, seller])

  if (!seller) return <ShopNotFound />
  return <ShopScreenV2 seller={seller} />
}

function ShopNotFound() {
  const { navigate } = useAppNavigation()
  return (
    <div className="flex flex-col items-center justify-center min-h-dynamic bg-cm-bg px-5">
      <XCircle className="w-12 h-12 text-cm-text-muted mb-3" />
      <h2 className="text-lg font-bold text-cm-text">Boutique introuvable</h2>
      <p className="text-sm text-cm-text-soft mt-1 text-center">Cette boutique n'existe pas ou a été supprimée.</p>
      <button
        onClick={() => navigate("/marketplace")}
        className="mt-4 h-12 px-6 rounded-xl bg-cm-text text-white text-sm font-bold cursor-pointer active:scale-[0.98] transition-transform"
      >
        Retour au marketplace
      </button>
    </div>
  )
}
