import { useState, useCallback } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { useProOnboardingStore } from "../stores/proOnboardingStore";
import { ONBOARDING_STEPS } from "../types";
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

type StepId = typeof ONBOARDING_STEPS[number];

const STEP_TITLES: Record<StepId, { title: string; subtitle: string }> = {
  welcome: { title: "Bienvenue", subtitle: "Devenir professionnel sur ÇaMatch" },
  eligibility: { title: "Éligibilité", subtitle: "Vérifiez votre éligibilité" },
  categories: { title: "Vos métiers", subtitle: "Sélectionnez vos services" },
  location: { title: "Localisation", subtitle: "Où exercez-vous ?" },
  info: { title: "Informations", subtitle: "Votre profil professionnel" },
  documents: { title: "Documents", subtitle: "Pièces justificatives" },
  portfolio: { title: "Galerie", subtitle: "Vos réalisations" },
  "otp-phone": { title: "Téléphone", subtitle: "Vérification téléphone" },
  "otp-email": { title: "Email", subtitle: "Vérification email" },
  payment: { title: "Paiement", subtitle: "Moyen de paiement" },
  cgu: { title: "CGU", subtitle: "Conditions générales" },
  review: { title: "Récapitulatif", subtitle: "Vérifiez avant de soumettre" },
  pending: { title: "En cours", subtitle: "Votre demande est en cours" },
};

