import type { Permission } from "../../types/admin"

export const ALL_PERMISSIONS: Permission[] = [
  "all",
  "users.read", "users.create", "users.update", "users.delete", "users.suspend", "users.ban",
  "pros.read", "pros.create", "pros.update", "pros.delete", "pros.verify",
  "missions.read", "missions.update", "missions.cancel",
  "payments.read", "payments.refund", "payouts.read", "payouts.approve",
  "transactions.read",
  "support.read", "support.reply", "support.close",
  "reports.read", "reports.resolve", "reports.dismiss",
  "verifications.read", "verifications.approve", "verifications.reject", "verifications.request_change",
  "notifications.read", "notifications.send",
  "analytics.read", "analytics.export",
  "settings.read", "settings.update",
  "logs.read",
  "admins.create", "admins.update", "admins.delete",
  "roles.read", "roles.update",
  "reviews.moderate",
  "categories.read", "categories.create", "categories.update", "categories.delete",
  "promotions.read", "promotions.create", "promotions.update", "promotions.delete",
  "cms.read", "cms.create", "cms.update", "cms.delete",
  "fraud.read", "fraud.resolve",
  "feature_flags.read", "feature_flags.manage",
]

export const PERMISSION_GROUPS: Record<string, { label: string; permissions: Permission[] }> = {
  users: {
    label: "Utilisateurs",
    permissions: ["users.read", "users.create", "users.update", "users.delete", "users.suspend", "users.ban"],
  },
  pros: {
    label: "Professionnels",
    permissions: ["pros.read", "pros.create", "pros.update", "pros.delete", "pros.verify"],
  },
  missions: {
    label: "Missions",
    permissions: ["missions.read", "missions.update", "missions.cancel"],
  },
  payments: {
    label: "Paiements",
    permissions: ["payments.read", "payments.refund", "payouts.read", "payouts.approve", "transactions.read"],
  },
  support: {
    label: "Support",
    permissions: ["support.read", "support.reply", "support.close"],
  },
  reports: {
    label: "Signalements",
    permissions: ["reports.read", "reports.resolve", "reports.dismiss"],
  },
  verifications: {
    label: "Vérifications",
    permissions: ["verifications.read", "verifications.approve", "verifications.reject", "verifications.request_change"],
  },
  notifications: {
    label: "Notifications",
    permissions: ["notifications.read", "notifications.send"],
  },
  analytics: {
    label: "Analytics",
    permissions: ["analytics.read", "analytics.export"],
  },
  settings: {
    label: "Paramètres",
    permissions: ["settings.read", "settings.update"],
  },
  logs: {
    label: "Logs",
    permissions: ["logs.read"],
  },
  admins: {
    label: "Administrateurs",
    permissions: ["admins.create", "admins.update", "admins.delete", "roles.read", "roles.update"],
  },
  reviews: {
    label: "Avis",
    permissions: ["reviews.moderate"],
  },
  categories: {
    label: "Catégories",
    permissions: ["categories.read", "categories.create", "categories.update", "categories.delete"],
  },
  promotions: {
    label: "Promotions",
    permissions: ["promotions.read", "promotions.create", "promotions.update", "promotions.delete"],
  },
  cms: {
    label: "CMS",
    permissions: ["cms.read", "cms.create", "cms.update", "cms.delete"],
  },
  fraud: {
    label: "Fraude",
    permissions: ["fraud.read", "fraud.resolve"],
  },
  feature_flags: {
    label: "Feature Flags",
    permissions: ["feature_flags.read", "feature_flags.manage"],
  },
}
