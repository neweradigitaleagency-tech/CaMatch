import { Check, MapPin, Briefcase, Clock, CreditCard } from "lucide-react";
import type { ProOnboardingData } from "../../types";

interface ReviewStepProps {
  data: ProOnboardingData;
}

export default function ReviewStep({ data }: ReviewStepProps) {
  return (
    <div>
      <h2 className="text-[18px] font-extrabold text-cm-text mb-1">Récapitulatif</h2>
      <p className="text-[13px] text-cm-text-soft mb-6">
        Vérifiez vos informations avant de soumettre.
      </p>

      <div className="space-y-3">
        <Section icon={Briefcase} title="Métiers">
          <p className="text-[12px] text-cm-text">
            {data.selectedSubCategories.length > 0
              ? data.selectedSubCategories.join(", ")
              : data.selectedCategoryIds.join(", ")}
          </p>
        </Section>

        <Section icon={MapPin} title="Localisation">
          <p className="text-[12px] text-cm-text">
            Rayon d'intervention : {data.serviceRadiusKm} km
          </p>
        </Section>

        <Section icon={Briefcase} title="Informations">
          <div className="text-[12px] text-cm-text space-y-1">
            <p><span className="text-cm-text-muted">Titre :</span> {data.title || "Non renseigné"}</p>
            <p><span className="text-cm-text-muted">Expérience :</span> {data.experienceYears} ans</p>
            <p><span className="text-cm-text-muted">Taux horaire :</span> {data.hourlyRateXOF.toLocaleString("fr-FR")} F</p>
          </div>
        </Section>

        <Section icon={Clock} title="Documents">
          <p className="text-[12px] text-cm-text">
            {data.documents.length} document{data.documents.length !== 1 ? "s" : ""} téléversé{data.documents.length !== 1 ? "s" : ""}
          </p>
        </Section>

        <Section icon={CreditCard} title="Paiement">
          <p className="text-[12px] text-cm-text">
            {data.paymentMethod ? `${data.paymentMethod.replace("_", " ")} - ${data.paymentPhone}` : "Non renseigné"}
          </p>
        </Section>
      </div>

      {data.cguAccepted && data.signature && (
        <div className="mt-4 p-3 bg-cm-accent-soft rounded-[12px] flex items-center gap-2">
          <Check className="w-4 h-4 text-cm-accent" />
          <span className="text-[12px] text-cm-accent font-medium">CGU acceptées et signées</span>
        </div>
      )}
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-cm-elevated border border-cm-border rounded-[14px] p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-cm-accent" />
        <h3 className="text-[13px] font-bold text-cm-text">{title}</h3>
      </div>
      {children}
    </div>
  );
}
