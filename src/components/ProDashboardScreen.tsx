import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  DollarSign,
  CalendarCheck,
  Clock,
  Star,
  MapPin,
  Phone,
  MessageSquare,
  ChevronRight,
  Bell,
  Power,
  TrendingUp,
  TrendingDown,
  Briefcase,
  UserIcon,
  Check,
  Eye,
  Wallet,
} from "lucide-react";
import {
  ProfessionalDetails,
  ProJob,
  ProAlert,
  ProDashboardStats,
} from "../types";

const DASHBOARD_STEPS = ["accepted", "en_route", "in_progress", "completed"];

interface Props {
  pro: ProfessionalDetails;
  stats: ProDashboardStats;
  todayJobs: ProJob[];
  alerts: ProAlert[];
  available: boolean;
  onToggleAvailability: () => void;
  onViewJob: (job: ProJob) => void;
  onAcceptAlert: (alert: ProAlert) => void;
  onDeclineAlert: (alert: ProAlert) => void;
  onOpenChat?: (clientName: string) => void;
  /** Optional chart data for advanced dashboard */
  revenueHistory?: number[];
  missionHistory?: number[];
  ratingHistory?: number[];
  monthLabels?: string[];
}

export default function ProDashboardScreen({
  pro,
  stats,
  todayJobs,
  alerts,
  available,
  onToggleAvailability,
  onViewJob,
  onAcceptAlert,
  onDeclineAlert,
  revenueHistory = [120000, 180000, 150000, 220000, 195000, 245000],
  missionHistory = [18, 22, 20, 25, 23, 28],
  ratingHistory = [4.2, 4.4, 4.3, 4.5, 4.6, 4.7],
  monthLabels = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun"],
}: Props) {
  const [currentAlertIndex, setCurrentAlertIndex] = useState(0);
  const [period, setPeriod] = useState<"7j" | "30j" | "12m">("30j");

  const currentAlert = alerts.length > 0 ? alerts[currentAlertIndex] : null;

  const kpiData = [
    {
      title: "Revenus", value: stats.monthEarningsXOF.toLocaleString(), suffix: "F",
      trend: 12, icon: DollarSign, color: "bg-cm-success/10 text-cm-success",
    },
    {
      title: "Missions", value: stats.totalJobsCompleted.toString(),
      trend: 8, icon: Briefcase, color: "bg-cm-info/10 text-cm-info",
    },
    {
      title: "Satisfaction", value: (stats.rating / 10).toFixed(1), suffix: "/5",
      trend: 2, icon: Star, color: "bg-cm-warning/10 text-cm-warning",
    },
    {
      title: "Clients", value: stats.reviewCount.toString(),
      trend: 15, icon: UserIcon, color: "bg-cm-purple/10 text-cm-purple",
    },
  ];

  return (
    <div className="px-5 py-5 pb-32 space-y-5 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-cm-green shrink-0">
            <img alt={pro.name} className="w-full h-full object-cover" src={pro.avatarUrl} />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-brand-forest leading-tight">{pro.name}</h2>
            <p className="text-caption text-secondary font-bold uppercase tracking-wider">{pro.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-pale-mint px-3 py-1.5 rounded-full">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="text-xs font-bold">{(pro.rating / 10).toFixed(1)}</span>
        </div>
      </div>

      {/* Availability Toggle */}
      <div
        className={`p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-colors ${
          available ? "bg-cm-green/15 border border-cm-green/30" : "bg-cm-error/10 border border-cm-error/30"
        }`}
        onClick={onToggleAvailability}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${available ? "bg-cm-green" : "bg-red-200"}`}>
            <Power className={`w-5 h-5 ${available ? "text-white" : "text-red-600"}`} />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider">
              {available ? "Disponible" : "Indisponible"}
            </h4>
            <p className="text-caption text-secondary mt-0.5">
              {available ? "Vous recevez les alertes de missions" : "Vous ne recevez pas de nouvelles missions"}
            </p>
          </div>
        </div>
        <div className={`relative w-12 h-7 rounded-full transition-colors ${available ? "bg-cm-green" : "bg-pale-mint"}`}>
          <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
            available ? "translate-x-5.5 left-0.5" : "translate-x-0.5 left-0"
          }`} />
        </div>
      </div>

      {/* Incoming Alerts */}
      <AnimatePresence>
        {currentAlert && (
          <motion.div
            key={currentAlert.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="bg-brand-forest text-white p-5 rounded-2xl space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center animate-pulse">
                  <Bell className="w-4 h-4 text-white" />
                </div>
                <span className="text-caption font-medium text-cm-green uppercase tracking-wider">Nouvelle mission</span>
              </div>
              <span className={`text-caption font-medium px-2 py-1 rounded-full ${
                currentAlert.urgency === "emergency" ? "bg-red-500/20 text-red-400" :
                currentAlert.urgency === "high" ? "bg-amber-500/20 text-amber-400" :
                "bg-white/10 text-white/70"
              }`}>
                {currentAlert.urgency === "emergency" ? "URGENT" : currentAlert.urgency === "high" ? "Prioritaire" : "Standard"}
              </span>
            </div>
            <div>
              <h3 className="text-base font-bold">{currentAlert.clientName}</h3>
              <p className="text-xs text-white/70 mt-0.5">{currentAlert.description}</p>
            </div>
            <div className="flex items-center gap-4 text-caption text-white/70">
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {currentAlert.location}</span>
              <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {currentAlert.clientPhone}</span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-caption text-white/50 uppercase tracking-wider">Estimation</p>
                <p className="text-sm font-extrabold text-cm-green">
                  {currentAlert.estimatedPriceMinXOF.toLocaleString()} - {currentAlert.estimatedPriceMaxXOF.toLocaleString()} F CFA
                </p>
              </div>
              <CountdownTimer expiresAt={currentAlert.expiresAt} onExpire={() => onDeclineAlert(currentAlert)} />
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => onAcceptAlert(currentAlert)}
                className="flex-1 bg-cm-green text-white font-extrabold text-xs py-3 rounded-xl uppercase tracking-wider hover:brightness-110 transition-all active:scale-95 cursor-pointer">
                Accepter
              </button>
              <button onClick={() => { onDeclineAlert(currentAlert); if (currentAlertIndex < alerts.length - 1) setCurrentAlertIndex((i) => i + 1); }}
                className="flex-1 bg-white/10 text-white font-extrabold text-xs py-3 rounded-xl uppercase tracking-wider hover:bg-white/20 transition-all active:scale-95 cursor-pointer">
                Refuser
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KPI Cards Grid */}
      <div className="flex flex-wrap gap-3">
        {kpiData.map((kpi) => (
          <div key={kpi.title} className="bg-white rounded-xl p-3.5 border border-pale-mint/20 shadow-sm flex-1 min-w-[calc(50%-6px)]">
            <div className="flex items-center justify-between mb-1.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${kpi.color}`}>
                <kpi.icon className="w-4 h-4" />
              </div>
              <div className={`flex items-center gap-0.5 text-caption font-medium ${kpi.trend >= 0 ? "text-cm-success" : "text-cm-error"}`}>
                {kpi.trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {kpi.trend > 0 ? "+" : ""}{kpi.trend}%
              </div>
            </div>
            <p className="text-caption text-secondary font-medium">{kpi.title}</p>
            <p className="text-sm font-extrabold mt-0.5">
              {kpi.value}{kpi.suffix && <span className="text-caption text-secondary font-medium ml-0.5">{kpi.suffix}</span>}
            </p>
          </div>
        ))}
      </div>

      {/* Sparklines Row */}
      <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
        {[
          { label: "Revenus", data: revenueHistory, color: "#00A86B" },
          { label: "Missions", data: missionHistory, color: "#8B5CF6" },
          { label: "Avis", data: ratingHistory, color: "#F59E0B" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-3 border border-pale-mint/20 shadow-sm min-w-[130px] flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-caption text-secondary font-bold uppercase tracking-wider">{s.label}</span>
              <Eye className="w-3 h-3 text-secondary/50" />
            </div>
            <Sparkline data={s.data} color={s.color} />
          </div>
        ))}
      </div>

      {/* Today's Jobs */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Briefcase className="w-4 h-4" /> Interventions du jour
          </h4>
          <span className="text-caption font-medium bg-pale-mint px-2.5 py-1 rounded-full">
            {stats.todayJobsCount} mission{stats.todayJobsCount > 1 ? "s" : ""}
          </span>
        </div>
        {todayJobs.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl border border-pale-mint/15 shadow-sm text-center">
            <CalendarCheck className="w-10 h-10 text-secondary/60 mx-auto mb-2" />
            <p className="text-xs text-secondary font-medium">Aucune intervention prévue aujourd'hui</p>
          </div>
        ) : (
          <div className="space-y-2">
            {todayJobs.map((job) => {
              const stepIdx = DASHBOARD_STEPS.indexOf(job.status);
              return (
                <div key={job.id} onClick={() => onViewJob(job)}
                  className="bg-white p-3.5 rounded-xl border border-pale-mint/15 shadow-sm cursor-pointer hover:bg-pale-mint/30 transition-colors active:scale-[0.98]">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-pale-mint flex items-center justify-center shrink-0">
                        {job.clientAvatarUrl ? (
                          <img alt={job.clientName} className="w-full h-full object-cover" src={job.clientAvatarUrl} />
                        ) : (
                          <UserIcon className="w-4 h-4 text-secondary" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold truncate">{job.serviceName}</h5>
                        <p className="text-caption text-secondary flex items-center gap-1 mt-0.5 truncate">
                          <MapPin className="w-2.5 h-2.5 shrink-0" /> {job.clientLocation}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold shrink-0 ml-2">{job.totalFeeXOF.toLocaleString()} F</span>
                  </div>
                  {stepIdx >= 0 && (
                    <div className="flex items-center gap-1 mb-1.5">
                      {DASHBOARD_STEPS.map((s, i) => {
                        const done = i <= stepIdx;
                        const labels = ["Accepté", "En route", "En cours", "Terminé"];
                        return (
                          <div key={s} className="flex items-center flex-1">
                            <div className={`flex items-center justify-center w-4 h-4 rounded-full shrink-0 transition-all ${
                              done ? "bg-cm-green" : "bg-pale-mint"
                            } ${i === stepIdx ? "ring-2 ring-offset-1 ring-cm-green" : ""}`}>
                              {done ? <Check className="w-2.5 h-2.5 text-white stroke-[3]" /> : <span className="text-[8px] font-bold text-secondary">{i + 1}</span>}
                            </div>
                            {i < DASHBOARD_STEPS.length - 1 && (
                              <div className={`flex-1 h-0.5 mx-0.5 ${done ? "bg-cm-green" : "bg-pale-mint"}`} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <StatusBadge status={job.status} />
                    <div className="flex items-center gap-1">
                      <button onClick={(e) => { e.stopPropagation(); window.open(`tel:${job.clientPhone}`); }}
                        className="p-1.5 rounded-lg bg-pale-mint text-brand-forest hover:bg-pale-mint/70 transition-colors cursor-pointer">
                        <Phone className="w-3 h-3" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); alert("Message à " + job.clientName); }}
                        className="p-1.5 rounded-lg bg-pale-mint text-brand-forest hover:bg-pale-mint/70 transition-colors cursor-pointer">
                        <MessageSquare className="w-3 h-3" />
                      </button>
                      <ChevronRight className="w-3.5 h-3.5 text-secondary shrink-0" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Earnings Summary */}
      <div className="bg-white rounded-xl p-4 border border-pale-mint/20 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-cm-green/20 flex items-center justify-center">
            <Wallet className="w-4 h-4 text-cm-green" />
          </div>
          <h4 className="text-xs font-bold uppercase tracking-wider">Aperçu des revenus</h4>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Aujourd'hui", value: stats.todayEarningsXOF },
            { label: "Cette semaine", value: stats.weekEarningsXOF },
            { label: "Ce mois", value: stats.monthEarningsXOF },
          ].map((e) => (
            <div key={e.label} className="text-center">
              <p className="text-caption text-secondary font-medium uppercase tracking-wider">{e.label}</p>
              <p className="text-sm font-extrabold mt-1">{e.value.toLocaleString()} <span className="text-caption text-secondary font-medium">F</span></p>
            </div>
          ))}
        </div>
      </div>

      {/* Chart Section */}
      <div className="space-y-3">
        <ChartCard title="Évolution des revenus" data={revenueHistory} color="#00A86B" suffix=" F" monthLabels={monthLabels} />
        <ChartCard title="Évolution des missions" data={missionHistory} color="#8B5CF6" suffix="" monthLabels={monthLabels} />
        <ChartCard title="Évolution des avis" data={ratingHistory} color="#F59E0B" suffix="/5" monthLabels={monthLabels} />
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; classes: string }> = {
    pending: { label: "En attente", classes: "bg-cm-warning/10 text-cm-warning" },
    accepted: { label: "Accepté", classes: "bg-cm-info/10 text-cm-info" },
    en_route: { label: "En route", classes: "bg-cm-purple/10 text-cm-purple" },
    in_progress: { label: "En cours", classes: "bg-cm-green/30 text-brand-forest" },
    completed: { label: "Terminé", classes: "bg-cm-success/10 text-cm-success" },
    cancelled: { label: "Annulé", classes: "bg-cm-error/10 text-cm-error" },
  };
  const c = config[status] || config.pending;
  return <span className={`text-caption font-medium px-2 py-0.5 rounded-full uppercase tracking-wider ${c.classes}`}>{c.label}</span>;
}

function CountdownTimer({ expiresAt, onExpire }: { expiresAt: string; onExpire: () => void }) {
  const [remaining, setRemaining] = useState(120);
  useEffect(() => {
    const expires = new Date(expiresAt).getTime();
    const tick = () => { const now = Date.now(); const diff = Math.max(0, Math.floor((expires - now) / 1000)); setRemaining(diff); if (diff <= 0) onExpire(); };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  return (
    <div className="flex items-center gap-1.5">
      <Clock className="w-3.5 h-3.5 text-white/70" />
      <span className={`text-sm font-extrabold font-mono ${remaining <= 30 ? "text-red-400" : remaining <= 60 ? "text-amber-400" : "text-white"}`}>
        {minutes}:{seconds.toString().padStart(2, "0")}
      </span>
    </div>
  );
}

function Sparkline({ data, color = "#00A86B", height = 40 }: { data: number[]; color?: string; height?: number }) {
  if (data.length === 0) return null;
  const max = Math.max(...data); const min = Math.min(...data); const range = max - min || 1;
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
}

function ChartCard({ title, data, color = "#00A86B", suffix, monthLabels: ml }: {
  title: string; data: number[]; color?: string; suffix?: string; monthLabels: string[];
}) {
  const max = Math.max(...data); const min = Math.min(...data); const range = max - min || 1;
  const w = 280; const h = 120;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 20) - 10;
    return `${x},${y}`;
  }).join(" ");
  const areaPts = `0,${h} ${pts} ${w},${h}`;
  return (
    <div className="bg-white rounded-xl p-4 border border-pale-mint/20 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold">{title}</h3>
        <span className="text-caption text-secondary">Dernière période</span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
        <polygon points={areaPts} fill={`${color}20`} />
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {[0, Math.round(data.length / 2), data.length - 1].map((i) => (
          <text key={i} x={(i / (data.length - 1)) * w} y={h - 2} textAnchor="middle" fill="#888" fontSize="6">{ml[i]}</text>
        ))}
        {[0, Math.round((max + min) / 2), max].map((v, vi) => (
          <text key={vi} x={0} y={h - ((v - min) / range) * (h - 20) - 12} fill="#888" fontSize="6" textAnchor="start">
            {v.toLocaleString()}{suffix || ""}
          </text>
        ))}
      </svg>
    </div>
  );
}
