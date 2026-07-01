import { useState, useRef } from "react";
import { Check, PenLine } from "lucide-react";

interface CguSignatureStepProps {
  accepted: boolean;
  signature: string | null;
  onAcceptChange: (accepted: boolean) => void;
  onSignatureChange: (sig: string | null) => void;
}

export default function CguSignatureStep({ accepted, signature, onAcceptChange, onSignatureChange }: CguSignatureStepProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasDrawn, setHasDrawn] = useState(false);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0]!.clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0]!.clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0]!.clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0]!.clientY - rect.top : e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (canvasRef.current && hasDrawn) {
      onSignatureChange(canvasRef.current.toDataURL());
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    onSignatureChange(null);
  };

  return (
    <div>
      <h2 className="text-[18px] font-extrabold text-cm-text mb-1">Conditions générales</h2>
      <p className="text-[13px] text-cm-text-soft mb-6">
        Acceptez les CGU et signez pour finaliser.
      </p>

      <div className="bg-cm-elevated border border-cm-border rounded-[14px] p-4 mb-4">
        <h3 className="text-[13px] font-bold text-cm-text mb-2">Résumé des CGU</h3>
        <ul className="space-y-2">
          {[
            "Vous vous engagez à fournir des services de qualité",
            "Vous respectez les tarifs que vous avez définis",
            "Les commissions sont prélevées automatiquement",
            "Vous pouvez définir vos disponibilités",
            "Le non-respect des règles peut entraîner la suspension",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-[12px] text-cm-text-soft">
              <Check className="w-3.5 h-3.5 text-cm-accent shrink-0 mt-0.5" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <label className="flex items-center gap-3 p-3.5 bg-cm-elevated border border-cm-border rounded-[14px] cursor-pointer mb-4">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => onAcceptChange(e.target.checked)}
          className="w-5 h-5 rounded-md accent-cm-accent"
        />
        <span className="text-[13px] text-cm-text font-medium">
          J'accepte les conditions générales d'utilisation
        </span>
      </label>

      {accepted && (
        <div>
          <p className="text-[12px] font-semibold text-cm-text mb-2 flex items-center gap-1.5">
            <PenLine className="w-4 h-4" /> Signature
          </p>
          <div className="relative bg-white border border-cm-border rounded-[14px] overflow-hidden">
            <canvas
              ref={canvasRef}
              width={340}
              height={150}
              className="w-full touch-none cursor-crosshair"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          </div>
          {hasDrawn && (
            <button onClick={clearSignature}
              className="mt-2 text-[11px] font-medium text-cm-text-muted cursor-pointer hover:text-cm-error">
              Effacer la signature
            </button>
          )}
        </div>
      )}
    </div>
  );
}
