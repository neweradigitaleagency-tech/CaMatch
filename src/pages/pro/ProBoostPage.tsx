import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Zap, Briefcase, Sparkles, Clock, Check, Loader, AlertCircle } from "lucide-react";
import { differenceInDays } from "date-fns";
import { useBoostStore } from "../../stores/boostStore";
import { useAuthStore } from "../../stores/authStore";
import type { BoostType } from "../../types/subscription";

interface BoostPack {
  type: BoostType;
  label: string;
  desc: string;
  icon: typeof Zap;
  color: string;
}

const BOOST_PACKS: BoostPack[] = [
  { type: "search_top", label: "Search Top", desc: "Apparaissez en haut des résultats de recherche", icon: Zap, color: "text-cm-accent" },
  { type: "category_top", label: "Category Top", desc: "Mettez votre profil en avant dans votre catégorie", icon: Briefcase, color: "text-cm-accent" },
  { type: "featured", label: "Mis en avant", desc: "Profil featured sur la page d'accueil", icon: Sparkles, color: "text-amber-500" },
];

const DURATIONS = [
  { days: 1, label: "1 jour" },
  { days: 7, label: "7 jours" },
  { days: 30, label: "30 jours" },
];

export default function ProBoostPage() {
  const nav = useNavigate();
  const userId = useAuthStore((s) => s.userId) || "user_1";

  const {
    activeBoosts,
    loading,
    error,
    fetchActive,
    createBoost,
    calculatePrice,
    clearError,
  } = useBoostStore();

  const [initialized, setInitialized] = useState(false);
  const [selectedType, setSelectedType] = useState<BoostType>("search_top");
  const [selectedDuration, setSelectedDuration] = useState(7);
  const [purchasing, setPurchasing] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!initialized) {
      setInitialized(true);
      fetchActive(userId);
    }
  }, [initialized, userId, fetchActive]);

  const price = calculatePrice(selectedType, selectedDuration);

  const handlePurchase = async () => {
    setPurchasing(true);
    setSuccess(false);
    try {
      await createBoost({
        user_id: userId,
        boost_type: selectedType,
        duration_days: selectedDuration,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      // handled by store
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <div className="min-h-dynamic bg-cm-bg">
      <div className="sticky top-0 z-10 bg-cm-elevated/80 backdrop-blur-lg border-b border-cm-border">
        <div className="flex items-center h-14 px-5 gap-3">
          <button type="button" onClick={() => nav(-1)} className="p-1 -ml-1 cursor-pointer active:scale-[0.97]">
            <ArrowLeft className="w-5 h-5 text-cm-text" />
          </button>
          <h1 className="text-[18px] font-bold text-cm-text">Boosts</h1>
        </div>
      </div>

      <div className="w-full max-w-[448px] mx-auto px-5 pt-4 pb-24 space-y-4">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-[10px]"
          >
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span className="text-[11px] text-red-600 flex-1">{error}</span>
            <button onClick={clearError} className="text-[11px] text-red-500 font-semibold cursor-pointer">
              OK
            </button>
          </motion.div>
        )}

        {activeBoosts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-cm-elevated border border-cm-border rounded-[14px] p-4 space-y-2"
          >
            <h2 className="text-[11px] font-semibold text-cm-text-soft uppercase tracking-wider">
              Boosts actifs ({activeBoosts.length})
            </h2>
            {activeBoosts.map((boost) => {
              const daysLeft = differenceInDays(new Date(boost.ends_at), new Date());
              return (
                <div key={boost.id} className="flex items-center gap-3 p-2.5 bg-cm-bg rounded-[10px]">
                  {boost.boost_type === "search_top" ? (
                    <Zap className="w-4 h-4 text-cm-accent" />
                  ) : boost.boost_type === "category_top" ? (
                    <Briefcase className="w-4 h-4 text-cm-accent" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-amber-500" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-cm-text">
                      {BOOST_PACKS.find((p) => p.type === boost.boost_type)?.label || boost.boost_type}
                    </p>
                    <p className="text-[10px] text-cm-text-soft">
                      {daysLeft > 0 ? `${daysLeft} jour${daysLeft > 1 ? "s" : ""} restant${daysLeft > 1 ? "s" : ""}` : "Expire aujourd'hui"}
                    </p>
                  </div>
                  <Clock className="w-3.5 h-3.5 text-cm-text-soft" />
                </div>
              );
            })}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="space-y-3"
        >
          <h2 className="text-[13px] font-bold text-cm-text">Type de boost</h2>
          <div className="flex flex-col gap-2">
            {BOOST_PACKS.map((pack) => {
              const Icon = pack.icon;
              const isSelected = selectedType === pack.type;
              return (
                <button
                  key={pack.type}
                  onClick={() => setSelectedType(pack.type)}
                  className={`flex items-start gap-3 p-4 rounded-[var(--radius-cm)] border text-left transition-all cursor-pointer ${
                    isSelected
                      ? "border-cm-accent bg-cm-accent-soft"
                      : "border-cm-border bg-cm-elevated hover:border-cm-text-muted"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-full bg-cm-accent-soft flex items-center justify-center shrink-0 ${isSelected ? "ring-2 ring-cm-accent" : ""}`}>
                    <Icon className={`w-4 h-4 ${pack.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-cm-text">{pack.label}</p>
                    <p className="text-[11px] text-cm-text-soft">{pack.desc}</p>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-cm-accent shrink-0 mt-1" />}
                </button>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-cm-elevated border border-cm-border rounded-[14px] p-4 space-y-3"
        >
          <h2 className="text-[13px] font-bold text-cm-text">Durée</h2>
          <div className="grid grid-cols-3 gap-2">
            {DURATIONS.map((d) => {
              const isSelected = selectedDuration === d.days;
              return (
                <button
                  key={d.days}
                  onClick={() => setSelectedDuration(d.days)}
                  className={`py-3 px-2 rounded-[var(--radius-cm)] border text-center transition-all cursor-pointer ${
                    isSelected
                      ? "border-cm-accent bg-cm-accent-soft"
                      : "border-cm-border hover:border-cm-text-muted"
                  }`}
                >
                  <p className={`text-[13px] font-bold ${isSelected ? "text-cm-accent" : "text-cm-text"}`}>{d.days}</p>
                  <p className={`text-[10px] ${isSelected ? "text-cm-accent" : "text-cm-text-soft"}`}>{d.label}</p>
                </button>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-cm-elevated border border-cm-border rounded-[14px] p-5 flex items-center justify-between"
        >
          <div>
            <p className="text-[11px] text-cm-text-soft">Prix total</p>
            <p className="text-[24px] font-bold text-cm-text font-mono">
              {price.toLocaleString("fr-FR")} F
            </p>
          </div>
          <button
            onClick={handlePurchase}
            disabled={purchasing || loading}
            className="h-11 px-6 bg-cm-accent text-cm-text-onAccent text-[12px] font-bold rounded-[var(--radius-cm)] hover:bg-cm-accent-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer active:scale-[0.97]"
          >
            {purchasing ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : success ? (
              <Check className="w-4 h-4" />
            ) : (
              "Acheter"
            )}
          </button>
        </motion.div>

        {success && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-[10px]"
          >
            <Check className="w-4 h-4 text-green-600 shrink-0" />
            <span className="text-[11px] text-green-700">Boost activé avec succès !</span>
          </motion.div>
        )}

        {loading && !purchasing && (
          <div className="flex items-center justify-center py-8">
            <Loader className="w-5 h-5 text-cm-accent animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
