import { useState, useRef, type ComponentType, type ReactNode, type RefObject } from "react";
import {
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Camera,
  Upload,
  FileCheck,
  BadgeCheck,
  Star,
  Crown,
  ArrowLeft,
  Info,
  ChevronRight,
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
}[] = [
  { level: "phone", label: "Téléphone", description: "Numéro vérifié par OTP", icon: SmartphoneIcon },
  { level: "id", label: "Identité", description: "CNI ou Passeport vérifié", icon: ShieldCheck },
  { level: "background", label: "Confiance", description: "Casier judiciaire + référence", icon: ShieldCheck },
  { level: "certified", label: "Expert", description: "Certification métier validée", icon: StarCheck },
  { level: "elite", label: "Elite", description: "Top 5% — 100+ missions, 4.9+", icon: CrownCheck },
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
    <div className="px-5 py-5 pb-32 space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="w-9 h-9 rounded-full bg-cm-elevated border border-cm-border flex items-center justify-center cursor-pointer">
          <ArrowLeft className="w-4 h-4 text-cm-text" />
        </button>
        <h2 className="text-[16px] font-bold">Vérification</h2>
      </div>

      <div className="bg-cm-accent text-white p-4 rounded-[var(--radius-cm-lg)] space-y-3">
        <Shield className="w-6 h-6 text-white/80" />
        <div>
          <p className="text-[11px] text-white/60 font-medium">Niveau actuel</p>
          <p className="text-[17px] font-bold mt-0.5">
            {verification.level === "none" ? "Non vérifié" : LEVELS.find((l) => l.level === verification.level)?.label || "Niveau " + verification.level}
          </p>
          <p className="text-[12px] text-white/70 mt-0.5">{LEVELS.find((l) => l.level === verification.level)?.description}</p>
        </div>
        <div className="flex gap-1">
          {LEVELS.map((l, i) => (
            <div key={l.level} className={`flex-1 h-1.5 rounded-full ${i <= currentLevelIndex ? "bg-white" : "bg-white/20"}`} />
          ))}
        </div>
      </div>

      <div className="space-y-1">
        {LEVELS.map((level, i) => {
          const isUnlocked = i <= currentLevelIndex;
          const isCurrent = i === currentLevelIndex + 1;
          const isLocked = i > currentLevelIndex + 1;
          const isExpanded = expandedLevel === level.level;

          return (
            <div key={level.level} className="bg-cm-elevated border border-cm-border rounded-[var(--radius-cm)] overflow-hidden">
              <div
                onClick={() => setExpandedLevel(isExpanded ? null : level.level)}
                className="px-4 py-3 flex items-center gap-3 cursor-pointer"
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isUnlocked ? "bg-cm-accent-soft" : "bg-gray-100"}`}>
                  <level.icon className={`w-4 h-4 ${isUnlocked ? "text-cm-accent" : "text-cm-text-muted"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-[14px] font-semibold text-cm-text">{level.label}</h4>
                    {isUnlocked && <CheckCircle className="w-4 h-4 text-cm-accent shrink-0" />}
                    {isCurrent && <Clock className="w-4 h-4 text-amber-500 shrink-0" />}
                  </div>
                  <p className="text-[12px] text-cm-text-soft">{level.description}</p>
                </div>
                {(isCurrent || isExpanded) && (
                  <ChevronRight className={`w-4 h-4 text-cm-text-muted transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                )}
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-3 border-t border-cm-border pt-3">
                  {level.level === "id" && (
                    <>
                      <p className="text-[12px] font-medium text-cm-text-soft">Documents d'identité (CNI / Passeport)</p>

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
                        <button className="w-full bg-cm-accent text-white font-medium text-[13px] py-2.5 rounded-[var(--radius-cm)] cm-scale-btn hover:bg-cm-accent-hover">
                          <Upload className="w-4 h-4 inline mr-1.5" />
                          Soumettre les documents
                        </button>
                      )}

                      {verification.cniStatus === "pending" && (
                        <div className="flex items-center gap-2 text-amber-700 bg-amber-50 p-2.5 rounded-[var(--radius-cm)] text-[13px]">
                          <Clock className="w-4 h-4 shrink-0" />
                          Vérification en cours (24-48h)
                        </div>
                      )}
                    </>
                  )}

                  {level.level === "background" && (
                    <>
                      <p className="text-[12px] font-medium text-cm-text-soft">Casier judiciaire + Référence de quartier</p>
                      <div className="bg-gray-50 p-3 rounded-[var(--radius-cm)] space-y-2">
                        <p className="text-[12px] text-cm-text-soft">Téléchargez votre extrait de casier judiciaire (PDF) ou demandez une référence de voisinage.</p>
                        <button onClick={onRequestBackgroundCheck} className="w-full bg-cm-accent text-white font-medium text-[12px] py-2.5 rounded-[var(--radius-cm)] cm-scale-btn hover:bg-cm-accent-hover">
                          <FileCheck className="w-4 h-4 inline mr-1.5" />
                          Demander la vérification
                        </button>
                      </div>
                      {verification.backgroundStatus === "pending" && (
                        <div className="flex items-center gap-2 text-purple-700 bg-purple-50 p-2.5 rounded-[var(--radius-cm)] text-[13px]">
                          <Clock className="w-4 h-4 shrink-0" />
                          Vérification en cours (48-72h)
                        </div>
                      )}
                    </>
                  )}

                  {level.level === "certified" && (
                    <>
                      <p className="text-[12px] font-medium text-cm-text-soft">Certification métier</p>
                      <div className="bg-gray-50 p-3 rounded-[var(--radius-cm)] space-y-2">
                        <p className="text-[12px] text-cm-text-soft">Téléchargez votre diplôme ou certification professionnelle (CAP, BEP, licence, etc.)</p>
                        <div onClick={() => certRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-[var(--radius-cm)] p-4 text-center cursor-pointer hover:border-cm-accent">
                          {certPreview ? (
                            <img src={certPreview} alt="Certification" className="max-h-24 mx-auto rounded-lg" />
                          ) : (
                            <>
                              <Upload className="w-5 h-5 text-cm-text-muted mx-auto mb-1" />
                              <p className="text-[12px] text-cm-text-muted">Ajouter un document</p>
                            </>
                          )}
                        </div>
                        <input ref={certRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={() => handleFile(certRef, setCertPreview)} />
                      </div>
                      {certPreview && (
                        <button className="w-full bg-cm-accent text-white font-medium text-[12px] py-2.5 rounded-[var(--radius-cm)] cm-scale-btn hover:bg-cm-accent-hover">
                          <Upload className="w-4 h-4 inline mr-1.5" />
                          Soumettre la certification
                        </button>
                      )}
                    </>
                  )}

                  {level.level === "elite" && (
                    <div className="bg-red-50 p-4 rounded-[var(--radius-cm)] text-center">
                      <Crown className="w-6 h-6 text-red-500 mx-auto mb-2" />
                      <p className="text-[13px] font-bold text-red-700">Niveau Élite</p>
                      <p className="text-[12px] text-red-600/70 mt-1">Atteignez 100 missions avec une note de 4.9+ et zéro litige pour débloquer ce niveau.</p>
                      <div className="flex justify-center gap-4 mt-3 text-[12px]">
                        <div><span className="font-bold text-red-500">140</span><span className="text-red-600/70"> /100 missions</span></div>
                        <div><span className="font-bold text-red-500">4.9</span><span className="text-red-600/70"> /5.0 note</span></div>
                        <div><span className="font-bold text-red-500">✔</span><span className="text-red-600/70"> 0 litige</span></div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-cm-accent-soft p-3 rounded-[var(--radius-cm)] flex items-start gap-2 text-[12px] text-cm-text-soft">
        <Info className="w-4 h-4 text-cm-accent shrink-0 mt-0.5" />
        Chaque niveau débloque des avantages : priorité dans le matching, frais réduits, et accès aux missions premium.
      </div>
    </div>
  );
}

function DocUploadBox({ label, preview, onPress, onClear }: { label: string; preview: string | null; onPress: () => void; onClear: () => void }) {
  return (
    <div onClick={preview ? undefined : onPress} className={`relative rounded-[var(--radius-cm)] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden h-28 ${preview ? "border-cm-accent" : "border-gray-300 hover:border-cm-accent"}`}>
      {preview ? (
        <>
          <img src={preview} alt={label} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute bottom-1 left-1 bg-cm-accent text-white text-[11px] font-medium px-2 py-0.5 rounded-full">{label} ✓</div>
          <button onClick={(e) => { e.stopPropagation(); onClear(); }} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/40 flex items-center justify-center">
            <XCircle className="w-3 h-3 text-white" />
          </button>
        </>
      ) : (
        <>
          <Camera className="w-5 h-5 text-cm-text-muted mb-1" />
          <p className="text-[11px] text-cm-text-muted font-medium">{label}</p>
        </>
      )}
    </div>
  );
}

function SelfieUploadBox({ preview, onPress, onClear }: { preview: string | null; onPress: () => void; onClear: () => void }) {
  return (
    <div onClick={preview ? undefined : onPress} className={`relative rounded-[var(--radius-cm)] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden h-28 ${preview ? "border-cm-accent" : "border-gray-300 hover:border-cm-accent"}`}>
      {preview ? (
        <>
          <img src={preview} alt="Selfie" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute bottom-1 left-1 bg-cm-accent text-white text-[11px] font-medium px-2 py-0.5 rounded-full">Selfie ✓</div>
          <button onClick={(e) => { e.stopPropagation(); onClear(); }} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/40 flex items-center justify-center">
            <XCircle className="w-3 h-3 text-white" />
          </button>
        </>
      ) : (
        <>
          <Camera className="w-5 h-5 text-cm-text-muted mb-1" />
          <p className="text-[11px] text-cm-text-muted font-medium">Selfie de vérification</p>
        </>
      )}
    </div>
  );
}

function SmartphoneIcon({ className }: { className?: string }) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>; }
function ShieldCheck({ className }: { className?: string }) { return <Shield className={className} />; }
function StarCheck({ className }: { className?: string }) { return <Star className={className} />; }
function CrownCheck({ className }: { className?: string }) { return <Crown className={className} />; }
