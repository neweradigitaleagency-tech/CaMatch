import { useNavigate } from "react-router-dom";
import RequestCreationScreen, { ProceedDetails, RequestPayload } from "../../components/RequestCreationScreen";
import { useRequestStore } from "../../stores/requestStore";
import { useProStore } from "../../stores/proStore";
import type { ProAlert } from "../../types";

function mapUrgency(u: "immediate" | "today" | "this_week" | "flexible"): ProAlert["urgency"] {
  switch (u) { case "immediate": return "emergency"; case "today": return "high"; case "this_week": return "medium"; case "flexible": return "low"; }
}

export default function RequestCreationPage() {
  const nav = useNavigate();
  const addRequest = useRequestStore((s) => s.addRequest);
  const proAlerts = useProStore((s) => s.alerts);
  const setProAlerts = useProStore((s) => s.setAlerts);

  function handleCreate(req: RequestPayload) {
    const requestId = "cr_" + Date.now();
    addRequest({
      id: requestId, clientId: "client_marie", title: req.title,
      description: req.description, photos: req.photos || [], videos: req.videos,
      category: req.category, subCategory: req.subCategory,
      address: req.address, addressDetails: undefined,
      lat: req.lat, lng: req.lng,
      budgetXOF: req.budgetXOF, urgency: req.urgency,
      scheduledAt: req.scheduledAt,
      materialsProvided: req.materialsProvided,
      materialsCost: req.materialsCost,
      status: "published", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    });
    const newAlert: ProAlert = {
      id: "alert_" + Date.now(), requestId: requestId,
      clientName: "Marie K.", clientPhone: "+225 01 02 03 04",
      category: req.category, description: req.description, urgency: mapUrgency(req.urgency),
      estimatedPriceMinXOF: req.budgetXOF || 15000, estimatedPriceMaxXOF: (req.budgetXOF || 15000) * 2,
      location: req.address, sentAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 120000).toISOString(),
    };
    setProAlerts([newAlert, ...proAlerts]);
  }

  return (
    <RequestCreationScreen
      onBack={() => nav(-1)}
      onProceedToMatching={(details) => {
        handleCreate({
          title: details.description.slice(0, 50),
          description: details.description,
          photos: [],
          videos: details.videoUrls.length > 0 ? details.videoUrls : undefined,
          category: details.category,
          subCategory: details.subCategory,
          address: details.address,
          lat: details.lat,
          lng: details.lng,
          budgetXOF: details.budgetMax,
          urgency: details.urgency,
          scheduledAt: details.scheduledAt || undefined,
          materialsProvided: details.materialsProvided,
          materialsCost: details.materialsCost,
        });
        nav("/explorer/pro-selection", { state: { details } });
      }}
      onSubmit={(req: RequestPayload) => {
        handleCreate(req);
        nav("/orders");
      }}
    />
  );
}
