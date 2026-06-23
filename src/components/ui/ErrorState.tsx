import { AlertTriangle } from "lucide-react";
import { Button } from "./index";

interface ErrorStateProps {
  readonly message?: string;
  readonly onRetry?: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="w-16 h-16 rounded-[20px] bg-cm-border-soft border border-cm-border flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8 text-cm-text-muted" />
      </div>
      <h3 className="text-[16px] font-bold text-cm-text mb-1">Oups !</h3>
      <p className="text-[13px] text-cm-text-muted max-w-xs mb-4">
        {message || "Une erreur est survenue"}
      </p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Réessayer
        </Button>
      )}
    </div>
  );
}
