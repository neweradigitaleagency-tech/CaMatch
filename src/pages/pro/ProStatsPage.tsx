import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, TrendingUp, BarChart3, Star, Users } from "lucide-react";
import { MOCK_REVENUE_HISTORY, MOCK_MISSION_HISTORY, MOCK_RATING_HISTORY, MOCK_DASH_DATA, MONTH_LABELS } from "../../services/mockData";

function BarChart({
  data,
  label,
  color = "bg-cm-accent",
}: {
  data: number[];
  label: string;
  color?: string;
}) {
  const max = Math.max(...data, 1);
  return (
    <div>
      <p className="text-[11px] text-cm-text-muted mb-2">{label}</p>
      <div className="flex items-end justify-between h-24 gap-1.5">
        {data.map((val, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[8px] font-mono text-cm-text-muted">{val}</span>
            <div
              className={`w-full rounded-t-sm ${color} ${i === data.length - 1 ? "opacity-100" : "opacity-50"}`}
              style={{ height: `${(val / max) * 100}%`, minHeight: 4 }}
            />
            <span className="text-[8px] text-cm-text-muted">{MONTH_LABELS[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProStatsPage() {
  const nav = useNavigate();

  return (
    <div className="min-h-dynamic bg-cm-bg">
      <div className="sticky top-0 z-10 bg-cm-elevated/80 backdrop-blur-lg border-b border-cm-border">
        <div className="flex items-center h-14 px-5 gap-3">
          <button type="button" onClick={() => nav(-1)} className="p-1 -ml-1 cursor-pointer active:scale-[0.97]">
            <ArrowLeft className="w-5 h-5 text-cm-text" />
          </button>
          <h1 className="text-[18px] font-bold text-cm-text">Statistiques</h1>
        </div>
      </div>

      <div className="w-full max-w-[448px] mx-auto px-5 pt-4 pb-24 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-3"
        >
          <div className="bg-cm-elevated border border-cm-border rounded-[14px] p-4">
            <TrendingUp className="w-4 h-4 text-cm-accent mb-1" />
            <p className="text-[11px] text-cm-text-muted">Revenus total</p>
            <p className="text-[18px] font-bold text-cm-text font-mono">
              {MOCK_DASH_DATA.totalRevenue.toLocaleString("fr-FR")} F
            </p>
            <span className="text-[10px] text-green-500">+{MOCK_DASH_DATA.revenueTrend}%</span>
          </div>
          <div className="bg-cm-elevated border border-cm-border rounded-[14px] p-4">
            <BarChart3 className="w-4 h-4 text-cm-accent mb-1" />
            <p className="text-[11px] text-cm-text-muted">Missions</p>
            <p className="text-[18px] font-bold text-cm-text">{MOCK_DASH_DATA.totalMissions}</p>
            <span className="text-[10px] text-green-500">+{MOCK_DASH_DATA.missionsTrend}%</span>
          </div>
          <div className="bg-cm-elevated border border-cm-border rounded-[14px] p-4">
            <Star className="w-4 h-4 text-amber-500 mb-1" />
            <p className="text-[11px] text-cm-text-muted">Note moyenne</p>
            <p className="text-[18px] font-bold text-cm-text">{MOCK_DASH_DATA.averageRating}</p>
            <span className="text-[10px] text-green-500">{MOCK_DASH_DATA.ratingTrend}%</span>
          </div>
          <div className="bg-cm-elevated border border-cm-border rounded-[14px] p-4">
            <Users className="w-4 h-4 text-blue-500 mb-1" />
            <p className="text-[11px] text-cm-text-muted">Clients</p>
            <p className="text-[18px] font-bold text-cm-text">{MOCK_DASH_DATA.totalClients}</p>
            <span className="text-[10px] text-green-500">+{MOCK_DASH_DATA.clientsTrend}%</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-cm-elevated border border-cm-border rounded-[14px] p-4"
        >
          <BarChart data={MOCK_REVENUE_HISTORY} label="Revenus (FCFA)" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-cm-elevated border border-cm-border rounded-[14px] p-4"
        >
          <BarChart data={MOCK_MISSION_HISTORY} label="Missions" color="bg-blue-500" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-cm-elevated border border-cm-border rounded-[14px] p-4"
        >
          <BarChart data={MOCK_RATING_HISTORY} label="Note moyenne" color="bg-amber-500" />
        </motion.div>
      </div>
    </div>
  );
}
