import { useNavigate } from "react-router-dom";
import RequestCreationScreen from "../../components/RequestCreationScreen";
import type { AiRequestDetails, RequestPayload } from "../../components/RequestCreationScreen";
import { useRequestStore } from "../../stores/requestStore";
import { useProStore } from "../../stores/proStore";
import type { ProAlert } from "../../types";
import { findBestMatch } from "../../data/serviceCategories";

function mockAiAnalyze(desc: string): Promise<AiRequestDetails> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const d = desc.toLowerCase();
      const match = findBestMatch(desc);
      const category = (match?.categoryId || "maison-reparations") as AiRequestDetails["category"];
      const subCategory = match?.subName || "Autre";

      let priceMin = 15000, priceMax = 25000;
      let summary = "Intervention diagnostiquée par intelligence artificielle";

      if (d.includes("clim") || d.includes("climatiseur") || d.includes("froid") || d.includes("recharge")) {
        priceMin = 20000; priceMax = 40000; summary = "Entretien ou recharge de gaz pour climatisation split.";
      } else if (d.includes("fuite") || d.includes("eau") || d.includes("plomb") || d.includes("tuyau") || d.includes("évier") || d.includes("robinet")) {
        priceMin = 10000; priceMax = 20000; summary = "Réparation de fuite d'eau sous évier ou canalisation bouchée.";
      } else if (d.includes("prise") || d.includes("courant") || d.includes("grill") || d.includes("flash") || d.includes("élec") || d.includes("disjoncteur")) {
        priceMin = 12000; priceMax = 18000; summary = "Remplacement de prise grillée ou diagnostic de panne électrique.";
      } else if (d.includes("menuis") || d.includes("bois") || d.includes("meuble") || d.includes("étagère") || d.includes("porte")) {
        priceMin = 20000; priceMax = 50000; summary = "Fabrication de meubles sur mesure ou réparation d'éléments en bois.";
      } else if (d.includes("livraison") || d.includes("colis") || d.includes("coursier") || d.includes("transport")) {
        priceMin = 5000; priceMax = 15000; summary = "Livraison ou transport de colis / marchandises.";
      } else if (d.includes("photo") || d.includes("mariage") || d.includes("dj") || d.includes("traiteur") || d.includes("événement") || d.includes("evenement")) {
        priceMin = 50000; priceMax = 150000; summary = "Prestation événementielle (photo, DJ, traiteur, etc.).";
      } else if (d.includes("cours") || d.includes("soutien") || d.includes("math") || d.includes("anglais") || d.includes("langue")) {
        priceMin = 10000; priceMax = 30000; summary = "Cours particulier ou soutien scolaire.";
      } else if (d.includes("site") || d.includes("app") || d.includes("développ") || d.includes("developp") || d.includes("logo") || d.includes("réseau") || d.includes("reseau")) {
        priceMin = 25000; priceMax = 100000; summary = "Création de site web, application ou design graphique.";
      } else if (d.includes("ménage") || d.includes("menage") || d.includes("babysit") || d.includes("garde") || d.includes("course")) {
        priceMin = 8000; priceMax = 20000; summary = "Service à la personne : ménage, garde ou accompagnement.";
      }

      let urgency: "low" | "medium" | "high" | "emergency" = "medium";
      if (d.includes("urgent") || d.includes("inondation") || d.includes("critique") || d.includes("sauté") || d.includes("immédiat")) urgency = "high";
      if (d.includes("sos") || d.includes("danger") || d.includes("incendie")) urgency = "emergency";
      resolve({ category, subCategory, urgency, estimatedPriceMinXOF: priceMin, estimatedPriceMaxXOF: priceMax, summary });
    }, 2000);
  });
}

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
      onAnalyze={mockAiAnalyze}
      onProceedToMatching={(details) => {
        handleCreate({
          title: details.summary.slice(0, 50), description: details.description,
          photos: [], videos: details.videos,
          category: details.category, subCategory: details.subCategory,
          address: details.address,
          lat: details.lat, lng: details.lng,
          budgetXOF: details.estimatedPriceMinXOF,
          urgency: details.urgency === "emergency" ? "immediate" : details.urgency === "high" ? "today" : details.urgency === "medium" ? "this_week" : "flexible",
          scheduledAt: details.scheduledAt,
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
