/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { Sparkles, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { Service, ProfessionalDetails } from "../types";

interface AiMatchAndPricingScreenProps {
  pro: ProfessionalDetails;
  selectedServices: Service[];
  onBack: () => void;
  onConfirmMatch: (travelFee: number, laborFee: number, total: number) => void;
}

export default function AiMatchAndPricingScreen({
  pro,
  selectedServices,
  onBack,
  onConfirmMatch,
}: AiMatchAndPricingScreenProps) {
  const [analysisStep, setAnalysisStep] = useState(0);

  // Compute estimates (travel cost is fixed at 5,000 F, labor is the sum of selected services or first service hourly/flat estimate)
  const travelFee = 5000;
  const laborFee = selectedServices.reduce((sum, service) => sum + service.priceEstimateXOF, 0);
  const totalFee = travelFee + laborFee;

  useEffect(() => {
    // Stagger matching state loading ticks
    const interval = setInterval(() => {
      setAnalysisStep((prev) => (prev < 2 ? prev + 1 : prev));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col w-full pb-24 items-center justify-start min-h-[80vh]">
      {/* Top Header */}
      <header className="w-full flex justify-between items-center px-6 py-4 sticky top-0 z-10 bg-brand-cream/90 backdrop-blur-md">
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-brand-forest hover:bg-pale-mint transition-colors shadow-sm cursor-pointer active:scale-95 duration-150"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="font-sans text-sm font-extrabold text-brand-forest uppercase tracking-widest">
          Transparence IA
        </span>
        <div className="w-10 h-10"></div> {/* filler spacer */}
      </header>

      <main className="w-full px-6 flex flex-col items-center">
        {/* Radar Scanner Animation visualizer */}
        <div className="relative py-8 flex flex-col items-center justify-center w-full max-w-sm">
          <div className="relative w-64 h-64 bg-black/5 rounded-full flex items-center justify-center overflow-hidden border border-black/5">
            {/* Pulsing visual circles */}
            <div className="absolute inset-2 border border-black/5 rounded-full map-pulse" style={{ animationDelay: "0s" }}></div>
            <div className="absolute inset-8 border border-black/5 rounded-full map-pulse" style={{ animationDelay: "1.5s" }}></div>
            <div className="absolute inset-14 border border-black/5 rounded-full map-pulse" style={{ animationDelay: "3s" }}></div>
            
            {/* Spinning sweeps */}
            <div className="absolute top-[50%] left-[50%] w-1/2 h-1/2 bg-gradient-to-r from-brand-lime/20 to-transparent radar-sweep border-l border-brand-lime/30 origin-top-left -mt-[0.5px] -ml-[0.5px]"></div>
            
            {/* Pro Floating Profile Icon */}
            <div className="absolute top-10 left-10 w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-premium animate-bounce" style={{ animationDuration: "3.5s" }}>
              <img
                alt="Client Marie"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDzfxjUIiCdA0lcXKapXPppnmXf26-sNqs7UOaboQR3fIg5dQsgShz3bPFOUfsnM6NJrbqB0u33Rj_1YqI7kcTBLCI5Wf9kSEjQ_nxp0p-zr3jBvG62ghRVX1un7cKyO-7l8KcG5UraKGELB41O8JjY5fuYI0se8efn6728qA_j-B8nC7nne4qGsgeyAQ7C05lV5zqpN8rR6UCBVU_NVj9Q7_ERP2ACpZMu2C-5JC5-s_91RMEGMjvh-FSH74xZ7YVbqqXMuLs6emQ"
              />
            </div>
            
            {/* Pro Avatar Floating */}
            <div className="absolute bottom-12 right-12 w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-premium animate-bounce" style={{ animationDuration: "4.5s" }}>
              <img
                alt={pro.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                src={pro.avatarUrl}
              />
            </div>

            {/* AI Center Badge */}
            <div className="z-10 bg-white p-5 rounded-full shadow-premium flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-brand-forest animate-pulse" />
            </div>
          </div>

          <p className="mt-6 text-xs font-bold text-on-surface-variant text-center tracking-widest uppercase">
            {analysisStep === 0 && "Analyse de votre demande..."}
            {analysisStep === 1 && "Calcul du meilleur itinéraire..."}
            {analysisStep === 2 && "Estimation tarifaire validée"}
          </p>
        </div>

        {/* Pricing Transparency Breakdown Card */}
        <div className="w-full bg-white rounded-3xl p-6 shadow-premium border border-pale-mint/15 transition-all duration-500 transform scale-100 hover:scale-[1.01]">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-pale-mint p-2.5 rounded-2xl text-brand-forest">
              <CheckCircle className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h2 className="font-sans text-lg font-bold text-brand-forest">Estimation Instantanée</h2>
              <p className="text-xs text-on-surface-variant font-medium">Calculé par l'IA - Aucun frais caché</p>
            </div>
          </div>

          {/* Pricing item list */}
          <div className="space-y-4 border-b border-pale-mint/20 pb-6 mb-6">
            <div className="flex justify-between items-center text-sm">
              <span className="text-on-surface-variant font-medium">Frais de déplacement</span>
              <span className="font-bold text-brand-forest">{travelFee.toLocaleString("fr-FR")} F</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-on-surface-variant font-medium">Main d'œuvre estimée</span>
              <span className="font-bold text-brand-forest">{laborFee.toLocaleString("fr-FR")} F</span>
            </div>
            
            {/* Small list of selected services in block */}
            <div className="bg-pale-mint/25 p-3.5 rounded-2xl text-xs space-y-1">
              <span className="font-bold text-[10px] text-brand-forest uppercase tracking-wider block mb-1">
                Détail des prestations ({selectedServices.length}) :
              </span>
              {selectedServices.map((service) => (
                <div key={service.id} className="flex justify-between items-center opacity-90 text-[11px]">
                  <span className="truncate max-w-[180px]">{service.name}</span>
                  <span className="font-semibold">{service.priceEstimateXOF.toLocaleString("fr-FR")} F</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Total in CFA */}
          <div className="flex justify-between items-end">
            <div>
              <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block mb-1">
                À régler après service (XOF)
              </span>
              <div className="flex items-baseline gap-1">
                <span className="font-sans text-3xl font-extrabold text-brand-forest">
                  Total : {totalFee.toLocaleString("fr-FR")}
                </span>
                <span className="text-lg font-bold text-brand-forest">F</span>
              </div>
            </div>
            
            <div className="bg-brand-cream px-3 py-1.5 rounded-full border border-pale-mint/30 shadow-sm">
              <span className="text-[11px] font-extrabold text-brand-forest uppercase tracking-wider">
                CFA
              </span>
            </div>
          </div>
        </div>

        {/* CTA triggers state transition to tracker */}
        <button
          onClick={() => onConfirmMatch(travelFee, laborFee, totalFee)}
          className="w-full mt-6 py-5 bg-brand-forest text-white font-bold text-base rounded-full shadow-lg hover:bg-brand-lime hover:text-brand-forest transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] duration-150 group"
        >
          <span>Confirmer le Match</span>
          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
        </button>

        <p className="mt-4 text-center text-[11px] text-secondary leading-relaxed px-6">
          En confirmant, vous acceptez nos conditions de service. Le professionnel est réservé et partira immédiatement.
        </p>
      </main>
    </div>
  );
}
