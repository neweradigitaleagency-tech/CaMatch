import { useParams, useNavigate } from "react-router-dom";
import { useBackNavigation } from "../../hooks/useBackNavigation";
import RequestDetailScreen from "../../components/RequestDetailScreen";
import { useRequestStore } from "../../stores/requestStore";

export default function RequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const goBack = useBackNavigation("/orders");
  const request = useRequestStore((s) => s.requests.find((r) => r.id === id));
  const removeRequest = useRequestStore((s) => s.removeRequest);

  if (!request) {
    return (
      <div className="flex items-center justify-center min-h-dynamic bg-brand-cream">
        <p className="text-sm text-secondary">Demande introuvable</p>
      </div>
    );
  }

  return (
    <RequestDetailScreen
      request={request}
      onBack={goBack}
      onDelete={(id) => {
        removeRequest(id);
        navigate("/orders");
      }}
    />
  );
}
