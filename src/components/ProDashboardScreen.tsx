import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  DollarSign,
  CalendarCheck,
  Clock,
  Star,
  MapPin,
  Phone,
  ChevronRight,
  Bell,
  Power,
  TrendingUp,
  Wallet,
  Briefcase,
  UserIcon,
} from "lucide-react";
import {
  ProfessionalDetails,
  ProJob,
  ProAlert,
  ProDashboardStats,
} from "../types";

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
}: Props) {
  const [showEarningsDetail, setShowEarningsDetail] = useState(false);
  const [currentAlertIndex, setCurrentAlertIndex] = useState(0);

  const currentAlert = alerts.length > 0 ? alerts[currentAlertIndex] : null;

  return (
    <div className="px-5 py-5 pb-32 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-brand-lime">
            <img
              alt={pro.name}
              className="w-full h-full object-cover"
              src={pro.avatarUrl}
            />
          </div>
          <div>
            <h2 className="font-sans text-lg font-extrabold text-brand-forest leading-tight">
              {pro.name}
            </h2>
            <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">
              {pro.title}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-pale-mint px-3 py-1.5 rounded-full">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold">{pro.rating}</span>
          </div>
        </div>
      </div>

      {/* Availability Toggle */}
      <div
        className={`p-4 rounded-3xl flex items-center justify-between cursor-pointer transition-colors ${
          available
            ? "bg-brand-lime/20 border border-brand-lime/40"
            : "bg-red-50 border border-red-200"
        }`}
        onClick={onToggleAvailability}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              available ? "bg-brand-lime" : "bg-red-200"
            }`}
          >
            <Power className={`w-5 h-5 ${available ? "text-brand-forest" : "text-red-600"}`} />
          </div>
          <div>
            <h4 className="font-sans text-xs font-extrabold uppercase tracking-wider">
              {available ? "Disponible" : "Indisponible"}
            </h4>
            <p className="text-[10px] text-on-surface-variant mt-0.5">
              {available
                ? "Vous recevez les alertes de missions"
                : "Vous ne recevez pas de nouvelles missions"}
            </p>
          </div>
        </div>
        <div
          className={`relative w-12 h-7 rounded-full transition-colors ${
            available ? "bg-brand-lime" : "bg-gray-300"
          }`}
        >
          <div
            className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
              available ? "translate-x-5.5 left-0.5" : "translate-x-0.5 left-0"
            }`}
          />
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
            className="bg-brand-forest text-white p-5 rounded-3xl space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center animate-pulse">
                  <Bell className="w-4 h-4 text-white" />
                </div>
                <span className="text-[10px] font-bold text-brand-lime uppercase tracking-wider">
                  Nouvelle mission
                </span>
              </div>
              <span className="text-[10px] font-bold text-brand-lime bg-brand-lime/20 px-2 py-1 rounded-full">
                {currentAlert.urgency === "emergency"
                  ? "URGENT"
                  : currentAlert.urgency === "high"
                  ? "Prioritaire"
 : "Standard"}
              </span>
            </div>

            <div>
              <h3 className="font-sans text-base font-bold">
                {currentAlert.clientName}
              </h3>
              <p className="text-xs text-white/70 mt-0.5">
                {currentAlert.description}
              </p>
            </div>

            <div className="flex items-center gap-4 text-[10px] text-white/70">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {currentAlert.location}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3" /> {currentAlert.clientPhone}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-[9px] text-white/50 uppercase tracking-wider">
                  Estimation
                </p>
                <p className="text-sm font-extrabold text-brand-lime">
                  {currentAlert.estimatedPriceMinXOF.toLocaleString()} -{" "}
                  {currentAlert.estimatedPriceMaxXOF.toLocaleString()} F CFA
                </p>
              </div>
              <CountdownTimer
                expiresAt={currentAlert.expiresAt}
                onExpire={() => onDeclineAlert(currentAlert)}
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => onAcceptAlert(currentAlert)}
                className="flex-1 bg-brand-lime text-brand-forest font-extrabold text-xs py-3 rounded-xl uppercase tracking-wider hover:brightness-110 transition-all active:scale-95 cursor-pointer"
              >
                Accepter
              </button>
              <button
                onClick={() => {
                  onDeclineAlert(currentAlert);
                  if (currentAlertIndex < alerts.length - 1) {
                    setCurrentAlertIndex((i) => i + 1);
                  }
                }}
                className="flex-1 bg-white/10 text-white font-extrabold text-xs py-3 rounded-xl uppercase tracking-wider hover:bg-white/20 transition-all active:scale-95 cursor-pointer"
              >
                Refuser
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Earnings Card */}
      <div
        className="bg-white p-5 rounded-3xl shadow-premium border border-pale-mint/15 space-y-3 cursor-pointer"
        onClick={() => setShowEarningsDetail(!showEarningsDetail)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-brand-lime/20 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-brand-forest" />
            </div>
            <h4 className="font-sans text-xs font-extrabold uppercase tracking-wider">
              Mes Revenus
            </h4>
          </div>
          <ChevronRight
            className={`w-4 h-4 text-secondary transition-transform ${
              showEarningsDetail ? "rotate-90" : ""
            }`}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">
              Aujourd'hui
            </p>
            <p className="text-sm font-extrabold text-brand-forest mt-1">
              {stats.todayEarningsXOF.toLocaleString()} F
            </p>
          </div>
          <div className="text-center border-x border-pale-mint/30">
            <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">
              Cette Semaine
            </p>
            <p className="text-sm font-extrabold text-brand-forest mt-1">
              {stats.weekEarningsXOF.toLocaleString()} F
            </p>
          </div>
          <div className="text-center">
            <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">
              Ce Mois
            </p>
            <p className="text-sm font-extrabold text-brand-forest mt-1">
              {stats.monthEarningsXOF.toLocaleString()} F
            </p>
          </div>
        </div>

        {showEarningsDetail && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            className="pt-2 border-t border-pale-mint/20 space-y-2"
          >
            <div className="flex justify-between text-xs">
              <span className="text-on-surface-variant">Total missions</span>
              <span className="font-bold">{stats.totalJobsCompleted}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-on-surface-variant">Note moyenne</span>
              <span className="font-bold flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {stats.rating}/50
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-on-surface-variant">Avis clients</span>
              <span className="font-bold">{stats.reviewCount}</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Today's Jobs */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-sans text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
            <Briefcase className="w-4 h-4" /> Interventions du jour
          </h4>
          <span className="text-[10px] font-bold bg-pale-mint px-2.5 py-1 rounded-full">
            {stats.todayJobsCount} mission{stats.todayJobsCount > 1 ? "s" : ""}
          </span>
        </div>

        {todayJobs.length === 0 ? (
          <div className="bg-white p-6 rounded-3xl shadow-premium border border-pale-mint/15 text-center">
            <CalendarCheck className="w-10 h-10 text-secondary/60 mx-auto mb-2" />
            <p className="text-xs text-on-surface-variant font-medium">
              Aucune intervention prévue aujourd'hui
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {todayJobs.map((job) => (
              <div
                key={job.id}
                onClick={() => onViewJob(job)}
                className="bg-white p-4 rounded-2xl shadow-premium border border-pale-mint/15 flex items-center justify-between cursor-pointer hover:bg-pale-mint/30 transition-colors active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-pale-mint flex items-center justify-center">
                    {job.clientAvatarUrl ? (
                      <img
                        alt={job.clientName}
                        className="w-full h-full object-cover"
                        src={job.clientAvatarUrl}
                      />
                    ) : (
                      <UserIcon className="w-5 h-5 text-secondary" />
                    )}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold">{job.serviceName}</h5>
                    <p className="text-[10px] text-on-surface-variant flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> {job.clientLocation}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <StatusBadge status={job.status} />
                      <span className="text-[10px] font-bold text-brand-forest">
                        {job.totalFeeXOF.toLocaleString()} F
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-secondary shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-2xl shadow-premium border border-pale-mint/15">
          <TrendingUp className="w-5 h-5 text-brand-lime mb-2" />
          <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">
            Complétées
          </p>
          <p className="text-lg font-extrabold">{stats.totalJobsCompleted}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-premium border border-pale-mint/15">
          <DollarSign className="w-5 h-5 text-brand-lime mb-2" />
          <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">
            Taux horaire
          </p>
          <p className="text-lg font-extrabold">
            {pro.hourlyRateXOF.toLocaleString()} F
          </p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; classes: string }> = {
    pending: { label: "En attente", classes: "bg-amber-100 text-amber-700" },
    accepted: { label: "Accepté", classes: "bg-blue-100 text-blue-700" },
    en_route: { label: "En route", classes: "bg-purple-100 text-purple-700" },
    in_progress: {
      label: "En cours",
      classes: "bg-brand-lime/30 text-brand-forest",
    },
    completed: { label: "Terminé", classes: "bg-green-100 text-green-700" },
    cancelled: { label: "Annulé", classes: "bg-red-100 text-red-600" },
  };

  const c = config[status] || config.pending;
  return (
    <span
      className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${c.classes}`}
    >
      {c.label}
    </span>
  );
}

function CountdownTimer({
  expiresAt,
  onExpire,
}: {
  expiresAt: string;
  onExpire: () => void;
}) {
  const [remaining, setRemaining] = useState(120);

  useEffect(() => {
    const expires = new Date(expiresAt).getTime();
    const tick = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((expires - now) / 1000));
      setRemaining(diff);
      if (diff <= 0) onExpire();
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  return (
    <div className="flex items-center gap-1.5">
      <Clock className="w-3.5 h-3.5 text-white/70" />
      <span
        className={`text-sm font-extrabold font-mono ${
          remaining <= 30 ? "text-red-400" : remaining <= 60 ? "text-amber-400" : "text-white"
        }`}
      >
        {minutes}:{seconds.toString().padStart(2, "0")}
      </span>
    </div>
  );
}
