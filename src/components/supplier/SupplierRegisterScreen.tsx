import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Building2, Upload, CheckCircle } from "lucide-react"
import { useAuthStore } from "../../stores/authStore"
import { useCreateSupplierApplication } from "../../hooks/supplier/useSupplierProfile"
import type { SupplierApplication } from "../../types/supplier"

const ABIDJAN_COMMUNES = ["Cocody", "Plateau", "Marcory", "Yopougon", "Adjamé", "Treichville", "Koumassi", "Port-Bouët", "Attécoubé", "Abobo", "Bingerville", "Anyama"]

export default function SupplierRegisterScreen() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const createApplication = useCreateSupplierApplication()

  const [step, setStep] = useState(1)
  const [companyName, setCompanyName] = useState("")
  const [ownerName, setOwnerName] = useState("")
  const [phone, setPhone] = useState(user?.phone ?? "")
  const [email, setEmail] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [deliveryCities, setDeliveryCities] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  const toggleDeliveryCity = (c: string) => {
    setDeliveryCities((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c])
  }

  const handleSubmit = async () => {
    if (!companyName || !ownerName || !phone || !city) {
      setError("Veuillez remplir tous les champs obligatoires.")
      return
    }
    setError("")

    const app: Omit<SupplierApplication, "id" | "status" | "createdAt" | "updatedAt"> = {
      userId: user?.id ?? "",
      companyName,
      ownerName,
      phone,
      email: email || undefined,
      address: address || undefined,
      city,
      deliveryCities: deliveryCities.length > 0 ? deliveryCities : undefined,
    }
    const result = await createApplication.mutateAsync(app)
    if (result) setSubmitted(true)
    else setError("Erreur lors de l'envoi. Réessayez.")
  }

  if (submitted) {
    return (
      <div className="min-h-dynamic bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-md w-full text-center">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-7 h-7 text-green-600" />
          </div>
          <h2 className="text-[18px] font-bold text-gray-900 mb-2">Compte créé avec succès !</h2>
          <p className="text-[13px] text-gray-500 mb-6">
            Votre demande d'inscription a été envoyée. Notre équipe la vérifiera sous 24-48h. Vous recevrez une notification dès que votre compte sera actif.
          </p>
          <button onClick={() => navigate("/")}
            className="h-10 px-6 bg-gray-900 text-white text-[12px] font-bold rounded-xl hover:opacity-90 cursor-pointer transition-all">
            Retour à l'accueil
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dynamic bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-6 max-w-lg w-full">
        <button onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer mb-4">
          <ArrowLeft className="w-4 h-4 text-gray-700" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <Building2 className="w-5 h-5 text-cm-green" />
          <h1 className="text-[18px] font-bold text-gray-900">Devenir fournisseur</h1>
        </div>
        <p className="text-[12px] text-gray-500 mb-6">Créez votre compte fournisseur Ça Match</p>

        <div className="flex gap-1 mb-6">
          {[1, 2].map((s) => (
            <div key={s} className={`h-1 flex-1 rounded-full ${s <= step ? "bg-cm-green" : "bg-gray-200"}`} />
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-[12px] text-red-600">{error}</p>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="text-[12px] font-medium text-gray-700 block mb-1">Nom de la quincaillerie *</label>
              <input value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                className="w-full h-10 px-3 border border-gray-300 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-cm-green/20 focus:border-cm-green" placeholder="Quincaillerie ABC" />
            </div>
            <div>
              <label className="text-[12px] font-medium text-gray-700 block mb-1">Responsable *</label>
              <input value={ownerName} onChange={(e) => setOwnerName(e.target.value)}
                className="w-full h-10 px-3 border border-gray-300 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-cm-green/20 focus:border-cm-green" placeholder="Mamadou Diallo" />
            </div>
            <div>
              <label className="text-[12px] font-medium text-gray-700 block mb-1">Téléphone *</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)}
                className="w-full h-10 px-3 border border-gray-300 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-cm-green/20 focus:border-cm-green" placeholder="+225 07 1234 5678" />
            </div>
            <div>
              <label className="text-[12px] font-medium text-gray-700 block mb-1">Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email"
                className="w-full h-10 px-3 border border-gray-300 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-cm-green/20 focus:border-cm-green" placeholder="contact@quincaillerie.ci" />
            </div>
            <div>
              <label className="text-[12px] font-medium text-gray-700 block mb-1">Adresse</label>
              <input value={address} onChange={(e) => setAddress(e.target.value)}
                className="w-full h-10 px-3 border border-gray-300 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-cm-green/20 focus:border-cm-green" placeholder="15 Rue des Commercants" />
            </div>
            <button onClick={() => setStep(2)}
              className="w-full h-10 bg-gray-900 text-white text-[13px] font-bold rounded-xl hover:opacity-90 cursor-pointer transition-all">
              Suivant
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="text-[12px] font-medium text-gray-700 block mb-1">Ville *</label>
              <select value={city} onChange={(e) => setCity(e.target.value)}
                className="w-full h-10 px-3 border border-gray-300 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-cm-green/20 focus:border-cm-green bg-white">
                <option value="">Sélectionnez une commune</option>
                {ABIDJAN_COMMUNES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[12px] font-medium text-gray-700 block mb-2">Zones de livraison</label>
              <div className="flex flex-wrap gap-2">
                {ABIDJAN_COMMUNES.map((c) => (
                  <button key={c} onClick={() => toggleDeliveryCity(c)}
                    className={`px-3 h-8 rounded-lg text-[11px] font-medium border cursor-pointer transition-colors ${
                      deliveryCities.includes(c) ? "bg-cm-green text-white border-cm-green" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                    }`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div className="pt-2">
              <label className="text-[12px] font-medium text-gray-700 block mb-2">Documents légaux</label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-gray-400 cursor-pointer transition-colors">
                <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <p className="text-[12px] text-gray-500">Ajoutez votre registre de commerce</p>
                <p className="text-[10px] text-gray-400 mt-1">PDF, JPG — max 5 Mo</p>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setStep(1)}
                className="flex-1 h-10 border border-gray-300 text-gray-700 text-[13px] font-medium rounded-xl hover:bg-gray-50 cursor-pointer transition-all">
                Retour
              </button>
              <button onClick={handleSubmit} disabled={createApplication.isPending}
                className="flex-1 h-10 bg-cm-green text-white text-[13px] font-bold rounded-xl hover:opacity-90 disabled:opacity-50 cursor-pointer transition-all">
                {createApplication.isPending ? "Envoi..." : "Créer mon compte"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
