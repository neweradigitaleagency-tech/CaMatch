import { motion } from "motion/react";
import { Power } from "lucide-react";

interface AvailabilityCardProps {
  isAvailable: boolean;
  todayJobsCount: number;
  pendingRequestsCount: number;
  onToggle: () => void;
}

export default function AvailabilityCard({
  isAvailable,
  todayJobsCount,
  pendingRequestsCount,
  onToggle,
}: AvailabilityCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-cm-elevated border border-cm-border rounded-[20px] p-4 shadow-sm mb-4"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-11 h-11 rounded-[14px] flex items-center justify-center shrink-0 transition-colors ${
              isAvailable ? "bg-green-50 text-green-600" : "bg-cm-surface text-cm-text-muted"
            }`}
          >
            <Power className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[15px] font-bold text-cm-text leading-tight truncate">
              {isAvailable ? "Vous êtes en ligne" : "Vous êtes hors ligne"}
            </p>
            <p className="text-[11px] text-cm-text-muted mt-0.5 truncate">
              {isAvailable
                ? "Visible par les clients, prêt à recevoir des demandes"
                : "Les clients ne vous voient pas actuellement"}
            </p>
          </div>
        </div>

        <button
          onClick={onToggle}
          role="switch"
          aria-checked={isAvailable}
          aria-label={isAvailable ? "Passer hors ligne" : "Passer en ligne"}
          className={`relative w-[54px] h-[30px] rounded-full shrink-0 cursor-pointer active:scale-95 transition-colors ${
            isAvailable ? "bg-green-500" : "bg-cm-border-soft"
          }`}
        >
          <motion.span
            initial={false}
            animate={{ x: isAvailable ? 24 : 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 32 }}
            className="absolute top-[3px] left-[3px] w-6 h-6 rounded-full bg-white shadow-sm"
          />
        </button>
      </div>

      <div className="flex items-center gap-2 mt-3">
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
            isAvailable ? "bg-green-50 text-green-700" : "bg-cm-surface text-cm-text-muted"
          }`}
        >
          {isAvailable ? "En ligne" : "Hors ligne"}
        </span>
        <span className="text-[11px] text-cm-text-muted">
          {todayJobsCount} mission{todayJobsCount > 1 ? "s" : ""} aujourd'hui
        </span>
        {pendingRequestsCount > 0 && (
          <span className="text-[11px] font-semibold text-cm-accent ml-auto">
            {pendingRequestsCount} demande{pendingRequestsCount > 1 ? "s" : ""} en attente
          </span>
        )}
      </div>
    </motion.div>
  );
}
