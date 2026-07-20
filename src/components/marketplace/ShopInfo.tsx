import { Clock, MapPin, Phone, Truck, Mail, MessageCircle } from "lucide-react"
import type { Seller } from "../../types/marketplace"

interface ShopInfoProps {
  seller: Seller
}

export default function ShopInfo({ seller }: ShopInfoProps) {
  const isPro = seller.type === "professional" || seller.type === "ca_match_pro"
  const professional = isPro && "hours" in seller ? seller as Extract<Seller, { type: "professional" }> : null
  const deliveryZones = professional?.deliveryZones || []
  const address = "address" in seller ? seller.address : ""
  const phone = "phone" in seller ? seller.phone : ""
  const email = "email" in seller ? seller.email : ""

  return (
    <div className="px-5 pt-6 pb-2">
      <h3 className="text-sm font-bold text-[#1A1A1A] mb-3">Informations boutique</h3>

      <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
        {professional?.hours && (
          <div className="flex items-start gap-3 p-3.5">
            <Clock className="w-4 h-4 text-[#6B7280] mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider">Horaires</p>
              <p className="text-xs text-[#1A1A1A] mt-0.5">{professional.hours}</p>
            </div>
          </div>
        )}

        {address && (
          <div className="flex items-start gap-3 p-3.5">
            <MapPin className="w-4 h-4 text-[#6B7280] mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider">Adresse</p>
              <p className="text-xs text-[#1A1A1A] mt-0.5">{address}</p>
            </div>
          </div>
        )}

        {phone && (
          <div className="flex items-start gap-3 p-3.5">
            <Phone className="w-4 h-4 text-[#6B7280] mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider">Téléphone</p>
              <p className="text-xs text-[#1A1A1A] mt-0.5">{phone}</p>
            </div>
          </div>
        )}

        {email && (
          <div className="flex items-start gap-3 p-3.5">
            <Mail className="w-4 h-4 text-[#6B7280] mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider">Email</p>
              <p className="text-xs text-[#1A1A1A] mt-0.5">{email}</p>
            </div>
          </div>
        )}

        {deliveryZones.length > 0 && (
          <div className="flex items-start gap-3 p-3.5">
            <Truck className="w-4 h-4 text-[#6B7280] mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider">Zones de livraison</p>
              <div className="mt-1.5 space-y-1">
                {deliveryZones.filter((z) => z.isActive).map((z) => (
                  <div key={z.id} className="flex items-center justify-between text-xs">
                    <span className="text-[#1A1A1A]">{z.city}</span>
                    <span className="text-[#6B7280]">
                      {z.price.toLocaleString("fr-FR")} FCFA
                      {z.estimatedDelayHours && <span className="ml-1">· ~{z.estimatedDelayHours}h</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {phone && (
        <div className="mt-3">
          <a
            href={`https://wa.me/${phone.replace(/[^0-9]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-[#25D366] text-white text-sm font-bold cursor-pointer hover:bg-[#1da851] transition-colors active:scale-[0.98]"
          >
            <MessageCircle className="w-5 h-5" />
            Contacter sur WhatsApp
          </a>
        </div>
      )}
    </div>
  )
}
