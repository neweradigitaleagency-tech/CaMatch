import { Plus } from "lucide-react";
import ProfileSection from "./ProfileSection";
import type { SectionWithOffersProps } from "./types";

export default function OffersSection({
  mode, editing, offers, onAddOffer, onEditOffer, onDeleteOffer,
}: SectionWithOffersProps) {
  const isOwnerEdit = mode === "owner" && editing;

  const formatPrice = (v: number) => v.toLocaleString("fr-FR");

  return (
    <ProfileSection title="Offres spéciales" subtitle={isOwnerEdit ? `${offers.length} offre${offers.length > 1 ? "s" : ""}` : undefined}>
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory -mx-4 px-4">
        {offers.length === 0 && (
          <div className="flex-1 px-4 py-3 bg-gray-50 rounded-[14px] min-w-[200px]">
            <p className="text-[12px] font-semibold text-gray-400 text-center">
              {isOwnerEdit ? "Créez votre première offre" : "Aucune offre disponible"}
            </p>
          </div>
        )}
        {offers.map((offer) => {
          const discount = offer.originalPrice && offer.price ? Math.round((1 - offer.price / offer.originalPrice) * 100) : 0;
          return (
            <div key={offer.id}
              className="snap-start shrink-0 w-[220px] bg-gradient-to-br from-gray-900 to-gray-800 rounded-[20px] p-4 text-white overflow-hidden relative cursor-pointer active:scale-[0.98] transition-transform"
              onClick={() => isOwnerEdit && onEditOffer?.(offer)}>
              {offer.badge && (
                <div className={`absolute top-3 right-3 ${offer.badgeColor || "bg-emerald-500"} px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider`}>
                  {offer.badge}
                </div>
              )}
              {discount > 0 && (
                <div className="absolute top-3 right-3 bg-emerald-500 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider">
                  -{discount}%
                </div>
              )}
              <p className="text-[15px] font-black tracking-tight pr-8">{offer.title}</p>
              <p className="text-[10px] font-bold text-white/60 mt-1 leading-relaxed">{offer.description}</p>
              {offer.price != null && (
                <div className="flex items-baseline gap-1.5 mt-2.5">
                  <span className="text-[18px] font-black tracking-tight">{formatPrice(offer.price)}</span>
                  <span className="text-[8px] font-bold text-white/60">F</span>
                  {offer.originalPrice && (
                    <span className="text-[11px] text-white/40 line-through ml-1">{formatPrice(offer.originalPrice)} F</span>
                  )}
                </div>
              )}
              {isOwnerEdit && (
                <button onClick={(e) => { e.stopPropagation(); onDeleteOffer?.(offer.id); }}
                  className="mt-2 text-[9px] font-black uppercase tracking-wider text-red-400 hover:text-red-300 cursor-pointer">
                  Supprimer
                </button>
              )}
            </div>
          );
        })}
        {isOwnerEdit && (
          <button onClick={() => onAddOffer?.({
            title: "Nouvelle offre", description: "Description", badge: "Promo", badgeColor: "bg-amber-500", price: 25000, originalPrice: 35000,
          })}
            className="snap-start shrink-0 w-[220px] rounded-[20px] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1.5 text-gray-400 cursor-pointer active:scale-[0.98] hover:border-gray-300 hover:text-gray-600 transition-all">
            <Plus className="w-5 h-5" />
            <span className="text-[11px] font-black">Nouvelle offre</span>
          </button>
        )}
      </div>
    </ProfileSection>
  );
}
