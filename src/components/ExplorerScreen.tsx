/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Search, Bold, Verified, Star, Wrench, Bolt, Fan, Brush, Plus, ChevronRight, MapPin } from "lucide-react";
import { ProfessionalDetails } from "../types";

interface ExplorerScreenProps {
  onSelectPro: (pro: ProfessionalDetails) => void;
  recommendedPros: ProfessionalDetails[];
  onInitiateAiRequest: () => void;
}

export default function ExplorerScreen({ onSelectPro, recommendedPros, onInitiateAiRequest }: ExplorerScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { id: "electricity", name: "Électricité", icon: Bolt, count: 24 },
    { id: "plumbing", name: "Plomberie", icon: Wrench, count: 18 },
    { id: "ac", name: "Climatisation", icon: Fan, count: 15 },
    { id: "cleaning", name: "Ménage", icon: Brush, count: 32 },
  ];

  const filteredPros = recommendedPros.filter((pro) =>
    pro.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pro.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pro.locationNeighborhood.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col w-full pb-24">
      {/* Search and Hero Section */}
      <section className="px-4 pt-4 pb-3">
        <div className="mb-4">
          <span className="text-on-surface-variant font-medium text-xs tracking-wider uppercase">Bonjour, Marie</span>
          <h2 className="font-sans text-2xl font-extrabold text-brand-forest mt-0.5 tracking-tight">
            De quel service avez-vous besoin ?
          </h2>
        </div>

        <div className="relative w-full">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-secondary">
            <Search className="w-4 h-4 opacity-70" />
          </div>
          <input
            type="text"
            className="w-full h-11 pl-10 pr-4 bg-pale-mint border-none rounded-xl text-xs font-medium placeholder-secondary/60 focus:ring-2 focus:ring-brand-forest focus:bg-white transition-all outline-none text-brand-forest"
            placeholder="Trouver un pro... (Électricien, AC, Plombier)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </section>

      {/* Categories Compact Grid */}
      <section className="px-4 py-2">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-sans text-base font-bold text-brand-forest">Catégories</h3>
          <span className="text-[10px] text-secondary font-semibold flex items-center gap-0.5 cursor-pointer">
            Voir tout <ChevronRight className="w-3 h-3" />
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {categories.map((cat) => {
            const IconComponent = cat.icon;
            return (
              <div
                key={cat.id}
                onClick={() => setSearchQuery(cat.name)}
                className="bg-white rounded-xl p-2.5 flex flex-col items-center justify-center shadow-sm active:scale-95 transition-transform hover:shadow cursor-pointer border border-pale-mint/30"
              >
                <div className="w-8 h-8 rounded-full bg-pale-mint flex items-center justify-center mb-1.5 text-brand-forest">
                  <IconComponent className="w-4 h-4" />
                </div>
                <span className="font-bold text-[10px] text-brand-forest leading-tight text-center">{cat.name}</span>
                <span className="text-[9px] text-secondary mt-0.5">{cat.count}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pros visibles: 2 premiers en stack vertical, puis scroll horizontal pour le reste */}
      <section className="pt-3 pb-2">
        <div className="px-4 flex items-center justify-between mb-3">
          <h3 className="font-sans text-base font-bold text-brand-forest">Pros Recommandés</h3>
          <span className="text-[10px] text-secondary font-semibold flex items-center gap-0.5 cursor-pointer">
            Tout afficher <ChevronRight className="w-3 h-3" />
          </span>
        </div>

        {filteredPros.length === 0 ? (
          <div className="mx-auto text-center py-6 text-on-surface-variant text-xs px-4">
            Aucun professionnel disponible pour cette recherche.
          </div>
        ) : (
          <>
            {/* 2 pros visibles en stack vertical */}
            {filteredPros.slice(0, 2).map((pro) => (
              <div
                key={pro.id}
                onClick={() => onSelectPro(pro)}
                className="mx-4 mb-2 bg-white rounded-2xl p-3.5 flex items-center gap-3 shadow-sm border border-pale-mint/20 hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-pale-mint/20">
                  <img alt={pro.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" src={pro.avatarUrl} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-sm text-brand-forest truncate">{pro.name}</h4>
                    {pro.isVerified && <Verified className="w-3 h-3 text-brand-lime fill-brand-lime shrink-0" />}
                  </div>
                  <p className="text-[10px] text-on-surface-variant truncate">{pro.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-0.5 text-[9px] font-bold text-amber-600">
                      <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" />{(pro.rating / 10).toFixed(1)}
                    </span>
                    <span className="text-[9px] text-secondary">•</span>
                    <span className="text-[9px] text-secondary">{pro.hourlyRateXOF.toLocaleString("fr-FR")} F/h</span>
                    <span className="text-[9px] text-secondary">•</span>
                    <span className="text-[9px] text-secondary flex items-center gap-0.5">
                      <MapPin className="w-2.5 h-2.5" />{pro.locationNeighborhood.split(",")[0]}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-secondary shrink-0" />
              </div>
            ))}

            {/* Scroll horizontal pour les pros supplémentaires */}
            {filteredPros.length > 2 && (
              <div className="flex overflow-x-auto gap-3 px-4 no-scrollbar pb-2 mt-1">
                {filteredPros.slice(2).map((pro) => (
                  <div
                    key={pro.id}
                    className="min-w-[240px] max-w-[240px] bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col border border-pale-mint/20 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onSelectPro(pro)}
                  >
                    <div className="relative h-28 bg-surface-container-low overflow-hidden">
                      <img alt={pro.name} className="w-full h-full object-cover object-center" referrerPolicy="no-referrer" src={pro.avatarUrl} />
                      <div className="absolute top-2 right-2 bg-white/90 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                        <Star className="w-3 h-3 fill-yellow-500 stroke-yellow-500" />
                        <span className="text-[10px] font-bold text-brand-forest">{(pro.rating / 10).toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="p-3 flex flex-col flex-grow">
                      <div className="flex items-center gap-1 mb-0.5">
                        <h4 className="font-bold text-xs text-brand-forest truncate">{pro.name}</h4>
                        {pro.isVerified && <Verified className="w-2.5 h-2.5 text-brand-lime fill-brand-lime shrink-0" />}
                      </div>
                      <p className="text-[9px] text-on-surface-variant truncate mb-2">{pro.title}</p>
                      <div className="flex justify-between items-center mt-auto pt-1.5 border-t border-pale-mint/20">
                        <span className="text-xs font-extrabold text-brand-forest">{pro.hourlyRateXOF.toLocaleString("fr-FR")} F/h</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); onSelectPro(pro); }}
                          className="bg-brand-forest text-white h-7 px-3.5 rounded-full text-[9px] font-bold hover:bg-brand-lime hover:text-brand-forest transition-colors cursor-pointer active:scale-95"
                        >
                          Réserver
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {/* Become a Pro/Marketing CTA banner */}
      <section className="px-4 pt-3">
        <div className="bg-brand-forest rounded-2xl p-4 relative overflow-hidden text-white flex flex-col">
          <div className="relative z-10 w-2/3">
            <h3 className="font-sans text-sm font-bold mb-1">Devenir Pro</h3>
            <p className="text-[10px] opacity-80 mb-3 leading-relaxed">
              Augmentez vos revenus en rejoignant la communauté des meilleurs experts d'Abidjan.
            </p>
            <button className="bg-brand-lime text-brand-forest font-extrabold text-[10px] px-4 py-2 rounded-full hover:bg-white transition-colors cursor-pointer active:scale-95">
              En savoir plus
            </button>
          </div>
          <div className="absolute -right-6 -bottom-6 opacity-10">
            <Wrench className="w-32 h-32" />
          </div>
        </div>
      </section>

      {/* Floating Action Button for AI Request */}
      <div className="fixed bottom-28 right-6 z-10">
        <button
          onClick={onInitiateAiRequest}
          className="w-12 h-12 bg-brand-lime hover:bg-brand-lime/90 text-brand-forest rounded-full flex items-center justify-center shadow-lg border-2 border-brand-forest cursor-pointer active:scale-95 duration-150 transition-all hover:scale-105"
          title="Demander par IA"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>
      </div>
    </div>
  );
}
