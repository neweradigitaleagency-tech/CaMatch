import { useNavigate } from "react-router-dom";
import RequestCreationScreen from "../../components/RequestCreationScreen";
import type { AiRequestDetails } from "../../components/RequestCreationScreen";
import { useRequestStore } from "../../stores/requestStore";

function mockAiAnalyze(desc: string): Promise<AiRequestDetails> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const d = desc.toLowerCase();
      let category: "electricity" | "plumbing" | "ac" | "cleaning" = "ac";
      let subCategory = "Diagnostic Climatisation";
      let priceMin = 15000, priceMax = 25000;
      let summary = "Recharge de fréon split ou réparation de fuite d'air conditionné";
      if (d.includes("clim") || d.includes("climatiseur") || d.includes("froid") || d.includes("recharge")) {
        category = "ac"; subCategory = "Recharge Gaz Split"; priceMin = 20000; priceMax = 40000; summary = "Entretien ou recharge de gaz pour climatisation split.";
      } else if (d.includes("fuite") || d.includes("eau") || d.includes("plomb") || d.includes("tuyau") || d.includes("évier") || d.includes("robinet")) {
        category = "plumbing"; subCategory = "Dépannage Plomberie"; priceMin = 10000; priceMax = 20000; summary = "Réparation de fuite d'eau sous évier ou canalisation bouchée.";
      } else if (d.includes("prise") || d.includes("courant") || d.includes("grill") || d.includes("flash") || d.includes("élec") || d.includes("disjoncteur")) {
        category = "electricity"; subCategory = "Dépannage Électrique"; priceMin = 12000; priceMax = 18000; summary = "Remplacement de prise grillée ou diagnostic de panne électrique.";
      } else if (d.includes("ménage") || d.includes("nettoy") || d.includes("propreté") || d.includes("appartement")) {
        category = "cleaning"; subCategory = "Nettoyage Résidentiel"; priceMin = 15000; priceMax = 30000; summary = "Nettoyage standard et dépoussiérage d'un appartement.";
      }
      let urgency: "low" | "medium" | "high" | "emergency" = "medium";
      if (d.includes("urgent") || d.includes("inondation") || d.includes("critique") || d.includes("sauté") || d.includes("immédiat")) urgency = "high";
      if (d.includes("sos") || d.includes("danger") || d.includes("incendie")) urgency = "emergency";
      resolve({ category, subCategory, urgency, estimatedPriceMinXOF: priceMin, estimatedPriceMaxXOF: priceMax, summary });
    }, 2000);
  });
}

export default function RequestCreationPage() {
  const nav = useNavigate();
  const addRequest = useRequestStore((s) => s.addRequest);

  return (
    <RequestCreationScreen
      onBack={() => nav(-1)}
      onAnalyze={mockAiAnalyze}
      onProceedToMatching={(details) =>
        nav("/explorer/pro-selection", { state: { details } })
      }
      onSubmit={(req) => {
        addRequest({
          id: "cr_" + Date.now(),
          clientId: "client_marie",
          title: req.title,
          description: req.description,
          photos: [],
          category: req.category,
          address: req.address,
          budgetXOF: req.budgetXOF,
          urgency: req.urgency,
          status: "created",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        nav("/orders");
      }}
    />
  );
}
