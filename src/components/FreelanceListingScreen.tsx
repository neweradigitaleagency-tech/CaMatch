import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Search, MapPin, Star, ChevronRight, X } from "lucide-react";
import { LOCATIONS } from "../stores/locationStore";
import PageHeader from "./ui/PageHeader";

interface FreelancerProfile {
  id: string;
  name: string;
  title: string;
  category: string;
  avatarUrl: string;
  rating: number;
  reviewCount: number;
  location: string;
  verified: boolean;
  hourlyRate: number;
  badge?: string;
}

const FREELANCE_CATEGORIES = [
  { id: "design", name: "Graphisme & Design", icon: "🎨", count: 156 },
  { id: "dev", name: "Développement Web & Mobile", icon: "💻", count: 203 },
  { id: "redaction", name: "Rédaction & Traduction", icon: "✍️", count: 89 },
  { id: "marketing", name: "Marketing Digital & Social Media", icon: "📱", count: 167 },
  { id: "photo", name: "Photographie & Vidéo", icon: "📸", count: 98 },
  { id: "consulting", name: "Consulting & Coaching", icon: "🎯", count: 74 },
  { id: "audio", name: "Musique & Audio", icon: "🎵", count: 45 },
  { id: "support", name: "Support & Assistant Virtuel", icon: "🤝", count: 112 },
];

