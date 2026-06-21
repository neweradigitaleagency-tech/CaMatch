import { useState, type ComponentType } from "react";
import {
  UserIcon, Star, Shield, BadgeCheck, Settings, ChevronRight, Edit3,
  Globe, LogOut, ArrowLeftRight, Bell, HelpCircle,
  Pen, Image as ImageIcon, BookText, Briefcase,
} from "lucide-react";
import { ProfessionalDetails, Service, PortfolioItem, ProVerification, VerificationLevel } from "../types";

interface Props {
  pro: ProfessionalDetails;
  services: Service[];
  verification: ProVerification;
  portfolio: PortfolioItem[];
  onToggleRole: () => void;
  onNavigateToEdit: () => void;
  onNavigateToVerification: () => void;
  onNavigateToNotifications: () => void;
  onNavigateToHelp: () => void;
  onAddPortfolioItem: (item: Omit<PortfolioItem, "id" | "createdAt">) => void;
  onRemovePortfolioItem: (id: string) => void;
  onAddService: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  desc: string;
  toggle?: boolean;
}

const VERIFICATION_LABELS: Record<VerificationLevel, { label: string; color: string }> = {
  none: { label: "Non vérifié", color: "text-gray-500" },
  phone: { label: "Téléphone vérifié", color: "text-gray-600" },
  id: { label: "Identité vérifiée", color: "text-blue-600" },
  background: { label: "Confiance vérifiée", color: "text-purple-600" },
  certified: { label: "Expert certifié", color: "text-amber-600" },
  elite: { label: "Niveau Élite", color: "text-red-600" },
};

