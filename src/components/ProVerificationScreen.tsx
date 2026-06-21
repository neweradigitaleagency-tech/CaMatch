import { useState, useRef, type ComponentType, type ReactNode, type RefObject } from "react";
import { motion } from "motion/react";
import {
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Camera,
  ChevronLeft,
  ChevronRight,
  Upload,
  FileCheck,
  BadgeCheck,
  Star,
  Crown,
  ArrowLeft,
  Info,
} from "lucide-react";
import { ProVerification, VerificationLevel } from "../types";

interface Props {
  verification: ProVerification;
  onUploadCni: (side: "front" | "back", file: File) => void;
  onUploadSelfie: (file: File) => void;
  onRequestBackgroundCheck: () => void;
  onUploadCert: (file: File) => void;
  onBack: () => void;
}

const LEVELS: {
  level: VerificationLevel;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}[] = [
  { level: "phone", label: "Téléphone", description: "Numéro vérifié par OTP", icon: SmartphoneIcon, color: "text-gray-500", bgColor: "bg-gray-100" },
  { level: "id", label: "Identité", description: "CNI ou Passeport vérifié", icon: ShieldCheck, color: "text-blue-500", bgColor: "bg-blue-50" },
  { level: "background", label: "Confiance", description: "Casier judiciaire + référence", icon: ShieldCheck, color: "text-purple-500", bgColor: "bg-purple-50" },
  { level: "certified", label: "Expert", description: "Certification métier validée", icon: StarCheck, color: "text-amber-500", bgColor: "bg-amber-50" },
  { level: "elite", label: "Elite", description: "Top 5% — 100+ missions, 4.9+", icon: CrownCheck, color: "text-red-500", bgColor: "bg-red-50" },
];

