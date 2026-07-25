import { useState } from "react"
import { Clock, MapPin, Phone, Truck, Mail, ChevronDown, ChevronUp, Store } from "lucide-react"
import type { Seller } from "../../types/marketplace"

interface ShopAboutProps {
  seller: Seller
}

export default function ShopAbout({ seller }: ShopAboutProps) {
  const [expanded, setExpanded] = useState(false)
  const isPro = seller.type === "professional" || seller.type === "ca_match_pro"
  const professional = isPro && "hours" in seller ? seller as Extract<Seller, { type: "professional" }> : null
  const deliveryZones = professional?.deliveryZones || []
  const address = "address" in seller ? seller.address : ""
  const phone = "phone" in seller ? seller.phone : ""
  const email = "email" in seller ? seller.email : ""
  const description = "description" in seller ? seller.description : ""

  const infoItems = [
    { icon: Clock, label: "Horaires", value: professional?.hours },
    { icon: MapPin, label: "Adresse", value: address },
    { icon: Phone, label: "Téléphone", value: phone },
    { icon: Mail, label: "Email", value: email },
  ].filter((i) => i.value)

  const visibleItems = expanded ? infoItems : infoItems.slice(0, 2)

  if (infoItems.length === 0 && deliveryZones.length === 0 && !description) return null

  return (
    <div className="px-5 pt-5">
      <div className="bg-cm-elevated rounded-xl border border-cm-border overflow-hidden">
        {description && (
          <div className="p-4 border-b border-cm-border/50">
            <div className="flex items-start gap-2.5">
              <Store className="w-4 h-4 text-cm-text-soft mt-0.5 shrink-0" />
              <p className="text-xs text-cm-text-soft leading-relaxed">{description}</p>
            </div>
          </div>
        )}

        <div className="divide-y divide-cm-border/50">
          {visibleItems.map((item) => (
            <div key={item.label} className="flex items-start gap-3 px-4 py-3">
              <item.icon className="w-4 h-4 text-cm-text-soft mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-semibold text-cm-text-soft uppercase tracking-wider">{item.label}</p>
                <p className="text-xs text-cm-text mt-0.5">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {infoItems.length > 2 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-center gap-1 py-2.5 text-xs font-semibold text-cm-text-soft cursor-pointer hover:text-cm-text transition-colors border-t border-cm-border/50"
          >
            {expanded ? "Voir moins" : `Voir tout (${infoItems.length})`}
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}

        {deliveryZones.length > 0 && (
          <div className="border-t border-cm-border/50 px-4 py-3">
            <div className="flex items-start gap-3">
              <Truck className="w-4 h-4 text-cm-text-soft mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold text-cm-text-soft uppercase tracking-wider">Zones de livraison</p>
                <div className="mt-1.5 space-y-1">
                  {deliveryZones.filter((z) => z.isActive).map((z) => (
                    <div key={z.id} className="flex items-center justify-between text-xs">
                      <span className="text-cm-text">{z.city}</span>
                      <span className="text-cm-text-soft">
                        {z.price.toLocaleString("fr-FR")} F
                        {z.estimatedDelayHours && <span className="ml-1">· ~{z.estimatedDelayHours}h</span>}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
