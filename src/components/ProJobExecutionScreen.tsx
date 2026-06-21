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
  job, onUpdateStatus, onComplete, onBack,
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
        className="px-6 py-12 flex flex-col items-center justify-center min-h-[80vh] text-center">
        <div className="w-20 h-20 rounded-full bg-brand-lime flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-brand-forest" />
        </div>
        <h2 className="text-2xl font-extrabold text-brand-forest mb-2">Mission Terminée !</h2>
        <p className="text-sm text-secondary mb-6 max-w-xs">
          Le client va noter votre prestation. Le paiement sera traité sous 24h.
        </p>
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-pale-mint/15 w-full max-w-sm space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-secondary">Prestation</span>
            <span className="font-bold">{job.laborFeeXOF.toLocaleString()} F</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-secondary">Déplacement</span>
            <span className="font-bold">{job.travelFeeXOF.toLocaleString()} F</span>
          </div>
          <div className="border-t border-pale-mint/20 pt-2 flex justify-between text-sm">
            <span className="font-extrabold">Total</span>
            <span className="font-extrabold text-lg">{job.totalFeeXOF.toLocaleString()} F</span>
          </div>
        </div>
        <button onClick={onBack}
          className="mt-8 bg-brand-forest text-white px-8 py-3.5 rounded-full font-extrabold text-xs uppercase tracking-wider hover:bg-brand-lime hover:text-brand-forest transition-all active:scale-95 cursor-pointer">
          Retour au Dashboard
        </button>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#F5F5F0] pb-32">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-3">
        <button onClick={onBack}
          className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm cursor-pointer">
          <ChevronLeft className="w-5 h-5 text-brand-forest" />
        </button>
        <div>
          <h2 className="font-sans text-base font-extrabold leading-tight">{job.serviceName}</h2>
          <p className="text-caption text-[#8E8E93]">{job.clientLocation}</p>
        </div>
      </div>

      {/* Client card */}
      <div className="mx-4 mb-5 bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm border border-pale-mint/10">
        <div className="w-12 h-12 rounded-full bg-pale-mint flex items-center justify-center shrink-0">
          <UserIcon className="w-6 h-6 text-secondary" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm">{job.clientName}</h4>
          <p className="text-caption text-[#8E8E93] flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 shrink-0" /> {job.clientLocation}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[10px] font-medium text-[#8E8E93] uppercase">Total</p>
          <p className="font-extrabold">{job.totalFeeXOF.toLocaleString()} F</p>
        </div>
      </div>

      {/* Vertical Stepper */}
      <div className="mx-4 mb-6 bg-white rounded-2xl overflow-hidden shadow-sm border border-pale-mint/10">
        <div className="px-4 py-3 border-b border-[#F0EFE6]">
          <h3 className="text-caption font-bold uppercase tracking-wider text-brand-forest flex items-center gap-1.5">
            <ClipboardCheck className="w-3.5 h-3.5" /> Suivi de l'intervention
          </h3>
        </div>
        <div className="px-4 py-3">
          {ALL_STEPS.map((step, i) => {
            const cls = getStepClass(i);
            return (
              <div key={step.key} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 shrink-0 transition-all ${
                    cls === "completed" ? "bg-brand-forest text-brand-lime border-brand-forest" :
                    cls === "active" ? "bg-brand-lime text-brand-forest border-brand-lime shadow-sm shadow-brand-lime/30" :
                    "bg-white text-[#C7C7CC] border-[#E5E5EA]"
                  }`}>
                    {cls === "completed" ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : i + 1}
                  </div>
                  {i < ALL_STEPS.length - 1 && (
                    <div className={`w-0.5 h-8 ${cls === "completed" ? "bg-brand-forest" : "bg-[#F0EFE6]"}`} />
                  )}
                </div>
                <div className={`pt-0.5 pb-2 flex-1 ${cls === "active" ? "" : cls === "completed" ? "opacity-60" : "opacity-40"}`}>
                  <p className={`text-xs font-bold ${cls === "active" ? "text-brand-forest" : "text-[#8E8E93]"}`}>
                    {step.label}
                  </p>
                  <p className="text-[10px] text-[#8E8E93] mt-0.5">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action panel — dynamic content per active step */}
      <div className="mx-4 space-y-4">
        {currentStep === "en_route" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-brand-forest text-white p-5 rounded-2xl space-y-4">
            <div className="flex items-center gap-3">
              <Navigation className="w-6 h-6 text-brand-lime" />
              <div>
                <h3 className="font-bold text-base">En route</h3>
                <p className="text-xs text-white/60">Confirmez votre arrivée chez le client</p>
              </div>
            </div>
            <button onClick={() => advanceTo("arrived")}
              className="w-full bg-brand-lime text-brand-forest font-extrabold text-xs py-3.5 rounded-xl uppercase tracking-wider hover:brightness-110 transition-all active:scale-95 cursor-pointer">
              {currentStep === "en_route" ? "Arriver sur place" : "Arrivé ✓"}
            </button>
          </motion.div>
        )}

        {currentStep === "arrived" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-pale-mint/10 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5" /> Prêt à commencer ?
            </h4>
            <p className="text-caption text-[#8E8E93]">Confirmez le début de l'intervention pour activer la checklist.</p>
            <button onClick={() => advanceTo("in_progress")}
              className="w-full bg-brand-forest text-white font-extrabold text-xs py-3.5 rounded-xl uppercase tracking-wider hover:bg-brand-lime hover:text-brand-forest transition-all active:scale-95 cursor-pointer">
              <Play className="w-4 h-4 inline mr-1.5" /> Commencer l'intervention
            </button>
            <div className="flex gap-2">
              <button onClick={() => window.open(`tel:${job.clientPhone}`)}
                className="flex-1 bg-pale-mint text-brand-forest py-3 rounded-xl text-caption font-medium flex items-center justify-center gap-1.5 cursor-pointer">
                <Phone className="w-3.5 h-3.5" /> Appeler
              </button>
              <button onClick={() => alert("Message à " + job.clientName)}
                className="flex-1 bg-pale-mint text-brand-forest py-3 rounded-xl text-caption font-medium flex items-center justify-center gap-1.5 cursor-pointer">
                <MessageSquare className="w-3.5 h-3.5" /> Chatter
              </button>
            </div>
          </motion.div>
        )}

        {currentStep === "in_progress" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-pale-mint/10 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <ClipboardCheck className="w-3.5 h-3.5" /> Checklist
                </h4>
                <span className="text-caption font-medium bg-pale-mint px-2.5 py-1 rounded-full">
                  {progressCount}/{checklist.length}
                </span>
              </div>
              <div className="w-full h-2 bg-pale-mint rounded-full overflow-hidden">
                <div className="h-full bg-brand-lime rounded-full transition-all" style={{ width: `${(progressCount / checklist.length) * 100}%` }} />
              </div>
              <div className="space-y-1">
                {checklist.map((item) => (
                  <div key={item.id} onClick={() => setChecklist((prev) => prev.map((i) => i.id === item.id ? { ...i, done: !i.done } : i))}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all active:scale-[0.98] ${
                      item.done ? "bg-brand-lime/15 line-through opacity-60" : "hover:bg-pale-mint/50"
                    }`}>
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 shrink-0 transition-all ${
                      item.done ? "bg-brand-lime border-brand-lime" : "border-gray-300"
                    }`}>
                      {item.done && <Check className="w-4 h-4 text-brand-forest" />}
                    </div>
                    <span className="text-xs font-medium">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            {allChecked && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <button onClick={() => advanceTo("photos")}
                  className="w-full bg-brand-lime text-brand-forest font-extrabold text-sm py-4 rounded-2xl uppercase tracking-wider hover:brightness-110 transition-all active:scale-95 cursor-pointer">
                  Photos avant / après <ArrowRight className="w-4 h-4 inline ml-1.5" />
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {currentStep === "photos" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-pale-mint/10 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5" /> Photos de l'intervention
            </h4>
            <div>
              <p className="text-caption font-medium text-[#8E8E93] uppercase tracking-wider mb-2">Avant</p>
              <div onClick={() => beforeInputRef.current?.click()}
                className={`relative rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all ${
                  beforePhoto ? "border-brand-lime h-40" : "border-gray-300 h-32 hover:border-brand-lime"
                }`}>
                {beforePhoto ? (
                  <>
                    <img src={beforePhoto} alt="Avant" className="absolute inset-0 w-full h-full object-cover" />
                    <button onClick={(e) => { e.stopPropagation(); setBeforePhoto(null); }}
                      className="absolute top-2 right-2 w-12 h-12 rounded-full bg-black/50 flex items-center justify-center">
                      <X className="w-5 h-5 text-white" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-brand-lime text-brand-forest text-caption font-medium px-2 py-0.5 rounded-full">Avant ✓</div>
                  </>
                ) : (
                  <><Camera className="w-8 h-8 text-secondary/60 mb-1" /><p className="text-caption text-secondary/60 font-medium">Ajouter une photo</p></>
                )}
                <input ref={beforeInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleFile(e, setBeforePhoto)} />
              </div>
            </div>
            <div>
              <p className="text-caption font-medium text-[#8E8E93] uppercase tracking-wider mb-2">Après</p>
              <div onClick={() => afterInputRef.current?.click()}
                className={`relative rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all ${
                  afterPhoto ? "border-brand-lime h-40" : "border-gray-300 h-32 hover:border-brand-lime"
                }`}>
                {afterPhoto ? (
                  <>
                    <img src={afterPhoto} alt="Après" className="absolute inset-0 w-full h-full object-cover" />
                    <button onClick={(e) => { e.stopPropagation(); setAfterPhoto(null); }}
                      className="absolute top-2 right-2 w-12 h-12 rounded-full bg-black/50 flex items-center justify-center">
                      <X className="w-5 h-5 text-white" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-brand-lime text-brand-forest text-caption font-medium px-2 py-0.5 rounded-full">Après ✓</div>
                  </>
                ) : (
                  <><Camera className="w-8 h-8 text-secondary/60 mb-1" /><p className="text-caption text-secondary/60 font-medium">Ajouter une photo</p></>
                )}
                <input ref={afterInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleFile(e, setAfterPhoto)} />
              </div>
            </div>
            {uploading && (
              <div className="flex items-center justify-center gap-2 text-sm text-secondary">
                <Loader className="w-4 h-4 animate-spin" /> Téléchargement...
              </div>
            )}
            {beforePhoto && afterPhoto && !uploading && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <button onClick={() => advanceTo("completed")}
                  className="w-full bg-brand-lime text-brand-forest font-extrabold text-sm py-4 rounded-2xl uppercase tracking-wider hover:brightness-110 transition-all active:scale-95 cursor-pointer">
                  Terminer la mission <CheckCircle className="w-4 h-4 inline ml-1.5" />
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {currentStep === "completed" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-pale-mint/10 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider">Résumé de l'intervention</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2"><ClipboardCheck className="w-4 h-4 text-secondary" /><span className="text-xs text-secondary">Checklist</span></div>
                  <span className="text-xs font-bold">{progressCount}/{checklist.length} complétée</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2"><Camera className="w-4 h-4 text-secondary" /><span className="text-xs text-secondary">Photos</span></div>
                  <span className="text-xs font-bold">{beforePhoto && afterPhoto ? "2/2 ajoutées" : "Incomplètes"}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-secondary" /><span className="text-xs text-secondary">Durée</span></div>
                  <span className="text-xs font-bold">~{Math.floor(Math.random() * 3) + 1}h</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-secondary" /><span className="text-xs text-secondary">Gain</span></div>
                  <span className="text-xs font-bold">{job.totalFeeXOF.toLocaleString()} F</span>
                </div>
              </div>
            </div>
            <button onClick={handleComplete}
              className="w-full bg-brand-forest text-white font-extrabold text-sm py-4 rounded-2xl uppercase tracking-wider hover:bg-brand-lime hover:text-brand-forest transition-all active:scale-95 cursor-pointer">
              <ThumbsUp className="w-4 h-4 inline mr-1.5" /> Confirmer et terminer
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
