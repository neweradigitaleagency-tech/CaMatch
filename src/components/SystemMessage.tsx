import { motion } from "motion/react";
import type { Message } from "../types";

interface SystemMessageProps {
  message: Message;
}

const EVENT_ICONS: Record<string, string> = {
  job_paid: "✔",
  job_accepted: "✔",
  job_on_site: "🚗",
  job_working: "🔧",
  job_completed: "✅",
  dispute_opened: "⚠️",
  support_joined: "👋",
  job_archived: "📦",
  payment_confirmed: "💳",
  call_started: "📞",
  user_joined: "👤",
};

export default function SystemMessage({ message }: SystemMessageProps) {
  const eventType = (message.metadata as any)?.event || "";
  const icon = EVENT_ICONS[eventType] || "🔔";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-center my-2"
    >
      <div className="flex items-center gap-2 px-4 py-2 bg-cm-elevated border border-cm-border rounded-[20px] shadow-sm">
        <span className="text-[14px]">{icon}</span>
        <span className="text-[12px] text-cm-text-muted">{message.text}</span>
        <span className="text-[10px] text-cm-text-soft ml-1">
          {new Date(message.createdAt).toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </motion.div>
  );
}
