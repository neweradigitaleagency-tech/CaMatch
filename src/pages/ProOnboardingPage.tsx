import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProOnboardingStore } from "../stores/proOnboardingStore";
import OnboardingLayout from "../components/onboarding/OnboardingLayout";
import WelcomeStep from "../components/onboarding/WelcomeStep";
import EligibilityStep from "../components/onboarding/EligibilityStep";
import CategoryPickerStep from "../components/onboarding/CategoryPickerStep";
import LocationStep from "../components/onboarding/LocationStep";
import ProInfoStep from "../components/onboarding/ProInfoStep";
import DocumentUploadStep from "../components/onboarding/DocumentUploadStep";
import PortfolioStep from "../components/onboarding/PortfolioStep";
import OtpStep from "../components/onboarding/OtpStep";
import PaymentStep from "../components/onboarding/PaymentStep";
import CguSignatureStep from "../components/onboarding/CguSignatureStep";
import ReviewStep from "../components/onboarding/ReviewStep";
import PendingStep from "../components/onboarding/PendingStep";
import type { OnboardingStepId } from "../types";

const STEP_IDS: OnboardingStepId[] = [
  "welcome", "eligibility", "categories", "location", "info",
  "documents", "portfolio", "otp-phone", "otp-email",
  "payment", "cgu", "review", "pending",
];

const STEP_TITLES: Record<string, string> = {
  welcome: "Devenir Professionnel",
  eligibility: "Éligibilité",
  categories: "Vos métiers",
  location: "Localisation",
  info: "Informations",
  documents: "Documents",
  portfolio: "Galerie",
  "otp-phone": "Vérification téléphone",
  "otp-email": "Vérification email",
  payment: "Moyen de paiement",
  cgu: "Conditions générales",
  review: "Récapitulatif",
  pending: "En cours",
};

