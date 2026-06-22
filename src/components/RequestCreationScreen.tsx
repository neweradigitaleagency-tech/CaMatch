import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, MapPin, Check, AlertTriangle, Camera, ChevronRight, DollarSign, Wrench, Zap, Fan, Hammer, Sparkles, Info, Truck, Video, X, FileText } from "lucide-react";
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
  electricity: ["Prise / Interrupteur", "Tableau / Disjoncteur", "Câblage / Installation", "Éclairage", "Mise aux normes", "Autre"],
  ac: ["Panne / Réparation", "Recharge de gaz", "Nettoyage / Entretien", "Installation / Déplacement", "Autre"],
  carpenter: ["Meuble sur mesure", "Porte / Fenêtre", "Cuisine / Dressing", "Réparation / Rénovation", "Terrasse / Extérieur", "Autre"],
};

const URGENCY_OPTIONS = [
  { value: "low", label: "Faible", icon: "🟢", desc: "Peut attendre quelques jours" },
  { value: "medium", label: "Moyenne", icon: "⚡", desc: "Sous 48h" },
  { value: "high", label: "Élevée", icon: "🔥", desc: "Aujourd'hui / Demain" },
  { value: "emergency", label: "Urgente", icon: "🚨", desc: "Immédiat (risque de dégâts)" },
] as const;

const CATEGORIES = [
  { id: "plumbing", label: "Plomberie", icon: Wrench, emoji: "🔧" },
  { id: "electricity", label: "Électricité", icon: Zap, emoji: "⚡" },
  { id: "ac", label: "Climatisation", icon: Fan, emoji: "❄️" },
  { id: "carpenter", label: "Menuiserie", icon: Hammer, emoji: "🔨" },
] as const;

const STEP_LABELS = ["Catégorie", "Description", "Matériel", "Budget"];

type Category = "plumbing" | "electricity" | "ac" | "carpenter";

