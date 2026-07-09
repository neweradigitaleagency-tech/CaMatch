import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, TrendingUp, Sparkles, Clock, Zap, Briefcase, Image } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import SubscriptionCard from "../../components/subscription/SubscriptionCard";
import { useSubscriptionStore } from "../../stores/subscriptionStore";
import { useBoostStore } from "../../stores/boostStore";
import { useAuthStore } from "../../stores/authStore";
import type { BoostType } from "../../types/subscription";

const BOOST_LABELS: Record<BoostType, string> = {
  search_top: "Search Top",
  category_top: "Category Top",
  featured: "Mis en avant",
};

const BOOST_ICONS: Record<BoostType, string> = {
  search_top: "Zap",
  category_top: "Briefcase",
  featured: "Sparkles",
};

function BoostIcon({ type }: { type: BoostType }) {
  switch (type) {
    case "search_top": return <Zap className="w-4 h-4 text-cm-accent" />;
    case "category_top": return <Briefcase className="w-4 h-4 text-cm-accent" />;
    case "featured": return <Sparkles className="w-4 h-4 text-amber-500" />;
  }
}

export default function ProSubscriptionDashboardPage() {
  const nav = useNavigate();
  const userId = useAuthStore((s) => s.userId) || "user_1";

  const {
    currentSubscription,
    usage,
    loading: subLoading,
    error: subError,
    fetchAll,
  } = useSubscriptionStore();

  const {
    activeBoosts,
    loading: boostLoading,
    fetchActive,
  } = useBoostStore();

  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      setInitialized(true);
      Promise.all([
        fetchAll(userId),
        fetchActive(userId),
      ]);
    }
  }, [initialized, userId, fetchAll, fetchActive]);

  const loading = subLoading || boostLoading;
  const error = subError;

  if (error) {
    return (
      <div className="min-h-dynamic bg-cm-bg">
        <div className="sticky top-0 z-10 bg-cm-elevated/80 backdrop-blur-lg border-b border-cm-border">
          <div className="flex items-center h-14 px-5 gap-3">
            <button type="button" onClick={() => nav(-1)} className="p-1 -ml-1 cursor-pointer active:scale-[0.97]">
              <ArrowLeft className="w-5 h-5 text-cm-text" />
            </button>
            <h1 className="text-[18px] font-bold text-cm-text">Abonnement</h1>
          </div>
        </div>
        <div className="w-full max-w-[448px] mx-auto px-5 pt-4 pb-24">
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-3">
              <TrendingUp className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-[14px] font-semibold text-cm-text mb-1">Une erreur est survenue</h3>
            <p className="text-[12px] text-cm-text-soft text-center max-w-xs mb-4">{error}</p>
            <button
              onClick={() => { fetchAll(userId); fetchActive(userId); }}
              className="h-9 px-4 text-[12px] font-medium text-cm-text bg-cm-elevated border border-cm-border rounded-[var(--radius-cm)] cursor-pointer"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dynamic bg-cm-bg">
      <div className="sticky top-0 z-10 bg-cm-elevated/80 backdrop-blur-lg border-b border-cm-border">
        <div className="flex items-center h-14 px-5 gap-3">
          <button type="button" onClick={() => nav(-1)} className="p-1 -ml-1 cursor-pointer active:scale-[0.97]">
            <ArrowLeft className="w-5 h-5 text-cm-text" />
          </button>
          <h1 className="text-[18px] font-bold text-cm-text">Abonnement</h1>
        </div>
      </div>

      <div className="w-full max-w-[448px] mx-auto px-5 pt-4 pb-24 space-y-4">
        {loading && !currentSubscription ? (
          <div className="flex flex-col gap-4">
            <div className="bg-cm-elevated border border-cm-border rounded-[14px] p-5 animate-pulse">
              <div className="h-5 w-32 bg-cm-border rounded mb-3" />
              <div className="h-3 w-48 bg-cm-border rounded mb-2" />
              <div className="h-3 w-24 bg-cm-border rounded" />
            </div>
            <div className="bg-cm-elevated border border-cm-border rounded-[14px] p-5 animate-pulse">
              <div className="h-5 w-24 bg-cm-border rounded mb-3" />
              <div className="h-3 w-full bg-cm-border rounded mb-2" />
              <div className="h-3 w-3/4 bg-cm-border rounded" />
            </div>
          </div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <SubscriptionCard
                subscription={currentSubscription}
                usage={usage}
                onUpgrade={() => nav("/pro/subscription/plans")}
                onCancel={() => {
                  if (currentSubscription?.id) {
                    useSubscriptionStore.getState().cancel(currentSubscription.id);
                  }
                }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-cm-elevated border border-cm-border rounded-[14px] p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-[13px] font-bold text-cm-text">Boosts actifs</h2>
                <button
                  onClick={() => nav("/pro/boost")}
                  className="text-[11px] text-cm-accent font-semibold cursor-pointer"
                >
                  Voir tout
                </button>
              </div>
              {activeBoosts.length === 0 ? (
                <div className="flex flex-col items-center py-4 gap-2">
                  <Zap className="w-8 h-8 text-cm-text-soft" />
                  <p className="text-[12px] text-cm-text-soft text-center">Aucun boost actif</p>
                  <button
                    onClick={() => nav("/pro/boost")}
                    className="h-8 px-4 bg-cm-accent text-white text-[11px] font-semibold rounded-full cursor-pointer"
                  >
                    Activer un boost
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {activeBoosts.map((boost) => {
                    const daysLeft = differenceInDays(new Date(boost.ends_at), new Date());
                    return (
                      <div key={boost.id} className="flex items-center gap-3 p-3 bg-cm-bg rounded-[10px]">
                        <BoostIcon type={boost.boost_type} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-semibold text-cm-text">
                            {BOOST_LABELS[boost.boost_type]}
                          </p>
                          <p className="text-[10px] text-cm-text-soft">
                            {daysLeft > 0 ? `Encore ${daysLeft} jour${daysLeft > 1 ? "s" : ""}` : "Expire aujourd'hui"}
                          </p>
                        </div>
                        <span className="text-[11px] font-mono font-bold text-cm-text">
                          {boost.amount_paid.toLocaleString("fr-FR")} F
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-cm-elevated border border-cm-border rounded-[14px] p-5 space-y-4"
            >
              <h2 className="text-[13px] font-bold text-cm-text">Utilisation</h2>
              {usage.length === 0 ? (
                <p className="text-[12px] text-cm-text-soft text-center py-3">Aucune donnée d'utilisation</p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {usage.map((record) => {
                    const pct = record.limit_value && record.limit_value > 0
                      ? Math.min(Math.round((record.usage / record.limit_value) * 100), 100)
                      : 0;
                    return (
                      <div key={record.id} className="bg-cm-bg rounded-[10px] p-3 flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5">
                          {record.feature_code.includes("job") || record.feature_code.includes("application") ? (
                            <Briefcase className="w-3.5 h-3.5 text-cm-accent" />
                          ) : (
                            <Image className="w-3.5 h-3.5 text-cm-accent" />
                          )}
                          <span className="text-[10px] text-cm-text-soft uppercase tracking-wider">
                            {record.feature_code.replace(/_/g, " ")}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-[20px] font-bold text-cm-text">{record.usage}</span>
                          {record.limit_value && record.limit_value > 0 && (
                            <span className="text-[11px] text-cm-text-soft">/ {record.limit_value}</span>
                          )}
                        </div>
                        {record.limit_value && record.limit_value > 0 && (
                          <div className="w-full h-1.5 bg-cm-accent-soft rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                pct > 90 ? "bg-red-500" : pct > 75 ? "bg-amber-500" : "bg-cm-accent"
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              onClick={() => nav("/pro/subscription/plans")}
              className="w-full flex items-center justify-center gap-2 h-12 bg-cm-accent text-cm-text-onAccent text-[13px] font-bold rounded-[var(--radius-cm)] hover:bg-cm-accent-hover cursor-pointer active:scale-[0.97]"
            >
              <Sparkles className="w-4 h-4" />
              Améliorer ma formule
            </motion.button>
          </>
        )}
      </div>
    </div>
  );
}
