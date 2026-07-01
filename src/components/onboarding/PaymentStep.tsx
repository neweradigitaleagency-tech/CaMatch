import { Check } from "lucide-react";
import type { PaymentMethod } from "../../types";

interface PaymentStepProps {
  paymentMethod: PaymentMethod | null;
  paymentPhone: string;
  onMethodChange: (method: PaymentMethod) => void;
  onPhoneChange: (phone: string) => void;
}

const METHODS: { id: PaymentMethod; label: string; color: string }[] = [
  { id: "orange_money", label: "Orange Money", color: "#FF7900" },
  { id: "mtn_momo", label: "MTN MoMo", color: "#FFCC00" },
  { id: "wave", label: "Wave", color: "#1E90FF" },
  { id: "moov_money", label: "Moov Money", color: "#00A3FF" },
];

export default function PaymentStep({ paymentMethod, paymentPhone, onMethodChange, onPhoneChange }: PaymentStepProps) {
  return (
    <div>
      <h2 className="text-[18px] font-extrabold text-cm-text mb-1">Moyen de paiement</h2>
      <p className="text-[13px] text-cm-text-soft mb-6">
        Ajoutez un moyen de recevoir vos paiements.
      </p>

      <div className="space-y-2 mb-6">
        {METHODS.map(({ id, label, color }) => (
          <button
            key={id}
            onClick={() => onMethodChange(id)}
            className={`w-full flex items-center gap-3 p-4 rounded-[14px] border cursor-pointer transition-all ${
              paymentMethod === id
                ? "border-cm-accent bg-cm-accent-soft"
                : "border-cm-border bg-cm-elevated hover:border-cm-accent/30"
            }`}
          >
            <div
              className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0"
              style={{ backgroundColor: color + "20" }}
            >
              <div className="w-5 h-5 rounded-full" style={{ backgroundColor: color }} />
            </div>
            <span className="flex-1 text-[13px] font-semibold text-cm-text text-left">{label}</span>
            {paymentMethod === id && (
              <Check className="w-5 h-5 text-cm-accent" />
            )}
          </button>
        ))}
      </div>

      {paymentMethod && (
        <div>
          <label className="text-[12px] font-semibold text-cm-text mb-1.5 block">
            Numéro {paymentMethod.replace("_", " ")}
          </label>
          <input
            type="tel"
            value={paymentPhone}
            onChange={(e) => onPhoneChange(e.target.value)}
            className="w-full h-11 px-4 text-[13px] bg-cm-elevated border border-cm-border rounded-[12px] outline-none text-cm-text placeholder-cm-text-muted focus:border-cm-accent"
            placeholder="+225 05 XX XX XX"
          />
        </div>
      )}
    </div>
  );
}
