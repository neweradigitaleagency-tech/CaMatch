import { useState } from "react";
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Star, Briefcase, Users, Eye } from "lucide-react";

interface DashData {
  totalRevenue: number;
  revenueTrend: number;
  totalMissions: number;
  missionsTrend: number;
  averageRating: number;
  ratingTrend: number;
  totalClients: number;
  clientsTrend: number;
}

interface ProDashboardRefonteScreenProps {
  data: DashData;
  onBack: () => void;
  monthLabels: string[];
  revenueHistory: number[];
  missionHistory: number[];
  ratingHistory: number[];
}

export default function ProDashboardRefonteScreen({
  data, onBack, monthLabels, revenueHistory, missionHistory, ratingHistory,
}: ProDashboardRefonteScreenProps) {
  const [period, setPeriod] = useState<"7j" | "30j" | "12m">("30j");

  const periods = ["7j", "30j", "12m"] as const;

  const KpiCard = ({ title, value, suffix, trend, icon: Icon, color }: {
    title: string; value: string; suffix?: string; trend: number; icon: typeof DollarSign; color: string;
  }) => (
    <div className="bg-white rounded-2xl p-4 border border-pale-mint/20 shadow-sm flex-1 min-w-[calc(50%-6px)]">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className={`flex items-center gap-0.5 text-[10px] font-bold ${trend >= 0 ? "text-green-600" : "text-red-500"}`}>
          {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {trend > 0 ? "+" : ""}{trend}%
        </div>
      </div>
      <p className="text-[10px] text-secondary font-medium">{title}</p>
      <p className="text-lg font-extrabold mt-0.5">
        {value}
        {suffix && <span className="text-[10px] text-secondary font-medium ml-0.5">{suffix}</span>}
      </p>
    </div>
  );

  const Sparkline = ({ data, color = "#C2D939", height = 40 }: { data: number[]; color?: string; height?: number }) => {
    if (data.length === 0) return null;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const w = 120;
    const pts = data.map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    }).join(" ");
    return (
      <svg width={w} height={height} className="w-full h-auto">
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  };

  const ChartCard = ({ title, data, color, suffix }: {
    title: string; data: number[]; color?: string; suffix?: string;
  }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const w = 280;
    const h = 120;
    const pts = data.map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 20) - 10;
      return `${x},${y}`;
    }).join(" ");
    const areaPts = `0,${h} ${pts} ${w},${h}`;

    return (
      <div className="bg-white rounded-2xl p-4 border border-pale-mint/20 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold">{title}</h3>
          <span className="text-[9px] text-secondary">Dernière période</span>
        </div>
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
          <polygon points={areaPts} fill={`${color || "#C2D939"}20`} />
          <polyline points={pts} fill="none" stroke={color || "#C2D939"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {[0, Math.round(data.length / 2), data.length - 1].map(i => (
            <text key={i} x={(i / (data.length - 1)) * w} y={h - 2} textAnchor="middle" fill="#888" fontSize="6">
              {monthLabels[i]}
            </text>
          ))}
          {[0, Math.round((max + min) / 2), max].map((v, vi) => (
            <text key={vi} x={0} y={h - ((v - min) / range) * (h - 20) - 12} fill="#888" fontSize="6" textAnchor="start">
              {v.toLocaleString()}{suffix || ""}
            </text>
          ))}
        </svg>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-brand-cream pb-32">
      <header className="flex items-center justify-between px-4 py-3 bg-brand-cream/90 backdrop-blur-md sticky top-0 z-10">
        <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-full bg-white text-brand-forest hover:bg-pale-mint transition-colors shadow-sm cursor-pointer active:scale-95">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="font-sans text-sm font-bold">Mon Dashboard</h1>
        <div className="flex gap-1">
          {periods.map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-2.5 py-1 rounded-lg text-[9px] font-bold cursor-pointer active:scale-95 ${
                period === p ? "bg-brand-forest text-white" : "text-secondary"
              }`}
            >{p}</button>
          ))}
        </div>
      </header>

      {/* KPI Grid */}
      <div className="px-4 pt-4 flex flex-wrap gap-3">
        <KpiCard title="Revenus" value={data.totalRevenue.toLocaleString()} suffix="F" trend={data.revenueTrend} icon={DollarSign} color="bg-green-100 text-green-600" />
        <KpiCard title="Missions" value={data.totalMissions.toString()} trend={data.missionsTrend} icon={Briefcase} color="bg-blue-100 text-blue-600" />
        <KpiCard title="Satisfaction" value={data.averageRating.toFixed(1)} suffix="/5" trend={data.ratingTrend} icon={Star} color="bg-amber-100 text-amber-600" />
        <KpiCard title="Clients" value={data.totalClients.toString()} trend={data.clientsTrend} icon={Users} color="bg-purple-100 text-purple-600" />
      </div>

      {/* Mini sparklines row */}
      <div className="px-4 mt-4 flex gap-3 overflow-x-auto pb-1">
        <div className="bg-white rounded-2xl p-3 border border-pale-mint/20 shadow-sm flex-1 min-w-[130px]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[8px] text-secondary font-bold uppercase tracking-wider">Revenus</span>
            <Eye className="w-3 h-3 text-secondary/50" />
          </div>
          <Sparkline data={revenueHistory} color="#C2D939" />
        </div>
        <div className="bg-white rounded-2xl p-3 border border-pale-mint/20 shadow-sm flex-1 min-w-[130px]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[8px] text-secondary font-bold uppercase tracking-wider">Missions</span>
            <Eye className="w-3 h-3 text-secondary/50" />
          </div>
          <Sparkline data={missionHistory} color="#8B5CF6" />
        </div>
        <div className="bg-white rounded-2xl p-3 border border-pale-mint/20 shadow-sm flex-1 min-w-[130px]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[8px] text-secondary font-bold uppercase tracking-wider">Avis</span>
            <Eye className="w-3 h-3 text-secondary/50" />
          </div>
          <Sparkline data={ratingHistory} color="#F59E0B" />
        </div>
      </div>

      {/* Full charts */}
      <div className="px-4 mt-4 space-y-3">
        <ChartCard title="Évolution des revenus" data={revenueHistory} color="#C2D939" suffix="F" />
        <ChartCard title="Évolution des missions" data={missionHistory} color="#8B5CF6" />
        <ChartCard title="Évolution des avis" data={ratingHistory} color="#F59E0B" suffix="/5" />
      </div>
    </div>
  );
}
