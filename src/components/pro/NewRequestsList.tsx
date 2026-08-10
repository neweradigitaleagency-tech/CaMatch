import { motion } from "motion/react";
import { Clock, Coins, MapPin, XCircle, Check } from "lucide-react";
import type { ProAlert } from "../../types";

interface NewRequestsListProps {
  alerts: ProAlert[];
  onAccept: (id: string) => void;
  onRefuse: (id: string) => void;
  onOpenDetail: (alert: ProAlert) => void;
}

export default function NewRequestsList({ alerts, onAccept, onRefuse, onOpenDetail }: NewRequestsListProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-3 mb-4">
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        <h2 className="text-[13px] font-bold text-cm-text-soft uppercase tracking-wider">Nouvelles missions</h2>
        <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">{alerts.length}</span>
      </div>

      {alerts.map((alert) => (
        <motion.div
          key={alert.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-cm-elevated border border-cm-border rounded-[20px] p-4 shadow-sm cursor-pointer active:scale-[0.99] transition-transform"
          onClick={() => onOpenDetail(alert)}
        >
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-[10px] text-white font-bold">N</span>
            </div>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Nouvelle mission</span>
            <span className="text-[9px] text-cm-text-muted ml-auto">Il y a 10 s</span>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-cm-surface flex items-center justify-center text-[16px]">👤</div>
            <p className="text-[14px] font-bold text-cm-text">{alert.clientName}</p>
          </div>

          <p className="text-[12px] font-semibold text-cm-text mb-2 line-clamp-1">{alert.description}</p>

          <div className="flex items-center gap-3 text-[11px] text-cm-text-soft mb-3">
            <span className="flex items-center gap-1 min-w-0">
              <MapPin className="w-3 h-3 text-cm-text-muted shrink-0" /> <span className="truncate">{alert.location}</span>
            </span>
            <span className="flex items-center gap-1 shrink-0">
              <Clock className="w-3 h-3 text-cm-text-muted" /> 7 min
            </span>
            <span className="flex items-center gap-1 font-bold text-cm-text ml-auto shrink-0">
              <Coins className="w-3 h-3" /> {alert.estimatedPriceMinXOF.toLocaleString("fr-FR")} F
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); onRefuse(alert.id); }}
              className="flex-1 h-11 rounded-[12px] border-2 border-red-100 text-red-500 text-[12px] font-bold cursor-pointer active:scale-[0.97] transition-transform hover:bg-red-50 flex items-center justify-center gap-1.5"
            >
              <XCircle className="w-4 h-4" /> Refuser
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onAccept(alert.id); }}
              className="flex-1 h-11 rounded-[12px] bg-cm-text text-white text-[12px] font-bold cursor-pointer active:scale-[0.97] transition-transform hover:bg-cm-text/90 flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Check className="w-4 h-4" /> Accepter
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
