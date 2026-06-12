"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, MapPin, Calendar, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoginGate } from "@/components/shared/login-gate";
import { useUser } from "@/lib/auth-context";

export default function OpportunitesPage() {
  const { user } = useUser();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const fetchMissions = async () => {
      try {
        const res = await fetch(`/api/missions?userId=${user.id}&role=pro`);
        const data = await res.json();
        if (!cancelled) setMissions(data.missions ?? []);
      } catch {
        // silent
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchMissions();
    return () => { cancelled = true; };
  }, [user]);

  const pendingMissions = missions.filter((m: { status: string }) => m.status === "PENDING");

  return (
    <LoginGate requiredRole="pro">
      <main className="min-h-screen pb-8 lg:pb-12">
        <div className="flex items-center justify-between py-4">
          <h1 className="text-lg lg:text-2xl font-bold text-text-primary">Opportunités</h1>
          {pendingMissions.length > 0 && (
            <span className="bg-brand-orange text-white text-2xs font-bold px-2.5 py-1 rounded-full">
              {pendingMissions.length} nouvelle{pendingMissions.length > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : missions.length === 0 ? (
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
            {missions.map((m: { id: string; status: string; service: string; description: string; address: string; createdAt: string; agreedPrice: number | null }, i: number) => (
              <motion.div
                key={m.id || i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
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
                      <div className="flex items-center gap-2 mt-3">
                        <button className="flex-1 bg-brand-orange text-white text-xs font-semibold py-2 rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-all">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Accepter
                        </button>
                        <button className="px-4 py-2 rounded-xl border border-gray-200 text-text-secondary text-xs flex items-center gap-1 active:scale-95 transition-all">
                          <X className="w-3.5 h-3.5" />
                          Refuser
                        </button>
                      </div>
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
