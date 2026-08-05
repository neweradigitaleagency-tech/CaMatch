import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { MessageCircle, Send, ChevronDown } from "lucide-react"
import { useMarketplaceChatStore } from "../../stores/marketplaceChatStore"
import type { ChatMessage, MarketplaceOrder } from "../../types/marketplace"

interface OrderChatProps {
  order: MarketplaceOrder
}

const SUGGESTIONS = [
  "Bonjour, mon colis est-il bien parti ?",
  "Pouvez-vous suivre ma livraison ?",
  "Le produit est-il conforme à l'annonce ?",
  "Merci pour votre commande !",
]

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
}

export default function OrderChat({ order }: OrderChatProps) {
  const { sendMessage, getMessages } = useMarketplaceChatStore()
  const messages = getMessages(order.id)
  const [open, setOpen] = useState(false)
  const [text, setText] = useState("")
  const listRef = useRef<HTMLDivElement>(null)

  const seller = order.items[0]
  const sellerInitial = seller?.sellerName?.trim().charAt(0).toUpperCase() ?? "V"

  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages, open])

  const handleSend = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    sendMessage(order.id, "buyer", trimmed)
    setText("")
  }

  return (
    <div className="bg-cm-elevated rounded-xl border border-cm-border overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 p-4 cursor-pointer active:bg-cm-surface transition-colors"
      >
        <div className="w-9 h-9 rounded-full bg-cm-forest text-white flex items-center justify-center text-[13px] font-bold shrink-0">
          {sellerInitial}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-[12px] font-bold text-cm-text truncate">{seller?.sellerName ?? "Vendeur"}</p>
          <p className="text-[10px] text-cm-text-soft">Vendeur · répond généralement sous quelques heures</p>
        </div>
        <MessageCircle className="w-4 h-4 text-cm-forest shrink-0" />
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-cm-text-soft" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="border-t border-cm-border-soft"
          >
            <div
              ref={listRef}
              aria-live="polite"
              className="h-64 overflow-y-auto px-3 py-3 space-y-2 bg-cm-surface/50"
            >
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-4">
                  <MessageCircle className="w-7 h-7 text-cm-border-soft mb-2" />
                  <p className="text-[11px] text-cm-text-soft mb-3">
                    Discutez directement avec le vendeur au sujet de cette commande.
                  </p>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => setText(s)}
                        className="px-3 py-1.5 rounded-full bg-cm-elevated border border-cm-border-soft text-[10px] text-cm-forest cursor-pointer active:scale-95 transition-transform"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg: ChatMessage) => {
                  const mine = msg.sender === "buyer"
                  return (
                    <div key={msg.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[78%] px-3 py-2 rounded-2xl text-[12px] leading-snug ${
                          mine
                            ? "bg-cm-forest text-white rounded-br-sm"
                            : "bg-cm-elevated border border-cm-border-soft text-cm-text rounded-bl-sm"
                        }`}
                      >
                        <p>{msg.text}</p>
                        <p className={`text-[9px] mt-1 ${mine ? "text-white/60" : "text-cm-text-muted"}`}>
                          {formatTime(msg.at)}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            <div className="flex items-end gap-2 p-3">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="Votre message..."
                className="flex-1 h-10 px-4 rounded-xl bg-cm-surface border border-cm-border-soft text-[12px] text-cm-text outline-none focus:border-cm-forest transition-colors placeholder:text-cm-border-soft"
              />
              <button
                onClick={handleSend}
                disabled={!text.trim()}
                className="w-10 h-10 rounded-xl bg-cm-forest text-white flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-transform"
                aria-label="Envoyer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
