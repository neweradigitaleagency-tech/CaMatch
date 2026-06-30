import { ArrowLeft, CheckCircle, Lock, Zap, Clock, Shield } from "lucide-react";
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
  const travelFee = 5000;
  const laborFee = selectedServices.reduce((sum, service) => sum + service.priceEstimateXOF, 0);
  const totalFee = travelFee + laborFee;

  return (
    <div className="flex flex-col w-full min-h-screen bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-10 bg-white border-b border-gray-100">
        <button onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-full text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer active:scale-95">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[15px] font-bold text-gray-900">Récapitulatif</h1>
        <div className="w-10 h-10" />
      </header>

      <main className="flex-1 px-4 pt-5 pb-32">
        {/* Pro info card */}
        <div className="flex items-center gap-3 mb-5 p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0">
            <img src={pro.avatarUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-[15px] font-bold text-gray-900">{pro.name}</h2>
            <p className="text-[12px] text-gray-500">{pro.title}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[11px] font-medium text-amber-600">★ {(pro.rating / 10).toFixed(1)}</span>
              <span className="text-[10px] text-gray-400">({pro.reviewCount} avis)</span>
            </div>
          </div>
        </div>

        {/* Pricing Breakdown */}
        <div className="border border-gray-200 rounded-2xl bg-white p-5 shadow-sm mb-4">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-gray-900" />
            <h3 className="text-[15px] font-bold text-gray-900">Estimation</h3>
          </div>

          <div className="space-y-3 border-b border-gray-100 pb-4 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-[13px] text-gray-500">Frais de déplacement</span>
              <span className="text-[13px] font-bold text-gray-900">{travelFee.toLocaleString("fr-FR")} F</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[13px] text-gray-500">Main-d'œuvre estimée</span>
              <span className="text-[13px] font-bold text-gray-900">{laborFee.toLocaleString("fr-FR")} F</span>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 text-[12px] space-y-1 border border-gray-100">
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">
                Détail des prestations ({selectedServices.length}) :
              </p>
              {selectedServices.map((service) => (
                <div key={service.id} className="flex justify-between items-center">
                  <span className="text-gray-500 truncate max-w-[180px]">{service.name}</span>
                  <span className="font-medium text-gray-900">{service.priceEstimateXOF.toLocaleString("fr-FR")} F</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">Total (XOF)</p>
              <div className="flex items-baseline gap-1">
                <span className="text-[26px] font-bold text-gray-900">
                  {totalFee.toLocaleString("fr-FR")}
                </span>
                <span className="text-[14px] font-bold text-gray-900">F</span>
              </div>
            </div>
            <span className="text-[10px] font-medium text-gray-400 px-2 py-1 border border-gray-200 rounded-lg">CFA</span>
          </div>
        </div>

        {/* Secure payment info */}
        <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100 mb-4">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-[12px] font-bold text-blue-900">Paiement sécurisé</p>
            <p className="text-[11px] text-blue-700 mt-0.5">
              Le paiement est sécurisé sur la plateforme. Les fonds sont bloqués jusqu'à votre validation finale.
            </p>
          </div>
        </div>

        {/* CTA */}
        <button onClick={() => onConfirmMatch(travelFee, laborFee, totalFee)}
          className="w-full h-13 bg-gray-900 text-white text-[14px] font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer active:scale-[0.97] transition-all hover:opacity-90 shadow-sm">
          <Lock className="w-4 h-4" /> Confirmer et payer
        </button>

        <p className="mt-3 text-center text-[11px] text-gray-400 leading-relaxed">
          En confirmant, vous acceptez nos conditions de service. Le professionnel est réservé.
        </p>
      </main>
    </div>
  );
}
