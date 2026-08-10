import { useParams } from "react-router-dom";
import ProposalDetailScreen from "../../components/proposals/ProposalDetailScreen";
import { useAppNavigation } from "../../navigation/useAppNavigation";
import { useMatchingStore } from "../../stores/matchingStore";
import { acceptProposalToMission } from "../../services/missionSync";

export default function ProposalDetailPage() {
  const { goBack, replace } = useAppNavigation();
  const { requestId, proposalId } = useParams<{ requestId: string; proposalId: string }>();
  const proposal = useMatchingStore((s) => s.getProposalById(requestId || "", proposalId || ""));
  const { acceptProposal } = useMatchingStore();

  const handleChoose = () => {
    if (!proposal || !requestId) return;

    acceptProposal(requestId, proposal.id);
    const { missionId } = acceptProposalToMission(proposal, requestId);

    replace(`/orders/tracker/${missionId}`);
  };

  if (!proposal) {
    return (
      <div className="flex items-center justify-center min-h-dynamic bg-cm-bg px-8">
        <p className="text-[13px] text-cm-text-muted">Proposition introuvable</p>
      </div>
    );
  }

  return (
    <ProposalDetailScreen
      proposal={proposal}
      onBack={goBack}
      onChoose={handleChoose}
    />
  );
}
