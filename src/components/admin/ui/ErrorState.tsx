import SharedErrorState from "../../ui/ErrorState";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({ title, message, onRetry }: ErrorStateProps) {
  return (
    <SharedErrorState
      title={title}
      message={message}
      onRetry={onRetry}
      variant="admin"
    />
  );
}
