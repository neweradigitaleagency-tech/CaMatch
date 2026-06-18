import { useState, useRef, type ComponentType, type ReactNode, type ChangeEvent } from "react";
import { motion } from "motion/react";
import {
  MapPin,
  Phone,
  UserIcon,
  ChevronLeft,
  Camera,
  Check,
  ClipboardCheck,
  Navigation,
  Play,
  X,
  Loader,
  Star,
  CheckCircle,
  ArrowRight,
  Clock,
  DollarSign,
  ThumbsUp,
} from "lucide-react";
import { ProJob } from "../types";

type ExecutionPhase = "overview" | "checklist" | "photos" | "complete";
type CheckinStatus = "pending" | "arrived" | "started";

interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

interface Props {
  job: ProJob;
  onUpdateStatus: (jobId: string, status: string) => void;
  onComplete: (jobId: string) => void;
  onBack: () => void;
}

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: "c1", label: "Vérifier le matériel et l'équipement", done: false },
  { id: "c2", label: "Inspecter la zone d'intervention", done: false },
  { id: "c3", label: "Diagnostic et identification du problème", done: false },
  { id: "c4", label: "Réparation / installation", done: false },
  { id: "c5", label: "Test de fonctionnement", done: false },
  { id: "c6", label: "Nettoyage de la zone de travail", done: false },
];

