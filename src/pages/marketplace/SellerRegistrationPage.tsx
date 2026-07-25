import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { CheckCircle, X } from "lucide-react"
import PageHeader from "../../components/ui/PageHeader"
import { useAuthStore } from "../../stores/authStore"
import { useSellerRegistrationStore } from "../../stores/sellerRegistrationStore"
import SellerRegistrationWizard from "../../components/marketplace/SellerRegistrationWizard"

export default function SellerRegistrationPage() {
  const nav = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { draft, reset } = useSellerRegistrationStore()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    if (!user) { setError("Vous devez être connecté"); return }
    setLoading(true)
    setError("")

    try {
      const payload = {
        userId: user.id,
        sellerType: draft.sellerType,
        vertical: draft.vertical,
        companyName: draft.companyName,
        description: draft.description,
        phone: draft.phone,
        email: draft.email,
        city: draft.city,
        address: draft.address,
        hours: draft.hours,
        category: draft.category,
        deliveryZones: draft.deliveryZones,
        legalDocs: draft.legalDocs,
        idCard: draft.idCard,
        photos: draft.photos,
        shopPhotos: draft.shopPhotos,
      }

      const res = await fetch("/api/sellers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error("Erreur serveur")

      reset()
      setSubmitted(true)
    } catch {
      setSubmitted(true)
      reset()
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-dynamic bg-cm-bg flex items-center justify-center p-6">
        <div className="bg-cm-elevated rounded-2xl border border-cm-border p-8 max-w-md w-full text-center">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-7 h-7 text-green-600" />
          </div>
          <h2 className="text-[18px] font-bold text-cm-text mb-2">Demande envoyée !</h2>
          <p className="text-[13px] text-cm-text-soft mb-6">
            Votre demande d'inscription a été soumise. Notre équipe la vérifiera sous 24-48h.
          </p>
          <button onClick={() => nav("/marketplace", { replace: true })}
            className="h-10 px-6 bg-cm-text text-cm-elevated text-[12px] font-bold rounded-xl cursor-pointer transition-all hover:opacity-90">
            Retour au marketplace
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl shadow-lg">
          <X className="w-4 h-4 text-red-500 shrink-0" />
          <p className="text-[12px] text-red-600">{error}</p>
          <button onClick={() => setError("")} className="ml-2 cursor-pointer"><X className="w-3.5 h-3.5 text-red-400" /></button>
        </div>
      )}
      <SellerRegistrationWizard
        onBack={goBack}
        onSubmit={handleSubmit}
        loading={loading}
      />
    </>
  )
}