export default function ProVerificationScreen({
  verification,
  onUploadCni,
  onUploadSelfie,
  onRequestBackgroundCheck,
  onUploadCert,
  onBack,
}: Props) {
  const [cniFrontPreview, setCniFrontPreview] = useState<string | null>(null);
  const [cniBackPreview, setCniBackPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [certPreview, setCertPreview] = useState<string | null>(null);
  const [expandedLevel, setExpandedLevel] = useState<VerificationLevel | null>(null);
  const frontRef = useRef<HTMLInputElement>(null);
  const backRef = useRef<HTMLInputElement>(null);
  const selfieRef = useRef<HTMLInputElement>(null);
  const certRef = useRef<HTMLInputElement>(null);

  const handleFile = (ref: RefObject<HTMLInputElement | null>, setPreview: (v: string | null) => void) => {
    const file = ref.current?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const levelIndex = LEVELS.findIndex((l) => l.level === verification.level);
  const currentLevelIndex = levelIndex >= 0 ? levelIndex : -1;

  return (
    <div className="px-5 py-5 pb-32 space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm cursor-pointer">
          <ArrowLeft className="w-5 h-5 text-brand-forest" />
        </button>
        <h2 className="font-sans text-lg font-extrabold">Vérification</h2>
      </div>

      {/* Current Level Badge */}
      <div className="bg-brand-forest text-white p-5 rounded-3xl space-y-3">
        <Shield className="w-8 h-8 text-brand-lime" />
        <div>
          <p className="text-caption text-white/50 uppercase tracking-wider font-bold">Niveau actuel</p>
          <p className="text-xl font-extrabold mt-1">
            {verification.level === "none" ? "Non vérifié" : LEVELS.find((l) => l.level === verification.level)?.label || "Niveau " + verification.level}
          </p>
          <p className="text-xs text-white/60 mt-0.5">{LEVELS.find((l) => l.level === verification.level)?.description}</p>
        </div>
        <div className="flex gap-1 pt-2">
          {LEVELS.map((l, i) => (
            <div
              key={l.level}
              className={`flex-1 h-2 rounded-full ${
                i <= currentLevelIndex ? "bg-brand-lime" : "bg-white/15"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Levels List */}
      <div className="space-y-2">
        {LEVELS.map((level, i) => {
          const isUnlocked = i <= currentLevelIndex;
          const isCurrent = i === currentLevelIndex + 1;
          const isLocked = i > currentLevelIndex + 1;
          const isExpanded = expandedLevel === level.level;

          return (
            <div key={level.level} className="bg-white rounded-3xl shadow-premium border border-pale-mint/15 overflow-hidden">
              <div
                onClick={() => setExpandedLevel(isExpanded ? null : level.level)}
                className={`p-4 flex items-center gap-3 cursor-pointer transition-colors ${
                  isExpanded ? "bg-pale-mint/30" : ""
                }`}
              >
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isUnlocked ? level.bgColor : "bg-gray-50"}`}>
                  <level.icon className={`w-5 h-5 ${isUnlocked ? level.color : "text-gray-300"}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold">{level.label}</h4>
                    {isUnlocked && <CheckCircle className="w-4 h-4 text-green-500" />}
                    {isCurrent && <Clock className="w-4 h-4 text-amber-500" />}
                  </div>
                  <p className="text-caption text-secondary mt-0.5">{level.description}</p>
                </div>
                {isCurrent || isExpanded ? <ChevronDownIcon className={`w-4 h-4 text-secondary transition-transform ${isExpanded ? "rotate-180" : ""}`} /> : null}
              </div>

              {isExpanded && (
                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} className="px-4 pb-4 space-y-3 border-t border-pale-mint/10 pt-3">
                  {level.level === "id" && (
                    <>
                      <p className="text-caption font-medium text-secondary uppercase tracking-wider">Documents d'identité (CNI / Passeport)</p>

                      <div className="grid grid-cols-2 gap-2">
                        <DocUploadBox
                          label="Recto"
                          preview={cniFrontPreview}
                          onPress={() => frontRef.current?.click()}
                          onClear={() => setCniFrontPreview(null)}
                        />
                        <DocUploadBox
                          label="Verso"
                          preview={cniBackPreview}
                          onPress={() => backRef.current?.click()}
                          onClear={() => setCniBackPreview(null)}
                        />
                      </div>
                      <input ref={frontRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={() => handleFile(frontRef, setCniFrontPreview)} />
                      <input ref={backRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={() => handleFile(backRef, setCniBackPreview)} />

                      <SelfieUploadBox preview={selfiePreview} onPress={() => selfieRef.current?.click()} onClear={() => setSelfiePreview(null)} />
                      <input ref={selfieRef} type="file" accept="image/*" capture="user" className="hidden" onChange={() => handleFile(selfieRef, setSelfiePreview)} />

                      {cniFrontPreview && cniBackPreview && selfiePreview && (
                        <button className="w-full bg-brand-forest text-white font-extrabold text-xs py-3 rounded-xl uppercase tracking-wider hover:bg-brand-lime hover:text-brand-forest transition-all active:scale-95 cursor-pointer">
                          <Upload className="w-4 h-4 inline mr-1.5" />
                          Soumettre les documents
                        </button>
                      )}

                      {verification.cniStatus === "pending" && (
                        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-xl">
                          <Clock className="w-4 h-4 shrink-0" />
                          <p className="text-caption font-medium">Vérification en cours (24-48h)</p>
                        </div>
                      )}
                    </>
                  )}

                  {level.level === "background" && (
                    <>
                      <p className="text-caption font-medium text-secondary uppercase tracking-wider">Casier judiciaire + Référence de quartier</p>
                      <div className="bg-pale-mint/30 p-3 rounded-xl space-y-2">
                        <p className="text-caption text-secondary">Téléchargez votre extrait de casier judiciaire (PDF) ou demandez une référence de voisinage.</p>
                        <button
                          onClick={onRequestBackgroundCheck}
                          className="w-full bg-purple-500 text-white font-extrabold text-xs py-3 rounded-xl hover:bg-purple-600 transition-all active:scale-95 cursor-pointer"
                        >
                          <FileCheck className="w-4 h-4 inline mr-1.5" />
                          Demander la vérification
                        </button>
                      </div>
                      {verification.backgroundStatus === "pending" && (
                        <div className="flex items-center gap-2 text-purple-600 bg-purple-50 p-3 rounded-xl">
                          <Clock className="w-4 h-4 shrink-0" />
                          <p className="text-caption font-medium">Vérification en cours (48-72h)</p>
                        </div>
                      )}
                    </>
                  )}

                  {level.level === "certified" && (
                    <>
                      <p className="text-caption font-medium text-secondary uppercase tracking-wider">Certification métier</p>
                      <div className="bg-pale-mint/30 p-3 rounded-xl space-y-2">
                        <p className="text-caption text-secondary">Téléchargez votre diplôme ou certification professionnelle (CAP, BEP, licence, etc.)</p>
                        <div
                          onClick={() => certRef.current?.click()}
                          className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-amber-400 transition-colors"
                        >
                          {certPreview ? (
                            <img src={certPreview} alt="Certification" className="max-h-32 mx-auto rounded-lg" />
                          ) : (
                            <>
                              <Upload className="w-6 h-6 text-secondary/60 mx-auto mb-1" />
                              <p className="text-caption text-secondary/60">Ajouter un document</p>
                            </>
                          )}
                        </div>
                        <input ref={certRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={() => handleFile(certRef, setCertPreview)} />
                      </div>
                      {certPreview && (
                        <button className="w-full bg-amber-500 text-white font-extrabold text-xs py-3 rounded-xl hover:bg-amber-600 transition-all active:scale-95 cursor-pointer">
                          <Upload className="w-4 h-4 inline mr-1.5" />
                          Soumettre la certification
                        </button>
                      )}
                    </>
                  )}

                  {level.level === "elite" && (
                    <div className="bg-red-50 p-4 rounded-xl text-center">
                      <Crown className="w-8 h-8 text-red-500 mx-auto mb-2" />
                      <p className="text-xs font-bold text-red-700">Niveau Élite</p>
                      <p className="text-caption text-red-600/70 mt-1">Atteignez 100 missions avec une note de 4.9+ et zéro litige pour débloquer ce niveau.</p>
                      <div className="flex justify-center gap-4 mt-3 text-caption">
                        <div><span className="font-extrabold text-red-500">140</span><span className="text-red-600/70"> /100 missions</span></div>
                        <div><span className="font-extrabold text-red-500">4.9</span><span className="text-red-600/70"> /5.0 note</span></div>
                        <div><span className="font-extrabold text-red-500">✔</span><span className="text-red-600/70"> 0 litige</span></div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      {/* Info */}
      <div className="bg-pale-mint p-4 rounded-2xl flex items-start gap-2">
        <Info className="w-4 h-4 text-brand-forest shrink-0 mt-0.5" />
        <p className="text-caption text-secondary leading-relaxed">
          Chaque niveau débloque des avantages : priorité dans le matching, frais de plateforme réduits, et accès aux missions premium. Les documents sont chiffrés et supprimés après vérification.
        </p>
      </div>
    </div>
  );
}

function DocUploadBox({ label, preview, onPress, onClear }: { label: string; preview: string | null; onPress: () => void; onClear: () => void }) {
  return (
    <div onClick={preview ? undefined : onPress} className={`relative rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden h-32 ${preview ? "border-green-400" : "border-gray-300 hover:border-brand-lime"}`}>
      {preview ? (
        <>
          <img src={preview} alt={label} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute bottom-1 left-1 bg-green-500 text-white text-caption font-medium px-2 py-0.5 rounded-full">{label} ✓</div>
          <button onClick={(e) => { e.stopPropagation(); onClear(); }} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/40 flex items-center justify-center"><XSmall className="w-3 h-3 text-white" /></button>
        </>
      ) : (
        <>
          <Camera className="w-6 h-6 text-secondary/60 mb-1" />
          <p className="text-caption text-secondary/60 font-medium">{label}</p>
        </>
      )}
    </div>
  );
}

function SelfieUploadBox({ preview, onPress, onClear }: { preview: string | null; onPress: () => void; onClear: () => void }) {
  return (
    <div onClick={preview ? undefined : onPress} className={`relative rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden h-32 ${preview ? "border-green-400" : "border-gray-300 hover:border-brand-lime"}`}>
      {preview ? (
        <>
          <img src={preview} alt="Selfie" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute bottom-1 left-1 bg-green-500 text-white text-caption font-medium px-2 py-0.5 rounded-full">Selfie ✓</div>
          <button onClick={(e) => { e.stopPropagation(); onClear(); }} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/40 flex items-center justify-center"><XSmall className="w-3 h-3 text-white" /></button>
        </>
      ) : (
        <>
          <Camera className="w-6 h-6 text-secondary/60 mb-1" />
          <p className="text-caption text-secondary/60 font-medium">Selfie de vérification</p>
        </>
      )}
    </div>
  );
}

function SmartphoneIcon({ className }: { className?: string }) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>; }
function ShieldCheck({ className }: { className?: string }) { return <Shield className={className} />; }
function StarCheck({ className }: { className?: string }) { return <Star className={className} />; }
function CrownCheck({ className }: { className?: string }) { return <Crown className={className} />; }
function ChevronDownIcon({ className }: { className?: string }) { return <ChevronRight className={className} />; }
function XSmall({ className }: { className?: string }) { return <XCircle className={className} />; }
