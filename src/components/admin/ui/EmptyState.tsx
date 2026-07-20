import SharedEmptyState from "../../ui/EmptyState";

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <SharedEmptyState
      title={title}
      description={description}
      action={action}
      variant="admin"
    />
  );
}
