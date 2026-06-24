import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Send, Camera, ImagePlus, Mic, Square, X, MessageSquare, Search, Play, Video, Trash2, Pause } from "lucide-react";
import type { Conversation, Message, MediaAttachment } from "../types";
import { useChatStore } from "../stores/chatStore";

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
    <div className="flex flex-col w-full min-h-screen bg-cm-bg pb-32">
      <header className="flex items-center justify-center px-4 py-3 sticky top-0 z-10 bg-cm-elevated border-b border-cm-border">
        <h1 className="text-[15px] font-bold text-cm-text">Messages</h1>
      </header>

      {sorted.length > 0 && (
        <div className="px-4 pt-1 pb-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-cm-text-muted" />
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une conversation..."
              className="w-full h-11 pl-10 text-[13px] bg-cm-elevated border border-cm-border rounded-[12px] outline-none text-cm-text placeholder-cm-text-muted focus:border-cm-accent"
            />
          </div>
        </div>
      )}

      {sorted.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
          <div className="w-16 h-16 rounded-[20px] bg-cm-border-soft border border-cm-border flex items-center justify-center mb-4">
            <MessageSquare className="w-8 h-8 text-cm-text-muted" />
          </div>
          <h3 className="text-[15px] font-bold text-cm-text mb-1">Aucune conversation</h3>
          <p className="text-[13px] text-cm-text-muted">Quand une demande sera acceptée, la conversation démarrera automatiquement.</p>
        </div>
      ) : (
        <div className="px-4 space-y-1">
          {sorted.map((conv) => {
            const time = getRelativeTime(conv.lastMessageAt);
            return (
              <div
                key={conv.id}
                onClick={() => onOpenConversation(conv.id)}
                className="flex items-center gap-3 p-3 rounded-[16px] hover:bg-cm-accent-soft transition-colors cursor-pointer active:scale-[0.98]"
              >
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-cm-border-soft">
                    <img src={conv.otherUserAvatar} alt="" className="w-full h-full object-cover" />
                  </div>
                  {conv.unreadCount > 0 && (
                    <div className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-cm-accent text-[10px] font-bold flex items-center justify-center text-white border-2 border-cm-bg">
                      {conv.unreadCount}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-[14px] text-cm-text truncate">{conv.otherUserName}</h4>
                    <span className="text-[11px] text-cm-text-muted shrink-0 ml-2">{time}</span>
                  </div>
                  <p className={`text-[12px] truncate mt-0.5 ${conv.unreadCount > 0 ? "font-bold text-cm-text" : "text-cm-text-muted"}`}>
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

// ─── Chat Screen ───

interface ChatScreenProps {
  conversation: Conversation;
  messages: Message[];
  onBack: () => void;
  onSendMessage: (text: string) => void;
  onSendMedia: (file: File, type: "image" | "video" | "voice") => void;
  currentUserId: string;
}

export function ChatScreen({
  conversation, messages, onBack, onSendMessage, onSendMedia, currentUserId,
}: ChatScreenProps) {
  const [text, setText] = useState("");
  const [recording, setRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleSend = () => {
    if (!text.trim()) return;
    onSendMessage(text);
    setText("");
  };

  const handleFilePick = () => {
    fileRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    if (file.type.startsWith("video/")) {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        if (video.duration > 30) {
          alert("La vidéo ne doit pas dépasser 30 secondes.");
          return;
        }
        onSendMedia(file, "video");
      };
      video.src = URL.createObjectURL(file);
    } else {
      onSendMedia(file, "image");
    }
  };

  const handleVoiceRecord = async () => {
    if (recording) {
      mediaRecorderRef.current?.stop();
      setRecording(false);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      setRecordingDuration(0);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const file = new File([blob], `voice_${Date.now()}.webm`, { type: "audio/webm" });
        onSendMedia(file, "voice");
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start();
      setRecording(true);

      let sec = 0;
      recordingTimerRef.current = setInterval(() => {
        sec++;
        setRecordingDuration(sec);
        if (sec >= 60) {
          mediaRecorder.stop();
          setRecording(false);
          if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
          setRecordingDuration(0);
        }
      }, 1000);
    } catch {
      // Permission denied
    }
  };

  const handlePlayVoice = (url: string) => {
    if (playingVoice === url) {
      audioRef.current?.pause();
      setPlayingVoice(null);
      return;
    }
    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.onended = () => setPlayingVoice(null);
    audio.play();
    setPlayingVoice(url);
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-cm-bg pb-24">
      <header className="flex items-center justify-between px-4 py-3 bg-cm-elevated border-b border-cm-border sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack}
            className="w-11 h-11 flex items-center justify-center rounded-[12px] border border-cm-border bg-cm-elevated text-cm-text cursor-pointer active:scale-95">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-cm-border-soft">
            <img src={conversation.otherUserAvatar} alt="" className="w-full h-full object-cover" />
          </div>
          <div>
            <h3 className="text-[14px] font-bold text-cm-text">{conversation.otherUserName}</h3>
          </div>
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
                  <div key={i}
                    className="rounded-[16px] overflow-hidden border border-cm-border-soft max-w-[200px] cursor-pointer active:scale-95 transition-transform">
                    <img src={photo} alt="" className="w-full h-auto" />
                  </div>
                ))}

                {msg.media?.map((m, i) => (
                  <div key={i}>
                    {m.type === "voice" && (
                      <div
                        onClick={() => handlePlayVoice(m.url)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-[16px] cursor-pointer min-w-[160px] ${
                          isMe ? "bg-cm-text text-white" : "bg-cm-elevated border border-cm-border text-cm-text"
                        }`}
                      >
                        {playingVoice === m.url ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        <div className="flex-1 h-2 rounded-full bg-current opacity-20">
                          <div className={`h-full rounded-full bg-current opacity-60 transition-all ${playingVoice === m.url ? "w-3/4" : "w-0"}`} />
                        </div>
                        <span className="text-[11px] opacity-70">{m.duration ? `${m.duration}s` : "🎤"}</span>
                      </div>
                    )}
                    {m.type === "video" && (
                      <div className="rounded-[16px] overflow-hidden border border-cm-border-soft max-w-[240px] relative">
                        <video
                          src={m.url}
                          className="w-full h-auto max-h-[320px] object-cover"
                          controls
                          preload="metadata"
                        />
                      </div>
                    )}
                  </div>
                ))}

                {msg.text && !msg.media?.some((m) => m.type === "voice") && (
                  <div className={`px-3.5 py-2.5 rounded-[16px] text-[12px] leading-relaxed ${
                    isMe
                      ? "bg-cm-text text-white rounded-br-[4px]"
                      : "bg-cm-elevated border border-cm-border text-cm-text rounded-bl-[4px]"
                  }`}>
                    {msg.text}
                  </div>
                )}

                <div className={`flex items-center gap-1 px-1 ${isMe ? "flex-row" : "flex-row-reverse"}`}>
                  <p className="text-[11px] text-cm-text-muted">
                    {new Date(msg.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  {isMe && <ReadReceipt status={msg.status || "sent"} />}
                </div>
              </div>
            </motion.div>
          );
        })}

        <div ref={chatEndRef} />
      </div>

      <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto">
        <div className="bg-cm-elevated border border-cm-border rounded-[16px] shadow-cm-md px-3 py-2 flex items-center gap-2">
          <button onClick={() => setShowMediaPicker(!showMediaPicker)}
            className="w-10 h-10 rounded-[12px] border border-cm-border bg-cm-elevated flex items-center justify-center shrink-0 cursor-pointer hover:bg-cm-accent-soft">
            <ImagePlus className="w-4 h-4 text-cm-text" />
          </button>

          <button onClick={handleVoiceRecord}
            className={`w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 cursor-pointer transition-all border ${
              recording ? "bg-red-500 text-white border-red-500" : "border-cm-border bg-cm-elevated text-cm-text hover:bg-cm-accent-soft"
            }`}>
            {recording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {recording && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 rounded-[10px] border border-red-200">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[12px] font-mono text-red-600 tabular-nums">{recordingDuration}s</span>
            </div>
          )}

          <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Écrivez un message..." className="flex-1 h-9 text-[13px] bg-transparent outline-none px-2 text-cm-text placeholder-cm-text-muted" />
          <button onClick={handleSend} disabled={!text.trim()}
            className={`w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 transition-all cursor-pointer ${
              text.trim() ? "bg-cm-text text-white" : "border border-cm-border bg-cm-elevated text-cm-text-muted"
            }`}>
            <Send className="w-4 h-4" />
          </button>

          <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileChange} />
        </div>

        {showMediaPicker && (
          <div className="mt-2 bg-cm-elevated border border-cm-border rounded-[16px] p-3 shadow-cm-md">
            <div className="flex gap-3">
              <button onClick={() => { fileRef.current?.click(); setShowMediaPicker(false); }}
                className="flex-1 flex flex-col items-center gap-1.5 p-3 rounded-[12px] border border-cm-border bg-cm-bg cursor-pointer hover:bg-cm-accent-soft active:scale-95">
                <Camera className="w-6 h-6 text-cm-text" />
                <span className="text-[10px] text-cm-text-muted">Photo</span>
              </button>
              <button onClick={() => { videoRef.current?.click(); setShowMediaPicker(false); }}
                className="flex-1 flex flex-col items-center gap-1.5 p-3 rounded-[12px] border border-cm-border bg-cm-bg cursor-pointer hover:bg-cm-accent-soft active:scale-95">
                <Video className="w-6 h-6 text-cm-text" />
                <span className="text-[10px] text-cm-text-muted">Vidéo (30s max)</span>
              </button>
            </div>
          </div>
        )}

        <input ref={videoRef} type="file" accept="video/*" className="hidden"
          onChange={handleFileChange} />
      </div>
    </div>
  );
}

function ReadReceipt({ status }: { status: string }) {
  if (status === "read") return <span className="text-[8px] text-cm-accent font-bold leading-none">✓✓</span>;
  if (status === "delivered") return <span className="text-[8px] text-cm-text-muted font-bold leading-none">✓✓</span>;
  return <span className="text-[8px] text-cm-text-muted font-bold leading-none">✓</span>;
}
