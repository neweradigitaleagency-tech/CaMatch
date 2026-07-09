import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Plus, Trash2, Smartphone } from "lucide-react";
import { useState } from "react";
import { PAYMENT_METHODS } from "../../data/plans";

export default function ProPaymentMethodsPage() {
  const nav = useNavigate();
  const [methods] = useState(["orange_money", "mtn_momo", "wave"]);

  return (
    <div className="min-h-dynamic bg-cm-bg">
      <div className="sticky top-0 z-10 bg-cm-elevated/80 backdrop-blur-lg border-b border-cm-border">
        <div className="flex items-center h-14 px-5 gap-3">
          <button type="button" onClick={() => nav(-1)} className="p-1 -ml-1 cursor-pointer active:scale-[0.97]">
            <ArrowLeft className="w-5 h-5 text-cm-text" />
          </button>
          <h1 className="text-[18px] font-bold text-cm-text">Moyens de paiement</h1>
        </div>
      </div>
      <div className="w-full max-w-[448px] mx-auto px-5 pt-4 pb-24 space-y-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="bg-cm-elevated border border-cm-border rounded-[14px] overflow-hidden">
          {methods.map((m) => {
            const pm = PAYMENT_METHODS.find((p) => p.value === m);
            return (
              <div key={m} className="flex items-center justify-between px-5 py-3.5 border-b border-cm-border last:border-b-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-cm-accent-soft flex items-center justify-center text-[16px]">{pm?.icon || "📱"}</div>
                  <span className="text-[13px] text-cm-text">{pm?.label || m}</span>
                </div>
                <button className="text-red-400 cursor-pointer active:scale-[0.97]">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </motion.div>
        <button className="w-full flex items-center justify-center gap-2 h-11 rounded-[14px] border-2 border-dashed border-cm-border text-cm-accent text-[12px] font-semibold cursor-pointer active:scale-[0.97] hover:border-cm-accent transition-colors">
          <Plus className="w-4 h-4" /> Ajouter un moyen de paiement
        </button>
      </div>
    </div>
  );
}
