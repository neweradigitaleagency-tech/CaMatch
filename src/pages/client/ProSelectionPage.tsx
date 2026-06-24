import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import ProSelectionScreen from "../../components/ProSelectionScreen";
import { usePros } from "../../hooks/useDatabase";
import type { ProfessionalDetails, Service } from "../../types";
import type { AiRequestDetails } from "../../components/RequestCreationScreen";

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function sendBrowserNotification(title: string, body: string) {
  if (!("Notification" in window) || Notification.permission === "denied") return;
  if (Notification.permission === "granted") {
    new Notification(title, { body, icon: "/vite.svg" });
  } else {
    Notification.requestPermission().then((perm) => {
      if (perm === "granted") new Notification(title, { body, icon: "/vite.svg" });
    });
  }
}

export default function ProSelectionPage() {
  const nav = useNavigate();
  const location = useLocation();
  const details = (location.state as { details: AiRequestDetails & { lat?: number; lng?: number } })?.details;
  const category = details?.category || "maison-reparations";
  const { data: allPros = [] } = usePros();

  const clientLat = details?.lat ?? 5.35;
  const clientLng = details?.lng ?? -4.00;
  const RADIUS_KM = 15;

  const proList: ProfessionalDetails[] = allPros.filter((p) => {
    if ((p.category as string) !== category) return false;
    if (p.availabilityStatus !== "available") return false;
    if (p.lat !== undefined && p.lng !== undefined) {
      const dist = haversineKm(clientLat, clientLng, p.lat, p.lng);
      if (dist > RADIUS_KM) return false;
    }
    return true;
  });

  useEffect(() => {
    if (proList.length > 0) {
      sendBrowserNotification(
        `${proList.length} pro(s) trouvé(s) !`,
        `${proList.length} professionnel${proList.length > 1 ? "s" : ""} disponible${proList.length > 1 ? "s" : ""} près de chez vous.`,
      );
    }
  }, [proList.length]);

  return (
    <ProSelectionScreen
      category={category}
      proList={proList}
      onBack={() => nav(-1)}
      onViewProfile={(pro) => nav(`/explorer/pro/${pro.id}`)}
      onSelectPro={(pro) => {
        const ms: Service = {
          id: "service_ai_" + Date.now(),
          proId: pro.id,
          name: details?.subCategory || "Dépannage IA",
          description: details?.summary || "Intervention diagnostiquée par intelligence artificielle",
          priceEstimateXOF:
            Math.round(((details?.estimatedPriceMinXOF || 0) + (details?.estimatedPriceMaxXOF || 10000)) / 2) || pro.hourlyRateXOF * 2,
        };
        nav("/explorer/matching", { state: { pro, services: [ms] } });
      }}
    />
  );
}
