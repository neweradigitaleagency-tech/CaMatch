/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Check, Compass, Navigation, Phone, MessageSquare, Shield, Clock, Play, HelpCircle } from "lucide-react";
import { ProfessionalDetails, ServiceRequest, RequestStatus } from "../types";

interface SuiviDemandeScreenProps {
  pro: ProfessionalDetails;
  request: ServiceRequest;
  onUpdateStatus: (newStatus: RequestStatus) => void;
  onReset: () => void;
}

export default function SuiviDemandeScreen({ pro, request, onUpdateStatus, onReset }: SuiviDemandeScreenProps) {
  // Let's hold local chat state or simulated call status
  const [showContactAlert, setShowContactAlert] = useState<string | null>(null);

  // Custom step detailed descriptors based on active state-machine status
  const getStepStatusClass = (step: RequestStatus) => {
    const statusesInOrder = [
      RequestStatus.PENDING,
      RequestStatus.ACCEPTED,
      RequestStatus.EN_ROUTE,
      RequestStatus.IN_PROGRESS,
      RequestStatus.COMPLETED,
    ];
    const currentIndex = statusesInOrder.indexOf(request.status);
    const stepIndex = statusesInOrder.indexOf(step);

    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "active";
    return "upcoming";
  };

  const currentStep = request.status;

  // Simulate haptic or feedback notification banner
  const triggerSimulationContact = (type: "phone" | "chat") => {
    if (type === "phone") {
      setShowContactAlert(`📞 Appel en cours vers ${pro.name} (+225 07 89 45 12)...`);
    } else {
      setShowContactAlert(`💬 Démarrage de la discussion avec ${pro.name}. Message programmé.`);
    }
    setTimeout(() => {
      setShowContactAlert(null);
    }, 4000);
  };

  return (
    <div className="flex flex-col w-full pb-32">
      {/* Interactive live simulated map section */}
      <section className="relative h-[280px] bg-pale-mint/45 overflow-hidden border-b border-pale-mint/15">
        {/* Abstract dot-grid background mimicking Map topography */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#0B130E_1px,transparent_1px)] [background-size:20px_20px] bg-[size:24px_24px]"></div>

        {/* Live professional tracking marker */}
        {currentStep === RequestStatus.EN_ROUTE && (
          <div className="absolute top-[35%] left-[45%] flex flex-col items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-brand-forest/15 rounded-full map-pulse w-14 h-14 -ml-3 -mt-3"></div>
              <div className="w-8 h-8 bg-brand-forest rounded-full border-2 border-white flex items-center justify-center shadow-lg relative z-10 text-white animate-bounce">
                <Navigation className="w-4 h-4 fill-white" />
              </div>
            </div>
            <div className="mt-2.5 px-3 py-1 bg-white rounded-full shadow-sm border border-pale-mint/15">
              <p className="text-[10px] font-bold text-brand-forest uppercase tracking-wider block">
                {pro.name} est en route
              </p>
            </div>
          </div>
        )}

        {/* Live professional marker on-site (In progress) */}
        {currentStep === RequestStatus.IN_PROGRESS && (
          <div className="absolute top-[50%] left-[50%] flex flex-col items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-brand-lime/30 rounded-full map-pulse w-14 h-14 -ml-3 -mt-3"></div>
              <div className="w-8 h-8 bg-brand-lime rounded-full border-2 border-brand-forest flex items-center justify-center shadow-lg relative z-10 text-brand-forest">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
            </div>
            <div className="mt-2.5 px-3 py-1 bg-white rounded-full shadow-sm border border-pale-mint">
              <p className="text-[10px] font-bold text-brand-forest tracking-wider">
                Intervention en cours
              </p>
            </div>
          </div>
        )}

        {/* Finished / Completed state */}
        {currentStep === RequestStatus.COMPLETED && (
          <div className="absolute inset-0 bg-pale-mint flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-brand-forest mb-3 shadow-sm border-2 border-brand-lime">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <h4 className="font-sans text-base font-bold text-brand-forest">Intervention Terminée !</h4>
            <p className="text-xs text-on-surface-variant max-w-xs mt-1">
              {pro.name} a finalisé la recharge de gaz. Vous pouvez procéder au paiement de{" "}
              <b className="font-extrabold">{request.totalFeeXOF.toLocaleString("fr-FR")} F CFA</b> après vérification.
            </p>
          </div>
        )}

        {/* Destination marker on-map */}
        {currentStep !== RequestStatus.COMPLETED && (
          <div className="absolute top-[55%] left-[70%] flex flex-col items-center">
            <div className="w-4 h-4 bg-red-600 rounded-full border-2 border-white shadow-sm ring-4 ring-red-500/10"></div>
            <p className="mt-1 text-[10px] text-on-surface-variant font-extrabold uppercase">Votre Lieu</p>
          </div>
        )}

        {/* Quick status badge */}
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm border border-pale-mint/15">
          <Clock className="w-3.5 h-3.5 text-brand-forest" />
          <span className="text-[10px] font-bold tracking-wide uppercase text-brand-forest">
            Abidjan UTC GMT
          </span>
        </div>
      </section>

      {/* Floating contact feedback Banner */}
      {showContactAlert && (
        <div className="mx-6 mt-4 bg-brand-forest text-brand-lime p-4 rounded-2xl shadow-lg border border-brand-lime/10 animate-in fade-in slide-in-from-top-4 duration-300">
          <p className="text-xs font-bold text-center">{showContactAlert}</p>
        </div>
      )}

      {/* Main tracker body sheet */}
      <section className="px-6 pt-6">
        <div className="flex flex-col gap-5">
          {/* Header information with estimated ETA */}
          <div className="flex flex-col">
            <div className="flex justify-between items-baseline">
              <h2 className="font-sans text-xl font-extrabold text-brand-forest tracking-tight">
                {currentStep === RequestStatus.COMPLETED
                  ? "Prestation Finalisée"
                  : currentStep === RequestStatus.IN_PROGRESS
                  ? "Intervention active"
                  : "Arrivée estimée : 22 min"}
              </h2>
              {currentStep !== RequestStatus.COMPLETED && (
                <span className="bg-pale-mint text-brand-forest text-[10px] font-extrabold px-2 py-0.5 rounded-full tracking-wider uppercase">
                  Live
                </span>
              )}
            </div>
            <p className="text-xs text-on-surface-variant mt-1 font-medium">
              Heure d'Abidjan • Marge de trafic incluse
            </p>
          </div>

          <hr className="border-pale-mint/15" />

          {/* STATE MACHINE STEPPER PROCESS */}
          <div className="flex flex-col">
            {/* Step 1: Accepted state */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                    getStepStatusClass(RequestStatus.ACCEPTED) === "completed"
                      ? "bg-brand-forest text-brand-lime border-brand-forest"
                      : getStepStatusClass(RequestStatus.ACCEPTED) === "active"
                      ? "bg-brand-lime text-brand-forest border-brand-forest"
                      : "bg-white text-secondary border-pale-mint"
                  }`}
                >
                  {getStepStatusClass(RequestStatus.ACCEPTED) === "completed" ? (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  ) : (
                    "1"
                  )}
                </div>
                <div
                  className={`w-0.5 h-10 ${
                    getStepStatusClass(RequestStatus.ACCEPTED) === "completed"
                      ? "bg-brand-forest"
                      : "bg-pale-mint"
                  }`}
                />
              </div>
              <div className="pt-0.5">
                <h4
                  className={`text-xs font-bold ${
                    getStepStatusClass(RequestStatus.ACCEPTED) === "completed"
                      ? "text-secondary/60 line-through"
                      : "text-brand-forest"
                  }`}
                >
                  Demande acceptée par le pro
                </h4>
                <p className="text-[10px] text-on-surface-variant italic mt-0.5">
                  Mamadou K. prépare ses outils de climatisation
                </p>
              </div>
            </div>

            {/* Step 2: En Route state */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                    getStepStatusClass(RequestStatus.EN_ROUTE) === "completed"
                      ? "bg-brand-forest text-brand-lime border-brand-forest"
                      : getStepStatusClass(RequestStatus.EN_ROUTE) === "active"
                      ? "bg-brand-lime text-brand-forest border-brand-forest ring-4 ring-pale-mint"
                      : "bg-white text-secondary border-pale-mint"
                  }`}
                >
                  {getStepStatusClass(RequestStatus.EN_ROUTE) === "completed" ? (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  ) : (
                    "2"
                  )}
                </div>
                <div
                  className={`w-0.5 h-10 ${
                    getStepStatusClass(RequestStatus.EN_ROUTE) === "completed"
                      ? "bg-brand-forest"
                      : "bg-pale-mint"
                  }`}
                />
              </div>
              <div className="pt-0.5">
                <h4
                  className={`text-xs font-bold ${
                    getStepStatusClass(RequestStatus.EN_ROUTE) === "completed"
                      ? "text-secondary/60 line-through"
                      : "text-brand-forest"
                  }`}
                >
                  En route
                </h4>
                {currentStep === RequestStatus.EN_ROUTE && (
                  <p className="text-[10px] text-on-surface-variant font-medium mt-1">
                    Moussa contourne le carrefour de la Riviera 🇨🇮
                  </p>
                )}
              </div>
            </div>

            {/* Step 3: In Progress state */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                    getStepStatusClass(RequestStatus.IN_PROGRESS) === "completed"
                      ? "bg-brand-forest text-brand-lime border-brand-forest"
                      : getStepStatusClass(RequestStatus.IN_PROGRESS) === "active"
                      ? "bg-brand-lime text-brand-forest border-brand-forest ring-4 ring-pale-mint"
                      : "bg-white text-secondary border-pale-mint"
                  }`}
                >
                  {getStepStatusClass(RequestStatus.IN_PROGRESS) === "completed" ? (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  ) : (
                    "3"
                  )}
                </div>
                <div
                  className={`w-0.5 h-10 ${
                    getStepStatusClass(RequestStatus.IN_PROGRESS) === "completed"
                      ? "bg-brand-forest"
                      : "bg-pale-mint"
                  }`}
                />
              </div>
              <div className="pt-0.5">
                <h4
                  className={`text-xs font-bold ${
                    getStepStatusClass(RequestStatus.IN_PROGRESS) === "completed"
                      ? "text-secondary/60 line-through"
                      : "text-brand-forest"
                  }`}
                >
                  Travail en cours
                </h4>
                {currentStep === RequestStatus.IN_PROGRESS && (
                  <p className="text-[10px] text-on-surface-variant font-medium mt-1">
                    Recharge de gaz et nettoyage du filtre de l'unité principale.
                  </p>
                )}
              </div>
            </div>

            {/* Step 4: Completed / Final status */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                    getStepStatusClass(RequestStatus.COMPLETED) === "active"
                      ? "bg-brand-forest text-brand-lime border-brand-forest"
                      : "bg-white text-secondary border-pale-mint"
                  }`}
                >
                  ✔
                </div>
              </div>
              <div className="pt-0.5">
                <h4
                  className={`text-xs font-bold ${
                    currentStep === RequestStatus.COMPLETED ? "text-brand-forest" : "text-secondary"
                  }`}
                >
                  Terminé &amp; Payé
                </h4>
              </div>
            </div>
          </div>

          {/* Action Call / Chat Buttons */}
          <div className="flex gap-4 mt-2">
            <button
              onClick={() => triggerSimulationContact("phone")}
              className="flex-1 flex items-center justify-center gap-2 py-4 px-6 bg-white hover:bg-pale-mint transition-all rounded-full active:scale-95 duration-200 border border-pale-mint/35 text-xs font-bold text-brand-forest cursor-pointer"
            >
              <Phone className="w-4 h-4 text-brand-forest" />
              <span>Appeler</span>
            </button>
            <button
              onClick={() => triggerSimulationContact("chat")}
              className="flex-1 flex items-center justify-center gap-2 py-4 px-6 bg-brand-forest hover:brightness-110 transition-all rounded-full active:scale-95 duration-200 shadow-md text-xs font-bold text-white cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-brand-lime" />
              <span>Chatter</span>
            </button>
          </div>
        </div>
      </section>

      {/* STATE MACHINE CONTROL PANEL (EXQUISITE INTERACTIVE MVP UI) */}
      <section className="mx-6 mt-8 p-6 bg-white rounded-3xl shadow-ambient border border-brand-lime/10">
        <h4 className="text-xs font-extrabold text-brand-forest uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Play className="w-3.5 h-3.5 text-brand-forest fill-brand-forest" /> Panel de Simulation (Intervention)
        </h4>
        <p className="text-[11px] text-on-surface-variant leading-relaxed mb-4">
          Avancez pas-à-pas dans le suivi de l'intervention pour tester la transition de la machine d'état.
        </p>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onUpdateStatus(RequestStatus.ACCEPTED)}
            className={`py-2 px-3 text-[10px] font-bold rounded-xl border transition-colors ${
              currentStep === RequestStatus.ACCEPTED
                ? "bg-brand-forest text-brand-lime border-brand-forest"
                : "bg-pale-mint/30 border-pale-mint text-brand-forest hover:bg-pale-mint/60"
            }`}
          >
            1. Accepté
          </button>
          <button
            onClick={() => onUpdateStatus(RequestStatus.EN_ROUTE)}
            className={`py-2 px-3 text-[10px] font-bold rounded-xl border transition-colors ${
              currentStep === RequestStatus.EN_ROUTE
                ? "bg-brand-forest text-brand-lime border-brand-forest"
                : "bg-pale-mint/30 border-pale-mint text-brand-forest hover:bg-pale-mint/60"
            }`}
          >
            2. En Route
          </button>
          <button
            onClick={() => onUpdateStatus(RequestStatus.IN_PROGRESS)}
            className={`py-2 px-3 text-[10px] font-bold rounded-xl border transition-colors ${
              currentStep === RequestStatus.IN_PROGRESS
                ? "bg-brand-forest text-brand-lime border-brand-forest"
                : "bg-pale-mint/30 border-pale-mint text-brand-forest hover:bg-pale-mint/60"
            }`}
          >
            3. En Cours
          </button>
          <button
            onClick={() => onUpdateStatus(RequestStatus.COMPLETED)}
            className={`py-2 px-3 text-[10px] font-bold rounded-xl border transition-colors ${
              currentStep === RequestStatus.COMPLETED
                ? "bg-brand-forest text-brand-lime border-brand-forest"
                : "bg-pale-mint/30 border-pale-mint text-brand-forest hover:bg-pale-mint/60"
            }`}
          >
            4. Clôturé
          </button>
        </div>

        {currentStep === RequestStatus.COMPLETED && (
          <button
            onClick={onReset}
            className="w-full mt-4 py-2.5 bg-brand-lime text-brand-forest font-extrabold text-[11px] rounded-xl hover:brightness-105 transition-colors cursor-pointer"
          >
            Créer une nouvelle demande
          </button>
        )}
      </section>
    </div>
  );
}
