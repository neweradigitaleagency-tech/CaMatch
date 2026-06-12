"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Mic, MapPin, ChevronRight, Star, Clock, X, ShieldCheck, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { BadgeLevel } from "@/components/ui/badge";
import { PwaInstallPrompt } from "@/components/shared/pwa-install-prompt";

const categoryEmojis: Record<string, string> = {
  Plombier: "💧",
  Électricien: "⚡",
  Menuisier: "🔨",
  Réparateur: "🔧",
  Ménager: "🧹",
  "Cours & Coaching": "📚",
  Climatisation: "❄️",
  "Coiffure & Beauté": "💇",
};

const serviceEmojis: Record<string, string> = {
  Plombier: "🔧",
  Électricien: "💡",
  Menuisier: "🔨",
  Réparateur: "📱",
  Ménage: "🧹",
  Professeur: "📚",
  Climatisation: "❄️",
  Coiffeur: "💇",
  "Cours & Coaching": "📚",
  "Coiffure & Beauté": "💇",
};

const categoryColors = [
  "bg-blue-50 text-blue-600",
  "bg-yellow-50 text-yellow-600",
  "bg-amber-50 text-amber-600",
  "bg-purple-50 text-purple-600",
  "bg-pink-50 text-pink-600",
  "bg-green-50 text-green-600",
  "bg-cyan-50 text-cyan-600",
  "bg-rose-50 text-rose-600",
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const itemAnim = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.32, 0.72, 0, 1] as const } },
};

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  order: number;
}

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
  pricing: { service: string; label: string; price: number; isStartingAt: boolean }[];
}

