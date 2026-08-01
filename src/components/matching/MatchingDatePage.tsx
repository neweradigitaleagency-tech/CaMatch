import { useState, useMemo } from "react";
import { motion } from "motion/react";
import { ChevronLeft, Calendar, Clock, MapPin, MessageCircle } from "lucide-react";
import type { BookingContextData, BookingMode } from "../profil/types";
import type { Service } from "../../types";

interface MatchingDatePageProps {
  booking: BookingContextData;
  onUpdate: (data: Partial<BookingContextData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function MatchingDatePage({ booking, onUpdate, onNext, onBack }: MatchingDatePageProps) {
  const [step, setStep] = useState<"date" | "address">("date");
  const today = useMemo(() => new Date(), []);

  const dateOptions = useMemo(() => {
    const days = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    const months = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      return {
        value: d.toISOString().split("T")[0],
        label: i === 0 ? "Aujourd'hui" : i === 1 ? "Demain" : `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`,
        dayName: days[d.getDay()],
        dateNum: d.getDate(),
        month: months[d.getMonth()],
      };
    });
  }, [today]);

  const timeOptions = useMemo(() => {
    const slots: string[] = [];
    for (let h = 8; h <= 18; h++) {
      slots.push(`${h.toString().padStart(2, "0")}:00`);
      if (h < 18) slots.push(`${h.toString().padStart(2, "0")}:30`);
    }
    return slots;
  }, []);

  const totalEstimate = useMemo(() => {
    const servicesTotal = booking.selectedServices.reduce((a, s) => a + s.priceEstimateXOF, 0);
    return servicesTotal + (booking.travelFeeXOF || 0);
  }, [booking.selectedServices, booking.travelFeeXOF]);

  return (
    <div className="fixed inset-0 z-40 bg-cm-bg flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 h-14 border-b border-cm-border/40 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack}
            className="w-9 h-9 flex items-center justify-center rounded-full text-cm-text-soft hover:bg-cm-surface transition-colors cursor-pointer active:scale-90">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-[14px] font-black text-cm-text">Prendre RDV</h1>
            <p className="text-[9px] font-bold text-cm-text-muted">Étape 1 sur 2</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-cm-text" />
          <div className="w-2 h-2 rounded-full bg-cm-border-soft" />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* Pro info mini */}
        <div className="flex items-center gap-3 px-4 py-3 bg-cm-surface mx-4 mt-4 rounded-[14px]">
          <img src={booking.professionalAvatar} alt={booking.professionalName} className="w-10 h-10 rounded-full bg-cm-border-soft object-cover" />
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-black text-cm-text">{booking.professionalName}</p>
            <p className="text-[10px] font-semibold text-cm-text-muted">{booking.selectedServices.length} service{booking.selectedServices.length > 1 ? "s" : ""} sélectionné{booking.selectedServices.length > 1 ? "s" : ""}</p>
          </div>
          <motion.div key={totalEstimate} initial={{ scale: 1.1 }} animate={{ scale: 1 }}
            className="text-right">
            <p className="text-[15px] font-black tracking-tight text-cm-text">{totalEstimate.toLocaleString("fr-FR")} <span className="text-[9px] font-bold text-cm-text-muted">F</span></p>
          </motion.div>
        </div>

        {/* Date selection */}
        <div className="px-4 mt-5">
          <div className="flex items-center gap-1.5 mb-3">
            <Calendar className="w-3.5 h-3.5 text-cm-text-muted" />
            <h3 className="text-[11px] font-black text-cm-text-soft uppercase tracking-wider">Choisissez une date</h3>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory">
            {dateOptions.map((opt) => (
              <button key={opt.value} onClick={() => onUpdate({ date: opt.value })}
                className={`snap-start shrink-0 flex flex-col items-center px-4 py-3 rounded-[14px] border-2 transition-all cursor-pointer min-w-[72px]
                  ${booking.date === opt.value ? "border-cm-text bg-cm-surface" : "border-cm-border/40 hover:border-cm-border"}`}>
                <span className={`text-[9px] font-black uppercase tracking-wider ${booking.date === opt.value ? "text-cm-text" : "text-cm-text-muted"}`}>
                  {opt.dayName}
                </span>
                <span className={`text-[16px] font-black mt-0.5 ${booking.date === opt.value ? "text-cm-text" : "text-cm-text"}`}>
                  {opt.dateNum}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Time selection */}
        <div className="px-4 mt-5">
          <div className="flex items-center gap-1.5 mb-3">
            <Clock className="w-3.5 h-3.5 text-cm-text-muted" />
            <h3 className="text-[11px] font-black text-cm-text-soft uppercase tracking-wider">Choisissez un horaire</h3>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {timeOptions.map((time) => (
              <button key={time} onClick={() => onUpdate({ time })}
                className={`py-2.5 rounded-[12px] text-[11px] font-black border-2 transition-all cursor-pointer
                  ${booking.time === time ? "border-cm-text bg-cm-surface text-cm-text" : "border-cm-border/40 text-cm-text-muted hover:border-cm-border"}`}>
                {time}
              </button>
            ))}
          </div>
        </div>

        {/* Address */}
        <div className="px-4 mt-5 mb-4">
          <div className="flex items-center gap-1.5 mb-3">
            <MapPin className="w-3.5 h-3.5 text-cm-text-muted" />
            <h3 className="text-[11px] font-black text-cm-text-soft uppercase tracking-wider">Adresse de l'intervention</h3>
          </div>
          <input
            value={booking.address || ""}
            onChange={(e) => onUpdate({ address: e.target.value })}
            placeholder="Votre adresse (quartier, rue, point de repère...)"
            className="w-full h-12 rounded-[14px] border border-cm-border px-4 text-[13px] outline-none focus:ring-1 focus:ring-cm-border-soft transition-all" />
        </div>

        {/* Notes */}
        <div className="px-4 mt-4 mb-6">
          <div className="flex items-center gap-1.5 mb-3">
            <MessageCircle className="w-3.5 h-3.5 text-cm-text-muted" />
            <h3 className="text-[11px] font-black text-cm-text-soft uppercase tracking-wider">Notes (optionnel)</h3>
          </div>
          <textarea
            value={booking.notes || ""}
            onChange={(e) => onUpdate({ notes: e.target.value })}
            placeholder="Précisions, informations complémentaires..."
            rows={3}
            className="w-full rounded-[14px] border border-cm-border px-4 py-3 text-[13px] resize-none outline-none focus:ring-1 focus:ring-cm-border-soft transition-all" />
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="px-4 pb-6 pt-3 bg-gradient-to-t from-white via-white to-transparent shrink-0">
        <button onClick={onNext}
          disabled={!booking.date || !booking.time}
          className="w-full h-12 rounded-[14px] bg-cm-text text-white text-[12px] font-black uppercase tracking-wider cursor-pointer active:scale-[0.98] hover:bg-cm-text/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-black/10">
          Continuer vers le récapitulatif
        </button>
      </div>
    </div>
  );
}
