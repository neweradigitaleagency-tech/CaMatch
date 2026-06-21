import { useParams, useNavigate } from "react-router-dom";
import RequestDetailScreen from "../../components/RequestDetailScreen";
import { useRequestStore } from "../../stores/requestStore";

export default function RequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const request = useRequestStore((s) => s.requests.find((r) => r.id === id));
  const removeRequest = useRequestStore((s) => s.removeRequest);

  if (!request) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-brand-cream">
        <p className="text-sm text-secondary">Demande introuvable</p>
      </div>
    );
  }

  return (
    <RequestDetailScreen
      request={request}
      onBack={() => navigate(-1)}
      onDelete={(id) => {
        removeRequest(id);
        navigate("/orders");
      }}
    />
  );
}
