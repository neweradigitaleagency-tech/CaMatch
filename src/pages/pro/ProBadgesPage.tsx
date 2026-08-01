import { useNavigate } from "react-router-dom";
import { useBackNavigation } from "../../hooks/useBackNavigation";
import { motion } from "motion/react";
import { ArrowLeft, Trophy, Star, Lock, Award, Check } from "lucide-react";
import { PRO_LEVELS, getProLevel } from "../../types";
import { MOCK_BADGES } from "../../services/mockData";

const CURRENT_XP = 4200;

export default function ProBadgesPage() {
  const nav = useNavigate();
  const goBack = useBackNavigation("/pro/dashboard");
  const currentLevel = getProLevel(CURRENT_XP);
  const nextLevel = PRO_LEVELS.find((l) => l.level !== currentLevel.level && l.minXP > currentLevel.minXP);
  const nextMinXP = nextLevel?.minXP ?? currentLevel.maxXP;
  const progress = ((CURRENT_XP - currentLevel.minXP) / (nextMinXP - currentLevel.minXP)) * 100;

  return (
    <div className="min-h-dynamic bg-[#F5F5F0]">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-lg border-b border-cm-border">
        <div className="flex items-center h-14 px-4 gap-3 max-w-[448px] mx-auto">
          <button onClick={goBack} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-cm-surface cursor-pointer active:scale-95">
            <ArrowLeft className="w-5 h-5 text-cm-text" />
          </button>
          <h1 className="text-[16px] font-bold text-cm-text">Badges & Progression</h1>
        </div>
      </header>

      <div className="w-full max-w-[448px] mx-auto px-4 pt-4 pb-24 space-y-4">
        {/* Current level card */}
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-cm-border rounded-[20px] p-5 text-center shadow-sm">
          <div className={`w-16 h-16 rounded-full bg-cm-surface flex items-center justify-center mx-auto mb-2 text-3xl`}>
            {currentLevel.emoji}
          </div>
          <p className="text-[11px] text-cm-text-muted mb-0.5">Niveau actuel</p>
          <h2 className={`text-[22px] font-bold ${currentLevel.color}`}>{currentLevel.label}</h2>
          <div className="flex items-center justify-center gap-1 mt-1 text-[12px] text-cm-text-muted">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="font-semibold">{CURRENT_XP} XP</span>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-[11px] text-cm-text-muted mb-1">
              <span>{currentLevel.minXP} XP</span>
              <span>{nextMinXP.toLocaleString("fr-FR")} XP</span>
            </div>
            <div className="w-full h-2 bg-cm-surface rounded-full overflow-hidden">
              <div className="h-full bg-cm-text rounded-full transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />
            </div>
            {nextLevel ? (
              <p className="text-[11px] text-cm-text-muted mt-1">Prochain niveau: {nextLevel.emoji} {nextLevel.label} ({nextMinXP.toLocaleString("fr-FR")} XP)</p>
            ) : (
              <p className="text-[11px] text-cm-text-muted mt-1">Niveau maximum atteint</p>
            )}
          </div>
        </motion.div>

        {/* Niveaux */}
        <h2 className="text-[13px] font-bold text-cm-text">Niveaux</h2>
        <div className="space-y-2">
          {PRO_LEVELS.map((level, i) => {
            const isUnlocked = CURRENT_XP >= level.minXP;
            return (
              <motion.div key={level.level} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className={`bg-white border rounded-[14px] p-4 flex items-center gap-3 shadow-sm ${
                  isUnlocked ? "border-cm-border" : "border-cm-surface opacity-55"
                }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                  isUnlocked ? "bg-cm-surface" : "bg-cm-surface"
                }`}>
                  {level.emoji}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className={`text-[13px] font-bold ${isUnlocked ? "text-cm-text" : "text-cm-text-muted"}`}>
                      {level.label}
                    </p>
                    <span className="text-[10px] text-cm-text-muted">{level.minXP.toLocaleString("fr-FR")}-{level.maxXP === Infinity ? "∞" : level.maxXP.toLocaleString("fr-FR")} XP</span>
                  </div>
                  <p className="text-[10px] text-cm-text-muted mt-0.5">Commission {level.commissionPercent}% · {level.benefits[0]}</p>
                  {isUnlocked && (
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 mt-1">
                      <Check className="w-2.5 h-2.5" /> Débloqué
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Badges */}
        <h2 className="text-[13px] font-bold text-cm-text pt-2">Badges</h2>
        <div className="grid grid-cols-2 gap-3">
          {MOCK_BADGES.map((badge, i) => (
            <motion.div key={badge.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
              className={`bg-white border rounded-[14px] p-4 text-center shadow-sm ${
                badge.unlocked ? "border-cm-border" : "border-cm-surface opacity-55"
              }`}>
              <span className="text-2xl block mb-2">{badge.icon}</span>
              <p className={`text-[12px] font-bold ${badge.unlocked ? "text-cm-text" : "text-cm-text-muted"}`}>{badge.name}</p>
              <p className="text-[10px] text-cm-text-muted mt-0.5">{badge.description}</p>
              {!badge.unlocked && <Lock className="w-3 h-3 text-cm-border-soft mx-auto mt-1" />}
              {badge.unlocked && <Check className="w-3 h-3 text-emerald-500 mx-auto mt-1" />}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
