import { useLocation, useNavigate } from "react-router-dom";
import InvoiceScreen from "../../components/InvoiceScreen";
import type { Mission, Invoice } from "../../types";

const MOCK_INVOICE: Invoice = {
  id: "INV-2026-001",
  missionId: "m1",
  clientId: "client_marie",
  proId: "pro3",
  clientName: "Marie Kouadio",
  proName: "Mamadou K.",
  category: "ac",
  address: "Cocody Riviera 3, Abidjan",
  reason: "Diagnostic et recharge fréon du split climatisation ne soufflant que de l'air chaud.",
  laborCostXOF: 15000,
  materialsCostXOF: 12000,
  travelCostXOF: 5000,
  totalXOF: 35000,
  commissionPercent: 15,
  commissionXOF: 5250,
  proAmountXOF: 29750,
  beforePhotos: [
    "https://images.unsplash.com/photo-1585774923346-0ac6d18c29b0?w=400&h=300&fit=crop",
  ],
  afterPhotos: [
    "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=300&fit=crop",
  ],
  clientRating: 9,
  clientComment: "Très professionnel, intervention rapide et propre. Je recommande !",
  createdAt: "2026-06-17T12:00:00Z",
  paidAt: "2026-06-17T12:30:00Z",
};

export default function InvoicePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const mission = (location.state as { mission: Mission })?.mission;

  if (!mission) {
    navigate("/orders", { replace: true });
    return null;
  }

  return (
    <InvoiceScreen
      mission={mission}
      invoice={MOCK_INVOICE}
      onBack={() => navigate(-1)}
    />
  );
}
