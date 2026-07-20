import { Zap, Clock, CalendarDays, CalendarCheck, Timer } from "lucide-react";
import { useRequestWizardStore } from "../../stores/requestWizardStore";
import type { AvailabilityMode } from "../../types";

const OPTIONS: { value: AvailabilityMode; label: string; desc: string; icon: typeof Zap }[] = [
  { value: "asap", label: "Dès que possible", desc: "Le plus tôt possible", icon: Zap },
  { value: "today", label: "Aujourd'hui", desc: "Avant la fin de journée", icon: Clock },
  { value: "this_week", label: "Cette semaine", desc: "Sous 3 à 4 jours", icon: CalendarDays },
  { value: "custom", label: "Choisir une date", desc: "Planifier une date précise", icon: CalendarCheck },
];

export default function Step4Availability() {
  const { draft, setAvailability, setScheduledDate, setTimeSlot } = useRequestWizardStore();

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-[18px] font-bold text-cm-text">Quand souhaitez-vous l'intervention ?</h2>
        <p className="text-[13px] text-cm-text-muted mt-1">Choisissez le moment qui vous convient</p>
      </div>

      <div className="space-y-2.5">
        {OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const selected = draft.availability === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setAvailability(opt.value)}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left active:scale-[0.97] cursor-pointer ${
                selected
                  ? "border-cm-text bg-cm-text text-white"
                  : "border-cm-border bg-cm-elevated text-cm-text hover:border-cm-text/30"
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                selected ? "bg-white/20" : "bg-cm-bg"
              }`}>
                <Icon className={`w-5 h-5 ${selected ? "text-white" : "text-cm-text"}`} />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-bold">{opt.label}</p>
                <p className={`text-[11px] mt-0.5 ${selected ? "text-white/70" : "text-cm-text-muted"}`}>{opt.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {draft.availability === "custom" && (
        <div className="space-y-3 bg-cm-elevated rounded-2xl p-4 border border-cm-border">
          <div>
            <label className="text-[11px] font-bold text-cm-text-muted uppercase tracking-wider mb-2 block">
              Date souhaitée <span className="text-cm-error">*</span>
            </label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cm-text-muted" />
              <input
                type="date"
                value={draft.scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full h-11 pl-9 pr-4 text-[13px] font-medium bg-cm-bg border border-cm-border rounded-xl text-cm-text outline-none focus:border-cm-text"
              />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-bold text-cm-text-muted uppercase tracking-wider mb-2 block">
              Créneau horaire
            </label>
            <div className="relative">
              <Timer className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cm-text-muted" />
              <select
                value={draft.timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full h-11 pl-9 pr-4 text-[13px] font-medium bg-cm-bg border border-cm-border rounded-xl text-cm-text outline-none focus:border-cm-text appearance-none"
              >
                <option value="">Sélectionnez un créneau</option>
                <option value="8h-10h">8h - 10h</option>
                <option value="10h-12h">10h - 12h</option>
                <option value="12h-14h">12h - 14h</option>
                <option value="14h-16h">14h - 16h</option>
                <option value="16h-18h">16h - 18h</option>
                <option value="18h-20h">18h - 20h</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
