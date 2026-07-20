import { AlertTriangle, AlertCircle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  readonly message?: string;
  readonly onRetry?: () => void;
  readonly variant?: "default" | "admin";
  readonly title?: string;
}

export default function ErrorState({
  message,
  onRetry,
  variant = "default",
  title,
}: ErrorStateProps) {
  if (variant === "admin") {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-3">
          <AlertCircle className="w-6 h-6 text-red-500" />
        </div>
        <h3 className="text-[14px] font-semibold text-gray-900 mb-1">{title || "Une erreur est survenue"}</h3>
        <p className="text-[12px] text-gray-500 text-center max-w-xs mb-4">
          {message || "Impossible de charger les données. Veuillez réessayer."}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-1.5 h-9 px-4 text-[12px] font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Réessayer
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="w-16 h-16 rounded-[20px] bg-cm-border-soft border border-cm-border flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8 text-cm-text-muted" />
      </div>
      <h3 className="text-[16px] font-bold text-cm-text mb-1">{title || "Oups !"}</h3>
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
