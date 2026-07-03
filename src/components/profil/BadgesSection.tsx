import { ShieldCheck, CreditCard, Clock, Star, Award } from "lucide-react";
import ProfileSection from "./ProfileSection";
import type { Badge } from "../../types";

const PREMIUM_BADGES = [
  { name: "Identité vérifiée", icon: ShieldCheck },
  { name: "Paiement sécurisé", icon: CreditCard },
  { name: "Intervention rapide", icon: Clock },
  { name: "100% satisfaction", icon: Star },
  { name: "Certifié ÇaMatch", icon: Award },
];

interface BadgesSectionProps {
  badges?: Badge[];
}

export default function BadgesSection({ badges }: BadgesSectionProps) {
  return (
    <ProfileSection>
      <div className="bg-white border border-gray-100 rounded-[20px] p-4 shadow-sm">
        <div className="flex items-center gap-1.5 mb-3">
          <Award className="w-4 h-4 text-gray-700" />
          <h3 className="text-[11px] font-black text-gray-700 uppercase tracking-wider">
            Badges {(badges?.length || 0) > 0 ? `(${badges!.length + PREMIUM_BADGES.length})` : `(${PREMIUM_BADGES.length})`}
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {badges?.map((badge) => (
            <div key={badge.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-[10px] border border-gray-100" title={badge.description}>
              <span className="text-[14px]">{badge.icon}</span>
              <span className="text-[11px] font-black text-gray-700">{badge.name}</span>
            </div>
          ))}
          {PREMIUM_BADGES.map((badge, i) => {
            const Icon = badge.icon;
            return (
              <div key={`premium-${i}`} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-[10px] border border-emerald-100">
                <Icon className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[11px] font-black text-emerald-700">{badge.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </ProfileSection>
  );
}
