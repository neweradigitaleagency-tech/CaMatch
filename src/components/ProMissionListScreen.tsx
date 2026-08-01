import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, CalendarDays, MapPin, Coins, UserIcon } from "lucide-react";
import type { Mission, MissionStatus } from "../types";
import { MISSION_STATUS_FLOW } from "../types";

const STATUS_CONFIG: Record<string, { border: string; dot: string; badge: string }> = {
  pending:        { border: "border-l-amber-400",  dot: "bg-amber-400",  badge: "bg-amber-50 text-amber-700" },
  accepted:       { border: "border-l-emerald-500", dot: "bg-emerald-500",badge: "bg-emerald-50 text-emerald-700" },
  quote_requested:{ border: "border-l-violet-500",  dot: "bg-violet-500", badge: "bg-violet-50 text-violet-700" },
  quote_sent:     { border: "border-l-blue-500",    dot: "bg-blue-500",   badge: "bg-blue-50 text-blue-700" },
  quote_accepted: { border: "border-l-teal-500",    dot: "bg-teal-500",   badge: "bg-teal-50 text-teal-700" },
  paid:           { border: "border-l-emerald-500", dot: "bg-emerald-500",badge: "bg-emerald-50 text-emerald-700" },
  en_route:       { border: "border-l-blue-500",    dot: "bg-blue-500",   badge: "bg-blue-50 text-blue-700" },
  arrived:        { border: "border-l-sky-500",     dot: "bg-sky-500",    badge: "bg-sky-50 text-sky-700" },
  in_progress:    { border: "border-l-orange-500",  dot: "bg-orange-500", badge: "bg-orange-50 text-orange-700" },
  completed:      { border: "border-l-cm-text-muted",    dot: "bg-cm-text-muted",   badge: "bg-cm-surface text-cm-text-soft" },
  client_validation: { border: "border-l-teal-500", dot: "bg-teal-500",  badge: "bg-teal-50 text-teal-700" },
  client_validated:{ border: "border-l-emerald-500",dot: "bg-emerald-500",badge: "bg-emerald-50 text-emerald-700" },
  closed:         { border: "border-l-cm-text",    dot: "bg-cm-text",   badge: "bg-cm-surface text-cm-text" },
  cancelled:      { border: "border-l-red-500",     dot: "bg-red-500",    badge: "bg-red-50 text-red-700" },
  disputed:       { border: "border-l-red-500",     dot: "bg-red-500",    badge: "bg-red-50 text-red-700" },
  refunded:       { border: "border-l-red-500",     dot: "bg-red-500",    badge: "bg-red-50 text-red-700" },
  refused:        { border: "border-l-red-300",     dot: "bg-red-300",    badge: "bg-red-50 text-red-500" },
  draft:          { border: "border-l-cm-border-soft",    dot: "bg-cm-border-soft",   badge: "bg-cm-surface text-cm-text-muted" },
  published:      { border: "border-l-blue-400",    dot: "bg-blue-400",   badge: "bg-blue-50 text-blue-600" },
  created:        { border: "border-l-cm-border-soft",    dot: "bg-cm-border-soft",   badge: "bg-cm-surface text-cm-text-muted" },
  reviewed:       { border: "border-l-cm-text",    dot: "bg-cm-text",   badge: "bg-cm-surface text-cm-text" },
};

interface ProMissionListScreenProps {
  missions: Mission[];
  onBack: () => void;
  onSelectMission: (mission: Mission) => void;
}

type TabFilter = "all" | "active" | "completed";

const ACTIVE_STATUSES: MissionStatus[] = ["accepted", "en_route", "in_progress"];
const COMPLETED_STATUSES: MissionStatus[] = ["completed", "paid", "client_validated"];

function formatXOF(amount: number): string {
  return amount.toLocaleString("fr-FR") + " F";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

function getCurrentStepIndex(status: MissionStatus): number {
  return MISSION_STATUS_FLOW.indexOf(status);
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
    <div className="flex flex-col w-full min-h-dynamic bg-cm-bg pb-32">
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

        {(() => {
          const jobs = filtered;
          return jobs.map((mission, idx) => {
            const cfg = STATUS_CONFIG[mission.status]!;
            return (
              <div key={mission.id} className="relative flex gap-3">
                {/* Timeline column */}
                <div className="flex flex-col items-center w-5 shrink-0">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15, delay: idx * 0.06 }}
                    className={`w-3 h-3 rounded-full border-2 border-white shadow-sm z-10 ${cfg.dot}`}
                  />
                  {idx < jobs.length - 1 && (
                    <motion.div
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ duration: 0.3, delay: idx * 0.06 + 0.08 }}
                      className="w-0.5 flex-1 min-h-[16px] bg-cm-border-soft origin-top"
                    />
                  )}
                </div>

                {/* Card */}
                <motion.button
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.06, type: "spring", damping: 20, stiffness: 200 }}
                  onClick={() => onSelectMission(mission)}
                  className={`flex-1 text-left bg-cm-elevated rounded-2xl p-4 cursor-pointer shadow-sm ${cfg.border} hover:shadow-md active:scale-[0.98] transition-all`}
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
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15, delay: idx * 0.06 + 0.12 }}
                      className={`inline-flex items-center h-6 px-2.5 rounded-[9999px] text-[11px] font-semibold ${cfg.badge}`}
                    >
                      {mission.status === "pending" ? "En attente" :
                       mission.status === "accepted" ? "Acceptée" :
                       mission.status === "quote_requested" ? "En attente de devis" :
                       mission.status === "quote_sent" ? "Devis envoyé" :
                       mission.status === "quote_accepted" ? "Devis accepté" :
                       mission.status === "paid" ? "Payée" :
                       mission.status === "in_progress" ? "En cours" :
                       mission.status === "completed" ? "Terminée" :
                       mission.status === "client_validation" ? "Validation client" :
                       mission.status === "client_validated" ? "Validée" :
                       mission.status === "closed" ? "Clôturée" :
                       mission.status === "cancelled" ? "Annulée" :
                       mission.status === "refunded" ? "Remboursée" :
                       mission.status === "disputed" ? "En litige" :
                       mission.status === "refused" ? "Refusée" :
                       mission.status === "en_route" ? "En route" :
                       mission.status === "arrived" ? "Arrivé" :
                       mission.status}
                    </motion.span>
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
                      {["accepted", "en_route", "in_progress", "completed"].map((s, i) => {
                        const flowIdx = getCurrentStepIndex(mission.status);
                        return (
                          <div key={s}
                            className={`w-1.5 h-1.5 rounded-full ${
                              i <= flowIdx ? "bg-cm-accent" : "bg-cm-border"
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </motion.button>
              </div>
            );
          });
        })()}
      </div>
    </div>
  );
}
