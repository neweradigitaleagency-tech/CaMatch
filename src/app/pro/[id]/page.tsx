"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Share2, MessageCircle, Phone, MapPin, Clock, Star, Camera } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { BadgeLevel, VerificationBadge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Tab = "portfolio" | "avis" | "infos";

interface ProData {
  id: string;
  name: string | null;
  phone: string;
  avatarUrl: string | null;
  isVerified: boolean;
  badge: string;
  profession: string | null;
  rating: number;
  reviewCount: number;
  trustScore: number;
  zone: string[];
  missionCount: number;
  responseTime: number | null;
  bio: string | null;
  pricing: { label: string; price: number }[];
  portfolio: { id: string; title?: string; description?: string; afterUrl?: string; missionId?: string | null }[];
  reviews: { id: string; rating: number; comment: string | null; date: string; author: string; authorAvatar?: string | null }[];
  services?: { name: string }[];
}

export default function ProProfilePage({ params }: { params: { id: string } }) {
  const [pro, setPro] = useState<ProData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("portfolio");

  useEffect(() => {
    let cancelled = false;
    const fetchPro = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/pros/${params.id}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        if (!cancelled) {
          if (data.pro) setPro(data.pro);
          else setError(true);
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchPro();
    return () => { cancelled = true; };
  }, [params.id]);

  if (loading) {
    return (
      <main className="min-h-screen animate-pulse">
        <div className="bg-gray-200 h-48 rounded-b-[28px]" />
        <div className="px-4 pt-20 space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-16 bg-gray-200 rounded-2xl" />
          <div className="h-32 bg-gray-200 rounded-2xl" />
        </div>
      </main>
    );
  }

  if (error || !pro) notFound();

  const whatsappUrl = `https://wa.me/${pro.phone}?text=${encodeURIComponent(`Bonjour ${pro.name}, je vous contacte depuis Ça Match pour ${pro.profession || "vos services"}.`)}`;

  const tabs: { key: Tab; label: string }[] = [
    { key: "portfolio", label: "Portfolio" },
    { key: "avis", label: "Avis" },
    { key: "infos", label: "Infos" },
  ];

  return (
    <main className="min-h-screen pb-28 lg:pb-8">
      {/* Back button + share */}
      <div className="flex items-center justify-between px-4 py-3">
        <Link href="/search" className="btn-ghost p-2 -ml-2">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <button
          onClick={async () => {
            try {
              await navigator.share({ title: pro?.name || "Profil", url: window.location.href });
            } catch {
              navigator.clipboard?.writeText(window.location.href);
            }
          }}
          className="btn-ghost p-2"
          aria-label="Partager le profil"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-[#1A1A2E] to-[#2A2A4E] mx-4 rounded-[28px] p-6 pt-12 relative mb-4">
        <div className="flex items-start gap-4">
          <div className="relative">
            <Avatar size="xl" src={pro.avatarUrl} alt={pro.name || ""} verified={pro.isVerified} />
            <div className={cn(
              "absolute -bottom-1 left-6 w-4 h-4 rounded-full border-2 border-[#1A1A2E]",
              pro.responseTime && pro.responseTime < 15 ? "bg-green-500" : "bg-gray-400"
            )} />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-extrabold text-white">{pro.name}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <BadgeLevel level={pro.badge} />
              {pro.isVerified && <VerificationBadge />}
            </div>
            <p className="text-sm text-white/70 mt-1">{pro.profession}</p>
            <div className="flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1 text-amber-400 text-xs">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {pro.rating?.toFixed(1) || "—"}
              </span>
              <span className="text-xs text-white/50">({pro.reviewCount || 0} avis)</span>
            </div>
            <div className="flex items-center gap-3 mt-2 text-2xs text-white/60">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {pro.responseTime ? `~${pro.responseTime} min` : "—"}
              </span>
              <span>🎯 {pro.missionCount || 0} missions</span>
            </div>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-3 gap-2 mt-5">
          {[
            { label: "Missions", value: pro.missionCount || 0 },
            { label: "Note", value: pro.rating?.toFixed(1) || "—" },
            { label: "Avis", value: pro.reviewCount || 0 },
          ].map((s) => (
            <div key={s.label} className="bg-white/10 rounded-xl py-2.5 text-center">
              <p className="text-white font-bold text-sm">{s.value}</p>
              <p className="text-white/50 text-2xs">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* About Section */}
      {pro.bio && (
        <div className="px-4 mb-4">
          <h3 className="text-sm font-bold text-text-primary mb-2">À propos</h3>
          <p className="text-sm text-text-secondary leading-relaxed">{pro.bio}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="px-4 mb-4">
        <div className="flex border-b border-gray-100">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex-1 pb-3 text-sm font-medium transition-colors relative",
                activeTab === tab.key ? "text-[#FF6B35]" : "text-text-tertiary"
              )}
            >
              {tab.label}
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-[#FF6B35] rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4">
        {activeTab === "portfolio" && (
          <div>
            {!pro.portfolio || pro.portfolio.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Camera className="w-6 h-6 text-text-tertiary" />
                </div>
                <p className="text-sm text-text-secondary">Aucune réalisation pour le moment</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {pro.portfolio.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-2xl p-4 aspect-[4/3] flex flex-col items-center justify-center">
                    {item.afterUrl ? (
                      <div className="w-full h-full bg-gray-200 rounded-xl mb-2" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center text-lg mb-2">
                        📸
                      </div>
                    )}
                    {item.title && <p className="text-xs font-medium text-text-primary text-center">{item.title}</p>}
                    {item.missionId && (
                      <span className="text-2xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full mt-1">Mission validée</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "avis" && (
          <div>
            {/* Rating Summary */}
            <div className="flex items-center gap-4 bg-gray-50 rounded-2xl p-4 mb-4">
              <div className="text-center">
                <p className="text-3xl font-extrabold text-text-primary">{pro.rating?.toFixed(1) || "—"}</p>
                <div className="flex gap-0.5 mt-1 justify-center">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={cn("w-3 h-3", s <= Math.round(pro.rating || 0) ? "fill-amber-400 text-amber-400" : "text-gray-300")} />
                  ))}
                </div>
                <p className="text-2xs text-text-tertiary mt-1">{pro.reviewCount || 0} avis</p>
              </div>
            </div>

            {/* Review List */}
            {!pro.reviews || pro.reviews.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-sm text-text-secondary">Aucun avis pour le moment</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pro.reviews.map((review) => (
                  <div key={review.id} className="bg-gray-50 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar size="sm" src={review.authorAvatar} alt={review.author} />
                      <div>
                        <p className="text-sm font-semibold text-text-primary">{review.author}</p>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-medium">{review.rating}</span>
                        </div>
                      </div>
                    </div>
                    {review.comment && <p className="text-sm text-text-secondary">{review.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "infos" && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-2xl p-4">
              <h4 className="text-xs font-bold text-text-tertiary uppercase tracking-wider mb-3">Informations</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Zone d&apos;intervention
                  </span>
                  <span className="text-sm font-medium text-text-primary">
                    {Array.isArray(pro.zone) ? pro.zone.join(", ") : pro.zone || "Abidjan"}
                  </span>
                </div>
                <div className="h-px bg-gray-200" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Temps de réponse
                  </span>
                  <span className="text-sm font-medium text-text-primary">
                    {pro.responseTime ? `~${pro.responseTime} min` : "—"}
                  </span>
                </div>
                <div className="h-px bg-gray-200" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Disponibilité</span>
                  <span className="text-sm font-medium text-green-600">🟢 Disponible</span>
                </div>
                {pro.pricing && pro.pricing.length > 0 && (
                  <>
                    <div className="h-px bg-gray-200" />
                    <div>
                      <span className="text-sm text-text-secondary block mb-2">Tarifs</span>
                      <div className="space-y-1.5">
                        {pro.pricing.map((p, i) => (
                          <div key={i} className="flex items-center justify-between bg-white rounded-xl px-3 py-2">
                            <span className="text-sm text-text-primary">{p.label}</span>
                            <span className="text-sm font-bold text-primary">{p.price.toLocaleString()} FCFA</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom CTA Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-gray-100 safe-bottom lg:hidden">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 rounded-2xl bg-green-500 text-white flex items-center justify-center active:scale-90 transition-transform"
          >
            <MessageCircle className="w-5 h-5" />
          </a>
          <a
            href={`tel:+${pro.phone}`}
            className="w-12 h-12 rounded-2xl border border-gray-200 text-text-secondary flex items-center justify-center active:scale-90 transition-transform"
          >
            <Phone className="w-5 h-5" />
          </a>
          <Link
            href={`/messages?pro=${pro?.id}`}
            className="flex-1 h-12 bg-[#FF6B35] text-white font-semibold rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm"
          >
            <MessageCircle className="w-4 h-4" />
            Envoyer un message
          </Link>
        </div>
      </div>
    </main>
  );
}