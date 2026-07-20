import { ArrowLeft, FileSearch } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBackNavigation } from "../../hooks/useBackNavigation";
import ProposalCard from "./ProposalCard";
import type { Proposal } from "../../types";
import { EmptyState } from "../ui";

interface ProposalsListScreenProps {
  proposals: Proposal[];
  requestId: string;
}

export default function ProposalsListScreen({ proposals, requestId }: ProposalsListScreenProps) {
  const nav = useNavigate();
  const goBack = useBackNavigation("/");

  const pending = proposals.filter((p) => p.status === "pending");

  return (
    <div className="flex flex-col w-full min-h-dynamic pb-safe bg-cm-bg">
      <header className="sticky top-0 z-10 bg-cm-bg border-b border-cm-border/30">
        <div className="flex items-center gap-3 px-5 h-12">
          <button
            onClick={goBack}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-cm-elevated border border-cm-border cursor-pointer active:scale-95 shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-cm-text" />
          </button>
          <h1 className="text-[15px] font-bold text-cm-text">Propositions reçues</h1>
        </div>
      </header>

      <main className="flex-1 px-5 pt-4 space-y-3">
        {pending.length > 0 && (
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-cm-accent animate-pulse" />
            <p className="text-[12px] font-bold text-cm-text">
              {pending.length} professionnel{pending.length > 1 ? "s" : ""} ont répondu
            </p>
          </div>
        )}

        {pending.length === 0 && proposals.length === 0 ? (
          <div className="pt-12">
            <EmptyState
              icon={FileSearch}
              title="Aucune proposition pour l'instant"
              description="Les professionnels consultent votre demande. Revenez bientôt."
            />
          </div>
        ) : (
          <>
            {pending.map((p, i) => (
              <ProposalCard
                key={p.id}
                proposal={p}
                index={i}
                onViewDetails={() => nav(`/orders/proposals/${requestId}/${p.id}`)}
              />
            ))}
            {proposals.filter((p) => p.status !== "pending").length > 0 && (
              <div className="pt-4">
                <h3 className="text-[11px] font-bold text-cm-text-muted uppercase tracking-wider mb-3">
                  Propositions traitées
                </h3>
                {proposals.filter((p) => p.status !== "pending").map((p, i) => (
                  <ProposalCard
                    key={p.id}
                    proposal={p}
                    index={i}
                    onViewDetails={() => nav(`/orders/proposals/${requestId}/${p.id}`)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