export default function ProProfileScreen({
  pro, services, verification, portfolio, onToggleRole, onNavigateToEdit,
  onNavigateToVerification, onNavigateToNotifications, onNavigateToHelp,
  onAddPortfolioItem, onRemovePortfolioItem, onAddService,
}: Props) {
  const [notifEnabled, setNotifEnabled] = useState(true);

  const vLevel = verification.level;
  const vInfo = VERIFICATION_LABELS[vLevel];

  const generalItems: MenuItem[] = [
    { id: "edit", label: "Modifier le profil", icon: Edit3, desc: "Nom, photo, informations" },
    { id: "services", label: "Services & Tarifs", icon: Briefcase, desc: `${services.length} service${services.length > 1 ? "s" : ""} défini${services.length > 1 ? "s" : ""}` },
    { id: "portfolio", label: "Portfolio", icon: ImageIcon, desc: `${portfolio.length} photo${portfolio.length > 1 ? "s" : ""}` },
  ];

  const prefItems: MenuItem[] = [
    { id: "verification", label: "Vérification", icon: Shield, desc: vInfo.label },
    { id: "notifications", label: "Notifications", icon: Bell, desc: "Push, SMS, Email", toggle: true },
    { id: "help", label: "Aide & Support", icon: HelpCircle, desc: "FAQ, chat, assistance" },
    { id: "language", label: "Langue", icon: Globe, desc: "Français" },
  ];

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#F5F5F0] pb-32">
      {/* Page title */}
      <div className="px-4 pt-5 pb-3">
        <h1 className="font-sans text-lg font-bold text-brand-forest">Paramètres du compte</h1>
      </div>

      {/* User header card */}
      <div className="mx-4 mb-6 bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm border border-pale-mint/10">
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-brand-lime shrink-0">
          <img alt={pro.name} className="w-full h-full object-cover" src={pro.avatarUrl} />
        </div>
        <div className="flex-1">
          <h2 className="font-sans text-base font-bold text-brand-forest flex items-center gap-1.5">
            {pro.name}{pro.isVerified && <BadgeCheck className="w-4 h-4 text-brand-lime" />}
          </h2>
          <p className="text-caption text-secondary/60 font-medium">{pro.title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="flex items-center gap-0.5 text-caption font-bold"><Star className="w-3 h-3 fill-amber-400 text-amber-400" />{(pro.rating / 10).toFixed(1)}</span>
            <span className="text-caption text-secondary/60">· {pro.reviewCount} avis · {pro.completedInterventions} missions</span>
          </div>
        </div>
      </div>

      {/* Section: Général */}
      <div className="mx-4 mb-6">
        <p className="text-caption font-medium text-secondary/60 uppercase tracking-wider mb-2 px-1">Général</p>
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-pale-mint/10">
          {generalItems.map((item, i) => (
            <div
              key={item.id}
              onClick={() => {
                if (item.id === "edit") onNavigateToEdit();
                if (item.id === "services") onNavigateToEdit();
                if (item.id === "portfolio") onNavigateToEdit();
              }}
              className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer active:bg-pale-mint/30 transition-colors ${i < generalItems.length - 1 ? "border-b border-[#F0EFE6]" : ""}`}
            >
              <div className="w-9 h-9 rounded-xl bg-pale-mint flex items-center justify-center shrink-0">
                <item.icon className="w-4 h-4 text-brand-forest" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-brand-forest">{item.label}</p>
                <p className="text-caption text-secondary/60 mt-0.5">{item.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-secondary/40 shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Section: Préférences */}
      <div className="mx-4 mb-6">
        <p className="text-caption font-medium text-secondary/60 uppercase tracking-wider mb-2 px-1">Préférences</p>
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-pale-mint/10">
          {prefItems.map((item, i) => (
            <div
              key={item.id}
              onClick={() => {
                if (item.toggle) return;
                if (item.id === "verification") onNavigateToVerification();
                if (item.id === "help") onNavigateToHelp();
              }}
              className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer active:bg-pale-mint/30 transition-colors ${i < prefItems.length - 1 ? "border-b border-[#F0EFE6]" : ""}`}
            >
              <div className="w-9 h-9 rounded-xl bg-pale-mint flex items-center justify-center shrink-0">
                <item.icon className="w-4 h-4 text-brand-forest" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-brand-forest">{item.label}</p>
                <p className={`text-caption mt-0.5 ${item.id === "verification" ? vInfo.color : "text-secondary/60"}`}>{item.desc}</p>
              </div>
              {item.toggle ? (
                <button
                  onClick={(e) => { e.stopPropagation(); setNotifEnabled((p) => !p); }}
                  className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${notifEnabled ? "bg-brand-lime" : "bg-[#E5E5EA]"}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${notifEnabled ? "translate-x-[22px]" : "translate-x-0.5"}`} />
                </button>
              ) : (
                <ChevronRight className="w-4 h-4 text-secondary/40 shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Déconnexion */}
      <div className="mx-4 mb-6">
        <div
          onClick={() => { if (confirm("Se déconnecter ?")) { alert("Déconnexion…"); } }}
          className="bg-white rounded-2xl overflow-hidden shadow-sm border border-pale-mint/10 flex items-center gap-3 px-4 py-3.5 cursor-pointer active:bg-pale-mint/30 transition-colors"
        >
          <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
            <LogOut className="w-4 h-4 text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-red-500">Déconnexion</p>
            <p className="text-caption text-secondary/60 mt-0.5">Quitter votre compte</p>
          </div>
          <ChevronRight className="w-4 h-4 text-secondary/40 shrink-0" />
        </div>
      </div>

      {/* Mode Client */}
      <div className="mx-4">
        <div
          onClick={onToggleRole}
          className="bg-white rounded-2xl overflow-hidden shadow-sm border border-pale-mint/10 flex items-center gap-3 px-4 py-3.5 cursor-pointer active:bg-pale-mint/30 transition-colors"
        >
          <div className="w-9 h-9 rounded-xl bg-brand-forest flex items-center justify-center shrink-0">
            <ArrowLeftRight className="w-4 h-4 text-brand-lime" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-brand-forest">Mode Client</p>
            <p className="text-caption text-secondary/60 mt-0.5">Revenir à l'espace client</p>
          </div>
          <ChevronRight className="w-4 h-4 text-secondary/40 shrink-0" />
        </div>
      </div>
    </div>
  );
}

