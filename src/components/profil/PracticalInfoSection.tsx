import { Clock, Languages, CreditCard, Phone, MessageCircle } from "lucide-react";
import ProfileSection from "./ProfileSection";
import EditableField from "./EditableField";
import type { SectionBaseProps } from "./types";

const WORKING_HOURS = [
  { day: "Lun–Ven", hours: "08:00 – 18:00" },
  { day: "Sam", hours: "09:00 – 14:00" },
  { day: "Dim", hours: "Fermé" },
];

const LANGUAGES = ["Français", "Anglais"];
const PAYMENT_METHODS = ["Orange Money", "Wave", "Carte bancaire"];

export default function PracticalInfoSection({ mode, editing, pro, onUpdate }: SectionBaseProps) {
  return (
    <ProfileSection title="Infos pratiques">
      <div className="bg-white border border-cm-border/40 rounded-[20px] p-4 shadow-sm space-y-4">
        {/* Working hours */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Clock className="w-3.5 h-3.5 text-cm-text-muted" />
            <h4 className="text-[10px] font-black text-cm-text-muted uppercase tracking-wider">Horaires</h4>
          </div>
          <div className="space-y-1">
            {WORKING_HOURS.map((wh) => (
              <div key={wh.day} className="flex items-center justify-between text-[12px]">
                <span className="font-bold text-cm-text-soft">{wh.day}</span>
                <span className={`font-black ${wh.hours === "Fermé" ? "text-red-400" : "text-cm-text"}`}>{wh.hours}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-cm-border/40" />

        {/* Languages */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Languages className="w-3.5 h-3.5 text-cm-text-muted" />
            <h4 className="text-[10px] font-black text-cm-text-muted uppercase tracking-wider">Langues</h4>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {LANGUAGES.map((lang) => (
              <span key={lang} className="px-2.5 py-1 rounded-[8px] bg-cm-surface text-[10px] font-bold text-cm-text-soft">{lang}</span>
            ))}
          </div>
        </div>

        <div className="border-t border-cm-border/40" />

        {/* Payment */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <CreditCard className="w-3.5 h-3.5 text-cm-text-muted" />
            <h4 className="text-[10px] font-black text-cm-text-muted uppercase tracking-wider">Paiements acceptés</h4>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PAYMENT_METHODS.map((pm) => (
              <span key={pm} className="px-2.5 py-1 rounded-[8px] bg-emerald-50 text-[10px] font-bold text-emerald-700">{pm}</span>
            ))}
          </div>
        </div>

        <div className="border-t border-cm-border/40" />

        {/* Contact */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Phone className="w-3.5 h-3.5 text-cm-text-muted" />
            <h4 className="text-[10px] font-black text-cm-text-muted uppercase tracking-wider">Contact</h4>
          </div>
          {editing ? (
            <EditableField
              value={pro.phoneNumber || ""}
              editing
              placeholder="Votre numéro de téléphone"
              onChange={(v) => onUpdate?.("phoneNumber", v)}
            />
          ) : (
            <a href={`tel:${pro.phoneNumber}`}
              className="text-[13px] font-black text-cm-text hover:text-cm-text-soft transition-colors">{pro.phoneNumber || "Non renseigné"}</a>
          )}
        </div>

        <div className="border-t border-cm-border/40" />

        {/* Response time */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[10px] bg-cm-surface flex items-center justify-center">
            <MessageCircle className="w-3.5 h-3.5 text-cm-text-muted" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-cm-text-muted">Temps de réponse</p>
            <p className="text-[12px] font-black text-cm-text">{pro.responseTime || "Moins de 30 min"}</p>
          </div>
        </div>
      </div>
    </ProfileSection>
  );
}
