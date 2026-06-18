import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import {
  Bell,
  Clock,
  MapPin,
  Phone,
  UserIcon,
  X,
  Check,
  AlertTriangle,
} from "lucide-react";
import { ProAlert } from "../types";

interface Props {
  alert: ProAlert;
  onAccept: (alert: ProAlert) => void;
  onDecline: (alert: ProAlert) => void;
  onDismiss: () => void;
}

export default function ProJobAlertScreen({
  alert,
  onAccept,
  onDecline,
  onDismiss,
}: Props) {
  const [countdown, setCountdown] = useState(120);
  const [decision, setDecision] = useState<"idle" | "accepted" | "declined">("idle");
  const hasExpired = useRef(false);

  useEffect(() => {
    if (countdown <= 0 && !hasExpired.current) {
      hasExpired.current = true;
      onDecline(alert);
    }
    const timer = setInterval(() => {
      setCountdown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown, alert, onDecline]);

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  const handleAccept = () => {
    hasExpired.current = true;
    setDecision("accepted");
    setTimeout(() => onAccept(alert), 800);
  };

  const handleDecline = () => {
    hasExpired.current = true;
    setDecision("declined");
    setTimeout(() => onDecline(alert), 400);
  };

  const urgencyColor =
    alert.urgency === "emergency"
      ? "text-red-400"
      : alert.urgency === "high"
      ? "text-amber-400"
      : "text-brand-lime";

  const urgencyLabel =
    alert.urgency === "emergency"
      ? "URGENCE"
      : alert.urgency === "high"
      ? "PRIORITAIRE"
      : "NOUVELLE MISSION";

  if (decision === "accepted") {
    return (
      <motion.div
        key="accepted"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 z-50 bg-brand-forest flex flex-col items-center justify-center px-8"
      >
        <div className="w-20 h-20 rounded-full bg-brand-lime flex items-center justify-center mb-6">
          <Check className="w-10 h-10 text-brand-forest" />
        </div>
        <h2 className="text-white text-2xl font-extrabold mb-2 text-center">
          Mission Acceptée !
        </h2>
        <p className="text-white/60 text-sm text-center">
          {alert.clientName} sera notifié. Préparez-vous pour l'intervention.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center"
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-w-md bg-brand-cream rounded-t-4xl sm:rounded-3xl p-6 pb-10 space-y-5 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              alert.urgency === "emergency" ? "bg-red-100 animate-pulse" : "bg-brand-lime/20"
            }`}>
              <Bell className={`w-5 h-5 ${
                alert.urgency === "emergency" ? "text-red-500" : "text-brand-forest"
              }`} />
            </div>
            <div>
              <p className={`text-[9px] font-extrabold uppercase tracking-wider ${urgencyColor}`}>
                {urgencyLabel}
              </p>
              <h2 className="text-lg font-extrabold text-brand-forest">
                {alert.clientName}
              </h2>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm cursor-pointer"
          >
            <X className="w-4 h-4 text-secondary" />
          </button>
        </div>

        {/* Timer */}
        <div className="bg-brand-forest text-white p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-brand-lime" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Temps restant
            </span>
          </div>
          <span
            className={`text-2xl font-extrabold font-mono ${
              countdown <= 30
                ? "text-red-400"
                : countdown <= 60
                ? "text-amber-400"
                : "text-white"
            }`}
          >
            {minutes}:{seconds.toString().padStart(2, "0")}
          </span>
        </div>

        {/* Description */}
        <div className="bg-white p-4 rounded-2xl space-y-3">
          <div>
            <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              Description
            </p>
            <p className="text-sm font-medium leading-relaxed">
              {alert.description}
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-on-surface-variant">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> {alert.location}
            </span>
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" /> {alert.clientPhone}
            </span>
          </div>

          {alert.urgency === "emergency" && (
            <div className="flex items-center gap-2 bg-red-50 p-3 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-[10px] text-red-600 font-bold">
                Urgence signalée par le client — intervention prioritaire
              </p>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="bg-white p-4 rounded-2xl flex items-center justify-between">
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            Estimation
          </span>
          <span className="text-lg font-extrabold text-brand-forest">
            {alert.estimatedPriceMinXOF.toLocaleString()} -{" "}
            {alert.estimatedPriceMaxXOF.toLocaleString()} F
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleDecline}
            className="flex-1 py-4 rounded-2xl border-2 border-red-200 text-red-600 font-extrabold text-sm uppercase tracking-wider hover:bg-red-50 transition-all active:scale-95 cursor-pointer"
          >
            Refuser
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 py-4 rounded-2xl bg-brand-lime text-brand-forest font-extrabold text-sm uppercase tracking-wider hover:brightness-110 transition-all active:scale-95 cursor-pointer"
          >
            Accepter
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
