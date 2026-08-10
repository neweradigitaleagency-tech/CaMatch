import { motion } from "motion/react";
import { ShieldCheck, ChevronRight, Check, Circle } from "lucide-react";
import type { ProVerification } from "../../types";

interface ProfileProgressCardProps {
  verification: ProVerification;
  level: { emoji: string; label: string; color: string };
  xpPercent: number;
  nextLevelLabel: string | null;
  nextLevelXp: number;
  onOpen: () => void;
}

export default function ProfileProgressCard({
  verification,
  level,
  xpPercent,
  nextLevelLabel,
  nextLevelXp,
  onOpen,
}: ProfileProgressCardProps) {
  const steps: { key: string; label: string; status: string }[] = [
    { key: "cni", label: "Pièce d'identité", status: verification.cniStatus },
    { key: "background", label: "Casier judiciaire", status: verification.backgroundStatus },
    { key: "cert", label: "Certificat de qualification", status: verification.certStatus },
  ];

  const done = steps.filter((s) => s.status === "approved").length;
  const percent = Math.round((done / steps.length) * 100);
  const complete = percent === 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 }}
      className="bg-cm-elevated border border-cm-border rounded-[20px] p-4 shadow-sm mb-4"
    >
      <button onClick={onOpen} className="w-full flex items-center justify-between cursor-pointer group">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cm-text" />
          <span className="text-[14px] font-bold text-cm-text">Profil & vérifications</span>
        </div>
        <ChevronRight className="w-4 h-4 text-cm-text-muted group-hover:text-cm-text-soft transition-colors" />
      </button>

      <div className="flex items-center gap-3 mt-3 mb-1">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-medium text-cm-text-soft">
              {complete ? "Profil vérifié à 100%" : `${percent}% du profil complété`}
            </span>
            <span className="text-[11px] font-bold text-cm-text">{percent}%</span>
          </div>
          <div className="w-full h-2 bg-cm-border-soft rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`h-full rounded-full ${complete ? "bg-green-500" : "bg-cm-text"}`}
            />
          </div>
        </div>
      </div>

      <div className="space-y-1.5 mt-3">
        {steps.map((s) => {
          const isDone = s.status === "approved";
          return (
            <div key={s.key} className="flex items-center gap-2">
              {isDone ? (
                <span className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 text-white" />
                </span>
              ) : (
                <span className="w-4 h-4 rounded-full border-2 border-cm-border-soft flex items-center justify-center shrink-0">
                  <Circle className="w-1.5 h-1.5 text-cm-border-soft" />
                </span>
              )}
              <span className={`text-[12px] ${isDone ? "text-cm-text" : "text-cm-text-muted"}`}>{s.label}</span>
              <span
                className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isDone ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                }`}
              >
                {isDone ? "Vérifié" : "À compléter"}
              </span>
            </div>
          );
        })}
      </div>

      <div className="bg-cm-surface rounded-[12px] p-3 mt-3">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[13px]">{level.emoji}</span>
            <span className="text-[11px] font-medium text-cm-text-soft">Niveau {level.label}</span>
          </div>
          <span className="text-[10px] font-bold text-cm-text">
            {nextLevelLabel ? `${nextLevelXp} XP → ${nextLevelLabel}` : "Niveau max"}
          </span>
        </div>
        <div className="w-full h-2.5 bg-cm-border-soft rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${xpPercent}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`h-full rounded-full ${nextLevelLabel ? "bg-cm-text" : "bg-amber-500"}`}
          />
        </div>
      </div>
    </motion.div>
  );
}