const FREELANCERS: Record<string, FreelancerProfile[]> = {
  "design": [
    { id: "f1", name: "Koné Aminata", title: "Graphiste senior", category: "design", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=face", rating: 4.9, reviewCount: 87, location: "Cocody", verified: true, hourlyRate: 25000, badge: "Top 5%" },
    { id: "f2", name: "Bamba Yacouba", title: "UI/UX Designer", category: "design", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face", rating: 4.7, reviewCount: 54, location: "Plateau", verified: true, hourlyRate: 30000 },
    { id: "f3", name: "Coulibaly Mariam", title: "Motion designer", category: "design", avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=64&h=64&fit=crop&crop=face", rating: 4.5, reviewCount: 32, location: "Marcory", verified: false, hourlyRate: 20000 },
    { id: "f4", name: "Touré Karim", title: "Illustrateur", category: "design", avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face", rating: 4.8, reviewCount: 61, location: "Yopougon", verified: true, hourlyRate: 18000 },
  ],
  "dev": [
    { id: "f5", name: "N'Guessan Franck", title: "Développeur Fullstack", category: "dev", avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=face", rating: 4.9, reviewCount: 112, location: "Cocody", verified: true, hourlyRate: 35000, badge: "Expert" },
    { id: "f6", name: "Diaby Aïcha", title: "Développeuse Mobile React Native", category: "dev", avatarUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=64&h=64&fit=crop&crop=face", rating: 4.8, reviewCount: 73, location: "Plateau", verified: true, hourlyRate: 30000 },
    { id: "f7", name: "Kouamé Olivier", title: "Développeur WordPress", category: "dev", avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=64&h=64&fit=crop&crop=face", rating: 4.6, reviewCount: 98, location: "Abobo", verified: false, hourlyRate: 20000 },
  ],
  "redaction": [
    { id: "f8", name: "Yao Esther", title: "Rédactrice web SEO", category: "redaction", avatarUrl: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=64&h=64&fit=crop&crop=face", rating: 4.7, reviewCount: 65, location: "Cocody", verified: true, hourlyRate: 15000, badge: "Top 10%" },
    { id: "f9", name: "Koffi Arnaud", title: "Traducteur EN/FR", category: "redaction", avatarUrl: "https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=64&h=64&fit=crop&crop=face", rating: 4.5, reviewCount: 41, location: "Treichville", verified: true, hourlyRate: 12000 },
  ],
  "marketing": [
    { id: "f10", name: "Soro Nafissatou", title: "Community Manager", category: "marketing", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=face", rating: 4.8, reviewCount: 93, location: "Cocody", verified: true, hourlyRate: 20000, badge: "Top 5%" },
    { id: "f11", name: "Konaté Ismaël", title: "Spécialiste SEA/ADS", category: "marketing", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face", rating: 4.6, reviewCount: 47, location: "Plateau", verified: true, hourlyRate: 25000 },
    { id: "f12", name: "Diarrassouba Fatoumata", title: "Stratège contenu digital", category: "marketing", avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=64&h=64&fit=crop&crop=face", rating: 4.9, reviewCount: 78, location: "Marcory", verified: false, hourlyRate: 22000 },
  ],
  "photo": [
    { id: "f13", name: "Kouakou Jean-Baptiste", title: "Photographe portrait & studio", category: "photo", avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=64&h=64&fit=crop&crop=face", rating: 4.9, reviewCount: 134, location: "Cocody", verified: true, hourlyRate: 35000 },
    { id: "f14", name: "Méité Salif", title: "Vidéaste & Monteur", category: "photo", avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face", rating: 4.7, reviewCount: 89, location: "Bingerville", verified: true, hourlyRate: 40000 },
  ],
  "consulting": [
    { id: "f15", name: "Brou Daniel", title: "Coach en leadership", category: "consulting", avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=face", rating: 4.8, reviewCount: 56, location: "Cocody", verified: true, hourlyRate: 50000, badge: "Expert" },
    { id: "f16", name: "Gnahoua Béatrice", title: "Consultante RH", category: "consulting", avatarUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=64&h=64&fit=crop&crop=face", rating: 4.6, reviewCount: 34, location: "Plateau", verified: false, hourlyRate: 40000 },
  ],
  "audio": [
    { id: "f17", name: "Dembélé Mamadou", title: "Producteur musical", category: "audio", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face", rating: 4.7, reviewCount: 43, location: "Yopougon", verified: true, hourlyRate: 30000 },
    { id: "f18", name: "Konan Serge", title: "Ingénieur son", category: "audio", avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face", rating: 4.5, reviewCount: 28, location: "Cocody", verified: false, hourlyRate: 25000 },
  ],
  "support": [
    { id: "f19", name: "Adjoua Roseline", title: "Assistante virtuelle", category: "support", avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=64&h=64&fit=crop&crop=face", rating: 4.9, reviewCount: 167, location: "Cocody", verified: true, hourlyRate: 10000, badge: "Top 5%" },
    { id: "f20", name: "Tano Marc", title: "Support client multilingue", category: "support", avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=64&h=64&fit=crop&crop=face", rating: 4.4, reviewCount: 52, location: "Abobo", verified: true, hourlyRate: 8000 },
  ],
};

export default function FreelanceListingScreen() {
  const nav = useNavigate();
  const [query, setQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredCategories = useMemo(() => {
    const cats = selectedCategory
      ? FREELANCE_CATEGORIES.filter((c) => c.id === selectedCategory)
      : FREELANCE_CATEGORIES;
    return cats
      .map((cat) => {
        const pros = (FREELANCERS[cat.id] || []).filter((pro) => {
          const matchesQuery = !query || pro.name.toLowerCase().includes(query.toLowerCase()) || pro.title.toLowerCase().includes(query.toLowerCase());
          const matchesLocation = !locationFilter || pro.location === locationFilter;
          return matchesQuery && matchesLocation;
        });
        return { ...cat, pros };
      })
      .filter((cat) => cat.pros.length > 0);
  }, [query, locationFilter, selectedCategory]);

  return (
    <div className="flex flex-col w-full min-h-dynamic bg-[#F5F5F5]">
      {/* Header */}
      <PageHeader title="Freelance" fallbackRoute="/" subtitle="Services digitaux" />

      {/* Search + Categories */}
      <div className="px-4 pt-3 pb-2">
        <div className="relative w-full mb-2">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-cm-text-muted" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-11 pl-9 pr-4 text-[13px] bg-cm-elevated border border-cm-border rounded-xl outline-none text-cm-text placeholder:text-cm-text-muted focus:border-cm-forest"
            placeholder="Graphiste, développeur, community manager..."
          />
        </div>

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {FREELANCE_CATEGORIES.map((cat) => (
            <button key={cat.id} onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-cm-text text-white"
                  : "bg-cm-elevated border border-cm-border text-cm-text hover:border-cm-text-muted"
              }`}>
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Location filter */}
        <button onClick={() => setShowLocationPicker(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cm-elevated border border-cm-border text-[11px] font-medium text-cm-text-soft cursor-pointer active:scale-95 transition-transform mt-2">
          <MapPin className="w-3.5 h-3.5" />
          {locationFilter || "Toutes les zones"}
        </button>
      </div>

      {/* Top Rated Horizontal Carousel */}
      {!query && !selectedCategory && (
        <div className="pt-3 pb-1">
          <div className="flex items-center justify-between px-4 mb-3">
            <h2 className="text-[13px] font-bold text-cm-text">Freelances en vedette</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-1">
            {FREELANCE_CATEGORIES.flatMap((cat) => FREELANCERS[cat.id] || [])
              .sort((a, b) => b.rating - a.rating)
              .slice(0, 6)
              .map((pro, i) => (
                <motion.button
                  key={pro.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05, duration: 0.25 }}
                  onClick={() => nav(`/explorer/pro/${pro.id}`)}
                  className="shrink-0 w-40 bg-cm-elevated border border-cm-border rounded-2xl overflow-hidden cursor-pointer active:scale-[0.97] transition-transform"
                >
                  <div className="relative h-24 overflow-hidden">
                    <img src={pro.avatarUrl} alt={pro.name} className="w-full h-full object-cover object-top" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-cm-amber text-cm-amber drop-shadow-sm" />
                        <span className="text-[11px] font-bold text-white drop-shadow-sm">{pro.rating}</span>
                      </div>
                    </div>
                    {pro.badge && (
                      <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-cm-amber text-[8px] font-bold text-cm-text shadow-sm">
                        {pro.badge}
                      </span>
                    )}
                    {pro.verified && !pro.badge && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-cm-green rounded-full flex items-center justify-center shadow-sm">
                        <svg viewBox="0 0 12 12" className="w-3 h-3 text-white" fill="none"><path d="M3 6L5 8L9 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-[12px] font-bold text-cm-text truncate">{pro.name}</h3>
                    <p className="text-[10px] text-cm-text-soft truncate mt-0.5">{pro.title}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-cm-text-soft flex items-center gap-0.5">
                        <MapPin className="w-2.5 h-2.5" />{pro.location}
                      </span>
                      <span className="text-[10px] font-bold text-cm-forest">{pro.hourlyRate.toLocaleString()} F</span>
                    </div>
                  </div>
                </motion.button>
              ))}
          </div>
        </div>
      )}

      {/* Results */}
      <section className="flex-1 px-4 pb-6 pt-3">
        {filteredCategories.length === 0 && query ? (
          <div className="flex flex-col items-center justify-center pt-12">
            <div className="w-14 h-14 rounded-xl bg-cm-elevated border border-cm-border flex items-center justify-center mb-3">
              <Search className="w-6 h-6 text-cm-text-muted" />
            </div>
            <p className="text-[13px] font-bold text-cm-text mb-1">Aucun freelance trouvé</p>
            <button onClick={() => { setQuery(""); setSelectedCategory(null); }}
              className="mt-3 h-9 px-4 rounded-xl bg-cm-text text-white text-[11px] font-bold cursor-pointer active:scale-95 transition-transform">
              Réinitialiser
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredCategories.map((cat) => (
              <div key={cat.id}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[16px]">{cat.icon}</span>
                    <h2 className="text-[14px] font-bold text-cm-text">{cat.name}</h2>
                    <span className="text-[10px] text-cm-text-muted font-medium bg-cm-elevated px-1.5 py-0.5 rounded-full">{cat.pros.length}</span>
                  </div>
                </div>

                {/* Horizontal scroll of freelancer cards */}
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4">
                  {cat.pros.map((pro, i) => (
                    <motion.button
                      key={pro.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.25 }}
                      onClick={() => nav(`/explorer/pro/${pro.id}`)}
                      className="shrink-0 w-56 bg-cm-elevated border border-cm-border rounded-2xl p-3 text-left cursor-pointer active:scale-[0.97] transition-transform hover:border-cm-accent/40"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-cm-border">
                          <img src={pro.avatarUrl} alt={pro.name} className="w-full h-full object-cover" loading="lazy" />
                          {pro.verified && (
                            <div className="absolute bottom-0 right-0 w-4 h-4 bg-cm-green rounded-full flex items-center justify-center">
                              <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 text-white" fill="none"><path d="M3 6L5 8L9 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <h3 className="text-[12px] font-bold text-cm-text truncate">{pro.name}</h3>
                            {pro.badge && (
                              <span className="text-[8px] font-bold text-cm-amber bg-cm-amber/15 px-1.5 py-0.5 rounded-full shrink-0">{pro.badge}</span>
                            )}
                          </div>
                          <p className="text-[10px] text-cm-text-soft truncate">{pro.title}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-cm-border/50">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-0.5 text-[10px] font-semibold text-cm-amber">
                            <Star className="w-2.5 h-2.5 fill-cm-amber text-cm-amber" />{pro.rating}
                          </span>
                          <span className="text-[9px] text-cm-text-muted">({pro.reviewCount})</span>
                        </div>
                        <span className="text-[11px] font-bold text-cm-forest">{pro.hourlyRate.toLocaleString()} F/h</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1.5">
                        <MapPin className="w-2.5 h-2.5 text-cm-text-muted" />
                        <span className="text-[9px] text-cm-text-muted">{pro.location}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Location Picker */}
      {showLocationPicker && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setShowLocationPicker(false)}>
          <div className="fixed inset-0 bg-black/40" />
          <div className="relative w-full max-w-md bg-white rounded-t-[20px] p-5 pb-10 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-semibold text-[#2B2B2B]">Filtrer par zone</h3>
              <button onClick={() => setShowLocationPicker(false)} className="w-9 h-9 rounded-full bg-[rgba(43,43,43,0.08)] backdrop-blur-sm border border-[rgba(43,43,43,0.10)] flex items-center justify-center cursor-pointer">
                <X className="w-4 h-4 text-[#2B2B2B]" />
              </button>
            </div>
            <div className="space-y-1">
              <button onClick={() => { setLocationFilter(""); setShowLocationPicker(false); }}
                className={`w-full text-left px-4 py-3 rounded-[12px] text-[13px] font-medium transition-all cursor-pointer flex items-center gap-3 ${!locationFilter ? "bg-[#7FD356]/20 text-[#2B2B2B]" : "text-[#2B2B2B] hover:bg-gray-50"}`}>
                <MapPin className="w-4 h-4" />
                <span className="flex-1">Toutes les zones</span>
                {!locationFilter && <span className="text-[10px] text-[#7FD356] font-semibold">✓</span>}
              </button>
              {LOCATIONS.map((loc) => {
                const hood = loc.split(",")[1]?.trim() || loc;
                const isActive = locationFilter === hood;
                return (
                  <button key={loc} onClick={() => { setLocationFilter(hood); setShowLocationPicker(false); }}
                    className={`w-full text-left px-4 py-3 rounded-[12px] text-[13px] font-medium transition-all cursor-pointer flex items-center gap-3 ${isActive ? "bg-[#7FD356]/20 text-[#2B2B2B]" : "text-[#2B2B2B] hover:bg-gray-50"}`}>
                    <MapPin className={`w-4 h-4 ${isActive ? "text-[#7FD356]" : "text-gray-400"}`} />
                    <span className="flex-1">{loc}</span>
                    {isActive && <span className="text-[10px] text-[#7FD356] font-semibold">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
