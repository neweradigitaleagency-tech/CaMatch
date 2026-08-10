import { motion } from "motion/react";
import { MessageCircle, ChevronRight } from "lucide-react";
import type { Conversation } from "../../types";

interface MessagesPreviewProps {
  conversations: Conversation[];
  onOpen: (conversationId: string) => void;
  onViewAll: () => void;
}

export default function MessagesPreview({ conversations, onOpen, onViewAll }: MessagesPreviewProps) {
  if (conversations.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.16 }}
      className="bg-cm-elevated border border-cm-border rounded-[20px] p-4 shadow-sm mb-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-cm-text" />
          <span className="text-[14px] font-bold text-cm-text">Messages</span>
        </div>
        <button
          onClick={onViewAll}
          className="text-[11px] font-medium text-cm-text-soft cursor-pointer hover:underline flex items-center gap-0.5"
        >
          Voir tout <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-1">
        {conversations.slice(0, 3).map((c) => (
          <button
            key={c.id}
            onClick={() => onOpen(c.id)}
            className="w-full flex items-center gap-3 p-2 -mx-2 rounded-[12px] cursor-pointer active:scale-[0.99] transition-transform hover:bg-cm-surface text-left"
          >
            <div className="w-9 h-9 rounded-full bg-cm-surface overflow-hidden shrink-0">
              {c.otherUserAvatar ? (
                <img src={c.otherUserAvatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-cm-text-muted" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[12px] font-bold text-cm-text truncate">{c.otherUserName}</p>
                <span className="text-[9px] text-cm-text-muted shrink-0">
                  {new Date(c.lastMessageAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] text-cm-text-muted truncate">{c.lastMessage}</p>
                {c.unreadCount > 0 && (
                  <span className="min-w-[18px] h-[18px] rounded-full bg-cm-text text-white text-[9px] font-bold flex items-center justify-center px-1 shrink-0">
                    {c.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
