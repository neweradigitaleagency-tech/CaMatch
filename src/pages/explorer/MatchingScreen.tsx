import { useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useBackNavigation } from "../../hooks/useBackNavigation";
import MatchingDatePage from "../../components/matching/MatchingDatePage";
import MatchingConfirmPage from "../../components/matching/MatchingConfirmPage";
import type { BookingContextData, BookingMode } from "../../components/profil/types";
import type { ProfessionalDetails, Service } from "../../types";

interface MatchingLocationState {
  pro: ProfessionalDetails;
  services: Service[];
  mode?: BookingMode;
}

export default function MatchingScreen() {
  const nav = useNavigate();
  const goBack = useBackNavigation("/");
  const location = useLocation();
  const state = location.state as MatchingLocationState | null;

  const [step, setStep] = useState<"date" | "confirm">("date");
  const [booking, setBooking] = useState<BookingContextData>({
    mode: state?.mode || "live",
    professionalId: state?.pro.id || "",
    professionalName: state?.pro.name || "",
    professionalAvatar: state?.pro.avatarUrl || "",
    selectedServices: state?.services || [],
    travelFeeXOF: 5000,
  });

  const handleBack = useCallback(() => {
    if (step === "confirm") {
      setStep("date");
    } else {
      goBack();
    }
  }, [step, nav]);

  const handleNext = useCallback(() => {
    setStep("confirm");
  }, []);

  const handleConfirm = useCallback(() => {
    if (booking.mode === "simulation") {
      goBack();
    } else {
      // TODO: actual booking creation
      console.log("Booking confirmed:", booking);
      nav("/explorer/matching/success", { state: { booking } });
    }
  }, [booking, nav]);

  if (!state) {
    return (
      <div className="flex items-center justify-center min-h-dynamic bg-white">
        <p className="text-[13px] font-semibold text-gray-400">Aucune information de réservation</p>
      </div>
    );
  }

  if (step === "confirm") {
    return (
      <MatchingConfirmPage
        booking={booking}
        onBack={handleBack}
        onConfirm={handleConfirm}
      />
    );
  }

  return (
    <MatchingDatePage
      booking={booking}
      onUpdate={(data) => setBooking((prev) => ({ ...prev, ...data }))}
      onNext={handleNext}
      onBack={handleBack}
    />
  );
}
