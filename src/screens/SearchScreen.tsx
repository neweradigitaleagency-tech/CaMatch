import { useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import TopBarIconButton from "../components/ui/TopBarIconButton";
import PillToggle from "../components/ui/PillToggle";
import CTAButton from "../components/ui/CTAButton";
import ServiceMapCard from "../components/map/ServiceMapCard";
import { abidjanProviders, formatPrice } from "../data/mock";
import { screenEnter, listItem } from "../animations/variants";

export default function SearchScreen() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"urgent" | "planifié">("urgent");
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? abidjanProviders.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase())
      )
    : abidjanProviders;

  return (
    <motion.div
      variants={screenEnter}
      initial="hidden"
      animate="visible"
      className="min-h-dvh px-4 pt-2 pb-6 flex flex-col gap-4 bg-cm-bg"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <TopBarIconButton icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cm-text"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
        } onClick={() => navigate(-1)} />

        <div className="h-[40px] flex-1 mx-3 rounded-full bg-cm-elevated flex items-center px-[14px]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 shrink-0 text-cm-text-muted"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Chercher un prestataire..."
            className="bg-transparent w-full h-full text-cm-text text-[13px] outline-none placeholder:text-cm-text-muted"
          />
        </div>

        <TopBarIconButton icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cm-text"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>
        } />

        <div className="ml-1">
          <TopBarIconButton icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cm-text"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
          } />
        </div>
      </div>

      {/* Pill toggle */}
      <div className="flex items-center justify-start">
        <PillToggle
          pills={[
            { value: "urgent", label: "Urgent" },
            { value: "planifié", label: "Planifié" },
          ]}
          active={mode}
          onChange={(v) => setMode(v as "urgent" | "planifié")}
        />
      </div>

      {/* Service map card */}
      <ServiceMapCard
        userPosition={[5.36, -4.01]}
        providerPosition={[5.362, -4.018]}
        userLabel="Cocody · Moi"
        providerLabel="2 km · Kouamé J."
      />

      {/* Provider list */}
      <div className="flex-1">
        <p className="text-[13px] text-cm-text-soft mb-3 ml-1">
          {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
        </p>

        <div className="flex flex-col gap-3">
          {filtered.length === 0 && (
            <p className="text-[15px] text-cm-text-muted text-center mt-8">Aucun prestataire trouvé</p>
          )}

          {filtered.map((pro, i) => (
            <motion.div
              key={pro.id}
              custom={i}
              variants={listItem}
              initial="hidden"
              animate="visible"
              whileHover={{ y: -2, scale: 1.005 }}
              whileTap={{ scale: 0.995 }}
              onClick={() => setSelected(prev => prev === pro.id ? null : pro.id)}
              className={`bg-cm-elevated rounded-[20px] p-3 flex items-center gap-3 cursor-pointer relative overflow-hidden shadow-cm-card
                ${selected === pro.id ? "ring-2 ring-cm-accent" : ""}`}
            >
              {/* Lime accent bar */}
              <div className="absolute left-0 top-0 w-[4px] h-full rounded-l-[20px] bg-cm-accent" />

              {/* Avatar */}
              <div className="w-[52px] h-[52px] rounded-[14px] overflow-hidden shrink-0">
                <img src={pro.image} alt={pro.name} className="w-full h-full object-cover" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-[15px] font-bold text-cm-text truncate">{pro.name}</p>
                  <span className="text-[14px] font-bold text-cm-text shrink-0 ml-2">{formatPrice(pro.price)}</span>
                </div>
                <p className="text-[12px] text-cm-text-soft mb-1">{pro.category}</p>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    <Star className="w-3 h-3 text-cm-amber" fill="currentColor" />
                    <span className="text-[12px] font-semibold text-cm-text">{pro.rating}</span>
                  </div>
                  <span className="text-[10px] text-cm-text-soft">({pro.reviewCount} avis)</span>
                  <span className="text-[10px] text-cm-text-soft">· {pro.distance}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      {selected && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <CTAButton onClick={() => navigate(`/explorer/design-provider/${selected}`)}>
            Voir le profil
          </CTAButton>
        </motion.div>
      )}
    </motion.div>
  );
}
