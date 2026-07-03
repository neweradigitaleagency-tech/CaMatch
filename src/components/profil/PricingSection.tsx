import ProfileSection from "./ProfileSection";
import EditableField from "./EditableField";
import type { SectionBaseProps } from "./types";

export default function PricingSection({ mode, editing, pro, onUpdate }: SectionBaseProps) {
  const rows = [
    { label: "Taux horaire", price: pro.hourlyRateXOF, key: "hourlyRateXOF", highlighted: false },
    { label: "Déplacement", price: 5000, key: "travelFeeXOF", highlighted: false },
    { label: "Forfait 2h", price: pro.hourlyRateXOF * 2 + 5000, key: null, highlighted: true },
    { label: "Forfait 4h", price: pro.hourlyRateXOF * 4 + 5000, key: null, highlighted: false },
    { label: "Journée (8h)", price: pro.hourlyRateXOF * 8 + 5000, key: null, highlighted: false },
  ];

  return (
    <ProfileSection title="Tarifs">
      <div className="bg-white border border-gray-100 rounded-[20px] p-4 shadow-sm">
        {rows.map((row, i) => (
          <div key={row.label}
            className={`flex items-center justify-between py-2.5 ${i > 0 ? "border-t border-gray-100" : ""} ${row.highlighted ? "px-3 -mx-3 bg-gray-900 rounded-[12px] text-white border-t-0 mt-1.5 mb-1.5" : "px-0"}`}>
            <span className={`text-[12px] font-bold ${row.highlighted ? "text-white" : "text-gray-600"}`}>{row.label}</span>
            {editing && row.key ? (
              <EditableField
                value={row.price}
                editing
                type="number"
                suffix="F"
                onChange={(v) => onUpdate?.(row.key!, v)}
              />
            ) : (
              <span className={`text-[14px] font-black tracking-tight ${row.highlighted ? "text-white" : "text-gray-900"}`}>
                {row.price.toLocaleString("fr-FR")} <span className={`text-[9px] font-bold ${row.highlighted ? "text-white/70" : "text-gray-400"}`}>F</span>
              </span>
            )}
          </div>
        ))}
      </div>
    </ProfileSection>
  );
}
