import { useState } from "react";
import { Star, Heart, Loader2, Check, MapPin } from "lucide-react";
import { motion } from "motion/react";
import type { ProfessionalDetails, ProCategory } from "../../types";

interface ProCardProps {
  pro: ProfessionalDetails;
  variant?: "light" | "dark" | "compact";
  onClick?: () => void;
}

function VerifiedBadgeSVG({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <path d="M7 12.5L10.5 16L17 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BannerGradient({ category }: { category: ProCategory }) {
  const map: Record<ProCategory, string> = {
    "maison-reparations": "from-cyan-400 via-blue-500 to-indigo-600",
    "transport-livraison": "from-amber-400 via-orange-500 to-yellow-500",
    "evenements": "from-pink-400 via-purple-500 to-rose-500",
    "education-formation": "from-emerald-400 via-green-500 to-teal-600",
    "social-media-informatique": "from-slate-700 via-slate-800 to-zinc-900",
    "assistance-services": "from-purple-500 via-pink-500 to-red-500",
  };
  return (
    <div className={`absolute inset-0 bg-gradient-to-tr ${map[category] || map["assistance-services"]}`} />
  );
}

function StatusPill({ pro }: { pro: ProfessionalDetails }) {
  const isAgree = pro.category === "maison-reparations" || pro.category === "transport-livraison";
  return (
    <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[8px] font-black tracking-wide uppercase bg-white/10 backdrop-blur-md border border-white/10 text-white">
      <span className="w-1 h-1 rounded-full bg-emerald-400" />
      {isAgree ? "Agréé" : "Vérifié"}
    </div>
  );
}

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "xs" }) {
  const full = Math.floor(rating);
  const sizeClass = size === "sm" ? "w-3 h-3" : "w-2.5 h-2.5";
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating.toFixed(1)} sur 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`${sizeClass} ${i < full ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`} />
      ))}
    </span>
  );
}

