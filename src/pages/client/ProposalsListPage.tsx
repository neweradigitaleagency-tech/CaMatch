import { useParams } from "react-router-dom";
import ProposalsListScreen from "../../components/proposals/ProposalsListScreen";
import { useMatchingStore } from "../../stores/matchingStore";

export default function ProposalsListPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const proposals = useMatchingStore((s) => s.proposals[requestId || ""]) || [];

  return <ProposalsListScreen proposals={proposals} requestId={requestId || ""} />;
}
