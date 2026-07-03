import { useMemo } from "react";
import { motion } from "motion/react";
import { ChevronLeft, Calendar, Clock, MapPin, MessageCircle, CheckCircle } from "lucide-react";
import type { BookingContextData } from "../profil/types";

interface MatchingConfirmPageProps {
  booking: BookingContextData;
  onBack: () => void;
  onConfirm: () => void;
}

export default function MatchingConfirmPage({ booking, onBack, onConfirm }: MatchingConfirmPageProps) {
  const totalEstimate = useMemo(() => {
    const servicesTotal = booking.selectedServices.reduce((a, s) => a + s.priceEstimateXOF, 0);
    return servicesTotal + (booking.travelFeeXOF || 0);
  }, [booking.selectedServices, booking.travelFeeXOF]);

  const formatPrice = (v: number) => v.toLocaleString("fr-FR");

  const isSimulation = booking.mode === "simulation";

  return (
    <div className="fixed inset-0 z-40 bg-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 h-14 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack}
            className="w-9 h-9 flex items-center justify-center rounded-full text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer active:scale-90">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-[14px] font-black text-gray-900">Récapitulatif</h1>
            <p className="text-[9px] font-bold text-gray-400">Étape 2 sur 2</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-gray-300" />
          <div className="w-2 h-2 rounded-full bg-gray-900" />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* Simulation banner */}
        {isSimulation && (
          <div className="mx-4 mt-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-[14px]">
            <p className="text-[11px] font-black text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" /> Mode simulation
            </p>
            <p className="text-[11px] font-semibold text-amber-700 mt-1">
              Vous parcourez les étapes de réservation comme le ferait un client. Aucune réservation ne sera créée.
            </p>
          </div>
        )}

        {/* Professional */}
        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 mx-4 mt-4 rounded-[14px]">
          <img src={booking.professionalAvatar} alt={booking.professionalName} className="w-10 h-10 rounded-full bg-gray-200 object-cover" />
          <div>
            <p className="text-[12px] font-black text-gray-900">{booking.professionalName}</p>
            <p className="text-[10px] font-semibold text-gray-400">Professionnel</p>
          </div>
        </div>

        {/* Selected services */}
        <div className="mx-4 mt-4">
          <h3 className="text-[11px] font-black text-gray-700 uppercase tracking-wider mb-2.5 px-0.5">Services sélectionnés</h3>
          <div className="bg-white border border-gray-100 rounded-[20px] p-4 shadow-sm space-y-2.5">
            {booking.selectedServices.map((service) => (
              <div key={service.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div>
                    <p className="text-[12px] font-black text-gray-900">{service.name}</p>
                    <p className="text-[9px] font-semibold text-gray-400">{service.description}</p>
                  </div>
                </div>
                <span className="text-[13px] font-black text-gray-900">{formatPrice(service.priceEstimateXOF)} <span className="text-[9px] font-bold text-gray-400">F</span></span>
              </div>
            ))}
            <div className="border-t border-gray-100 pt-2.5 flex items-center justify-between text-[11px]">
              <span className="font-bold text-gray-500">Frais de déplacement</span>
              <span className="font-black text-gray-700">{formatPrice(booking.travelFeeXOF || 0)} F</span>
            </div>
          </div>
        </div>

        {/* Date, time, address, notes */}
        <div className="mx-4 mt-4">
          <div className="bg-white border border-gray-100 rounded-[20px] p-4 shadow-sm space-y-3">
            {booking.date && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-[10px] bg-gray-50 flex items-center justify-center shrink-0">
                  <Calendar className="w-3.5 h-3.5 text-gray-500" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Date</p>
                  <p className="text-[13px] font-black text-gray-900">
                    {new Date(booking.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
              </div>
            )}
            {booking.time && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-[10px] bg-gray-50 flex items-center justify-center shrink-0">
                  <Clock className="w-3.5 h-3.5 text-gray-500" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Horaire</p>
                  <p className="text-[13px] font-black text-gray-900">{booking.time}</p>
                </div>
              </div>
            )}
            {booking.address && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-[10px] bg-gray-50 flex items-center justify-center shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-gray-500" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Adresse</p>
                  <p className="text-[13px] font-black text-gray-900">{booking.address}</p>
                </div>
              </div>
            )}
            {booking.notes && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-[10px] bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
                  <MessageCircle className="w-3.5 h-3.5 text-gray-500" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Notes</p>
                  <p className="text-[13px] text-gray-600 leading-relaxed">{booking.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Total */}
        <div className="mx-4 mt-4 mb-4">
          <div className="bg-gray-900 rounded-[20px] p-4 text-white">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-black uppercase tracking-wider text-white/70">Total estimé</p>
              <p className="text-[22px] font-black tracking-tight">
                {formatPrice(totalEstimate)} <span className="text-[9px] font-bold text-white/60">F</span>
              </p>
            </div>
            <p className="text-[9px] font-semibold text-white/50 mt-1">Paiement sur place après l'intervention</p>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="px-4 pb-6 pt-3 bg-gradient-to-t from-white via-white to-transparent shrink-0">
        <motion.button
          onClick={onConfirm}
          whileTap={{ scale: 0.98 }}
          className="w-full h-12 rounded-[14px] bg-gray-900 text-white text-[12px] font-black uppercase tracking-wider cursor-pointer hover:bg-gray-800 shadow-lg shadow-black/10 transition-all">
          {isSimulation ? "Terminer la simulation" : "Confirmer la réservation"}
        </motion.button>
      </div>
    </div>
  );
}