export default function ProCard({ pro, variant = "light", onClick }: ProCardProps) {
  const [liked, setLiked] = useState(false);
  const [btnState, setBtnState] = useState<"idle" | "loading" | "done">("idle");
  const rating = pro.rating / 10;
  const isDark = variant === "dark";

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (btnState !== "idle") return;
    setBtnState("loading");
    setTimeout(() => {
      setBtnState("done");
      onClick?.();
    }, 600);
  };

  if (variant === "compact") {
    return (
      <motion.div
        onClick={onClick}
        layout
        whileHover={{ y: -3, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="bg-white border border-gray-200 rounded-[20px] overflow-hidden cursor-pointer flex flex-col hover:border-gray-300 shadow-sm group"
        aria-label={`Profil de ${pro.name}`}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick?.(); }}
      >
        <div className="relative h-16 w-full overflow-hidden shrink-0">
          <BannerGradient category={pro.category} />
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/40 via-transparent to-transparent" />
          <StatusPill pro={pro} />
        </div>
        <div className="absolute top-8 left-3 z-10">
          <img
            src={pro.avatarUrl}
            alt={pro.name}
            referrerPolicy="no-referrer"
            className="w-10 h-10 rounded-full object-cover border-[3px] border-white shadow-md bg-gray-200"
          />
        </div>
        <div className="pt-6 px-3 pb-3 flex flex-col flex-1">
          <div className="flex items-start justify-between gap-1 mb-2">
            <div className="min-w-0">
              <h4 className="text-[12px] font-black text-gray-900 line-clamp-1 leading-tight">{pro.name}</h4>
              <p className="text-[9px] font-bold mt-0.5 text-gray-500 line-clamp-1">{pro.title || pro.subCategory}</p>
            </div>
            {pro.isVerified && <VerifiedBadgeSVG className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />}
          </div>
          <div className="flex items-center gap-2 py-1.5 px-2 rounded-xl bg-gray-50 mb-2">
            <span className="flex items-center gap-1 text-[9px] font-black text-gray-700"><Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />{rating.toFixed(1)}</span>
            <span className="text-[9px] font-black text-gray-400">·</span>
            <span className="text-[9px] font-black text-gray-700">{pro.hourlyRateXOF.toLocaleString("fr-FR")} F/h</span>
            <span className="text-[9px] font-black text-gray-400">·</span>
            <span className="text-[9px] font-black text-gray-700">{pro.reviewCount}+</span>
          </div>
          <button
            onClick={handleButtonClick}
            disabled={btnState !== "idle"}
            className="w-full py-1.5 rounded-xl text-[9px] font-black tracking-wide bg-gray-900 text-white hover:bg-gray-800 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all mt-auto"
            aria-label={`Contacter ${pro.name}`}
          >
            {btnState === "loading" ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : btnState === "done" ? <Check className="w-3 h-3 mx-auto" /> : "Voir"}
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      onClick={onClick}
      layout
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`relative rounded-[24px] overflow-hidden cursor-pointer flex flex-col shadow-sm hover:shadow-md transition-all duration-300 ${
        isDark ? "bg-[#0B0C0E] text-white border border-white/5" : "bg-white text-gray-900 border border-gray-100"
      }`}
      aria-label={`Profil de ${pro.name}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick?.(); }}
    >
      {/* Banner */}
      <div className="relative h-20 w-full overflow-hidden shrink-0">
        <BannerGradient category={pro.category} />
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/40 via-transparent to-transparent" />
        <StatusPill pro={pro} />
      </div>

      {/* Avatar overlapping banner */}
      <div className="absolute top-11 left-3.5 z-10">
        <img
          src={pro.avatarUrl}
          alt={pro.name}
          referrerPolicy="no-referrer"
          className={`w-12 h-12 rounded-full object-cover border-[3px] ${isDark ? "border-[#0B0C0E]" : "border-white"} shadow-md bg-gray-200`}
        />
      </div>

      {/* Card content */}
      <div className="pt-6 px-3.5 pb-3.5 flex flex-col flex-1">
        {/* Header row: Name + Heart */}
        <div className="flex items-start justify-between gap-1 mb-2.5">
          <div className="min-w-0 flex-1">
            <h4 className={`text-[13px] font-black tracking-tight leading-none line-clamp-1 ${isDark ? "text-white" : "text-gray-900"}`}>
              {pro.name}
            </h4>
            <p className={`text-[10px] font-bold mt-1 line-clamp-1 ${isDark ? "text-zinc-400" : "text-gray-500"}`}>
              {pro.title || pro.subCategory}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0 mt-0.5">
            {pro.isVerified && <VerifiedBadgeSVG className="w-4 h-4 text-blue-500" />}
            <button
              onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-90 shrink-0 ${
                isDark ? "bg-zinc-800/80 hover:bg-zinc-700/80" : "bg-gray-100 hover:bg-gray-200"
              }`}
              aria-label={liked ? "Retirer des favoris" : "Ajouter aux favoris"}
            >
              <Heart className={`w-3 h-3 transition-colors ${liked ? "fill-red-500 text-red-500" : isDark ? "text-zinc-300" : "text-gray-600"}`} />
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className={`grid grid-cols-3 gap-0.5 py-2 px-1 rounded-2xl mb-3 h-12 items-center justify-items-center text-center ${
          isDark ? "bg-zinc-900/60" : "bg-amber-50/60"
        }`}>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-0.5">
              <StarRating rating={rating} size="xs" />
            </div>
            <span className={`text-[8px] font-black uppercase tracking-wider mt-0.5 ${isDark ? "text-zinc-500" : "text-gray-400"}`}>Note</span>
          </div>
          <div className={`flex flex-col items-center border-x w-full ${isDark ? "border-zinc-800" : "border-gray-200/50"}`}>
            <span className={`text-[10px] font-black ${isDark ? "text-zinc-200" : "text-gray-800"}`}>
              {pro.hourlyRateXOF.toLocaleString("fr-FR")} F
            </span>
            <span className={`text-[8px] font-black uppercase tracking-wider mt-0.5 ${isDark ? "text-zinc-500" : "text-gray-400"}`}>Tarif/h</span>
          </div>
          <div className="flex flex-col items-center">
            <span className={`text-[10px] font-black ${isDark ? "text-zinc-200" : "text-gray-800"}`}>
              {pro.reviewCount}+
            </span>
            <span className={`text-[8px] font-black uppercase tracking-wider mt-0.5 ${isDark ? "text-zinc-500" : "text-gray-400"}`}>Avis</span>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleButtonClick}
          disabled={btnState !== "idle"}
          className={`w-full py-2.5 rounded-xl text-[10px] font-black tracking-wide transition-all active:scale-95 text-center shrink-0 mt-auto ${
            isDark ? "bg-white text-gray-900 hover:bg-zinc-100" : "bg-gray-900 text-white hover:bg-gray-800"
          } disabled:opacity-60 disabled:cursor-not-allowed`}
          aria-label={`Contacter ${pro.name}`}
        >
          {btnState === "loading" ? (
            <Loader2 className="w-4 h-4 animate-spin mx-auto" />
          ) : btnState === "done" ? (
            <Check className="w-4 h-4 mx-auto" />
          ) : (
            "Prendre RDV"
          )}
        </button>
      </div>
    </motion.div>
  );
}

export { VerifiedBadgeSVG, BannerGradient, StatusPill, StarRating };
