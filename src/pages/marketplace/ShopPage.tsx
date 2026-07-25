import { useEffect } from "react"
import { useParams, useSearchParams } from "react-router-dom"
import { getSellerById, PROFESSIONAL_SELLERS, INDIVIDUAL_SELLERS, CA_MATCH_PRO_SELLERS } from "../../data/marketplaceSuppliers"
import ShopScreen, { ShopNotFound } from "../../components/marketplace/ShopScreen"
import ShopScreenV2 from "../../components/marketplace/ShopScreenV2"

export default function ShopPage() {
  const { sellerId } = useParams<{ sellerId: string }>()
  const [searchParams] = useSearchParams()
  const variant = searchParams.get("v")

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
  if (variant === "2") return <ShopScreenV2 seller={seller} />
  return <ShopScreen seller={seller} />
}
