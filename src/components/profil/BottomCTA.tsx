import { motion } from "motion/react";
import type { BottomCTAProps } from "./types";

export default function BottomCTA({
  mode, editing, hasSelectedServices, selectedCount, onInitiateMatch, onSave,
}: BottomCTAProps) {
  if (mode === "owner") {
    if (editing) {
      return (
        <div className="sticky bottom-0 left-0 right-0 z-30 px-4 pb-6 pt-3 bg-gradient-to-t from-white via-white to-transparent">
          <button onClick={onSave}
            className="w-full h-12 rounded-[14px] bg-cm-text text-white text-[12px] font-black uppercase tracking-wider cursor-pointer active:scale-[0.98] hover:bg-cm-text/90 shadow-lg shadow-black/10 transition-all">
            Enregistrer les modifications
          </button>
        </div>
      );
    }
    return null;
  }

  if (mode === "preview") {
    return (
      <div className="sticky bottom-0 left-0 right-0 z-30 px-4 pb-6 pt-3 bg-gradient-to-t from-white via-white to-transparent">
        <button onClick={onInitiateMatch}
          className="w-full h-12 rounded-[14px] bg-cm-text text-white text-[12px] font-black uppercase tracking-wider cursor-pointer active:scale-[0.98] hover:bg-cm-text/90 shadow-lg shadow-black/10 transition-all">
          {hasSelectedServices ? "Voir le récapitulatif" : "Prendre RDV"}
        </button>
      </div>
    );
  }

  // Client mode
  return (
    <div className="sticky bottom-0 left-0 right-0 z-30 px-4 pb-6 pt-3 bg-gradient-to-t from-white via-white to-transparent">
      <div className="flex items-center gap-3">
        <button onClick={onInitiateMatch}
          className="flex-1 h-12 rounded-[14px] bg-cm-text text-white text-[12px] font-black uppercase tracking-wider cursor-pointer active:scale-[0.98] hover:bg-cm-text/90 shadow-lg shadow-black/10 transition-all">
          {hasSelectedServices ? "Voir le récapitulatif" : "Prendre RDV"}
        </button>
      </div>
    </div>
  );
}
