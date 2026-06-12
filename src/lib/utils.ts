import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return price.toLocaleString("fr-FR") + " FCFA";
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const d = new Date(date);
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diff < 60) return "À l'instant";
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `Il y a ${Math.floor(diff / 86400)} jours`;
  return formatDate(date);
}

export function getTrustScoreColor(score: number): string {
  if (score < 400) return "text-danger";
  if (score < 700) return "text-accent";
  if (score < 900) return "text-primary";
  return "text-accent";
}

export function getTrustScoreBarColor(score: number): string {
  if (score < 400) return "bg-danger";
  if (score < 700) return "bg-accent";
  if (score < 900) return "bg-primary";
  return "bg-accent";
}

export function getBadgeLabel(badge: string): string {
  const labels: Record<string, string> = {
    NONE: "Débutant",
    BRONZE: "Bronze",
    SILVER: "Argent",
    GOLD: "Or",
    ELITE: "Élite",
  };
  return labels[badge] ?? badge;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-700",
    ACCEPTED: "bg-blue-100 text-blue-700",
    IN_PROGRESS: "bg-primary-100 text-primary-700",
    COMPLETED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
    DISPUTED: "bg-purple-100 text-purple-700",
  };
  return colors[status] ?? "bg-gray-100 text-gray-700";
}
