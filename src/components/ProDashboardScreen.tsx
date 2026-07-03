import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Star, Users, CalendarDays, TrendingUp, Clock, MapPin, Wallet,
  CheckCircle, Phone, BarChart3, Target,
  UserIcon, DollarSign, Award, Bell, Settings,
  MessageCircle, Navigation, XCircle, Check,
  FileText, Camera,
} from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import { useProStore } from "../stores/proStore";
import { useNotificationStore } from "../stores/notificationStore";
import { useChatStore } from "../stores/chatStore";
import { findConversation, createConversation } from "../services/chatService";
import NotificationPanel from "./NotificationPanel";
import PhotoCaptureModal from "./PhotoCaptureModal";
import {
  MOCK_PRO_STATS, MOCK_PRO_JOBS, MOCK_PRO_ALERTS,
  MOCK_FINANCE_SUMMARY, MOCK_CONVERSATIONS,
  MOCK_DASH_DATA, MOCK_REVENUE_HISTORY, MOCK_MISSION_HISTORY,
  MOCK_RATING_HISTORY, MOCK_PORTFOLIO_PRO, MOCK_PROS
} from "../services/mockData";
import { getProLevel, PRO_LEVELS } from "../types";
import HamburgerDrawer from "./HamburgerDrawer";
import RouteMapModal from "./RouteMapModal";

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`bg-gray-200/50 animate-pulse rounded-[14px] ${className}`} />;
}

function formatXOF(amount: number): string {
  return amount.toLocaleString("fr-FR") + " FCFA";
}

const STATUS_FLOW = ["accepted", "en_route", "arrived", "photos_taken", "in_progress", "completed", "client_validation"] as const;

function nextStatus(current: string): typeof STATUS_FLOW[number] | null {
  const idx = STATUS_FLOW.indexOf(current as typeof STATUS_FLOW[number]);
  if (idx < 0 || idx >= STATUS_FLOW.length - 1) return null;
  return STATUS_FLOW[idx + 1] ?? null;
}

const FLOW_BUTTON_LABELS: Record<string, string> = {
  quote_required: "📄 Créer un devis",
  accepted: "🚗 Je suis en route",
  en_route: "📍 Je suis arrivé",
  arrived: "📸 Photo avant intervention",
  photos_taken: "🔨 Commencer le travail",
  in_progress: "✅ Travail terminé",
  completed: "📋 En attente validation client",
  client_validation: "⏳ En attente du client",
};

const FLOW_BUTTON_ICONS: Record<string, string> = {
  quote_required: "📄",
  accepted: "🚗",
  en_route: "📍",
  arrived: "📸",
  photos_taken: "🔨",
  in_progress: "✅",
  completed: "📋",
  client_validation: "⏳",
};

