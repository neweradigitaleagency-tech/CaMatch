import { useNavigate } from "react-router-dom";
import { useBackNavigation } from "../../hooks/useBackNavigation";
import { motion } from "motion/react";
import { ArrowLeft, ChevronRight } from "lucide-react";

export default function ProAboutPage() {
  const nav = useNavigate();
  const goBack = useBackNavigation("/pro/dashboard");

  return (
    <div className="min-h-dynamic bg-cm-bg">
      <div className="sticky top-0 z-10 bg-cm-elevated/80 backdrop-blur-lg border-b border-cm-border">
        <div className="flex items-center h-14 px-5 gap-3">
          <button type="button" onClick={goBack} className="p-1 -ml-1 cursor-pointer active:scale-[0.97]">
            <ArrowLeft className="w-5 h-5 text-cm-text" />
          </button>
          <h1 className="text-[18px] font-bold text-cm-text">À propos</h1>
        </div>
      </div>

      <div className="w-full max-w-[448px] mx-auto px-5 pt-8 pb-24 space-y-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <img src="/logo.svg" alt="Ça Match" className="h-16 mx-auto mb-4" />
          <h2 className="text-[22px] font-bold text-cm-text">Ça Match</h2>
          <p className="text-[12px] text-cm-text-muted mt-1">Version 1.0.0</p>
          <p className="text-[12px] text-cm-text-muted mt-3 max-w-xs mx-auto leading-relaxed">
            La plateforme qui connecte les professionnels et les clients pour tous vos services du quotidien en Côte d'Ivoire.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-cm-elevated border border-cm-border rounded-[14px] overflow-hidden"
        >
          <button className="w-full flex items-center justify-between px-5 py-3.5 border-b border-cm-border cursor-pointer active:scale-[0.97]">
            <span className="text-[13px] text-cm-text">Conditions d'utilisation</span>
            <ChevronRight className="w-4 h-4 text-cm-text-muted" />
          </button>
          <button className="w-full flex items-center justify-between px-5 py-3.5 border-b border-cm-border cursor-pointer active:scale-[0.97]">
            <span className="text-[13px] text-cm-text">Politique de confidentialité</span>
            <ChevronRight className="w-4 h-4 text-cm-text-muted" />
          </button>
          <button className="w-full flex items-center justify-between px-5 py-3.5 cursor-pointer active:scale-[0.97]">
            <span className="text-[13px] text-cm-text">Licences</span>
            <ChevronRight className="w-4 h-4 text-cm-text-muted" />
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="pt-4"
        >
          <p className="text-[12px] text-cm-text-muted">
            Développé avec <span className="text-red-500">❤</span> en Côte d'Ivoire
          </p>
          <p className="text-[11px] text-cm-text-muted mt-1">© 2026 Ça Match. Tous droits réservés.</p>
        </motion.div>
      </div>
    </div>
  );
}
