import {
  Settings, LifeBuoy, LogOut, Briefcase, Heart,
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
  label: "Compte",
  items: [
    {
      id: "favorites",
      icon: Heart,
      label: "Mes favoris",
      subtitle: "Pros, produits et boutiques sauvegardés",
      route: "/favorites",
      trailing: "chevron",
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
    { id: "help", icon: LifeBuoy, label: "Centre d'aide & support", route: "/profile/help", trailing: "chevron" },
  ],
};

export const LOGOUT_ITEM: MenuItemConfig = {
  id: "logout",
  icon: LogOut,
  label: "Se déconnecter",
  trailing: "none",
  danger: true,
};