function MissionDetailSheet({ open, onClose, alert, onAccept, onRefuse }: {
  open: boolean;
  onClose: () => void;
  alert: typeof MOCK_PRO_ALERTS[0] | null;
  onAccept: () => void;
  onRefuse: () => void;
}) {
  if (!alert) return null;
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/40"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[24px] max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-4" />
            <div className="px-5 pb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-[20px]">👤</div>
                <div>
                  <p className="text-[15px] font-bold text-gray-900">{alert.clientName}</p>
                  <div className="flex items-center gap-1 text-[12px] text-gray-500">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span>4.9</span>
                    <span className="mx-1">·</span>
                    <ShieldCheck className="w-3 h-3 text-green-500" />
                    <span>Vérifié</span>
                  </div>
                </div>
              </div>

              <p className="text-[13px] font-bold text-gray-900 mb-1">{alert.description}</p>
              <div className="flex items-center gap-2 text-[12px] text-gray-500 mb-4">
                <MapPin className="w-3 h-3" />
                <span>{alert.location}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-gray-500">Distance</p>
                  <p className="text-[14px] font-bold text-gray-900">2,3 km</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-gray-500">Temps estimé</p>
                  <p className="text-[14px] font-bold text-gray-900">~7 min</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-gray-500">Budget</p>
                  <p className="text-[14px] font-bold text-gray-900">{alert.estimatedPriceMinXOF.toLocaleString("fr-FR")} - {alert.estimatedPriceMaxXOF.toLocaleString("fr-FR")} F</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-gray-500">Urgence</p>
                  <p className={`text-[14px] font-bold ${alert.urgency === "high" ? "text-red-500" : "text-amber-500"}`}>
                    {alert.urgency === "high" ? "Urgent" : "Normal"}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button onClick={() => { onRefuse(); onClose(); }}
                  className="flex-1 h-12 rounded-[14px] border-2 border-red-200 text-red-500 text-[13px] font-bold cursor-pointer active:scale-[0.97] transition-transform hover:bg-red-50 flex items-center justify-center gap-2">
                  <XCircle className="w-4 h-4" /> Refuser
                </button>
                <button onClick={() => { onAccept(); onClose(); }}
                  className="flex-1 h-12 rounded-[14px] bg-gray-900 text-white text-[13px] font-bold cursor-pointer active:scale-[0.97] transition-transform hover:bg-gray-800 flex items-center justify-center gap-2 shadow-md">
                  <Check className="w-4 h-4" /> Accepter
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ShieldCheck({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

export default function ProDashboardScreen() {
  const nav = useNavigate();
  const isAvailable = useProStore((s) => s.isAvailable);
  const toggleAvailability = useProStore((s) => s.toggleAvailability);
  const user = useAuthStore((s) => s.user);
  const addNotification = useNotificationStore((s) => s.addNotification);
  const unreadNotifs = useNotificationStore((s) => s.notifications.filter((n) => !n.read).length);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [missionFilter, setMissionFilter] = useState<"all" | "upcoming" | "completed">("all");
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<typeof MOCK_PRO_ALERTS[0] | null>(null);
  const [showMissionDetail, setShowMissionDetail] = useState(false);
  const [activeMissions, setActiveMissions] = useState<typeof MOCK_PRO_ALERTS>([]);
  const [acceptedJobs, setAcceptedJobs] = useState<typeof MOCK_PRO_JOBS>([]);
  const [showMap, setShowMap] = useState(false);
  const [mapJob, setMapJob] = useState<typeof MOCK_PRO_JOBS[0] | null>(null);
  const [photoModalMode, setPhotoModalMode] = useState<"before" | "after" | null>(null);
  const [photoJobId, setPhotoJobId] = useState<string | null>(null);
  const [showPricingChoice, setShowPricingChoice] = useState(false);
  const [pricingAlert, setPricingAlert] = useState<typeof MOCK_PRO_ALERTS[0] | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    setActiveMissions(MOCK_PRO_ALERTS);
    setAcceptedJobs(MOCK_PRO_JOBS);
    if (useProStore.getState().jobs.length === 0) {
      useProStore.getState().setJobs(MOCK_PRO_JOBS);
      useProStore.getState().setAlerts(MOCK_PRO_ALERTS);
    }
    return () => clearTimeout(t);
  }, []);

  const pro = MOCK_PROS[5]!;
  const firstName = pro.name.split(" ")[0] ?? pro.name;
  const rating = (pro.rating / 10).toFixed(1);
  const level = getProLevel(pro.completedInterventions * 100);
  const nextLevel = PRO_LEVELS[PRO_LEVELS.indexOf(level) + 1];
  const xpProgress = pro.completedInterventions * 100;
  const nextLevelXp = nextLevel ? nextLevel.minXP - xpProgress : 0;
  const xpPercent = nextLevel ? Math.min((xpProgress / nextLevel.minXP) * 100, 100) : 100;

  const displayFinance = {
    today: MOCK_FINANCE_SUMMARY.todayEarningsXOF,
    week: MOCK_FINANCE_SUMMARY.weekEarningsXOF,
    month: MOCK_FINANCE_SUMMARY.monthEarningsXOF,
    available: MOCK_FINANCE_SUMMARY.availableBalanceXOF,
  };

  const chartMax = Math.max(...MOCK_REVENUE_HISTORY);

  const handleAcceptAlert = (alertId: string) => {
    const alert = MOCK_PRO_ALERTS.find((a) => a.id === alertId);
    if (!alert) return;
    setPricingAlert(alert);
    setShowPricingChoice(true);
  };

  const handlePricingChoice = (model: "fixed" | "quote") => {
    const alert = pricingAlert;
    if (!alert) return;
    setShowPricingChoice(false);
    setPricingAlert(null);

    setActiveMissions((prev) => prev.filter((a) => a.id !== alert.id));
    setAcceptedJobs((prev) => [...prev, {
      id: "job-" + alert.id,
      clientId: "client_" + alert.id,
      clientName: alert.clientName,
      clientPhone: alert.clientPhone,
      clientLocation: alert.location,
      category: alert.category,
      serviceName: "Intervention",
      description: alert.description,
      status: model === "quote" ? "quote_required" : "accepted",
      pricingModel: model,
      travelFeeXOF: 0,
      laborFeeXOF: alert.estimatedPriceMinXOF,
      totalFeeXOF: alert.estimatedPriceMinXOF,
      createdAt: new Date().toISOString(),
      scheduledDate: new Date().toISOString(),
      scheduledTime: "maintenant",
    }]);

    if (model === "quote") {
      addNotification({
        type: "info",
        title: "Devis requis",
        body: `Créez un devis pour ${alert.clientName} — ${alert.description}`,
      });
    } else {
      addNotification({
        type: "mission",
        title: "Mission acceptée",
        body: `Vous avez accepté la mission de ${alert.clientName} — ${alert.description}`,
      });
    }
  };

  const handleRefuseAlert = (alertId: string) => {
    const alert = MOCK_PRO_ALERTS.find((a) => a.id === alertId);
    setActiveMissions((prev) => prev.filter((a) => a.id !== alertId));

    if (alert) {
      addNotification({
        type: "info",
        title: "Mission refusée",
        body: `Vous avez refusé la mission de ${alert.clientName}`,
      });
    }
  };

  const advanceJobStatus = (jobId: string, extraFields?: Partial<typeof MOCK_PRO_JOBS[0]>) => {
    let newStatus: string | null = null;
    setAcceptedJobs((prev) => {
      const job = prev.find((j) => j.id === jobId);
      if (!job) return prev;
      const next = nextStatus(job.status);
      if (!next) return prev;
      newStatus = next;

      const updated = prev.map((j) =>
        j.id === jobId ? { ...j, ...extraFields, status: next as typeof j.status } : j
      );

      const statusLabels: Record<string, string> = {
        en_route: "En route vers le client",
        arrived: "Arrivé sur place",
        photos_taken: "Photos prises",
        in_progress: "Travail en cours",
        completed: "Mission terminée",
        client_validation: "En attente de validation client",
      };

      addNotification({
        type: "mission",
        title: `Statut mis à jour`,
        body: statusLabels[next] || next,
      });

      return updated;
    });

    setTimeout(() => {
      if (newStatus) {
        useProStore.getState().updateJobStatus(jobId, newStatus);
      }
    }, 0);
  };

  const handleAdvanceClick = (jobId: string, currentStatus: string) => {
    if (currentStatus === "quote_required") {
      nav("/orders/quote/create/" + jobId.replace("job-", ""));
      return;
    }
    if (currentStatus === "arrived") {
      setPhotoModalMode("before");
      setPhotoJobId(jobId);
      return;
    }
    if (currentStatus === "photos_taken") {
      advanceJobStatus(jobId);
      return;
    }
    if (currentStatus === "in_progress") {
      setPhotoModalMode("after");
      setPhotoJobId(jobId);
      return;
    }
    if (currentStatus === "client_validation") {
      return;
    }
    advanceJobStatus(jobId);
  };

  const handlePhotoCaptured = (dataUrl: string) => {
    const jobId = photoJobId;
    const mode = photoModalMode;
    if (!jobId || !mode) return;

    advanceJobStatus(jobId, mode === "before" ? { beforePhoto: dataUrl } : { afterPhoto: dataUrl });

    setPhotoModalMode(null);
    setPhotoJobId(null);
  };

  const openMapForJob = (job: typeof MOCK_PRO_JOBS[0]) => {
    setMapJob(job);
    setShowMap(true);
  };

  const openChatForJob = async (job: typeof MOCK_PRO_JOBS[0]) => {
    const currentUserId = useAuthStore.getState().userId;
    if (!currentUserId || !job.clientId) return;
    const existing = await findConversation(currentUserId, job.clientId);
    if (existing) {
      nav(`/pro/messages/${existing}`);
    } else {
      const created = await createConversation({
        participant1: currentUserId,
        participant2: job.clientId,
        jobId: job.id,
      });
      if (created) {
        nav(`/pro/messages/${created}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-dynamic bg-[#F5F5F0] p-4 w-full max-w-[448px] mx-auto space-y-4 pt-14">
        <SkeletonBlock className="h-14 w-full" />
        <SkeletonBlock className="h-32 w-full" />
        <SkeletonBlock className="h-48 w-full" />
        <SkeletonBlock className="h-64 w-full" />
        <SkeletonBlock className="h-32 w-full" />
      </div>
    );
  }

  const activeJob = acceptedJobs.filter(
    (j) => j.status === "accepted" || j.status === "quote_required" || j.status === "en_route" || j.status === "arrived" || j.status === "photos_taken" || j.status === "in_progress" || j.status === "client_validation"
  )[0];

  return (
    <div className="min-h-dynamic bg-[#F5F5F0]">
      <HamburgerDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        isPro
        proName={pro.name}
        proTitle={pro.title}
        proAvatarUrl={pro.avatarUrl}
        proPhone={pro.phoneNumber}
      />

      <NotificationPanel open={showNotifications} onClose={() => setShowNotifications(false)} />

      <RouteMapModal
        open={showMap}
        onClose={() => setShowMap(false)}
        job={mapJob}
      />

      <PhotoCaptureModal
        open={photoModalMode !== null}
        onClose={() => { setPhotoModalMode(null); setPhotoJobId(null); }}
        onCapture={handlePhotoCaptured}
        title={photoModalMode === "before" ? "Photo avant intervention" : "Photo après intervention"}
      />

      <div ref={containerRef} className="w-full max-w-[448px] mx-auto px-4 pb-28">
        {/* ─── Sticky Header ─── */}
        <header className="sticky top-0 z-20 bg-[#F5F5F0]/90 backdrop-blur-xl pt-3 pb-2">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-100 border-2 border-white shadow-sm">
                {pro.avatarUrl ? (
                  <img src={pro.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-gray-400" />
                  </div>
                )}
              </div>
              <div>
                <p className="text-[13px] font-bold text-gray-900 leading-tight">{firstName}</p>
                <div className="flex items-center gap-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${isAvailable ? "bg-green-500" : "bg-gray-400"}`} />
                  <span className={`text-[9px] font-medium ${isAvailable ? "text-green-600" : "text-gray-400"}`}>
                    {isAvailable ? "En ligne" : "Hors ligne"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full">
                <span className="text-[11px]">{level.emoji}</span>
                <span className={`text-[10px] font-bold ${level.color}`}>{level.label}</span>
              </div>
              <button onClick={() => setShowNotifications(true)}
                className="relative w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center cursor-pointer active:scale-90 transition-transform shadow-sm">
                <Bell className="w-4 h-4 text-gray-700" />
                {unreadNotifs > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-1">
                    {unreadNotifs > 9 ? "9+" : unreadNotifs}
                  </span>
                )}
              </button>
              <button onClick={() => setMenuOpen(true)}
                className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center cursor-pointer active:scale-90 transition-transform shadow-sm">
                <div className="w-4 h-3 flex flex-col justify-between">
                  <span className="block h-0.5 w-full bg-gray-700 rounded-full" />
                  <span className="block h-0.5 w-3/4 bg-gray-700 rounded-full" />
                  <span className="block h-0.5 w-full bg-gray-700 rounded-full" />
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* ─── Active Mission Control ─── */}
        {activeJob && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
            <div className="bg-white border border-gray-200 rounded-[20px] p-4 shadow-sm">
              <div className="flex items-center gap-1 mb-3">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-[11px] font-bold text-green-600 uppercase tracking-wider">
                  {activeJob.status === "quote_required" ? "Devis requis" :
                   activeJob.status === "en_route" ? "En route" :
                   activeJob.status === "arrived" ? "Arrivé sur place" :
                   activeJob.status === "photos_taken" ? "Photos prises" :
                   activeJob.status === "in_progress" ? "En cours" :
                   activeJob.status === "completed" ? "Terminée" :
                   activeJob.status === "client_validation" ? "En validation" :
                   "Mission acceptée"}
                </span>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-[16px]">👤</div>
                <div>
                  <p className="text-[14px] font-bold text-gray-900">{activeJob.clientName}</p>
                  <p className="text-[11px] text-gray-500">{activeJob.clientLocation}</p>
                </div>
                <div className="ml-auto flex items-center gap-1 text-[12px] text-gray-500">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  <span>4.9</span>
                </div>
              </div>

              <div className="flex gap-2 mb-3">
                <button onClick={() => openMapForJob(activeJob)}
                  className="flex-1 h-10 rounded-[12px] bg-gray-900 text-white text-[11px] font-bold cursor-pointer active:scale-[0.97] transition-transform flex items-center justify-center gap-1.5 shadow-sm">
                  <Navigation className="w-3.5 h-3.5" /> Naviguer
                </button>
                <button onClick={() => openChatForJob(activeJob)}
                  className="flex-1 h-10 rounded-[12px] border border-gray-200 text-gray-700 text-[11px] font-bold cursor-pointer active:scale-[0.97] transition-transform flex items-center justify-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5" /> Chat
                </button>
                <a href={`tel:${activeJob.clientPhone}`}
                  className="w-10 h-10 rounded-[12px] border border-gray-200 text-gray-700 flex items-center justify-center cursor-pointer active:scale-90 transition-transform">
                  <Phone className="w-4 h-4" />
                </a>
              </div>

              {/* Status progression */}
              <div className="flex items-center justify-between bg-gray-50 rounded-[12px] p-2">
                {STATUS_FLOW.map((s, i) => {
                  const flowIdx = STATUS_FLOW.indexOf(activeJob.status as typeof STATUS_FLOW[number]);
                  const done = i < flowIdx;
                  const active = i === flowIdx;
                  const labels: Record<string, string> = {
                    accepted: "En route",
                    en_route: "Arrivé",
                    arrived: "Photo",
                    photos_taken: "Commencer",
                    in_progress: "Terminer",
                    completed: "Validé",
                    client_validation: "Clôturé",
                  };
                  return (
                    <div key={s} className="flex flex-col items-center flex-1">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                        done ? "bg-gray-900 text-white" : active ? "bg-gray-900 text-white shadow-md" : "bg-gray-200 text-gray-400"
                      }`}>
                        {done ? <Check className="w-3 h-3" /> : active ? <div className="w-2 h-2 rounded-full bg-white" /> : <span className="text-[9px] font-bold">{i + 1}</span>}
                      </div>
                      <span className={`text-[7px] mt-1 font-bold text-center leading-tight uppercase tracking-wider ${
                        active ? "text-gray-900" : done ? "text-gray-500" : "text-gray-300"
                      }`}>{labels[s]}</span>
                    </div>
                  );
                })}
              </div>

              {/* Progression button */}
              {activeJob.status === "client_validation" ? (
                <div className="w-full mt-3 h-11 rounded-[12px] bg-gray-100 text-gray-400 text-[12px] font-bold flex items-center justify-center gap-2">
                  <Clock className="w-3.5 h-3.5" /> En attente de validation du client
                </div>
              ) : nextStatus(activeJob.status) && (
                <button onClick={() => handleAdvanceClick(activeJob.id, activeJob.status)}
                  className="w-full mt-3 h-11 rounded-[12px] bg-gray-900 text-white text-[12px] font-bold cursor-pointer active:scale-[0.97] transition-transform hover:bg-gray-800 shadow-sm">
                  {FLOW_BUTTON_LABELS[activeJob.status] || "Continuer"}
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* ─── Nouvelle Mission Alert Cards ─── */}
        {activeMissions.length > 0 && (
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <h2 className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Nouvelles missions</h2>
            </div>
            {activeMissions.map((alert) => (
              <motion.div key={alert.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-200 rounded-[20px] p-4 shadow-sm cursor-pointer active:scale-[0.99] transition-transform"
                onClick={() => { setSelectedAlert(alert); setShowMissionDetail(true); }}>
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-[10px] text-white font-bold">N</span>
                  </div>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Nouvelle mission</span>
                  <span className="text-[9px] text-gray-400 ml-auto">Il y a 10 s</span>
                </div>

                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-[16px]">👤</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[14px] font-bold text-gray-900">{alert.clientName}</p>
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span className="text-[11px] font-bold text-gray-600">4.9</span>
                      <ShieldCheck className="w-3 h-3 text-green-500" />
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                      <span>{alert.category}</span>
                    </div>
                  </div>
                </div>

                <p className="text-[12px] font-semibold text-gray-800 mb-2 line-clamp-1">{alert.description}</p>

                <div className="flex items-center gap-3 text-[11px] text-gray-600 mb-3">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-gray-400" /> {alert.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gray-400" /> 7 min
                  </span>
                  <span className="flex items-center gap-1 font-bold text-gray-900 ml-auto">
                    <DollarSign className="w-3 h-3" /> {alert.estimatedPriceMinXOF.toLocaleString("fr-FR")} F
                  </span>
                </div>

                <div className="flex gap-2">
                  <button onClick={(e) => { e.stopPropagation(); handleRefuseAlert(alert.id); }}
                    className="flex-1 h-11 rounded-[12px] border-2 border-red-100 text-red-500 text-[12px] font-bold cursor-pointer active:scale-[0.97] transition-transform hover:bg-red-50 flex items-center justify-center gap-1.5">
                    <XCircle className="w-4 h-4" /> Refuser
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleAcceptAlert(alert.id); }}
                    className="flex-1 h-11 rounded-[12px] bg-gray-900 text-white text-[12px] font-bold cursor-pointer active:scale-[0.97] transition-transform hover:bg-gray-800 flex items-center justify-center gap-1.5 shadow-sm">
                    <Check className="w-4 h-4" /> Accepter
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* ─── Stats Card ─── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-[20px] p-4 shadow-sm mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="text-[18px] font-extrabold text-gray-900">{rating}</span>
              </div>
              <span className="text-[12px] text-gray-500">({pro.reviewCount} avis)</span>
            </div>
            {pro.isVerified && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full">
                <CheckCircle className="w-3 h-3 text-gray-700" />
                <span className="text-[10px] font-medium text-gray-700">Vérifié</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-4 gap-2 mb-3">
            {[
              { label: "Réponse", value: `${pro.avgResponseTimeMinutes ?? 5} min`, icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Complétion", value: `${pro.completionRate ?? 95}%`, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
              { label: "Clients", value: `${pro.clientCount ?? 98}`, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
              { label: "Missions", value: `${pro.completedInterventions}`, icon: CalendarDays, color: "text-amber-600", bg: "bg-amber-50" },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className={`${s.bg} rounded-[12px] p-2.5 text-center`}>
                  <Icon className={`w-4 h-4 ${s.color} mx-auto mb-0.5`} />
                  <p className="text-[13px] font-extrabold text-gray-900">{s.value}</p>
                  <p className="text-[8px] text-gray-500 uppercase tracking-wide">{s.label}</p>
                </div>
              );
            })}
          </div>

          <div className="bg-gray-50 rounded-[12px] p-3">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[13px]">{level.emoji}</span>
                <span className="text-[11px] font-medium text-gray-600">Niveau {level.label}</span>
              </div>
              <span className="text-[10px] font-bold text-gray-900">
                {nextLevel ? `${nextLevelXp} XP → ${nextLevel.label}` : "Niveau max"}
              </span>
            </div>
            <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpPercent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-full rounded-full ${nextLevel ? "bg-gray-900" : "bg-amber-500"}`}
              />
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[9px] text-gray-400">{xpProgress.toLocaleString("fr-FR")} XP</span>
              <span className="text-[9px] text-gray-400">{nextLevel ? `${nextLevel.minXP.toLocaleString("fr-FR")} XP` : "MAX"}</span>
            </div>
          </div>
        </motion.div>

        {/* ─── Revenue Section ─── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-white border border-gray-200 rounded-[20px] p-4 shadow-sm mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-gray-900" />
              <span className="text-[14px] font-bold text-gray-900">Revenus</span>
            </div>
            <button onClick={() => nav("/pro/revenues")}
              className="text-[11px] font-medium text-gray-700 cursor-pointer hover:underline">
              Voir tout
            </button>
          </div>

          <div className="flex items-end gap-1 mb-4">
            <span className="text-[28px] font-extrabold text-gray-900 font-mono">
              {displayFinance.available.toLocaleString("fr-FR")}
            </span>
            <span className="text-[12px] font-medium text-gray-500 mb-1">F CFA</span>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: "Aujourd'hui", value: displayFinance.today },
              { label: "Cette semaine", value: displayFinance.week },
              { label: "Ce mois", value: displayFinance.month },
            ].map((r) => (
              <div key={r.label} className="bg-gray-50 rounded-[10px] p-2.5 text-center">
                <p className="text-[10px] text-gray-500">{r.label}</p>
                <p className="text-[13px] font-extrabold text-gray-900 font-mono">{r.value.toLocaleString("fr-FR")}</p>
              </div>
            ))}
          </div>

          <div className="flex items-end gap-1 h-12">
            {MOCK_REVENUE_HISTORY.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(v / chartMax) * 100}%` }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="w-full bg-gray-900 rounded-t-sm opacity-80 hover:opacity-100 transition-opacity"
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* ─── Missions Section ─── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[14px] font-bold text-gray-900">Missions</h2>
            <button onClick={() => nav("/pro/missions")}
              className="text-[11px] font-medium text-gray-700 cursor-pointer hover:underline">
              Voir tout
            </button>
          </div>

          <div className="space-y-2">
            {MOCK_PRO_JOBS.filter((j) => missionFilter === "all" || j.status === missionFilter || (missionFilter === "upcoming" && j.status === "pending")).slice(0, 3).map((job) => (
              <div key={job.id} onClick={() => nav(`/pro/missions`)}
                className="bg-white border border-gray-200 rounded-[16px] p-3.5 cursor-pointer active:scale-[0.99] transition-transform shadow-sm">
                <div className="flex items-start justify-between mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <UserIcon className="w-4 h-4 text-gray-700" />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-gray-900">{job.clientName}</p>
                      <p className="text-[10px] text-gray-500">{job.clientLocation.split(",")[0]}</p>
                    </div>
                  </div>
                  <span className="text-[13px] font-extrabold text-gray-900 font-mono">{job.totalFeeXOF.toLocaleString("fr-FR")} F</span>
                </div>
                <p className="text-[11px] text-gray-600 line-clamp-1 ml-10.5">{job.serviceName}</p>
                <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-2 ml-10.5">
                  {job.scheduledDate && (
                    <span>{new Date(job.scheduledDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</span>
                  )}
                  {job.scheduledTime && <span>· {job.scheduledTime}</span>}
                  <span className="ml-auto px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                    {job.status === "pending" ? "Nouvelle" : job.status === "accepted" ? "Acceptée" : job.status === "quote_required" ? "Devis requis" : job.status === "en_route" ? "En route" : job.status === "arrived" ? "Arrivé" : job.status === "in_progress" ? "En cours" : job.status === "completed" ? "Terminée" : job.status === "client_validation" ? "Validation" : job.status === "closed" ? "Clôturée" : job.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ─── Performance ─── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white border border-gray-200 rounded-[20px] p-4 shadow-sm mb-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-gray-900" />
            <span className="text-[14px] font-bold text-gray-900">Performance</span>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { label: "Cette semaine", value: "+620 XP", icon: TrendingUp, color: "text-gray-900", bg: "bg-gray-100" },
              { label: "Missions", value: `${MOCK_DASH_DATA.missionsTrend}%`, icon: CalendarDays, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Avis", value: `${MOCK_DASH_DATA.ratingTrend}%`, icon: Star, color: "text-amber-600", bg: "bg-amber-50" },
            ].map((m) => {
              const Icon = m.icon;
              return (
                <div key={m.label} className={`${m.bg} rounded-[12px] p-3 text-center`}>
                  <Icon className={`w-4 h-4 ${m.color} mx-auto mb-1`} />
                  <p className="text-[14px] font-extrabold text-gray-900">{m.value}</p>
                  <p className="text-[8px] text-gray-500 uppercase tracking-wider">{m.label}</p>
                </div>
              );
            })}
          </div>

          <div className="space-y-2">
            <div className="bg-gray-50 rounded-[12px] p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
                <Target className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-medium text-gray-700">Encore <span className="font-bold text-gray-900">{nextLevel ? nextLevelXp : 0} XP</span> pour {nextLevel?.label ?? "le max"}</p>
                <div className="w-full h-1.5 bg-gray-200 rounded-full mt-1.5 overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${xpPercent}%` }} />
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-[12px] p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                <Star className="w-4 h-4 text-green-500" />
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-medium text-gray-700">Encore <span className="font-bold text-gray-900">{3 - (pro.reviewCount % 3)} avis 5★</span> pour le badge Premium</p>
                <div className="w-full h-1.5 bg-gray-200 rounded-full mt-1.5 overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${(pro.reviewCount % 3) / 3 * 100}%` }} />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ─── Quick Actions ─── */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button onClick={() => nav("/pro/services")}
            className="bg-white border border-gray-200 rounded-[16px] p-3.5 text-left cursor-pointer active:scale-[0.98] transition-transform hover:bg-gray-50 shadow-sm">
            <Settings className="w-4 h-4 text-gray-900 mb-1.5" />
            <p className="text-[12px] font-bold text-gray-900">Gérer mes services</p>
            <p className="text-[9px] text-gray-500">Tarifs, catégories</p>
          </button>
          <button onClick={() => nav("/profile/pro-preview")}
            className="bg-white border border-gray-200 rounded-[16px] p-3.5 text-left cursor-pointer active:scale-[0.98] transition-transform hover:bg-gray-50 shadow-sm">
            <Award className="w-4 h-4 text-gray-900 mb-1.5" />
            <p className="text-[12px] font-bold text-gray-900">Voir mon profil</p>
            <p className="text-[9px] text-gray-500">Aperçu client</p>
          </button>
        </div>

        <div className="text-center py-4">
          <p className="text-[10px] text-gray-400">ÇaMatch Prestataire v2.0</p>
        </div>
      </div>

      {/* Pricing model chooser */}
      <AnimatePresence>
        {showPricingChoice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center"
            onClick={() => { setShowPricingChoice(false); setPricingAlert(null); }}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-t-[24px] w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-2" />
              <div className="px-5 pb-8">
                <h3 className="text-[16px] font-bold text-gray-900 text-center mb-1">Type de prestation</h3>
                <p className="text-[11px] text-gray-500 text-center mb-5">Choisissez le modèle de tarification</p>

                <button onClick={() => handlePricingChoice("fixed")}
                  className="w-full mb-3 p-4 rounded-[14px] border-2 border-gray-200 text-left cursor-pointer active:scale-[0.98] transition-transform hover:border-gray-900">
                  <p className="text-[14px] font-bold text-gray-900 mb-1">💰 Prix fixe</p>
                  <p className="text-[11px] text-gray-500">Le prix est connu à l'avance. Paiement immédiat.</p>
                </button>

                <button onClick={() => handlePricingChoice("quote")}
                  className="w-full p-4 rounded-[14px] border-2 border-gray-200 text-left cursor-pointer active:scale-[0.98] transition-transform hover:border-gray-900">
                  <p className="text-[14px] font-bold text-gray-900 mb-1">📋 Sur devis</p>
                  <p className="text-[11px] text-gray-500">Vous établissez un devis détaillé. Paiement après acceptation.</p>
                </button>

                <button onClick={() => { setShowPricingChoice(false); setPricingAlert(null); }}
                  className="w-full mt-4 h-11 text-[13px] text-gray-500 font-medium cursor-pointer hover:text-gray-700 transition-colors">
                  Annuler
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <MissionDetailSheet
        open={showMissionDetail}
        onClose={() => setShowMissionDetail(false)}
        alert={selectedAlert}
        onAccept={() => selectedAlert && handleAcceptAlert(selectedAlert.id)}
        onRefuse={() => selectedAlert && handleRefuseAlert(selectedAlert.id)}
      />
    </div>
  );
}
