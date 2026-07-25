import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useAuthStore } from "../../stores/authStore"
import { findConversation, createConversation } from "../../services/chatService"
import { getSellerById, PROFESSIONAL_SELLERS, INDIVIDUAL_SELLERS, CA_MATCH_PRO_SELLERS } from "../../data/marketplaceSuppliers"

export default function NewConversationPage() {
  const nav = useNavigate()
  const [searchParams] = useSearchParams()
  const sellerId = searchParams.get("seller")
  const currentUserId = useAuthStore((s) => s.userId)
  const fallbackUserId = "client_marie"
  const userId = currentUserId || fallbackUserId
  const [status, setStatus] = useState("Création de la conversation…")

  useEffect(() => {
    if (!sellerId) {
      nav("/messages", { replace: true })
      return
    }

    let seller = getSellerById(sellerId)
    if (!seller) {
      seller = [...PROFESSIONAL_SELLERS, ...INDIVIDUAL_SELLERS, ...CA_MATCH_PRO_SELLERS].find((s) => s.id === sellerId)
    }

    if (!seller) {
      setStatus("Vendeur introuvable")
      return
    }

    const sellerUserId = seller.userId || `seller_${seller.id}`
    const jobId = `marketplace_contact_${sellerId}_${Date.now()}`

    const init = async () => {
      const existing = await findConversation(userId, sellerUserId, jobId)
      if (existing) {
        nav(`/messages/${existing}`, { replace: true })
        return
      }
      const convId = await createConversation({
        participant1: userId,
        participant2: sellerUserId,
        jobId,
        metadata: { sellerId: seller.id },
      })
      if (convId) {
        nav(`/messages/${convId}`, { replace: true })
      } else {
        setStatus("Erreur lors de la création de la conversation")
      }
    }

    init()
  }, [sellerId, userId, nav])

  return (
    <div className="flex items-center justify-center min-h-dynamic bg-cm-bg px-5">
      <p className="text-sm text-cm-text-soft">{status}</p>
    </div>
  )
}
