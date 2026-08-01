import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBackNavigation } from "../../hooks/useBackNavigation";
import { motion } from "motion/react";
import { ArrowLeft, CalendarDays, MapPin, Coins, UserIcon, Clock, XCircle, Navigation, MessageCircle, Phone } from "lucide-react";
import { MOCK_PRO_JOBS, MOCK_PRO_ALERTS } from "../../services/mockData";
import type { MissionStatus } from "../../types";

const STATUS_CONFIG: Record<string, { border: string; dot: string; badge: string }> = {
  pending:        { border: "border-l-amber-400",  dot: "bg-amber-400",  badge: "bg-amber-50 text-amber-700" },
  accepted:       { border: "border-l-emerald-500", dot: "bg-emerald-500",badge: "bg-emerald-50 text-emerald-700" },
  quote_required: { border: "border-l-violet-500",  dot: "bg-violet-500", badge: "bg-violet-50 text-violet-700" },
  en_route:       { border: "border-l-blue-500",    dot: "bg-blue-500",   badge: "bg-blue-50 text-blue-700" },
  arrived:        { border: "border-l-sky-500",     dot: "bg-sky-500",    badge: "bg-sky-50 text-sky-700" },
  in_progress:    { border: "border-l-orange-500",  dot: "bg-orange-500", badge: "bg-orange-50 text-orange-700" },
  completed:      { border: "border-l-cm-text-muted",    dot: "bg-cm-text-muted",   badge: "bg-cm-surface text-cm-text-soft" },
  client_validation: { border: "border-l-teal-500", dot: "bg-teal-500",  badge: "bg-teal-50 text-teal-700" },
  closed:         { border: "border-l-cm-text",    dot: "bg-cm-text",   badge: "bg-cm-surface text-cm-text" },
  cancelled:      { border: "border-l-red-500",     dot: "bg-red-500",    badge: "bg-red-50 text-red-700" },
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Nouvelle",
  accepted: "Acceptée",
  quote_required: "Devis requis",
  en_route: "En route",
  arrived: "Arrivé",
  in_progress: "En cours",
  completed: "Terminée",
  client_validation: "Validation",
  closed: "Clôturée",
  cancelled: "Annulée",
};

type TabFilter = "active" | "upcoming" | "completed";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric", month: "short",
  });
}

