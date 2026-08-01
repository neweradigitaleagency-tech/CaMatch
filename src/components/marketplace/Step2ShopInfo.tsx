import { useRef } from "react"
import { motion } from "motion/react"
import { Upload, X, ImagePlus } from "lucide-react"
import { useSellerRegistrationStore } from "../../stores/sellerRegistrationStore"

export default function Step2ShopInfo() {
  const { draft, setShopField, addPhoto, removePhoto } = useSellerRegistrationStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader()
        reader.onload = (ev) => {
          if (ev.target?.result) {
            addPhoto(ev.target.result as string)
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const cities = ["Abidjan", "Cocody", "Yopougon", "Marcory", "Plateau", "Treichville", "Adjamé", "Koumassi", "Bingerville"]

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-bold text-cm-text">Informations de la boutique</h2>
        <p className="text-sm text-cm-text-muted mt-1">
          {draft.sellerType === "individual" ? "Quelques informations pour votre annonce" : "Dites-nous en plus sur votre activité"}
        </p>
      </div>

      {(draft.sellerType === "professional" || draft.sellerType === "ca_match_pro") && (
        <>
          <div>
            <label className="text-xs font-semibold text-cm-text-muted uppercase tracking-wider mb-1.5 block">
              Nom de la boutique
            </label>
            <input
              type="text"
              value={draft.companyName}
              onChange={(e) => setShopField("companyName", e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-cm-elevated border border-cm-border-soft text-sm text-cm-text outline-none focus:border-[#243318] transition-colors placeholder:text-cm-border-soft"
              placeholder="Ex: Quincaillerie ABC"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-cm-text-muted uppercase tracking-wider mb-1.5 block">
              Description
            </label>
            <textarea
              value={draft.description}
              onChange={(e) => setShopField("description", e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-cm-elevated border border-cm-border-soft text-sm text-cm-text outline-none focus:border-[#243318] transition-colors placeholder:text-cm-border-soft resize-none"
              placeholder="Décrivez votre activité..."
            />
          </div>
        </>
      )}

      {draft.sellerType === "individual" && (
        <div>
          <label className="text-xs font-semibold text-cm-text-muted uppercase tracking-wider mb-1.5 block">
            Nom d'affichage
          </label>
          <input
            type="text"
            value={draft.companyName}
            onChange={(e) => setShopField("companyName", e.target.value)}
            className="w-full h-12 px-4 rounded-xl bg-cm-elevated border border-cm-border-soft text-sm text-cm-text outline-none focus:border-[#243318] transition-colors placeholder:text-cm-border-soft"
            placeholder="Votre nom ou pseudo"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-cm-text-muted uppercase tracking-wider mb-1.5 block">Téléphone</label>
          <input
            type="tel"
            value={draft.phone}
            onChange={(e) => setShopField("phone", e.target.value)}
            className="w-full h-12 px-4 rounded-xl bg-cm-elevated border border-cm-border-soft text-sm text-cm-text outline-none focus:border-[#243318] transition-colors placeholder:text-cm-border-soft"
            placeholder="+225 07 XX XX XX XX"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-cm-text-muted uppercase tracking-wider mb-1.5 block">Ville</label>
          <select
            value={draft.city}
            onChange={(e) => setShopField("city", e.target.value)}
            className="w-full h-12 px-4 rounded-xl bg-cm-elevated border border-cm-border-soft text-sm text-cm-text outline-none focus:border-[#243318] transition-colors appearance-none"
          >
            <option value="">Sélectionner</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-cm-text-muted uppercase tracking-wider mb-1.5 block">
          Adresse
        </label>
        <input
          type="text"
          value={draft.address}
          onChange={(e) => setShopField("address", e.target.value)}
          className="w-full h-12 px-4 rounded-xl bg-cm-elevated border border-cm-border-soft text-sm text-cm-text outline-none focus:border-[#243318] transition-colors placeholder:text-cm-border-soft"
          placeholder="Rue, quartier, numéro"
        />
      </div>

      {(draft.sellerType === "professional" || draft.sellerType === "ca_match_pro") && (
        <div>
          <label className="text-xs font-semibold text-cm-text-muted uppercase tracking-wider mb-1.5 block">
            Horaires d'ouverture
          </label>
          <input
            type="text"
            value={draft.hours}
            onChange={(e) => setShopField("hours", e.target.value)}
            className="w-full h-12 px-4 rounded-xl bg-cm-elevated border border-cm-border-soft text-sm text-cm-text outline-none focus:border-[#243318] transition-colors placeholder:text-cm-border-soft"
            placeholder="Ex: Lun-Sam 8h-18h"
          />
        </div>
      )}

      <div>
        <label className="text-xs font-semibold text-cm-text-muted uppercase tracking-wider mb-1.5 block">
          Photos de la boutique / produits
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="flex gap-2 flex-wrap">
          {draft.photos.map((photo, i) => (
            <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-cm-border-soft">
              <img src={photo} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => removePhoto(i)}
                className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center cursor-pointer"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
          {draft.photos.length < 6 && (
            <button
              onClick={handleImageSelect}
              className="w-20 h-20 rounded-xl border-2 border-dashed border-cm-border-soft flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-cm-border-soft transition-colors"
            >
              <ImagePlus className="w-5 h-5 text-cm-text-muted" />
              <span className="text-[9px] text-cm-text-muted font-medium">Ajouter</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
