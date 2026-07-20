import SharedNotificationPanel from "./ui/NotificationPanel";

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
}

export default function ClientNotificationPanel({ open, onClose }: NotificationPanelProps) {
  return (
    <SharedNotificationPanel
      open={open}
      onClose={onClose}
      variant="sheet"
    />
  );
}
