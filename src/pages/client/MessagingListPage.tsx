import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MessagingScreen from "../../components/MessagingScreen";
import { useChatStore } from "../../stores/chatStore";
import { useAuthStore } from "../../stores/authStore";

export default function MessagingListPage() {
  const navigate = useNavigate();
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
      onBack={() => navigate(-1)}
      onOpenConversation={(convId) => {
        markRead(convId, currentUserId);
        navigate(`/messages/${convId}`);
      }}
    />
  );
}
