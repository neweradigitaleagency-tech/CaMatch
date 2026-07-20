import SharedStatusBadge from "../../ui/StatusBadge";

interface StatusBadgeProps {
  status: string;
  label?: string;
  size?: "sm" | "md";
}

export default function StatusBadge({ status, label, size = "sm" }: StatusBadgeProps) {
  return (
    <SharedStatusBadge
      status={status}
      label={label}
      size={size}
      showDot
    />
  );
}
