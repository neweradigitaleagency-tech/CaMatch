import { Hammer, ChevronLeft } from "lucide-react";
import { useAppNavigation } from "../../navigation/useAppNavigation";

interface MarketplacePlaceholderProps {
  title: string;
  description: string;
  badge?: string;
  backTo: string;
}

export default function MarketplacePlaceholder({ title, description, badge, backTo }: MarketplacePlaceholderProps) {
  const { goBackTo } = useAppNavigation();

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-cm-accent/20 border border-cm-accent/30 flex items-center justify-center mb-5">
        <Hammer className="w-7 h-7 text-cm-forest" />
      </div>
      {badge && (
        <span className="label-cm px-2.5 py-1 rounded-full bg-cm-accent/20 text-cm-forest mb-2">{badge}</span>
      )}
      <h1 className="h1-cm text-cm-text mb-2">{title}</h1>
      <p className="body-cm text-cm-text-soft max-w-xs mb-8">{description}</p>
      <button
        onClick={() => goBackTo(backTo)}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-cm-text text-white text-sm font-semibold active:scale-95 transition-transform cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
        Retour au marché
      </button>
    </div>
  );
}
