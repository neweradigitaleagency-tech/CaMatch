import { AlertTriangle } from "lucide-react";

interface ErrorStateProps {
  readonly message?: string;
  readonly onRetry?: () => void;
}

export default function ErrorState({
  message = "Une erreur est survenue",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-8 py-16">
      <div className="w-14 h-14 rounded-full bg-cm-error/10 flex items-center justify-center mb-3">
        <AlertTriangle className="w-7 h-7 text-cm-error" />
      </div>
      <h3 className="text-sm font-bold mb-1">Oups !</h3>
      <p className="text-xs text-secondary mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="h-10 px-4 bg-cm-green text-white text-sm font-semibold rounded-xl hover:bg-cm-green-deep transition-colors cursor-pointer"
        >
          Réessayer
        </button>
      )}
    </div>
  );
}
