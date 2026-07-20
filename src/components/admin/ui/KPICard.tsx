import SharedKpiCard from "../../ui/KpiCard";
import type { ReactNode } from "react";

interface KPICardProps {
  label: string;
  value: string;
  trend?: { value: number; positive: boolean };
  icon?: ReactNode;
  onClick?: () => void;
}

export default function KPICard({ label, value, trend, icon, onClick }: KPICardProps) {
  return (
    <SharedKpiCard
      label={label}
      value={value}
      trend={trend}
      icon={icon}
      onClick={onClick}
      variant="admin"
    />
  );
}
