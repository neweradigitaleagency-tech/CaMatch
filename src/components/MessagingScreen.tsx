import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Send, Camera, MapPin, Navigation, ImagePlus, Phone, ExternalLink, Mic, Square, Video, X, MessageSquare, Search } from "lucide-react";
import { Conversation, Message } from "../types";
import ImageViewer from "./ImageViewer";
import GlassCard from "./ui/GlassCard";

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
    <div className="flex flex-col w-full min-h-screen pb-32" style={{ background: "linear-gradient(180deg, #D8F3DC 0%, #F5F0E8 100%)" }}>
      <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-10" style={{ background: "linear-gradient(180deg, #D8F3DC 0%, transparent 100%)" }}>
        <button onClick={onBack} className="w-11 h-11 flex items-center justify-center rounded-[14px] bg-[rgba(255,255,255,0.60)] backdrop-blur-[8px] border border-[rgba(255,255,255,0.35)] text-ca-text-primary cursor-pointer active:scale-95 shadow-[0_4px_16px_rgba(45,106,79,0.06)]">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[15px] font-bold text-ca-text-primary">Messages</h1>
        <div className="w-11 h-11" />
      </header>

      <div className="px-4 pt-1 pb-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-ca-text-muted" />
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une conversation..."
            className="w-full h-11 pl-10 text-[13px] bg-[rgba(255,255,255,0.55)] backdrop-blur-[8px] border border-[rgba(255,255,255,0.40)] rounded-[12px] outline-none text-ca-text-primary placeholder-ca-text-muted focus:bg-[rgba(255,255,255,0.75)] focus:border-[rgba(82,183,136,0.40)]"
          />
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
          <div className="w-16 h-16 rounded-[20px] bg-[rgba(82,183,136,0.15)] backdrop-blur-[8px] border border-[rgba(82,183,136,0.25)] flex items-center justify-center mb-4">
            <MessageSquare className="w-8 h-8 text-ca-text-muted" />
          </div>
          <h3 className="text-[15px] font-bold text-ca-text-primary mb-1">Aucune conversation</h3>
          <p className="text-[13px] text-ca-text-muted">Quand une demande sera acceptée, la conversation démarrera automatiquement.</p>
          <button className="mt-5 h-11 px-6 bg-[rgba(45,106,79,0.85)] backdrop-blur-[8px] border border-[rgba(82,183,136,0.40)] text-white text-[13px] font-semibold rounded-[14px] hover:bg-[rgba(45,106,79,0.95)] transition-all cursor-pointer active:scale-[0.97]">
            Explorer les pros
          </button>
        </div>
      ) : (
        <div className="px-4 space-y-1">
          {sorted.map((conv) => {
            const time = getRelativeTime(conv.lastMessageAt);
            return (
              <div
                key={conv.id}
                onClick={() => onOpenConversation(conv.id)}
                className="flex items-center gap-3 p-3 rounded-[16px] hover:bg-[rgba(255,255,255,0.50)] transition-colors cursor-pointer active:scale-[0.98]"
              >
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[rgba(82,183,136,0.20)]">
                    <img src={conv.otherUserAvatar} alt="" className="w-full h-full object-cover" />
                  </div>
                  {conv.unreadCount > 0 && (
                    <div className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-ca-green-primary text-[10px] font-bold flex items-center justify-center text-white border-2 border-[#F5F0E8]">
                      {conv.unreadCount}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-[14px] text-ca-text-primary truncate">{conv.otherUserName}</h4>
                    <span className="text-[11px] text-ca-text-muted shrink-0 ml-2">{time}</span>
                  </div>
                  <p className={`text-[12px] truncate mt-0.5 ${conv.unreadCount > 0 ? "font-bold text-ca-text-primary" : "text-ca-text-muted"}`}>
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

  useEffect(() => {
    if (messages.length === 0) return;
    const last = messages[messages.length - 1];
    if (last.senderId === currentUserId) {
      const delay = 1500 + Math.random() * 2000;
      const typing = setTimeout(() => setOtherUserTyping(true), delay);
      const stopTyping = setTimeout(() => { setOtherUserTyping(false); }, delay + 2000 + Math.random() * 2500);
      return () => { clearTimeout(typing); clearTimeout(stopTyping); };
    }
  }, [messages.length]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length, otherUserTyping]);

  const SAVED_LOCATIONS = [
    { label: "Domicile", addr: "Cocody Riviera 3, Abidjan", lat: 5.36, lng: -4.02 },
    { label: "Bureau", addr: "Plateau, Avenue Noguès, Abidjan", lat: 5.33, lng: -4.02 },
    { label: "Parents", addr: "Marcory Zone 4, Abidjan", lat: 5.30, lng: -3.99 },
  ];

  const handleSend = () => { if (!text.trim()) return; onSendMessage(text); setText(""); };

  const handlePhoto = () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { if (reader.result) onSendPhoto(reader.result as string); };
    reader.readAsDataURL(file);
  };

  const handleVoiceRecord = async () => {
    if (recording) { mediaRecorderRef.current?.stop(); setRecording(false); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onload = () => { if (reader.result) onSendPhoto(reader.result as string); };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorder.start();
      setRecording(true);
    } catch { /* Permission denied */ }
  };

  return (
    <div className="flex flex-col w-full min-h-screen pb-24" style={{ background: "linear-gradient(180deg, #D8F3DC 0%, #F5F0E8 100%)" }}>
      <header className="flex items-center justify-between px-4 py-3 bg-[rgba(255,255,255,0.70)] backdrop-blur-[12px] sticky top-0 z-10 border-b border-[rgba(232,224,208,0.30)]">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-11 h-11 flex items-center justify-center rounded-[12px] bg-[rgba(255,255,255,0.50)] text-ca-text-primary cursor-pointer active:scale-95">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[rgba(82,183,136,0.20)]">
            <img src={conversation.otherUserAvatar} alt="" className="w-full h-full object-cover" />
          </div>
          <div>
            <h3 className="text-[14px] font-bold text-ca-text-primary">{conversation.otherUserName}</h3>
            <p className="text-[11px] text-ca-text-muted">
              {otherUserTyping ? (
                <span className="text-ca-green-primary font-medium flex items-center gap-1">
                  <TypingDots />
                </span>
              ) : "En ligne"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="w-11 h-11 rounded-[12px] bg-[rgba(255,255,255,0.50)] flex items-center justify-center cursor-pointer hover:bg-[rgba(255,255,255,0.70)] transition-colors">
            <Phone className="w-5 h-5 text-ca-text-primary" />
          </button>
          <button className="w-11 h-11 rounded-[12px] bg-[rgba(255,255,255,0.50)] flex items-center justify-center cursor-pointer hover:bg-[rgba(255,255,255,0.70)] transition-colors">
            <ExternalLink className="w-5 h-5 text-ca-text-primary" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-20">
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUserId;
          return (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] space-y-1.5 flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                {msg.photos.map((photo, i) => (
                  <div key={i} onClick={() => {
                    const all = messages.flatMap(m => m.photos.map(u => ({ url: u })));
                    const found = all.findIndex(p => p.url === photo);
                    setViewerIdx(found >= 0 ? found : 0);
                    setViewerOpen(true);
                  }} className="rounded-[16px] overflow-hidden border border-[rgba(255,255,255,0.35)] max-w-[200px] cursor-pointer active:scale-95 transition-transform">
                    <img src={photo} alt="" className="w-full h-auto" />
                  </div>
                ))}
                {msg.location && (
                  <GlassCard className="p-3 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[12px] font-bold text-ca-text-primary">
                      <MapPin className="w-3.5 h-3.5" />{msg.location.label}
                    </div>
                    <div className="bg-[rgba(255,255,255,0.50)] rounded-[12px] p-2 flex items-center justify-between">
                      <span className="text-[11px] text-ca-text-muted">Position partagée</span>
                      <Navigation className="w-3.5 h-3.5 text-ca-green-light" />
                    </div>
                    <div className="flex gap-1.5">
                      <button className="flex-1 h-7 bg-ca-text-primary text-white rounded-[10px] text-[11px] font-medium cursor-pointer active:scale-95">Google Maps</button>
                      <button className="flex-1 h-7 bg-ca-text-primary text-white rounded-[10px] text-[11px] font-medium cursor-pointer active:scale-95">Waze</button>
                      <button className="flex-1 h-7 bg-ca-text-primary text-white rounded-[10px] text-[11px] font-medium cursor-pointer active:scale-95">Apple Maps</button>
                    </div>
                  </GlassCard>
                )}
                {msg.text && (
                  <div className={`px-3.5 py-2.5 rounded-[16px] text-[12px] leading-relaxed ${
                    isMe
                      ? "bg-[rgba(45,106,79,0.85)] text-white rounded-br-[4px]"
                      : "bg-[rgba(255,255,255,0.70)] backdrop-blur-[8px] border border-[rgba(255,255,255,0.35)] text-ca-text-primary rounded-bl-[4px]"
                  }`}>
                    {msg.text}
                  </div>
                )}
                <div className={`flex items-center gap-1 px-1 ${isMe ? "flex-row" : "flex-row-reverse"}`}>
                  <p className="text-[11px] text-ca-text-muted">
                    {new Date(msg.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  {isMe && <ReadReceipt status={msg.status || "sent"} />}
                </div>
              </div>
            </motion.div>
          );
        })}

        {otherUserTyping && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
            <div className="bg-[rgba(255,255,255,0.70)] backdrop-blur-[8px] border border-[rgba(255,255,255,0.35)] rounded-[16px] rounded-bl-[4px] px-4 py-3 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-ca-text-muted animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-ca-text-muted animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-ca-text-muted animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </motion.div>
        )}

        <div ref={chatEndRef} />
      </div>

      <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto">
        <div className="bg-[rgba(255,255,255,0.70)] backdrop-blur-[12px] rounded-[16px] border border-[rgba(255,255,255,0.35)] shadow-[0_8px_32px_rgba(45,106,79,0.08)] px-3 py-2 flex items-center gap-2">
          <button onClick={() => { const inp = fileRef.current; if (inp) { inp.accept = "image/*,video/*"; inp.click(); } }}
            className="w-10 h-10 rounded-[12px] bg-[rgba(255,255,255,0.50)] flex items-center justify-center shrink-0 cursor-pointer hover:bg-[rgba(255,255,255,0.70)]">
            <ImagePlus className="w-4 h-4 text-ca-text-primary" />
          </button>
          <button onClick={() => setShowLocations(true)}
            className="w-10 h-10 rounded-[12px] bg-[rgba(255,255,255,0.50)] flex items-center justify-center shrink-0 cursor-pointer hover:bg-[rgba(255,255,255,0.70)]">
            <MapPin className="w-4 h-4 text-ca-text-primary" />
          </button>
          <button onClick={handleVoiceRecord}
            className={`w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 cursor-pointer transition-all ${
              recording ? "bg-ca-error text-white animate-pulse" : "bg-[rgba(255,255,255,0.50)] text-ca-text-primary hover:bg-[rgba(255,255,255,0.70)]"
            }`}>
            {recording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Écrivez un message..." className="flex-1 h-9 text-[13px] bg-transparent outline-none px-2 text-ca-text-primary placeholder-ca-text-muted" />
          <button onClick={handleSend} disabled={!text.trim()}
            className={`w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 transition-all cursor-pointer ${
              text.trim() ? "bg-ca-green-primary text-white" : "bg-[rgba(255,255,255,0.50)] text-ca-text-muted"
            }`}>
            <Send className="w-4 h-4" />
          </button>
          <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handlePhoto} />
        </div>
      </div>

      {/* Location picker */}
      {showLocations && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={() => setShowLocations(false)}>
          <div className="w-full max-w-md bg-[rgba(255,255,255,0.85)] backdrop-blur-[24px] rounded-t-[24px] p-5 pb-8 space-y-3 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-[14px] font-bold text-ca-text-primary">Envoyer une adresse</h3>
              <button onClick={() => setShowLocations(false)} className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.60)] backdrop-blur-[4px] flex items-center justify-center cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[12px] text-ca-text-muted">Choisissez parmi vos adresses enregistrées</p>
            <div className="space-y-2">
              {SAVED_LOCATIONS.map((loc, i) => (
                <button key={i} onClick={() => { onSendLocation(); setShowLocations(false); }}
                  className="w-full bg-[rgba(255,255,255,0.60)] backdrop-blur-[8px] rounded-[16px] p-4 border border-[rgba(255,255,255,0.35)] flex items-center gap-3 cursor-pointer active:scale-95 transition-transform text-left">
                  <div className="w-10 h-10 rounded-[12px] bg-[rgba(255,255,255,0.50)] flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-ca-text-primary" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-ca-text-primary">{loc.label}</p>
                    <p className="text-[11px] text-ca-text-muted">{loc.addr}</p>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => { onSendLocation(); setShowLocations(false); }}
              className="w-full h-11 bg-[rgba(45,106,79,0.85)] rounded-[14px] text-[13px] font-bold text-white flex items-center justify-center gap-2 cursor-pointer active:scale-95 backdrop-blur-[4px] border border-[rgba(82,183,136,0.30)]">
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
  if (status === "read") return <span className="text-[8px] text-ca-info font-bold leading-none">✓✓</span>;
  if (status === "delivered") return <span className="text-[8px] text-ca-text-muted font-bold leading-none">✓✓</span>;
  return <span className="text-[8px] text-ca-text-muted font-bold leading-none">✓</span>;
}

function TypingDots() {
  return (
    <span className="flex items-center gap-0.5">
      <span className="w-1 h-1 rounded-full bg-ca-green-primary animate-bounce" style={{ animationDelay: "0ms" }} />
      <span className="w-1 h-1 rounded-full bg-ca-green-primary animate-bounce" style={{ animationDelay: "150ms" }} />
      <span className="w-1 h-1 rounded-full bg-ca-green-primary animate-bounce" style={{ animationDelay: "300ms" }} />
    </span>
  );
}
