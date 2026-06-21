import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

interface PageHeaderProps {
  readonly title: string;
  readonly onBack?: () => void;
  readonly rightAction?: ReactNode;
}

export default function PageHeader({ title, onBack, rightAction }: PageHeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-brand-cream/90 dark:bg-brand-forest/90 backdrop-blur-md sticky top-0 z-10">
      <div className="w-12 h-12">
        {onBack && (
          <button
            onClick={onBack}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white dark:bg-brand-forest text-brand-forest dark:text-brand-cream hover:bg-pale-mint dark:hover:bg-pale-mint/30 transition-colors shadow-sm cursor-pointer active:scale-95"
            aria-label="Retour"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
      </div>
      <h1 className="font-sans text-sm font-bold">{title}</h1>
      <div className="w-12 h-12 flex items-center justify-center">
        {rightAction}
      </div>
    </header>
  );
}
