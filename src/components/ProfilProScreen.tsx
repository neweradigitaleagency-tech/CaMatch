import { useState } from "react";
import { ArrowLeft, MoreVertical, Star, CheckCircle, MapPin, ShieldCheck, Plus, Check, BadgeCheck, Image as ImageIcon, Shield, Clock, DollarSign } from "lucide-react";
import { ProfessionalDetails, Service, PortfolioItem, ProVerification, VerificationLevel } from "../types";
import ImageViewer from "./ImageViewer";

interface ProfilProScreenProps {
  pro: ProfessionalDetails;
  services: Service[];
  portfolio?: PortfolioItem[];
  verification?: ProVerification;
  onBack: () => void;
  onInitiateMatch: (selectedServices: Service[]) => void;
}

const VERIFICATION_LABELS: Record<VerificationLevel, { label: string; color: string }> = {
  none: { label: "Non vérifié", color: "text-gray-500" },
  phone: { label: "Téléphone vérifié", color: "text-gray-600" },
  id: { label: "Identité vérifiée", color: "text-blue-600" },
  background: { label: "Confiance vérifiée", color: "text-purple-600" },
  certified: { label: "Expert certifié", color: "text-amber-600" },
  elite: { label: "Niveau Élite", color: "text-red-600" },
};

export default function ProfilProScreen({ pro, services, portfolio, verification, onBack, onInitiateMatch }: ProfilProScreenProps) {
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIdx, setGalleryIdx] = useState(0);

  const toggleService = (serviceId: string) => {
    if (selectedServiceIds.includes(serviceId)) {
      setSelectedServiceIds(selectedServiceIds.filter((id) => id !== serviceId));
    } else {
      setSelectedServiceIds([...selectedServiceIds, serviceId]);
    }
  };

  const handleLaunchMatch = () => {
    const activeServices = services.filter((s) => selectedServiceIds.includes(s.id));
    const finalServicesList = activeServices.length > 0 ? activeServices : [services[0]];
    onInitiateMatch(finalServicesList);
  };

  const currentRating = (pro.rating / 10).toFixed(1);
  const vInfo = verification ? VERIFICATION_LABELS[verification.level] : null;

  return (
    <div className="flex flex-col w-full pb-36 relative">
      {/* Top action bar */}
      <header className="flex justify-between items-center px-4 py-3 sticky top-0 z-10 bg-brand-cream/90 backdrop-blur-md">
        <button
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white text-brand-forest hover:bg-pale-mint transition-colors shadow-sm cursor-pointer active:scale-95 duration-150"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="font-sans text-sm font-bold text-brand-forest">Profil Pro</h1>
        <button className="w-9 h-9 flex items-center justify-center rounded-full bg-white text-secondary hover:bg-pale-mint transition-colors shadow-sm cursor-pointer active:scale-95 duration-150">
          <MoreVertical className="w-4 h-4" />
        </button>
      </header>

      {/* Hero card */}
      <section className="px-4 mt-1 mb-4">
        <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-premium relative group">
          <img alt={pro.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" src={pro.avatarUrl} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-5">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="font-sans text-xl font-bold text-white mb-0.5">{pro.name}</h2>
                <p className="text-white/80 text-xs tracking-wide font-medium">{pro.title}</p>
                {vInfo && (
                  <span className={`inline-flex items-center gap-1 mt-1.5 text-[9px] font-bold uppercase tracking-wider ${vInfo.color}`}>
                    <BadgeCheck className="w-3 h-3" />{vInfo.label}
                  </span>
                )}
              </div>
              <div className="bg-brand-lime px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                <Star className="w-3.5 h-3.5 fill-brand-forest stroke-brand-forest" />
                <span className="text-[10px] font-bold text-brand-forest">{currentRating} ({pro.reviewCount})</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats badges */}
      <section className="flex gap-2 overflow-x-auto pb-1 no-scrollbar px-4 mb-4">
        <div className="flex-none bg-white px-4 py-2 rounded-full flex items-center gap-1.5 shadow-sm border border-pale-mint/10">
          <CheckCircle className="w-3.5 h-3.5 text-brand-forest" />
          <span className="text-[10px] font-bold text-brand-forest whitespace-nowrap">{pro.completedInterventions}+ Missions</span>
        </div>
        <div className="flex-none bg-white px-4 py-2 rounded-full flex items-center gap-1.5 shadow-sm border border-pale-mint/10">
          <MapPin className="w-3.5 h-3.5 text-brand-forest" />
          <span className="text-[10px] font-bold text-brand-forest whitespace-nowrap">{pro.locationNeighborhood}</span>
        </div>
        <div className="flex-none bg-white px-4 py-2 rounded-full flex items-center gap-1.5 shadow-sm border border-pale-mint/10">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-forest" />
          <span className="text-[10px] font-bold text-brand-forest whitespace-nowrap">Garantie 7j</span>
        </div>
        <div className="flex-none bg-white px-4 py-2 rounded-full flex items-center gap-1.5 shadow-sm border border-pale-mint/10">
          <Clock className="w-3.5 h-3.5 text-brand-forest" />
          <span className="text-[10px] font-bold text-brand-forest whitespace-nowrap">{pro.experienceYears} ans d'exp.</span>
        </div>
      </section>

      {/* Prix & Tarifs */}
      <section className="px-4 mb-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-pale-mint/20">
          <h3 className="text-[10px] font-bold text-brand-forest uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5" /> Tarifs
          </h3>
          <div className="flex gap-3">
            <div className="flex-1 bg-pale-mint/40 rounded-xl p-3 text-center">
              <p className="text-[9px] text-on-surface-variant uppercase tracking-wider font-bold">Taux horaire</p>
              <p className="text-lg font-extrabold text-brand-forest">{pro.hourlyRateXOF.toLocaleString("fr-FR")} <span className="text-[10px] font-medium">F/h</span></p>
            </div>
            <div className="flex-1 bg-pale-mint/40 rounded-xl p-3 text-center">
              <p className="text-[9px] text-on-surface-variant uppercase tracking-wider font-bold">Déplacement</p>
              <p className="text-lg font-extrabold text-brand-forest">5 000 <span className="text-[10px] font-medium">F</span></p>
            </div>
            <div className="flex-1 bg-brand-forest rounded-xl p-3 text-center">
              <p className="text-[9px] text-white/60 uppercase tracking-wider font-bold">Forfait 2h</p>
              <p className="text-lg font-extrabold text-brand-line text-brand-lime">{(pro.hourlyRateXOF * 2 + 5000).toLocaleString("fr-FR")} <span className="text-[10px] font-medium">F</span></p>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio */}
      {portfolio && portfolio.length > 0 && (
        <section className="px-4 mb-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-pale-mint/20">
            <h3 className="text-[10px] font-bold text-brand-forest uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" /> Portfolio ({portfolio.length})
            </h3>
            <div className="grid grid-cols-4 gap-1.5">
              {portfolio.slice(0, 8).map((item, i) => (
                <div key={item.id} onClick={() => { setGalleryIdx(i); setGalleryOpen(true); }} className="rounded-lg overflow-hidden aspect-square cursor-pointer active:scale-95 transition-transform">
                  <img src={item.imageUrl} alt={item.caption || "Réalisation"} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Services */}
      <section className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-sans text-base font-bold text-brand-forest">Services</h3>
          <span className="text-[10px] text-on-surface-variant italic">Sélectionnez pour estimer</span>
        </div>

        <div className="space-y-2.5">
          {services.map((service) => {
            const isSelected = selectedServiceIds.includes(service.id);
            return (
              <div
                key={service.id}
                onClick={() => toggleService(service.id)}
                className={`p-3.5 rounded-2xl flex items-center justify-between cursor-pointer transition-all border ${
                  isSelected ? "bg-pale-mint border-brand-lime" : "bg-white border-pale-mint/15 shadow-sm hover:translate-y-[-1px]"
                }`}
              >
                <div className="flex-1 pr-3">
                  <h4 className="font-bold text-xs text-brand-forest mb-0.5">{service.name}</h4>
                  <p className="text-xs font-extrabold text-brand-forest/90">{service.priceEstimateXOF.toLocaleString("fr-FR")} F</p>
                  <p className="text-[10px] text-on-surface-variant italic mt-0.5">{service.description}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleService(service.id); }}
                  className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${
                    isSelected ? "bg-brand-forest text-brand-lime" : "bg-brand-lime text-brand-forest"
                  }`}
                >
                  {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bio */}
      <section className="px-4 mt-4">
        <div className="bg-pale-mint/40 p-4 rounded-2xl border border-pale-mint/10">
          <h3 className="text-[10px] font-bold text-brand-forest uppercase tracking-wider mb-1.5">À propos</h3>
          <p className="text-[11px] text-on-surface-variant leading-relaxed font-medium">{pro.bio}</p>
        </div>
      </section>

      {/* Image viewer */}
      {portfolio && (
        <ImageViewer
          images={portfolio.map(p => ({ url: p.imageUrl, title: p.caption }))}
          initialIndex={galleryIdx}
          open={galleryOpen}
          onClose={() => setGalleryOpen(false)}
        />
      )}

      {/* Bottom action bar */}
      <div className="fixed bottom-0 left-0 w-full px-4 pb-6 pt-3 bg-brand-cream/95 backdrop-blur-md z-10 border-t border-pale-mint/10">
        <button
          onClick={handleLaunchMatch}
          className="w-full h-13 bg-brand-lime hover:brightness-105 active:scale-95 transition-all rounded-2xl flex items-center justify-center gap-2 shadow-lg cursor-pointer text-brand-forest font-extrabold"
        >
          <span className="font-sans text-sm font-extrabold">Lancer Ça Match avec {pro.name.split(" ")[0]}</span>
        </button>
      </div>
    </div>
  );
}
