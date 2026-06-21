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
      <div className="w-14 h-14 rounded-full bg-cm-green-light dark:bg-pale-mint/30 flex items-center justify-center mb-3">
        <Icon className="w-7 h-7 text-secondary/60" />
      </div>
      <h3 className="text-sm font-bold mb-1">{title}</h3>
      <p className="text-xs text-secondary max-w-xs">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 h-10 px-4 bg-cm-green text-white text-sm font-semibold rounded-xl hover:bg-cm-green-deep transition-colors cursor-pointer"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
