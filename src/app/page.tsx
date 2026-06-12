"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, MapPin, ChevronRight, Star, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { BadgeLevel } from "@/components/ui/badge";
import { PwaInstallPrompt } from "@/components/shared/pwa-install-prompt";

const CATEGORIES = [
  { name: "Électricien", slug: "electricien", emoji: "⚡" },
  { name: "Plombier", slug: "plombier", emoji: "🔧" },
  { name: "Menuisier", slug: "menuisier", emoji: "🪵" },
  { name: "Ménage", slug: "menage", emoji: "🧹" },
  { name: "Réparation téléphone", slug: "reparation-telephone", emoji: "📱" },
  { name: "Prof à domicile", slug: "prof-domicile", emoji: "📚" },
  { name: "Climatisation", slug: "climatisation", emoji: "❄️" },
  { name: "Coiffure", slug: "coiffure", emoji: "✂️" },
  { name: "Photographie", slug: "photographie", emoji: "📷" },
  { name: "Informatique", slug: "informatique", emoji: "💻" },
];

interface ProSummary {
  id: string;
  name: string | null;
  profession: string | null;
  rating: number;
  reviewCount: number;
  trustScore: number;
  badge: string;
  isVerified: boolean;
  avatarUrl: string | null;
  missionCount: number;
  responseTime: number | null;
  zone: string[];
  pricing: { label: string; price: number }[];
}

