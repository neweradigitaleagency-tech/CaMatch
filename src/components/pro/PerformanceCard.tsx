import { motion } from "motion/react";
import { BarChart3, Lock, TrendingUp, CalendarDays, Star } from "lucide-react";

interface PerformanceCardProps {
  isFree: boolean;
  missionsTrend: number;
  ratingTrend: number;
  responseMinutes: number;
  completionRate: number;
  reviewsToBadge: number;
  reviewProgressPercent: number;
  onUpgrade: () => void;
}

export default function PerformanceCard({
  isFree,
  missionsTrend,
  ratingTrend,
  responseMinutes,
  completionRate,
  reviewsToBadge,
  reviewProgressPercent,
  onUpgrade,
}: PerformanceCardProps) {
  if (isFree) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-cm-elevated border border-amber-200 rounded-[20px] p-4 shadow-sm mb-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-4 h-4 text-amber-500" />
          <span className="text-[14px] font-bold text-cm-text">Analytics</span>
        </div>
        <div className="bg-amber-50 rounded-[14px] p-4 text-center mb-3">
          <Lock className="w-8 h-8 text-amber-400 mx-auto mb-2" />
          <p className="text-[13px] font-semibold text-cm-text mb-1">Statistiques Premium</p>
          <p className="text-[11px] text-cm-text-soft mb-3">
            Passez à une formule supérieure pour accéder à vos analytics, suivi de revenus et indicateurs de performance.
          </p>
          <button
            onClick={onUpgrade}
            className="h-9 px-4 bg-amber-500 text-white text-[11px] font-bold rounded-xl cursor-pointer active:scale-[0.97] transition-transform hover:brightness-105 shadow-sm"
          >
            Passer Premium
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-cm-elevated border border-cm-border rounded-[20px] p-4 shadow-sm mb-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="w-4 h-4 text-cm-text" />
        <span className="text-[14px] font-bold text-cm-text">Performance</span>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { label: "Réponse", value: `${responseMinutes} min`, icon: TrendingUp, color: "text-cm-text", bg: "bg-cm-surface" },
          { label: "Missions", value: `${missionsTrend}%`, icon: CalendarDays, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Avis", value: `${ratingTrend}%`, icon: Star, color: "text-amber-600", bg: "bg-amber-50" },
        ].map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className={`${m.bg} rounded-[12px] p-3 text-center`}>
              <Icon className={`w-4 h-4 ${m.color} mx-auto mb-1`} />
              <p className="text-[14px] font-extrabold text-cm-text">{m.value}</p>
              <p className="text-[8px] text-cm-text-muted uppercase tracking-wider">{m.label}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-cm-surface rounded-[12px] p-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center shrink-0">
          <Star className="w-4 h-4 text-green-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-medium text-cm-text-soft">
            Encore <span className="font-bold text-cm-text">{reviewsToBadge} avis 5★</span> pour le badge Premium
          </p>
          <div className="w-full h-1.5 bg-cm-border-soft rounded-full mt-1.5 overflow-hidden">
            <div className="h-full bg-green-500 rounded-full" style={{ width: `${reviewProgressPercent}%` }} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