export default function ProJobExecutionScreen({
  job,
  onUpdateStatus,
  onComplete,
  onBack,
}: Props) {
  const [phase, setPhase] = useState<ExecutionPhase>("overview");
  const [checkinStatus, setCheckinStatus] = useState<CheckinStatus>("pending");
  const [checklist, setChecklist] = useState<ChecklistItem[]>(DEFAULT_CHECKLIST);
  const [beforePhoto, setBeforePhoto] = useState<string | null>(null);
  const [afterPhoto, setAfterPhoto] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const beforeInputRef = useRef<HTMLInputElement>(null);
  const afterInputRef = useRef<HTMLInputElement>(null);

  const progressCount = checklist.filter((i) => i.done).length;
  const allChecked = progressCount === checklist.length;

  const handleFile = (
    e: ChangeEvent<HTMLInputElement>,
    setter: (v: string | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      setter(reader.result as string);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleCheckin = () => {
    setCheckinStatus("arrived");
    onUpdateStatus(job.id, "en_route");
  };

  const handleStartJob = () => {
    setCheckinStatus("started");
    onUpdateStatus(job.id, "in_progress");
    setPhase("checklist");
  };

  const toggleChecklistItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item
      )
    );
  };

  const handleComplete = () => {
    setCompleted(true);
    setTimeout(() => {
      onComplete(job.id);
    }, 2000);
  };

  if (completed) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="px-6 py-12 flex flex-col items-center justify-center min-h-[80vh] text-center"
      >
        <div className="w-20 h-20 rounded-full bg-brand-lime flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-brand-forest" />
        </div>
        <h2 className="text-2xl font-extrabold text-brand-forest mb-2">
          Mission Terminée !
        </h2>
        <p className="text-sm text-on-surface-variant mb-6 max-w-xs">
          Le client va noter votre prestation. Le paiement sera traité sous 24h.
        </p>
        <div className="bg-white p-5 rounded-3xl shadow-premium border border-pale-mint/15 w-full max-w-sm space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-variant">Prestation</span>
            <span className="font-bold">{job.laborFeeXOF.toLocaleString()} F</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-variant">Déplacement</span>
            <span className="font-bold">{job.travelFeeXOF.toLocaleString()} F</span>
          </div>
          <div className="border-t border-pale-mint/20 pt-2 flex justify-between text-sm">
            <span className="font-extrabold">Total</span>
            <span className="font-extrabold text-lg">{job.totalFeeXOF.toLocaleString()} F</span>
          </div>
        </div>
        <button
          onClick={onBack}
          className="mt-8 bg-brand-forest text-white px-8 py-3.5 rounded-full font-extrabold text-xs uppercase tracking-wider hover:bg-brand-lime hover:text-brand-forest transition-all active:scale-95 cursor-pointer"
        >
          Retour au Dashboard
        </button>
      </motion.div>
    );
  }

  return (
    <div className="px-5 py-5 pb-32 space-y-5">
      {/* Back + Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5 text-brand-forest" />
        </button>
        <div>
          <h2 className="font-sans text-lg font-extrabold leading-tight">
            {job.serviceName}
          </h2>
          <p className="text-[10px] text-on-surface-variant font-medium">
            {job.clientLocation}
          </p>
        </div>
      </div>

      {/* Status Stepper */}
      <div className="bg-white p-4 rounded-3xl shadow-premium border border-pale-mint/15">
        <div className="flex items-center justify-between">
          <StatusStep
            icon={Check}
            label="Accepté"
            done={checkinStatus !== "pending"}
          />
          <div className="flex-1 h-0.5 mx-2 bg-pale-mint">
            <div
              className={`h-full bg-brand-lime transition-all ${
                checkinStatus === "arrived" || checkinStatus === "started"
                  ? "w-full"
                  : "w-0"
              }`}
            />
          </div>
          <StatusStep
            icon={Navigation}
            label="Arrivé"
            done={checkinStatus === "arrived" || checkinStatus === "started"}
          />
          <div className="flex-1 h-0.5 mx-2 bg-pale-mint">
            <div
              className={`h-full bg-brand-lime transition-all ${
                checkinStatus === "started" ? "w-full" : "w-0"
              }`}
            />
          </div>
          <StatusStep
            icon={Play}
            label="En cours"
            done={checkinStatus === "started"}
          />
        </div>
      </div>

      {/* Client Card */}
      <div className="bg-white p-4 rounded-3xl shadow-premium border border-pale-mint/15 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-pale-mint flex items-center justify-center">
          <UserIcon className="w-6 h-6 text-secondary" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-sm">{job.clientName}</h4>
          <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
            <Phone className="w-3 h-3" /> {job.clientPhone}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-bold text-on-surface-variant uppercase">
            Total
          </p>
          <p className="font-extrabold text-brand-forest">
            {job.totalFeeXOF.toLocaleString()} F
          </p>
        </div>
      </div>

      {/* Phase: Overview — check-in */}
      {phase === "overview" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="bg-brand-forest text-white p-5 rounded-3xl space-y-4">
            <div className="flex items-center gap-3">
              <Navigation className="w-6 h-6 text-brand-lime" />
              <div>
                <h3 className="font-bold text-base">Prêt pour l'intervention</h3>
                <p className="text-xs text-white/60">
                  Confirmez votre arrivée pour débuter
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCheckin}
                disabled={checkinStatus !== "pending"}
                className="flex-1 bg-brand-lime text-brand-forest font-extrabold text-xs py-3.5 rounded-xl uppercase tracking-wider hover:brightness-110 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {checkinStatus !== "pending" ? "Arrivé ✓" : "Arriver sur place"}
              </button>
            </div>
          </div>

          {checkinStatus === "arrived" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-5 rounded-3xl shadow-premium border border-pale-mint/15 space-y-3"
            >
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-brand-lime" />
                <h4 className="font-sans text-xs font-extrabold uppercase tracking-wider">
                  Prêt à commencer ?
                </h4>
              </div>
              <p className="text-xs text-on-surface-variant">
                Confirmez le début de l'intervention pour lancer la checklist et
                le chrono.
              </p>
              <button
                onClick={handleStartJob}
                className="w-full bg-brand-forest text-white font-extrabold text-xs py-3.5 rounded-xl uppercase tracking-wider hover:bg-brand-lime hover:text-brand-forest transition-all active:scale-95 cursor-pointer"
              >
                <Play className="w-4 h-4 inline mr-1.5" />
                Commencer l'intervention
              </button>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Phase: Checklist */}
      {phase === "checklist" && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="bg-white p-5 rounded-3xl shadow-premium border border-pale-mint/15 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-sans text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                <ClipboardCheck className="w-4 h-4" /> Checklist
              </h4>
              <span className="text-[10px] font-bold bg-pale-mint px-2.5 py-1 rounded-full">
                {progressCount}/{checklist.length}
              </span>
            </div>

            <div className="w-full h-2 bg-pale-mint rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-lime rounded-full transition-all"
                style={{
                  width: `${(progressCount / checklist.length) * 100}%`,
                }}
              />
            </div>

            <div className="space-y-1">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleChecklistItem(item.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all active:scale-[0.98] ${
                    item.done
                      ? "bg-brand-lime/15 line-through opacity-60"
                      : "hover:bg-pale-mint/50"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 shrink-0 transition-all ${
                      item.done
                        ? "bg-brand-lime border-brand-lime"
                        : "border-gray-300"
                    }`}
                  >
                    {item.done && (
                      <Check className="w-4 h-4 text-brand-forest" />
                    )}
                  </div>
                  <span className="text-xs font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {allChecked && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <button
                onClick={() => setPhase("photos")}
                className="w-full bg-brand-lime text-brand-forest font-extrabold text-sm py-4 rounded-2xl uppercase tracking-wider hover:brightness-110 transition-all active:scale-95 cursor-pointer"
              >
                Photos avant / après
                <ArrowRight className="w-4 h-4 inline ml-1.5" />
              </button>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Phase: Photos */}
      {phase === "photos" && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="bg-white p-5 rounded-3xl shadow-premium border border-pale-mint/15 space-y-4">
            <h4 className="font-sans text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
              <Camera className="w-4 h-4" /> Photos de l'intervention
            </h4>

            {/* Before Photo */}
            <div>
              <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                Avant
              </p>
              <div
                onClick={() => beforeInputRef.current?.click()}
                className={`relative rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all ${
                  beforePhoto
                    ? "border-brand-lime h-40"
                    : "border-gray-300 h-32 hover:border-brand-lime"
                }`}
              >
                {beforePhoto ? (
                  <>
                    <img
                      src={beforePhoto}
                      alt="Avant"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setBeforePhoto(null);
                      }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-brand-lime text-brand-forest text-[9px] font-bold px-2 py-0.5 rounded-full">
                      Avant ✓
                    </div>
                  </>
                ) : (
                  <>
                    <Camera className="w-8 h-8 text-secondary/60 mb-1" />
                    <p className="text-[10px] text-secondary/60 font-medium">
                      Ajouter une photo
                    </p>
                  </>
                )}
                <input
                  ref={beforeInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => handleFile(e, setBeforePhoto)}
                />
              </div>
            </div>

            {/* After Photo */}
            <div>
              <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                Après
              </p>
              <div
                onClick={() => afterInputRef.current?.click()}
                className={`relative rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all ${
                  afterPhoto
                    ? "border-brand-lime h-40"
                    : "border-gray-300 h-32 hover:border-brand-lime"
                }`}
              >
                {afterPhoto ? (
                  <>
                    <img
                      src={afterPhoto}
                      alt="Après"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setAfterPhoto(null);
                      }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-brand-lime text-brand-forest text-[9px] font-bold px-2 py-0.5 rounded-full">
                      Après ✓
                    </div>
                  </>
                ) : (
                  <>
                    <Camera className="w-8 h-8 text-secondary/60 mb-1" />
                    <p className="text-[10px] text-secondary/60 font-medium">
                      Ajouter une photo
                    </p>
                  </>
                )}
                <input
                  ref={afterInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => handleFile(e, setAfterPhoto)}
                />
              </div>
            </div>
          </div>

          {uploading && (
            <div className="flex items-center justify-center gap-2 text-sm text-on-surface-variant">
              <Loader className="w-4 h-4 animate-spin" />
              Téléchargement...
            </div>
          )}

          {beforePhoto && afterPhoto && !uploading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <button
                onClick={() => setPhase("complete")}
                className="w-full bg-brand-lime text-brand-forest font-extrabold text-sm py-4 rounded-2xl uppercase tracking-wider hover:brightness-110 transition-all active:scale-95 cursor-pointer"
              >
                Terminer la mission
                <CheckCircle className="w-4 h-4 inline ml-1.5" />
              </button>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Phase: Completion Summary */}
      {phase === "complete" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="bg-white p-5 rounded-3xl shadow-premium border border-pale-mint/15 space-y-4">
            <h4 className="font-sans text-xs font-extrabold uppercase tracking-wider">
              Résumé de l'intervention
            </h4>

            <div className="space-y-3">
              <SummaryRow
                icon={ClipboardCheck}
                label="Checklist"
                value={`${progressCount}/${checklist.length} complétée`}
              />
              <SummaryRow
                icon={Camera}
                label="Photos"
                value={beforePhoto && afterPhoto ? "2/2 ajoutées" : "Incomplètes"}
              />
              <SummaryRow
                icon={Clock}
                label="Durée"
                value={`~${Math.floor(Math.random() * 3) + 1}h`}
              />
              <SummaryRow
                icon={DollarSign}
                label="Gain"
                value={`${job.totalFeeXOF.toLocaleString()} F`}
              />
            </div>
          </div>

          <button
            onClick={handleComplete}
            className="w-full bg-brand-forest text-white font-extrabold text-sm py-4 rounded-2xl uppercase tracking-wider hover:bg-brand-lime hover:text-brand-forest transition-all active:scale-95 cursor-pointer"
          >
            <ThumbsUp className="w-4 h-4 inline mr-1.5" />
            Confirmer et terminer
          </button>
        </motion.div>
      )}
    </div>
  );
}

function StatusStep({
  icon: Icon,
  label,
  done,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  done: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
          done
            ? "bg-brand-lime text-brand-forest"
            : "bg-pale-mint text-secondary"
        }`}
      >
        <Icon className="w-4 h-4" />
      </div>
      <span
        className={`text-[8px] font-bold uppercase tracking-wider ${
          done ? "text-brand-forest" : "text-secondary"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

function SummaryRow({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-secondary" />
        <span className="text-xs text-on-surface-variant">{label}</span>
      </div>
      <span className="text-xs font-bold">{value}</span>
    </div>
  );
}
