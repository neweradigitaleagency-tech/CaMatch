import { useState, useEffect, useRef } from "react";
import { Phone, Mail } from "lucide-react";

interface OtpStepProps {
  type: "phone" | "email";
  value: string;
  verified: boolean;
  onValueChange: (val: string) => void;
  onVerify: (code: string) => void;
}

export default function OtpStep({ type, value, verified, onValueChange, onVerify }: OtpStepProps) {
  const [code, setCode] = useState(["", "", "", ""]);
  const [sent, setSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timer <= 0) return;
    const t = setInterval(() => setTimer((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [timer]);

  const sendCode = () => {
    setSent(true);
    setTimer(60);
  };

  const handleCodeChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const newCode = [...code];
    newCode[i] = val;
    setCode(newCode);
    if (val && i < 3) inputRefs.current[i + 1]?.focus();
    if (newCode.every((d) => d)) onVerify(newCode.join(""));
  };

  const Icon = type === "phone" ? Phone : Mail;
  const label = type === "phone" ? "Téléphone" : "Email";
  const placeholder = type === "phone" ? "+225 05 XX XX XX" : "vous@email.com";

  if (verified) {
    return (
      <div className="text-center py-8">
        <div className="w-14 h-14 rounded-full bg-cm-accent-soft flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-cm-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <p className="text-[15px] font-bold text-cm-text">{label} vérifié</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-[18px] font-extrabold text-cm-text mb-1">Vérification {label}</h2>
      <p className="text-[13px] text-cm-text-soft mb-6">
        Recevez un code de vérification par SMS{type === "email" ? " / Email" : ""}.
      </p>

      <div className="mb-4">
        <div className="flex items-center gap-3 p-3.5 bg-cm-elevated border border-cm-border rounded-[14px]">
          <Icon className="w-5 h-5 text-cm-text-muted" />
          <input
            type="text"
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            className="flex-1 bg-transparent text-[13px] text-cm-text outline-none placeholder-cm-text-muted"
            placeholder={placeholder}
            disabled={sent}
          />
          {!sent && (
            <button onClick={sendCode} disabled={!value}
              className={`text-[12px] font-semibold px-3 py-1.5 rounded-full cursor-pointer ${
                value ? "bg-cm-accent text-white" : "bg-cm-border-soft text-cm-text-muted cursor-not-allowed"
              }`}>
              Envoyer
            </button>
          )}
        </div>
      </div>

      {sent && (
        <div>
          <div className="flex items-center justify-center gap-3 mb-4">
            {code.map((d, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                maxLength={1}
                value={d}
                onChange={(e) => handleCodeChange(i, e.target.value)}
                className="w-12 h-14 text-center text-[20px] font-bold bg-cm-elevated border border-cm-border rounded-[12px] outline-none text-cm-text focus:border-cm-accent"
              />
            ))}
          </div>
          <div className="text-center">
            {timer > 0 ? (
              <span className="text-[12px] text-cm-text-muted">
                Renvoyer dans {timer}s
              </span>
            ) : (
              <button onClick={sendCode}
                className="text-[12px] font-medium text-cm-accent cursor-pointer">
              Renvoyer le code
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
