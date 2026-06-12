"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Send, Phone, MessageCircle, CheckCheck } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-text-tertiary">Chargement...</div>
      </main>
    }>
      <ChatContent />
    </Suspense>
  );
}

function ChatContent() {
  const router = useRouter();
  const params = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const userId = "demo-user-id";
  const otherUserId = params?.id as string;

  useEffect(() => {
    fetch(`/api/messages/${otherUserId}?userId=${userId}&otherUserId=${otherUserId}`)
      .then((r) => r.json())
      .then((data) => {
        setMessages(data.messages || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [otherUserId, userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    const content = newMessage.trim();
    setNewMessage("");

    const res = await fetch(`/api/messages/${otherUserId}?userId=${userId}&otherUserId=${otherUserId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senderId: userId, receiverId: otherUserId, content }),
    });

    const data = await res.json();
    if (data.message) {
      setMessages((prev) => [...prev, data.message]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto flex items-center gap-3 h-14 px-4">
          <button onClick={() => router.back()} className="btn-ghost p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Avatar size="sm" alt="Client" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-text-primary truncate">Client</p>
            <p className="text-2xs text-text-secondary">En ligne</p>
          </div>
          <button className="btn-ghost p-2">
            <Phone className="w-5 h-5 text-primary" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
                <div className={`h-10 w-48 bg-gray-200 rounded-2xl animate-pulse ${i % 2 === 0 ? "rounded-br-md" : "rounded-bl-md"}`} />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-primary" />
            </div>
            <p className="text-sm font-medium text-text-primary">Démarrez la conversation</p>
            <p className="text-xs text-text-secondary mt-1">Envoyez un message pour commencer</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === userId;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                    isMe
                      ? "bg-primary text-white rounded-br-md"
                      : "bg-white border border-gray-100 text-text-primary rounded-bl-md shadow-soft"
                  }`}
                >
                  <p>{msg.content}</p>
                  <div className={`flex items-center gap-1 mt-1 ${isMe ? "justify-end" : "justify-start"}`}>
                    <span className={`text-2xs ${isMe ? "text-white/70" : "text-text-tertiary"}`}>
                      {formatTime(msg.createdAt)}
                    </span>
                    {isMe && (
                      <CheckCheck className={`w-3 h-3 ${msg.read ? "text-blue-300" : "text-white/50"}`} />
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <input
            type="text"
            placeholder="Votre message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="w-11 h-11 bg-primary rounded-2xl flex items-center justify-center text-white disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-transform shadow-soft"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </main>
  );
}
