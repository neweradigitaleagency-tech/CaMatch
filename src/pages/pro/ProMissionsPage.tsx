import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, CalendarDays, MapPin, DollarSign, UserIcon, Clock, XCircle, Navigation, MessageCircle, Phone, Star } from "lucide-react";
import { MOCK_PRO_JOBS, MOCK_PRO_ALERTS } from "../../services/mockData";
import type { MissionStatus } from "../../types";

type TabFilter = "active" | "upcoming" | "completed";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric", month: "short",
  });
}

export default function ProMissionsPage() {
  const nav = useNavigate();
  const [tab, setTab] = useState<TabFilter>("active");
  const [showDetail, setShowDetail] = useState<string | null>(null);

  const activeJobs = MOCK_PRO_JOBS.filter((j) => j.status === "accepted" || j.status === "en_route" || j.status === "in_progress");
  const pendingJobs = MOCK_PRO_JOBS.filter((j) => j.status === "pending");
  const completedJobs = MOCK_PRO_JOBS.filter((j) => j.status === "completed");

  const filtered = tab === "active" ? activeJobs : tab === "upcoming" ? pendingJobs : completedJobs;

  return (
    <div className="min-h-dynamic bg-[#F5F5F0]">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-lg border-b border-gray-200">
        <div className="flex items-center h-14 px-4 gap-3 max-w-[448px] mx-auto">
          <button onClick={() => nav(-1)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer active:scale-95">
            <ArrowLeft className="w-5 h-5 text-gray-900" />
          </button>
          <h1 className="text-[16px] font-bold text-gray-900">Mes missions</h1>
        </div>
      </header>

      <div className="w-full max-w-[448px] mx-auto px-4 pt-4 pb-28">
        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {(["active", "upcoming", "completed"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-full text-[12px] font-bold transition-all cursor-pointer active:scale-95 ${
                tab === t
                  ? "bg-gray-900 text-white shadow-sm"
                  : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300"
              }`}>
              {t === "active" ? "En cours" : t === "upcoming" ? "À venir" : "Terminées"}
            </button>
          ))}
        </div>

        {/* Nouvelles alertes (pending) */}
        {tab === "upcoming" && MOCK_PRO_ALERTS.length > 0 && (
          <div className="mb-4">
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Nouvelles demandes</h3>
            {MOCK_PRO_ALERTS.map((alert) => (
              <motion.div key={alert.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-200 rounded-[16px] p-3.5 mb-2 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[14px]">👤</div>
                    <div>
                      <p className="text-[13px] font-bold text-gray-900">{alert.clientName}</p>
                      <div className="flex items-center gap-1 text-[10px] text-gray-500">
                        <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                        <span>4.9</span>
                        <span>·</span>
                        <Clock className="w-2.5 h-2.5" />
                        <span>Il y a 10 s</span>
                      </div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    alert.urgency === "high" ? "bg-red-50 text-red-500" : "bg-amber-50 text-amber-500"
                  }`}>{alert.urgency === "high" ? "Urgent" : "Nouveau"}</span>
                </div>
                <p className="text-[11px] text-gray-600 mb-2 line-clamp-1">{alert.description}</p>
                <div className="flex items-center gap-2 text-[10px] text-gray-500 mb-3">
                  <MapPin className="w-3 h-3" />
                  <span>{alert.location}</span>
                  <span className="font-bold text-cm-accent ml-auto">{alert.estimatedPriceMinXOF.toLocaleString("fr-FR")} - {alert.estimatedPriceMaxXOF.toLocaleString("fr-FR")} F</span>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 h-9 rounded-[10px] border-2 border-red-100 text-red-500 text-[11px] font-bold cursor-pointer active:scale-[0.97] transition-transform hover:bg-red-50 flex items-center justify-center gap-1">
                    <XCircle className="w-3 h-3" /> Refuser
                  </button>
                  <button className="flex-1 h-9 rounded-[10px] bg-cm-accent text-white text-[11px] font-bold cursor-pointer active:scale-[0.97] transition-transform hover:bg-cm-accent/90 flex items-center justify-center gap-1 shadow-sm">
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
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <CalendarDays className="w-7 h-7 text-gray-400" />
            </div>
            <p className="text-[14px] font-bold text-gray-900 mb-1">
              {tab === "active" ? "Aucune mission en cours" : "Aucune mission terminée"}
            </p>
            <p className="text-[12px] text-gray-500">Les missions apparaîtront ici.</p>
          </div>
        )}

        {filtered.map((job, idx) => {
          const isDetailOpen = showDetail === job.id;
          return (
            <motion.div key={job.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white border border-gray-200 rounded-[16px] p-3.5 mb-2 shadow-sm cursor-pointer active:scale-[0.99] transition-transform"
              onClick={() => setShowDetail(isDetailOpen ? null : job.id)}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-cm-accent/10 flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-cm-accent" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-gray-900">{job.clientName}</p>
                    <p className="text-[10px] text-gray-500 flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" />
                      {job.scheduledDate ? formatDate(job.scheduledDate) : "Date flexible"}
                    </p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  job.status === "accepted" ? "bg-green-50 text-green-600" :
                  job.status === "en_route" ? "bg-blue-50 text-blue-600" :
                  job.status === "in_progress" ? "bg-purple-50 text-purple-600" :
                  job.status === "completed" ? "bg-gray-100 text-gray-600" :
                  "bg-amber-50 text-amber-600"
                }`}>
                  {job.status === "accepted" ? "Acceptée" :
                   job.status === "en_route" ? "En route" :
                   job.status === "in_progress" ? "En cours" :
                   job.status === "completed" ? "Terminée" : "Payée"}
                </span>
              </div>

              <p className="text-[12px] text-gray-700 font-medium ml-10.5 mb-2">{job.serviceName}</p>

              <div className="flex items-center justify-between ml-10.5">
                <div className="flex items-center gap-2 text-[10px] text-gray-500">
                  <MapPin className="w-3 h-3" />
                  <span>{job.clientLocation.split(",")[0]}</span>
                </div>
                <span className="text-[13px] font-extrabold text-cm-accent font-mono">{job.totalFeeXOF.toLocaleString("fr-FR")} F</span>
              </div>

              {/* Expanded detail */}
              {isDetailOpen && (tab === "active") && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex gap-2 mb-2">
                    <button className="flex-1 h-9 rounded-[10px] bg-gray-900 text-white text-[11px] font-bold cursor-pointer active:scale-[0.97] transition-transform flex items-center justify-center gap-1.5 shadow-sm">
                      <Navigation className="w-3 h-3" /> Naviguer
                    </button>
                    <button className="flex-1 h-9 rounded-[10px] border border-gray-200 text-gray-700 text-[11px] font-bold cursor-pointer active:scale-[0.97] transition-transform flex items-center justify-center gap-1.5">
                      <MessageCircle className="w-3 h-3" /> Chat
                    </button>
                    <button className="w-9 h-9 rounded-[10px] border border-gray-200 text-gray-700 flex items-center justify-center cursor-pointer active:scale-90 transition-transform">
                      <Phone className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 rounded-[10px] p-2.5">
                    <div className={`w-2 h-2 rounded-full ${job.status === "accepted" ? "bg-blue-500 animate-pulse" : job.status === "en_route" ? "bg-amber-500 animate-pulse" : "bg-cm-accent"}`} />
                    <span className="text-[11px] font-medium text-gray-700">
                      {job.status === "accepted" ? "En attente de départ" :
                       job.status === "en_route" ? "En route vers le client" :
                       "Travail en cours"}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
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
