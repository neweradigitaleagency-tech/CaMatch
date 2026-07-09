import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Moon, Sun, Eye } from "lucide-react";
import { useState } from "react";

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${enabled ? "bg-cm-accent" : "bg-cm-border"}`}>
      <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${enabled ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

export default function ProAppearancePage() {
  const nav = useNavigate();
  const [themeDark, setThemeDark] = useState(false);

  return (
    <div className="min-h-dynamic bg-cm-bg">
      <div className="sticky top-0 z-10 bg-cm-elevated/80 backdrop-blur-lg border-b border-cm-border">
        <div className="flex items-center h-14 px-5 gap-3">
          <button type="button" onClick={() => nav(-1)} className="p-1 -ml-1 cursor-pointer active:scale-[0.97]">
            <ArrowLeft className="w-5 h-5 text-cm-text" />
          </button>
          <h1 className="text-[18px] font-bold text-cm-text">Affichage</h1>
        </div>
      </div>
      <div className="w-full max-w-[448px] mx-auto px-5 pt-4 pb-24 space-y-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="bg-cm-elevated border border-cm-border rounded-[14px] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon className="w-4 h-4 text-cm-accent" />
              <span className="text-[13px] text-cm-text">Mode sombre</span>
            </div>
            <Toggle enabled={themeDark} onChange={() => setThemeDark(!themeDark)} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sun className="w-4 h-4 text-cm-accent" />
              <span className="text-[13px] text-cm-text">Mode clair</span>
            </div>
            <Toggle enabled={!themeDark} onChange={() => setThemeDark(false)} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye className="w-4 h-4 text-cm-accent" />
              <span className="text-[13px] text-cm-text">Police agrandie</span>
            </div>
            <Toggle enabled={false} onChange={() => {}} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
