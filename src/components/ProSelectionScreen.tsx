/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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
    // Stagger matching logs
    const logInterval = setInterval(() => {
      setMatchLogIndex((prev) => (prev < matchLogs.length - 1 ? prev + 1 : prev));
    }, 550);

    // End matching simulation after 2.2s
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

  // Sort pros by rating/relevance for AI recommendation
  const sortedPros = [...proList].sort((a, b) => b.rating - a.rating || b.completedInterventions - a.completedInterventions);
  const bestPro = sortedPros[0];

  const handleAiAutoSelect = () => {
    if (bestPro) {
      onSelectPro(bestPro);
    }
  };

  return (
    <div className="flex flex-col w-full pb-36 min-h-[85vh] bg-brand-cream relative">
      {/* Header */}
      <header className="w-full flex justify-between items-center px-6 py-4 bg-brand-cream/95 sticky top-0 z-10 border-b border-pale-mint/15">
        <button
          onClick={onBack}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-white text-brand-forest hover:bg-pale-mint transition-colors shadow-sm cursor-pointer active:scale-95 duration-150"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-sans text-sm font-extrabold text-brand-forest uppercase tracking-widest">
          Sélection du Pro
        </h1>
        <div className="w-10 h-10"></div>
      </header>

      {isMatching ? (
        /* Matching Simulation State (Pulsing Radar) */
        <main className="px-6 flex-grow flex flex-col items-center justify-center min-h-[60vh]">
          <div className="relative w-64 h-64 bg-black/5 rounded-full flex items-center justify-center overflow-hidden border border-black/5 mb-8">
            <div className="absolute inset-2 border border-brand-lime/20 rounded-full map-pulse" style={{ animationDelay: "0s" }} />
            <div className="absolute inset-10 border border-brand-lime/20 rounded-full map-pulse" style={{ animationDelay: "1s" }} />
            <div className="absolute inset-20 border border-brand-lime/20 rounded-full map-pulse" style={{ animationDelay: "2s" }} />
            
            {/* Spinning sweeps */}
            <div className="absolute top-[50%] left-[50%] w-1/2 h-1/2 bg-gradient-to-r from-brand-lime/30 to-transparent radar-sweep border-l border-brand-lime/40 origin-top-left -mt-[0.5px] -ml-[0.5px]" />
            
            <div className="z-10 bg-white p-6 rounded-full shadow-premium flex items-center justify-center animate-pulse border-2 border-brand-forest">
              <Navigation className="w-10 h-10 text-brand-forest fill-brand-lime animate-bounce" />
            </div>
          </div>

          <div className="text-center space-y-3 max-w-xs">
            <h3 className="font-sans text-base font-extrabold text-brand-forest uppercase tracking-wider">Recherche en cours...</h3>
            
            {/* Matching Log Ticks */}
            <div className="flex items-center gap-2 justify-center py-2 px-4 bg-white rounded-full border border-pale-mint/15 shadow-sm text-xs font-bold text-brand-forest">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-lime animate-ping" />
              <span>{matchLogs[matchLogIndex]}</span>
            </div>
          </div>
        </main>
      ) : (
        /* Professionals Matching List */
        <main className="px-6 pt-6 flex-grow flex flex-col gap-5">
          <div>
            <h2 className="font-sans text-xl font-extrabold text-brand-forest tracking-tight">
              Pros disponibles pour "{getCategoryLabel(category)}"
            </h2>
            <p className="text-secondary text-xs mt-1">
              {proList.length} expert{proList.length > 1 ? "s" : ""} trouvé{proList.length > 1 ? "s" : ""} à Cocody et alentours.
            </p>
          </div>

          {/* AI Auto Select Premium Option Card */}
          {bestPro && (
            <div
              onClick={handleAiAutoSelect}
              className="bg-brand-forest text-white rounded-3xl p-5 shadow-premium border-2 border-brand-lime relative overflow-hidden cursor-pointer hover:scale-[1.01] transition-transform duration-200"
            >
              <div className="absolute -right-6 -bottom-6 text-brand-lime opacity-10">
                <Sparkles className="w-36 h-36" />
              </div>

              <div className="relative z-10 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <span className="bg-brand-lime text-brand-forest text-caption font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 fill-brand-forest" /> Recommandé par l'IA
                  </span>
                  <div className="flex items-center gap-1 text-xs font-bold text-brand-lime">
                    <span>Note de match : 98%</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-brand-lime shrink-0">
                    <img src={bestPro.avatarUrl} alt={bestPro.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                      {bestPro.name}
                      {bestPro.isVerified && <Verified className="w-4 h-4 text-brand-lime fill-brand-forest" />}
                    </h3>
                    <p className="text-white/80 text-xs mt-0.5">{bestPro.title} • {bestPro.locationNeighborhood}</p>
                  </div>
                </div>

                <p className="text-white/70 text-xs italic leading-relaxed">
                  "Sélectionné selon sa note de {bestPro.rating / 10}★, sa proximité géographique, et sa ponctualité sur {bestPro.completedInterventions} chantiers."
                </p>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAiAutoSelect();
                  }}
                  className="w-full py-3 bg-brand-lime text-brand-forest font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Laisser l'IA Choisir &amp; Continuer</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Individual pros lists */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-secondary/70">
              Ou sélectionnez un pro manuellement :
            </h3>

            {sortedPros.map((pro) => (
              <div
                key={pro.id}
                onClick={() => onSelectPro(pro)}
                className="bg-white rounded-3xl p-4 flex items-center gap-3.5 border border-pale-mint/15 shadow-premium hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-pale-mint shrink-0">
                  <img src={pro.avatarUrl} alt={pro.name} className="w-full h-full object-cover" />
                </div>

                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-1">
                    <h4 className="font-bold text-sm text-brand-forest truncate">{pro.name}</h4>
                    {pro.isVerified && <Verified className="w-3.5 h-3.5 text-brand-forest fill-brand-lime shrink-0" />}
                  </div>
                  <p className="text-body-sm text-secondary truncate mt-0.5">{pro.title}</p>
                  
                  {/* Stats line */}
                  <div className="flex items-center gap-3 mt-1.5 text-caption text-secondary font-bold">
                    <span className="flex items-center gap-0.5">
                      <Star className="w-3.5 h-3.5 fill-yellow-500 stroke-yellow-500" />
                      {(pro.rating / 10).toFixed(1)}
                    </span>
                    <span>•</span>
                    <span>{pro.completedInterventions} interventions</span>
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0 border-l border-pale-mint/30 pl-3 gap-1">
                  <span className="text-caption text-secondary uppercase font-bold tracking-wider">Tarif</span>
                  <span className="text-sm font-extrabold text-brand-forest">{pro.hourlyRateXOF.toLocaleString("fr-FR")} F/h</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); onViewProfile(pro); }}
                    className="text-caption font-extrabold text-brand-forest bg-pale-mint px-2 py-1 rounded-full hover:bg-brand-lime/30 transition-colors flex items-center gap-0.5"
                  >
                    <UserIcon className="w-2.5 h-2.5" /> Profil
                  </button>
                  <span className="text-caption text-emerald-600 font-extrabold bg-emerald-50 px-1.5 py-0.5 rounded">Dispo</span>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}
    </div>
  );
}
