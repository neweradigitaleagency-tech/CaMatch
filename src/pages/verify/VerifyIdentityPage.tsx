import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Upload } from "lucide-react";

export default function VerifyIdentityPage() {
  const nav = useNavigate();
  return (
    <div className="flex flex-col min-h-dynamic bg-cm-bg">
      <header className="flex items-center gap-3 px-4 pt-4 pb-2">
        <button onClick={() => nav("/", { state: { reopenMenu: true } })} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-gray-100 cursor-pointer active:scale-[0.94] transition-transform shadow-sm">
          <ArrowLeft className="w-4 h-4 text-[#2B2B2B]" />
        </button>
        <h1 className="text-[17px] font-extrabold text-[#2B2B2B]">Vérification d'identité</h1>
      </header>
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4"><CheckCircle className="w-8 h-8 text-gray-400" /></div>
        <h2 className="text-[18px] font-bold text-[#2B2B2B] mb-2">Identité non vérifiée</h2>
        <p className="text-[13px] text-gray-500">Vérifiez votre identité pour débloquer toutes les fonctionnalités de l'application.</p>
        <button className="mt-6 h-11 px-6 rounded-xl bg-[#2B2B2B] text-white text-[13px] font-bold flex items-center gap-2 active:scale-[0.97] transition-transform">
          <Upload className="w-4 h-4" /> Télécharger une pièce d'identité
        </button>
      </div>
    </div>
  );
}
