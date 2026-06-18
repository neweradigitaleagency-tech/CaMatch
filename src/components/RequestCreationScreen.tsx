/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Mic, MicOff, Image as ImageIcon, Sparkles, MapPin, Check, AlertTriangle, Trash2, Play, ChevronRight } from "lucide-react";

export interface AiRequestDetails {
  category: "electricity" | "plumbing" | "ac" | "cleaning";
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
}

const VOICE_SCENARIOS = [
  {
    label: "❄️ Clim en panne (AC)",
    text: "Bonjour, mon climatiseur split dans ma chambre fait un bruit bizarre et ne souffle que de l'air chaud. Il coule aussi un peu d'eau sur le mur. Pouvez-vous envoyer quelqu'un rapidement ?",
  },
  {
    label: "🚿 Fuite sous l'évier (Plombier)",
    text: "Allô, j'ai une grosse fuite d'eau sous l'évier de la cuisine. Le tuyau en plastique semble fissuré et l'eau coule partout. C'est urgent, s'il vous plaît.",
  },
  {
    label: "⚡ Prise grillée (Électricité)",
    text: "Bonjour, j'ai branché mon fer à repasser et ça a fait un grand flash. Maintenant la prise est toute noire et le courant a sauté dans tout le salon.",
  },
  {
    label: "🧹 Ménage de printemps (Nettoyage)",
    text: "Bonjour, je cherche un professionnel pour faire un nettoyage complet et en profondeur de mon appartement de 3 pièces ce samedi matin. Dépoussiérage et lavage des sols.",
  },
];

