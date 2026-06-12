"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FileText, Clock, CheckCircle2, XCircle, DollarSign, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoginGate } from "@/components/shared/login-gate";
import { useUser } from "@/lib/auth-context";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function QuickQuoteCard({ q }: { q: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-brand-orange/20 ring-1 ring-brand-orange/5 p-4 shadow-soft"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-orange/10 text-brand-orange flex items-center justify-center flex-shrink-0">
          <FileText className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-text-primary">Devis Rapide — {q.category}</h3>
          </div>
          <p className="text-xs text-text-secondary mt-1 line-clamp-2">{q.description}</p>
          <div className="flex items-center gap-3 mt-2 text-2xs text-text-tertiary flex-wrap">
            {q.budget && (
              <span className="flex items-center gap-1 font-semibold text-text-primary">
                <DollarSign className="w-3 h-3" />
                {q.budget.toLocaleString()} FCFA
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(q.createdAt).toLocaleDateString("fr-FR")}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className={cn(
              "text-2xs font-semibold px-2 py-0.5 rounded-full",
              q.status === "OPEN" ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700"
            )}>
              {q.status === "OPEN" ? "En attente" : "Accepté"}
            </span>
            <span className="flex items-center gap-1 text-2xs text-text-tertiary">
              <Eye className="w-3 h-3" />
              {q.viewCount || 0} pro{q.viewCount !== 1 ? "s" : ""} ont vu
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const fetchData = async () => {
      try {
        const [missionsRes, quotesRes] = await Promise.all([
          fetch(`/api/missions?userId=${user.id}&role=client`),
          fetch(`/api/quick-quotes?status=OPEN,ACCEPTED`),
        ]);
        const missionsData = await missionsRes.json();
        const quotesData = await quotesRes.json();
        if (!cancelled) {
          setMissions(missionsData.missions ?? []);
          setQuotes((quotesData.quotes ?? []).filter((q: { clientId: string }) => q.clientId === user.id));
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

  return (
    <LoginGate>
      <main className="min-h-screen pb-20 lg:pb-12">
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
        ) : missions.length === 0 && quotes.length === 0 ? (
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
            {quotes.length > 0 && (
              <>
                <div className="pt-2 pb-1">
                  <h2 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Devis Rapides</h2>
                </div>
                {quotes.map((q, i) => <QuickQuoteCard key={q.id || `q-${i}`} q={q} />)}
                {missions.length > 0 && (
                  <div className="pt-2 pb-1 mt-4">
                    <h2 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Missions</h2>
                  </div>
                )}
              </>
            )}
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
