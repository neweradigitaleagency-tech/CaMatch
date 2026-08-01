import { useNavigate } from "react-router-dom";
import { useBackNavigation } from "../../hooks/useBackNavigation";
import { motion } from "motion/react";
import { ArrowLeft, Check } from "lucide-react";
import { useState } from "react";

const CURRENCIES = [
  { code: "XOF", label: "FCFA (XOF)", symbol: "F", country: "Côte d'Ivoire" },
  { code: "EUR", label: "Euro (EUR)", symbol: "€", country: "Europe" },
  { code: "USD", label: "Dollar US (USD)", symbol: "$", country: "États-Unis" },
];

export default function ProCurrencyPage() {
  const nav = useNavigate();
  const goBack = useBackNavigation("/pro/dashboard");
  const [selected, setSelected] = useState("XOF");

  return (
    <div className="min-h-dynamic bg-cm-bg">
      <div className="sticky top-0 z-10 bg-cm-elevated/80 backdrop-blur-lg border-b border-cm-border">
        <div className="flex items-center h-14 px-5 gap-3">
          <button type="button" onClick={goBack} className="p-1 -ml-1 cursor-pointer active:scale-[0.97]">
            <ArrowLeft className="w-5 h-5 text-cm-text" />
          </button>
          <h1 className="text-[18px] font-bold text-cm-text">Devise</h1>
        </div>
      </div>
      <div className="w-full max-w-[448px] mx-auto px-5 pt-4 pb-24">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="bg-cm-elevated border border-cm-border rounded-[14px] overflow-hidden">
          {CURRENCIES.map((c) => (
            <button key={c.code} onClick={() => setSelected(c.code)}
              className="w-full flex items-center justify-between px-5 py-4 border-b border-cm-border last:border-b-0 cursor-pointer active:scale-[0.97]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-cm-surface flex items-center justify-center text-[14px] font-bold text-cm-text-soft">{c.symbol}</div>
                <div className="text-left">
                  <p className="text-[13px] font-medium text-cm-text">{c.label}</p>
                  <p className="text-[10px] text-cm-text-muted">{c.country}</p>
                </div>
              </div>
              {selected === c.code && <Check className="w-5 h-5 text-cm-accent" />}
            </button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
