import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBackNavigation } from "../hooks/useBackNavigation";
import { motion } from "motion/react";
import { ArrowLeft, User, Briefcase, Store, Star, MapPin, Mail, Phone, Settings, Shield, Package, CreditCard } from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import { getProfile, type UnifiedProfile } from "../services/profile.service";
import BentoCard from "../components/ui/BentoCard";
import { formatXOF } from "../utils/format";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const itemAnim = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 24 } },
};

type RoleTab = "client" | "professional" | "supplier";

const TAB_CONFIG: Record<RoleTab, { label: string; icon: React.ReactNode }> = {
  client: { label: "Client", icon: <User className="w-4 h-4" /> },
  professional: { label: "Pro", icon: <Briefcase className="w-4 h-4" /> },
  supplier: { label: "Boutique", icon: <Store className="w-4 h-4" /> },
};

function ClientProfile({ data }: { data: Record<string, unknown> | undefined }) {
  return (
    <div className="space-y-3">
      <BentoCard className="p-4">
        <p className="text-[12px] font-semibold text-cm-text mb-3">Informations client</p>
        <div className="space-y-2 text-[12px]">
          <div className="flex justify-between">
            <span className="text-cm-text-muted">Points fidélité</span>
            <span className="font-medium">{(data?.loyalty_points as number) ?? 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-cm-text-muted">Méthode de paiement</span>
            <span className="font-medium">{(data?.preferred_payment_method as string) ?? "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-cm-text-muted">Missions confiées</span>
            <span className="font-medium">{0}</span>
          </div>
        </div>
      </BentoCard>
    </div>
  );
}

function ProfessionalProfile({ data }: { data: Record<string, unknown> | undefined }) {
  return (
    <div className="space-y-3">
      <BentoCard className="p-4">
        <p className="text-[12px] font-semibold text-cm-text mb-3">Profil professionnel</p>
        <div className="space-y-2 text-[12px]">
          {data?.business_name ? (
            <div className="flex justify-between">
              <span className="text-cm-text-muted">Enseigne</span>
              <span className="font-medium">{String(data.business_name)}</span>
            </div>
          ) : null}
          {data?.bio ? (
            <p className="text-cm-text-muted italic mt-1">{String(data.bio).slice(0, 100)}</p>
          ) : null}
          <div className="flex justify-between">
            <span className="text-cm-text-muted">Tarif horaire</span>
            <span className="font-medium">{data?.hourly_rate ? formatXOF(data.hourly_rate as number) : "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-cm-text-muted">Niveau vérification</span>
            <span className="font-medium">{(data?.verification_level as string) ?? "none"}</span>
          </div>
        </div>
      </BentoCard>
    </div>
  );
}

function SupplierProfile({ data }: { data: Record<string, unknown> | undefined }) {
  return (
    <div className="space-y-3">
      <BentoCard className="p-4">
        <p className="text-[12px] font-semibold text-cm-text mb-3">Profil boutique</p>
        <div className="space-y-2 text-[12px]">
          {data?.company_name ? (
            <div className="flex justify-between">
              <span className="text-cm-text-muted">Enseigne</span>
              <span className="font-medium">{String(data.company_name)}</span>
            </div>
          ) : null}
          <div className="flex justify-between">
            <span className="text-cm-text-muted">Produits</span>
            <span className="font-medium">{(data?.total_products as number) ?? 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-cm-text-muted">Commandes</span>
            <span className="font-medium">{(data?.total_orders as number) ?? 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-cm-text-muted">Statut</span>
            <span className="font-medium">{(data?.status as string) ?? "—"}</span>
          </div>
        </div>
      </BentoCard>
    </div>
  );
}

export default function UnifiedProfilePage() {
  const nav = useNavigate();
  const goBack = useBackNavigation("/");
  const { userId } = useAuthStore();
  const [profile, setProfile] = useState<UnifiedProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<RoleTab>("client");

  useEffect(() => {
    async function load() {
      if (!userId) return;
      const p = await getProfile(userId);
      setProfile(p);
      if (p && p.profileTypes.length > 0) {
        setActiveTab(p.profileTypes[0] as RoleTab);
      }
      setLoading(false);
    }
    load();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-dynamic bg-cm-bg flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-cm-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-dynamic bg-cm-bg flex items-center justify-center">
        <p className="text-sm text-cm-text-muted">Profil introuvable</p>
      </div>
    );
  }

  const availableTabs = profile.profileTypes.filter((t): t is RoleTab =>
    ["client", "professional", "supplier"].includes(t)
  );

  return (
    <div className="min-h-dynamic bg-cm-bg pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-cm-bg/80 backdrop-blur-xl border-b border-cm-border/40">
        <div className="px-4 pt-3 pb-3">
          <div className="flex items-center gap-2 mb-2">
            <button onClick={goBack}
              className="cm-scale-btn p-1 cursor-pointer active:scale-[0.97] transition-transform touch-min shrink-0">
              <ArrowLeft className="w-4 h-4 text-cm-text" />
            </button>
            <h1 className="text-[15px] font-display font-bold text-cm-text">Mon profil</h1>
            <button onClick={() => nav("/profile/settings")}
              className="ml-auto cm-scale-btn w-8 h-8 flex items-center justify-center rounded-[12px] bg-cm-elevated hover:bg-cm-border/50 cursor-pointer">
              <Settings className="w-4 h-4 text-cm-text" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-4">
        {/* Avatar + Name */}
        <motion.div variants={container} initial="hidden" animate="show" className="mt-4 mb-5">
          <motion.div variants={itemAnim} className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-cm-accent/10 border-2 border-cm-accent/20 flex items-center justify-center mb-3">
              <User className="w-10 h-10 text-cm-accent" />
            </div>
            <h2 className="text-[18px] font-bold text-cm-text">{profile.displayName}</h2>
            <div className="flex items-center gap-3 mt-1.5 text-[12px] text-cm-text-muted">
              {profile.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {profile.city}
                </span>
              )}
              {profile.rating > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {profile.rating.toFixed(1)}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" /> {profile.totalJobs} mission{profile.totalJobs !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-[11px] text-cm-text-muted">
              <Mail className="w-3 h-3" /> {profile.email}
              {profile.phone && (
                <>
                  <span className="text-cm-border">·</span>
                  <Phone className="w-3 h-3" /> {profile.phone}
                </>
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* Role Tabs */}
        {availableTabs.length > 1 && (
          <div className="flex gap-1.5 mb-4 overflow-x-auto no-scrollbar">
            {availableTabs.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab
                    ? "bg-cm-accent text-white"
                    : "bg-cm-elevated border border-cm-border text-cm-text-muted hover:border-cm-accent/30"
                }`}>
                {TAB_CONFIG[tab].icon}
                {TAB_CONFIG[tab].label}
              </button>
            ))}
          </div>
        )}

        {/* Trust score summary */}
        {profile.trustScores && (
          <motion.div variants={itemAnim} className="mb-4">
            <BentoCard className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-3.5 h-3.5 text-cm-text-muted" />
                <span className="text-[11px] font-semibold text-cm-text">Score de confiance</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[22px] font-bold text-cm-accent">
                  {(profile.trustScores as any).overall ?? "—"}
                </span>
                <span className="text-[11px] text-cm-text-muted">/100</span>
                <div className="flex gap-2 ml-auto">
                  {(["kyc", "activity", "payment_reliability"] as const).map((key) => (
                    <div key={key} className="text-center">
                      <p className="text-[10px] text-cm-text-muted uppercase">{key === "kyc" ? "KYC" : key === "activity" ? "Act." : "Paiem."}</p>
                      <p className="text-[11px] font-semibold">{(profile.trustScores as any)[key] ?? 0}</p>
                    </div>
                  ))}
                </div>
              </div>
            </BentoCard>
          </motion.div>
        )}

        {/* Active tab content */}
        <motion.div variants={container} initial="hidden" animate="show" key={activeTab}>
          {activeTab === "client" && <ClientProfile data={profile.clientData} />}
          {activeTab === "professional" && <ProfessionalProfile data={profile.professionalData} />}
          {activeTab === "supplier" && <SupplierProfile data={profile.supplierData} />}
        </motion.div>
      </div>
    </div>
  );
}
