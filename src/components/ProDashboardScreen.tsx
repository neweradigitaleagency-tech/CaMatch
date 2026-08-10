import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Bell, XCircle, Check, CheckCircle, Clock, Coins,
  Phone, MessageCircle, Navigation, UserIcon, Settings, Award,
  CalendarDays, Wallet, FileText, ChevronRight,
} from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import { useProStore } from "../stores/proStore";
import { useNotificationStore } from "../stores/notificationStore";
import { useChatStore } from "../stores/chatStore";
import { useSubscriptionStore } from "../stores/subscriptionStore";
import { acceptAlertAsPro, syncMissionStatus } from "../services/missionSync";
import NotificationPanel from "./NotificationPanel";
import PhotoCaptureModal from "./PhotoCaptureModal";
import {
  MOCK_FINANCE_SUMMARY,
  MOCK_DASH_DATA, MOCK_REVIEWS, MOCK_PROS,
  MOCK_VERIFICATION,
} from "../services/mockData";
import type { ProAlert, ProJob } from "../types";
import { getProLevel, PRO_LEVELS } from "../types";
import HamburgerDrawer from "./HamburgerDrawer";
import RouteMapModal from "./RouteMapModal";
import { useNavigationStore } from "../navigation/navigationStore";
import { useAppNavigation } from "../navigation/useAppNavigation";
import { ACTIVE_JOB_STATUSES, nextStatus } from "./pro/dashboard";
import MissionSummary from "./pro/MissionSummary";
import type { MissionSummaryData } from "./pro/MissionSummary";
import { getProCommissionPercent } from "../data/proCommission";
import AvailabilityCard from "./pro/AvailabilityCard";
import ActiveMissionControl from "./pro/ActiveMissionControl";
import NewRequestsList from "./pro/NewRequestsList";
import TodayMissions from "./pro/TodayMissions";
import EarningsCard from "./pro/EarningsCard";
import PerformanceCard from "./pro/PerformanceCard";
import ProfileProgressCard from "./pro/ProfileProgressCard";
import ReviewsPreview from "./pro/ReviewsPreview";
import MessagesPreview from "./pro/MessagesPreview";
import QuickActions from "./pro/QuickActions";
import type { QuickAction } from "./pro/QuickActions";

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`bg-cm-border-soft/50 animate-pulse rounded-[14px] ${className}`} />;
}

