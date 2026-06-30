import { useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { categories, categoryImages } from "../data/mock";
import CategoryTag from "../components/ui/CategoryTag";
import { screenEnter, listItem } from "../animations/variants";

export default function CategorySelectScreen() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? categories.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))
    : categories;

  const recent: string[] = ["Électricité", "Plomberie"];

  return (
    <motion.div
      variants={screenEnter}
      initial="hidden"
      animate="visible"
      className="min-h-dvh px-4 pt-2 pb-6 bg-cm-bg"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-cm-elevated flex items-center justify-center shadow-cm-md cursor-pointer">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cm-text"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
        </button>
        <h1 className="text-[18px] font-bold text-cm-text">Catégories</h1>
        <div className="w-10" />
      </div>

      {/* Search */}
      <div className="h-[44px] w-full rounded-[12px] bg-cm-elevated flex items-center px-4 mb-5">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 shrink-0 text-cm-text-muted"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un service..."
          className="bg-transparent w-full h-full text-cm-text text-[15px] outline-none placeholder:text-cm-text-muted"
        />
      </div>

      {/* Recent */}
      <div className="mb-5">
        <p className="text-[13px] font-semibold text-cm-accent uppercase tracking-[0.5px] mb-3">Récents</p>
        <div className="flex gap-2">
          {recent.map((r) => (
            <button key={r} className="h-[34px] px-[14px] rounded-full bg-cm-accent-soft text-cm-accent text-[13px] font-medium cursor-pointer">
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <p className="text-[13px] font-semibold text-cm-accent uppercase tracking-[0.5px] mb-3">Tous les services</p>
      <div className="grid grid-cols-2 gap-3">
        {filtered.map((cat, i) => (
          <motion.button
            key={cat.id}
            custom={i}
            variants={listItem}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -2, scale: 1.01 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(`/explorer/category/${cat.id}`)}
            className="relative aspect-[4/3] rounded-[16px] overflow-hidden cursor-pointer"
          >
            <img
              src={categoryImages[cat.id] || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=400&fit=crop"}
              alt={cat.label}
              className="w-full h-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.50) 0%, transparent 50%)" }}
            />
            <CategoryTag flag={cat.icon} label={cat.label} />
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
