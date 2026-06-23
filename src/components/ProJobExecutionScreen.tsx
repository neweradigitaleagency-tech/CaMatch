import { useState, useRef, type ChangeEvent } from "react";
import { motion } from "motion/react";
import {
  MapPin, Phone, UserIcon, ChevronLeft, Camera, Check, ClipboardCheck,
  Navigation, Play, X, Loader, CheckCircle, Clock, DollarSign, ThumbsUp,
  ArrowRight, MessageSquare,
} from "lucide-react";
import { ProJob } from "../types";

type ProStep = "accepted" | "en_route" | "arrived" | "in_progress" | "photos" | "completed";

interface ChecklistItem {
  id: string; label: string; done: boolean;
}

interface Props {
  job: ProJob;
  onUpdateStatus: (jobId: string, status: string) => void;
  onComplete: (jobId: string) => void;
  onBack: () => void;
  onOpenChat?: (clientName: string) => void;
  onOpenCall?: (clientName: string) => void;
}

const ALL_STEPS: { key: ProStep; label: string; desc: string }[] = [
  { key: "accepted", label: "Accepté", desc: "Mission confirmée par le client" },
  { key: "en_route", label: "En route", desc: "Déplacement vers le lieu d'intervention" },
  { key: "arrived", label: "Arrivé sur place", desc: "Présent chez le client" },
  { key: "in_progress", label: "En cours", desc: "Travail en cours + checklist" },
  { key: "photos", label: "Photos avant/après", desc: "Preuve de l'intervention" },
  { key: "completed", label: "Terminé", desc: "Mission clôturée" },
];

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: "c1", label: "Vérifier le matériel et l'équipement", done: false },
  { id: "c2", label: "Inspecter la zone d'intervention", done: false },
  { id: "c3", label: "Diagnostic et identification du problème", done: false },
  { id: "c4", label: "Réparation / installation", done: false },
  { id: "c5", label: "Test de fonctionnement", done: false },
  { id: "c6", label: "Nettoyage de la zone de travail", done: false },
];

