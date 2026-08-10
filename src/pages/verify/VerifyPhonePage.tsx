import { ArrowLeft, Smartphone, Check } from "lucide-react";
import { useAppNavigation } from "../../navigation/useAppNavigation";

export default function VerifyPhonePage() {
  const { navigate, setFlag } = useAppNavigation();
  return (
    <div className="flex flex-col min-h-dynamic bg-cm-bg">
      <header className="flex items-center gap-3 px-4 pt-4 pb-2">
        <button onClick={() => { setFlag("reopen-menu", true); navigate("/") }} className="p-1 cursor-pointer active:scale-[0.97] transition-transform touch-min">
          <ArrowLeft className="w-5 h-5 text-cm-text" />
        </button>
        <h1 className="text-[17px] font-extrabold text-cm-text">Vérification téléphone</h1>
      </header>
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mb-4"><Check className="w-8 h-8 text-green-600" /></div>
        <h2 className="text-[18px] font-bold text-cm-text mb-2">Téléphone vérifié</h2>
        <p className="text-[13px] text-cm-text-soft">Votre numéro de téléphone est déjà vérifié. Vous pouvez le modifier dans les paramètres du compte.</p>
      </div>
    </div>
  );
}
