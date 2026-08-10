import { ArrowLeft, CheckCircle, Upload } from "lucide-react";
import { useAppNavigation } from "../../navigation/useAppNavigation";

export default function VerifyIdentityPage() {
  const { navigate, setFlag } = useAppNavigation();
  return (
    <div className="flex flex-col min-h-dynamic bg-cm-bg">
      <header className="flex items-center gap-3 px-4 pt-4 pb-2">
        <button onClick={() => { setFlag("reopen-menu", true); navigate("/") }} className="p-1 cursor-pointer active:scale-[0.97] transition-transform touch-min">
          <ArrowLeft className="w-5 h-5 text-cm-text" />
        </button>
        <h1 className="text-[17px] font-extrabold text-cm-text">Vérification d'identité</h1>
      </header>
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-cm-surface flex items-center justify-center mb-4"><CheckCircle className="w-8 h-8 text-cm-text-muted" /></div>
        <h2 className="text-[18px] font-bold text-cm-text mb-2">Identité non vérifiée</h2>
        <p className="text-[13px] text-cm-text-soft">Vérifiez votre identité pour débloquer toutes les fonctionnalités de l'application.</p>
        <button className="mt-6 h-11 px-6 rounded-xl bg-cm-text text-white text-[13px] font-bold flex items-center gap-2 active:scale-[0.97] transition-transform">
          <Upload className="w-4 h-4" /> Télécharger une pièce d'identité
        </button>
      </div>
    </div>
  );
}
