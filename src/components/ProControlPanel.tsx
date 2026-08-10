import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle, Navigation, Home, Loader, MapPin, Phone, UserIcon, Camera, X, Image, Clock, Plus, ClipboardList } from "lucide-react";
import type { ProJob, ProJobStatus } from "../types";
import { useAuthStore } from "../stores/authStore";
import { useChatStore } from "../stores/chatStore";
import MapView from "./ui/MapView";
import { useRequestStore } from "../stores/requestStore";

type ProStep = "idle" | "accepted" | "en_route" | "arrived" | "photos_taken" | "in_progress" | "photos_after" | "completed";

interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: "c1", label: "Vérifier l'accès au site", done: false },
  { id: "c2", label: "Préparer le matériel nécessaire", done: false },
  { id: "c3", label: "Protéger la zone de travail", done: false },
  { id: "c4", label: "Effectuer l'intervention", done: false },
  { id: "c5", label: "Nettoyer la zone", done: false },
  { id: "c6", label: "Vérifier la satisfaction client", done: false },
];

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function statusToStep(status: ProJobStatus): ProStep {
  switch (status) {
    case "pending": return "idle";
    case "accepted": return "accepted";
    case "en_route": return "en_route";
    case "arrived": return "arrived";
    case "photos_taken": return "photos_taken";
    case "in_progress": return "in_progress";
    case "completed":
    case "client_validation":
    case "closed": return "completed";
    default: return "idle";
  }
}

interface ProControlPanelProps {
  job: ProJob;
  onUpdateStatus: (jobId: string, status: string) => void;
  onComplete: (jobId: string) => void;
  onNotification?: (title: string, body: string) => void;
}

