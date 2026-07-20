import { useNavigate } from "react-router-dom";
import { Package, Store, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import BentoCard from "./BentoCard";

const itemAnim = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 24 } },
};

interface CrossLinkSuggestionsProps {
  clientCity?: string;
  missionId?: string;
}

export default function CrossLinkSuggestions({ clientCity }: CrossLinkSuggestionsProps) {
  const nav = useNavigate();

  return (
    <motion.div variants={itemAnim} className="space-y-2">
      <p className="text-[12px] font-semibold text-cm-text-muted uppercase tracking-wide px-1">Liens utiles</p>

      <BentoCard className="p-3 hover:border-cm-accent/30 transition-colors cursor-pointer" onClick={() => nav("/catalog")}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-cm-border-soft flex items-center justify-center">
              <Package className="w-4 h-4 text-cm-text-muted" />
            </div>
            <div>
              <p className="text-[12px] font-semibold text-cm-text">Catalogue produits</p>
              <p className="text-[10px] text-cm-text-muted">
                {clientCity
                  ? `Fournisseurs livrant à ${clientCity}`
                  : "Matériaux, équipements, fournitures"}
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-cm-text-muted shrink-0" />
        </div>
      </BentoCard>

      <BentoCard className="p-3 hover:border-cm-accent/30 transition-colors cursor-pointer" onClick={() => nav("/catalog")}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-cm-border-soft flex items-center justify-center">
              <Store className="w-4 h-4 text-cm-text-muted" />
            </div>
            <div>
              <p className="text-[12px] font-semibold text-cm-text">Boutiques partenaires</p>
              <p className="text-[10px] text-cm-text-muted">Trouver des fournisseurs près de chez vous</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-cm-text-muted shrink-0" />
        </div>
      </BentoCard>
    </motion.div>
  );
}
