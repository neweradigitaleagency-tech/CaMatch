"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { useNavigate, useParams } from "react-router-dom";
import { Star, MapPin, Clock, MessageCircle } from "lucide-react";
import TopBarIconButton from "../components/ui/TopBarIconButton";
import InfoChip from "../components/ui/InfoChip";
import CTAButton from "../components/ui/CTAButton";
import { abidjanProviders, formatPrice } from "../data/mock";
import { screenEnter } from "../animations/variants";

const beforeAfter = [
  "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1581578722626-5cae76a7a7dc?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=300&fit=crop",
];

export default function ProviderProfileScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const pro = useMemo(() => abidjanProviders.find((p) => p.id === id) || abidjanProviders[0], [id]);

  if (!pro) {
    return (
      <div       className="min-h-dvh flex flex-col items-center justify-center px-4 bg-cm-bg">
        <p className="text-[15px] text-cm-text-muted">Prestataire introuvable</p>
        <button onClick={() => navigate(-1)} className="mt-4 h-[44px] px-6 rounded-full bg-cm-accent text-cm-text-onAccent font-bold text-[15px] cursor-pointer">
          Retour
        </button>
      </div>
    );
  }

  return (
    <motion.div
      variants={screenEnter}
      initial="hidden"
      animate="visible"
      className="min-h-dvh relative bg-cm-bg"
    >
      {/* Hero image with gradient overlay */}
      <div className="relative w-full h-[280px]">
        <img
          src={pro.image}
          alt={pro.name}
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)" }}
        />

        {/* Back button */}
        <div className="absolute top-4 left-4 z-10">
          <TopBarIconButton icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cm-text"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
          } onClick={() => navigate(-1)} />
        </div>

        {/* Name on image */}
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <h1 className="text-[24px] font-bold text-white">{pro.name}</h1>
          <p className="text-[15px] text-white/90">{pro.category}</p>
        </div>
      </div>

      {/* Content sheet */}
      <div className="relative -mt-6 rounded-t-[24px] px-4 pt-5 pb-8 flex flex-col gap-5 bg-cm-bg">
        {/* Rating + price row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star className="w-[18px] h-[18px] text-cm-amber" fill="currentColor" />
            <span className="text-[20px] font-bold text-cm-text">{pro.rating}</span>
            <span className="text-[13px] text-cm-text-soft">({pro.reviewCount} avis)</span>
          </div>
          <div className="text-right">
            <p className="text-[22px] font-black text-cm-text">{formatPrice(pro.price)}</p>
            <p className="text-[12px] text-cm-text-soft">par prestation</p>
          </div>
        </div>

        {/* Info chips */}
        <div className="flex items-center gap-1 -ml-1">
          <InfoChip icon={MapPin} label={pro.distance} />
          <InfoChip icon={Clock} label={`${pro.yearsExp} ans d'exp`} />
          <InfoChip icon={MessageCircle} label={`${pro.reviewCount} avis`} />
        </div>

        {/* Skills / amenities */}
        <div>
          <p className="text-[13px] font-semibold text-cm-accent uppercase tracking-[0.5px] mb-2">Compétences</p>
          <div className="flex items-center gap-2">
            {pro.skills.map((s) => (
              <div key={s} className="h-[30px] px-[12px] rounded-[8px] bg-cm-accent-soft flex items-center">
                <span className="text-[12px] font-medium text-cm-text">{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Before / After */}
        <div>
          <p className="text-[13px] font-semibold text-cm-accent uppercase tracking-[0.5px] mb-2">Avant / Après</p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {beforeAfter.map((url, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08, duration: 0.3 }}
                className="w-[130px] h-[100px] rounded-[14px] overflow-hidden shrink-0"
              >
                <img src={url} alt={`Avant/Après ${i + 1}`} className="w-full h-full object-cover" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* About */}
        <div>
          <p className="text-[13px] font-semibold text-cm-accent uppercase tracking-[0.5px] mb-2">À propos</p>
          <p className="text-[14px] text-cm-text leading-relaxed">
            Professionnel qualifié avec {pro.yearsExp} ans d'expérience dans le domaine de la {pro.category.toLowerCase()}.
            Intervention rapide dans toute la ville d'Abidjan.
          </p>
        </div>

        {/* CTA */}
        <CTAButton onClick={() => navigate(`/orders/new?pro=${pro.id}`)}>
          Contacter {pro.name.split(" ")[0]}
        </CTAButton>
      </div>
    </motion.div>
  );
}
