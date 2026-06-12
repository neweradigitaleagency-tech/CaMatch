"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Share2, MessageCircle, Phone, FileText, ChevronRight, MapPin, GraduationCap, Shield, Camera, Star } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { BadgeLevel } from "@/components/ui/badge";
import { TrustScoreBar } from "@/components/ui/trust-score-bar";
import { StarRating } from "@/components/ui/star-rating";
import { cn } from "@/lib/utils";

const trustItems = [
  { icon: Shield, label: "Identité vérifiée" },
  { icon: MapPin, label: "Visite terrain validée" },
  { icon: Camera, label: "Preuves de travail" },
  { icon: MessageCircle, label: "Avis vérifiés" },
  { icon: GraduationCap, label: "Formations complétées" },
];

export default function ProProfilePage({ params }: { params: { id: string } }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pro, setPro] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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
        <div className="flex items-center gap-3 py-4">
          <div className="w-5 h-5 bg-gray-200 rounded" />
          <div className="w-5 h-5 bg-gray-200 rounded ml-auto" />
        </div>
        <div className="h-48 bg-gray-200 rounded-2xl" />
        <div className="pt-6 pb-4 space-y-6">
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-1/3" />
          </div>
          <div className="h-16 bg-gray-200 rounded-2xl" />
          <div className="h-32 bg-gray-200 rounded-2xl" />
        </div>
      </main>
    );
  }

  if (error || !pro) notFound();

  const whatsappUrl = `https://wa.me/${pro.phone}?text=${encodeURIComponent(`Bonjour ${pro.name}, je vous contacte depuis Ça Match pour ${pro.profession}.`)}`;

  function TrustSection() {
    return (
      <div className="bg-gray-50 rounded-2xl p-4 space-y-2.5">
        <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          Confiance
        </h3>
        {trustItems.map((item) => {
          const isDone =
            (item.label === "Identité vérifiée" && pro.isVerified) ||
            (item.label === "Visite terrain validée" && pro.isOnsiteVerified) ||
            (item.label === "Preuves de travail" && pro.portfolio?.length > 0) ||
            (item.label === "Avis vérifiés" && pro.reviews?.length > 0) ||
            (item.label === "Formations complétées" && pro.badge !== "NONE");
          return (
            <div key={item.label} className="flex items-center gap-2.5 text-sm">
              <div className={cn("w-5 h-5 rounded-full flex items-center justify-center", isDone ? "bg-primary-100" : "bg-gray-200")}>
                {isDone ? (
                  <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="w-3 h-3 rounded-full bg-gray-300" />
                )}
              </div>
              <span className={isDone ? "text-text-primary" : "text-text-tertiary"}>{item.label}</span>
            </div>
          );
        })}
      </div>
    );
  }

  function PricingSection() {
    if (!pro.pricing?.length) return null;
    return (
      <div>
        <h3 className="text-sm font-bold text-text-primary mb-3">Tarifs</h3>
        <div className="space-y-2">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {pro.pricing.map((p: any) => (
            <div key={p.label} className="flex items-center justify-between py-2.5 px-3 bg-gray-50 rounded-xl">
              <span className="text-sm text-text-primary">{p.label}</span>
              <span className="text-sm font-bold text-primary">{p.price}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function Sidebar() {
    return (
      <div className="space-y-4">
        <TrustScoreBar score={pro.trustScore} size="lg" />
        <TrustSection />
        <PricingSection />
        <div className="sticky top-24 space-y-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-primary text-white font-semibold rounded-2xl px-5 py-3.5 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 shadow-card hover:bg-primary-600"
          >
            <MessageCircle className="w-5 h-5" />
            Contacter (WhatsApp)
          </a>
          <div className="flex gap-2">
            <a
              href={`tel:+${pro.phone}`}
              className="flex-1 rounded-2xl bg-gray-100 text-text-secondary h-12 flex items-center justify-center gap-2 text-sm font-medium active:scale-95 transition-transform hover:bg-gray-200"
            >
              <Phone className="w-4 h-4" />
              Appeler
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-2xl bg-gray-100 text-text-secondary h-12 flex items-center justify-center gap-2 text-sm font-medium active:scale-95 transition-transform hover:bg-gray-200"
            >
              <FileText className="w-4 h-4" />
              Devis
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-8 lg:pb-12">
      <div className="flex items-center gap-3 py-4">
        <Link href="/search" className="btn-ghost p-2 -ml-2">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg lg:text-2xl font-bold text-text-primary">Profil</h1>
        <button className="btn-ghost p-2 ml-auto">
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      <div className="lg:grid lg:grid-cols-3 lg:gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-48 bg-gradient-to-br from-primary-300 to-primary-600 relative rounded-2xl overflow-hidden">
            <div className="absolute -bottom-16 left-4">
              <Avatar size="xl" src={pro.avatarUrl} alt={pro.name} verified={pro.isVerified} />
            </div>
          </div>

          <div className="pt-20 space-y-6">
            <div>
              <h1 className="text-xl lg:text-2xl font-extrabold text-text-primary">{pro.name}</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <BadgeLevel level={pro.badge} />
                <StarRating rating={pro.rating} />
                <span className="text-xs text-text-tertiary">· {pro.missionCount} missions</span>
              </div>
              <p className="text-sm text-text-secondary mt-1">{pro.profession} · {pro.experience}</p>
              {pro.bio && <p className="text-sm text-text-secondary mt-2 leading-relaxed">{pro.bio}</p>}
            </div>

            {/* Mobile sidebar content */}
            <div className="lg:hidden space-y-6">
              <Sidebar />
            </div>

            {pro.portfolio?.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-text-primary">Portfolio</h3>
                  <Link href="#" className="text-xs text-primary font-medium flex items-center gap-0.5">
                    Voir tout ({pro.portfolio.length}) <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {pro.portfolio.map((_: any, i: number) => (
                    <div key={i} className="aspect-[4/3] rounded-xl bg-gray-100 flex items-center justify-center text-sm text-text-tertiary">
                      <Camera className="w-5 h-5" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-text-primary">Disponibilité</h3>
              </div>
              <div className="space-y-2">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {pro.availability?.map((a: any) => (
                  <div key={a.day} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-xl">
                    <span className="text-sm text-text-primary">{a.status} {a.day}</span>
                    <span className="text-xs font-medium text-text-secondary">{a.hours}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-text-primary">
                  Avis clients · {pro.rating}/5
                </h3>
                <Link href="#" className="text-xs text-primary font-medium">
                  Voir les {pro.reviews?.length || 0} avis
                </Link>
              </div>
              {!pro.reviews || pro.reviews.length === 0 ? (
                <div className="p-4 bg-gray-50 rounded-2xl text-center">
                  <p className="text-sm text-text-tertiary">Aucun avis pour le moment</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {pro.reviews.map((review: any) => (
                    <div key={review.id} className="p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center">
                          {(review.author || "?").charAt(0)}
                        </span>
                        <span className="text-sm font-semibold text-text-primary">{review.author}</span>
                        <div className="flex gap-0.5">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                        <span className="text-2xs text-text-tertiary ml-auto">{review.date}</span>
                      </div>
                      <p className="text-sm text-text-secondary">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-bold text-text-primary mb-3">Zone d&apos;action</h3>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-sm text-text-secondary">{Array.isArray(pro.zone) ? pro.zone.join(", ") : pro.zone}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden lg:block lg:col-span-1">
          <Sidebar />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-gray-100 safe-bottom lg:hidden">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-primary text-white font-semibold rounded-2xl px-5 py-3.5 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 shadow-card hover:bg-primary-600"
          >
            <MessageCircle className="w-5 h-5" />
            Contacter (WhatsApp)
          </a>
          <a
            href={`tel:+${pro.phone}`}
            className="w-12 h-12 rounded-2xl bg-gray-100 text-text-secondary flex items-center justify-center active:scale-90 transition-transform hover:bg-gray-200"
          >
            <Phone className="w-5 h-5" />
          </a>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 rounded-2xl bg-gray-100 text-text-secondary flex items-center justify-center active:scale-90 transition-transform hover:bg-gray-200"
          >
            <FileText className="w-5 h-5" />
          </a>
        </div>
      </div>
    </main>
  );
}
