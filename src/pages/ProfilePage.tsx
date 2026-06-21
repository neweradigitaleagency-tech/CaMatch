import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Briefcase, ChevronRight, User, Shield, Wallet, CreditCard, Calendar, Bell, HelpCircle } from "lucide-react";
import ClientProfileScreen from "../components/ClientProfileScreen";
import ProOnboardingScreen from "../components/ProOnboardingScreen";
import { useAuthStore } from "../stores/authStore";
import type { OnboardingData } from "../types";
import { supabase } from "../services/supabase";

const PRO_MENU_ITEMS = [
  { id: "pro-edit", label: "Modifier mon profil pro", icon: User, desc: "Bio, services, tarifs, disponibilités" },
  { id: "pro-verification", label: "Vérification", icon: Shield, desc: "CNI, casier judiciaire, certifications" },
  { id: "pro-finances", label: "Finances & Revenus", icon: Wallet, desc: "Gains, historique des paiements, retraits" },
  { id: "pro-subscription", label: "Abonnement", icon: CreditCard, desc: "Forfait mensuel, avantages" },
  { id: "pro-planning", label: "Planning", icon: Calendar, desc: "Gérer mes disponibilités" },
  { id: "pro-notifications", label: "Notifications", icon: Bell, desc: "Alertes missions, rappels" },
  { id: "pro-help", label: "Aide & Support", icon: HelpCircle, desc: "FAQ, contacter l'équipe" },
];

export default function ProfilePage() {
  const nav = useNavigate();
  const isPro = useAuthStore((s) => s.isPro);
  const setPro = useAuthStore((s) => s.setPro);
  const logout = useAuthStore((s) => s.logout);
  const userId = useAuthStore((s) => s.userId);
  const [showProOnboarding, setShowProOnboarding] = useState(false);
  const [saving, setSaving] = useState(false);

  const openNavigateTo = (screen: string) => {
    const map: Record<string, string> = {
      "edit-profile": "/profile/pro/edit",
      "payments": "/profile/payments",
      "addresses": "/profile/addresses",
      "settings": "/profile/settings",
      "notifications": "/profile/notifications",
      "help": "/profile/help",
    };
    nav(map[screen] || `/profile/${screen}`);
  };

  const handleLogout = async () => {
    await logout();
    nav("/onboarding", { replace: true });
  };

  const handleProOnboardingComplete = async (data: OnboardingData) => {
    setSaving(true);
    try {
      await supabase.from("professional_profiles").insert({
        user_id: userId || "demo",
        first_name: data.firstName,
        last_name: data.lastName,
        category: data.category || "electricity",
        hourly_rate: data.hourlyRateXOF || 10000,
        min_job_price: data.travelFeeXOF || 5000,
        service_radius_km: data.serviceRadiusKm || 10,
        bio: "",
      });
      setPro();
    } catch (e) {
      console.error("Pro profile save error:", e);
    } finally {
      setSaving(false);
      setShowProOnboarding(false);
      nav("/", { replace: true });
    }
  };

  if (showProOnboarding) {
    return (
      <ProOnboardingScreen
        onComplete={handleProOnboardingComplete}
        onSkip={() => setShowProOnboarding(false)}
      />
    );
  }

  return (
    <div className="flex flex-col pb-32">
      <ClientProfileScreen
        clientName="Marie Kouadio"
        clientAvatar="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face"
        clientTag="Client depuis juin 2026"
        onOpenSettings={() => nav("/profile/settings")}
        openNavigateTo={openNavigateTo}
      />

      {/* Devenir Prestataire */}
      {!isPro && (
        <div className="mx-4 mb-4">
          <div
            onClick={() => setShowProOnboarding(true)}
            className="bg-white rounded-2xl border border-cm-green/30 overflow-hidden flex items-center gap-3 px-4 py-3.5 cursor-pointer active:bg-pale-mint/30 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-cm-green flex items-center justify-center shrink-0">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-brand-forest">Devenir prestataire</p>
              <p className="text-caption text-cm-green mt-0.5">Proposez vos services et gagnez de l'argent</p>
            </div>
            <ChevronRight className="w-4 h-4 text-cm-green shrink-0" />
          </div>
        </div>
      )}

      {/* Espace Prestataire */}
      {isPro && (
        <div className="mx-4 mb-4">
          <p className="text-2xs font-bold text-secondary/50 uppercase tracking-widest mb-2 px-1">Espace Prestataire</p>
          <div className="bg-white rounded-2xl border border-pale-mint/10 overflow-hidden divide-y divide-pale-mint/20">
            {PRO_MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={() => nav(`/profile/${item.id}`)}
                  className="flex items-center gap-3 px-4 py-3.5 cursor-pointer active:bg-pale-mint/30 transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-cm-green/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-cm-green" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-brand-forest">{item.label}</p>
                    <p className="text-caption text-secondary/60 mt-0.5 truncate">{item.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-secondary/40 shrink-0" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="px-4 mt-2">
        <button
          onClick={handleLogout}
          className="w-full h-11 flex items-center justify-center gap-2 text-xs font-semibold text-[#EF4444] bg-white rounded-xl border border-pale-mint/10 hover:bg-[#EF4444]/5 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Se déconnecter
        </button>
      </div>
    </div>
  );
}
