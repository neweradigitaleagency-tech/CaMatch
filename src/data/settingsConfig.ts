import {
  User, Camera, AtSign, Phone, Mail, Calendar,
  Lock, Shield, Smartphone, History, LogOut,
  CheckCircle, Eye, Users, PhoneCall, MessageSquare, MapPin, Ban,
  Bell, Megaphone, RefreshCw, AlarmClock,
  Globe, Flag, Clock, DollarSign,
  Download, Upload, Trash2, HardDrive,
  AlertTriangle, Skull, Image,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { VerificationStatus } from "../components/settings/VerificationBadge";

export type SettingsRowKind = "navigation" | "toggle" | "status" | "action" | "info";

export interface SettingsRowConfig {
  id: string;
  icon: LucideIcon;
  label: string;
  subtitle?: string;
  kind: SettingsRowKind;
  route?: string;
  dangerous?: boolean;
  disabled?: boolean;
  statusValue?: VerificationStatus;
  requiresConfirmation?: boolean;
  confirmationTitle?: string;
  confirmationMessage?: string;
}

export interface SettingsSectionConfig {
  id: string;
  label: string;
  description?: string;
  dangerous?: boolean;
  items: SettingsRowConfig[];
}

export const SETTINGS_SECTIONS: SettingsSectionConfig[] = [
  {
    id: "personal-info",
    label: "Informations personnelles",
    items: [
      { id: "photo", icon: Camera, label: "Photo de profil", subtitle: "Modifier votre photo", kind: "action" },
      { id: "name", icon: User, label: "Nom complet", subtitle: "Jean Dupont", kind: "action" },
      { id: "username", icon: AtSign, label: "Nom d'utilisateur", subtitle: "@jeandupont", kind: "action" },
      { id: "phone", icon: Phone, label: "Numéro de téléphone", subtitle: "+225 01 02 03 04", kind: "action" },
      { id: "email", icon: Mail, label: "Adresse email", subtitle: "jean@example.com", kind: "action" },
      { id: "dob", icon: Calendar, label: "Date de naissance", subtitle: "15 juin 1990", kind: "action" },
    ],
  },
  {
    id: "security",
    label: "Sécurité",
    items: [
      { id: "password", icon: Lock, label: "Changer le mot de passe", kind: "navigation", route: "/profile/security" },
      { id: "2fa", icon: Shield, label: "Authentification à deux facteurs", subtitle: "Renforcez la sécurité de votre compte", kind: "toggle" },
      { id: "devices", icon: Smartphone, label: "Appareils connectés", subtitle: "3 appareils actifs", kind: "navigation", route: "/profile/security" },
      { id: "login-history", icon: History, label: "Historique de connexion", kind: "navigation", route: "/profile/security" },
      { id: "signout-all", icon: LogOut, label: "Déconnecter tous les appareils", kind: "action", requiresConfirmation: true, confirmationTitle: "Déconnexion générale", confirmationMessage: "Vous serez déconnecté de tous vos appareils. Vous devrez vous reconnecter sur chacun d'eux." },
    ],
  },
  {
    id: "verification",
    label: "Vérification",
    items: [
      { id: "verified-phone", icon: Phone, label: "Téléphone", statusValue: "verified", kind: "status", route: "/verify/phone" },
      { id: "verified-email", icon: Mail, label: "Email", statusValue: "pending", kind: "status", route: "/verify/email" },
      { id: "verified-identity", icon: CheckCircle, label: "Identité", statusValue: "not_verified", kind: "status", route: "/verify/identity" },
    ],
  },
  {
    id: "privacy",
    label: "Confidentialité",
    items: [
      { id: "profile-visibility", icon: Eye, label: "Visibilité du profil", subtitle: "Visible par tous", kind: "navigation", route: "/profile/settings" },
      { id: "who-can-contact", icon: Users, label: "Qui peut me contacter", subtitle: "Tout le monde", kind: "navigation", route: "/profile/settings" },
      { id: "allow-calls", icon: PhoneCall, label: "Autoriser les appels", kind: "toggle" },
      { id: "allow-messages", icon: MessageSquare, label: "Autoriser les messages", kind: "toggle" },
      { id: "location-sharing", icon: MapPin, label: "Partager ma position", kind: "toggle" },
      { id: "blocked-users", icon: Ban, label: "Utilisateurs bloqués", subtitle: "2 utilisateurs", kind: "navigation", route: "/profile/blocked" },
    ],
  },
  {
    id: "notifications",
    label: "Notifications",
    items: [
      { id: "push", icon: Bell, label: "Notifications push", kind: "navigation", route: "/profile/notifications", subtitle: "Alertes en temps réel" },
      { id: "sms", icon: MessageSquare, label: "Notifications SMS", kind: "navigation", route: "/profile/notifications", subtitle: "Messages texte" },
      { id: "email", icon: Mail, label: "Notifications email", kind: "navigation", route: "/profile/notifications", subtitle: "Résumés par email" },
      { id: "marketing", icon: Megaphone, label: "Messages marketing", kind: "toggle" },
      { id: "updates", icon: RefreshCw, label: "Mises à jour produit", kind: "toggle" },
      { id: "reminders", icon: AlarmClock, label: "Notifications de rappel", kind: "toggle" },
    ],
  },
  {
    id: "language-region",
    label: "Langue et région",
    items: [
      { id: "language", icon: Globe, label: "Langue", subtitle: "Français", kind: "navigation", route: "/profile/language" },
      { id: "country", icon: Flag, label: "Pays", subtitle: "Côte d'Ivoire", kind: "navigation", route: "/profile/language" },
      { id: "timezone", icon: Clock, label: "Fuseau horaire", subtitle: "UTC+0", kind: "navigation", route: "/profile/language" },
      { id: "currency", icon: DollarSign, label: "Devise", subtitle: "XOF (CFA)", kind: "navigation", route: "/profile/language" },
    ],
  },
  {
    id: "permissions",
    label: "Autorisations",
    items: [
      { id: "perm-location", icon: MapPin, label: "Localisation", kind: "info" },
      { id: "perm-camera", icon: Camera, label: "Appareil photo", kind: "info" },
      { id: "perm-microphone", icon: PhoneCall, label: "Microphone", kind: "info" },
      { id: "perm-photos", icon: Image, label: "Photos et galerie", kind: "info" },
      { id: "perm-notifications", icon: Bell, label: "Notifications", kind: "info" },
    ],
  },
  {
    id: "data-management",
    label: "Gestion des données",
    items: [
      { id: "download-data", icon: Download, label: "Télécharger mes données", kind: "action" },
      { id: "export-activity", icon: Upload, label: "Exporter mon activité", kind: "action" },
      { id: "clear-cache", icon: Trash2, label: "Vider le cache", kind: "action", requiresConfirmation: true, confirmationTitle: "Vider le cache", confirmationMessage: "Les données temporaires seront supprimées. Cette action est irréversible." },
      { id: "storage-usage", icon: HardDrive, label: "Utilisation du stockage", subtitle: "Calcul…", kind: "info" },
    ],
  },
  {
    id: "danger-zone",
    label: "Zone de danger",
    description: "Actions irréversibles concernant votre compte",
    dangerous: true,
    items: [
      { id: "deactivate", icon: AlertTriangle, label: "Désactiver mon compte", kind: "action", dangerous: true, requiresConfirmation: true, confirmationTitle: "Désactiver le compte", confirmationMessage: "Votre compte sera désactivé. Vous pourrez le réactiver à tout moment en vous reconnectant." },
      { id: "delete", icon: Skull, label: "Supprimer mon compte", kind: "action", dangerous: true, requiresConfirmation: true, confirmationTitle: "Supprimer le compte", confirmationMessage: "Cette action est définitive et irréversible. Toutes vos données seront effacées définitivement." },
    ],
  },
];