export default function ProJobExecutionScreen({
  job, onUpdateStatus, onComplete, onBack, onOpenChat, onOpenCall,
}: Props) {
  const [currentStep, setCurrentStep] = useState<ProStep>("en_route");
  const [checklist, setChecklist] = useState<ChecklistItem[]>(DEFAULT_CHECKLIST);
  const [beforePhoto, setBeforePhoto] = useState<string | null>(null);
  const [afterPhoto, setAfterPhoto] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const beforeInputRef = useRef<HTMLInputElement>(null);
  const afterInputRef = useRef<HTMLInputElement>(null);

  const currentIdx = ALL_STEPS.findIndex((s) => s.key === currentStep);
  const progressCount = checklist.filter((i) => i.done).length;
  const allChecked = progressCount === checklist.length;

  const getStepClass = (idx: number) => {
    if (idx < currentIdx) return "completed";
    if (idx === currentIdx) return "active";
    return "upcoming";
  };

  const advanceTo = (step: ProStep) => {
    setCurrentStep(step);
    if (step === "en_route") onUpdateStatus(job.id, "en_route");
    if (step === "in_progress") onUpdateStatus(job.id, "in_progress");
  };

  const handleFile = (e: ChangeEvent<HTMLInputElement>, setter: (v: string | null) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => { setter(reader.result as string); setUploading(false); };
    reader.readAsDataURL(file);
  };

  const handleComplete = () => {
    setCompleted(true);
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
        <p className="text-[14px] text-cm-text-soft mb-6 max-w-xs">
          Le client va noter votre prestation. Le paiement sera traité sous 24h.
        </p>
        <div className="bg-cm-elevated p-4 rounded-[var(--radius-cm-lg)] border border-cm-border w-full max-w-sm space-y-3">
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
        <button onClick={onBack}
          className="mt-6 bg-cm-text text-white px-6 py-3 rounded-[var(--radius-cm)] font-medium text-[13px] cm-scale-btn hover:opacity-90">
          Retour au Dashboard
        </button>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-cm-bg pb-32">
      <div className="flex items-center gap-3 px-5 pt-5 pb-3">
        <button onClick={onBack}
          className="w-9 h-9 rounded-full bg-cm-elevated border border-cm-border flex items-center justify-center cm-scale-btn">
          <ChevronLeft className="w-4 h-4 text-cm-text" />
        </button>
        <div>
          <h2 className="text-[15px] font-bold text-cm-text">{job.serviceName}</h2>
          <p className="text-[12px] text-cm-text-soft">{job.clientLocation}</p>
        </div>
      </div>

      <div className="mx-5 mb-4 bg-cm-elevated rounded-[var(--radius-cm-lg)] p-4 flex items-center gap-3 border border-cm-border">
        <div className="w-10 h-10 rounded-full bg-cm-accent-soft flex items-center justify-center shrink-0">
          <UserIcon className="w-5 h-5 text-cm-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-[14px] text-cm-text">{job.clientName}</h4>
          <p className="text-[12px] text-cm-text-soft flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 shrink-0" /> {job.clientLocation}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[11px] text-cm-text-soft">Total</p>
          <p className="font-semibold text-cm-text">{job.totalFeeXOF.toLocaleString()} F</p>
        </div>
      </div>

      <div className="mx-5 mb-5 bg-cm-elevated rounded-[var(--radius-cm-lg)] border border-cm-border overflow-hidden">
        <div className="px-4 py-3 border-b border-cm-border">
          <h3 className="text-[12px] font-semibold text-cm-text flex items-center gap-1.5">
            <ClipboardCheck className="w-3.5 h-3.5" /> Suivi de l'intervention
          </h3>
        </div>
        <div className="px-4 py-3">
          {ALL_STEPS.map((step, i) => {
            const cls = getStepClass(i);
            return (
              <div key={step.key} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold border-2 shrink-0 ${
                    cls === "completed" ? "bg-cm-accent text-white border-cm-accent" :
                    cls === "active" ? "bg-cm-accent text-white border-cm-accent" :
                    "bg-cm-elevated text-cm-text-muted border-cm-border"
                  }`}>
                    {cls === "completed" ? <Check className="w-3 h-3" /> : i + 1}
                  </div>
                  {i < ALL_STEPS.length - 1 && (
                    <div className={`w-0.5 h-8 ${cls === "completed" ? "bg-cm-accent" : "bg-cm-border"}`} />
                  )}
                </div>
                <div className={`pt-0.5 pb-2 flex-1 ${cls === "upcoming" ? "opacity-40" : ""}`}>
                  <p className={`text-[13px] font-medium ${cls === "active" ? "text-cm-text" : "text-cm-text-soft"}`}>
                    {step.label}
                  </p>
                  <p className="text-[11px] text-cm-text-soft mt-0.5">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mx-5 space-y-4">
        {currentStep === "en_route" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-cm-text text-white p-5 rounded-[var(--radius-cm-lg)] space-y-4">
            <div className="flex items-center gap-3">
              <Navigation className="w-5 h-5 text-cm-accent" />
              <div>
                <h3 className="font-semibold text-[15px]">En route</h3>
                <p className="text-[12px] text-white/60">Confirmez votre arrivée chez le client</p>
              </div>
            </div>
            <button onClick={() => advanceTo("arrived")}
              className="w-full bg-cm-accent text-white font-medium text-[13px] py-3 rounded-[var(--radius-cm)] cm-scale-btn hover:bg-cm-accent-hover">
              Arriver sur place
            </button>
          </motion.div>
        )}

        {currentStep === "arrived" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-cm-elevated rounded-[var(--radius-cm-lg)] p-5 border border-cm-border space-y-3">
            <h4 className="text-[13px] font-semibold text-cm-text flex items-center gap-1.5">
              <Play className="w-4 h-4" /> Prêt à commencer ?
            </h4>
            <p className="text-[12px] text-cm-text-soft">Confirmez le début de l'intervention pour activer la checklist.</p>
            <button onClick={() => advanceTo("in_progress")}
              className="w-full bg-cm-text text-white font-medium text-[13px] py-3 rounded-[var(--radius-cm)] cm-scale-btn hover:opacity-90">
              <Play className="w-4 h-4 inline mr-1.5" /> Commencer l'intervention
            </button>
            <div className="flex gap-2">
              <button onClick={() => onOpenCall?.(job.clientName)}
                className="flex-1 bg-cm-accent-soft text-cm-accent py-2.5 rounded-[var(--radius-cm)] text-[12px] font-medium flex items-center justify-center gap-1.5 cm-scale-btn">
                <Phone className="w-3.5 h-3.5" /> Appeler
              </button>
              <button onClick={() => onOpenChat?.(job.clientName)}
                className="flex-1 bg-cm-accent-soft text-cm-accent py-2.5 rounded-[var(--radius-cm)] text-[12px] font-medium flex items-center justify-center gap-1.5 cm-scale-btn">
                <MessageSquare className="w-3.5 h-3.5" /> Chatter
              </button>
            </div>
          </motion.div>
        )}

        {currentStep === "in_progress" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="bg-cm-elevated rounded-[var(--radius-cm-lg)] p-5 border border-cm-border space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-[13px] font-semibold text-cm-text flex items-center gap-1.5">
                  <ClipboardCheck className="w-4 h-4" /> Checklist
                </h4>
                <span className="text-[11px] font-medium bg-cm-accent-soft text-cm-accent px-2.5 py-0.5 rounded-[var(--radius-cm)]">
                  {progressCount}/{checklist.length}
                </span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-cm-accent rounded-full transition-all" style={{ width: `${(progressCount / checklist.length) * 100}%` }} />
              </div>
              <div className="space-y-1">
                {checklist.map((item) => (
                  <div key={item.id} onClick={() => setChecklist((prev) => prev.map((i) => i.id === item.id ? { ...i, done: !i.done } : i))}
                    className={`flex items-center gap-3 p-3 rounded-[var(--radius-cm)] cursor-pointer ${
                      item.done ? "opacity-60" : "hover:bg-cm-accent-soft/30"
                    }`}>
                    <div className={`w-5 h-5 rounded flex items-center justify-center border-2 shrink-0 ${
                      item.done ? "bg-cm-accent border-cm-accent" : "border-cm-border"
                    }`}>
                      {item.done && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className={`text-[13px] font-medium text-cm-text ${item.done ? "line-through" : ""}`}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            {allChecked && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <button onClick={() => advanceTo("photos")}
                  className="w-full bg-cm-accent text-white font-medium text-[14px] py-3.5 rounded-[var(--radius-cm)] cm-scale-btn hover:bg-cm-accent-hover">
                  Photos avant / après <ArrowRight className="w-4 h-4 inline ml-1.5" />
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {currentStep === "photos" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-cm-elevated rounded-[var(--radius-cm-lg)] p-5 border border-cm-border space-y-4">
            <h4 className="text-[13px] font-semibold text-cm-text flex items-center gap-1.5">
              <Camera className="w-4 h-4" /> Photos de l'intervention
            </h4>
            <div>
              <p className="text-[11px] font-medium text-cm-text-soft mb-2">Avant</p>
              <div onClick={() => beforeInputRef.current?.click()}
                className={`relative rounded-[var(--radius-cm)] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden ${
                  beforePhoto ? "border-cm-accent h-36" : "border-cm-border h-28 hover:border-cm-accent"
                }`}>
                {beforePhoto ? (
                  <>
                    <img src={beforePhoto} alt="Avant" className="absolute inset-0 w-full h-full object-cover" />
                    <button onClick={(e) => { e.stopPropagation(); setBeforePhoto(null); }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center cursor-pointer">
                      <X className="w-4 h-4 text-white" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-cm-accent text-white text-[11px] font-medium px-2 py-0.5 rounded-full">Avant ✓</div>
                  </>
                ) : (
                  <><Camera className="w-6 h-6 text-cm-text-muted mb-1" /><p className="text-[12px] text-cm-text-muted">Ajouter une photo</p></>
                )}
                <input ref={beforeInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleFile(e, setBeforePhoto)} />
              </div>
            </div>
            <div>
              <p className="text-[11px] font-medium text-cm-text-soft mb-2">Après</p>
              <div onClick={() => afterInputRef.current?.click()}
                className={`relative rounded-[var(--radius-cm)] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden ${
                  afterPhoto ? "border-cm-accent h-36" : "border-cm-border h-28 hover:border-cm-accent"
                }`}>
                {afterPhoto ? (
                  <>
                    <img src={afterPhoto} alt="Après" className="absolute inset-0 w-full h-full object-cover" />
                    <button onClick={(e) => { e.stopPropagation(); setAfterPhoto(null); }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center cursor-pointer">
                      <X className="w-4 h-4 text-white" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-cm-accent text-white text-[11px] font-medium px-2 py-0.5 rounded-full">Après ✓</div>
                  </>
                ) : (
                  <><Camera className="w-6 h-6 text-cm-text-muted mb-1" /><p className="text-[12px] text-cm-text-muted">Ajouter une photo</p></>
                )}
                <input ref={afterInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleFile(e, setAfterPhoto)} />
              </div>
            </div>
            {uploading && (
              <div className="flex items-center justify-center gap-2 text-[13px] text-cm-text-soft">
                <Loader className="w-4 h-4 animate-spin" /> Téléchargement...
              </div>
            )}
            {beforePhoto && afterPhoto && !uploading && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <button onClick={() => advanceTo("completed")}
                  className="w-full bg-cm-accent text-white font-medium text-[14px] py-3.5 rounded-[var(--radius-cm)] cm-scale-btn hover:bg-cm-accent-hover">
                  Terminer la mission <CheckCircle className="w-4 h-4 inline ml-1.5" />
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {currentStep === "completed" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="bg-cm-elevated rounded-[var(--radius-cm-lg)] p-5 border border-cm-border space-y-4">
              <h4 className="text-[13px] font-semibold text-cm-text">Résumé de l'intervention</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-1">
                  <span className="text-[13px] text-cm-text-soft">Checklist</span>
                  <span className="text-[13px] font-semibold text-cm-text">{progressCount}/{checklist.length} complétée</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-[13px] text-cm-text-soft">Photos</span>
                  <span className="text-[13px] font-semibold text-cm-text">{beforePhoto && afterPhoto ? "2/2 ajoutées" : "Incomplètes"}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-[13px] text-cm-text-soft">Durée</span>
                  <span className="text-[13px] font-semibold text-cm-text">~{Math.floor(Math.random() * 3) + 1}h</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-[13px] text-cm-text-soft">Gain</span>
                  <span className="text-[13px] font-semibold text-cm-text">{job.totalFeeXOF.toLocaleString()} F</span>
                </div>
              </div>
            </div>
            <button onClick={handleComplete}
              className="w-full bg-cm-accent text-white font-medium text-[14px] py-3.5 rounded-[var(--radius-cm)] cm-scale-btn hover:bg-cm-accent-hover">
              <ThumbsUp className="w-4 h-4 inline mr-1.5" /> Confirmer et terminer
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
