import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

interface PageHeaderProps {
  readonly title: string;
  readonly onBack?: () => void;
  readonly rightAction?: ReactNode;
}

export default function PageHeader({ title, onBack, rightAction }: PageHeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-cm-elevated sticky top-0 z-10 border-b border-cm-border">
      <div className="w-10 h-10">
        {onBack && (
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-[var(--radius-cm)] text-cm-text border border-cm-border cm-scale-btn"
            aria-label="Retour"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
      </div>
      <h1 className="text-[15px] font-semibold text-cm-text">{title}</h1>
      <div className="w-10 h-10 flex items-center justify-center">
        {rightAction}
      </div>
    </header>
  );
}
