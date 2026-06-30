import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle, Navigation, Home, Loader, MapPin, Phone, UserIcon, Camera, X, Image } from "lucide-react";
import type { ProJob, MissionStatus } from "../types";
import { useAuthStore } from "../stores/authStore";
import { createConversation, findConversation } from "../services/chatService";
import MapView from "./ui/MapView";
import { useRequestStore } from "../stores/requestStore";

type ProStep = "idle" | "accepted" | "en_route" | "arrived" | "photos_before" | "in_progress" | "photos_after" | "completed";

interface ProControlPanelProps {
  job: ProJob;
  onUpdateStatus: (jobId: string, status: string) => void;
  onComplete: (jobId: string) => void;
  onNotification?: (title: string, body: string) => void;
}

export default function ProControlPanel({
  job, onUpdateStatus, onComplete, onNotification,
}: ProControlPanelProps) {
  const [step, setStep] = useState<ProStep>("idle");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsActive, setGpsActive] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [beforePhotos, setBeforePhotos] = useState<string[]>([]);
  const [afterPhotos, setAfterPhotos] = useState<string[]>([]);
  const watchIdRef = useRef<number | null>(null);
  const beforeInputRef = useRef<HTMLInputElement>(null);
  const afterInputRef = useRef<HTMLInputElement>(null);
  const setMissionField = useRequestStore((s) => s.setMissionField);

  const notify = useCallback((title: string, body: string) => {
    if (onNotification) {
      onNotification(title, body);
    }
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body, icon: "/vite.svg" });
    }
  }, [onNotification]);

  const startGpsTracking = useCallback(() => {
    if (!navigator.geolocation) return;
    setGpsActive(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setCoords({ lat, lng });
      },
      (err) => console.warn("GPS error:", err.message),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
    const interval = setInterval(() => {
      setSyncing((s) => !s);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const stopGpsTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setGpsActive(false);
  }, []);

  useEffect(() => {
    return () => { stopGpsTracking(); };
  }, [stopGpsTracking]);

  const handleAcceptMission = async () => {
    setStep("accepted");
    onUpdateStatus(job.id, "accepted");
    notify("Mission acceptée", "Vous avez accepté la mission. Activez le tracking pour partager votre position.");

    const currentUserId = useAuthStore.getState().userId;
    if (currentUserId && job.clientId) {
      const existing = await findConversation(currentUserId, job.clientId);
      if (!existing) {
        await createConversation({
          participant1: currentUserId,
          participant2: job.clientId,
          jobId: job.id,
        });
      }
    }
  };

  const handleStartTrip = () => {
    setStep("en_route");
    startGpsTracking();
    onUpdateStatus(job.id, "en_route");
    notify("En route !", "Le client va recevoir une notification de votre départ.");
  };

  const handleArrived = () => {
    setStep("arrived");
    stopGpsTracking();
    onUpdateStatus(job.id, "arrived");
    notify("Arrivé sur place", "Le client est informé de votre arrivée.");
  };

  const handleCaptureBefore = () => {
    beforeInputRef.current?.click();
  };

  const handleBeforeFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const urls: string[] = [];
    Array.from(files).forEach((f) => {
      const reader = new FileReader();
      reader.onload = () => {
        urls.push(reader.result as string);
        if (urls.length === files.length) {
          setBeforePhotos((prev) => [...prev, ...urls]);
        }
      };
      reader.readAsDataURL(f);
    });
  };

  const handleStartIntervention = () => {
    setStep("in_progress");
    onUpdateStatus(job.id, "in_progress");
    notify("Intervention commencée", "Le client est informé du début de l'intervention.");
  };

  const handleCaptureAfter = () => {
    afterInputRef.current?.click();
  };

  const handleAfterFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const urls: string[] = [];
    Array.from(files).forEach((f) => {
      const reader = new FileReader();
      reader.onload = () => {
        urls.push(reader.result as string);
        if (urls.length === files.length) {
          setAfterPhotos((prev) => [...prev, ...urls]);
        }
      };
      reader.readAsDataURL(f);
    });
  };

  const handleComplete = () => {
    setMissionField(job.id, "beforePhotos", beforePhotos);
    setMissionField(job.id, "afterPhotos", afterPhotos);
    setStep("completed");
    setCompleted(true);
    onUpdateStatus(job.id, "completed");
    notify("Mission terminée", "Le client valide maintenant le travail.");
    setTimeout(() => onComplete(job.id), 2000);
  };

  if (completed) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="px-5 py-12 flex flex-col items-center justify-center min-h-[80vh] text-center bg-cm-bg">
        <div className="w-16 h-16 rounded-full bg-cm-accent-soft flex items-center justify-center mb-5">
          <CheckCircle className="w-8 h-8 text-cm-accent" />
        </div>
        <h2 className="text-xl font-bold text-cm-text mb-2">Mission terminée !        </h2>
        <p className="text-[14px] text-cm-text-soft mb-6 max-w-xs">
          Le client valide maintenant le travail effectué.
        </p>
        <div className="bg-cm-elevated p-4 rounded-[14px] border border-cm-border w-full max-w-sm space-y-3">
          <div className="flex justify-between text-[14px]">
            <span className="text-cm-text-soft">Prestation</span>
            <span className="font-semibold text-cm-text">{job.laborFeeXOF.toLocaleString()} F</span>
          </div>
          <div className="flex justify-between text-[14px]">
            <span className="text-cm-text-soft">Déplacement</span>
            <span className="font-semibold text-cm-text">{job.travelFeeXOF.toLocaleString()} F</span>
          </div>
          <div className="border-t border-cm-border pt-2 flex justify-between text-[14px]">
            <span className="font-semibold text-cm-text">Total</span>
            <span className="font-bold text-cm-text">{job.totalFeeXOF.toLocaleString()} F</span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-cm-bg pb-32">
      {/* Client info */}
      <div className="mx-5 mt-5 mb-4 bg-cm-elevated rounded-[14px] p-4 flex items-center gap-3 border border-cm-border">
        <div className="w-10 h-10 rounded-full bg-cm-accent-soft flex items-center justify-center shrink-0">
          <UserIcon className="w-5 h-5 text-cm-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-cm-text">{job.clientName}</p>
          <p className="text-[12px] text-cm-text-soft">{job.serviceName}</p>
        </div>
        <a href={`tel:${job.clientPhone}`}
          className="w-9 h-9 rounded-[10px] bg-cm-accent-soft flex items-center justify-center cursor-pointer active:scale-90">
          <Phone className="w-4 h-4 text-cm-accent" />
        </a>
      </div>

      {/* GPS status badge */}
      {gpsActive && (
        <div className="mx-5 mb-4 flex items-center gap-2 px-3 py-2 bg-cm-text text-white rounded-[10px]">
          <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }}>
            <MapPin className="w-4 h-4 text-cm-accent" />
          </motion.div>
          <span className="text-[11px] font-medium">Partage de position actif</span>
          <span className="ml-auto text-[10px] text-white/60">
            {coords ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : "Acquisition..."}
          </span>
        </div>
      )}

      {/* Map when en_route */}
      {coords && step === "en_route" && (
        <div className="mx-5 mb-4 rounded-[14px] overflow-hidden border border-cm-border h-36">
          <MapView height="h-36" markers={[
            { id: "pro", lat: coords.lat, lng: coords.lng, label: "Vous", selected: true },
            { id: "client", lat: 5.35, lng: -4.00, label: job.clientName },
          ]} interactive={false} />
        </div>
      )}

      {/* Before photos preview */}
      {beforePhotos.length > 0 && (
        <div className="mx-5 mb-4">
          <p className="text-[11px] font-bold text-cm-text-soft uppercase tracking-wider mb-2">Photos avant</p>
          <div className="flex gap-2 overflow-x-auto">
            {beforePhotos.map((p, i) => (
              <div key={i} className="w-20 h-20 rounded-[12px] overflow-hidden border border-cm-border shrink-0">
                <img src={p} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* After photos preview */}
      {afterPhotos.length > 0 && (
        <div className="mx-5 mb-4">
          <p className="text-[11px] font-bold text-cm-accent uppercase tracking-wider mb-2">Photos après</p>
          <div className="flex gap-2 overflow-x-auto">
            {afterPhotos.map((p, i) => (
              <div key={i} className="w-20 h-20 rounded-[12px] overflow-hidden border border-cm-accent/30 shrink-0">
                <img src={p} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      <input ref={beforeInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleBeforeFiles} />
      <input ref={afterInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleAfterFiles} />

      {/* 3-big-button panel */}
      <div className="mx-5 space-y-3">
        <AnimatePresence mode="wait">
          {step === "idle" && (
            <motion.button key="accept" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              onClick={handleAcceptMission}
              className="w-full py-5 bg-cm-text text-white rounded-[16px] text-[16px] font-bold flex items-center justify-center gap-3 cursor-pointer active:scale-[0.97] transition-transform shadow-cm-md hover:opacity-90">
              <CheckCircle className="w-6 h-6" /> Accepter la mission
            </motion.button>
          )}

          {step === "accepted" && (
            <motion.button key="en_route" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              onClick={handleStartTrip}
              className="w-full py-5 bg-cm-accent text-white rounded-[16px] text-[16px] font-bold flex items-center justify-center gap-3 cursor-pointer active:scale-[0.97] transition-transform shadow-cm-md hover:bg-cm-accent-hover">
              <Navigation className="w-6 h-6" /> Je suis en route
            </motion.button>
          )}

          {step === "en_route" && (
            <motion.button key="arrived" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              onClick={handleArrived}
              className="w-full py-5 bg-cm-text text-white rounded-[16px] text-[16px] font-bold flex items-center justify-center gap-3 cursor-pointer active:scale-[0.97] transition-transform shadow-cm-md hover:opacity-90">
              <Home className="w-6 h-6" /> Je suis arrivé
            </motion.button>
          )}

          {step === "arrived" && (
            <motion.button key="before" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              onClick={handleCaptureBefore}
              className="w-full py-5 bg-cm-text text-white rounded-[16px] text-[16px] font-bold flex items-center justify-center gap-3 cursor-pointer active:scale-[0.97] transition-transform shadow-cm-md hover:opacity-90">
              <Camera className="w-6 h-6" /> Photo avant intervention
            </motion.button>
          )}

          {step === "arrived" && beforePhotos.length > 0 && (
            <motion.button key="start-work" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              onClick={handleStartIntervention}
              className="w-full py-5 bg-cm-accent text-white rounded-[16px] text-[16px] font-bold flex items-center justify-center gap-3 cursor-pointer active:scale-[0.97] transition-transform shadow-cm-md">
              <CheckCircle className="w-6 h-6" /> Commencer l'intervention
            </motion.button>
          )}

          {step === "in_progress" && (
            <motion.button key="after" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              onClick={handleCaptureAfter}
              className="w-full py-5 bg-cm-text text-white rounded-[16px] text-[16px] font-bold flex items-center justify-center gap-3 cursor-pointer active:scale-[0.97] transition-transform shadow-cm-md hover:opacity-90">
              <Camera className="w-6 h-6" /> Photo après intervention
            </motion.button>
          )}

          {step === "in_progress" && afterPhotos.length > 0 && (
            <motion.button key="complete-work" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              onClick={handleComplete}
              className="w-full py-5 bg-cm-text text-white rounded-[16px] text-[16px] font-bold flex items-center justify-center gap-3 cursor-pointer active:scale-[0.97] transition-transform shadow-cm-md hover:opacity-90">
              <CheckCircle className="w-6 h-6" /> Terminer la mission
            </motion.button>
          )}
        </AnimatePresence>

        {/* GPS syncing indicator */}
        {syncing && gpsActive && (
          <div className="flex items-center justify-center gap-2 text-[11px] text-cm-text-muted">
            <Loader className="w-3 h-3 animate-spin" />
            Synchronisation position...
          </div>
        )}
      </div>
    </div>
  );
}
