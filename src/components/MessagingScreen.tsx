import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Send, Camera, MapPin, Navigation, ImagePlus, Phone, ExternalLink, Mic, Square, Video, X } from "lucide-react";
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
        <button onClick={onBack} className="w-12 h-12 flex items-center justify-center rounded-full bg-white text-brand-forest hover:bg-pale-mint transition-colors shadow-sm cursor-pointer active:scale-95">
          <ArrowLeft className="w-5 h-5" />
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
          <p className="text-xs text-secondary">Quand une demande sera acceptée, la conversation démarrera automatiquement.</p>
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
                    <div className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-brand-lime text-caption font-medium flex items-center justify-center border-2 border-white">
                      {conv.unreadCount}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-brand-forest truncate">{conv.otherUserName}</h4>
                    <span className="text-caption text-secondary/60 shrink-0 ml-2">{time}</span>
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
  currentUserId: string;
}

export function ChatScreen({
  conversation, messages, onBack, onSendMessage, onSendPhoto, onSendLocation, currentUserId,
}: ChatScreenProps) {
  const [text, setText] = useState("");
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIdx, setViewerIdx] = useState(0);
  const [recording, setRecording] = useState(false);
  const [showLocations, setShowLocations] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ label: string; addr: string; lat: number; lng: number } | null>(null);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Simulate other user typing after a sent message, then auto-reply
  useEffect(() => {
    if (messages.length === 0) return;
    const last = messages[messages.length - 1];
    if (last.senderId === currentUserId) {
      const delay = 1500 + Math.random() * 2000;
      const typing = setTimeout(() => setOtherUserTyping(true), delay);
      const stopTyping = setTimeout(() => {
        setOtherUserTyping(false);
      }, delay + 2000 + Math.random() * 2500);
      return () => { clearTimeout(typing); clearTimeout(stopTyping); };
    }
  }, [messages.length]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, otherUserTyping]);

  const SAVED_LOCATIONS = [
    { label: "Domicile", addr: "Cocody Riviera 3, Abidjan", lat: 5.36, lng: -4.02 },
    { label: "Bureau", addr: "Plateau, Avenue Noguès, Abidjan", lat: 5.33, lng: -4.02 },
    { label: "Parents", addr: "Marcory Zone 4, Abidjan", lat: 5.30, lng: -3.99 },
  ];

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

  const handleVoiceRecord = async () => {
    if (recording) {
      mediaRecorderRef.current?.stop();
      setRecording(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onload = () => {
          if (reader.result) onSendPhoto(reader.result as string);
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorder.start();
      setRecording(true);
    } catch {
      // Permission denied or unsupported
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-brand-cream pb-24">
      <header className="flex items-center justify-between px-4 py-3 bg-white/90 backdrop-blur-md sticky top-0 z-10 border-b border-pale-mint/10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-12 h-12 flex items-center justify-center rounded-full bg-pale-mint text-brand-forest hover:bg-pale-mint/80 transition-colors cursor-pointer active:scale-95">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-9 h-9 rounded-full overflow-hidden border border-pale-mint/20">
            <img src={conversation.otherUserAvatar} alt="" className="w-full h-full object-cover" />
          </div>
          <div>
            <h3 className="text-sm font-bold">{conversation.otherUserName}</h3>
            <p className="text-caption text-secondary">
              {otherUserTyping ? (
                <span className="text-cm-green font-medium flex items-center gap-1">
                  <TypingDots />
                </span>
              ) : "En ligne"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="w-12 h-12 rounded-full bg-pale-mint flex items-center justify-center cursor-pointer hover:bg-pale-mint/80 transition-colors">
            <Phone className="w-5 h-5 text-brand-forest" />
          </button>
          <button className="w-12 h-12 rounded-full bg-pale-mint flex items-center justify-center cursor-pointer hover:bg-pale-mint/80 transition-colors">
            <ExternalLink className="w-5 h-5 text-brand-forest" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-20">
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUserId;
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[80%] space-y-1.5 flex flex-col ${isMe ? "items-end" : "items-start"}`}>
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
                      <span className="text-caption text-secondary">Position partagée</span>
                      <Navigation className="w-3.5 h-3.5 text-brand-lime" />
                    </div>
                    <div className="flex gap-1.5">
                      <button className="flex-1 h-7 bg-brand-forest text-white rounded-lg text-caption font-medium cursor-pointer active:scale-95">Google Maps</button>
                      <button className="flex-1 h-7 bg-brand-forest text-white rounded-lg text-caption font-medium cursor-pointer active:scale-95">Waze</button>
                      <button className="flex-1 h-7 bg-brand-forest text-white rounded-lg text-caption font-medium cursor-pointer active:scale-95">Apple Maps</button>
                    </div>
                  </div>
                )}
                {msg.text && (
                  <div className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                    isMe ? "bg-brand-forest text-white rounded-br-md" : "bg-white border border-pale-mint/20 text-brand-forest rounded-bl-md"
                  }`}>
                    {msg.text}
                  </div>
                )}
                <div className={`flex items-center gap-1 px-1 ${isMe ? "flex-row" : "flex-row-reverse"}`}>
                  <p className="text-caption text-secondary/50">
                    {new Date(msg.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  {isMe && <ReadReceipt status={msg.status || "sent"} />}
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Typing indicator */}
        {otherUserTyping && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
            <div className="bg-white border border-pale-mint/20 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-secondary/40 animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-secondary/40 animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-secondary/40 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </motion.div>
        )}

        <div ref={chatEndRef} />
      </div>

      <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto">
        <div className="bg-white rounded-2xl border border-pale-mint/20 shadow-sm px-3 py-2 flex items-center gap-2">
          <button onClick={() => { const inp = fileRef.current; if (inp) { inp.accept = "image/*,video/*"; inp.click(); } }} className="w-12 h-12 rounded-full bg-pale-mint flex items-center justify-center shrink-0 cursor-pointer hover:bg-pale-mint/80 transition-colors">
            <ImagePlus className="w-5 h-5 text-brand-forest" />
          </button>
          <button onClick={() => setShowLocations(true)} className="w-12 h-12 rounded-full bg-pale-mint flex items-center justify-center shrink-0 cursor-pointer hover:bg-pale-mint/80 transition-colors">
            <MapPin className="w-5 h-5 text-brand-forest" />
          </button>
          <button onClick={handleVoiceRecord}
            className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-all ${
              recording ? "bg-red-500 text-white animate-pulse" : "bg-pale-mint text-brand-forest hover:bg-pale-mint/80"
            }`}>
            {recording ? <Square className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
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
            className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all cursor-pointer ${
              text.trim() ? "bg-brand-lime text-brand-forest" : "bg-pale-mint text-secondary/50"
            }`}>
            <Send className="w-5 h-5" />
          </button>
          <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handlePhoto} />
        </div>
      </div>

      {/* Location picker modal */}
      {showLocations && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center" onClick={() => setShowLocations(false)}>
          <div className="w-full max-w-md bg-brand-cream rounded-t-3xl sm:rounded-3xl p-5 pb-8 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold">Envoyer une adresse</h3>
              <button onClick={() => setShowLocations(false)} className="w-12 h-12 rounded-full bg-white flex items-center justify-center cursor-pointer">
                <X className="w-5 h-5 text-secondary" />
              </button>
            </div>
            <p className="text-caption text-secondary">Choisissez parmi vos adresses enregistrées</p>
            <div className="space-y-2">
              {SAVED_LOCATIONS.map((loc, i) => (
                <button key={i} onClick={() => { onSendLocation(); setShowLocations(false); }}
                  className="w-full bg-white rounded-2xl p-4 border border-pale-mint/20 flex items-center gap-3 cursor-pointer active:scale-95 transition-transform text-left">
                  <div className="w-10 h-10 rounded-xl bg-pale-mint flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-brand-forest" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">{loc.label}</p>
                    <p className="text-caption text-secondary">{loc.addr}</p>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => { onSendLocation(); setShowLocations(false); }}
              className="w-full h-11 bg-brand-lime rounded-2xl text-xs font-bold text-brand-forest flex items-center justify-center gap-2 cursor-pointer active:scale-95">
              <MapPin className="w-3.5 h-3.5" /> Envoyer ma position actuelle
            </button>
          </div>
        </div>
      )}

      <ImageViewer
        images={messages.flatMap(m => m.photos.map(u => ({ url: u })))}
        initialIndex={viewerIdx}
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
      />
    </div>
  );
}

function ReadReceipt({ status }: { status: string }) {
  if (status === "read") {
    return (
      <span className="flex items-center">
        <span className="text-[8px] text-blue-500 font-bold leading-none">✓✓</span>
      </span>
    );
  }
  if (status === "delivered") {
    return (
      <span className="flex items-center">
        <span className="text-[8px] text-secondary/50 font-bold leading-none">✓✓</span>
      </span>
    );
  }
  return (
    <span className="flex items-center">
      <span className="text-[8px] text-secondary/50 font-bold leading-none">✓</span>
    </span>
  );
}

function TypingDots() {
  return (
    <span className="flex items-center gap-0.5">
      <span className="w-1 h-1 rounded-full bg-cm-green animate-bounce" style={{ animationDelay: "0ms" }} />
      <span className="w-1 h-1 rounded-full bg-cm-green animate-bounce" style={{ animationDelay: "150ms" }} />
      <span className="w-1 h-1 rounded-full bg-cm-green animate-bounce" style={{ animationDelay: "300ms" }} />
    </span>
  );
}
