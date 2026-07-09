import { ArrowLeft, Phone, Video } from "lucide-react";
import type { Conversation } from "../types";

interface ChatHeaderProps {
  conversation: Conversation;
  onBack: () => void;
  onAudioCall: () => void;
  onVideoCall: () => void;
}

const STATE_DOT: Record<string, string> = {
  active: "bg-green-500",
  waiting: "bg-amber-400",
  read_only: "bg-gray-400",
  archived: "bg-gray-300",
  locked: "bg-red-400",
};

const STATE_LABEL: Record<string, string> = {
  active: "En ligne",
  waiting: "En attente",
  read_only: "Terminée",
  archived: "Archivée",
  locked: "Verrouillée",
};

export default function ChatHeader({ conversation, onBack }: ChatHeaderProps) {
  return (
    <div className="sticky top-0 z-10 bg-cm-elevated/80 backdrop-blur-lg border-b border-cm-border">
      <div className="flex items-center h-14 px-4 gap-3">
        <button type="button" onClick={onBack} className="p-1 -ml-1 cursor-pointer active:scale-[0.97]">
          <ArrowLeft className="w-5 h-5 text-cm-text" />
        </button>
        <div className="w-9 h-9 rounded-full overflow-hidden border border-cm-border shrink-0">
          <img src={conversation.otherUserAvatar} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-[14px] font-bold text-cm-text truncate">
            {conversation.otherUserName}
          </h2>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`w-1.5 h-1.5 rounded-full ${STATE_DOT[conversation.state] || "bg-gray-400"}`} />
            <span className="text-[11px] text-cm-text-muted">
              {STATE_LABEL[conversation.state] || conversation.state}
            </span>
            {conversation.metadata.flags.dispute && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-[4px] bg-red-50 text-red-600 font-medium">
                Litige
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {}}
            className="w-9 h-9 rounded-[10px] border border-cm-border bg-cm-elevated flex items-center justify-center cursor-pointer hover:bg-cm-accent-soft transition-colors"
            title="Appel audio"
          >
            <Phone className="w-4 h-4 text-cm-text" />
          </button>
          <button
            onClick={() => {}}
            className="w-9 h-9 rounded-[10px] border border-cm-border bg-cm-elevated flex items-center justify-center cursor-pointer hover:bg-cm-accent-soft transition-colors"
            title="Appel vidéo"
          >
            <Video className="w-4 h-4 text-cm-text" />
          </button>
        </div>
      </div>
    </div>
  );
}
