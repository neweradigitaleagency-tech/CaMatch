import { useMemo } from "react";
import { motion } from "motion/react";
import { MapPin, ShieldCheck, Award } from "lucide-react";
import EditableField from "./EditableField";
import type { SectionBaseProps } from "./types";

export default function InfoCardSection({ mode, editing, pro, onUpdate }: SectionBaseProps) {
  const distance = useMemo(() => {
    const hash = pro.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    return ((hash % 50) / 10 + 0.3).toFixed(1);
  }, [pro.id]);

  const trustColor = !pro.trustScore ? "bg-gray-200" : pro.trustScore >= 85 ? "bg-emerald-500" : pro.trustScore >= 70 ? "bg-emerald-400" : pro.trustScore >= 50 ? "bg-amber-400" : "bg-red-400";
  const trustLabel = !pro.trustScore ? "Non évalué" : pro.trustScore >= 85 ? "Excellent" : pro.trustScore >= 70 ? "Fiable" : pro.trustScore >= 50 ? "En progression" : "À améliorer";

  return (
    <section className="px-4 -mt-3 relative z-10">
      <div className="bg-white border border-gray-100 rounded-[20px] p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[16px] font-black text-gray-900 tracking-tight">{pro.name}</h2>
          <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 rounded-full border border-emerald-200">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span className="text-[8px] font-black text-emerald-700 uppercase tracking-wider">Agréé</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <div className="flex items-center gap-1 text-gray-500">
            <MapPin className="w-3 h-3" />
            {editing ? (
              <EditableField value={pro.locationNeighborhood} editing placeholder="Localisation" onChange={(v) => onUpdate?.("locationNeighborhood", v)} />
            ) : (
              <span className="font-semibold">{pro.locationNeighborhood}</span>
            )}
          </div>
          <div className="flex items-center gap-1 text-gray-400">
            <div className="w-1 h-1 rounded-full bg-gray-300" />
            <span className="font-semibold">À {distance} km</span>
          </div>
          <div className="flex items-center gap-1 text-gray-400">
            <div className="w-1 h-1 rounded-full bg-gray-300" />
            <span className="font-semibold">{pro.completedInterventions} missions</span>
          </div>
        </div>

        {pro.trustScore != null && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[10px] font-black text-gray-700 uppercase tracking-wider">Score de confiance</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-black text-gray-900">{pro.trustScore}%</span>
                <span className="text-[8px] font-bold text-gray-400 uppercase">{trustLabel}</span>
              </div>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pro.trustScore}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-full rounded-full ${trustColor}`}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
