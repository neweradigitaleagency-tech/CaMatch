import { Star, MapPin, Clock, ShieldCheck, Timer } from "lucide-react";
import type { Proposal } from "../../types";
import { VerifiedBadge } from "../ui";
import { motion } from "motion/react";

interface ProposalCardProps {
  proposal: Proposal;
  onViewDetails: () => void;
  index: number;
}

export default function ProposalCard({ proposal, onViewDetails, index }: ProposalCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="bg-cm-elevated rounded-2xl border border-cm-border overflow-hidden"
    >
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-cm-bg border border-cm-border overflow-hidden shrink-0">
            {proposal.professionalAvatar ? (
              <img src={proposal.professionalAvatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-cm-text font-bold text-[16px]">
                {proposal.professionalName.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-[13px] font-bold text-cm-text truncate">{proposal.professionalName}</p>
              {proposal.isVerified && <VerifiedBadge className="scale-75 origin-left" />}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="flex items-center gap-0.5">
                <Star className="w-3 h-3 text-cm-amber fill-cm-amber" />
                <span className="text-[11px] font-bold text-cm-text">{proposal.professionalRating}</span>
              </div>
              <span className="text-[9px] text-cm-text-muted">•</span>
              <div className="flex items-center gap-0.5">
                <ShieldCheck className="w-3 h-3 text-cm-accent" />
                <span className="text-[10px] text-cm-text-muted">Trust {Math.round(proposal.trustScore * 100)}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[10px] text-cm-text-muted">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {proposal.distanceKm <= 1
              ? `${Math.round(proposal.distanceKm * 1000)} m`
              : `${proposal.distanceKm} km`}
          </div>
          <div className="flex items-center gap-1">
            <Timer className="w-3 h-3" />
            ~{proposal.estimatedArrivalMinutes} min
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {proposal.estimatedDurationMins} min
          </div>
        </div>

        <div className="h-px bg-cm-border" />

        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-cm-text-muted">Main-d'œuvre</span>
            <span className="font-bold text-cm-text font-mono">{proposal.laborPriceXOF.toLocaleString()} F</span>
          </div>
          {proposal.materialsCostXOF > 0 && (
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-cm-text-muted">Matériaux</span>
              <span className="font-bold text-cm-text font-mono">{proposal.materialsCostXOF.toLocaleString()} F</span>
            </div>
          )}
          {proposal.materialsDeliveryXOF > 0 && (
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-cm-text-muted">Livraison</span>
              <span className="font-bold text-cm-text font-mono">{proposal.materialsDeliveryXOF.toLocaleString()} F</span>
            </div>
          )}
          <div className="flex items-center justify-between text-[13px] pt-1 border-t border-cm-border">
            <span className="font-bold text-cm-text">Total</span>
            <span className="font-bold text-cm-text font-mono text-[15px]">{proposal.totalXOF.toLocaleString()} F</span>
          </div>
        </div>
      </div>

      <button
        onClick={onViewDetails}
        className="w-full py-3 bg-cm-text text-white text-[12px] font-bold hover:opacity-90 transition-all cursor-pointer active:scale-[0.99]"
      >
        Voir les détails
      </button>
    </motion.div>
  );
}