export default function ProOnboardingPage() {
  const navigate = useNavigate();
  const { step: rawStep } = useParams<{ step: string }>();
  const store = useProOnboardingStore();
  const setPro = useAuthStore((s) => s.setPro);
  const [submitting, setSubmitting] = useState(false);

  const step = (rawStep && ONBOARDING_STEPS.includes(rawStep as StepId) ? rawStep : "welcome") as StepId;
  const stepIndex = ONBOARDING_STEPS.indexOf(step);

  const initialized = store.initialized;
  const initialize = store.initialize;

  if (!initialized) {
    initialize();
    return null;
  }

  const goTo = useCallback((s: StepId) => {
    navigate(`/pro/onboarding/${s}`);
    store.setStep(ONBOARDING_STEPS.indexOf(s));
  }, [navigate, store]);

  const handleNext = useCallback(() => {
    if (stepIndex < ONBOARDING_STEPS.length - 2) {
      const next = ONBOARDING_STEPS[stepIndex + 1] as StepId;
      goTo(next);
    }
  }, [stepIndex, goTo]);

  const handleBack = useCallback(() => {
    if (stepIndex > 0) {
      const prev = ONBOARDING_STEPS[stepIndex - 1] as StepId;
      goTo(prev);
    }
  }, [stepIndex, goTo]);

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    store.submit();
    setPro();
    navigate("/pro/dashboard", { replace: true });
    setSubmitting(false);
  }, [store, setPro, navigate]);

  const canGoNext = step !== "categories"
    ? true
    : store.selectedSubCategories.length > 0;
  const nextLabel = step === "review" ? "Soumettre" : "Suivant";

  switch (step) {
    case "welcome":
      return (
        <OnboardingLayout
          title={STEP_TITLES.welcome.title}
          subtitle={STEP_TITLES.welcome.subtitle}
          hideNext
          onNext={() => goTo("eligibility")}
        >
          <WelcomeStep onStart={() => goTo("eligibility")} />
        </OnboardingLayout>
      );

    case "eligibility":
      return (
        <OnboardingLayout
          title={STEP_TITLES.eligibility.title}
          subtitle={STEP_TITLES.eligibility.subtitle}
          hideNext
          onNext={handleNext}
          onBack={handleBack}
        >
          <EligibilityStep onComplete={handleNext} />
        </OnboardingLayout>
      );

    case "categories":
      return (
        <OnboardingLayout
          title={STEP_TITLES.categories.title}
          subtitle={STEP_TITLES.categories.subtitle}
          onNext={handleNext}
          onBack={handleBack}
          disableNext={!canGoNext}
        >
          <CategoryPickerStep
            selectedCategoryIds={store.selectedCategoryIds}
            selectedSubCategories={store.selectedSubCategories}
            onCategoriesChange={(ids, subs) => {
              store.updateField("selectedCategoryIds", ids);
              store.updateField("selectedSubCategories", subs);
            }}
          />
        </OnboardingLayout>
      );

    case "location":
      return (
        <OnboardingLayout
          title={STEP_TITLES.location.title}
          subtitle={STEP_TITLES.location.subtitle}
          onNext={handleNext}
          onBack={handleBack}
        >
          <LocationStep
            location={store.location}
            serviceRadiusKm={store.serviceRadiusKm}
            onLocationChange={(loc) => store.updateField("location", loc)}
            onRadiusChange={(r) => store.updateField("serviceRadiusKm", r)}
          />
        </OnboardingLayout>
      );

    case "info":
      return (
        <OnboardingLayout
          title={STEP_TITLES.info.title}
          subtitle={STEP_TITLES.info.subtitle}
          onNext={handleNext}
          onBack={handleBack}
        >
          <ProInfoStep
            title={store.title}
            bio={store.bio}
            experienceYears={store.experienceYears}
            hourlyRateXOF={store.hourlyRateXOF}
            travelFeeXOF={store.travelFeeXOF}
            onChange={(field, value) => {
              if (field === "title") store.updateField("title", value as string);
              else if (field === "bio") store.updateField("bio", value as string);
              else if (field === "experienceYears") store.updateField("experienceYears", value as number);
              else if (field === "hourlyRateXOF") store.updateField("hourlyRateXOF", value as number);
              else if (field === "travelFeeXOF") store.updateField("travelFeeXOF", value as number);
            }}
          />
        </OnboardingLayout>
      );

    case "documents":
      return (
        <OnboardingLayout
          title={STEP_TITLES.documents.title}
          subtitle={STEP_TITLES.documents.subtitle}
          onNext={handleNext}
          onBack={handleBack}
        >
          <DocumentUploadStep
            documents={store.documents}
            onDocumentsChange={(docs) => store.updateField("documents", docs)}
          />
        </OnboardingLayout>
      );

    case "portfolio":
      return (
        <OnboardingLayout
          title={STEP_TITLES.portfolio.title}
          subtitle={STEP_TITLES.portfolio.subtitle}
          onNext={handleNext}
          onBack={handleBack}
        >
          <PortfolioStep
            items={store.portfolioItems}
            onItemsChange={(items) => store.updateField("portfolioItems", items)}
          />
        </OnboardingLayout>
      );

    case "otp-phone":
      return (
        <OnboardingLayout
          title={STEP_TITLES["otp-phone"].title}
          subtitle={STEP_TITLES["otp-phone"].subtitle}
          onNext={handleNext}
          onBack={handleBack}
        >
          <OtpStep
            type="phone"
            value={store.phone}
            verified={store.phoneVerified}
            onValueChange={(v) => store.updateField("phone", v)}
            onVerify={() => store.updateField("phoneVerified", true)}
          />
        </OnboardingLayout>
      );

    case "otp-email":
      return (
        <OnboardingLayout
          title={STEP_TITLES["otp-email"].title}
          subtitle={STEP_TITLES["otp-email"].subtitle}
          onNext={handleNext}
          onBack={handleBack}
        >
          <OtpStep
            type="email"
            value={store.email}
            verified={store.emailVerified}
            onValueChange={(v) => store.updateField("email", v)}
            onVerify={() => store.updateField("emailVerified", true)}
          />
        </OnboardingLayout>
      );

    case "payment":
      return (
        <OnboardingLayout
          title={STEP_TITLES.payment.title}
          subtitle={STEP_TITLES.payment.subtitle}
          onNext={handleNext}
          onBack={handleBack}
        >
          <PaymentStep
            paymentMethod={store.paymentMethod}
            paymentPhone={store.paymentPhone}
            onMethodChange={(m) => store.updateField("paymentMethod", m)}
            onPhoneChange={(p) => store.updateField("paymentPhone", p)}
          />
        </OnboardingLayout>
      );

    case "cgu":
      return (
        <OnboardingLayout
          title={STEP_TITLES.cgu.title}
          subtitle={STEP_TITLES.cgu.subtitle}
          onNext={handleNext}
          onBack={handleBack}
          disableNext={!store.cguAccepted || !store.signature}
        >
          <CguSignatureStep
            accepted={store.cguAccepted}
            signature={store.signature}
            onAcceptChange={(a) => store.updateField("cguAccepted", a)}
            onSignatureChange={(s) => store.updateField("signature", s)}
          />
        </OnboardingLayout>
      );

    case "review":
      return (
        <OnboardingLayout
          title={STEP_TITLES.review.title}
          subtitle={STEP_TITLES.review.subtitle}
          onNext={handleSubmit}
          onBack={handleBack}
          nextLabel="Soumettre"
          loading={submitting}
        >
          <ReviewStep data={store as any} />
        </OnboardingLayout>
      );

    case "pending":
      return (
        <OnboardingLayout title={STEP_TITLES.pending.title} subtitle={STEP_TITLES.pending.subtitle} hideNext>
          <div className="flex flex-col items-center pt-12 text-center">
            <div className="w-16 h-16 rounded-full bg-cm-accent-soft flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-cm-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="text-[18px] font-extrabold text-cm-text mb-2">Demande envoyée !</h2>
            <p className="text-[13px] text-cm-text-soft max-w-xs">
              Votre demande d'inscription a été soumise. Nous vous recontacterons sous 48h.
            </p>
          </div>
        </OnboardingLayout>
      );

    default:
      return <Navigate to="/pro/onboarding/welcome" replace />;
  }
}