export default function ProControlPanel({
  job, onUpdateStatus, onComplete, onNotification,
}: ProControlPanelProps) {
  const [step, setStep] = useState<ProStep>(() => statusToStep(job.status));
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

  const [elapsed, setElapsed] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [checklist, setChecklist] = useState<ChecklistItem[]>(DEFAULT_CHECKLIST);
  const [customTask, setCustomTask] = useState("");
  const [showAddTask, setShowAddTask] = useState(false);

  const toggleChecklist = (id: string) => {
    setChecklist((prev) => prev.map((item) => item.id === id ? { ...item, done: !item.done } : item));
  };

  const addCustomTask = () => {
    const label = customTask.trim();
    if (!label) return;
    setChecklist((prev) => [...prev, { id: `c-${Date.now()}`, label, done: false }]);
    setCustomTask("");
    setShowAddTask(false);
  };

  const doneCount = checklist.filter((i) => i.done).length;
  const totalCount = checklist.length;

  const startTimer = useCallback(() => {
    setElapsed(0);
    setTimerRunning(true);
    timerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimerRunning(false);
  }, []);

  useEffect(() => {
    return () => { stopTimer(); };
  }, [stopTimer]);

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

  useEffect(() => {
    const next = statusToStep(job.status);
    if (next !== "completed") {
      setStep(next);
    }
  }, [job.status]);

  const handleAcceptMission = async () => {
    setStep("accepted");
    onUpdateStatus(job.id, "accepted");
    notify("Mission acceptée", "Vous avez accepté la mission. Activez le tracking pour partager votre position.");

    const currentUserId = useAuthStore.getState().userId;
    if (currentUserId && job.clientId) {
      await useChatStore.getState().createConversation({
        participant1: currentUserId,
        participant2: job.clientId,
        jobId: job.id,
      });
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
          setStep("photos_taken");
          onUpdateStatus(job.id, "photos_taken");
        }
      };
      reader.readAsDataURL(f);
    });
  };

  const handleStartIntervention = () => {
    startTimer();
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
    stopTimer();
    setMissionField(job.id, "beforePhotos", beforePhotos);
    setMissionField(job.id, "afterPhotos", afterPhotos);
    setMissionField(job.id, "elapsedSeconds", elapsed);
    setMissionField(job.id, "checklist", checklist.filter((i) => i.done).map((i) => i.label));
    setStep("completed");
    setCompleted(true);
    onUpdateStatus(job.id, "completed");
    notify("Mission terminée", `Durée : ${formatElapsed(elapsed)}. Le client valide maintenant le travail.`);
    setTimeout(() => onComplete(job.id), 2000);
  };

  if (completed) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="px-5 py-12 flex flex-col items-center justify-center min-h-[80vh] text-center bg-cm-bg">
        <div className="w-16 h-16 rounded-full bg-cm-accent-soft flex items-center justify-center mb-5">
          <CheckCircle className="w-8 h-8 text-cm-accent" />
        </div>
        <h2 className="text-xl font-bold text-cm-text mb-2">Mission terminée !</h2>
        <p className="text-[14px] text-cm-text-soft mb-2 max-w-xs">
          Durée : <strong>{formatElapsed(elapsed)}</strong>
        </p>
        {doneCount > 0 && (
          <p className="text-[12px] text-cm-text-soft mb-4">{doneCount}/{totalCount} tâches complétées</p>
        )}
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
    <div className="flex flex-col w-full min-h-dynamic bg-cm-bg pb-32">
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

      {/* Chronometer */}
      {(step === "in_progress" || step === "photos_after") && timerRunning && (
        <div className="mx-5 mb-4">
          <div className="bg-cm-elevated rounded-[14px] border border-cm-border p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-cm-accent-soft flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-cm-accent" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-cm-text-soft uppercase tracking-wider">Chronomètre</p>
              <motion.p className="text-[28px] font-mono font-bold text-cm-text tracking-widest"
                animate={{ opacity: [1, 0.6, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                {formatElapsed(elapsed)}
              </motion.p>
            </div>
          </div>
        </div>
      )}

      {/* Checklist (during intervention) */}
      {(step === "in_progress" || step === "photos_after") && (
        <div className="mx-5 mb-4">
          <div className="bg-cm-elevated rounded-[14px] border border-cm-border p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-cm-accent" />
                <p className="text-[13px] font-bold text-cm-text">Checklist</p>
              </div>
              <span className="text-[11px] text-cm-text-soft">{doneCount}/{totalCount}</span>
            </div>
            <div className="space-y-1.5">
              {checklist.map((item) => (
                <button key={item.id} onClick={() => toggleChecklist(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-left text-[12px] cursor-pointer transition-all ${
                    item.done ? "bg-cm-accent-soft/50 text-cm-text-soft line-through" : "bg-cm-bg text-cm-text hover:bg-cm-accent-soft/20"
                  }`}>
                  <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                    item.done ? "bg-cm-accent border-cm-accent" : "border-cm-border"
                  }`}>
                    {item.done && <CheckCircle className="w-3 h-3 text-white" />}
                  </div>
                  {item.label}
                </button>
              ))}
            </div>
            {showAddTask ? (
              <div className="flex items-center gap-2 mt-3">
                <input type="text" value={customTask} onChange={(e) => setCustomTask(e.target.value)}
                  placeholder="Nouvelle tâche..."
                  className="flex-1 h-9 px-3 text-[12px] bg-cm-bg border border-cm-border rounded-lg outline-none text-cm-text placeholder:text-cm-text-muted focus:border-cm-accent"
                  onKeyDown={(e) => { if (e.key === "Enter") addCustomTask(); }} />
                <button onClick={addCustomTask}
                  className="h-9 px-3 rounded-lg bg-cm-accent text-white text-[11px] font-semibold cursor-pointer active:scale-95 transition-transform">
                  Ajouter
                </button>
                <button onClick={() => { setShowAddTask(false); setCustomTask(""); }}
                  className="h-9 w-9 rounded-lg bg-cm-bg border border-cm-border flex items-center justify-center cursor-pointer active:scale-95">
                  <X className="w-3.5 h-3.5 text-cm-text-soft" />
                </button>
              </div>
            ) : (
              <button onClick={() => setShowAddTask(true)}
                className="w-full flex items-center gap-2 mt-2 px-3 py-2 rounded-[10px] text-[11px] text-cm-text-muted cursor-pointer hover:bg-cm-bg transition-colors">
                <Plus className="w-3.5 h-3.5" />
                Ajouter une tâche
              </button>
            )}
          </div>
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
              className="w-full py-5 bg-cm-accent text-cm-text-onAccent rounded-[16px] text-[16px] font-bold flex items-center justify-center gap-3 cursor-pointer active:scale-[0.97] transition-transform shadow-cm-md hover:bg-cm-accent-hover">
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

          {step === "photos_taken" && (
            <motion.button key="start-work" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              onClick={handleStartIntervention}
              className="w-full py-5 bg-cm-accent text-cm-text-onAccent rounded-[16px] text-[16px] font-bold flex items-center justify-center gap-3 cursor-pointer active:scale-[0.97] transition-transform shadow-cm-md">
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
