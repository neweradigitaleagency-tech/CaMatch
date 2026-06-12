"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Star, MapPin, Clock, Search, X, ChevronLeft, MessageCircle, Loader2 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { BadgeLevel, VerificationBadge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type SortKey = "proximite" | "note" | "disponible" | "prix-asc" | "prix-desc";

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background animate-pulse p-4">
        <div className="h-10 bg-gray-200 rounded-xl mb-4" />
        <div className="h-8 bg-gray-200 rounded-full w-3/4 mb-6" />
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-200 rounded-2xl" />)}</div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams?.get("q") ?? "";
  const initialCategory = searchParams?.get("category") ?? "";

  const [query, setQuery] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState<SortKey>("proximite");
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [pros, setPros] = useState<ProResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [devisOpen, setDevisOpen] = useState(false);
  const [devisText, setDevisText] = useState("");
  const [devisCategory, setDevisCategory] = useState("");
  const [devisSending, setDevisSending] = useState(false);
  const [devisDone, setDevisDone] = useState(false);

  interface ProResult {
    id: string;
    name: string | null;
    phone: string;
    avatarUrl: string | null;
    isVerified: boolean;
    badge: string;
    profession: string | null;
    rating: number;
    reviewCount: number;
    zone: string[];
    missionCount: number;
    responseTime: number | null;
    pricing: { label: string; price: number }[];
    trustScore: number;
    bio: string | null;
  }

  const sortLabels: { key: SortKey; label: string }[] = [
    { key: "proximite", label: "📍 Proximité" },
    { key: "note", label: "⭐ Meilleure note" },
    { key: "disponible", label: "🟢 Disponible" },
    { key: "prix-asc", label: "💰 Prix ↑" },
    { key: "prix-desc", label: "💰 Prix ↓" },
  ];

  useEffect(() => {
    let cancelled = false;
    const fetchPros = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (query) params.set("search", query);
        if (categoryFilter) {
          const catName = categoryFilter.replace(/-/g, " ");
          params.set("category", catName);
        }
        const sortMap: Record<string, string> = {
          note: "note",
          "prix-asc": "prix",
          "prix-desc": "prix-desc",
          disponible: "disponible",
        };
        if (sortMap[activeFilter]) params.set("sort", sortMap[activeFilter]);
        const res = await fetch(`/api/pros?${params.toString()}`);
        const data = await res.json();
        if (!cancelled) setPros(data.pros ?? []);
      } catch (err) {
        console.error("Failed to fetch pros:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchPros();
    return () => { cancelled = true; };
  }, [query, categoryFilter, activeFilter]);

  const handleDevisSubmit = async () => {
    if (!devisText.trim() || !devisCategory) return;
    setDevisSending(true);
    await new Promise((r) => setTimeout(r, 800));
    setDevisDone(true);
    setTimeout(() => {
      setDevisOpen(false);
      setDevisDone(false);
      setDevisText("");
      setDevisCategory("");
    }, 2000);
    setDevisSending(false);
  };

  const filterBar = (
    <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
      {sortLabels.map((f) => (
        <button
          key={f.key}
          onClick={() => setActiveFilter(f.key)}
          className={cn(
            "flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
            activeFilter === f.key ? "bg-[#FF6B35] text-white" : "bg-gray-100 text-text-secondary hover:bg-gray-200"
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  );

  const currentCategoryLabel = categoryFilter ? categoryFilter.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : null;

  return (
    <main className="min-h-screen pb-24 lg:pb-12">
      {/* Navy Header */}
      <div className="bg-[#1A1A2E] -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pt-4 pb-5 rounded-b-[28px] mb-4">
        <div className="flex items-center gap-3 mb-3">
          <Link href="/" className="text-white p-1 -ml-1">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un service..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-white/15 text-white placeholder:text-white/50 rounded-xl pl-9 pr-9 py-2.5 text-sm outline-none focus:bg-white/20 transition-colors"
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <p className="text-xs text-white/60">
          {loading ? "Recherche..." : `${pros.length} professionnel${pros.length > 1 ? "s" : ""} trouvé${pros.length > 1 ? "s" : ""}`}
          {currentCategoryLabel && ` · ${currentCategoryLabel}`}
          {query && ` · "${query}"`}
        </p>
      </div>

      <div className="space-y-4">
        {/* Filter Bar */}
        {filterBar}

        {/* Devis Rapide Banner */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1A1A2E] rounded-2xl p-4 flex items-center justify-between"
        >
          <div>
            <p className="text-white font-bold text-sm">Demander plusieurs devis en 1 clic</p>
            <p className="text-white/60 text-xs mt-0.5">Gagnez du temps, comparez les offres</p>
          </div>
          <button
            onClick={() => setDevisOpen(true)}
            className="bg-[#FF6B35] text-white text-sm font-semibold px-4 py-2.5 rounded-xl whitespace-nowrap hover:opacity-90 active:scale-95 transition-all"
          >
            Devis Rapide →
          </button>
        </motion.div>

        {/* Results */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : pros.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-3xl flex items-center justify-center mb-4 text-2xl">🔍</div>
            <h2 className="text-lg font-bold text-text-primary mb-1">Aucun professionnel trouvé pour cette recherche</h2>
            <p className="text-sm text-text-secondary max-w-xs mb-4">Essayez de modifier votre recherche ou d&apos;explorer d&apos;autres catégories.</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {["Électricien", "Plombier", "Ménage", "Cours"].map((s) => (
                <button
                  key={s}
                  onClick={() => { setQuery(s); setCategoryFilter(""); }}
                  className="px-3 py-1.5 bg-gray-100 rounded-full text-xs font-medium text-text-secondary hover:bg-gray-200 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {pros.map((pro, index) => {
              const minPrice = pro.pricing?.length ? Math.min(...pro.pricing.map((p) => p.price)) : null;
              return (
                <motion.div
                  key={pro.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04, ease: [0.32, 0.72, 0, 1] }}
                >
                  <Link
                    href={`/pro/${pro.id}`}
                    className="block bg-white rounded-2xl border border-gray-100 p-4 shadow-soft active:scale-[0.98] transition-all duration-200 hover:shadow-card"
                  >
                    {/* Row 1: Avatar + Name + Verified + TrustScore */}
                    <div className="flex items-start gap-3 mb-2">
                      <div className="relative">
                        <Avatar size="md" src={pro.avatarUrl} alt={pro.name || ""} verified={pro.isVerified} />
                        <div className={cn(
                          "absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white",
                          pro.responseTime && pro.responseTime < 15 ? "bg-green-500" : "bg-gray-300"
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-bold text-text-primary text-sm">{pro.name}</h3>
                          {pro.isVerified && <VerificationBadge />}
                        </div>
                        <p className="text-xs text-text-secondary">{pro.profession}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-semibold">{pro.rating?.toFixed(1) || "—"}</span>
                          <span className="text-2xs text-text-tertiary">({pro.reviewCount || 0} avis)</span>
                          <BadgeLevel level={pro.badge} />
                        </div>
                      </div>
                    </div>

                    {/* Row 3: Info pills */}
                    <div className="flex items-center gap-3 text-2xs text-text-tertiary mb-3">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {Array.isArray(pro.zone) ? pro.zone[0] : "Abidjan"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {pro.responseTime ? `~${pro.responseTime} min` : "—"}
                      </span>
                      <span>🎯 {pro.missionCount || 0} missions</span>
                    </div>

                    {/* Row 4: Price + CTA */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                      <span className="text-sm font-bold text-primary">
                        {minPrice ? `À partir de ${minPrice.toLocaleString()} FCFA` : "Prix sur demande"}
                      </span>
                      <div className="flex gap-2">
                        <a
                          href={`https://wa.me/${pro.phone}?text=${encodeURIComponent("Bonjour, j'ai trouvé votre profil sur Ça Match. Est-ce que vous êtes disponible ?")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs bg-green-50 text-green-700 font-medium px-3 py-1.5 rounded-lg flex items-center gap-1 active:scale-95 transition-transform hover:bg-green-100"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          WhatsApp
                        </a>
                        <span className="text-xs bg-[#FF6B35] text-white font-medium px-3 py-1.5 rounded-lg flex items-center gap-1 active:scale-95 transition-transform hover:opacity-90">
                          Voir profil →
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Devis Rapide Modal */}
      <AnimatePresence>
        {devisOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center"
            onClick={() => !devisSending && setDevisOpen(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-t-[28px] sm:rounded-2xl w-full sm:max-w-md p-6 sm:m-4"
              onClick={(e) => e.stopPropagation()}
            >
              {devisDone ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-text-primary mb-1">Demande envoyée !</h3>
                  <p className="text-sm text-text-secondary">Votre demande a été transmise aux professionnels disponibles.</p>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-text-primary mb-1">Devis Rapide</h3>
                  <p className="text-sm text-text-secondary mb-5">Décrivez votre besoin en quelques mots</p>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-text-primary mb-1.5 block">Catégorie</label>
                      <select
                        value={devisCategory}
                        onChange={(e) => setDevisCategory(e.target.value)}
                        className="input-field"
                      >
                        <option value="">Sélectionnez une catégorie</option>
                        <option value="Électricien">Électricien</option>
                        <option value="Plombier">Plombier</option>
                        <option value="Menuisier">Menuisier</option>
                        <option value="Ménage">Ménage</option>
                        <option value="Réparation téléphone">Réparation téléphone</option>
                        <option value="Climatisation">Climatisation</option>
                        <option value="Coiffure">Coiffure</option>
                        <option value="Autre">Autre</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-text-primary mb-1.5 block">Description</label>
                      <textarea
                        placeholder="Ex: Je dois réparer un robinet qui fuit dans ma cuisine..."
                        value={devisText}
                        onChange={(e) => setDevisText(e.target.value)}
                        rows={4}
                        className="input-field resize-none"
                      />
                    </div>
                    <button
                      onClick={handleDevisSubmit}
                      disabled={!devisText.trim() || !devisCategory || devisSending}
                      className="w-full bg-[#FF6B35] text-white font-bold rounded-2xl py-3.5 active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {devisSending && <Loader2 className="w-5 h-5 animate-spin" />}
                      {devisSending ? "Envoi..." : "Envoyer la demande"}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}