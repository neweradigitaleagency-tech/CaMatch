import { ArrowLeft, FileText, AlertCircle } from "lucide-react";
import { useState } from "react";

interface TermsScreenProps { onBack: () => void; }

const SECTIONS = [
  {
    title: "1. Acceptation des conditions",
    content: "En utilisant l'application Ça Match, vous acceptez les présentes conditions générales d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser l'application.",
  },
  {
    title: "2. Description du service",
    content: "Ça Match est une plateforme de mise en relation entre clients et professionnels de services à domicile. Nous ne sommes pas prestataires de services mais une plateforme intermédiaire.",
  },
  {
    title: "3. Inscription et compte",
    content: "Vous êtes responsable de la confidentialité de vos identifiants de connexion. Toute activité effectuée depuis votre compte est de votre responsabilité.",
  },
  {
    title: "4. Paiements",
    content: "Les paiements sont traités via les moyens de paiement mobile (Wave, Orange Money, MTN MoMo). Une commission de plateforme peut être appliquée sur chaque transaction.",
  },
  {
    title: "5. Annulations et remboursements",
    content: "Les conditions d'annulation dépendent du professionnel. En cas de litige, Ça Match propose une médiation entre les parties.",
  },
  {
    title: "6. Protection des données",
    content: "Vos données personnelles sont traitées conformément à notre politique de confidentialité. Nous ne partageons pas vos informations avec des tiers sans votre consentement.",
  },
  {
    title: "7. Responsabilité",
    content: "Ça Match agit comme intermédiaire et ne peut être tenu responsable de la qualité des prestations fournies par les professionnels inscrits sur la plateforme.",
  },
  {
    title: "8. Modification des conditions",
    content: "Nous nous réservons le droit de modifier ces conditions à tout moment. Les utilisateurs seront informés des changements importants par email ou notification.",
  },
];

export default function TermsScreen({ onBack }: TermsScreenProps) {
  const [openSection, setOpenSection] = useState<number | null>(0);

  return (
    <div className="flex flex-col w-full min-h-screen bg-cm-bg pb-32">
      <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-10 bg-cm-elevated border-b border-cm-border">
        <button onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-[12px] border border-cm-border bg-cm-elevated cursor-pointer active:scale-90 transition-all">
          <ArrowLeft className="w-4 h-4 text-cm-text" />
        </button>
        <h1 className="text-[15px] font-bold text-cm-text">Conditions d'utilisation</h1>
        <div className="w-9 h-9" />
      </header>

      <div className="mx-4 pt-4">
        <div className="bg-cm-elevated border border-cm-border rounded-[20px] p-5 mb-4 flex items-center gap-3 shadow-cm-sm">
          <div className="w-10 h-10 rounded-[12px] bg-cm-accent-soft flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-cm-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-cm-text">Version 1.0</p>
            <p className="text-[11px] text-cm-text-muted">Dernière mise à jour : Juin 2026</p>
          </div>
        </div>

        <div className="space-y-2">
          {SECTIONS.map((section, i) => (
            <div key={i} className="bg-cm-elevated border border-cm-border rounded-[16px] overflow-hidden shadow-cm-sm">
              <button onClick={() => setOpenSection(openSection === i ? null : i)}
                className="w-full flex items-center justify-between px-4 py-3.5 cursor-pointer text-left">
                <p className="text-[13px] font-bold text-cm-text">{section.title}</p>
                <AlertCircle className={`w-4 h-4 text-cm-text-muted transition-transform ${openSection === i ? "rotate-180" : ""}`} />
              </button>
              {openSection === i && (
                <div className="px-4 pb-3.5">
                  <p className="text-[12px] text-cm-text-soft leading-relaxed">{section.content}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="text-[11px] text-cm-text-muted mt-4 px-1 leading-relaxed text-center">
          En utilisant Ça Match, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
        </p>
      </div>
    </div>
  );
}
