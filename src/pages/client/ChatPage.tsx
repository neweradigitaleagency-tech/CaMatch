import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChatScreen } from "../../components/MessagingScreen";
import { useChatStore } from "../../stores/chatStore";
import { useAuthStore } from "../../stores/authStore";

export default function ChatPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const conversations = useChatStore((s) => s.conversations);
  const messages = useChatStore((s) => s.messages);
  const loadMessages = useChatStore((s) => s.loadMessages);
  const sendTextMessage = useChatStore((s) => s.sendTextMessage);
  const sendMediaMessage = useChatStore((s) => s.sendMediaMessage);
  const userId = useAuthStore((s) => s.userId);
  const initialized = useRef(false);

  const conversation = conversations.find((c) => c.id === conversationId);
  const convMessages = conversationId ? messages[conversationId] || [] : [];
  const currentUserId = userId || "client_marie";

  useEffect(() => {
    if (conversationId && !initialized.current) {
      initialized.current = true;
      loadMessages(conversationId, currentUserId);
    }
  }, [conversationId, currentUserId, loadMessages]);

  if (!conversation || !conversationId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-cm-bg">
        <p className="text-sm text-cm-text-soft">Conversation introuvable</p>
      </div>
    );
  }

  return (
    <ChatScreen
      conversation={conversation}
      messages={convMessages}
      onBack={() => navigate("/messages")}
      onSendMessage={(text) => {
        sendTextMessage(conversationId, currentUserId, text);
      }}
      onSendMedia={(file, type) => {
        sendMediaMessage(conversationId, currentUserId, file, type);
      }}
      currentUserId={currentUserId}
    />
  );
}
