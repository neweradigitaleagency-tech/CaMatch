import React, { useState, useEffect } from "react";
import { ArrowLeft, Sparkles, Star, Verified, Navigation, CheckCircle, ChevronRight, UserIcon } from "lucide-react";
import { ProfessionalDetails } from "../types";

interface ProSelectionScreenProps {
  proList: ProfessionalDetails[];
  category: "electricity" | "plumbing" | "ac" | "carpenter";
  onSelectPro: (pro: ProfessionalDetails) => void;
  onViewProfile: (pro: ProfessionalDetails) => void;
  onBack: () => void;
}

export default function ProSelectionScreen({ proList, category, onSelectPro, onViewProfile, onBack }: ProSelectionScreenProps) {
  const [isMatching, setIsMatching] = useState(true);
  const [matchLogIndex, setMatchLogIndex] = useState(0);

  const matchLogs = [
    "Recherche des professionnels à proximité...",
    "Vérification des disponibilités en temps réel...",
    "Calcul des scores de compatibilité (7 critères)...",
    "Sélection des meilleurs experts validée !",
  ];

  useEffect(() => {
    const logInterval = setInterval(() => {
      setMatchLogIndex((prev) => (prev < matchLogs.length - 1 ? prev + 1 : prev));
    }, 550);
    const matchingTimeout = setTimeout(() => {
      setIsMatching(false);
    }, 2200);
    return () => {
      clearInterval(logInterval);
      clearTimeout(matchingTimeout);
    };
  }, []);

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "electricity": return "Électricien";
      case "plumbing": return "Plombier";
      case "ac": return "Climatisation";
      case "carpenter": return "Menuisier";
      default: return cat;
    }
  };

  const sortedPros = [...proList].sort((a, b) => b.rating - a.rating || b.completedInterventions - a.completedInterventions);
  const bestPro = sortedPros[0];

  const handleAiAutoSelect = () => {
    if (bestPro) onSelectPro(bestPro);
  };

  return (
    <div className="flex flex-col w-full pb-36 min-h-[85vh] bg-cm-bg relative">
      <header className="w-full flex justify-between items-center px-6 py-4 bg-cm-elevated/95 sticky top-0 z-10 border-b border-cm-border">
        <button onClick={onBack}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-cm-elevated text-cm-text hover:bg-cm-accent-soft transition-colors border border-cm-border cursor-pointer active:scale-95">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display text-sm font-bold text-cm-text uppercase tracking-widest">
          Sélection du Pro
        </h1>
        <div className="w-10 h-10"></div>
      </header>

      {isMatching ? (
        <main className="px-6 flex-grow flex flex-col items-center justify-center min-h-[60vh]">
          <div className="relative w-64 h-64 bg-cm-elevated rounded-full flex items-center justify-center overflow-hidden border border-cm-border mb-8">
            <div className="absolute inset-2 border border-cm-accent/20 rounded-full map-pulse" style={{ animationDelay: "0s" }} />
            <div className="absolute inset-10 border border-cm-accent/20 rounded-full map-pulse" style={{ animationDelay: "1s" }} />
            <div className="absolute inset-20 border border-cm-accent/20 rounded-full map-pulse" style={{ animationDelay: "2s" }} />
            <div className="absolute top-[50%] left-[50%] w-1/2 h-1/2 bg-gradient-to-r from-cm-accent/30 to-transparent radar-sweep border-l border-cm-accent/40 origin-top-left -mt-[0.5px] -ml-[0.5px]" />
            <div className="z-10 bg-cm-elevated p-6 rounded-full shadow-cm-md flex items-center justify-center animate-pulse border-2 border-cm-text">
              <Navigation className="w-10 h-10 text-cm-text fill-cm-accent animate-bounce" />
            </div>
          </div>
          <div className="text-center space-y-3 max-w-xs">
            <h3 className="font-display text-base font-bold text-cm-text uppercase tracking-wider">Recherche en cours...</h3>
            <div className="flex items-center gap-2 justify-center py-2 px-4 bg-cm-elevated rounded-full border border-cm-border shadow-cm-sm text-xs font-bold text-cm-text">
              <div className="w-1.5 h-1.5 rounded-full bg-cm-accent animate-ping" />
              <span>{matchLogs[matchLogIndex]}</span>
            </div>
          </div>
        </main>
      ) : (
        <main className="px-6 pt-6 flex-grow flex flex-col gap-5">
          <div>
            <h2 className="font-display text-xl font-bold text-cm-text tracking-tight">
              Pros disponibles pour "{getCategoryLabel(category)}"
            </h2>
            <p className="text-cm-text-soft text-xs mt-1">
              {proList.length} expert{proList.length > 1 ? "s" : ""} trouvé{proList.length > 1 ? "s" : ""} à Cocody et alentours.
            </p>
          </div>

          {bestPro && (
            <div onClick={handleAiAutoSelect}
              className="bg-cm-text text-white rounded-3xl p-5 shadow-cm-md border-2 border-cm-accent relative overflow-hidden cursor-pointer hover:scale-[1.01] transition-transform duration-200">
              <div className="absolute -right-6 -bottom-6 text-cm-accent opacity-10">
                <Sparkles className="w-36 h-36" />
              </div>
              <div className="relative z-10 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <span className="bg-cm-accent text-white text-[11px] font-display font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Recommandé par l'IA
                  </span>
                  <div className="flex items-center gap-1 text-xs font-bold text-cm-accent">
                    <span>Note de match : 98%</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-cm-accent shrink-0">
                    <img src={bestPro.avatarUrl} alt={bestPro.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm text-white flex items-center gap-1.5">
                      {bestPro.name}
                      {bestPro.isVerified && <Verified className="w-4 h-4 text-cm-accent" />}
                    </h3>
                    <p className="text-white/80 text-xs mt-0.5">{bestPro.title} • {bestPro.locationNeighborhood}</p>
                  </div>
                </div>
                <p className="text-white/70 text-xs italic leading-relaxed">
                  "Sélectionné selon sa note de {bestPro.rating / 10}★, sa proximité géographique, et sa ponctualité sur {bestPro.completedInterventions} chantiers."
                </p>
                <button onClick={(e) => { e.stopPropagation(); handleAiAutoSelect(); }}
                  className="w-full py-3 bg-cm-accent text-white font-display font-bold text-xs rounded-xl shadow-cm-sm flex items-center justify-center gap-1 cursor-pointer active:scale-95 hover:opacity-90 transition-all">
                  <span>Laisser l'IA Choisir & Continuer</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-display font-bold uppercase tracking-wider text-cm-text-soft">
              Ou sélectionnez un pro manuellement :
            </h3>
            {sortedPros.map((pro) => (
              <div key={pro.id} onClick={() => onSelectPro(pro)}
                className="bg-cm-elevated rounded-3xl p-4 flex items-center gap-3.5 border border-cm-border hover:border-cm-text/20 transition-all cursor-pointer active:scale-[0.98]">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-cm-border shrink-0">
                  <img src={pro.avatarUrl} alt={pro.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-1">
                    <h4 className="font-display font-bold text-sm text-cm-text truncate">{pro.name}</h4>
                    {pro.isVerified && <Verified className="w-3.5 h-3.5 text-cm-accent shrink-0" />}
                  </div>
                  <p className="text-[12px] text-cm-text-soft truncate mt-0.5">{pro.title}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-[11px] text-cm-text-soft font-bold">
                    <span className="flex items-center gap-0.5">
                      <Star className="w-3.5 h-3.5 fill-cm-accent stroke-cm-accent" />
                      {(pro.rating / 10).toFixed(1)}
                    </span>
                    <span>•</span>
                    <span>{pro.completedInterventions} interventions</span>
                  </div>
                </div>
                <div className="flex flex-col items-end shrink-0 border-l border-cm-border pl-3 gap-1">
                  <span className="text-[11px] text-cm-text-soft uppercase font-bold tracking-wider">Tarif</span>
                  <span className="text-sm font-display font-bold text-cm-text font-mono">{pro.hourlyRateXOF.toLocaleString("fr-FR")} F/h</span>
                  <button onClick={(e) => { e.stopPropagation(); onViewProfile(pro); }}
                    className="text-[11px] font-display font-bold text-cm-accent bg-cm-accent-soft px-2 py-1 rounded-full hover:bg-cm-accent/20 transition-colors flex items-center gap-0.5 cursor-pointer">
                    <UserIcon className="w-2.5 h-2.5" /> Profil
                  </button>
                  <span className="text-[10px] text-cm-accent font-bold bg-cm-accent-soft px-1.5 py-0.5 rounded">Dispo</span>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}
    </div>
  );
}
