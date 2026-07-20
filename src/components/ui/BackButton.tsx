import { ArrowLeft } from "lucide-react";
import { useBackNavigation } from "../../hooks/useBackNavigation";

interface BackButtonProps {
  to: string;
  className?: string;
  iconClassName?: string;
  fallback?: string;
}

export default function BackButton({ to, className = "", iconClassName = "" }: BackButtonProps) {
  const goBack = useBackNavigation(to);

  return (
    <button
      type="button"
      onClick={goBack}
      className={`cursor-pointer active:scale-90 transition-transform shrink-0 ${className}`}
      aria-label="Retour"
    >
      <ArrowLeft className={iconClassName || "w-4 h-4"} />
    </button>
  );
}
