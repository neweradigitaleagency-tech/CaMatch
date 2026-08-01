import { useEffect, useRef } from "react";
import MessagingScreen from "../../components/MessagingScreen";
import { useAppNavigation } from "../../navigation/useAppNavigation";
import { useChatStore } from "../../stores/chatStore";
import { useAuthStore } from "../../stores/authStore";

export default function MessagingListPage() {
  const { goBack, navigate } = useAppNavigation();
  const conversations = useChatStore((s) => s.conversations);
  const initialize = useChatStore((s) => s.initialize);
  const markRead = useChatStore((s) => s.markRead);
  const userId = useAuthStore((s) => s.userId);
  const initialized = useRef(false);

  const currentUserId = userId || "client_marie";

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      initialize(currentUserId);
    }
  }, [initialize, currentUserId]);

  return (
    <MessagingScreen
      conversations={conversations}
      onBack={goBack}
      onOpenConversation={(convId) => {
        markRead(convId, currentUserId);
        navigate(`/messages/${convId}`);
      }}
    />
  );
}
