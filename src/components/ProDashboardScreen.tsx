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
  onOpenCall?: (clientName: string) => void;
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
  onOpenChat,
  onOpenCall,
  revenueHistory = [120000, 180000, 150000, 220000, 195000, 245000],
  missionHistory = [18, 22, 20, 25, 23, 28],
  ratingHistory = [4.2, 4.4, 4.3, 4.5, 4.6, 4.7],
  monthLabels = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun"],
}: Props) {
  const [currentAlertIndex, setCurrentAlertIndex] = useState(0);

  const currentAlert = alerts.length > 0 ? alerts[currentAlertIndex] : null;

  const kpiData = [
    {
      title: "Revenus", value: stats.monthEarningsXOF.toLocaleString(), suffix: "F",
      trend: 12, icon: DollarSign,
    },
    {
      title: "Missions", value: stats.totalJobsCompleted.toString(),
      trend: 8, icon: Briefcase,
    },
    {
      title: "Satisfaction", value: (stats.rating / 10).toFixed(1), suffix: "/5",
      trend: 2, icon: Star,
    },
    {
      title: "Clients", value: stats.reviewCount.toString(),
      trend: 15, icon: UserIcon,
    },
  ];

  return (
    <div className="px-5 py-5 pb-32 space-y-5 bg-cm-bg min-h-screen">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full overflow-hidden border border-cm-border shrink-0">
            <img alt={pro.name} className="w-full h-full object-cover" src={pro.avatarUrl} />
          </div>
          <div>
            <h2 className="text-[16px] font-bold text-cm-text">{pro.name}</h2>
            <p className="text-[12px] text-cm-text-soft font-medium">{pro.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-cm-accent-soft px-2.5 py-1 rounded-[var(--radius-cm)]">
          <Star className="w-3 h-3 text-cm-accent" />
          <span className="text-[12px] font-semibold text-cm-accent">{(pro.rating / 10).toFixed(1)}</span>
        </div>
      </div>

      <div
        className={`p-4 rounded-[var(--radius-cm-lg)] flex items-center justify-between cursor-pointer border ${
          available ? "bg-cm-accent-soft border-cm-accent/30" : "bg-cm-elevated border-cm-border"
        }`}
        onClick={onToggleAvailability}
      >
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${available ? "bg-cm-accent" : "bg-gray-200"}`}>
            <Power className={`w-4 h-4 ${available ? "text-white" : "text-cm-text-soft"}`} />
          </div>
          <div>
            <h4 className="text-[13px] font-semibold text-cm-text">{available ? "Disponible" : "Indisponible"}</h4>
            <p className="text-[12px] text-cm-text-soft">{available ? "Vous recevez les alertes de missions" : "Vous ne recevez pas de nouvelles missions"}</p>
          </div>
        </div>
        <div className={`relative w-11 h-6 rounded-full ${available ? "bg-cm-accent" : "bg-gray-200"}`}>
          <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
            available ? "translate-x-5.5 left-0.5" : "translate-x-0.5 left-0"
          }`} />
        </div>
      </div>

      <AnimatePresence>
        {currentAlert && (
          <motion.div
            key={currentAlert.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-cm-text text-cm-bg p-4 rounded-[var(--radius-cm-lg)] space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center">
                  <Bell className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-[12px] font-medium text-cm-accent">Nouvelle mission</span>
              </div>
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                currentAlert.urgency === "emergency" ? "bg-red-500/20 text-red-400" :
                currentAlert.urgency === "high" ? "bg-amber-500/20 text-amber-400" :
                "bg-white/10 text-white/70"
              }`}>
                {currentAlert.urgency === "emergency" ? "URGENT" : currentAlert.urgency === "high" ? "Prioritaire" : "Standard"}
              </span>
            </div>
            <div>
              <h3 className="text-[15px] font-bold">{currentAlert.clientName}</h3>
              <p className="text-[12px] text-white/70 mt-0.5">{currentAlert.description}</p>
            </div>
            <div className="flex items-center gap-3 text-[12px] text-white/70">
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {currentAlert.location}</span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-[11px] text-white/50">Estimation</p>
                <p className="text-[14px] font-bold text-cm-accent">
                  {currentAlert.estimatedPriceMinXOF.toLocaleString()} - {currentAlert.estimatedPriceMaxXOF.toLocaleString()} F CFA
                </p>
              </div>
              <CountdownTimer expiresAt={currentAlert.expiresAt} onExpire={() => onDeclineAlert(currentAlert)} />
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => onAcceptAlert(currentAlert)}
                className="flex-1 bg-cm-accent text-white font-medium text-[12px] py-2.5 rounded-[var(--radius-cm)] cm-scale-btn hover:bg-cm-accent-hover">
                Accepter
              </button>
              <button onClick={() => { onDeclineAlert(currentAlert); if (currentAlertIndex < alerts.length - 1) setCurrentAlertIndex((i) => i + 1); }}
                className="flex-1 bg-white/10 text-white font-medium text-[12px] py-2.5 rounded-[var(--radius-cm)] hover:bg-white/20">
                Refuser
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap gap-3">
        {kpiData.map((kpi) => (
          <div key={kpi.title} className="bg-cm-elevated rounded-[var(--radius-cm)] p-3 border border-cm-border flex-1 min-w-[calc(50%-6px)]">
            <div className="flex items-center justify-between mb-1">
              <div className="w-7 h-7 rounded-lg bg-cm-accent-soft flex items-center justify-center">
                <kpi.icon className="w-3.5 h-3.5 text-cm-accent" />
              </div>
              <div className={`flex items-center gap-0.5 text-[11px] font-medium ${kpi.trend >= 0 ? "text-cm-accent" : "text-red-500"}`}>
                {kpi.trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {kpi.trend > 0 ? "+" : ""}{kpi.trend}%
              </div>
            </div>
            <p className="text-[11px] text-cm-text-soft">{kpi.title}</p>
            <p className="text-[15px] font-bold text-cm-text mt-0.5">
              {kpi.value}{kpi.suffix && <span className="text-[11px] text-cm-text-soft font-medium ml-0.5">{kpi.suffix}</span>}
            </p>
          </div>
        ))}
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
        {[
          { label: "Revenus", data: revenueHistory, color: "#12f22d" },
          { label: "Missions", data: missionHistory, color: "#151e12" },
          { label: "Avis", data: ratingHistory, color: "#7a9972" },
        ].map((s) => (
          <div key={s.label} className="bg-cm-elevated rounded-[var(--radius-cm)] p-3 border border-cm-border min-w-[120px] flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-medium text-cm-text-soft">{s.label}</span>
              <Eye className="w-3 h-3 text-cm-text-soft" />
            </div>
            <Sparkline data={s.data} color={s.color} />
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-[14px] font-bold text-cm-text">Interventions du jour</h4>
          <span className="text-[11px] font-medium bg-cm-accent-soft text-cm-accent px-2.5 py-0.5 rounded-[var(--radius-cm)]">
            {stats.todayJobsCount} mission{stats.todayJobsCount > 1 ? "s" : ""}
          </span>
        </div>
        {todayJobs.length === 0 ? (
          <div className="bg-cm-elevated p-6 rounded-[var(--radius-cm-lg)] border border-cm-border text-center">
            <CalendarCheck className="w-8 h-8 text-cm-text-soft mx-auto mb-2" />
            <p className="text-[13px] text-cm-text-soft">Aucune intervention prévue aujourd'hui</p>
          </div>
        ) : (
          <div className="space-y-2">
            {todayJobs.map((job) => {
              const stepIdx = DASHBOARD_STEPS.indexOf(job.status);
              return (
                <div key={job.id} onClick={() => onViewJob(job)}
                  className="bg-cm-elevated p-3.5 rounded-[var(--radius-cm)] border border-cm-border cursor-pointer cm-scale-btn">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-cm-accent-soft flex items-center justify-center shrink-0">
                        {job.clientAvatarUrl ? (
                          <img alt={job.clientName} className="w-full h-full object-cover" src={job.clientAvatarUrl} />
                        ) : (
                          <UserIcon className="w-4 h-4 text-cm-accent" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-[13px] font-semibold text-cm-text truncate">{job.serviceName}</h5>
                        <p className="text-[11px] text-cm-text-soft flex items-center gap-1 mt-0.5 truncate">
                          <MapPin className="w-2.5 h-2.5 shrink-0" /> {job.clientLocation}
                        </p>
                      </div>
                    </div>
                    <span className="text-[13px] font-semibold text-cm-text shrink-0 ml-2">{job.totalFeeXOF.toLocaleString()} F</span>
                  </div>
                  {stepIdx >= 0 && (
                    <div className="flex items-center gap-1 mb-2">
                      {DASHBOARD_STEPS.map((s, i) => {
                        const done = i <= stepIdx;
                        return (
                          <div key={s} className="flex items-center flex-1">
                            <div className={`flex items-center justify-center w-3.5 h-3.5 rounded-full shrink-0 ${
                              done ? "bg-cm-accent" : "bg-gray-200"
                            }`}>
                              {done ? <Check className="w-2 h-2 text-white" /> : null}
                            </div>
                            {i < DASHBOARD_STEPS.length - 1 && (
                              <div className={`flex-1 h-0.5 mx-0.5 ${done ? "bg-cm-accent" : "bg-gray-200"}`} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <StatusBadgeLocal status={job.status} />
                    <div className="flex items-center gap-1">
                      <button onClick={(e) => { e.stopPropagation(); onOpenCall?.(job.clientName); }}
                        className="p-1.5 rounded-lg bg-cm-accent-soft text-cm-accent">
                        <Phone className="w-3 h-3" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); onOpenChat?.(job.clientName); }}
                        className="p-1.5 rounded-lg bg-cm-accent-soft text-cm-accent">
                        <MessageSquare className="w-3 h-3" />
                      </button>
                      <ChevronRight className="w-3 h-3 text-cm-text-soft shrink-0" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-cm-elevated rounded-[var(--radius-cm-lg)] p-4 border border-cm-border">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-cm-accent-soft flex items-center justify-center">
            <Wallet className="w-3.5 h-3.5 text-cm-accent" />
          </div>
          <h4 className="text-[13px] font-semibold text-cm-text">Aperçu des revenus</h4>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Aujourd'hui", value: stats.todayEarningsXOF },
            { label: "Cette semaine", value: stats.weekEarningsXOF },
            { label: "Ce mois", value: stats.monthEarningsXOF },
          ].map((e) => (
            <div key={e.label} className="text-center">
              <p className="text-[11px] text-cm-text-soft">{e.label}</p>
              <p className="text-[15px] font-bold text-cm-text mt-1">{e.value.toLocaleString()} <span className="text-[11px] text-cm-text-soft">F</span></p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <ChartCard title="Évolution des revenus" data={revenueHistory} color="#12f22d" suffix=" F" monthLabels={monthLabels} />
        <ChartCard title="Évolution des missions" data={missionHistory} color="#151e12" suffix="" monthLabels={monthLabels} />
        <ChartCard title="Évolution des avis" data={ratingHistory} color="#7a9972" suffix="/5" monthLabels={monthLabels} />
      </div>
    </div>
  );
}

function StatusBadgeLocal({ status }: { status: string }) {
  const config: Record<string, { label: string; classes: string }> = {
    pending: { label: "En attente", classes: "bg-cm-accent-soft text-cm-accent" },
    accepted: { label: "Accepté", classes: "bg-cm-accent-soft text-cm-accent" },
    en_route: { label: "En route", classes: "bg-gray-100 text-cm-text-soft" },
    in_progress: { label: "En cours", classes: "bg-cm-accent-soft text-cm-accent" },
    completed: { label: "Terminé", classes: "bg-gray-100 text-cm-text-soft" },
    cancelled: { label: "Annulé", classes: "bg-red-100 text-red-600" },
  };
  const c = config[status] || config.pending;
  return <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${c.classes}`}>{c.label}</span>;
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
    <div className="flex items-center gap-1">
      <Clock className="w-3 h-3 text-white/70" />
      <span className={`text-[14px] font-semibold ${remaining <= 30 ? "text-red-400" : remaining <= 60 ? "text-amber-400" : "text-white"}`}>
        {minutes}:{seconds.toString().padStart(2, "0")}
      </span>
    </div>
  );
}

function Sparkline({ data, color = "#1B4D3E", height = 40 }: { data: number[]; color?: string; height?: number }) {
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

function ChartCard({ title, data, color = "#1B4D3E", suffix, monthLabels: ml }: {
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
    <div className="bg-cm-elevated rounded-xl p-4 border border-cm-border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-display font-bold text-cm-text">{title}</h3>
        <span className="text-[11px] text-cm-text-soft">Dernière période</span>
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
