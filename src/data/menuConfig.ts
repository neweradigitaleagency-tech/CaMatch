import {
  ArrowLeftRight, Settings, LifeBuoy, MessageCircle, Flag, UserPlus, Star,
  Languages, Palette, Bell, FileText, Shield, Info, LogOut, Briefcase,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface MenuItemConfig {
  id: string;
  icon: LucideIcon;
  label: string;
  subtitle?: string;
  route?: string;
  onClick?: () => void;
  trailing?: "chevron" | "none";
  badge?: string | number;
  disabled?: boolean;
  danger?: boolean;
  loading?: boolean;
}

export interface MenuSectionConfig {
  id: string;
  label: string;
  items: MenuItemConfig[];
}

export interface StaticInfoConfig {
  label: string;
  value: string;
}

export const PRO_SECTION: MenuSectionConfig = {
  id: "pro",
  label: "Professionnel",
  items: [
    {
      id: "become-pro",
      icon: Briefcase,
      label: "Devenir prestataire",
      subtitle: "Proposez vos services sur Ça Match",
      route: "/pro/onboarding",
      trailing: "chevron",
    },
  ],
};

export const ACCOUNT_SECTION: MenuSectionConfig = {
  id: "account",
  label: "Account",
  items: [
    {
      id: "switch-mode",
      icon: ArrowLeftRight,
      label: "Changer de mode",
      subtitle: "Basculer entre Client et Professionnel",
      trailing: "none",
      disabled: true,
    },
    {
      id: "account-settings",
      icon: Settings,
      label: "Paramètres du compte",
      route: "/profile/settings",
      trailing: "chevron",
    },
  ],
};

export const SUPPORT_SECTION: MenuSectionConfig = {
  id: "support",
  label: "Support",
  items: [
    { id: "help", icon: LifeBuoy, label: "Centre d'aide", route: "/profile/help", trailing: "chevron" },
    { id: "contact", icon: MessageCircle, label: "Contacter le support", route: "/profile/help", trailing: "chevron" },
    { id: "report", icon: Flag, label: "Signaler un problème", trailing: "chevron" },
    { id: "invite", icon: UserPlus, label: "Inviter un ami", trailing: "chevron" },
    { id: "rate", icon: Star, label: "Noter l'application", trailing: "chevron" },
  ],
};

export const PREFERENCES_SECTION: MenuSectionConfig = {
  id: "preferences",
  label: "Préférences",
  items: [
    { id: "language", icon: Languages, label: "Langue", route: "/profile/language", trailing: "chevron" },
    { id: "appearance", icon: Palette, label: "Apparence", route: "/profile/settings", trailing: "chevron" },
    { id: "notifications", icon: Bell, label: "Préférences de notifications", route: "/profile/notifications", trailing: "chevron" },
  ],
};

export const LEGAL_SECTION: MenuSectionConfig = {
  id: "legal",
  label: "Legal",
  items: [
    { id: "terms", icon: FileText, label: "Conditions d'utilisation", route: "/profile/terms", trailing: "chevron" },
    { id: "privacy", icon: Shield, label: "Politique de confidentialité", route: "/profile/security", trailing: "chevron" },
    { id: "about", icon: Info, label: "À propos de Ça Match", trailing: "chevron" },
  ],
};

export const LEGAL_STATIC_INFO: StaticInfoConfig = {
  label: "Version",
  value: "1.0.0 (Build 25)",
};

export const LOGOUT_ITEM: MenuItemConfig = {
  id: "logout",
  icon: LogOut,
  label: "Se déconnecter",
  trailing: "none",
  danger: true,
};
