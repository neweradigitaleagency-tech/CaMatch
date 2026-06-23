import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, ChevronRight, User, Shield, MapPin, Wallet, Bell, Globe, HelpCircle, FileText, Rocket, Camera } from "lucide-react";
import ProOnboardingScreen from "../components/ProOnboardingScreen";
import { useAuthStore } from "../stores/authStore";
import { useLocationStore } from "../stores/locationStore";
import type { OnboardingData } from "../types";
import { supabase } from "../services/supabase";

export default function ProfilePage() {
  const nav = useNavigate();
  const isPro = useAuthStore((s) => s.isPro);
  const setPro = useAuthStore((s) => s.setPro);
  const logout = useAuthStore((s) => s.logout);
  const userId = useAuthStore((s) => s.userId);
  const locNeighborhood = useLocationStore((s) => s.neighborhood);
  const locStatus = useLocationStore((s) => s.status);
  const [showProOnboarding, setShowProOnboarding] = useState(false);
  const [saving, setSaving] = useState(false);

  const openNavigateTo = (screen: string) => {
    const map: Record<string, string> = {
      "edit-profile": "/profile/edit",
      "payments": "/profile/payments",
      "addresses": "/profile/addresses",
      "security": "/profile/security",
      "notifications": "/profile/notifications",
      "language": "/profile/language",
      "help": "/profile/help",
      "terms": "/profile/terms",
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
    <div className="flex flex-col w-full min-h-screen bg-cm-bg pb-32">
      <div className="px-5 pt-5 pb-3">
        <h1 className="text-[18px] font-bold text-cm-text">Profil</h1>
      </div>

      <div className="mx-5 mb-6">
        <div className="bg-cm-elevated border border-cm-border rounded-[var(--radius-cm-lg)] p-4 flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-full overflow-hidden border border-cm-border">
              <img
                alt="Jean Kouassi"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
              />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-[16px] font-bold text-cm-text">Jean Kouassi</h2>
            <p className="text-[12px] text-cm-text-soft mt-0.5">Membre depuis Jan 2026</p>
            <button
              onClick={() => openNavigateTo("edit-profile")}
              className="mt-2 text-[12px] font-medium text-cm-accent bg-cm-accent-soft px-3 py-1 rounded-[var(--radius-cm)]"
            >
              Modifier le profil
            </button>
          </div>
        </div>
      </div>

      <div className="mx-5 mb-6">
        <p className="text-[12px] font-medium text-cm-text-muted mb-2">Compte</p>
        <div className="bg-cm-elevated border border-cm-border rounded-[var(--radius-cm-lg)] overflow-hidden">
          <MenuItem icon={User} label="Informations personnelles" desc="Email, téléphone" onClick={() => openNavigateTo("edit-profile")} />
          <MenuItem icon={Shield} label="Sécurité" desc="Mot de passe" onClick={() => openNavigateTo("security")} />
          <MenuItem icon={MapPin} label="Mes adresses" desc={locStatus === "available" ? locNeighborhood : "Cocody, Plateau, Marcory"} onClick={() => openNavigateTo("addresses")} last />
        </div>
      </div>

      <div className="mx-5 mb-6">
        <p className="text-[12px] font-medium text-cm-text-muted mb-2">Paiement & Préférences</p>
        <div className="bg-cm-elevated border border-cm-border rounded-[var(--radius-cm-lg)] overflow-hidden">
          <MenuItem icon={Wallet} label="Moyens de paiement" desc="Wave, Orange Money, cartes" onClick={() => openNavigateTo("payments")} />
          <MenuItem icon={Bell} label="Notifications" desc="Alertes, rappels" onClick={() => openNavigateTo("notifications")} />
          <MenuItem icon={Globe} label="Langue" desc="Français" onClick={() => openNavigateTo("language")} last />
        </div>
      </div>

      {!isPro && <div className="mx-5 mb-6">
        <p className="text-[12px] font-medium text-cm-text-muted mb-2">Évoluer</p>
        <div onClick={() => setShowProOnboarding(true)} className="bg-cm-accent-soft border border-cm-accent/30 rounded-[var(--radius-cm-lg)] p-4 cursor-pointer">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-cm-elevated flex items-center justify-center shrink-0">
              <Rocket className="w-5 h-5 text-cm-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-bold text-cm-accent">Devenir Prestataire</p>
              <p className="text-[12px] text-cm-text-soft mt-0.5">Gagnez de l'argent avec vos compétences</p>
            </div>
          </div>
          <span className="inline-block text-[12px] font-medium text-white bg-cm-accent px-4 py-1.5 rounded-[var(--radius-cm)]">
            Commencer
          </span>
        </div>
      </div>}

      <div className="mx-5 mb-6">
        <p className="text-[12px] font-medium text-cm-text-muted mb-2">Aide</p>
        <div className="bg-cm-elevated border border-cm-border rounded-[var(--radius-cm-lg)] overflow-hidden">
          <MenuItem icon={HelpCircle} label="Centre d'aide & FAQ" desc="Questions fréquentes, support" onClick={() => openNavigateTo("help")} />
          <MenuItem icon={FileText} label="Conditions d'utilisation" desc="CGU, politique de confidentialité" onClick={() => openNavigateTo("terms")} last />
        </div>
      </div>

      <div className="mx-5 mt-2">
        <button onClick={handleLogout} className="w-full h-11 flex items-center justify-center gap-2 text-[13px] font-medium text-cm-error bg-cm-elevated border border-cm-border rounded-[var(--radius-cm)] cm-scale-btn">
          <LogOut className="w-4 h-4" />
          Se déconnecter
        </button>
      </div>
    </div>
  );
}

function MenuItem({
  icon: Icon,
  label,
  desc,
  onClick,
  last,
}: {
  icon: typeof User;
  label: string;
  desc: string;
  onClick: () => void;
  last?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer active:bg-cm-accent-soft ${
        !last ? "border-b border-cm-border" : ""
      }`}
    >
      <div className="w-8 h-8 rounded-lg bg-cm-accent-soft flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-cm-accent" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium text-cm-text">{label}</p>
        <p className="text-[12px] text-cm-text-soft">{desc}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-cm-text-muted shrink-0" />
    </div>
  );
}
