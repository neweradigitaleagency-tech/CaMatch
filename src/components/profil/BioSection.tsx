import { useState } from "react";
import ProfileSection from "./ProfileSection";
import EditableField from "./EditableField";
import type { SectionBaseProps } from "./types";

export default function BioSection({ editing, pro, onUpdate }: SectionBaseProps) {
  const [expanded, setExpanded] = useState(false);
  const bioLong = (pro.bio || "").length > 100;

  return (
    <ProfileSection>
      <div className="bg-white border border-gray-100 rounded-[20px] p-4 shadow-sm">
        <h3 className="text-[11px] font-black text-gray-700 uppercase tracking-wider mb-2">À propos</h3>
        {editing ? (
          <EditableField
            value={pro.bio || ""}
            editing
            multiline
            placeholder="Parlez de votre expérience, vos compétences..."
            onChange={(v) => onUpdate?.("bio", v)}
          />
        ) : (
          <>
            <p className="text-[13px] text-gray-600 leading-relaxed">
              {expanded || !bioLong
                ? pro.bio || "Professionnel expérimenté prêt à vous accompagner dans vos projets."
                : pro.bio?.slice(0, 100) + "..."}
            </p>
            {bioLong && (
              <button onClick={() => setExpanded(!expanded)}
                className="text-[11px] font-black text-gray-900 mt-1.5 cursor-pointer uppercase tracking-wider hover:text-gray-600 transition-colors">
                {expanded ? "Réduire" : "Lire plus"}
              </button>
            )}
          </>
        )}
      </div>
    </ProfileSection>
  );
}
