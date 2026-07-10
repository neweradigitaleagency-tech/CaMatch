import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, MessageSquare, Search } from "lucide-react";
import MessagingScreen, { ChatScreen } from "../../components/MessagingScreen";
import { useChatStore } from "../../stores/chatStore";
import { useAuthStore } from "../../stores/authStore";

function MessagesList({ onBack }: { onBack: () => void }) {
  const nav = useNavigate();
  const [search, setSearch] = useState("");
  const conversations = useChatStore((s) => s.conversations);

  const sorted = [...conversations]
    .filter((c) => c.otherUserName.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

  return (
    <div className="min-h-dynamic bg-cm-bg">
      <div className="sticky top-0 z-10 bg-cm-elevated/80 backdrop-blur-lg border-b border-cm-border">
        <div className="flex items-center h-14 px-5 gap-3">
          <button type="button" onClick={onBack} className="p-1 -ml-1 cursor-pointer active:scale-[0.97]">
            <ArrowLeft className="w-5 h-5 text-cm-text" />
          </button>
          <h1 className="text-[18px] font-bold text-cm-text">Messages</h1>
        </div>
      </div>
      <div className="w-full max-w-[448px] mx-auto px-5 pt-3 pb-24">
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-cm-text-muted" />
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="w-full h-11 pl-10 text-[13px] bg-cm-elevated border border-cm-border rounded-[12px] outline-none text-cm-text placeholder-cm-text-muted focus:border-cm-accent"
          />
        </div>
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center px-8 pt-16">
            <div className="w-16 h-16 rounded-[20px] bg-cm-border border border-cm-border flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-cm-text-muted" />
            </div>
            <h3 className="text-[15px] font-bold text-cm-text mb-1">Aucune conversation</h3>
            <p className="text-[13px] text-cm-text-muted">Les conversations apparaîtront ici.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {sorted.map((conv, i) => (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => nav(`/pro/messages/${conv.id}`)}
                className="flex items-center gap-3 p-3 rounded-[16px] hover:bg-cm-accent/5 transition-colors cursor-pointer active:scale-[0.98]"
              >
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-cm-border">
                    <img src={conv.otherUserAvatar} alt="" className="w-full h-full object-cover" />
                  </div>
                  {conv.unreadCount > 0 && (
                    <div className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-cm-accent text-[10px] font-bold flex items-center justify-center text-cm-text-onAccent border-2 border-cm-bg">
                      {conv.unreadCount}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-[14px] text-cm-text truncate">{conv.otherUserName}</h4>
                    <span className="text-[11px] text-cm-text-muted shrink-0 ml-2">{getRelativeTime(conv.lastMessageAt)}</span>
                  </div>
                  <p className={`text-[12px] truncate mt-0.5 ${conv.unreadCount > 0 ? "font-bold text-cm-text" : "text-cm-text-muted"}`}>
                    {conv.lastMessage}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function getRelativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Maintenant";
  if (mins < 60) return `Il y a ${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Il y a ${hrs}h`;
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function ChatView({ conversationId, onBack }: { conversationId: string; onBack: () => void }) {
  const conversations = useChatStore((s) => s.conversations);
  const messages = useChatStore((s) => s.messages);
  const sendTextMessage = useChatStore((s) => s.sendTextMessage);
  const sendMediaMessage = useChatStore((s) => s.sendMediaMessage);
  const loadMessages = useChatStore((s) => s.loadMessages);
  const userId = useAuthStore((s) => s.userId);

  const conv = conversations.find((c) => c.id === conversationId);
  const convMessages = messages[conversationId] || [];
  const currentUserId = userId || "pro_demo";

  const initialized = useRef(false);

  useEffect(() => {
    if (conversationId && !initialized.current) {
      initialized.current = true;
      loadMessages(conversationId, currentUserId);
    }
  }, [conversationId, currentUserId, loadMessages]);

  if (!conv) {
    return (
      <div className="min-h-dynamic bg-cm-bg flex items-center justify-center">
        <p className="text-sm text-cm-text-muted">Conversation introuvable</p>
      </div>
    );
  }

  return (
    <ChatScreen
      conversation={conv}
      messages={convMessages}
      onBack={onBack}
      onSendMessage={(text) => sendTextMessage(conversationId, currentUserId, text)}
      onSendMedia={(file, type) => sendMediaMessage(conversationId, currentUserId, file, type)}
      currentUserId={currentUserId}
    />
  );
}

export default function ProMessagesPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const nav = useNavigate();
  const initialize = useChatStore((s) => s.initialize);
  const userId = useAuthStore((s) => s.userId);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      initialize(userId || "pro_demo");
    }
  }, [initialize, userId]);

  if (conversationId) {
    return <ChatView conversationId={conversationId} onBack={() => nav("/pro/messages")} />;
  }

  return <MessagesList onBack={() => nav(-1)} />;
}
