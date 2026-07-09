import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Briefcase, Clock, Languages, Award, CheckCircle, BadgeCheck, GraduationCap } from "lucide-react";
import { getCategoryLabel } from "../../constants/admin/categoryLabels";
import { MOCK_PROS } from "../../services/mockData";
import { useAuthStore } from "../../stores/authStore";

export default function ProProfessionalIdentityPage() {
  const nav = useNavigate();
  const user = useAuthStore((s) => s.user);
  const pro = MOCK_PROS.find((p) => p.id === user?.id) || MOCK_PROS[0]!;

  return (
    <div className="min-h-dynamic bg-cm-bg">
      <div className="sticky top-0 z-10 bg-cm-elevated/80 backdrop-blur-lg border-b border-cm-border">
        <div className="flex items-center h-14 px-5 gap-3">
          <button type="button" onClick={() => nav(-1)} className="p-1 -ml-1 cursor-pointer active:scale-[0.97]">
            <ArrowLeft className="w-5 h-5 text-cm-text" />
          </button>
          <h1 className="text-[18px] font-bold text-cm-text">Identité professionnelle</h1>
        </div>
      </div>
      <div className="w-full max-w-[448px] mx-auto px-5 pt-4 pb-24 space-y-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="bg-cm-elevated border border-cm-border rounded-[14px] p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
              <img src={pro.avatarUrl} alt="" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-[15px] font-bold text-cm-text">{pro.name}</p>
                {pro.isVerified && <BadgeCheck className="w-4 h-4 text-cm-accent" />}
              </div>
              <p className="text-[12px] text-cm-text-muted">{pro.title}</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-cm-elevated border border-cm-border rounded-[14px] p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-cm-accent-soft flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-cm-accent" />
            </div>
            <div>
              <p className="text-[11px] text-cm-text-muted">Catégorie</p>
              <p className="text-[13px] font-medium text-cm-text">{getCategoryLabel(pro.category) || pro.category}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-cm-accent-soft flex items-center justify-center">
              <Award className="w-4 h-4 text-cm-accent" />
            </div>
            <div>
              <p className="text-[11px] text-cm-text-muted">Titre</p>
              <p className="text-[13px] font-medium text-cm-text">{pro.title || pro.subCategory}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-cm-accent-soft flex items-center justify-center">
              <Clock className="w-4 h-4 text-cm-accent" />
            </div>
            <div>
              <p className="text-[11px] text-cm-text-muted">Expérience</p>
              <p className="text-[13px] font-medium text-cm-text">{pro.experienceYears} ans</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-cm-accent-soft flex items-center justify-center">
              <Languages className="w-4 h-4 text-cm-accent" />
            </div>
            <div>
              <p className="text-[11px] text-cm-text-muted">Langues</p>
              <p className="text-[13px] font-medium text-cm-text">{pro.languages?.join(", ") || "Français"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-cm-accent-soft flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-cm-accent" />
            </div>
            <div>
              <p className="text-[11px] text-cm-text-muted">Missions complétées</p>
              <p className="text-[13px] font-medium text-cm-text">{pro.completedInterventions}</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-cm-elevated border border-cm-border rounded-[14px] p-5">
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap className="w-4 h-4 text-cm-accent" />
            <h2 className="text-[13px] font-bold text-cm-text">Certifications</h2>
          </div>
          <div className="flex items-center gap-2 text-[12px] text-cm-text-muted">
            <span className="px-2.5 py-1 rounded-[8px] bg-cm-accent-soft text-cm-accent text-[10px] font-bold">Certifié ÇaMatch</span>
            {pro.isVerified && <span className="px-2.5 py-1 rounded-[8px] bg-green-50 text-green-600 text-[10px] font-bold">Vérifié</span>}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
