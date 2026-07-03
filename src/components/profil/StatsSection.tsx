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
          <span className="text-[8px] font-black uppercase tracking-wider mt-0.5 text-gray-400">Note</span>
        </div>
        <div className="flex flex-col items-center border-x border-gray-200/50 w-full">
          <span className="text-[11px] font-black text-gray-800">{pro.completedInterventions}</span>
          <span className="text-[8px] font-black uppercase tracking-wider mt-0.5 text-gray-400">Missions</span>
        </div>
        <div className="flex flex-col items-center border-r border-gray-200/50 w-full">
          <span className="text-[11px] font-black text-gray-800">{pro.reviewCount}</span>
          <span className="text-[8px] font-black uppercase tracking-wider mt-0.5 text-gray-400">Avis</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[11px] font-black text-gray-800">{pro.clientCount || Math.round(pro.completedInterventions * 0.85)}</span>
          <span className="text-[8px] font-black uppercase tracking-wider mt-0.5 text-gray-400">Clients</span>
        </div>
      </div>
    </ProfileSection>
  );
}
