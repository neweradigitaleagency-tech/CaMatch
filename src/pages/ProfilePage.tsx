import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, ChevronRight, User, Shield, MapPin, Wallet, Bell, Globe, HelpCircle, FileText, Rocket, Camera } from "lucide-react";
import ProOnboardingScreen from "../components/ProOnboardingScreen";
import { useAuthStore } from "../stores/authStore";
import type { OnboardingData } from "../types";
import { supabase } from "../services/supabase";

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
    <div className="flex flex-col w-full min-h-screen pb-32" style={{ background: "linear-gradient(180deg, #D8F3DC 0%, #F5F0E8 100%)" }}>
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <h1 className="text-[18px] font-bold text-ca-text-primary">Profil</h1>
      </div>

      {/* Profile Card */}
      <div className="mx-4 mb-6">
        <div className="bg-[rgba(255,255,255,0.60)] backdrop-blur-[16px] rounded-[20px] border border-[rgba(255,255,255,0.50)] p-5 flex items-center gap-4">
          <div className="relative shrink-0 group cursor-pointer">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-ca-green-light">
              <img
                alt="Jean Kouassi"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
              />
            </div>
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-[16px] font-bold text-ca-text-primary">Jean Kouassi</h2>
            <p className="text-[12px] text-ca-text-muted mt-0.5">Membre depuis Jan 2026</p>
            <button
              onClick={() => openNavigateTo("edit-profile")}
              className="mt-1.5 text-[11px] font-semibold text-ca-green-primary bg-[rgba(45,106,79,0.12)] hover:bg-[rgba(45,106,79,0.18)] transition-colors px-3 py-1 rounded-full"
            >
              Modifier Profil
            </button>
          </div>
        </div>
      </div>

      {/* Section: COMPTE */}
      <div className="mx-4 mb-6">
        <p className="text-[11px] font-medium text-ca-text-muted uppercase tracking-wider mb-2 px-1">Compte</p>
        <div className="bg-[rgba(255,255,255,0.60)] backdrop-blur-[16px] rounded-[20px] border border-[rgba(255,255,255,0.50)] !p-0 overflow-hidden">
          <MenuItem
            icon={User}
            label="Informations Personnelles"
            desc="Email, téléphone"
            onClick={() => openNavigateTo("edit-profile")}
          />
          <MenuItem
            icon={Shield}
            label="Sécurité"
            desc="Mot de passe"
            onClick={() => openNavigateTo("security")}
          />
          <MenuItem
            icon={MapPin}
            label="Mes Adresses"
            desc="Cocody, Plateau, Marcory"
            onClick={() => openNavigateTo("addresses")}
            last
          />
        </div>
      </div>

      {/* Section: PAIEMENT & PREFS */}
      <div className="mx-4 mb-6">
        <p className="text-[11px] font-medium text-ca-text-muted uppercase tracking-wider mb-2 px-1">Paiement & Préfs</p>
        <div className="bg-[rgba(255,255,255,0.60)] backdrop-blur-[16px] rounded-[20px] border border-[rgba(255,255,255,0.50)] !p-0 overflow-hidden">
          <MenuItem
            icon={Wallet}
            label="Moyens de Paiement"
            desc="Wave, Orange Money, cartes"
            onClick={() => openNavigateTo("payments")}
          />
          <MenuItem
            icon={Bell}
            label="Notifications"
            desc="Alertes, rappels"
            onClick={() => openNavigateTo("notifications")}
          />
          <MenuItem
            icon={Globe}
            label="Langue"
            desc="Français"
            onClick={() => openNavigateTo("language")}
            last
          />
        </div>
      </div>

      {/* Section: ÉVOLUER (caché si déjà prestataire) */}
      {!isPro && <div className="mx-4 mb-6">
        <p className="text-[11px] font-medium text-ca-text-muted uppercase tracking-wider mb-2 px-1">Évoluer</p>
        <div
          onClick={() => setShowProOnboarding(true)}
          className="bg-[rgba(45,106,79,0.12)] backdrop-blur-[8px] rounded-[20px] border border-[rgba(45,106,79,0.20)] p-5 cursor-pointer active:bg-[rgba(45,106,79,0.18)] transition-all group"
        >
          <div className="flex items-start gap-3 mb-2">
            <div className="w-10 h-10 rounded-[14px] bg-[rgba(255,255,255,0.50)] flex items-center justify-center shrink-0">
              <Rocket className="w-5 h-5 text-ca-green-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-bold text-ca-green-primary">Devenir Prestataire</p>
              <p className="text-[12px] text-ca-text-muted mt-0.5">Gagnez de l'argent avec vos compétences</p>
            </div>
          </div>
          <div className="flex justify-end">
            <span className="text-[12px] font-semibold text-white bg-ca-green-primary px-5 py-1.5 rounded-full group-hover:bg-ca-green-primary/90 transition-colors">
              Commencer
            </span>
          </div>
        </div>
      </div>}

      {/* Section: AIDE */}
      <div className="mx-4 mb-6">
        <p className="text-[11px] font-medium text-ca-text-muted uppercase tracking-wider mb-2 px-1">Aide</p>
        <div className="bg-[rgba(255,255,255,0.60)] backdrop-blur-[16px] rounded-[20px] border border-[rgba(255,255,255,0.50)] !p-0 overflow-hidden">
          <MenuItem
            icon={HelpCircle}
            label="Centre d'aide & FAQ"
            desc="Questions fréquentes, support"
            onClick={() => openNavigateTo("help")}
          />
          <MenuItem
            icon={FileText}
            label="Conditions d'utilisation"
            desc="CGU, politique de confidentialité"
            onClick={() => openNavigateTo("terms")}
            last
          />
        </div>
      </div>

      {/* Footer */}
      <div className="mx-4 mt-2">
        <button
          onClick={handleLogout}
          className="w-full h-11 flex items-center justify-center gap-2 text-[13px] font-semibold text-red-500 bg-[rgba(255,255,255,0.60)] backdrop-blur-[16px] rounded-[16px] border border-[rgba(255,255,255,0.50)] hover:bg-[rgba(255,255,255,0.75)] transition-colors cursor-pointer"
        >
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
      className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer active:bg-[rgba(255,255,255,0.50)] transition-colors ${
        !last ? "border-b border-[rgba(232,224,208,0.30)]" : ""
      }`}
    >
      <div className="w-9 h-9 rounded-[12px] bg-[rgba(255,255,255,0.50)] flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-ca-text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-ca-text-primary">{label}</p>
        <p className="text-[11px] text-ca-text-muted mt-0.5">{desc}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-ca-text-muted shrink-0" />
    </div>
  );
}
