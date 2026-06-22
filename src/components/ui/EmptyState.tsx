import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  readonly icon: LucideIcon;
  readonly title: string;
  readonly description: string;
  readonly action?: { label: string; onClick: () => void };
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-8 py-16">
      <div className="w-16 h-16 rounded-[20px] bg-[rgba(82,183,136,0.15)] backdrop-blur-[8px] border border-[rgba(82,183,136,0.25)] flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-ca-text-muted" />
      </div>
      <h3 className="text-[16px] font-bold text-ca-text-primary mb-1">{title}</h3>
      <p className="text-[13px] text-ca-text-muted max-w-xs">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-5 h-11 px-6 bg-[rgba(45,106,79,0.85)] backdrop-blur-[8px] border border-[rgba(82,183,136,0.40)] text-white text-[13px] font-semibold rounded-[14px] hover:bg-[rgba(45,106,79,0.95)] transition-all duration-150 active:scale-[0.97] cursor-pointer"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