export default function ProMissionsPage() {
  const nav = useNavigate();
  const goBack = useBackNavigation("/pro/dashboard");
  const [tab, setTab] = useState<TabFilter>("active");
  const [showDetail, setShowDetail] = useState<string | null>(null);

  const activeJobs = MOCK_PRO_JOBS.filter((j) => j.status === "accepted" || j.status === "quote_required" || j.status === "en_route" || j.status === "in_progress");
  const pendingJobs = MOCK_PRO_JOBS.filter((j) => j.status === "pending");
  const completedJobs = MOCK_PRO_JOBS.filter((j) => j.status === "completed");

  const filtered = tab === "active" ? activeJobs : tab === "upcoming" ? pendingJobs : completedJobs;

  return (
    <div className="min-h-dynamic bg-[#F5F5F0]">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-lg border-b border-cm-border/40">
        <div className="flex items-center h-14 px-4 gap-3 max-w-[448px] mx-auto">
          <button onClick={goBack} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-cm-surface cursor-pointer active:scale-95">
            <ArrowLeft className="w-5 h-5 text-cm-text" />
          </button>
          <h1 className="text-[16px] font-bold text-cm-text">Mes missions</h1>
        </div>
      </header>

      <div className="w-full max-w-[448px] mx-auto px-4 pt-4 pb-28">
        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {(["active", "upcoming", "completed"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-full text-[12px] font-bold transition-all cursor-pointer active:scale-95 ${
                tab === t
                  ? "bg-cm-text text-white shadow-sm"
                  : "bg-white text-cm-text-muted border border-cm-border/40 hover:border-cm-border-soft"
              }`}>
              {t === "active" ? "En cours" : t === "upcoming" ? "À venir" : "Terminées"}
            </button>
          ))}
        </div>

        {/* Nouvelles alertes (pending) */}
        {tab === "upcoming" && MOCK_PRO_ALERTS.length > 0 && (
          <div className="mb-4">
            <h3 className="text-[11px] font-bold text-cm-text-muted uppercase tracking-wider mb-2">Nouvelles demandes</h3>
            {MOCK_PRO_ALERTS.map((alert) => (
              <motion.div key={alert.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-cm-border/40 rounded-[16px] p-3.5 mb-2 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[14px]">👤</div>
                    <div>
                      <p className="text-[13px] font-bold text-cm-text">{alert.clientName}</p>
                      <div className="flex items-center gap-1 text-[10px] text-cm-text-muted">
                        <Clock className="w-2.5 h-2.5" />
                        <span>Il y a 10 s</span>
                      </div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    alert.urgency === "high" ? "bg-red-50 text-red-500" : "bg-amber-50 text-amber-500"
                  }`}>{alert.urgency === "high" ? "Urgent" : "Nouveau"}</span>
                </div>
                <p className="text-[11px] text-cm-text-soft mb-2 line-clamp-1">{alert.description}</p>
                <div className="flex items-center gap-2 text-[10px] text-cm-text-muted mb-3">
                  <MapPin className="w-3 h-3" />
                  <span>{alert.location}</span>
                  <span className="font-bold text-cm-accent ml-auto">{alert.estimatedPriceMinXOF.toLocaleString("fr-FR")} - {alert.estimatedPriceMaxXOF.toLocaleString("fr-FR")} F</span>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 h-9 rounded-[10px] border-2 border-red-100 text-red-500 text-[11px] font-bold cursor-pointer active:scale-[0.97] transition-transform hover:bg-red-50 flex items-center justify-center gap-1">
                    <XCircle className="w-3 h-3" /> Refuser
                  </button>
                  <button className="flex-1 h-9 rounded-[10px] bg-cm-accent text-cm-text-onAccent text-[11px] font-bold cursor-pointer active:scale-[0.97] transition-transform hover:bg-cm-accent/90 flex items-center justify-center gap-1 shadow-sm">
                    <Check className="w-3 h-3" /> Accepter
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Mission list */}
        {filtered.length === 0 && tab !== "upcoming" && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-cm-surface flex items-center justify-center mb-4">
              <CalendarDays className="w-7 h-7 text-cm-text-muted" />
            </div>
            <p className="text-[14px] font-bold text-cm-text mb-1">
              {tab === "active" ? "Aucune mission en cours" : "Aucune mission terminée"}
            </p>
            <p className="text-[12px] text-cm-text-muted">Les missions apparaîtront ici.</p>
          </div>
        )}

        {(() => {
          const jobs = filtered;
          return jobs.map((job, idx) => {
            const isDetailOpen = showDetail === job.id;
            const cfg = STATUS_CONFIG[job.status]!;
            const label = STATUS_LABEL[job.status] || job.status;
            return (
              <div key={job.id} className="relative flex gap-3 mb-2">
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
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.06, type: "spring", damping: 20, stiffness: 200 }}
                  onClick={() => setShowDetail(isDetailOpen ? null : job.id)}
                  className={`flex-1 bg-white rounded-[16px] p-3.5 cursor-pointer shadow-sm ${cfg.border} hover:shadow-md active:scale-[0.99] transition-all`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-cm-accent/10 flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-cm-accent" />
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-cm-text">{job.clientName}</p>
                        <p className="text-[10px] text-cm-text-muted flex items-center gap-1">
                          <CalendarDays className="w-3 h-3" />
                          {job.scheduledDate ? formatDate(job.scheduledDate) : "Date flexible"}
                        </p>
                      </div>
                    </div>
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15, delay: idx * 0.06 + 0.12 }}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}
                    >
                      {label}
                    </motion.span>
                  </div>

                  <p className="text-[12px] text-cm-text-soft font-medium ml-10.5 mb-2">{job.serviceName}</p>

                  <div className="flex items-center justify-between ml-10.5">
                    <div className="flex items-center gap-2 text-[10px] text-cm-text-muted">
                      <MapPin className="w-3 h-3" />
                      <span>{job.clientLocation.split(",")[0]}</span>
                    </div>
                    <span className="text-[13px] font-extrabold text-cm-accent font-mono">{job.totalFeeXOF.toLocaleString("fr-FR")} F</span>
                  </div>

                  {/* Expanded detail */}
                  {isDetailOpen && (tab === "active") && (
                    <div className="mt-3 pt-3 border-t border-cm-border/40">
                      <div className="flex gap-2 mb-2">
                        <button className="flex-1 h-9 rounded-[10px] bg-cm-text text-white text-[11px] font-bold cursor-pointer active:scale-[0.97] transition-transform flex items-center justify-center gap-1.5 shadow-sm">
                           <Navigation className="w-3 h-3" /> Naviguer
                         </button>
                         <button className="flex-1 h-9 rounded-[10px] border border-cm-border/40 text-cm-text-soft text-[11px] font-bold cursor-pointer active:scale-[0.97] transition-transform flex items-center justify-center gap-1.5">
                           <MessageCircle className="w-3 h-3" /> Chat
                         </button>
                         <button className="w-9 h-9 rounded-[10px] border border-cm-border/40 text-cm-text-soft flex items-center justify-center cursor-pointer active:scale-90 transition-transform">
                          <Phone className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 bg-cm-surface rounded-[10px] p-2.5">
                        <div className={`w-2 h-2 rounded-full ${job.status === "accepted" ? "bg-blue-500 animate-pulse" : job.status === "en_route" ? "bg-amber-500 animate-pulse" : "bg-cm-accent"}`} />
                        <span className="text-[11px] font-medium text-cm-text-soft">
                          {job.status === "accepted" ? "En attente de départ" :
                           job.status === "en_route" ? "En route vers le client" :
                           "Travail en cours"}
                        </span>
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>
            );
          });
        })()}
      </div>
    </div>
  );
}

function Check({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
