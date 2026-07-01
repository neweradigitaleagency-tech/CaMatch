import { useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ProSelectionScreen from "../../components/ProSelectionScreen";
import { useRequestStore } from "../../stores/requestStore";
import type { ProceedDetails } from "../../components/RequestCreationScreen";
import type { ProfessionalDetails, Mission, Service } from "../../types";
import { usePros } from "../../hooks/useDatabase";
import { haversineKm } from "../../stores/locationStore";

const RADII = [5, 10, 15, 30, 60, Infinity];

export default function ProSelectionPage() {
  const nav = useNavigate();
  const location = useLocation();
  const details = (location.state as { details: ProceedDetails })?.details;
  const category = details?.category || "maison-reparations";
  const subCategory = details?.subCategory;
  const { data: allPros = [] } = usePros();

  const clientLat = details?.lat ?? 5.35;
  const clientLng = details?.lng ?? -4.00;

  const setMissions = useRequestStore((s) => s.setMissions);
  const missions = useRequestStore((s) => s.missions);

  const { proList, activeRadius } = useMemo(() => {
    const withSub: ProfessionalDetails[] = allPros.filter((p) => {
      if ((p.category as string) !== category) return false;
      if (subCategory && p.subCategory !== subCategory) return false;
      if (p.availabilityStatus !== "available") return false;
      return true;
    });

    const withDistance = withSub.map((p) => ({
      pro: p,
      dist: p.lat !== undefined && p.lng !== undefined
        ? haversineKm({ lat: clientLat, lng: clientLng }, { lat: p.lat, lng: p.lng })
        : Infinity,
    })).sort((a, b) => a.dist - b.dist);

    for (const radius of RADII) {
      const filtered = withDistance.filter((p) => p.dist <= radius);
      if (filtered.length > 0) {
        return { proList: filtered.map((p) => p.pro), activeRadius: radius };
      }
    }

    return { proList: withDistance.map((p) => p.pro), activeRadius: Infinity };
  }, [allPros, category, subCategory, clientLat, clientLng]);

  return (
    <ProSelectionScreen
      category={subCategory || category}
      proList={proList}
      activeRadius={activeRadius}
      onBack={() => nav(-1)}
      onViewProfile={(pro) => nav(`/explorer/pro/${pro.id}`)}
      onSelectPro={(pro) => {
        const ms: Service = {
          id: "service_" + Date.now(),
          proId: pro.id,
          name: subCategory || "Dépannage",
          description: details?.description?.slice(0, 100) || "Intervention",
          priceEstimateXOF: details?.budgetMax || pro.hourlyRateXOF * 2,
        };
        const missionId = "mission_" + Date.now();
        const newMission: Mission = {
          id: missionId,
          requestId: "req_" + Date.now(),
          clientId: "client_marie",
          proId: pro.id,
          status: "accepted",
          title: ms.name,
          description: ms.description,
          category: pro.category,
          subCategory: pro.subCategory,
          address: pro.locationNeighborhood,
          budgetXOF: ms.priceEstimateXOF + 5000,
          photos: [],
          proName: pro.name,
          proAvatar: pro.avatarUrl || "",
          proPhone: pro.phoneNumber,
          clientName: "Marie",
          clientPhone: "+225 01 02 03 04",
          createdAt: new Date().toISOString(),
          acceptedAt: new Date().toISOString(),
        };
        setMissions([newMission, ...missions]);
        nav(`/orders/payment/${missionId}`);
      }}
    />
  );
}
