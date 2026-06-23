import { useEffect, useState } from "react";
import { ArrowLeft, Sparkles, CheckCircle, Lock, Clock, CircuitBoard, Wallet } from "lucide-react";
import { Service, ProfessionalDetails } from "../types";

interface AiMatchAndPricingScreenProps {
  pro: ProfessionalDetails;
  selectedServices: Service[];
  onBack: () => void;
  onConfirmMatch: (travelFee: number, laborFee: number, total: number) => void;
}

const PAYMENT_STATES = [
  { icon: Sparkles, label: "Analyse IA", color: "text-cm-text" },
  { icon: CheckCircle, label: "Confirmé", color: "text-cm-accent" },
  { icon: Clock, label: "En cours", color: "text-cm-text" },
  { icon: CircuitBoard, label: "Finalisation", color: "text-cm-text" },
  { icon: Wallet, label: "Libéré", color: "text-cm-accent" },
];

export default function AiMatchAndPricingScreen({
  pro,
  selectedServices,
  onBack,
  onConfirmMatch,
}: AiMatchAndPricingScreenProps) {
  const [analysisStep, setAnalysisStep] = useState(0);
  const [showStates, setShowStates] = useState(false);

  const travelFee = 5000;
  const laborFee = selectedServices.reduce((sum, service) => sum + service.priceEstimateXOF, 0);
  const totalFee = travelFee + laborFee;

  useEffect(() => {
    const interval = setInterval(() => {
      setAnalysisStep((prev) => (prev < 2 ? prev + 1 : prev));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (analysisStep === 2) {
      const t = setTimeout(() => setShowStates(true), 400);
      return () => clearTimeout(t);
    }
  }, [analysisStep]);

  return (
    <div className="flex flex-col w-full min-h-screen bg-cm-bg">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-10 bg-cm-elevated border-b border-cm-border">
        <button onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-full text-cm-text hover:bg-cm-accent-soft transition-colors cursor-pointer active:scale-95">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[14px] font-display font-bold text-cm-text">Estimation</h1>
        <div className="w-10 h-10" />
      </header>

      <main className="flex-1 px-4 pt-6 pb-32">
        {/* AI Matching Animation */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-56 h-56 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 224 224">
              <circle cx="112" cy="112" r="104" fill="none" stroke="#E5E5E5" strokeWidth="1" />
              <circle cx="112" cy="112" r="80" fill="none" stroke="#E5E5E5" strokeWidth="0.5" />
              <circle cx="112" cy="112" r="56" fill="none" stroke="#E5E5E5" strokeWidth="0.5" />
            </svg>
            {/* Rotating arc */}
            <div className="absolute w-[112px] h-[112px] top-0 left-0 origin-bottom-right opacity-20"
              style={{ animation: "spin 3s linear infinite" }}>
              <div className="w-full h-full rounded-tr-full bg-gradient-to-r from-transparent to-cm-accent" />
            </div>
            {/* Pro avatar */}
            <div className="absolute top-8 left-8 w-12 h-12 rounded-full overflow-hidden border-2 border-cm-border shadow-cm-sm"
              style={{ animation: "bounce 3.5s infinite" }}>
              <img src={pro.avatarUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            {/* Client avatar */}
            <div className="absolute bottom-8 right-8 w-12 h-12 rounded-full overflow-hidden border-2 border-cm-border shadow-cm-sm"
              style={{ animation: "bounce 4.5s infinite" }}>
              <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face" alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            {/* Center AI icon */}
            <div className="z-10 w-16 h-16 rounded-full bg-cm-elevated border border-cm-border flex items-center justify-center shadow-cm-md">
              <Sparkles className={`w-7 h-7 ${analysisStep < 2 ? "text-cm-text" : "text-cm-accent"}`} />
            </div>
          </div>

          <p className="text-[12px] font-medium text-cm-text-soft text-center uppercase tracking-wider mt-2">
            {analysisStep === 0 && "Analyse de votre demande..."}
            {analysisStep === 1 && "Calcul du meilleur itinéraire..."}
            {analysisStep === 2 && "Estimation validée par l'IA"}
          </p>
        </div>

        {/* 5-State Payment Flow */}
        {showStates && (
          <div className="mb-6 animate-fade-in">
            <div className="border border-cm-border rounded-[14px] bg-cm-elevated p-4 shadow-cm-sm">
              <h3 className="text-[11px] font-semibold text-cm-text-soft uppercase tracking-wider mb-4">Cycle de paiement</h3>
              <div className="flex items-start justify-between">
                {PAYMENT_STATES.map((state, i) => (
                  <div key={state.label} className="flex flex-col items-center flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                      i === 1 ? "bg-cm-accent text-white" : i === 4 ? "bg-cm-accent text-white" : i === 0 ? "bg-cm-text text-white" : "bg-cm-border-soft text-cm-text-soft"
                    }`}>
                      <state.icon className="w-4 h-4" />
                    </div>
                    <p className={`text-[9px] text-center mt-1.5 font-medium ${
                      i === 1 || i === 4 ? "text-cm-accent font-bold" : "text-cm-text-muted"
                    }`}>{state.label}</p>
                    {i < PAYMENT_STATES.length - 1 && (
                      <div className="w-full h-px bg-cm-border-soft mt-[-16px] ml-4 hidden sm:block" />
                    )}
                  </div>
                ))}
              </div>
              <div className="border-t border-cm-border mt-4" />
            </div>
          </div>
        )}

        {/* Pricing Breakdown Card */}
        <div className="border border-cm-border rounded-[14px] bg-cm-elevated p-5 shadow-cm-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-[12px] bg-cm-accent-soft flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-cm-accent" />
            </div>
            <div>
              <h2 className="text-[15px] font-display font-bold text-cm-text">Estimation Instantanée</h2>
              <p className="text-[11px] text-cm-text-muted">Calculé par l'IA — Aucun frais caché</p>
            </div>
          </div>

          <div className="space-y-3 border-b border-cm-border pb-4 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-[13px] text-cm-text-soft">Frais de déplacement</span>
              <span className="text-[13px] font-bold text-cm-text font-mono">{travelFee.toLocaleString("fr-FR")} F</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[13px] text-cm-text-soft">Main d'œuvre estimée</span>
              <span className="text-[13px] font-bold text-cm-text font-mono">{laborFee.toLocaleString("fr-FR")} F</span>
            </div>

            <div className="bg-cm-bg rounded-[12px] p-3 border border-cm-border-soft text-[12px] space-y-1">
              <p className="text-[10px] font-medium text-cm-text-muted uppercase tracking-wider mb-1">
                Détail des prestations ({selectedServices.length}) :
              </p>
              {selectedServices.map((service) => (
                <div key={service.id} className="flex justify-between items-center">
                  <span className="text-cm-text-soft truncate max-w-[180px]">{service.name}</span>
                  <span className="font-mono font-medium text-cm-text">{service.priceEstimateXOF.toLocaleString("fr-FR")} F</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] font-medium text-cm-text-muted uppercase tracking-wider mb-1">À régler après service (XOF)</p>
              <div className="flex items-baseline gap-1">
                <span className="text-[24px] font-display font-bold text-cm-text">
                  {totalFee.toLocaleString("fr-FR")}
                </span>
                <span className="text-[14px] font-bold text-cm-text">F</span>
              </div>
            </div>
            <span className="text-[10px] font-mono font-medium text-cm-text-soft px-2 py-1 border border-cm-border-soft rounded-[8px]">CFA</span>
          </div>

          <div className="border-t border-cm-border mt-4" />
        </div>

        {/* CTA */}
        <button onClick={() => onConfirmMatch(travelFee, laborFee, totalFee)}
          className="w-full mt-5 h-13 bg-cm-accent text-white text-[14px] font-semibold rounded-[12px] flex items-center justify-center gap-2 cursor-pointer active:scale-[0.97] transition-all hover:bg-cm-accent-hover shadow-cm-md">
          <Lock className="w-4 h-4" /> Confirmer le Match
        </button>

        <p className="mt-3 text-center text-[11px] text-cm-text-muted leading-relaxed">
          En confirmant, vous acceptez nos conditions de service. Le professionnel est réservé et partira immédiatement.
        </p>
      </main>
    </div>
  );
}
