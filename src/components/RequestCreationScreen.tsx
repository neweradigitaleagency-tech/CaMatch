import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, MapPin, Check, AlertTriangle, Camera, ChevronRight, Wrench, Zap, Fan, Hammer, Sparkles, Info, Truck, Video, X, FileText, Clock, CalendarDays, Coins } from "lucide-react";
import MapView from "./ui/MapView";

export interface AiRequestDetails {
  category: "electricity" | "plumbing" | "ac" | "carpenter";
  subCategory: string;
  urgency: "low" | "medium" | "high" | "emergency";
  estimatedPriceMinXOF: number;
  estimatedPriceMaxXOF: number;
  summary: string;
}

interface RequestCreationScreenProps {
  onBack: () => void;
  onAnalyze: (description: string) => Promise<AiRequestDetails>;
  onProceedToMatching: (details: AiRequestDetails & { address: string; description: string }) => void;
  onSubmit?: (request: {
    title: string;
    description: string;
    photos: string[];
    category: string;
    address: string;
    budgetXOF: number;
    urgency: "immediate" | "today" | "this_week" | "flexible";
  }) => void;
}

const SUBCATEGORIES: Record<string, string[]> = {
  plumbing: ["Fuite d'eau", "Canalisation bouchée", "Robinetterie", "Chauffe-eau / Ballon", "Toilettes / WC", "Autre"],
  electricity: ["Prise / Interrupteur", "Tableau / Disjoncteur", "Fil / Câblage", "Luminaire / Lustre", "Chauffe-eau électrique", "Autre"],
  ac: ["Recharge gaz / Fréon", "Split non fonctionnel", "Fuite d'eau clim", "Nettoyage clim", "Installation clim neuve", "Autre"],
  carpenter: ["Porte / Fenêtre", "Rangement sur mesure", "Meuble cuisine", "Réparation mobilier", "Parquet / Plancher", "Autre"],
};

const URGENCY_OPTIONS: { value: "emergency" | "high" | "medium" | "low"; label: string; icon: React.ComponentType<{ className?: string }>; desc: string }[] = [
  { value: "emergency", label: "Immédiat", icon: Zap, desc: "Intervention dans l'heure" },
  { value: "high", label: "Aujourd'hui", icon: Clock, desc: "Avant la fin de journée" },
  { value: "medium", label: "Cette semaine", icon: CalendarDays, desc: "Sous 3 à 4 jours" },
  { value: "low", label: "Flexible", icon: Sparkles, desc: "Pas d'urgence" },
];

const STEP_LABELS = ["Catégorie", "Description", "Matériaux", "Budget"];
const CATEGORIES: { id: "electricity" | "plumbing" | "ac" | "carpenter"; label: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
  { id: "electricity", label: "Électricité", icon: Zap, color: "bg-cm-accent-soft text-cm-accent" },
  { id: "plumbing", label: "Plomberie", icon: Wrench, color: "bg-cm-accent-soft text-cm-accent" },
  { id: "ac", label: "Climatisation", icon: Fan, color: "bg-cm-accent-soft text-cm-accent" },
  { id: "carpenter", label: "Menuiserie", icon: Hammer, color: "bg-cm-accent-soft text-cm-accent" },
];

const RAPID_RESPONSES = [
  { icon: Zap, title: "Pas d'électricité", desc: "Le courant a sauté dans toute la maison" },
  { icon: Wrench, title: "Fuite d'eau", desc: "Un robinet ou un tuyau fuit" },
  { icon: Fan, title: "Clim en panne", desc: "Ne refroidit plus / ne s'allume plus" },
  { icon: Hammer, title: "Meuble cassé", desc: "Porte, tiroir ou étagère endommagé" },
];

