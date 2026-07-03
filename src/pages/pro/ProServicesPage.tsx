import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Plus, Power } from "lucide-react";
import { useState } from "react";
import { MOCK_PROS, MOCK_SERVICES } from "../../services/mockData";

export default function ProServicesPage() {
  const nav = useNavigate();
  const myServices = MOCK_SERVICES.filter((s) => s.proId === "pro6");
  const [activeIds, setActiveIds] = useState<string[]>(myServices.map((s) => s.id));

  const toggle = (id: string) => {
    setActiveIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-dynamic bg-cm-bg">
      <div className="sticky top-0 z-10 bg-cm-elevated/80 backdrop-blur-lg border-b border-cm-border">
        <div className="flex items-center justify-between h-14 px-5">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => nav(-1)} className="p-1 -ml-1 cursor-pointer active:scale-[0.97]">
              <ArrowLeft className="w-5 h-5 text-cm-text" />
            </button>
            <h1 className="text-[18px] font-bold text-cm-text">Services</h1>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-cm-accent text-white text-[12px] font-semibold rounded-full cursor-pointer active:scale-[0.97]">
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter</span>
          </button>
        </div>
      </div>
      <div className="w-full max-w-[448px] mx-auto px-5 pt-4 pb-24 space-y-3">
        {myServices.map((svc, i) => {
          const isActive = activeIds.includes(svc.id);
          return (
            <motion.div
              key={svc.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-cm-elevated border border-cm-border rounded-[14px] p-4 flex items-center justify-between"
            >
              <div className="flex-1 min-w-0 pr-3">
                <h3 className="text-[14px] font-bold text-cm-text truncate">{svc.name}</h3>
                <p className="text-[11px] text-cm-text-muted mt-0.5 line-clamp-2">{svc.description}</p>
                <p className="text-[13px] font-bold text-cm-accent mt-1 font-mono">
                  {svc.priceEstimateXOF.toLocaleString("fr-FR")} F
                </p>
              </div>
              <button
                onClick={() => toggle(svc.id)}
                className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer active:scale-[0.97] transition-colors ${
                  isActive ? "bg-green-500/15 text-green-600" : "bg-cm-border text-cm-text-muted"
                }`}
              >
                <Power className={`w-4 h-4 ${isActive ? "fill-green-500" : ""}`} />
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