function ProCard({ pro }: { pro: ProSummary }) {
  const minPrice = pro.pricing?.length ? Math.min(...pro.pricing.map((p) => p.price)) : null;
  return (
    <Link
      href={`/pro/${pro.id}`}
      className="bg-white rounded-2xl border border-gray-100 p-4 shadow-soft hover:shadow-card active:scale-[0.97] transition-all duration-200 block"
    >
      <div className="flex items-start gap-3 mb-3">
        <Avatar size="md" src={pro.avatarUrl} alt={pro.name || ""} verified={pro.isVerified} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="font-bold text-text-primary text-sm truncate">{pro.name}</h3>
            <BadgeLevel level={pro.badge} />
          </div>
          <p className="text-xs text-text-secondary">{pro.profession}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-xs font-semibold text-text-primary">{pro.rating?.toFixed(1) || "—"}</span>
            <span className="text-2xs text-text-tertiary">({pro.missionCount || 0} missions)</span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1 text-text-tertiary">
          <Clock className="w-3 h-3" />
          {pro.responseTime ? `${pro.responseTime} min` : "—"}
        </span>
        <span className="font-bold text-primary">
          {minPrice ? `${minPrice.toLocaleString()} FCFA` : "—"}
        </span>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [showClear, setShowClear] = useState(false);
  const [pros, setPros] = useState<ProSummary[]>([]);
  const [proCount, setProCount] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        const res = await fetch("/api/pros?sort=note");
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        if (!cancelled) {
          const allPros = data.pros || [];
          const topPros = allPros.sort((a: ProSummary, b: ProSummary) => (b.rating || 0) - (a.rating || 0)).slice(0, 4);
          setPros(topPros);
          setProCount(allPros.length);
          const avg = allPros.reduce((s: number, p: ProSummary) => s + (p.rating || 0), 0) / (allPros.length || 1);
          setAvgRating(Math.round(avg * 10) / 10);
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = searchQuery ? "?q=" + encodeURIComponent(searchQuery) : "";
    router.push("/search" + params);
  };

  const handleVoiceSearch = useCallback(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("La recherche vocale n'est pas supportée sur votre navigateur.");
      return;
    }
    const SpeechRecognitionAPI = (window as unknown as Record<string, unknown>).SpeechRecognition || (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
    const recognition = new (SpeechRecognitionAPI as new () => { lang: string; continuous: boolean; interimResults: boolean; start: () => void; onresult: (event: { results: { transcript: string }[][] }) => void; onerror: () => void; onend: () => void })();
    recognition.lang = "fr-FR";
    recognition.continuous = false;
    recognition.interimResults = false;
    setIsListening(true);
    recognition.onresult = (event) => {
      setSearchQuery(event.results[0][0].transcript);
      setShowClear(true);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  }, []);

  return (
    <main className="min-h-screen pb-24 lg:pb-12">
      {/* Block 1 — Hero */}
      <div className="bg-[#1A1A2E] rounded-b-[28px] px-4 pt-4 pb-8 -mx-4 sm:-mx-6 lg:-mx-8 mb-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-1.5 bg-white/15 text-white text-xs font-medium px-3 py-1.5 rounded-full">
              <MapPin className="w-3.5 h-3.5" />
              <span>Cocody, Abidjan</span>
            </div>
            <Link href="/profile">
              <Avatar size="sm" alt="Profil" />
            </Link>
          </div>

          <h1 className="text-2xl font-extrabold text-white mb-1">
            Bienvenue 👋
          </h1>
          <p className="text-sm text-white/70 mb-5">
            Trouvez un professionnel fiable près de chez vous.
          </p>

          <form onSubmit={handleSearch}>
            <div className="flex items-center gap-2 bg-white rounded-2xl px-4 py-2 shadow-lg">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Quel service recherchez-vous ?"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowClear(e.target.value.length > 0);
                }}
                className="flex-1 bg-transparent outline-none text-text-primary placeholder:text-text-tertiary text-sm"
              />
              {showClear && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(""); setShowClear(false); }}
                  className="text-text-tertiary p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={handleVoiceSearch}
                className={cn(
                  "p-2 rounded-xl transition-all",
                  isListening ? "bg-primary text-white scale-110" : "bg-gray-100 text-text-secondary hover:bg-gray-200"
                )}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
              <button
                type="submit"
                className="bg-[#FF6B35] text-white font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 active:scale-95 transition-all text-sm"
              >
                Chercher
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Block 2 — Stats Strip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-3 gap-3 mb-6"
      >
        <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-soft">
          <p className="text-xl font-extrabold text-text-primary">{loading ? "—" : proCount}</p>
          <p className="text-2xs text-text-secondary mt-0.5">Professionnels</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-soft">
          <p className="text-xl font-extrabold text-text-primary">{loading ? "—" : avgRating}★</p>
          <p className="text-2xs text-text-secondary mt-0.5">Note moyenne</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-soft">
          <p className="text-xl font-extrabold text-text-primary">&lt; 3 min</p>
          <p className="text-2xs text-text-secondary mt-0.5">Mise en relation</p>
        </div>
      </motion.div>

      {/* Block 3 — Categories Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-text-primary">Catégories</h2>
          <Link href="/search" className="text-sm text-primary font-medium flex items-center gap-0.5">
            Voir tout <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/search?category=${cat.slug}`}
              className="flex flex-col items-center gap-1.5 p-3 bg-white rounded-2xl border border-gray-100 shadow-soft active:scale-90 transition-all duration-150 hover:shadow-card"
            >
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-lg">
                {cat.emoji}
              </div>
              <span className="text-2xs font-medium text-text-secondary text-center leading-tight">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Block 4 — Top Professionals */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-text-primary">⭐ Top Professionnels</h2>
          <Link href="/search" className="text-sm text-primary font-medium flex items-center gap-0.5">
            Voir tout <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl h-32 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="p-6 bg-gray-50 rounded-2xl text-center">
            <p className="text-sm text-text-secondary">Impossible de charger les professionnels.</p>
            <button onClick={() => window.location.reload()} className="mt-2 text-sm text-primary font-medium">
              Réessayer
            </button>
          </div>
        ) : pros.length === 0 ? (
          <div className="p-6 bg-gray-50 rounded-2xl text-center">
            <p className="text-sm text-text-secondary">Aucun professionnel disponible pour le moment. Revenez bientôt !</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pros.map((pro) => (
              <ProCard key={pro.id} pro={pro} />
            ))}
          </div>
        )}
      </motion.div>

      {/* Block 5 — Pro Recruitment Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
      >
        <div className="bg-gradient-to-r from-[#FF6B35] to-[#FF8F5E] rounded-2xl p-5 flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-white font-bold text-base mb-1">Vous êtes professionnel ?</h3>
            <p className="text-white/80 text-xs">Rejoignez nos artisans vérifiés</p>
          </div>
          <Link
            href="/login?mode=pro"
            className="bg-white text-[#FF6B35] font-semibold text-sm px-5 py-2.5 rounded-xl hover:opacity-90 active:scale-95 transition-all whitespace-nowrap"
          >
            S&apos;inscrire →
          </Link>
        </div>
      </motion.div>

      <PwaInstallPrompt />
    </main>
  );
}