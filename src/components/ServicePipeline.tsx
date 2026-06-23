import { motion, AnimatePresence } from "motion/react";
import { Navigation, Home, CheckCircle, Phone, Clock, MapPin } from "lucide-react";
import type { TrackingData, ServiceStatus } from "../types";
import MapView from "./ui/MapView";

interface ServicePipelineProps {
  tracking: TrackingData;
}

const STEPS: { key: ServiceStatus; icon: typeof Navigation; label: string }[] = [
  { key: "EN_ROUTE", icon: Navigation, label: "En route" },
  { key: "SUR_PLACE", icon: Home, label: "Sur place" },
  { key: "TERMINE", icon: CheckCircle, label: "Terminé" },
];

export default function ServicePipeline({ tracking }: ServicePipelineProps) {
  const currentIdx = STEPS.findIndex((s) => s.key === tracking.status);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-[#1a0a2e] via-[#1f1926] to-[#1f1926]">
      <div className="max-w-md mx-auto px-4 pt-3 pb-4">
        {/* Pro info row */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-cm-accent shrink-0">
            <img src={tracking.proPhoto} alt={tracking.proName} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-white truncate">{tracking.proName}</p>
            <p className="text-[11px] text-white/60">{tracking.proPhone}</p>
          </div>
          <a href={`tel:${tracking.proPhone}`}
            className="w-9 h-9 rounded-full bg-cm-accent flex items-center justify-center shrink-0 cursor-pointer active:scale-90 transition-transform">
            <Phone className="w-4 h-4 text-white" />
          </a>
        </div>

        {/* Pipeline bar */}
        <div className="relative">
          <div className="flex items-center justify-between mb-1">
            {STEPS.map((step, i) => {
              const done = i <= currentIdx;
              const active = i === currentIdx;
              const StepIcon = step.icon;
              return (
                <div key={step.key} className="flex flex-col items-center relative z-10">
                  <motion.div
                    animate={active ? { scale: [1, 1.15, 1] } : {}}
                    transition={{ duration: 1.5, repeat: active ? Infinity : 0, repeatDelay: 1 }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500 ${
                      done ? "bg-cm-accent" : "bg-white/10"
                    }`}>
                    <StepIcon className={`w-4 h-4 ${done ? "text-white" : "text-white/40"}`} />
                  </motion.div>
                  <span className={`text-[10px] mt-1.5 font-medium whitespace-nowrap ${
                    active ? "text-white" : done ? "text-white/70" : "text-white/30"
                  }`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Connecting gradient line */}
          <div className="absolute top-[18px] left-[12.5%] right-[12.5%] h-[3px] rounded-full overflow-hidden">
            <div className="w-full h-full bg-white/10" />
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: `${(currentIdx / (STEPS.length - 1)) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-cm-accent via-white to-cm-accent"
            />
          </div>
        </div>

        {/* Status message */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tracking.status}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.3 }}
            className="mt-3 flex items-center gap-2">
            {tracking.status === "EN_ROUTE" && (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                  <Navigation className="w-4 h-4 text-cm-accent shrink-0" />
                </motion.div>
                <p className="text-[12px] text-white/80">
                  Arrivée estimée : <span className="text-cm-accent font-bold">{tracking.estimatedArrival}</span>
                </p>
              </>
            )}
            {tracking.status === "SUR_PLACE" && (
              <>
                <Clock className="w-4 h-4 text-cm-accent shrink-0" />
                <p className="text-[12px] text-white/80">
                  Votre artisan est arrivé et commence l'intervention
                </p>
              </>
            )}
            {tracking.status === "TERMINE" && (
              <>
                <CheckCircle className="w-4 h-4 text-cm-accent shrink-0" />
                <p className="text-[12px] text-white/80">Mission terminée ! Consultez le récapitulatif ci-dessous.</p>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Map for EN_ROUTE */}
        {tracking.status === "EN_ROUTE" && tracking.proCoordinates && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 120 }}
            className="mt-3 rounded-[12px] overflow-hidden border border-white/10"
          >
            <MapView height="h-28" markers={[
              { id: "pro", lat: tracking.proCoordinates.lat, lng: tracking.proCoordinates.lng, label: tracking.proName, selected: true },
              { id: "client", lat: 5.35, lng: -4.00, label: "Vous" },
            ]} interactive={false} />
          </motion.div>
        )}
      </div>
    </div>
  );
}