function MissionDetailSheet({ open, onClose, alert, commissionPercent, onAccept, onRefuse }: {
  open: boolean;
  onClose: () => void;
  alert: ProAlert | null;
  commissionPercent: number;
  onAccept: () => void;
  onRefuse: () => void;
}) {
  if (!alert) return null;
  const mission: MissionSummaryData = {
    clientName: alert.clientName,
    clientAvatarUrl: alert.clientAvatarUrl,
    serviceName: alert.description,
    description: alert.description,
    address: alert.location,
    budgetMinXOF: alert.estimatedPriceMinXOF,
    budgetMaxXOF: alert.estimatedPriceMaxXOF,
    urgency: alert.urgency,
    distanceKm: "2,3 km",
    travelMinutes: "~7 min",
  };
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
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[448px] bg-cm-elevated rounded-t-[var(--radius-cm-xl)] max-h-[85vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-cm-border rounded-full mx-auto mt-3 mb-4" />
            <div className="px-5 pb-8">
              <MissionSummary mission={mission} commissionPercent={commissionPercent} />

              <div className="flex gap-3 mt-5">
                <button onClick={() => { onRefuse(); onClose(); }}
                  className="flex-1 h-12 rounded-[var(--radius-cm-lg)] border-2 border-cm-error/20 text-cm-error text-[13px] font-bold cursor-pointer active:scale-[0.97] transition-transform hover:bg-cm-error/5 flex items-center justify-center gap-2">
                  <XCircle className="w-4 h-4" /> Refuser
                </button>
                <button onClick={() => { onAccept(); onClose(); }}
                  className="flex-1 h-12 rounded-[var(--radius-cm-lg)] bg-cm-accent text-cm-text-onAccent text-[13px] font-bold cursor-pointer active:scale-[0.97] transition-transform hover:bg-cm-accent-hover flex items-center justify-center gap-2 shadow-cm-btn">
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

function JobDetailSheet({ open, onClose, job, commissionPercent, onChat, onNavigate, onAdvance }: {
  open: boolean;
  onClose: () => void;
  job: ProJob | null;
  commissionPercent: number;
  onChat: (job: ProJob) => void;
  onNavigate: (job: ProJob) => void;
  onAdvance: (job: ProJob) => void;
}) {
  if (!job) return null;
  const mission: MissionSummaryData = {
    clientName: job.clientName,
    clientAvatarUrl: job.clientAvatarUrl,
    serviceName: job.serviceName,
    description: job.description,
    address: job.clientLocation,
    scheduledDate: job.scheduledDate,
    scheduledTime: job.scheduledTime,
    amountXOF: job.totalFeeXOF,
  };
  const canNavigate = ACTIVE_JOB_STATUSES.includes(job.status) && job.status !== "quote_required";
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
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[448px] bg-cm-elevated rounded-t-[var(--radius-cm-xl)] max-h-[85vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-cm-border rounded-full mx-auto mt-3 mb-4" />
            <div className="px-5 pb-8">
              <MissionSummary mission={mission} commissionPercent={commissionPercent} />

              <div className="flex gap-3 mt-5">
                {job.status === "quote_required" ? (
                  <button onClick={() => { onAdvance(job); onClose(); }}
                    className="flex-1 h-12 rounded-[var(--radius-cm-lg)] bg-cm-accent text-cm-text-onAccent text-[13px] font-bold cursor-pointer active:scale-[0.97] transition-transform hover:bg-cm-accent-hover flex items-center justify-center gap-2 shadow-cm-btn">
                    <FileText className="w-4 h-4" /> Créer un devis
                  </button>
                ) : (
                  <button onClick={() => { onAdvance(job); onClose(); }}
                    className="flex-1 h-12 rounded-[var(--radius-cm-lg)] bg-cm-accent text-cm-text-onAccent text-[13px] font-bold cursor-pointer active:scale-[0.97] transition-transform hover:bg-cm-accent-hover flex items-center justify-center gap-2 shadow-cm-btn">
                    <ChevronRight className="w-4 h-4" /> Faire avancer
                  </button>
                )}
                {canNavigate && (
                  <button onClick={() => { onNavigate(job); onClose(); }}
                    className="flex-1 h-12 rounded-[var(--radius-cm-lg)] border-2 border-cm-accent/20 text-cm-accent text-[13px] font-bold cursor-pointer active:scale-[0.97] transition-transform hover:bg-cm-accent/5 flex items-center justify-center gap-2">
                    <Navigation className="w-4 h-4" /> Itinéraire
                  </button>
                )}
              </div>
              <button onClick={() => { onChat(job); onClose(); }}
                className="w-full mt-3 h-12 rounded-[var(--radius-cm-lg)] border-2 border-cm-border text-cm-text text-[13px] font-bold cursor-pointer active:scale-[0.97] transition-transform hover:bg-cm-surface flex items-center justify-center gap-2">
                <MessageCircle className="w-4 h-4" /> Message
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function ProDashboardScreen() {
  const { navigate: nav } = useAppNavigation();
  const isAvailable = useProStore((s) => s.isAvailable);
  const toggleAvailability = useProStore((s) => s.toggleAvailability);
  const storeAlerts = useProStore((s) => s.alerts);
  const storeJobs = useProStore((s) => s.jobs);
  const storeConversations = useChatStore((s) => s.conversations);
  const addNotification = useNotificationStore((s) => s.addNotification);
  const unreadNotifs = useNotificationStore((s) => s.notifications.filter((n) => !n.read).length);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const reopenMenu = useNavigationStore((s) => s.flags["reopen-menu"] === true);
  const clearFlag = useNavigationStore((s) => s.clearFlag);
  useEffect(() => {
    if (reopenMenu) {
      setMenuOpen(true);
      clearFlag("reopen-menu");
    }
  }, [reopenMenu, clearFlag]);

  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<ProAlert | null>(null);
  const [showMissionDetail, setShowMissionDetail] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [mapJob, setMapJob] = useState<ProJob | null>(null);
  const [photoModalMode, setPhotoModalMode] = useState<"before" | "after" | null>(null);
  const [photoJobId, setPhotoJobId] = useState<string | null>(null);
  const [showPricingChoice, setShowPricingChoice] = useState(false);
  const [pricingAlert, setPricingAlert] = useState<ProAlert | null>(null);
  const [selectedJob, setSelectedJob] = useState<ProJob | null>(null);
  const [showJobDetail, setShowJobDetail] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const pro = MOCK_PROS[5]!;
  const firstName = pro.name.split(" ")[0] ?? pro.name;
  const userId = useAuthStore((s) => s.userId);
  const currentSubscription = useSubscriptionStore((s) => s.currentSubscription);
  const availablePlans = useSubscriptionStore((s) => s.availablePlans);
  const fetchCurrent = useSubscriptionStore((s) => s.fetchCurrent);
  const fetchPlans = useSubscriptionStore((s) => s.fetchPlans);

  useEffect(() => {
    if (userId) {
      fetchCurrent(userId);
      fetchPlans("PRO");
    }
  }, [userId, fetchCurrent, fetchPlans]);

  const currentPlan = availablePlans.find((p) => p.id === currentSubscription?.plan_id);
  const isFree = !currentSubscription || !currentPlan || currentPlan.price_monthly === 0;
  const commissionPercent = getProCommissionPercent(currentSubscription?.plan_id);
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
    pending: MOCK_FINANCE_SUMMARY.pendingBalanceXOF,
  };

  const reviews = MOCK_REVIEWS
    .filter((r) => r.proId === pro.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const handleAcceptAlert = (alertId: string) => {
    const alert = storeAlerts.find((a) => a.id === alertId);
    if (!alert) return;
    setPricingAlert(alert);
    setShowPricingChoice(true);
  };

  const handlePricingChoice = (model: "fixed" | "quote") => {
    const alert = pricingAlert;
    if (!alert) return;
    setShowPricingChoice(false);
    setPricingAlert(null);

    const { job } = acceptAlertAsPro(alert, model);

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
        actionUrl: `/pro/mission/${job.id}`,
      });
    }
  };

  const handleRefuseAlert = (alertId: string) => {
    const alert = storeAlerts.find((a) => a.id === alertId);
    if (!alert) return;
    useProStore.getState().removeAlert(alertId);

    addNotification({
      type: "info",
      title: "Mission refusée",
      body: `Vous avez refusé la mission de ${alert.clientName}`,
    });
  };

  const advanceJobStatus = (jobId: string, extraFields?: Partial<ProJob>) => {
    const state = useProStore.getState();
    const job = state.jobs.find((j) => j.id === jobId);
    if (!job) return;

    const next = nextStatus(job.status);
    if (!next) return;

    const merged: ProJob = { ...job, ...extraFields, status: next };
    state.upsertJob(merged);
    syncMissionStatus(jobId, next);

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
      title: "Statut mis à jour",
      body: statusLabels[next] || next,
      actionUrl: `/orders/tracker/${jobId}`,
    });
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

  const openMapForJob = (job: ProJob) => {
    setMapJob(job);
    setShowMap(true);
  };

  const openChatForJob = async (job: ProJob) => {
    const currentUserId = useAuthStore.getState().userId;
    if (!currentUserId || !job.clientId) return;
    const conv = await useChatStore.getState().createConversation({
      participant1: currentUserId,
      participant2: job.clientId,
      jobId: job.id,
    });
    if (conv) {
      nav(`/pro/messages/${conv.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-dynamic bg-cm-bg p-4 w-full max-w-[448px] mx-auto space-y-4 pt-14">
        <SkeletonBlock className="h-14 w-full" />
        <SkeletonBlock className="h-32 w-full" />
        <SkeletonBlock className="h-48 w-full" />
        <SkeletonBlock className="h-64 w-full" />
        <SkeletonBlock className="h-32 w-full" />
      </div>
    );
  }

  const activeJob = storeJobs.find((j) => ACTIVE_JOB_STATUSES.includes(j.status));

  const quickActions: QuickAction[] = [
    { icon: <Settings className="w-4 h-4" />, label: "Gérer mes services", hint: "Tarifs, catégories", onClick: () => nav("/pro/services") },
    { icon: <CalendarDays className="w-4 h-4" />, label: "Mes horaires", hint: "Disponibilités", onClick: () => nav("/pro/planning") },
    { icon: <Wallet className="w-4 h-4" />, label: "Mon portefeuille", hint: "Soldes, retraits", onClick: () => nav("/pro/wallet") },
    { icon: <Award className="w-4 h-4" />, label: "Aperçu profil", hint: "Vu par les clients", onClick: () => nav("/profile/pro-preview") },
  ];

  return (
    <div className="min-h-dynamic bg-cm-bg">
      <HamburgerDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
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

      <div className="w-full max-w-[448px] mx-auto px-4 pb-28">
        {/* ─── Sticky Header ─── */}
        <header className="sticky top-0 z-20 bg-cm-bg/90 backdrop-blur-xl pt-3 pb-2">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-cm-surface border-2 border-cm-bg shadow-sm shrink-0">
                {pro.avatarUrl ? (
                  <img src={pro.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-cm-text-muted" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-cm-text leading-tight truncate">{firstName}</p>
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${isAvailable ? "bg-green-500" : "bg-cm-text-muted"}`} />
                  <span className={`text-[9px] font-medium ${isAvailable ? "text-green-600" : "text-cm-text-muted"}`}>
                    {isAvailable ? "En ligne" : "Hors ligne"}
                  </span>
                  {pro.isVerified && (
                    <>
                      <span className="text-[9px] text-cm-text-muted">·</span>
                      <span className="flex items-center gap-0.5 text-[9px] font-medium text-cm-text-soft">
                        <CheckCircle className="w-2.5 h-2.5" /> Vérifié
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1 px-2 py-1 bg-cm-surface rounded-full">
                <span className="text-[11px]">{level.emoji}</span>
                <span className={`text-[10px] font-bold ${level.color}`}>{level.label}</span>
              </div>
              <button onClick={() => setShowNotifications(true)}
                className="relative w-8 h-8 flex items-center justify-center cursor-pointer active:scale-90 transition-transform">
                <Bell className="w-4 h-4 text-cm-text-soft" />
                {unreadNotifs > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-1">
                    {unreadNotifs > 9 ? "9+" : unreadNotifs}
                  </span>
                )}
              </button>
              <button onClick={() => setMenuOpen(true)}
                className="w-8 h-8 flex items-center justify-center cursor-pointer active:scale-90 transition-transform">
                <div className="w-4 h-3 flex flex-col justify-between">
                  <span className="block h-0.5 w-full bg-cm-text-soft rounded-full" />
                  <span className="block h-0.5 w-3/4 bg-cm-text-soft rounded-full" />
                  <span className="block h-0.5 w-full bg-cm-text-soft rounded-full" />
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* ─── Availability Hero ─── */}
        <AvailabilityCard
          isAvailable={isAvailable}
          todayJobsCount={storeJobs.length}
          pendingRequestsCount={storeAlerts.length}
          onToggle={toggleAvailability}
        />

        {/* ─── Active Mission Control ─── */}
        {activeJob && (
          <ActiveMissionControl
            job={activeJob}
            onNavigate={() => openMapForJob(activeJob)}
            onChat={() => openChatForJob(activeJob)}
            onAdvance={() => handleAdvanceClick(activeJob.id, activeJob.status)}
          />
        )}

        {/* ─── Nouvelle Missions ─── */}
        <NewRequestsList
          alerts={storeAlerts}
          onAccept={handleAcceptAlert}
          onRefuse={handleRefuseAlert}
          onOpenDetail={(alert) => { setSelectedAlert(alert); setShowMissionDetail(true); }}
        />

        {/* ─── Aujourd'hui ─── */}
        <TodayMissions
          jobs={storeJobs}
          onOpenJob={(job) => { setSelectedJob(job); setShowJobDetail(true); }}
          onViewAll={() => nav("/pro/missions")}
        />

        {/* ─── Revenus ─── */}
        <EarningsCard
          finance={displayFinance}
          onWithdraw={() => nav("/pro/wallet")}
          onViewAll={() => nav("/pro/revenues")}
        />

        {/* ─── Performance ─── */}
        <PerformanceCard
          isFree={isFree}
          missionsTrend={MOCK_DASH_DATA.missionsTrend}
          ratingTrend={MOCK_DASH_DATA.ratingTrend}
          responseMinutes={pro.avgResponseTimeMinutes ?? 5}
          completionRate={pro.completionRate ?? 95}
          reviewsToBadge={3 - (pro.reviewCount % 3)}
          reviewProgressPercent={((pro.reviewCount % 3) / 3) * 100}
          onUpgrade={() => nav("/pro/subscription/plans")}
        />

        {/* ─── Profil & vérifications ─── */}
        <ProfileProgressCard
          verification={MOCK_VERIFICATION}
          level={{ emoji: level.emoji, label: level.label, color: level.color }}
          xpPercent={xpPercent}
          nextLevelLabel={nextLevel?.label ?? null}
          nextLevelXp={nextLevelXp}
          onOpen={() => nav("/profile/pro-verification")}
        />

        {/* ─── Avis ─── */}
        <ReviewsPreview
          reviews={reviews}
          rating={Number(rating)}
          reviewCount={pro.reviewCount}
          onViewAll={() => nav("/pro/stats")}
        />

        {/* ─── Messages ─── */}
        <MessagesPreview
          conversations={storeConversations}
          onOpen={(id) => nav(`/pro/messages/${id}`)}
          onViewAll={() => nav("/pro/messages")}
        />

        {/* ─── Raccourcis ─── */}
        <QuickActions actions={quickActions} />

        <div className="text-center py-4">
          <p className="text-[10px] text-cm-text-muted">ÇaMatch Prestataire v2.0</p>
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
              className="bg-cm-elevated rounded-t-[24px] w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-cm-border-soft rounded-full mx-auto mt-3 mb-2" />
              <div className="px-5 pb-8">
                <h3 className="text-[16px] font-bold text-cm-text text-center mb-1">Type de prestation</h3>
                <p className="text-[11px] text-cm-text-muted text-center mb-5">Choisissez le modèle de tarification</p>

                <button onClick={() => handlePricingChoice("fixed")}
                  className="w-full mb-3 p-4 rounded-[14px] border-2 border-cm-border text-left cursor-pointer active:scale-[0.98] transition-transform hover:border-cm-text">
                  <p className="text-[14px] font-bold text-cm-text mb-1">💰 Prix fixe</p>
                  <p className="text-[11px] text-cm-text-muted">Le prix est connu à l'avance. Paiement immédiat.</p>
                </button>

                <button onClick={() => handlePricingChoice("quote")}
                  className="w-full p-4 rounded-[14px] border-2 border-cm-border text-left cursor-pointer active:scale-[0.98] transition-transform hover:border-cm-text">
                  <p className="text-[14px] font-bold text-cm-text mb-1">📋 Sur devis</p>
                  <p className="text-[11px] text-cm-text-muted">Vous établissez un devis détaillé. Paiement après acceptation.</p>
                </button>

                <button onClick={() => { setShowPricingChoice(false); setPricingAlert(null); }}
                  className="w-full mt-4 h-11 text-[13px] text-cm-text-muted font-medium cursor-pointer hover:text-cm-text-soft transition-colors">
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
        commissionPercent={commissionPercent}
        onAccept={() => selectedAlert && handleAcceptAlert(selectedAlert.id)}
        onRefuse={() => selectedAlert && handleRefuseAlert(selectedAlert.id)}
      />

      <JobDetailSheet
        open={showJobDetail}
        onClose={() => setShowJobDetail(false)}
        job={selectedJob}
        commissionPercent={commissionPercent}
        onChat={openChatForJob}
        onNavigate={openMapForJob}
        onAdvance={(job) => handleAdvanceClick(job.id, job.status)}
      />
    </div>
  );
}