export default function RequestCreationScreen({ onBack, onAnalyze, onProceedToMatching, onSubmit }: RequestCreationScreenProps) {
  const [step, setStep] = useState(1);

  const [category, setCategory] = useState<Category | null>(null);
  const [subCategory, setSubCategory] = useState<string | null>(null);
  const [urgency, setUrgency] = useState<"low" | "medium" | "high" | "emergency" | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [video, setVideo] = useState<string | null>(null);
  const [address, setAddress] = useState("Cocody Riviera 3, Abidjan, Côte d'Ivoire");
  const [showMapPicker, setShowMapPicker] = useState(false);

  const [hasMaterials, setHasMaterials] = useState<"yes" | "no" | "unsure" | null>(null);
  const [whoBuys, setWhoBuys] = useState<"client" | "pro" | null>(null);

  const [laborBudget, setLaborBudget] = useState("");
  const [transportFees, setTransportFees] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [detectedDetails, setDetectedDetails] = useState<AiRequestDetails | null>(null);
  const [showAiPill, setShowAiPill] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const subCategories = category ? SUBCATEGORIES[category] : [];

  useEffect(() => {
    if (description.trim().length < 15) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setIsAnalyzing(true);
      try {
        const result = await onAnalyze(description);
        setDetectedDetails(result);
        if (!category) setCategory(result.category);
        if (!subCategory) setSubCategory(result.subCategory);
        if (!urgency) setUrgency(result.urgency);
        setShowAiPill(true);
        setAiError(null);
        setTimeout(() => setShowAiPill(false), 5000);
      } catch (err: any) {
        setAiError(err.message || "Erreur d'analyse");
      } finally {
        setIsAnalyzing(false);
      }
    }, 800);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [description]);

  useEffect(() => {
    if (description.trim()) {
      const words = description.trim().split(" ");
      setTitle(words.slice(0, 8).join(" ") + (words.length > 8 ? "..." : ""));
    } else {
      setTitle("");
    }
  }, [description]);

  const handlePhotoCapture = () => {
    const file = photoInputRef.current?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { if (reader.result && typeof reader.result === "string") setPhotos((p) => [...p, reader.result as string]); };
    reader.readAsDataURL(file);
  };

  const removePhoto = (idx: number) => setPhotos((p) => p.filter((_, i) => i !== idx));

  const handleVideoCapture = () => {
    const file = videoInputRef.current?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { if (reader.result && typeof reader.result === "string") setVideo(reader.result as string); };
    reader.readAsDataURL(file);
  };

  const canNext = (): boolean => {
    if (step === 1) return !!category && !!subCategory && !!urgency;
    if (step === 2) return description.trim().length > 0;
    if (step === 3) return !!hasMaterials && (hasMaterials === "yes" || !!whoBuys);
    if (step === 4) return acceptTerms;
    return false;
  };

  const goNext = () => { if (canNext()) setStep((s) => s + 1); };
  const goPrev = () => { if (step > 1) setStep((s) => s - 1); else onBack(); };

  const handleFinalSubmit = () => {
    if (!canNext()) return;
    const urgencyMap: Record<string, "immediate" | "today" | "this_week" | "flexible"> = {
      emergency: "immediate", high: "today", medium: "this_week", low: "flexible",
    };
    if (onSubmit) {
      onSubmit({
        title: title || description.slice(0, 50),
        description,
        photos,
        category: category || "ac",
        address,
        budgetXOF: parseInt(laborBudget) || 0,
        urgency: urgencyMap[urgency || "medium"],
      });
    }
    onProceedToMatching({
      category: category || detectedDetails?.category || "ac",
      subCategory: subCategory || detectedDetails?.subCategory || "Autre",
      urgency: urgency || detectedDetails?.urgency || "medium",
      estimatedPriceMinXOF: detectedDetails?.estimatedPriceMinXOF || 10000,
      estimatedPriceMaxXOF: detectedDetails?.estimatedPriceMaxXOF || 30000,
      summary: detectedDetails?.summary || description.slice(0, 100),
      address,
      description,
    });
  };

  const inputBase = "w-full h-11 px-4 text-[13px] font-bold bg-[rgba(255,255,255,0.50)] backdrop-blur-[8px] border border-[rgba(232,224,208,0.80)] rounded-[12px] text-ca-text-primary outline-none focus:border-[rgba(82,183,136,0.60)] focus:bg-[rgba(255,255,255,0.70)]";

  return (
    <div className="flex flex-col w-full min-h-screen pb-8" style={{ background: "linear-gradient(180deg, #D8F3DC 0%, #F5F0E8 100%)" }}>
      {/* ── Header ── */}
      <header className="flex items-center justify-between px-4 pt-3 pb-4 sticky top-0 z-10" style={{ background: "linear-gradient(180deg, #D8F3DC 0%, transparent 100%)" }}>
        <button onClick={goPrev} className="w-11 h-11 flex items-center justify-center rounded-[14px] bg-[rgba(255,255,255,0.60)] backdrop-blur-[8px] border border-[rgba(255,255,255,0.35)] text-ca-text-primary cursor-pointer active:scale-95 shadow-[0_4px_16px_rgba(45,106,79,0.06)]">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-0">
          {[1, 2, 3, 4].map((s) => (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center gap-1">
                <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 flex items-center justify-center ${
                  s <= step ? "bg-ca-green-primary" : "bg-[rgba(232,224,208,0.60)]"
                }`}>
                  {s < step && <Check className="w-2 h-2 text-white" />}
                </div>
                <span className={`text-[9px] font-bold whitespace-nowrap transition-colors ${
                  s === step ? "text-ca-green-primary" : "text-[rgba(27,46,31,0.30)]"
                }`}>{STEP_LABELS[s - 1]}</span>
              </div>
              {s < 4 && (
                <div className={`w-8 sm:w-12 h-[2px] mx-0.5 rounded-full self-start mt-[5px] transition-colors ${
                  s < step ? "bg-ca-green-primary" : "bg-[rgba(232,224,208,0.60)]"
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="w-11 h-11" />
      </header>

      {/* ── AI Pill ── */}
      {(showAiPill || isAnalyzing) && (
        <div className="px-5 mb-3">
          <div className="flex items-center gap-2 text-[11px] font-bold text-ca-green-primary bg-[rgba(82,183,136,0.12)] px-4 py-2 rounded-[9999px] backdrop-blur-[4px] border border-[rgba(82,183,136,0.20)] w-fit">
            <Sparkles className={`w-3.5 h-3.5 ${isAnalyzing ? "animate-pulse" : ""}`} />
            <span>{isAnalyzing ? "Analyse en cours..." : "✨ Catégorie détectée automatiquement"}</span>
          </div>
        </div>
      )}

      {/* ── Step 1: Category + SubCategory + Urgency ── */}
      {step === 1 && (
        <main className="px-5 flex-grow flex flex-col gap-5">
          <div>
            <h2 className="text-[22px] font-extrabold text-ca-text-primary tracking-tight">Catégorie & Urgence</h2>
            <p className="text-ca-text-secondary text-[13px] mt-1">Sélectionnez le type de service et l'urgence.</p>
          </div>

          {/* Category Grid */}
          <div>
            <label className="text-[11px] font-bold uppercase text-ca-text-secondary tracking-wider mb-2.5 block">Catégorie</label>
            <div className="grid grid-cols-2 gap-2.5">
              {CATEGORIES.map((cat) => {
                const isActive = category === cat.id;
                return (
                  <button key={cat.id} onClick={() => { setCategory(cat.id); setSubCategory(null); }}
                    className={`p-4 rounded-[16px] flex items-center gap-3 transition-all active:scale-95 cursor-pointer border ${
                      isActive
                        ? "bg-[rgba(45,106,79,0.85)] text-white border-[rgba(82,183,136,0.40)] shadow-[0_4px_16px_rgba(45,106,79,0.15)]"
                        : "bg-[rgba(255,255,255,0.60)] backdrop-blur-[8px] text-ca-text-primary border-[rgba(255,255,255,0.35)] hover:shadow-[0_4px_16px_rgba(45,106,79,0.06)]"
                    }`}>
                    <span className="text-xl">{cat.emoji}</span>
                    <span className="text-[14px] font-bold">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SubCategory */}
          {subCategories.length > 0 && (
            <div>
              <label className="text-[11px] font-bold uppercase text-ca-text-secondary tracking-wider mb-2.5 block">Type de service</label>
              <div className="flex flex-wrap gap-2">
                {subCategories.map((sc) => {
                  const isActive = subCategory === sc;
                  return (
                    <button key={sc} onClick={() => setSubCategory(sc)}
                      className={`px-4 py-2.5 rounded-[9999px] text-[12px] font-bold transition-all active:scale-95 cursor-pointer border ${
                        isActive
                          ? "bg-ca-green-primary text-white border-[rgba(82,183,136,0.40)]"
                          : "bg-[rgba(255,255,255,0.50)] backdrop-blur-[4px] text-ca-text-primary border-[rgba(255,255,255,0.35)] hover:bg-[rgba(255,255,255,0.70)]"
                      }`}>
                      {sc}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Urgency */}
          <div>
            <label className="text-[11px] font-bold uppercase text-ca-text-secondary tracking-wider mb-2.5 block">Urgence</label>
            <div className="grid grid-cols-2 gap-2.5">
              {URGENCY_OPTIONS.map((u) => {
                const isActive = urgency === u.value;
                return (
                  <button key={u.value} onClick={() => setUrgency(u.value)}
                    className={`p-4 rounded-[16px] text-left transition-all active:scale-95 cursor-pointer border ${
                      isActive
                        ? "bg-[rgba(45,106,79,0.85)] text-white border-[rgba(82,183,136,0.40)] shadow-[0_4px_16px_rgba(45,106,79,0.15)]"
                        : "bg-[rgba(255,255,255,0.60)] backdrop-blur-[8px] text-ca-text-primary border-[rgba(255,255,255,0.35)] hover:shadow-[0_4px_16px_rgba(45,106,79,0.06)]"
                    }`}>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-base">{u.icon}</span>
                      <span className="text-[14px] font-bold">{u.label}</span>
                    </div>
                    <p className="text-[11px] mt-1 opacity-70">{u.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI Error */}
          {aiError && (
            <div className="bg-[rgba(230,57,70,0.10)] border border-[rgba(230,57,70,0.25)] text-ca-error p-4 rounded-[16px] flex gap-2.5 items-start backdrop-blur-[4px]">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="text-[12px] font-medium">{aiError}</p>
            </div>
          )}
        </main>
      )}

      {/* ── Step 2: Description + Media + Location ── */}
      {step === 2 && (
        <main className="px-5 flex-grow flex flex-col gap-5">
          <div>
            <h2 className="text-[22px] font-extrabold text-ca-text-primary tracking-tight">Décrivez le problème</h2>
            <p className="text-ca-text-secondary text-[13px] mt-1">Plus vous donnez de détails, mieux l'IA pourra vous aider.</p>
          </div>

          {/* Title (auto) */}
          {title && (
            <div className="flex items-center gap-2 text-[13px] text-ca-text-muted bg-[rgba(255,255,255,0.40)] px-4 py-2.5 rounded-[12px] border border-[rgba(255,255,255,0.25)]">
              <FileText className="w-4 h-4 shrink-0" />
              <span className="italic">"{title}"</span>
              <Sparkles className="w-3 h-3 text-ca-green-primary shrink-0 ml-auto" />
            </div>
          )}

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase text-ca-text-secondary tracking-wider">Description</label>
              <span className="text-[10px] text-ca-text-muted font-medium">{description.length}/500</span>
            </div>
            <textarea value={description} onChange={(e) => { if (e.target.value.length <= 500) setDescription(e.target.value); }}
              placeholder="Décrivez la panne, les symptômes, et ce qui s'est passé. Ex: Mon climatiseur ne refroidit plus, il fait un bruit étrange et de l'eau coule..."
              className="w-full h-36 text-[14px] bg-[rgba(255,255,255,0.50)] backdrop-blur-[8px] border border-[rgba(232,224,208,0.80)] rounded-[16px] p-4 outline-none resize-none text-ca-text-primary placeholder-ca-text-muted font-medium focus:border-[rgba(82,183,136,0.60)] focus:bg-[rgba(255,255,255,0.70)]"
            />
          </div>

          {/* Photos + Video */}
          <div className="flex flex-col gap-3">
            <label className="text-[11px] font-bold uppercase text-ca-text-secondary tracking-wider">Photos & Vidéo</label>
            <div className="flex gap-2.5 flex-wrap">
              {photos.map((photo, i) => (
                <div key={i} className="relative w-[68px] h-[68px] rounded-[14px] overflow-hidden border border-[rgba(255,255,255,0.35)] shrink-0 shadow-sm">
                  <img src={photo} className="w-full h-full object-cover" alt="" />
                  <button onClick={() => removePhoto(i)} className="absolute top-1 right-1 w-5 h-5 bg-[rgba(27,46,31,0.70)] backdrop-blur-[4px] rounded-full flex items-center justify-center text-white shadow-sm cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {video && (
                <div className="relative w-[68px] h-[68px] rounded-[14px] overflow-hidden border border-[rgba(82,183,136,0.40)] shrink-0 shadow-sm bg-[rgba(45,106,79,0.10)] flex items-center justify-center">
                  <Video className="w-6 h-6 text-ca-green-primary" />
                  <button onClick={() => setVideo(null)} className="absolute top-1 right-1 w-5 h-5 bg-[rgba(27,46,31,0.70)] backdrop-blur-[4px] rounded-full flex items-center justify-center text-white shadow-sm cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {photos.length < 5 && (
                <button onClick={() => photoInputRef.current?.click()} className="w-[68px] h-[68px] rounded-[14px] border-2 border-dashed border-[rgba(232,224,208,0.60)] flex flex-col items-center justify-center gap-0.5 text-ca-text-muted bg-[rgba(255,255,255,0.20)] cursor-pointer hover:bg-[rgba(255,255,255,0.40)] transition-all">
                  <Camera className="w-5 h-5" />
                  <span className="text-[9px] font-bold">{5 - photos.length}</span>
                </button>
              )}
              {!video && (
                <button onClick={() => videoInputRef.current?.click()} className="w-[68px] h-[68px] rounded-[14px] border-2 border-dashed border-[rgba(232,224,208,0.60)] flex flex-col items-center justify-center gap-0.5 text-ca-text-muted bg-[rgba(255,255,255,0.20)] cursor-pointer hover:bg-[rgba(255,255,255,0.40)] transition-all">
                  <Video className="w-5 h-5" />
                  <span className="text-[9px] font-bold">Vidéo</span>
                </button>
              )}
            </div>
            <input ref={photoInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoCapture} />
            <input ref={videoInputRef} type="file" accept="video/*" capture="environment" className="hidden" onChange={handleVideoCapture} />
          </div>

          {/* Address */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase text-ca-text-secondary tracking-wider flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Lieu d'intervention
            </label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
              className={inputBase} />
            <button onClick={() => setShowMapPicker(true)} className="flex items-center gap-1 text-[11px] text-ca-green-light font-medium cursor-pointer hover:underline">
              <MapPin className="w-3 h-3" /> Choisir sur la carte
            </button>
          </div>
        </main>
      )}

      {/* ── Step 3: Material & Parts ── */}
      {step === 3 && (
        <main className="px-5 flex-grow flex flex-col gap-5">
          <div>
            <h2 className="text-[22px] font-extrabold text-ca-text-primary tracking-tight">Matériaux & Pièces</h2>
            <p className="text-ca-text-secondary text-[13px] mt-1">Avez-vous déjà les matériaux nécessaires ?</p>
          </div>

          {/* Question */}
          <div className="flex flex-col gap-2.5">
            <label className="text-[13px] font-bold text-ca-text-primary">Avez-vous les matériaux / pièces ?</label>
            <div className="grid grid-cols-3 gap-2.5">
              {(["yes", "no", "unsure"] as const).map((opt) => (
                <button key={opt} onClick={() => { setHasMaterials(opt); setWhoBuys(null); }}
                  className={`p-4 rounded-[16px] text-center transition-all active:scale-95 cursor-pointer border ${
                    hasMaterials === opt
                      ? "bg-[rgba(45,106,79,0.85)] text-white border-[rgba(82,183,136,0.40)]"
                      : "bg-[rgba(255,255,255,0.60)] backdrop-blur-[8px] text-ca-text-primary border-[rgba(255,255,255,0.35)] hover:shadow-[0_4px_16px_rgba(45,106,79,0.06)]"
                  }`}>
                  <span className="text-2xl block mb-1">{opt === "yes" ? "✅" : opt === "no" ? "❌" : "🤷"}</span>
                  <span className="text-[12px] font-bold">{opt === "yes" ? "Oui" : opt === "no" ? "Non" : "Pas sûr"}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Conditional: Who Buys? */}
          {(hasMaterials === "no" || hasMaterials === "unsure") && (
            <div className="flex flex-col gap-2.5 animate-fade-in">
              <label className="text-[13px] font-bold text-ca-text-primary">Qui achète les matériaux ?</label>
              <div className="grid grid-cols-2 gap-2.5">
                {(["client", "pro"] as const).map((opt) => (
                  <button key={opt} onClick={() => setWhoBuys(opt)}
                    className={`p-4 rounded-[16px] text-center transition-all active:scale-95 cursor-pointer border ${
                      whoBuys === opt
                        ? "bg-[rgba(45,106,79,0.85)] text-white border-[rgba(82,183,136,0.40)]"
                        : "bg-[rgba(255,255,255,0.60)] backdrop-blur-[8px] text-ca-text-primary border-[rgba(255,255,255,0.35)] hover:shadow-[0_4px_16px_rgba(45,106,79,0.06)]"
                    }`}>
                    <span className="text-2xl block mb-1">{opt === "client" ? "🛒" : "👨‍🔧"}</span>
                    <span className="text-[12px] font-bold">{opt === "client" ? "Le client" : "Le professionnel"}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Info box */}
          <div className="bg-[rgba(69,123,157,0.08)] border border-[rgba(69,123,157,0.20)] rounded-[16px] p-4 flex gap-3 items-start backdrop-blur-[4px]">
            <Info className="w-5 h-5 shrink-0 text-ca-info mt-0.5" />
            <div>
              <p className="text-[12px] font-bold text-ca-text-primary">Reste à votre charge</p>
              <p className="text-[11px] text-ca-text-muted mt-0.5">Les matériaux et pièces ne sont pas inclus dans le devis de main-d'œuvre. Vous pouvez choisir de les fournir vous-même ou de les faire acheter par le professionnel.</p>
            </div>
          </div>
        </main>
      )}

      {/* ── Step 4: Budget + Transport + Summary + Terms ── */}
      {step === 4 && (
        <main className="px-5 flex-grow flex flex-col gap-5">
          <div>
            <h2 className="text-[22px] font-extrabold text-ca-text-primary tracking-tight">Budget & Récapitulatif</h2>
            <p className="text-ca-text-secondary text-[13px] mt-1">Confirmez votre demande avant envoi.</p>
          </div>

          {/* Budget */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase text-ca-text-secondary tracking-wider">Main-d'œuvre (FCFA)</label>
              <div className="relative">
                <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ca-text-muted" />
                <input type="number" value={laborBudget} onChange={(e) => setLaborBudget(e.target.value)} placeholder="Budget"
                  className={`${inputBase} pl-9`} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase text-ca-text-secondary tracking-wider flex items-center gap-1">
                <Truck className="w-3 h-3" /> Déplacement (FCFA)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ca-text-muted" />
                <input type="number" value={transportFees} onChange={(e) => setTransportFees(e.target.value)} placeholder="Frais"
                  className={`${inputBase} pl-9`} />
              </div>
            </div>
          </div>

          {/* Summary Card */}
          <div className="bg-[rgba(255,255,255,0.60)] backdrop-blur-[12px] rounded-[20px] p-5 border border-[rgba(255,255,255,0.35)] space-y-3.5 shadow-[0_4px_20px_rgba(45,106,79,0.06)]">
            <h3 className="text-[13px] font-bold text-ca-text-primary flex items-center gap-2">
              <Check className="w-4 h-4 text-ca-green-primary" /> Récapitulatif
            </h3>

            <div className="flex items-center justify-between text-[12px]">
              <span className="text-ca-text-muted">Catégorie</span>
              <span className="font-bold text-ca-text-primary">{CATEGORIES.find((c) => c.id === category)?.emoji} {CATEGORIES.find((c) => c.id === category)?.label}</span>
            </div>
            <hr className="border-[rgba(232,224,208,0.30)]" />
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-ca-text-muted">Type de service</span>
              <span className="font-bold text-ca-text-primary">{subCategory || "—"}</span>
            </div>
            <hr className="border-[rgba(232,224,208,0.30)]" />
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-ca-text-muted">Urgence</span>
              <span className="font-bold text-ca-text-primary">{URGENCY_OPTIONS.find((u) => u.value === urgency)?.icon} {URGENCY_OPTIONS.find((u) => u.value === urgency)?.label}</span>
            </div>
            <hr className="border-[rgba(232,224,208,0.30)]" />
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-ca-text-muted">Lieu</span>
              <span className="font-bold text-ca-text-primary truncate max-w-[180px]">{address}</span>
            </div>
            <hr className="border-[rgba(232,224,208,0.30)]" />
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-ca-text-muted">Matériaux</span>
              <span className="font-bold text-ca-text-primary">{hasMaterials === "yes" ? "✅ Je fournis" : hasMaterials === "no" ? "❌ Pas fournis" : "🤷 Pas sûr"}</span>
            </div>
            {whoBuys && (
              <>
                <hr className="border-[rgba(232,224,208,0.30)]" />
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-ca-text-muted">Qui achète</span>
                  <span className="font-bold text-ca-text-primary">{whoBuys === "client" ? "🛒 Le client" : "👨‍🔧 Le pro"}</span>
                </div>
              </>
            )}
            <hr className="border-[rgba(232,224,208,0.30)]" />
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-ca-text-muted">Budget main-d'œuvre</span>
              <span className="font-bold text-ca-text-primary">{laborBudget ? `${parseInt(laborBudget).toLocaleString("fr-FR")} F` : "—"}</span>
            </div>
            <hr className="border-[rgba(232,224,208,0.30)]" />
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-ca-text-muted">Frais déplacement</span>
              <span className="font-bold text-ca-text-primary">{transportFees ? `${parseInt(transportFees).toLocaleString("fr-FR")} F` : "—"}</span>
            </div>
            {photos.length > 0 && (
              <>
                <hr className="border-[rgba(232,224,208,0.30)]" />
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-ca-text-muted">Photos jointes</span>
                  <span className="font-bold text-ca-text-primary">{photos.length} photo{photos.length > 1 ? "s" : ""}</span>
                </div>
              </>
            )}
            {video && (
              <>
                <hr className="border-[rgba(232,224,208,0.30)]" />
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-ca-text-muted">Vidéo jointe</span>
                  <span className="font-bold text-ca-text-primary">1 vidéo</span>
                </div>
              </>
            )}
          </div>

          {/* Terms checkbox */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-0.5 w-5 h-5 rounded-[6px] border-2 border-[rgba(45,106,79,0.30)] accent-ca-green-primary cursor-pointer shrink-0" />
            <span className="text-[12px] font-medium text-ca-text-primary leading-relaxed">
              J'accepte les <span className="text-ca-green-primary font-bold underline cursor-pointer hover:no-underline">Conditions Générales d'Utilisation</span> et la <span className="text-ca-green-primary font-bold underline cursor-pointer hover:no-underline">Politique de Confidentialité</span> de Ça Match.
            </span>
          </label>
        </main>
      )}

      {/* ── Footer Buttons ── */}
      <div className="px-5 pt-6 pb-8 mt-auto">
        <div className="flex flex-col gap-2.5">
          {step < 4 ? (
            <button onClick={goNext} disabled={!canNext()}
              className={`w-full py-5 rounded-[14px] flex items-center justify-center gap-2 font-bold text-[15px] transition-all active:scale-[0.97] duration-150 cursor-pointer ${
                canNext()
                  ? "bg-[rgba(45,106,79,0.85)] backdrop-blur-[8px] border border-[rgba(82,183,136,0.40)] text-white shadow-[0_8px_24px_rgba(45,106,79,0.20)] hover:bg-[rgba(45,106,79,0.95)]"
                  : "bg-[rgba(232,224,208,0.50)] text-ca-text-muted cursor-not-allowed shadow-none"
              }`}>
              <span>Continuer</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button onClick={handleFinalSubmit} disabled={!canNext()}
              className={`w-full py-5 rounded-[14px] flex items-center justify-center gap-2 font-bold text-[15px] transition-all active:scale-[0.97] duration-150 cursor-pointer ${
                canNext()
                  ? "bg-[rgba(45,106,79,0.85)] backdrop-blur-[8px] border border-[rgba(82,183,136,0.40)] text-white shadow-[0_8px_24px_rgba(45,106,79,0.20)] hover:bg-[rgba(45,106,79,0.95)]"
                  : "bg-[rgba(232,224,208,0.50)] text-ca-text-muted cursor-not-allowed shadow-none"
              }`}>
              <Sparkles className="w-5 h-5" />
              <span>Lancer la recherche de Pro</span>
            </button>
          )}

          {onSubmit && step === 4 && canNext() && (
            <button onClick={() => {
              const urgencyMap: Record<string, "immediate" | "today" | "this_week" | "flexible"> = {
                emergency: "immediate", high: "today", medium: "this_week", low: "flexible",
              };
              onSubmit({
                title: title || description.slice(0, 50),
                description,
                photos,
                category: category || "ac",
                address,
                budgetXOF: parseInt(laborBudget) || 0,
                urgency: urgencyMap[urgency || "medium"],
              });
            }}
              className="w-full py-4 bg-[rgba(255,255,255,0.60)] backdrop-blur-[8px] border border-[rgba(255,255,255,0.35)] text-ca-text-primary font-bold text-[13px] rounded-[14px] hover:bg-[rgba(255,255,255,0.75)] transition-all cursor-pointer active:scale-[0.97]">
              Publier directement
            </button>
          )}
        </div>
      </div>

      {/* ── Map Picker Modal ── */}
      {showMapPicker && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={() => setShowMapPicker(false)}>
          <div className="w-full max-w-md bg-[rgba(255,255,255,0.90)] backdrop-blur-[24px] rounded-t-[24px] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 flex items-center justify-between border-b border-[rgba(232,224,208,0.30)]">
              <h3 className="text-[14px] font-bold text-ca-text-primary">Choisir un lieu</h3>
              <button onClick={() => setShowMapPicker(false)} className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.60)] backdrop-blur-[4px] flex items-center justify-center cursor-pointer">
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
            <MapView height="h-72" interactive onMapClick={(lat, lng) => {
              setAddress(`Position: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
              setShowMapPicker(false);
            }} />
            <div className="p-4 text-center">
              <p className="text-[12px] text-ca-text-muted">Touchez un endroit sur la carte pour le sélectionner</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
