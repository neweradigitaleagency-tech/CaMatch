import { useParams } from "react-router-dom";
import RequestDetailScreen from "../../components/RequestDetailScreen";
import { useAppNavigation } from "../../navigation/useAppNavigation";
import { useRequestStore } from "../../stores/requestStore";

export default function RequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { goBack, complete } = useAppNavigation();
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
        complete();
      }}
    />
  );
}
