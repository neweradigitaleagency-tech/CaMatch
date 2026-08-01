import { ArrowLeft, Mail, Clock } from "lucide-react";
import { useAppNavigation } from "../../navigation/useAppNavigation";

export default function VerifyEmailPage() {
  const { navigate, setFlag } = useAppNavigation();
  return (
    <div className="flex flex-col min-h-dynamic bg-cm-bg">
      <header className="flex items-center gap-3 px-4 pt-4 pb-2">
        <button onClick={() => { setFlag("reopen-menu", true); navigate("/") }} className="w-8 h-8 flex items-center justify-center rounded-xl bg-cm-elevated border border-cm-border cursor-pointer active:scale-[0.94] transition-transform shadow-sm">
          <ArrowLeft className="w-4 h-4 text-cm-text" />
        </button>
        <h1 className="text-[17px] font-extrabold text-cm-text">Vérification email</h1>
      </header>
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mb-4"><Clock className="w-8 h-8 text-amber-600" /></div>
        <h2 className="text-[18px] font-bold text-cm-text mb-2">Vérification en attente</h2>
        <p className="text-[13px] text-cm-text-soft">Un email de vérification a été envoyé à votre adresse. Cliquez sur le lien dans l'email pour confirmer.</p>
        <button className="mt-6 h-11 px-6 rounded-xl bg-cm-text text-white text-[13px] font-bold active:scale-[0.97] transition-transform">Renvoyer l'email</button>
      </div>
    </div>
  );
}
