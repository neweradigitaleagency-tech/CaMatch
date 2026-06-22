import { useNavigate } from "react-router-dom";
import RequestCreationScreen from "../../components/RequestCreationScreen";
import type { AiRequestDetails } from "../../components/RequestCreationScreen";
import { useRequestStore } from "../../stores/requestStore";
import { useProStore } from "../../stores/proStore";
import type { ProAlert } from "../../types";

function mockAiAnalyze(desc: string): Promise<AiRequestDetails> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const d = desc.toLowerCase();
      let category: "electricity" | "plumbing" | "ac" | "carpenter" = "ac";
      let subCategory = "Diagnostic Climatisation";
      let priceMin = 15000, priceMax = 25000;
      let summary = "Recharge de fréon split ou réparation de fuite d'air conditionné";
      if (d.includes("clim") || d.includes("climatiseur") || d.includes("froid") || d.includes("recharge")) {
        category = "ac"; subCategory = "Recharge Gaz Split"; priceMin = 20000; priceMax = 40000; summary = "Entretien ou recharge de gaz pour climatisation split.";
      } else if (d.includes("fuite") || d.includes("eau") || d.includes("plomb") || d.includes("tuyau") || d.includes("évier") || d.includes("robinet")) {
        category = "plumbing"; subCategory = "Dépannage Plomberie"; priceMin = 10000; priceMax = 20000; summary = "Réparation de fuite d'eau sous évier ou canalisation bouchée.";
      } else if (d.includes("prise") || d.includes("courant") || d.includes("grill") || d.includes("flash") || d.includes("élec") || d.includes("disjoncteur")) {
        category = "electricity"; subCategory = "Dépannage Électrique"; priceMin = 12000; priceMax = 18000; summary = "Remplacement de prise grillée ou diagnostic de panne électrique.";
      } else if (d.includes("menuis") || d.includes("bois") || d.includes("meuble") || d.includes("étagère") || d.includes("porte")) {
        category = "carpenter"; subCategory = "Fabrication & Réparation"; priceMin = 20000; priceMax = 50000; summary = "Fabrication de meubles sur mesure ou réparation d'éléments en bois.";
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

  function handleCreate(req: {
    title: string; description: string; photos: string[]; category: string;
    address: string; budgetXOF: number; urgency: "immediate" | "today" | "this_week" | "flexible";
  }) {
    addRequest({
      id: "cr_" + Date.now(), clientId: "client_marie", title: req.title,
      description: req.description, photos: [], category: req.category,
      address: req.address, budgetXOF: req.budgetXOF, urgency: req.urgency,
      status: "created", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    });
    const newAlert: ProAlert = {
      id: "alert_" + Date.now(), clientName: "Marie K.", clientPhone: "+225 01 02 03 04",
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
          photos: [], category: details.category, address: details.address,
          budgetXOF: details.estimatedPriceMinXOF,
          urgency: details.urgency === "emergency" ? "immediate" : details.urgency === "high" ? "today" : details.urgency === "medium" ? "this_week" : "flexible",
        });
        nav("/explorer/pro-selection", { state: { details } });
      }}
      onSubmit={(req) => {
        handleCreate(req);
        nav("/orders");
      }}
    />
  );
}
