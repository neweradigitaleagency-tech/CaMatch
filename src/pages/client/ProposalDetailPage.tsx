import { useParams } from "react-router-dom";
import ProposalDetailScreen from "../../components/proposals/ProposalDetailScreen";
import { useAppNavigation } from "../../navigation/useAppNavigation";
import { useMatchingStore } from "../../stores/matchingStore";
import { useRequestStore } from "../../stores/requestStore";
import { useChatStore } from "../../stores/chatStore";
import { useEscrowStore } from "../../stores/escrowStore";
import { useProStore } from "../../stores/proStore";
import { MOCK_WORKFLOW_ESCROW } from "../../data/mockWorkflowData";
import type { Mission } from "../../types";

export default function ProposalDetailPage() {
  const { goBack, replace } = useAppNavigation();
  const { requestId, proposalId } = useParams<{ requestId: string; proposalId: string }>();
  const proposal = useMatchingStore((s) => s.getProposalById(requestId || "", proposalId || ""));
  const { acceptProposal } = useMatchingStore();
  const { addMission } = useRequestStore();

  const handleChoose = () => {
    if (!proposal || !requestId) return;

    acceptProposal(requestId, proposal.id);

    const missionId = "mission_" + Date.now();
    const now = new Date().toISOString();
    const newMission: Mission = {
      id: missionId,
      requestId,
      clientId: "client_marie",
      proId: proposal.professionalId,
      status: "pending",
      title: proposal.professionalName
        ? `Intervention ${proposal.professionalName}`
        : "Intervention",
      description: proposal.message?.slice(0, 100) || "Mission créée",
      category: "maison-reparations",
      address: "",
      budgetXOF: proposal.totalXOF,
      photos: [],
      proName: proposal.professionalName,
      proAvatar: proposal.professionalAvatar,
      proPhone: "+225 07 00 00 00",
      clientName: "Marie",
      clientPhone: "+225 01 02 03 04",
      quoteId: proposal.id,
      createdAt: now,
      acceptedAt: now,
      estimatedArrivalMinutes: proposal.estimatedArrivalMinutes,
      durationMins: proposal.estimatedDurationMins,
    };
    addMission(newMission);

    const chatStore = useChatStore.getState();
    const existingConv = chatStore.conversations.find((c) => c.missionId === missionId);
    if (!existingConv) {
      const conv: import("../../types").Conversation = {
        id: "conv_" + Date.now(),
        participants: ["client_marie", proposal.professionalId || "pro_unknown"],
        missionId,
        state: "active",
        metadata: {
          mission_phase: "accepted",
          flags: { dispute: false, support_joined: false, pinned: false },
          job_snapshot: {
            category: "maison-reparations",
            location: "Cocody Riviera 3",
            price_estimate: proposal.totalXOF,
            currency: "XOF",
            service_type: "on_demand",
          },
          created_from: "job_accept",
        },
        lastMessage: "Proposition acceptée. La mission commence !",
        lastMessageAt: now,
        unreadCount: 1,
        otherUserName: proposal.professionalName,
        otherUserAvatar: proposal.professionalAvatar,
        otherUserRating: proposal.professionalRating,
        otherUserVerified: proposal.isVerified,
        otherUserOnline: true,
      };
      chatStore.conversations = [...chatStore.conversations, conv];
      const sysMsg: import("../../types").Message = {
        id: "sys_" + Date.now(),
        conversationId: conv.id,
        senderId: null,
        type: "system",
        text: "Proposition acceptée. La mission commence !",
        photos: [],
        riskScore: 0,
        moderationAction: "none",
        createdAt: now,
        status: "read",
      };
      chatStore.messages = { ...chatStore.messages, [conv.id]: [sysMsg] };
    }

    const escrowStore = useEscrowStore.getState();
    const existingEscrow = escrowStore.entries.find((e) => e.missionId === missionId);
    if (!existingEscrow) {
      escrowStore.entries = [...escrowStore.entries, {
        ...MOCK_WORKFLOW_ESCROW,
        id: "escrow_" + Date.now(),
        missionId,
        proId: proposal.professionalId || "pro_unknown",
        amountXOF: proposal.totalXOF,
        proAmountXOF: Math.round(proposal.totalXOF * 0.85),
      }];
    }

    const proStore = useProStore.getState();
    const existingJob = proStore.jobs.find((j) => j.id === missionId);
    if (!existingJob) {
      proStore.jobs = [...proStore.jobs, {
        id: missionId,
        clientId: "client_marie",
        clientName: "Marie K.",
        clientPhone: "+225 01 02 03 04",
        clientLocation: "Cocody Riviera 3",
        category: "maison-reparations",
        serviceName: proposal.professionalName || "Service",
        description: newMission.description,
        status: "pending",
        travelFeeXOF: 0,
        laborFeeXOF: proposal.laborPriceXOF,
        totalFeeXOF: proposal.totalXOF,
        createdAt: now,
        pricingModel: "fixed",
      }];
    }

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