export default function RequestCreationScreen({ onBack, onAnalyze, onProceedToMatching, onSubmit }: RequestCreationScreenProps) {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<"electricity" | "plumbing" | "ac" | "carpenter" | null>(null);
  const [subCategory, setSubCategory] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [video, setVideo] = useState<string | null>(null);
  const [budget, setBudget] = useState(50000);
  const [address, setAddress] = useState("Cocody Riviera 3, Abidjan");
  const [urgency, setUrgency] = useState<"low" | "medium" | "high" | "emergency" | null>(null);
  const [showAiPill, setShowAiPill] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiDetails, setAiDetails] = useState<AiRequestDetails | null>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [needsMaterials, setNeedsMaterials] = useState(true);
  const [materialsCost, setMaterialsCost] = useState(0);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setShowAiPill(description.length >= 30 && !aiDetails);
  }, [description, aiDetails]);

  const goNext = () => { if (step < 4) setStep((s) => s + 1); else handleAnalyze(); };
  const goPrev = () => { if (step > 1) setStep((s) => s - 1); else onBack(); };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const details = await onAnalyze(description);
      setAiDetails(details);
      setShowAiPill(false);
      if (!category) setCategory(details.category);
      if (!urgency) setUrgency(details.urgency);
      if (!subCategory) setSubCategory(details.subCategory);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((f) => {
      const reader = new FileReader();
      reader.onload = () => setPhotos((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const handleVideoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setVideo(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removePhoto = (i: number) => setPhotos((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = () => {
    const cat: AiRequestDetails["category"] = (category || aiDetails?.category || "ac") as AiRequestDetails["category"];
    const urg: AiRequestDetails["urgency"] = (urgency || aiDetails?.urgency || "medium") as AiRequestDetails["urgency"];
    const sub = subCategory || aiDetails?.subCategory || "Autre";
    if (aiDetails) {
      onProceedToMatching({
        category: cat,
        subCategory: sub,
        urgency: urg,
        estimatedPriceMinXOF: aiDetails.estimatedPriceMinXOF,
        estimatedPriceMaxXOF: aiDetails.estimatedPriceMaxXOF,
        summary: aiDetails.summary,
        address,
        description,
      });
    } else {
      onProceedToMatching({
        category: cat,
        subCategory: sub,
        urgency: urg,
        estimatedPriceMinXOF: aiDetails?.estimatedPriceMinXOF || 10000,
        estimatedPriceMaxXOF: aiDetails?.estimatedPriceMaxXOF || 30000,
        summary: aiDetails?.summary || description.slice(0, 100),
        address,
        description,
      });
    }
  };

  const inputBase = "w-full h-11 px-4 text-[13px] font-bold bg-cm-elevated border border-cm-border rounded-[12px] text-cm-text outline-none focus:border-cm-accent";

  return (
    <div className="flex flex-col w-full min-h-screen pb-8 bg-cm-bg">
      <header className="flex items-center justify-between px-4 pt-3 pb-4 sticky top-0 z-10 bg-cm-bg">
        <button onClick={goPrev} className="w-11 h-11 flex items-center justify-center rounded-[14px] bg-cm-elevated border border-cm-border text-cm-text cursor-pointer active:scale-95">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-0">
          {[1, 2, 3, 4].map((s) => (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center gap-1">
                <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 flex items-center justify-center ${
                  s <= step ? "bg-cm-text" : "bg-cm-border"
                }`}>
                  {s < step && <Check className="w-2 h-2 text-cm-bg" />}
                </div>
                <span className={`text-[9px] font-bold whitespace-nowrap transition-colors ${
                  s === step ? "text-cm-text" : "text-cm-text-soft"
                }`}>{STEP_LABELS[s - 1]}</span>
              </div>
              {s < 4 && (
                <div className={`w-8 sm:w-12 h-[2px] mx-0.5 rounded-full self-start mt-[5px] transition-colors ${
                  s < step ? "bg-cm-text" : "bg-cm-border"
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="w-11 h-11" />
      </header>

      {(showAiPill || isAnalyzing) && (
        <div className="px-5 mb-3">
          <button onClick={handleAnalyze} disabled={isAnalyzing || description.length < 10}
            className={`w-full py-3 rounded-[14px] text-[12px] font-display font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.97] cursor-pointer ${
              isAnalyzing
                ? "bg-cm-elevated text-cm-text-soft border border-cm-border"
                : "bg-cm-text text-cm-bg hover:opacity-90"
            }`}>
            {isAnalyzing ? (
              <><Sparkles className="w-4 h-4 animate-spin" /> Analyse en cours...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Analyser avec l'IA</>
            )}
          </button>
        </div>
      )}

      {aiDetails && (
        <div className="mx-4 mb-4 p-3 bg-cm-accent-soft rounded-[12px] flex items-start gap-2.5 border border-cm-accent/20">
          <Sparkles className="w-4 h-4 text-cm-accent mt-0.5 shrink-0" />
          <div>
            <p className="text-[11px] font-bold text-cm-accent uppercase tracking-wider">Analyse IA</p>
            <p className="text-[12px] text-cm-text mt-0.5">{aiDetails.summary}</p>
            <p className="text-[11px] font-mono text-cm-text-soft mt-1">
              Estimé : {aiDetails.estimatedPriceMinXOF.toLocaleString()} - {aiDetails.estimatedPriceMaxXOF.toLocaleString()} F
            </p>
          </div>
        </div>
      )}

      <div className="flex-1 px-4 space-y-5">
        {step === 1 && (
          <>
            <div>
              <h2 className="text-[18px] font-display font-bold text-cm-text">De quoi s'agit-il ?</h2>
              <p className="text-[13px] text-cm-text-soft mt-1">Choisissez la catégorie qui correspond à votre besoin</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const selected = category === cat.id;
                return (
                  <button key={cat.id} onClick={() => { setCategory(cat.id); setSubCategory(null); }}
                    className={`flex flex-col items-center gap-2 p-4 rounded-[16px] border-2 transition-all active:scale-[0.97] cursor-pointer ${
                      selected
                        ? "border-cm-text bg-cm-text text-cm-bg"
                        : "border-cm-border bg-cm-elevated text-cm-text hover:border-cm-text/30"
                    }`}>
                    <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center ${selected ? "bg-cm-bg/20" : cat.color}`}>
                      <Icon className={`w-5 h-5 ${selected ? "text-cm-bg" : ""}`} />
                    </div>
                    <span className="text-[11px] font-display font-bold text-center">{cat.label}</span>
                  </button>
                );
              })}
            </div>
            {category && SUBCATEGORIES[category] && (
              <div>
                <h3 className="text-[11px] font-display font-bold text-cm-text-soft uppercase tracking-wider mb-2">Sous-catégorie</h3>
                <div className="flex flex-wrap gap-2">
                  {SUBCATEGORIES[category].map((sub) => (
                    <button key={sub} onClick={() => setSubCategory(sub)}
                      className={`px-3.5 py-2 rounded-[10px] text-[11px] font-medium transition-all active:scale-95 cursor-pointer ${
                        subCategory === sub
                          ? "bg-cm-text text-cm-bg"
                          : "bg-cm-elevated text-cm-text border border-cm-border hover:bg-cm-accent-soft"
                      }`}>
                      {sub}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {category && !subCategory && (
              <div className="flex items-center gap-2 text-[11px] text-cm-text-soft">
                <Info className="w-3.5 h-3.5" />
                Sélectionnez une sous-catégorie pour affiner votre demande
              </div>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <h2 className="text-[18px] font-display font-bold text-cm-text">Décrivez le problème</h2>
              <p className="text-[13px] text-cm-text-soft mt-1">Plus vous êtes précis, mieux l'IA pourra vous aider</p>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4">
              {RAPID_RESPONSES.map((r) => {
                const Icon = r.icon;
                return (
                  <button key={r.title} onClick={() => setDescription(r.desc)}
                    className="flex items-center gap-2 px-3.5 py-2.5 bg-cm-elevated border border-cm-border rounded-[12px] whitespace-nowrap cursor-pointer active:scale-95 hover:bg-cm-accent-soft transition-all shrink-0">
                    <Icon className="w-4 h-4 text-cm-accent" />
                    <div className="text-left">
                      <p className="text-[11px] font-bold text-cm-text">{r.title}</p>
                      <p className="text-[9px] text-cm-text-soft">{r.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Ma clim split ne s'allume plus, la télécommande ne répond pas et voyant rouge clignote..."
              className="w-full h-36 text-[14px] bg-cm-elevated border border-cm-border rounded-[16px] p-4 outline-none resize-none text-cm-text placeholder-cm-text-soft font-medium focus:border-cm-text"
            />

            <div>
              <div className="flex items-center gap-3 mb-3">
                <p className="text-[11px] font-display font-bold text-cm-text-soft uppercase tracking-wider">Photos</p>
                <span className="text-[10px] text-cm-text-soft">Optionnel</span>
              </div>
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {photos.map((p, i) => (
                  <div key={i} className="relative w-[68px] h-[68px] rounded-[14px] overflow-hidden border border-cm-border shrink-0">
                    <img src={p} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => removePhoto(i)} className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {video && (
                  <div className="relative w-[68px] h-[68px] rounded-[14px] overflow-hidden border border-cm-accent shrink-0 bg-cm-accent-soft flex items-center justify-center">
                    <Video className="w-6 h-6 text-cm-accent" />
                    <button onClick={() => setVideo(null)} className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <button onClick={() => photoInputRef.current?.click()} className="w-[68px] h-[68px] rounded-[14px] border-2 border-dashed border-cm-border flex flex-col items-center justify-center gap-0.5 text-cm-text-soft bg-cm-elevated cursor-pointer hover:border-cm-text/30 transition-all shrink-0">
                  <Camera className="w-5 h-5" />
                  <span className="text-[8px] font-medium">Photo</span>
                </button>
                <button onClick={() => videoInputRef.current?.click()} className="w-[68px] h-[68px] rounded-[14px] border-2 border-dashed border-cm-border flex flex-col items-center justify-center gap-0.5 text-cm-text-soft bg-cm-elevated cursor-pointer hover:border-cm-text/30 transition-all shrink-0">
                  <Video className="w-5 h-5" />
                  <span className="text-[8px] font-medium">Vidéo</span>
                </button>
              </div>
              <input ref={photoInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoAdd} />
              <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoAdd} />
            </div>

            <div className="flex items-center gap-3 p-3 bg-cm-accent-soft/50 rounded-[12px]">
              <AlertTriangle className="w-5 h-5 text-cm-accent shrink-0" />
              <p className="text-[11px] text-cm-text-soft">Notre IA analysera votre description pour estimer le coût et la durée de l'intervention.</p>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div>
              <h2 className="text-[18px] font-display font-bold text-cm-text">Matériaux & équipement</h2>
              <p className="text-[13px] text-cm-text-soft mt-1">Le professionnel peut apporter le matériel nécessaire</p>
            </div>

            <div className="bg-cm-elevated rounded-[16px] p-4 border border-cm-border">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className={`w-5 h-5 rounded-[6px] border-2 flex items-center justify-center transition-all ${
                  needsMaterials ? "bg-cm-text border-cm-text" : "border-cm-border"
                }`}>
                  {needsMaterials && <Check className="w-3 h-3 text-cm-bg" />}
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-bold text-cm-text">Je veux inclure les matériaux</p>
                  <p className="text-[11px] text-cm-text-soft">Le pro apporte tout le nécessaire</p>
                </div>
                <input type="checkbox" checked={needsMaterials} onChange={() => setNeedsMaterials(!needsMaterials)} className="hidden" />
              </label>
            </div>

            {needsMaterials && (
              <div>
                <label className="text-[11px] font-display font-bold text-cm-text-soft uppercase tracking-wider mb-1 block">Coût estimé des matériaux (FCFA)</label>
                <div className="relative">
                    <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cm-text-soft" />
                    <input type="number" value={materialsCost} onChange={(e) => setMaterialsCost(Number(e.target.value))}
                      className={`${inputBase} pl-9`} placeholder="10 000" />
                </div>
              </div>
            )}

            <div className="bg-cm-elevated rounded-[16px] p-4 border border-cm-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] text-cm-text-soft">Frais de déplacement</span>
                <span className="text-[12px] font-bold text-cm-text font-mono">5 000 F</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-cm-text-soft">Main-d'œuvre</span>
                <span className="text-[12px] font-bold text-cm-text font-mono">Estimé par le pro</span>
              </div>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <div>
              <h2 className="text-[18px] font-display font-bold text-cm-text">Budget & urgence</h2>
              <p className="text-[13px] text-cm-text-soft mt-1">Quel est votre budget et votre niveau d'urgence ?</p>
            </div>

            <div>
              <label className="text-[11px] font-display font-bold text-cm-text-soft uppercase tracking-wider mb-2 block">Votre budget max (FCFA)</label>
              <div className="relative">
                    <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cm-text-soft" />
                    <input type="number" value={budget} onChange={(e) => setBudget(Number(e.target.value))}
                  className={`${inputBase} pl-9`} />
              </div>
              <div className="flex justify-between text-[10px] text-cm-text-soft mt-1 px-1">
                <span>5 000</span>
                <span>250 000+</span>
              </div>
            </div>

            <div>
              <h3 className="text-[11px] font-display font-bold text-cm-text-soft uppercase tracking-wider mb-2">Niveau d'urgence</h3>
              <div className="grid grid-cols-2 gap-2.5">
                {URGENCY_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const selected = urgency === opt.value;
                  return (
                    <button key={opt.value} onClick={() => setUrgency(opt.value)}
                      className={`flex items-start gap-2.5 p-3.5 rounded-[14px] border-2 transition-all text-left active:scale-[0.97] cursor-pointer ${
                        selected
                          ? "border-cm-text bg-cm-text text-cm-bg"
                          : "border-cm-border bg-cm-elevated text-cm-text hover:border-cm-text/30"
                      }`}>
                      <Icon className={`w-4 h-4 mt-0.5 ${selected ? "text-cm-bg" : "text-cm-accent"}`} />
                      <div>
                        <p className="text-[12px] font-display font-bold">{opt.label}</p>
                        <p className={`text-[10px] ${selected ? "text-cm-bg/70" : "text-cm-text-soft"} mt-0.5`}>{opt.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-display font-bold text-cm-text-soft uppercase tracking-wider mb-2 block">Adresse d'intervention</label>
              <button onClick={() => setShowMapPicker(true)}
                className="w-full flex items-center gap-2.5 p-3 bg-cm-elevated border border-cm-border rounded-[14px] text-left cursor-pointer active:scale-[0.97] hover:bg-cm-accent-soft transition-all">
                <MapPin className="w-5 h-5 text-cm-accent shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold text-cm-text truncate">{address}</p>
                  <p className="text-[10px] text-cm-text-soft">Appuyez pour modifier</p>
                </div>
                <ChevronRight className="w-4 h-4 text-cm-text-soft shrink-0" />
              </button>
            </div>

            <div className="bg-cm-elevated rounded-[16px] p-4 border border-cm-border space-y-2.5">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-cm-text-soft">Catégorie</span>
                <span className="font-bold text-cm-text">{category ? CATEGORIES.find((c) => c.id === category)?.label : aiDetails?.category ? CATEGORIES.find((c) => c.id === aiDetails?.category)?.label : "-"}</span>
              </div>
              {subCategory && (
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-cm-text-soft">Sous-catégorie</span>
                  <span className="font-bold text-cm-text">{subCategory}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-cm-text-soft">Budget max</span>
                <span className="font-bold text-cm-text font-mono">{budget.toLocaleString()} F</span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-cm-text-soft">Urgence</span>
                <span className="font-bold text-cm-text">{URGENCY_OPTIONS.find((o) => o.value === urgency)?.label || "-"}</span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-cm-text-soft">Adresse</span>
                <span className="font-bold text-cm-text text-right max-w-[180px] truncate">{address}</span>
              </div>
              {needsMaterials && (
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-cm-text-soft">Matériaux inclus</span>
                  <span className="font-bold text-cm-text font-mono">{materialsCost.toLocaleString()} F</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="sticky bottom-0 px-4 pt-3 pb-6 bg-cm-bg border-t border-cm-border mt-4">
        {step < 4 ? (
          <button onClick={goNext}
            disabled={step === 1 && (!category || !subCategory) || step === 2 && description.length < 5}
            className={`w-full py-4 rounded-[14px] text-[13px] font-display font-bold transition-all active:scale-[0.97] cursor-pointer flex items-center justify-center gap-2 ${
              (step === 1 && (!category || !subCategory)) || (step === 2 && description.length < 5)
                ? "bg-cm-border text-cm-text-soft cursor-not-allowed"
                : "bg-cm-text text-cm-bg hover:opacity-90"
            }`}>
            Continuer <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={handleSubmit}
            disabled={!urgency || !address || budget < 1000}
            className={`w-full py-4 rounded-[14px] text-[13px] font-display font-bold transition-all active:scale-[0.97] cursor-pointer flex items-center justify-center gap-2 ${
              !urgency || !address || budget < 1000
                ? "bg-cm-border text-cm-text-soft cursor-not-allowed"
                : "bg-cm-text text-cm-bg hover:opacity-90"
            }`}>
            <Sparkles className="w-4 h-4" /> Trouver un professionnel
          </button>
        )}
      </div>

      {/* Map Picker Bottom Sheet */}
      {showMapPicker && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={() => setShowMapPicker(false)}>
          <div className="w-full max-w-md bg-cm-bg rounded-t-[24px] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 flex items-center justify-between border-b border-cm-border">
              <h3 className="text-[14px] font-display font-bold text-cm-text">Choisir l'adresse</h3>
              <button onClick={() => setShowMapPicker(false)} className="w-10 h-10 rounded-full bg-cm-elevated flex items-center justify-center cursor-pointer">
                <X className="w-5 h-5 text-cm-text" />
              </button>
            </div>
            <div className="h-64">
              <MapView height="h-64" markers={[{ id: "client", lat: 5.35, lng: -4.00, label: address }]} interactive />
            </div>
            <div className="p-4 space-y-3">
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={inputBase}
                placeholder="Entrez votre adresse" />
              <button onClick={() => setShowMapPicker(false)}
                className="w-full py-4 bg-cm-text text-cm-bg font-display font-bold text-[13px] rounded-[14px] hover:opacity-90 transition-all cursor-pointer active:scale-[0.97]">
                Confirmer l'adresse
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