export default function ProOnboardingPage() {
  const nav = useNavigate();
  const store = useProOnboardingStore();
  const { initialized, initialize, currentStep, setStep, updateField, submit, reset } = store;

  useEffect(() => {
    if (!initialized) initialize();
  }, [initialized, initialize]);

  if (!initialized) return null;

  const stepId = STEP_IDS[currentStep];
  const isLastStep = currentStep >= STEP_IDS.length - 1;
  const isFirstStep = currentStep === 0;
  if (!stepId) return null;

  const handleNext = () => {
    if (currentStep === 0) {
      setStep(1);
    } else if (currentStep === 1) {
      setStep(2);
    } else if (currentStep === 2) {
      if (!store.selectedCategoryIds.length && !store.selectedSubCategories.length) return;
      setStep(3);
    } else if (currentStep === 3) {
      setStep(4);
    } else if (currentStep === 4) {
      if (!store.title) return;
      setStep(5);
    } else if (currentStep === 5) {
      if (store.documents.length === 0) return;
      setStep(6);
    } else if (currentStep === 6) {
      setStep(7);
    } else if (currentStep === 7) {
      if (!store.phoneVerified) return;
      setStep(8);
    } else if (currentStep === 8) {
      if (!store.emailVerified) return;
      setStep(9);
    } else if (currentStep === 9) {
      if (!store.paymentMethod || !store.paymentPhone) return;
      setStep(10);
    } else if (currentStep === 10) {
      if (!store.cguAccepted) return;
      setStep(11);
    } else if (currentStep === 11) {
      submit();
    }
  };

  const handleBack = () => {
    if (currentStep <= 0) {
      nav(-1);
      return;
    }
    setStep(currentStep - 1);
  };

  const handleRestart = () => {
    reset();
    setStep(0);
  };

  const disableNext = (() => {
    if (currentStep === 2) return !store.selectedCategoryIds.length && !store.selectedSubCategories.length;
    if (currentStep === 4) return !store.title;
    if (currentStep === 5) return store.documents.length === 0;
    if (currentStep === 7) return !store.phoneVerified;
    if (currentStep === 8) return !store.emailVerified;
    if (currentStep === 9) return !store.paymentMethod || !store.paymentPhone;
    if (currentStep === 10) return !store.cguAccepted;
    return false;
  })();

  const hideNext = currentStep === 0 || stepId === "pending";

  const nextLabel = isLastStep ? "Soumettre" : "Suivant";

  const renderStep = () => {
    switch (stepId) {
      case "welcome":
        return <WelcomeStep onStart={() => setStep(1)} />;

      case "eligibility":
        return <EligibilityStep onComplete={() => setStep(2)} />;

      case "categories":
        return (
          <CategoryPickerStep
            selectedCategoryIds={store.selectedCategoryIds}
            selectedSubCategories={store.selectedSubCategories}
            onCategoriesChange={(cats, subs) => {
              updateField("selectedCategoryIds", cats);
              updateField("selectedSubCategories", subs);
            }}
          />
        );

      case "location":
        return (
          <LocationStep
            location={store.location}
            serviceRadiusKm={store.serviceRadiusKm}
            onLocationChange={(loc) => updateField("location", loc)}
            onRadiusChange={(r) => updateField("serviceRadiusKm", r)}
          />
        );

      case "info":
        return (
          <ProInfoStep
            title={store.title}
            bio={store.bio}
            experienceYears={store.experienceYears}
            hourlyRateXOF={store.hourlyRateXOF}
            travelFeeXOF={store.travelFeeXOF}
            onChange={(field, value) => updateField(field as any, value)}
          />
        );

      case "documents":
        return (
          <DocumentUploadStep
            documents={store.documents}
            onDocumentsChange={(docs) => updateField("documents", docs)}
          />
        );

      case "portfolio":
        return (
          <PortfolioStep
            items={store.portfolioItems}
            onItemsChange={(items) => updateField("portfolioItems", items)}
          />
        );

      case "otp-phone":
        return (
          <OtpStep
            type="phone"
            value={store.phone}
            verified={store.phoneVerified}
            onValueChange={(v) => updateField("phone", v)}
            onVerify={() => updateField("phoneVerified", true)}
          />
        );

      case "otp-email":
        return (
          <OtpStep
            type="email"
            value={store.email}
            verified={store.emailVerified}
            onValueChange={(v) => updateField("email", v)}
            onVerify={() => updateField("emailVerified", true)}
          />
        );

      case "payment":
        return (
          <PaymentStep
            paymentMethod={store.paymentMethod}
            paymentPhone={store.paymentPhone}
            onMethodChange={(m) => updateField("paymentMethod", m)}
            onPhoneChange={(p) => updateField("paymentPhone", p)}
          />
        );

      case "cgu":
        return (
          <CguSignatureStep
            accepted={store.cguAccepted}
            signature={store.signature}
            onAcceptChange={(a) => updateField("cguAccepted", a)}
            onSignatureChange={(s) => updateField("signature", s)}
          />
        );

      case "review":
        return <ReviewStep data={store} />;

      case "pending":
        return <PendingStep status={store.status} reviewNotes={store.reviewNotes} />;

      default:
        return null;
    }
  };

  if (stepId === "welcome") {
    return (
      <div className="min-h-screen bg-cm-bg">
        <div className="max-w-md mx-auto px-4 py-8">
          {renderStep()}
        </div>
      </div>
    );
  }

  if (stepId === "pending" || !stepId) {
    return (
      <div className="min-h-screen bg-cm-bg">
        <div className="max-w-md mx-auto px-4 py-8">
          {renderStep()}
          {store.status === "APPROVED" && (
            <div className="mt-6 space-y-3">
              <button onClick={() => nav("/pro/dashboard")}
                className="w-full h-12 bg-cm-accent rounded-[16px] text-[14px] font-bold text-white cursor-pointer hover:opacity-90 active:scale-[0.97] transition-all">
                Accéder au tableau de bord
              </button>
            </div>
          )}
          {store.status === "REJECTED" && (
            <button onClick={handleRestart}
              className="w-full mt-4 h-12 bg-cm-accent rounded-[16px] text-[14px] font-bold text-white cursor-pointer hover:opacity-90 active:scale-[0.97] transition-all">
              Recommencer
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <OnboardingLayout
      title={STEP_TITLES[stepId] || "Devenir Professionnel"}
      onNext={handleNext}
      onBack={handleBack}
      nextLabel={nextLabel}
      disableNext={disableNext}
      hideNext={hideNext}
    >
      {renderStep()}
    </OnboardingLayout>
  );
}
