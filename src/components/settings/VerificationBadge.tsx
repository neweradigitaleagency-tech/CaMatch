import { Check, Clock, X, Minus } from "lucide-react";

export type VerificationStatus = "verified" | "pending" | "not_verified" | "rejected";

interface VerificationBadgeProps {
  status: VerificationStatus;
}

const config: Record<VerificationStatus, { icon: typeof Check; label: string; classes: string }> = {
  verified: { icon: Check, label: "Vérifié", classes: "bg-green-100 text-green-700" },
  pending: { icon: Clock, label: "En attente", classes: "bg-amber-100 text-amber-700" },
  not_verified: { icon: Minus, label: "Non vérifié", classes: "bg-gray-100 text-gray-500" },
  rejected: { icon: X, label: "Rejeté", classes: "bg-red-100 text-red-600" },
};

export default function VerificationBadge({ status }: VerificationBadgeProps) {
  const { icon: Icon, label, classes } = config[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${classes}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}
