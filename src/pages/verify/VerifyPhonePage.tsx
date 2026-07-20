import { useNavigate } from "react-router-dom";
import { ArrowLeft, Smartphone, Check } from "lucide-react";

export default function VerifyPhonePage() {
  const nav = useNavigate();
  return (
    <div className="flex flex-col min-h-dynamic bg-cm-bg">
      <header className="flex items-center gap-3 px-4 pt-4 pb-2">
        <button onClick={() => nav("/", { state: { reopenMenu: true } })} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-gray-100 cursor-pointer active:scale-[0.94] transition-transform shadow-sm">
          <ArrowLeft className="w-4 h-4 text-[#2B2B2B]" />
        </button>
        <h1 className="text-[17px] font-extrabold text-[#2B2B2B]">Vérification téléphone</h1>
      </header>
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mb-4"><Check className="w-8 h-8 text-green-600" /></div>
        <h2 className="text-[18px] font-bold text-[#2B2B2B] mb-2">Téléphone vérifié</h2>
        <p className="text-[13px] text-gray-500">Votre numéro de téléphone est déjà vérifié. Vous pouvez le modifier dans les paramètres du compte.</p>
      </div>
    </div>
  );
}
