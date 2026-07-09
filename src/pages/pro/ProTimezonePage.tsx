import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Check } from "lucide-react";
import { useState } from "react";

const TIMEZONES = [
  { value: "Africa/Abidjan", label: "Abidjan (GMT+0)", offset: "UTC+0" },
  { value: "Africa/Dakar", label: "Dakar (GMT+0)", offset: "UTC+0" },
  { value: "Europe/Paris", label: "Paris (CET)", offset: "UTC+1" },
  { value: "Africa/Lagos", label: "Lagos (WAT)", offset: "UTC+1" },
  { value: "Africa/Nairobi", label: "Nairobi (EAT)", offset: "UTC+3" },
];

export default function ProTimezonePage() {
  const nav = useNavigate();
  const [selected, setSelected] = useState("Africa/Abidjan");

  return (
    <div className="min-h-dynamic bg-cm-bg">
      <div className="sticky top-0 z-10 bg-cm-elevated/80 backdrop-blur-lg border-b border-cm-border">
        <div className="flex items-center h-14 px-5 gap-3">
          <button type="button" onClick={() => nav(-1)} className="p-1 -ml-1 cursor-pointer active:scale-[0.97]">
            <ArrowLeft className="w-5 h-5 text-cm-text" />
          </button>
          <h1 className="text-[18px] font-bold text-cm-text">Fuseau horaire</h1>
        </div>
      </div>
      <div className="w-full max-w-[448px] mx-auto px-5 pt-4 pb-24">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="bg-cm-elevated border border-cm-border rounded-[14px] overflow-hidden">
          {TIMEZONES.map((tz) => (
            <button key={tz.value} onClick={() => setSelected(tz.value)}
              className="w-full flex items-center justify-between px-5 py-4 border-b border-cm-border last:border-b-0 cursor-pointer active:scale-[0.97]">
              <div className="text-left">
                <p className="text-[13px] font-medium text-cm-text">{tz.label}</p>
                <p className="text-[10px] text-cm-text-muted">{tz.offset}</p>
              </div>
              {selected === tz.value && <Check className="w-5 h-5 text-cm-accent" />}
            </button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
