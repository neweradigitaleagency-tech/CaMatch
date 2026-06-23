import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChatScreen } from "../../components/MessagingScreen";
import CallScreen from "../../components/CallScreen";
import { useChatStore } from "../../stores/chatStore";
import { useLocationStore } from "../../stores/locationStore";
import { useAuthStore } from "../../stores/authStore";
import { MOCK_MESSAGES } from "../../services/mockData";
import type { CallSession } from "../../types";

let msgCounter = 100;

export default function ChatPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const conversations = useChatStore((s) => s.conversations);
  const messages = useChatStore((s) => s.messages);
  const setMessages = useChatStore((s) => s.setMessages);
  const addMessage = useChatStore((s) => s.addMessage);
  const userId = useAuthStore((s) => s.userId);

  const [showCall, setShowCall] = useState(false);

  const conversation = conversations.find((c) => c.id === conversationId);
  const convMessages = conversationId ? messages[conversationId] || [] : [];

  useEffect(() => {
    if (conversationId && !messages[conversationId]) {
      const mock = MOCK_MESSAGES[conversationId] || [];
      setMessages({ ...messages, [conversationId]: mock });
    }
  }, [conversationId]);

  if (!conversation || !conversationId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-cm-bg">
        <p className="text-sm text-cm-text-soft">Conversation introuvable</p>
      </div>
    );
  }

  const currentUserId = userId || "client_marie";

  const callSession: CallSession = {
    id: "call_chat_1",
    callerId: currentUserId,
    calleeId: "pro3",
    callerName: "Marie Kouadio",
    callerAvatar: "",
    calleeName: conversation.otherUserName,
    calleeAvatar: conversation.otherUserAvatar,
    status: "ringing",
    durationMs: 0,
    startedAt: new Date().toISOString(),
    isIncoming: false,
  };

  if (showCall) {
    return (
      <CallScreen
        session={callSession}
        onEnd={() => setShowCall(false)}
      />
    );
  }

  return (
    <ChatScreen
      conversation={conversation}
      messages={convMessages}
      onBack={() => navigate("/messages")}
      onSendMessage={(text) => {
        addMessage(conversationId, {
          id: `msg_${++msgCounter}`,
          conversationId,
          senderId: currentUserId,
          text,
          photos: [],
          createdAt: new Date().toISOString(),
        });
      }}
      onSendPhoto={(photo) => {
        addMessage(conversationId, {
          id: `msg_${++msgCounter}`,
          conversationId,
          senderId: currentUserId,
          text: "",
          photos: [photo],
          createdAt: new Date().toISOString(),
        });
      }}
      onSendLocation={() => {
        const { latitude, longitude, neighborhood } = useLocationStore.getState();
        addMessage(conversationId, {
          id: `msg_${++msgCounter}`,
          conversationId,
          senderId: currentUserId,
          text: "",
          photos: [],
          location: { lat: latitude, lng: longitude, label: neighborhood || "Ma position" },
          createdAt: new Date().toISOString(),
        });
      }}
      onOpenCall={() => setShowCall(true)}
      currentUserId={currentUserId}
    />
  );
}
