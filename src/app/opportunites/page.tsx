"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Zap, MapPin, Calendar, X, DollarSign, MessageCircle, Image as ImageIcon, Film } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoginGate } from "@/components/shared/login-gate";
import { useUser } from "@/lib/auth-context";

interface QuickQuote {
  id: string;
  clientId: string;
  category: string;
  description: string;
  budget: number | null;
  mediaUrl: string | null;
  mediaType: string | null;
  status: string;
  createdAt: string;
  client: { id: string; profile: { firstName: string; lastName: string; avatarUrl: string | null } | null };
}

export default function OpportunitesPage() {
  const { user } = useUser();
  const [quotes, setQuotes] = useState<QuickQuote[]>([]);
  const [missions, setMissions] = useState<{
    id: string; status: string; service: string; description: string; address: string;
    createdAt: string; agreedPrice: number | null; proId: string;
  }[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const fetchData = async () => {
      try {
        const [profileRes, quotesRes, missionsRes] = await Promise.all([
          fetch("/api/pros/" + user.id),
          fetch("/api/quick-quotes?status=OPEN&proId=" + user.id),
          fetch(`/api/missions?userId=${user.id}&role=pro`),
        ]);
        const profileData = await profileRes.json();
        const proCategory = profileData?.pro?.profession?.toLowerCase() || "";
        const quotesData = await quotesRes.json();
        const missionsData = await missionsRes.json();
        if (!cancelled) {
          const filtered = (quotesData.quotes ?? []).filter(
            (q: QuickQuote) => q.category.toLowerCase().includes(proCategory) || proCategory === ""
          );
          setQuotes(filtered);
          setMissions(missionsData.missions ?? []);
        }
      } catch {
        // silent
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [user]);

  const pendingMissions = missions.filter((m) => m.status === "PENDING");

  const handleAccept = async (quoteId: string) => {
    if (!user) return;
    setAcceptingId(quoteId);
    try {
      const res = await fetch(`/api/quick-quotes/${quoteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proId: user.id }),
      });
      if (res.ok) {
        setQuotes((prev) => prev.filter((q) => q.id !== quoteId));
        window.location.href = `/messages`;
      }
    } catch {
      // silent
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <LoginGate requiredRole="pro">
      <main className="min-h-screen pb-24 md:pb-12">
        <div className="flex items-center justify-between py-4">
          <h1 className="text-lg lg:text-2xl font-bold text-text-primary">Opportunités</h1>
          {(pendingMissions.length + quotes.length) > 0 && (
            <span className="bg-brand-orange text-white text-2xs font-bold px-2.5 py-1 rounded-full">
              {pendingMissions.length + quotes.length} nouvelle{(pendingMissions.length + quotes.length) > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : quotes.length === 0 && missions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-3xl flex items-center justify-center mb-4">
              <Zap className="w-8 h-8 text-text-tertiary" />
            </div>
            <h2 className="text-lg font-bold text-text-primary mb-1">Aucune opportunité</h2>
            <p className="text-sm text-text-secondary max-w-xs">
              Les demandes de clients apparaîtront ici. Soyez disponible pour recevoir plus de missions.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {quotes.map((q, i) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white rounded-2xl border border-brand-orange/30 ring-1 ring-brand-orange/10 p-4 shadow-soft"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-orange/10 text-brand-orange flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm text-text-primary">Devis Rapide — {q.category}</h3>
                      <span className="text-2xs font-semibold text-brand-orange bg-brand-orange/10 px-2 py-0.5 rounded-full">
                        Nouveau
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary mt-1 line-clamp-3">{q.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-2xs text-text-tertiary flex-wrap">
                      {q.budget && (
                        <span className="flex items-center gap-1 font-semibold text-text-primary">
                          <DollarSign className="w-3 h-3" />
                          {q.budget.toLocaleString()} FCFA
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(q.createdAt).toLocaleDateString("fr-FR")}
                      </span>
                      {q.client?.profile && (
                        <span className="text-text-secondary">
                          {q.client.profile.firstName} {q.client.profile.lastName}
                        </span>
                      )}
                      {q.mediaUrl && (
                        <span className="flex items-center gap-1 text-brand-orange">
                          {q.mediaType === "video" ? <Film className="w-3 h-3" /> :                     <ImageIcon className="w-3 h-3" />}
                          {q.mediaType === "video" ? "Vidéo" : "Photo"} jointe
                        </span>
                      )}
                    </div>
                    {q.mediaUrl && (
                      <div className="mt-2">
                        {q.mediaType === "video" ? (
                          <video src={q.mediaUrl} controls className="w-full max-h-40 rounded-lg object-cover" />
                        ) : (
                          <img src={q.mediaUrl} alt="" className="w-full max-h-40 rounded-lg object-cover" />
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => handleAccept(q.id)}
                        disabled={acceptingId === q.id}
                        className="flex-1 bg-brand-orange text-white text-xs font-semibold py-3 rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-all disabled:opacity-50"
                      >
                        {acceptingId === q.id ? (
                          "Envoi..."
                        ) : (
                          <>
                            <MessageCircle className="w-3.5 h-3.5" />
                            Contacter le client
                          </>
                        )}
                      </button>
                      <button className="px-4 py-3 rounded-xl border border-gray-200 text-text-secondary text-xs flex items-center gap-1 active:scale-95 transition-all">
                        <X className="w-3.5 h-3.5" />
                        Passer
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {missions.map((m, i) => (
              <motion.div
                key={m.id || `m-${i}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (quotes.length + i) * 0.04 }}
                className={cn(
                  "bg-white rounded-2xl border p-4 shadow-soft",
                  m.status === "PENDING" ? "border-brand-orange/30 ring-1 ring-brand-orange/10" : "border-gray-100"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                    m.status === "PENDING" ? "bg-brand-orange/10 text-brand-orange" :
                    m.status === "ACCEPTED" ? "bg-blue-50 text-blue-600" :
                    "bg-green-50 text-green-600"
                  )}>
                    <Zap className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm text-text-primary">{m.service || "Demande"}</h3>
                      {m.status === "PENDING" && (
                        <span className="text-2xs font-semibold text-brand-orange bg-brand-orange/10 px-2 py-0.5 rounded-full">
                          Nouvelle
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">{m.description || "—"}</p>
                    <div className="flex items-center gap-3 mt-2 text-2xs text-text-tertiary">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {m.address || "—"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(m.createdAt || Date.now()).toLocaleDateString("fr-FR")}
                      </span>
                      {m.agreedPrice && (
                        <span className="font-semibold text-text-primary">{m.agreedPrice.toLocaleString()} FCFA</span>
                      )}
                    </div>
                    {m.status === "PENDING" && (
                      <Link
                        href={`/messages`}
                        className="inline-flex mt-3 bg-brand-orange text-white text-xs font-semibold py-3 px-4 rounded-xl items-center gap-1.5 active:scale-95 transition-all"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        Discuter
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </LoginGate>
  );
}
