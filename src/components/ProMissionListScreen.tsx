import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, CalendarDays, MapPin, DollarSign, UserIcon, ChevronRight, Clock } from "lucide-react";
import StatusBadge from "./ui/StatusBadge";
import type { Mission, MissionStatus } from "../types";
import { MISSION_STATUS_ORDER } from "../types";

interface ProMissionListScreenProps {
  missions: Mission[];
  onBack: () => void;
  onSelectMission: (mission: Mission) => void;
}

type TabFilter = "all" | "active" | "completed";

const ACTIVE_STATUSES: MissionStatus[] = ["accepted", "en_route", "in_progress"];
const COMPLETED_STATUSES: MissionStatus[] = ["completed", "paid", "reviewed"];

function formatXOF(amount: number): string {
  return amount.toLocaleString("fr-FR") + " FCFA";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

function getCurrentStepIndex(status: MissionStatus): number {
  return MISSION_STATUS_ORDER.indexOf(status);
}

export default function ProMissionListScreen({ missions, onBack, onSelectMission }: ProMissionListScreenProps) {
  const [tab, setTab] = useState<TabFilter>("active");

  const filtered = missions.filter((m) => {
    if (tab === "all") return true;
    if (tab === "active") return ACTIVE_STATUSES.includes(m.status);
    if (tab === "completed") return COMPLETED_STATUSES.includes(m.status);
    return true;
  });

  return (
    <div className="flex flex-col w-full min-h-screen bg-cm-bg pb-32">
      <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-10 bg-cm-elevated border-b border-cm-border">
        <button onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-full text-cm-text hover:bg-cm-accent-soft transition-colors cursor-pointer active:scale-95">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[14px] font-display font-bold text-cm-text">Mes missions</h1>
        <div className="w-10" />
      </header>

      <div className="flex gap-2 px-4 pt-4 pb-3 border-b border-cm-border">
        {(["active", "completed", "all"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-full text-[12px] font-medium font-display transition-all cursor-pointer active:scale-95 ${
              tab === t
                ? "bg-cm-text text-cm-bg"
                : "bg-cm-elevated text-cm-text-soft border border-cm-border hover:bg-cm-accent-soft"
            }`}>
            {t === "active" ? "En cours" : t === "completed" ? "Terminées" : "Toutes"}
          </button>
        ))}
      </div>

      <div className="flex-1 px-4 pt-4 space-y-3">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-cm-accent-soft flex items-center justify-center mb-4">
              <CalendarDays className="w-7 h-7 text-cm-text-soft" />
            </div>
            <p className="text-[14px] font-display font-bold text-cm-text mb-1">Aucune mission</p>
            <p className="text-[12px] text-cm-text-soft">Les missions apparaîtront ici une fois acceptées.</p>
          </div>
        )}

        {filtered.map((mission, idx) => {
          const stepIdx = getCurrentStepIndex(mission.status);
          return (
            <motion.button
              key={mission.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => onSelectMission(mission)}
              className="w-full text-left bg-cm-elevated rounded-2xl p-4 border border-cm-border cursor-pointer active:scale-[0.98] transition-all hover:border-cm-text/20"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-cm-accent-soft flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-cm-accent" />
                  </div>
                  <div>
                    <p className="text-[14px] font-display font-bold text-cm-text">{mission.clientName || mission.proName}</p>
                    <p className="text-[11px] text-cm-text-soft flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" />
                      {formatDate(mission.createdAt)}
                    </p>
                  </div>
                </div>
                <StatusBadge status={mission.status} />
              </div>

              <p className="text-[13px] text-cm-text ml-10.5 mb-2 line-clamp-1">{mission.title}</p>

              <div className="flex items-center gap-3 ml-10.5">
                <span className="flex items-center gap-1 text-[11px] font-mono text-cm-text-soft">
                  <MapPin className="w-3 h-3" />
                  {mission.address}
                </span>
              </div>

              <div className="flex items-center justify-between mt-3 ml-10.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[12px] font-mono font-bold text-cm-text">
                    {formatXOF(mission.budgetXOF)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {["accepted", "en_route", "in_progress", "completed"].map((s, i) => (
                    <div key={s}
                      className={`w-1.5 h-1.5 rounded-full ${
                        i <= stepIdx ? "bg-cm-accent" : "bg-cm-border"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
