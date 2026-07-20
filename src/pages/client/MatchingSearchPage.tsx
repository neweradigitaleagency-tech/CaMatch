import { useNavigate, useParams } from "react-router-dom";
import MatchingSearchScreen from "../../components/wizard/MatchingSearchScreen";

export default function MatchingSearchPage() {
  const nav = useNavigate();
  const { requestId } = useParams<{ requestId: string }>();

  return (
    <MatchingSearchScreen
      onProposalsReceived={() => nav(`/orders/proposals/${requestId}`, { replace: true })}
    />
  );
}
