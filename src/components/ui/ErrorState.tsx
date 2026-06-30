import { AlertTriangle } from "lucide-react";

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
        <button onClick={onRetry} className="h-9 px-5 rounded-xl bg-cm-accent text-cm-text-onAccent text-[13px] font-semibold cursor-pointer active:scale-[0.96] transition-transform">
          Réessayer
        </button>
      )}
    </div>
  );
}
