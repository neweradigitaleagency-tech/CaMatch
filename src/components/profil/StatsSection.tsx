import ProfileSection from "./ProfileSection";
import { StarRating } from "../ui/ProCard";
import type { SectionBaseProps } from "./types";

export default function StatsSection({ pro }: SectionBaseProps) {
  const rating = pro.rating / 10;

  return (
    <ProfileSection>
      <div className="grid grid-cols-4 gap-0.5 py-2.5 px-2 rounded-2xl bg-amber-50/60 items-center justify-items-center text-center">
        <div className="flex flex-col items-center">
          <StarRating rating={rating} size="sm" />
          <span className="text-[8px] font-black uppercase tracking-wider mt-0.5 text-cm-text-muted">Note</span>
        </div>
        <div className="flex flex-col items-center border-x border-cm-border/40 w-full">
          <span className="text-[11px] font-black text-cm-text">{pro.completedInterventions}</span>
          <span className="text-[8px] font-black uppercase tracking-wider mt-0.5 text-cm-text-muted">Missions</span>
        </div>
        <div className="flex flex-col items-center border-r border-cm-border/40 w-full">
          <span className="text-[11px] font-black text-cm-text">{pro.reviewCount}</span>
          <span className="text-[8px] font-black uppercase tracking-wider mt-0.5 text-cm-text-muted">Avis</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[11px] font-black text-cm-text">{pro.clientCount || Math.round(pro.completedInterventions * 0.85)}</span>
          <span className="text-[8px] font-black uppercase tracking-wider mt-0.5 text-cm-text-muted">Clients</span>
        </div>
      </div>
    </ProfileSection>
  );
}
