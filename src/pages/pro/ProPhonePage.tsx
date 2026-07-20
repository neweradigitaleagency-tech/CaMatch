import { useNavigate } from "react-router-dom";
import { useBackNavigation } from "../../hooks/useBackNavigation";
import { motion } from "motion/react";
import { ArrowLeft, Smartphone, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function ProPhonePage() {
  const nav = useNavigate();
  const goBack = useBackNavigation("/pro/dashboard");
  const [phone, setPhone] = useState("+225 07 59 66 509");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-dynamic bg-cm-bg">
      <div className="sticky top-0 z-10 bg-cm-elevated/80 backdrop-blur-lg border-b border-cm-border">
        <div className="flex items-center h-14 px-5 gap-3">
          <button type="button" onClick={goBack} className="p-1 -ml-1 cursor-pointer active:scale-[0.97]">
            <ArrowLeft className="w-5 h-5 text-cm-text" />
          </button>
          <h1 className="text-[18px] font-bold text-cm-text">Téléphone</h1>
        </div>
      </div>
      <div className="w-full max-w-[448px] mx-auto px-5 pt-4 pb-24 space-y-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="bg-cm-elevated border border-cm-border rounded-[14px] p-5 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <Smartphone className="w-5 h-5 text-cm-accent" />
            <p className="text-[13px] text-cm-text">Numéro de téléphone</p>
          </div>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full h-12 px-4 text-[15px] bg-cm-bg border border-cm-border rounded-[12px] outline-none text-cm-text"
          />
          <p className="text-[11px] text-cm-text-muted">Un code de vérification vous sera envoyé par SMS.</p>
        </motion.div>
        <button onClick={handleSave}
          className="w-full h-12 rounded-[14px] bg-cm-text text-white text-[13px] font-bold cursor-pointer active:scale-[0.97] transition-all flex items-center justify-center gap-2">
          {saved ? <><CheckCircle className="w-4 h-4" /> Enregistré</> : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}
