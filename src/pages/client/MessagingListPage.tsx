import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MessagingScreen from "../../components/MessagingScreen";
import { useChatStore } from "../../stores/chatStore";
import { useAuthStore } from "../../stores/authStore";
import { MOCK_CONVERSATIONS } from "../../services/mockData";

export default function MessagingListPage() {
  const navigate = useNavigate();
  const conversations = useChatStore((s) => s.conversations);
  const setConversations = useChatStore((s) => s.setConversations);
  const markRead = useChatStore((s) => s.markRead);
  const userId = useAuthStore((s) => s.userId);

  useEffect(() => {
    if (conversations.length === 0) {
      const filtered = userId
        ? MOCK_CONVERSATIONS.filter((c) => c.participants.includes(userId))
        : MOCK_CONVERSATIONS;
      setConversations(filtered);
    }
  }, []);

  return (
    <MessagingScreen
      conversations={conversations}
      onBack={() => navigate(-1)}
      onOpenConversation={(convId) => {
        markRead(convId);
        navigate(`/messages/${convId}`);
      }}
    />
  );
}
