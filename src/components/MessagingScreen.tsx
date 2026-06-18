import { useState, useRef } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Send, Camera, MapPin, Navigation, ImagePlus, Phone, ExternalLink } from "lucide-react";
import { Conversation, Message } from "../types";
import ImageViewer from "./ImageViewer";

interface MessagingScreenProps {
  conversations: Conversation[];
  onBack: () => void;
  onOpenConversation: (convId: string) => void;
}

export default function MessagingScreen({ conversations, onBack, onOpenConversation }: MessagingScreenProps) {
  const [search, setSearch] = useState("");

  const filtered = conversations.filter((c) =>
    c.otherUserName.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

  return (
    <div className="flex flex-col w-full min-h-screen bg-brand-cream pb-32">
      <header className="flex items-center justify-between px-4 py-3 bg-brand-cream/90 backdrop-blur-md sticky top-0 z-10">
        <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-full bg-white text-brand-forest hover:bg-pale-mint transition-colors shadow-sm cursor-pointer active:scale-95">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="font-sans text-sm font-bold">Messages</h1>
        <div className="w-9 h-9" />
      </header>

      <div className="px-4 pt-2 pb-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher une conversation..."
          className="w-full h-10 text-xs bg-white border border-pale-mint/30 rounded-xl px-4 outline-none focus:ring-1 focus:ring-brand-forest"
        />
      </div>

      {sorted.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
          <div className="w-14 h-14 rounded-full bg-pale-mint flex items-center justify-center mb-3">
            <MessageSquare className="w-7 h-7 text-secondary/60" />
          </div>
          <h3 className="text-sm font-bold mb-1">Aucun message</h3>
          <p className="text-xs text-on-surface-variant">Quand une demande sera acceptée, la conversation démarrera automatiquement.</p>
        </div>
      ) : (
        <div className="px-4 space-y-1">
          {sorted.map((conv) => {
            const time = getRelativeTime(conv.lastMessageAt);
            return (
              <div
                key={conv.id}
                onClick={() => onOpenConversation(conv.id)}
                className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/60 transition-colors cursor-pointer active:scale-[0.98]"
              >
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-pale-mint/20">
                    <img src={conv.otherUserAvatar} alt="" className="w-full h-full object-cover" />
                  </div>
                  {conv.unreadCount > 0 && (
                    <div className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-brand-lime text-[9px] font-bold flex items-center justify-center border-2 border-white">
                      {conv.unreadCount}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-brand-forest truncate">{conv.otherUserName}</h4>
                    <span className="text-[9px] text-secondary/60 shrink-0 ml-2">{time}</span>
                  </div>
                  <p className={`text-xs truncate mt-0.5 ${conv.unreadCount > 0 ? "font-bold text-brand-forest" : "text-secondary"}`}>
                    {conv.lastMessage}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { MessageSquare } from "lucide-react";

function getRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Maintenant";
  if (mins < 60) return `Il y a ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `Il y a ${days}j`;
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

// ─── Conversation Detail Screen ───

interface ChatScreenProps {
  conversation: Conversation;
  messages: Message[];
  onBack: () => void;
  onSendMessage: (text: string) => void;
  onSendPhoto: (photo: string) => void;
  onSendLocation: () => void;
}

export function ChatScreen({
  conversation, messages, onBack, onSendMessage, onSendPhoto, onSendLocation,
}: ChatScreenProps) {
  const [text, setText] = useState("");
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIdx, setViewerIdx] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!text.trim()) return;
    onSendMessage(text);
    setText("");
  };

  const handlePhoto = () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) onSendPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-brand-cream pb-24">
      <header className="flex items-center justify-between px-4 py-3 bg-white/90 backdrop-blur-md sticky top-0 z-10 border-b border-pale-mint/10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-full bg-pale-mint text-brand-forest hover:bg-pale-mint/80 transition-colors cursor-pointer active:scale-95">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-9 h-9 rounded-full overflow-hidden border border-pale-mint/20">
            <img src={conversation.otherUserAvatar} alt="" className="w-full h-full object-cover" />
          </div>
          <div>
            <h3 className="text-sm font-bold">{conversation.otherUserName}</h3>
            <p className="text-[9px] text-secondary">En ligne</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="w-8 h-8 rounded-full bg-pale-mint flex items-center justify-center cursor-pointer hover:bg-pale-mint/80 transition-colors">
            <Phone className="w-4 h-4 text-brand-forest" />
          </button>
          <button className="w-8 h-8 rounded-full bg-pale-mint flex items-center justify-center cursor-pointer hover:bg-pale-mint/80 transition-colors">
            <ExternalLink className="w-4 h-4 text-brand-forest" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => {
          const isMe = msg.senderId === "me";
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[80%] space-y-1.5 ${isMe ? "items-end" : "items-start"}`}>
                {msg.photos.map((photo, i) => (
                  <div key={i} onClick={() => {
                    const all = messages.flatMap(m => m.photos.map(u => ({ url: u })));
                    const found = all.findIndex(p => p.url === photo);
                    setViewerIdx(found >= 0 ? found : 0);
                    setViewerOpen(true);
                  }}
                    className="rounded-2xl overflow-hidden border border-pale-mint/20 max-w-[200px] cursor-pointer active:scale-95 transition-transform">
                    <img src={photo} alt="" className="w-full h-auto" />
                  </div>
                ))}
                {msg.location && (
                  <div className="bg-pale-mint rounded-2xl p-3 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      <MapPin className="w-3.5 h-3.5 text-brand-forest" />{msg.location.label}
                    </div>
                    <div className="bg-white rounded-xl p-2 flex items-center justify-between">
                      <span className="text-[9px] text-secondary">Position partagée</span>
                      <Navigation className="w-3.5 h-3.5 text-brand-lime" />
                    </div>
                    <div className="flex gap-1.5">
                      <button className="flex-1 h-7 bg-brand-forest text-white rounded-lg text-[8px] font-bold cursor-pointer active:scale-95">Google Maps</button>
                      <button className="flex-1 h-7 bg-brand-forest text-white rounded-lg text-[8px] font-bold cursor-pointer active:scale-95">Waze</button>
                      <button className="flex-1 h-7 bg-brand-forest text-white rounded-lg text-[8px] font-bold cursor-pointer active:scale-95">Apple Maps</button>
                    </div>
                  </div>
                )}
                {msg.text && (
                  <div className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                    isMe ? "bg-brand-forest text-white" : "bg-white border border-pale-mint/20 text-brand-forest"
                  }`}>
                    {msg.text}
                  </div>
                )}
                <p className={`text-[8px] text-secondary/50 px-1 ${isMe ? "text-right" : "text-left"}`}>
                  {new Date(msg.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto">
        <div className="bg-white rounded-2xl border border-pale-mint/20 shadow-sm px-3 py-2 flex items-center gap-2">
          <button onClick={() => fileRef.current?.click()} className="w-9 h-9 rounded-full bg-pale-mint flex items-center justify-center shrink-0 cursor-pointer hover:bg-pale-mint/80 transition-colors">
            <ImagePlus className="w-4 h-4 text-brand-forest" />
          </button>
          <button onClick={onSendLocation} className="w-9 h-9 rounded-full bg-pale-mint flex items-center justify-center shrink-0 cursor-pointer hover:bg-pale-mint/80 transition-colors">
            <MapPin className="w-4 h-4 text-brand-forest" />
          </button>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Écrivez un message..."
            className="flex-1 h-9 text-xs bg-transparent outline-none px-2"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all cursor-pointer ${
              text.trim() ? "bg-brand-lime text-brand-forest" : "bg-pale-mint text-secondary/50"
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
        </div>
      </div>

      <ImageViewer
        images={messages.flatMap(m => m.photos.map(u => ({ url: u })))}
        initialIndex={viewerIdx}
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
      />
    </div>
  );
}
