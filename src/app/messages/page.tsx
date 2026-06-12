"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Avatar } from "@/components/ui/avatar";

export default function MessagesPage() {
  const [search, setSearch] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchConversations = async () => {
      try {
        const res = await fetch("/api/messages?userId=demo-user-id");
        const data = await res.json();
        if (!cancelled) setConversations(data.conversations ?? []);
      } catch (err) {
        console.error("Failed to fetch conversations:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchConversations();
    return () => { cancelled = true; };
  }, []);

  const filtered = conversations.filter((c) => {
    const name = [c.partner?.profile?.firstName, c.partner?.profile?.lastName].filter(Boolean).join(" ");
    return name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <main className="min-h-screen pb-8 lg:pb-12">
      <div className="flex items-center justify-between py-4">
        <h1 className="text-lg lg:text-2xl font-bold text-text-primary">Messages</h1>
      </div>

      <div className="pb-4">
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Rechercher une conversation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-3xl flex items-center justify-center mb-4 text-2xl">
              💬
            </div>
            <h2 className="text-lg font-bold text-text-primary mb-1">Aucun message</h2>
            <p className="text-sm text-text-secondary max-w-xs">
              Contactez un pro pour démarrer une conversation
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {filtered.map((conv, i) => {
              const firstName = conv.partner?.profile?.firstName ?? "";
              const lastName = conv.partner?.profile?.lastName ?? "";
              const name = `${firstName} ${lastName}`.trim() || "Utilisateur";
              const avatarUrl = conv.partner?.profile?.avatarUrl;
              return (
                <motion.div
                  key={conv.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link
                    href="#"
                    className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 active:bg-gray-100 transition-colors"
                  >
                    <div className="relative">
                      <Avatar size="md" src={avatarUrl} alt={name} verified={false} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-sm text-text-primary truncate">{name}</h3>
                        <span className="text-2xs text-text-tertiary flex-shrink-0 ml-2">{conv.lastMessage?.createdAt ?? ""}</span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <p className="text-xs text-text-secondary truncate">{conv.lastMessage?.content ?? ""}</p>
                        {conv.unreadCount > 0 && (
                          <span className="w-5 h-5 bg-primary rounded-full text-white text-2xs font-bold flex items-center justify-center flex-shrink-0 ml-2">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