function ProCard({ pro }: { pro: ProSummary }) {
  return (
    <Link
      href={`/pro/${pro.id}`}
      className="bg-white rounded-2xl border border-gray-100 p-4 shadow-soft hover:shadow-card active:scale-[0.97] transition-all duration-200 block"
    >
      <div className="flex items-start gap-3 mb-3">
        <Avatar size="md" alt={pro.name || ""} verified={pro.isVerified} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="font-bold text-text-primary text-sm truncate">{pro.name}</h3>
            <BadgeLevel level={pro.badge as "GOLD" | "SILVER" | "BRONZE" | "NONE" | "ELITE"} />
          </div>
          <p className="text-xs text-text-secondary">{pro.profession}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-xs font-semibold text-text-primary">{pro.rating.toFixed(1)}</span>
            <span className="text-2xs text-text-tertiary">({pro.missionCount} missions)</span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1 text-text-tertiary">
          <Clock className="w-3 h-3" />
          {pro.responseTime ? `${pro.responseTime} min` : "—"}
        </span>
        <span className="font-bold text-primary">
          {pro.pricing?.[0]?.price?.toLocaleString() || "—"} FCFA
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [pros, setPros] = useState<ProSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/categories").then((r) => {
        if (!r.ok) throw new Error("Categories fetch failed");
        return r.json();
      }),
      fetch("/api/pros").then((r) => {
        if (!r.ok) throw new Error("Pros fetch failed");
        return r.json();
      }),
    ]).then(([catData, proData]) => {
      if (!cancelled) {
        setCategories(catData.categories || []);
        setPros((proData.pros || []).sort((a: ProSummary, b: ProSummary) => b.trustScore - a.trustScore).slice(0, 5));
      }
    }).catch(() => {
      if (!cancelled) setError(true);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();
    recognition.lang = "fr-FR";
    recognition.continuous = false;
    recognition.interimResults = false;
    setIsListening(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      setSearchQuery(event.results[0][0].transcript);
      setShowClear(true);
      setIsListening(false);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  }, []);

  return (
    <main className="min-h-screen pb-8 lg:pb-12">
      <div className="pt-2 space-y-6 lg:space-y-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-text-secondary text-sm">
              <MapPin className="w-4 h-4 text-primary" />
              <span>Cocody, Abidjan</span>
            </div>
            <span className="hidden sm:flex items-center gap-1.5 text-2xs text-primary bg-primary-50 px-3 py-1 rounded-full font-medium">
              <ShieldCheck className="w-3 h-3" />
              Pros vérifiés
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-text-primary leading-tight max-w-2xl">
            Trouvez un professionnel de confiance en Côte d&apos;Ivoire
          </h1>
          <p className="text-sm lg:text-base text-text-secondary max-w-xl">
            Comparez les avis, vérifiez les certifications et contactez directement les meilleurs pros près de chez vous.
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSearch}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.32, 0.72, 0, 1] }}
        >
          <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-4 py-3.5 shadow-soft transition-all duration-200 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary">
            <Search className="w-5 h-5 text-text-tertiary" />
            <input
              type="text"
              placeholder="Plombier, électricien..."
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
                isListening ? "bg-primary text-white scale-110" : "bg-primary-50 text-primary hover:bg-primary-100"
              )}
            >
              <Mic className="w-4 h-4" />
            </button>
            <button
              type="submit"
              className="bg-primary text-white p-2.5 rounded-xl hover:bg-primary-600 active:scale-95 transition-all"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </motion.form>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-text-primary">Services populaires</span>
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {["Plombier", "Électricien", "Menuisier", "Ménage", "Coiffeur"].map((s) => (
              <Link
                key={s}
                href={`/search?q=${s}`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm bg-primary-50 text-primary whitespace-nowrap active:scale-95 transition-transform duration-150 hover:bg-primary-100"
              >
                <span>{serviceEmojis[s] || "🔧"}</span>
                {s}
              </Link>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.16 }}
        >
          <h2 className="text-lg font-bold text-text-primary mb-3">Toutes nos catégories</h2>
          {loading ? (
            <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-10 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 p-3 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="p-6 bg-gray-50 rounded-2xl text-center">
              <p className="text-sm text-text-secondary">Impossible de charger les catégories.</p>
              <button onClick={() => window.location.reload()} className="mt-2 text-sm text-primary font-medium">
                Réessayer
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-10 gap-3">
              {categories.map((cat, i) => (
                <Link
                  key={cat.id}
                  href={`/search?cat=${cat.slug}`}
                  className="flex flex-col items-center gap-1.5 p-3 bg-white rounded-2xl border border-gray-100 shadow-soft active:scale-90 transition-all duration-150 hover:shadow-card"
                >
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-lg", categoryColors[i % categoryColors.length])}>
                    {categoryEmojis[cat.name] || "🔧"}
                  </div>
                  <span className="text-2xs font-medium text-text-secondary text-center leading-tight">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-text-primary">Meilleurs professionnels</h2>
            <Link href="/search" className="text-sm text-primary font-medium flex items-center gap-0.5 hover:gap-1 transition-all">
              Voir tout <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {loading ? (
            <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-64 h-44 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="p-6 bg-gray-50 rounded-2xl text-center">
              <p className="text-sm text-text-secondary">Impossible de charger les professionnels.</p>
              <button onClick={() => window.location.reload()} className="mt-2 text-sm text-primary font-medium">
                Réessayer
              </button>
            </div>
          ) : (
            <>
              <motion.div className="flex gap-3 overflow-x-auto scrollbar-hide lg:hidden -mx-4 px-4 pb-2" variants={container} initial="hidden" animate="show">
                {pros.map((pro) => (
                  <motion.div key={pro.id} variants={itemAnim} className="flex-shrink-0 w-64">
                    <ProCard pro={pro} />
                  </motion.div>
                ))}
              </motion.div>
              <div className="hidden lg:grid lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {pros.map((pro) => (
                  <ProCard key={pro.id} pro={pro} />
                ))}
              </div>
            </>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <Link
            href="/search"
            className="flex items-center justify-between p-4 bg-primary-50 rounded-2xl border border-primary-100 active:scale-[0.98] transition-all duration-200 hover:bg-primary-100"
          >
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-primary" />
              <div>
                <span className="font-semibold text-text-primary text-sm">Explorer tous les services</span>
                <p className="text-xs text-text-secondary">{categories.length} catégories disponibles</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-primary" />
          </Link>
        </motion.div>
      </div>

      <PwaInstallPrompt />
    </main>
  );
}
