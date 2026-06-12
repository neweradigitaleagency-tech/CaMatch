"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FileText, Clock, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoginGate } from "@/components/shared/login-gate";
import { useUser } from "@/lib/auth-context";

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  PENDING: { label: "En attente", color: "bg-amber-50 text-amber-700", icon: Clock },
  ACCEPTED: { label: "Acceptée", color: "bg-blue-50 text-blue-700", icon: Clock },
  IN_PROGRESS: { label: "En cours", color: "bg-primary-50 text-primary-700", icon: Clock },
  COMPLETED: { label: "Terminée", color: "bg-green-50 text-green-700", icon: CheckCircle2 },
  CANCELLED: { label: "Annulée", color: "bg-red-50 text-red-700", icon: XCircle },
};

export default function DemandesPage() {
  const { user } = useUser();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const fetchMissions = async () => {
      try {
        const res = await fetch(`/api/missions?userId=${user.id}&role=client`);
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

  return (
    <LoginGate>
      <main className="min-h-screen pb-8 lg:pb-12">
        <div className="flex items-center justify-between py-4">
          <h1 className="text-lg lg:text-2xl font-bold text-text-primary">Mes demandes</h1>
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
              <FileText className="w-8 h-8 text-text-tertiary" />
            </div>
            <h2 className="text-lg font-bold text-text-primary mb-1">Aucune demande</h2>
            <p className="text-sm text-text-secondary max-w-xs mb-4">
              Vous n&apos;avez pas encore fait de demande. Trouvez un professionnel pour commencer.
            </p>
            <Link href="/search" className="bg-brand-orange text-white font-semibold px-6 py-3 rounded-xl active:scale-95 transition-all">
              Trouver un professionnel
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {missions.map((m, i) => {
              const config = statusConfig[m.status] || statusConfig.PENDING;
              const StatusIcon = config.icon;
              return (
                <motion.div
                  key={m.id || i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-white rounded-2xl border border-gray-100 p-4 shadow-soft"
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", config.color)}>
                      <StatusIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-text-primary">{m.service || "Demande"}</h3>
                      <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">{m.description || "—"}</p>
                      <div className="flex items-center gap-3 mt-2 text-2xs text-text-tertiary">
                        <span>{new Date(m.createdAt || Date.now()).toLocaleDateString("fr-FR")}</span>
                        <span>{m.address || "—"}</span>
                      </div>
                    </div>
                    <span className={cn("text-2xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0", config.color)}>
                      {config.label}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </LoginGate>
  );
}
