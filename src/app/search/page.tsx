"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { SlidersHorizontal, Star, Phone, MessageCircle, MapPin, Search, X, ChevronLeft } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { VerificationBadge, BadgeLevel } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CATEGORIES } from "@/lib/data";

type SortKey = "proximite" | "prix" | "note" | "disponible";

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background animate-pulse p-4">
        <div className="h-10 bg-gray-200 rounded-xl mb-4" />
        <div className="h-8 bg-gray-200 rounded-full w-3/4 mb-6" />
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-200 rounded-2xl" />)}
        </div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams?.get("q") ?? "";
  const initialCat = searchParams?.get("cat") ?? "";

  const [query, setQuery] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState<SortKey>("proximite");
  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState(initialCat);
  const categories = CATEGORIES;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pros, setPros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      // eslint-disable-next-line prefer-const
      let cancelled = false;
      const fetchPros = async () => {
        setLoading(true);
      try {
        const params = new URLSearchParams();
        if (query) params.set("search", query);
        if (categoryFilter) {
          const cat = categories.find((c) => c.slug === categoryFilter);
          if (cat) params.set("category", cat.name);
        }
        params.set("sort", activeFilter);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, categoryFilter, activeFilter]);

  const currentCategory = categories.find((c) => c.slug === categoryFilter);

  const filterBar = (
    <div className="flex items-center gap-2 py-2.5 overflow-x-auto scrollbar-hide border-b border-gray-100 mb-4">
      {([
        { key: "proximite" as SortKey, label: "📍 Proximité" },
        { key: "prix" as SortKey, label: "💰 Prix" },
        { key: "note" as SortKey, label: "⭐ Note" },
        { key: "disponible" as SortKey, label: "🟢 Disponible" },
      ]).map((f) => (
        <button
          key={f.key}
          onClick={() => setActiveFilter(f.key)}
          className={cn(
            "flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
            activeFilter === f.key ? "bg-primary text-white" : "bg-gray-100 text-text-secondary hover:bg-gray-200"
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  );

  return (
    <main className="min-h-screen pb-8 lg:pb-12">
      <div className="flex items-center gap-3 py-4">
        <Link href="/" className="btn-ghost p-2 -ml-2 lg:hidden">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg lg:text-2xl font-bold text-text-primary">
          {currentCategory ? currentCategory.name : query || "Résultats"}
        </h1>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => setShowFilters(!showFilters)} className={cn("btn-ghost p-2 hidden lg:flex", showFilters && "bg-primary-50 text-primary")}>
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
        <input
          type="text"
          placeholder="Rechercher un service..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input-field pl-10 pr-10"
        />
        {query && (
          <button onClick={() => setQuery("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-tertiary">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="lg:flex lg:gap-6">
        <div className="lg:w-64 lg:flex-shrink-0">
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="overflow-hidden border-b border-gray-100 lg:border lg:rounded-2xl lg:p-4 lg:mb-4"
            >
              <div className="pb-4 space-y-3 lg:pb-0">
                <div>
                  <p className="text-xs font-bold text-text-tertiary uppercase tracking-wider mb-2">Catégorie</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setCategoryFilter("")}
                      className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-all", !categoryFilter ? "bg-primary text-white" : "bg-gray-100 text-text-secondary")}
                    >
                      Tous
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.slug}
                        onClick={() => setCategoryFilter(cat.slug)}
                        className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-all", categoryFilter === cat.slug ? "bg-primary text-white" : "bg-gray-100 text-text-secondary")}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          <div className="hidden lg:block">
            <p className="text-xs font-bold text-text-tertiary uppercase tracking-wider mb-2">Catégorie</p>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setCategoryFilter("")}
                className={cn("text-left px-3 py-2 rounded-xl text-sm font-medium transition-all", !categoryFilter ? "bg-primary-50 text-primary" : "hover:bg-gray-50 text-text-secondary")}
              >
                Tous
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setCategoryFilter(cat.slug)}
                  className={cn("text-left px-3 py-2 rounded-xl text-sm font-medium transition-all", categoryFilter === cat.slug ? "bg-primary-50 text-primary" : "hover:bg-gray-50 text-text-secondary")}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {filterBar}

          <div className="pt-3 pb-24 lg:pb-0">
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
            <h2 className="text-lg font-bold text-text-primary mb-1">Aucun résultat</h2>
            <p className="text-sm text-text-secondary max-w-xs">Aucun professionnel trouvé. Essayez d&apos;élargir votre recherche.</p>
            <button onClick={() => { setQuery(""); setCategoryFilter(""); }} className="mt-4 text-sm text-primary font-medium">
              Réinitialiser les filtres
            </button>
          </motion.div>
        ) : (
          <>
            <p className="text-xs text-text-tertiary mb-3">{pros.length} professionnel{pros.length > 1 ? "s" : ""} trouvé{pros.length > 1 ? "s" : ""}</p>
            <div className="space-y-3">
              {pros.map((pro, index) => (
                <motion.div
                  key={pro.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, ease: [0.32, 0.72, 0, 1] }}
                >
                  <Link
                    href={`/pro/${pro.id}`}
                    className="block bg-white rounded-2xl border border-gray-100 p-4 shadow-soft active:scale-[0.98] transition-all duration-200 hover:shadow-card"
                  >
                    <div className="flex gap-3">
                      <Avatar size="md" src={pro.avatarUrl} alt={pro.name} verified={pro.isVerified} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-bold text-text-primary text-sm">{pro.name}</h3>
                          <BadgeLevel level={pro.badge} />
                          {pro.isVerified && <VerificationBadge />}
                        </div>
                        <p className="text-xs text-text-secondary mt-0.5">{pro.profession}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-xs flex-wrap">
                          <span className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span className="font-semibold">{pro.rating}</span>
                            <span className="text-text-tertiary">({pro.missionCount})</span>
                          </span>
                          <span className="flex items-center gap-1 text-text-tertiary">
                            <MapPin className="w-3 h-3" />
                            {Array.isArray(pro.zone) ? pro.zone[0] : pro.zone?.split(",")[0]}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                          <span className="text-sm font-bold text-primary">
                            À partir de {pro.pricing?.[0]?.price?.toLocaleString() || "—"} FCFA
                          </span>
                          <div className="flex gap-2">
                            <a
                              href={`https://wa.me/${pro.phone}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs bg-primary-50 text-primary-700 font-medium px-3 py-1.5 rounded-lg flex items-center gap-1 active:scale-95 transition-transform hover:bg-primary-100"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              Contacter
                            </a>
                            <a
                              href={`tel:+${pro.phone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs bg-gray-100 text-text-secondary font-medium px-3 py-1.5 rounded-lg flex items-center gap-1 active:scale-95 transition-transform hover:bg-gray-200"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              Appeler
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </>
        )}
          </div>
        </div>
      </div>
    </main>
  );
}