export default function RequestCreationScreen({ onBack, onAnalyze, onProceedToMatching }: RequestCreationScreenProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Input, 2: AI Loading, 3: Confirmation
  const [description, setDescription] = useState("");
  
  // Voice recording simulation state
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [selectedScenario, setSelectedScenario] = useState<number | null>(null);
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);

  // Photo uploads simulation state
  const [attachedPhotos, setAttachedPhotos] = useState<string[]>([]);

  // AI loading log states
  const [loadingLogIndex, setLoadingLogIndex] = useState(0);
  const [aiError, setAiError] = useState<string | null>(null);
  const [extractedDetails, setExtractedDetails] = useState<AiRequestDetails | null>(null);
  const [address, setAddress] = useState("Cocody Riviera 3, Abidjan, Côte d'Ivoire");

  const loadingLogs = [
    "Transcription du message vocal (Whisper CI)...",
    "Analyse sémantique du besoin par l'IA...",
    "Identification de l'intention & de la catégorie...",
    "Calcul de la fourchette tarifaire dynamique...",
    "Estimation de l'urgence & finalisation...",
  ];

  // Record duration count effect
  useEffect(() => {
    if (isRecording) {
      recordingTimer.current = setInterval(() => {
        setRecordTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
      setRecordTime(0);
    }
    return () => {
      if (recordingTimer.current) clearInterval(recordingTimer.current);
    };
  }, [isRecording]);

  // Stagger logs in Step 2
  useEffect(() => {
    if (step === 2) {
      setLoadingLogIndex(0);
      const interval = setInterval(() => {
        setLoadingLogIndex((prev) => {
          if (prev < loadingLogs.length - 1) {
            return prev + 1;
          } else {
            clearInterval(interval);
            return prev;
          }
        });
      }, 1200);
      return () => clearInterval(interval);
    }
  }, [step]);

  const startVoiceRecording = () => {
    setIsRecording(true);
    setSelectedScenario(null);
  };

  const stopVoiceRecording = () => {
    setIsRecording(false);
    // Auto populate description if none exists
    if (!description) {
      setDescription("Enregistrement vocal retranscrit : Fuite d'eau détectée dans les sanitaires principaux nécessitant un plombier.");
    }
  };

  const selectScenario = (index: number) => {
    setSelectedScenario(index);
    setDescription(VOICE_SCENARIOS[index].text);
  };

  const triggerMockPhoto = () => {
    const mockPhotos = [
      "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=400&auto=format&fit=crop&q=60", // Clim maintenance
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&auto=format&fit=crop&q=60", // Plumber sink
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&auto=format&fit=crop&q=60", // Electrician wires
    ];
    const newPhoto = mockPhotos[attachedPhotos.length % mockPhotos.length];
    setAttachedPhotos([...attachedPhotos, newPhoto]);
  };

  const removePhoto = (idx: number) => {
    setAttachedPhotos(attachedPhotos.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!description.trim()) return;

    setStep(2);
    setAiError(null);

    try {
      const result = await onAnalyze(description);
      setExtractedDetails(result);
      setStep(3);
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "Erreur de connexion à l'IA Gemini. Veuillez réessayer.");
      setStep(1);
    }
  };

  const handleOverrideCategory = (cat: "electricity" | "plumbing" | "ac" | "cleaning") => {
    if (extractedDetails) {
      setExtractedDetails({
        ...extractedDetails,
        category: cat,
      });
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="flex flex-col w-full pb-36 min-h-[85vh] bg-brand-cream relative">
      {/* Top Header */}
      <header className="w-full flex justify-between items-center px-6 py-4 sticky top-0 z-10 bg-brand-cream/95 backdrop-blur-md border-b border-pale-mint/15">
        <button
          onClick={step === 3 ? () => setStep(1) : onBack}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-brand-forest hover:bg-pale-mint transition-colors shadow-sm cursor-pointer active:scale-95 duration-150"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-sans text-sm font-extrabold text-brand-forest uppercase tracking-widest flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-brand-lime fill-brand-lime" /> Création par IA
        </h1>
        <div className="w-10 h-10"></div>
      </header>

      {/* Step 1: Input Details */}
      {step === 1 && (
        <main className="px-6 pt-6 flex-grow flex flex-col gap-6">
          <div>
            <h2 className="font-sans text-2xl font-extrabold text-brand-forest tracking-tight">
              Décrivez votre problème
            </h2>
            <p className="text-on-surface-variant text-xs mt-1">
              Écrivez ou enregistrez un message vocal en Français ou en Nouchi. Notre IA s'occupe du reste.
            </p>
          </div>

          {/* Text input area */}
          <div className="flex flex-col gap-2 bg-white rounded-3xl p-5 shadow-premium border border-pale-mint/10">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Mon climatiseur split fait de l'air chaud et de l'eau coule sur le mur..."
              className="w-full h-32 text-sm bg-transparent border-none outline-none resize-none text-brand-forest placeholder-secondary/50 font-medium"
            />
            
            {/* Image attachments list */}
            {attachedPhotos.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2 pt-2 border-t border-pale-mint/10">
                {attachedPhotos.map((photo, index) => (
                  <div key={index} className="relative w-16 h-16 rounded-2xl overflow-hidden border border-pale-mint shrink-0 shadow-sm">
                    <img src={photo} className="w-full h-full object-cover" alt="attachment" />
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 w-5 h-5 bg-brand-forest/80 rounded-full flex items-center justify-center text-brand-lime shadow-sm hover:bg-brand-forest"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Input helpers bar */}
            <div className="flex items-center justify-between border-t border-pale-mint/10 pt-4 mt-2">
              <button
                onClick={triggerMockPhoto}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-full hover:bg-pale-mint transition-colors text-xs font-bold text-brand-forest cursor-pointer"
              >
                <ImageIcon className="w-4 h-4" />
                <span>Ajouter photo ({attachedPhotos.length}/5)</span>
              </button>

              {isRecording ? (
                <button
                  onClick={stopVoiceRecording}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-red-500 text-white animate-pulse text-xs font-bold cursor-pointer"
                >
                  <MicOff className="w-4 h-4" />
                  <span>{formatTime(recordTime)} • Arrêter</span>
                </button>
              ) : (
                <button
                  onClick={startVoiceRecording}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-pale-mint text-brand-forest hover:bg-pale-mint/70 text-xs font-bold cursor-pointer"
                >
                  <Mic className="w-4 h-4" />
                  <span>Vocal</span>
                </button>
              )}
            </div>
          </div>

          {/* Voice recorder simulation panel */}
          {isRecording && (
            <div className="bg-brand-forest text-white rounded-3xl p-5 shadow-premium flex flex-col items-center justify-center gap-4 border border-brand-lime/10">
              <div className="flex items-center gap-1 justify-center h-8">
                {/* Simulated sound waves animating */}
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-brand-lime rounded-full map-pulse"
                    style={{
                      height: `${10 + Math.random() * 25}px`,
                      animationDelay: `${i * 0.25}s`,
                      animationDuration: "0.8s"
                    }}
                  />
                ))}
              </div>
              <p className="text-xs font-bold text-brand-lime tracking-wider uppercase">
                Enregistrement audio en cours...
              </p>
              <p className="text-[11px] text-white/70 italic text-center">
                "Parlez naturellement. Vous pouvez décrire la panne, l'urgence et la commune d'intervention."
              </p>
            </div>
          )}

          {/* Quick Voice Scenarios suggestions */}
          {!isRecording && (
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-brand-forest/65">
                Ou utilisez un exemple type :
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {VOICE_SCENARIOS.map((sc, index) => (
                  <button
                    key={index}
                    onClick={() => selectScenario(index)}
                    className={`p-4 rounded-2xl flex items-center justify-between text-left transition-all border ${
                      selectedScenario === index
                        ? "bg-pale-mint border-brand-lime shadow-sm"
                        : "bg-white border-pale-mint/20 hover:border-pale-mint/50"
                    } cursor-pointer`}
                  >
                    <div>
                      <p className="text-xs font-bold text-brand-forest">{sc.label}</p>
                      <p className="text-[11px] text-on-surface-variant line-clamp-1 mt-0.5">{sc.text}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 shrink-0 text-secondary ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {aiError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex gap-2.5 items-start">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="text-xs font-medium">{aiError}</p>
            </div>
          )}

          {/* Submit CTA button */}
          <button
            onClick={handleSubmit}
            disabled={!description.trim()}
            className={`w-full py-5 rounded-full flex items-center justify-center gap-2 font-bold text-base shadow-lg transition-all active:scale-[0.98] duration-150 cursor-pointer ${
              description.trim()
                ? "bg-brand-forest text-white hover:bg-brand-lime hover:text-brand-forest"
                : "bg-secondary/20 text-secondary/40 cursor-not-allowed shadow-none"
            }`}
          >
            <Sparkles className="w-5 h-5 text-brand-lime" />
            <span>Analyser mon besoin ⚡</span>
          </button>
        </main>
      )}

      {/* Step 2: AI Loading Screens */}
      {step === 2 && (
        <main className="px-6 pt-12 flex-grow flex flex-col items-center justify-center min-h-[50vh]">
          <div className="relative w-48 h-48 bg-black/5 rounded-full flex items-center justify-center overflow-hidden border border-black/5 mb-8">
            <div className="absolute inset-2 border border-brand-forest/10 rounded-full map-pulse" style={{ animationDelay: "0s" }} />
            <div className="absolute inset-10 border border-brand-forest/10 rounded-full map-pulse" style={{ animationDelay: "1s" }} />
            <div className="absolute top-[50%] left-[50%] w-1/2 h-1/2 bg-gradient-to-r from-brand-lime/30 to-transparent radar-sweep border-l border-brand-lime/40 origin-top-left -mt-[0.5px] -ml-[0.5px]" />
            <div className="z-10 bg-white p-5 rounded-full shadow-premium flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-brand-forest animate-pulse" />
            </div>
          </div>

          <div className="text-center space-y-4 max-w-sm">
            <h3 className="font-sans text-lg font-bold text-brand-forest">Ça Match IA analyse...</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Nous extrayons les détails techniques et tarifaires à partir de votre description.
            </p>

            {/* Dynamic Loading Log display */}
            <div className="bg-white p-4 rounded-2xl border border-pale-mint/15 shadow-sm text-left mt-6 min-h-[84px] flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-brand-lime animate-ping" />
                <span className="text-xs font-bold text-brand-forest">{loadingLogs[loadingLogIndex]}</span>
              </div>
              
              <div className="flex flex-col gap-1 mt-2 text-[10px] text-secondary opacity-60">
                {loadingLogs.slice(0, loadingLogIndex).map((log, index) => (
                  <div key={index} className="flex items-center gap-1.5">
                    <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Step 3: AI Confirmation/Review */}
      {step === 3 && extractedDetails && (
        <main className="px-6 pt-6 flex-grow flex flex-col gap-6">
          <div>
            <h2 className="font-sans text-2xl font-extrabold text-brand-forest tracking-tight">
              Confirmation de l'analyse
            </h2>
            <p className="text-on-surface-variant text-xs mt-1">
              Vérifiez les informations détectées par notre IA avant de rechercher les professionnels.
            </p>
          </div>

          {/* AI Result Card */}
          <div className="bg-white rounded-3xl p-5 shadow-premium border border-pale-mint/15 space-y-5">
            {/* Summary */}
            <div className="bg-pale-mint/20 p-4 rounded-2xl border border-pale-mint/15 text-xs text-brand-forest leading-relaxed">
              <span className="font-bold text-[10px] uppercase text-brand-forest tracking-wider block mb-1">Résumé du besoin :</span>
              "{extractedDetails.summary}"
            </div>

            {/* Category selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold uppercase text-secondary tracking-wider">Catégorie détectée</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "electricity", label: "⚡ Électricité" },
                  { id: "plumbing", label: "🚿 Plomberie" },
                  { id: "ac", label: "❄️ Climatisation" },
                  { id: "cleaning", label: "🧹 Ménage" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleOverrideCategory(cat.id as any)}
                    className={`py-3 px-4 rounded-xl font-bold text-xs border text-center transition-all cursor-pointer ${
                      extractedDetails.category === cat.id
                        ? "bg-brand-forest text-white border-brand-forest shadow-sm"
                        : "bg-white border-pale-mint text-brand-forest hover:bg-pale-mint/30"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Urgency selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold uppercase text-secondary tracking-wider">Urgence</label>
                <div className={`py-3 px-4 rounded-xl font-extrabold text-xs text-center border capitalize ${
                  extractedDetails.urgency === "emergency" ? "bg-red-50 text-red-700 border-red-200" :
                  extractedDetails.urgency === "high" ? "bg-amber-50 text-amber-700 border-amber-200" :
                  extractedDetails.urgency === "medium" ? "bg-blue-50 text-blue-700 border-blue-200" :
                  "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}>
                  {extractedDetails.urgency === "emergency" && "🚨 Critique / SOS"}
                  {extractedDetails.urgency === "high" && "🔥 Élevée"}
                  {extractedDetails.urgency === "medium" && "⚡ Moyenne"}
                  {extractedDetails.urgency === "low" && "🟢 Faible"}
                </div>
              </div>

              {/* Specific detail subCategory */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold uppercase text-secondary tracking-wider">Sous-type</label>
                <div className="py-3 px-4 rounded-xl font-bold text-xs text-center border border-pale-mint text-brand-forest truncate bg-cloud">
                  {extractedDetails.subCategory}
                </div>
              </div>
            </div>

            {/* Price Estimate range display */}
            <div className="border-t border-pale-mint/15 pt-4">
              <label className="text-[10px] font-extrabold uppercase text-secondary tracking-wider block mb-1">Fourchette estimée (IA)</label>
              <div className="flex justify-between items-baseline">
                <div className="flex items-baseline gap-1">
                  <span className="font-sans text-2xl font-extrabold text-brand-forest">
                    {extractedDetails.estimatedPriceMinXOF.toLocaleString("fr-FR")} - {extractedDetails.estimatedPriceMaxXOF.toLocaleString("fr-FR")}
                  </span>
                  <span className="text-sm font-bold text-brand-forest">F CFA</span>
                </div>
                <span className="bg-brand-lime/20 text-brand-forest text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Main d'œuvre
                </span>
              </div>
              <p className="text-[10px] text-secondary mt-1 font-medium">
                * Marge hors pièces de rechange et déplacement (+5 000 F).
              </p>
            </div>

            {/* Address input */}
            <div className="border-t border-pale-mint/15 pt-4 flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold uppercase text-secondary tracking-wider flex items-center gap-1">
                <MapPin className="w-3 h-3 text-brand-forest" /> Lieu de l'intervention
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full h-11 px-4 text-xs font-bold border border-pale-mint rounded-xl text-brand-forest outline-none focus:ring-1 focus:ring-brand-forest"
              />
            </div>
          </div>

          {/* Confirm match button */}
          <button
            onClick={() => onProceedToMatching({ ...extractedDetails, address, description })}
            className="w-full py-5 bg-brand-lime text-brand-forest font-bold text-base rounded-full shadow-lg hover:brightness-105 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] duration-150 group"
          >
            <span>Lancer la recherche de Pro ➔</span>
          </button>
        </main>
      )}
    </div>
  );
}
